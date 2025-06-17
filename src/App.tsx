import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Components
import { LandingPage } from './components/LandingPage';
import { AnimatedCompanion } from './components/AnimatedCompanion';
import { ChatInterface } from './components/ChatInterface';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { VoiceConversationMode } from './components/VoiceConversationMode';
import { CreditsDisplay } from './components/CreditsDisplay';

// Services
import { authService } from './services/authService';
import { geminiService } from './services/geminiService';
import { elevenlabsService } from './services/elevenlabsService';
import { memoryService } from './services/memoryService';
import { conversationService } from './services/conversationService';
import { creditsService } from './services/creditsService';

// Types
import { Message, User, AuthState } from './types';
import { colors, textColors } from './styles/colors';

function App() {
  // Auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // App state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [companionMood, setCompanionMood] = useState<'listening' | 'speaking' | 'thinking' | 'caring'>('listening');
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [connectionError, setConnectionError] = useState<string>('');
  const [isVoiceConversationMode, setIsVoiceConversationMode] = useState(false);

  // Check if conversation has started (has messages)
  const hasConversationStarted = messages.length > 0;

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  // Initialize conversation when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && messages.length === 0) {
      initializeConversation();
    }
  }, [authState.isAuthenticated, authState.user]);

  // Save conversation to Supabase when messages change
  useEffect(() => {
    if (authState.user && messages.length > 0) {
      saveConversation();
    }
  }, [messages, authState.user]);

  // Auto-play AI responses in voice conversation mode
  useEffect(() => {
    if (isVoiceConversationMode && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'therapist' && !isVoicePlaying) {
        handlePlayVoice(lastMessage.content);
      }
    }
  }, [messages, isVoiceConversationMode]);

  const initializeApp = async () => {
    try {
      setConnectionStatus('connecting');
      setConnectionError('');
      
      // Check environment variables first
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
      }

      await authService.initialize();
      setConnectionStatus('connected');
      
      const user = authService.getCurrentUser();
      
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        setShowLanding(false); // Skip landing if user is already logged in
        console.log('✅ User session restored:', user.name);
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        // Show landing page for new users
      }
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : 'Failed to connect to Supabase');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const initializeConversation = async () => {
    if (!authState.user) return;

    // Get user's memory context for personalized greeting
    const userMemories = await memoryService.getImportantMemories(authState.user.id, 3);
    const hasMemories = userMemories.length > 0;

    let greeting = '';
    if (hasMemories) {
      // Personalized greeting based on memories
      const recentTopics = userMemories.map(m => m.tags).flat().slice(0, 2);
      if (recentTopics.length > 0) {
        greeting = `Hey ${authState.user.name}! Good to see you again. How are things going?`;
      } else {
        greeting = `Welcome back, ${authState.user.name}! How's your day been?`;
      }
    } else {
      // First time or no significant memories
      const greetings = [
        `Hey ${authState.user.name}! How's your day treating you? 😊`,
        `Hi ${authState.user.name}! What's been on your mind lately?`,
        `Good to see you, ${authState.user.name}. How are you feeling today? 🌸`
      ];
      greeting = greetings[Math.floor(Math.random() * greetings.length)];
    }

    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      content: greeting,
      sender: 'therapist',
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
    
    // Auto-play welcome message if full voice mode is enabled
    if (authState.user.preferences.fullVoiceMode) {
      // Small delay to ensure voice mode is properly set up
      setTimeout(() => {
        handlePlayVoice(welcomeMessage.content);
      }, 500);
    }
  };

  const saveConversation = async () => {
    if (!authState.user) return;
    
    try {
      await conversationService.saveConversation(authState.user.id, sessionId, messages);
    } catch (error) {
      console.error('❌ Error saving conversation:', error);
    }
  };

  const refreshUserCredits = async () => {
    if (!authState.user) return;
    
    await authService.refreshUserCredits();
    const updatedUser = authService.getCurrentUser();
    if (updatedUser) {
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isTyping || !authState.user) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setCompanionMood('thinking');

    try {
      // Text messages are free for now, so no credit check needed
      
      // Calculate importance and save to long-term memory
      const importance = memoryService.calculateImportance(userMessage);
      await memoryService.saveMemory(authState.user.id, userMessage.content, importance);

      // Get comprehensive memory context (both long-term and short-term)
      const memoryContext = await memoryService.getComprehensiveContext(authState.user.id, messageText);

      // Generate AI response with enhanced context
      const response = await geminiService.generateTherapyResponse({
        userMessage: messageText,
        conversationHistory: messages.slice(-5), // Short-term: last 5 messages
        user: authState.user,
        relevantMemories: memoryContext // Long-term: relevant memories from database
      });

      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        content: response,
        sender: 'therapist',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setCompanionMood('caring');

      // Save AI response to memory with contextual importance
      const aiImportance = response.length > 100 ? 0.6 : 0.4; // Longer responses are more important
      await memoryService.saveMemory(authState.user.id, `Serenity: ${response}`, aiImportance);

      // Refresh credits after message
      await refreshUserCredits();

    } catch (error) {
      console.error('❌ Error generating response:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        content: "I'm having trouble responding right now. Let's try again in a moment. 😊",
        sender: 'therapist',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setCompanionMood('listening');
    }
  };

  const handlePlayVoice = async (text: string) => {
    if (!authState.user?.preferences.voiceEnabled || !authState.user) return;

    // Check if user has enough credits for voice
    const canUseVoice = creditsService.canUseVoice(authState.user.credits, authState.user.unlimitedCredits);
    
    if (!canUseVoice) {
      // Show credits exhausted message
      const creditsMessage: Message = {
        id: `msg_${Date.now()}_credits`,
        content: "You've used up your voice credits, but we're giving you unlimited text conversations for a limited time! Voice features will be available in the Pro plan coming soon. 🎉",
        sender: 'therapist',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, creditsMessage]);
      return;
    }

    try {
      setIsVoicePlaying(true);
      setCompanionMood('speaking');
      
      const audioUrl = await elevenlabsService.textToSpeech(text, authState.user.id);
      if (audioUrl) {
        await elevenlabsService.playAudio(audioUrl);
      }
      
      // Refresh credits after voice usage
      await refreshUserCredits();
    } catch (error) {
      console.error('❌ Voice playback error:', error);
      
      if (error instanceof Error && error.message === 'INSUFFICIENT_CREDITS') {
        const creditsMessage: Message = {
          id: `msg_${Date.now()}_credits`,
          content: "You've used up your voice credits, but we're giving you unlimited text conversations for a limited time! Voice features will be available in the Pro plan coming soon. 🎉",
          sender: 'therapist',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, creditsMessage]);
      }
    } finally {
      setIsVoicePlaying(false);
      setCompanionMood('listening');
    }
  };

  const handleStopVoice = () => {
    elevenlabsService.stopAudio();
    setIsVoicePlaying(false);
    setCompanionMood('listening');
  };

  const handleGetStarted = () => {
    setShowLanding(false);
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      setShowAuth(false);
      setShowLanding(false);
      console.log('✅ Authentication successful for:', user.name);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    setMessages([]);
    setShowSettings(false);
    setShowLanding(true); // Show landing page after logout
    setIsVoiceConversationMode(false);
  };

  const handleUpdatePreferences = async (updates: any) => {
    if (!authState.user) return;
    
    try {
      await authService.updateUserPreferences(updates);
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? {
          ...prev.user,
          preferences: { ...prev.user.preferences, ...updates }
        } : null
      }));
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
    }
  };

  const handleToggleVoiceMode = () => {
    setIsVoiceConversationMode(!isVoiceConversationMode);
    if (isVoicePlaying) {
      handleStopVoice();
    }
  };

  // Show landing page for new users
  if (showLanding && !authState.isAuthenticated) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Loading state
  if (authState.isLoading || connectionStatus === 'connecting') {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.sage[50]}, ${colors.lavender[50]})`
        }}
      >
        <motion.div
          className="text-center max-w-md mx-auto p-8 rounded-3xl shadow-2xl"
          style={{ backgroundColor: colors.neutral[50] }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedCompanion mood="thinking" />
          <motion.p 
            className="mt-6 text-lg font-medium"
            style={{ color: textColors.primary }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {connectionStatus === 'connecting' ? 'Connecting to Supabase...' : 'Loading Serenity...'}
          </motion.p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <motion.div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: connectionStatus === 'connected' ? colors.sage[400] : colors.primary[400] }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <p className="text-sm" style={{ color: textColors.muted }}>
              {connectionStatus === 'connected' ? 'Supabase Connected' : 
               connectionStatus === 'error' ? 'Connection Failed' : 'Connecting...'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Connection error state
  if (connectionStatus === 'error') {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ 
          background: `linear-gradient(135deg, ${colors.status.error}, ${colors.accent.peach})`
        }}
      >
        <motion.div
          className="text-center max-w-lg mx-auto p-8 rounded-3xl shadow-2xl"
          style={{ backgroundColor: colors.neutral[50] }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: colors.status.error }}
          >
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: textColors.primary }}>
            Supabase Connection Required
          </h2>
          <p className="mb-6" style={{ color: textColors.secondary }}>
            {connectionError}
          </p>
          <div 
            className="rounded-2xl p-6 text-left text-sm mb-6"
            style={{ backgroundColor: colors.neutral[100] }}
          >
            <p className="font-medium mb-3" style={{ color: textColors.primary }}>
              To use Serenity, please:
            </p>
            <ol className="list-decimal list-inside space-y-2" style={{ color: textColors.secondary }}>
              <li>Create a .env file in your project root</li>
              <li>Add your Supabase URL and anon key</li>
              <li>Run the database migrations</li>
              <li>Restart the application</li>
            </ol>
          </div>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-2xl font-medium transition-all duration-300"
            style={{ 
              backgroundColor: colors.sage[200],
              color: colors.sage[700]
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: colors.sage[300]
            }}
            whileTap={{ scale: 0.95 }}
          >
            Retry Connection
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Not authenticated - show auth modal
  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div 
        className="min-h-screen"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.sage[50]}, ${colors.lavender[50]})`
        }}
      >
        <AuthModal
          isOpen={showAuth}
          onClose={() => {
            setShowAuth(false);
            setShowLanding(true);
          }}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.sage[50]}, ${colors.lavender[50]})`
      }}
    >
      {/* Top Section - 15% of screen height */}
      <motion.div 
        className="h-[15vh] flex-shrink-0 p-2 sm:p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div 
          className="h-full rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden relative"
          style={{ backgroundColor: colors.neutral[50] }}
        >
          {/* Background gradient */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary[100]}, ${colors.sage[100]}, ${colors.lavender[100]})`
            }}
          />
          
          <div className="relative z-10 h-full flex items-center justify-center px-4">
            {/* Compact header with Serenity info and controls */}
            <div className="flex items-center gap-4 w-full max-w-4xl">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.sage[200]}, ${colors.sage[400]})`
                }}
              >
                <span className="text-white text-lg sm:text-xl">🌸</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold truncate" style={{ color: textColors.primary }}>
                  Serenity
                </h2>
                <p className="text-xs sm:text-sm truncate" style={{ color: textColors.muted }}>
                  Your AI Therapy Companion
                </p>
              </div>

              {/* Credits Display */}
              <CreditsDisplay 
                credits={authState.user.credits}
                unlimitedCredits={authState.user.unlimitedCredits}
                onRefresh={refreshUserCredits}
              />
              
              {/* Voice Mode Toggle */}
              <motion.button
                onClick={handleToggleVoiceMode}
                className="p-2 sm:p-3 rounded-xl transition-all duration-300 flex-shrink-0"
                style={{ 
                  backgroundColor: isVoiceConversationMode ? colors.sage[200] : colors.primary[100],
                  color: isVoiceConversationMode ? colors.sage[700] : colors.primary[600]
                }}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: isVoiceConversationMode ? colors.sage[300] : colors.primary[200]
                }}
                whileTap={{ scale: 0.95 }}
                title={isVoiceConversationMode ? "Switch to Text Mode" : "Switch to Voice Mode"}
              >
                {isVoiceConversationMode ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </motion.button>

              <motion.button
                onClick={() => setShowSettings(true)}
                className="p-2 sm:p-3 rounded-xl transition-all duration-300 flex-shrink-0"
                style={{ 
                  backgroundColor: colors.lavender[100],
                  color: textColors.secondary
                }}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: colors.lavender[200]
                }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Section - 85% of screen height */}
      <motion.div 
        className="h-[85vh] flex-shrink-0 p-2 sm:p-4 pt-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          isVoicePlaying={isVoicePlaying}
          onStopVoice={handleStopVoice}
          onPlayVoice={handlePlayVoice}
          onShowSettings={() => setShowSettings(true)}
          user={authState.user}
        />
      </motion.div>

      {/* Voice Conversation Mode */}
      <VoiceConversationMode
        isActive={isVoiceConversationMode}
        onToggle={handleToggleVoiceMode}
        onSendMessage={handleSendMessage}
        isVoicePlaying={isVoicePlaying}
        onStopVoice={handleStopVoice}
        user={authState.user}
        isTyping={isTyping}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        user={authState.user}
        onClose={() => setShowSettings(false)}
        onUpdatePreferences={handleUpdatePreferences}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;