import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Volume2, Bot, LogOut, Check, Settings, Trash2, Edit3, Save, Plus, Minus, Coins, Infinity } from 'lucide-react';
import { User as UserType, UserPreferences, UserMemory } from '../types';
import { memoryService } from '../services/memoryService';
import { creditsService } from '../services/creditsService';
import { colors, textColors } from '../styles/colors';

interface SettingsModalProps {
  isOpen: boolean;
  user: UserType;
  onClose: () => void;
  onUpdatePreferences: (preferences: Partial<UserPreferences>) => void;
  onLogout: () => void;
}

export function SettingsModal({ isOpen, user, onClose, onUpdatePreferences, onLogout }: SettingsModalProps) {
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({});
  const [userBio, setUserBio] = useState(user.preferences.userBio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'voice' | 'bot' | 'memories' | 'credits'>('profile');

  // Load memories when memories tab is opened
  useEffect(() => {
    if (activeTab === 'memories' && isOpen) {
      loadAllMemories();
    }
  }, [activeTab, isOpen]);

  const loadAllMemories = async () => {
    setLoadingMemories(true);
    try {
      console.log('🔍 Loading memories for settings...');
      // Use the new method that shows ALL memories, not just important ones
      const allMemories = await memoryService.getAllMemoriesForSettings(user.id);
      console.log('📊 Loaded memories:', allMemories.length);
      setMemories(allMemories);
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoadingMemories(false);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await memoryService.deleteMemory(memoryId);
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      showSavedAnimation('memory-deleted');
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  const handleSaveBio = () => {
    onUpdatePreferences({ userBio: userBio.trim() });
    setIsEditingBio(false);
    showSavedAnimation('userBio');
  };

  const handleToggle = (key: keyof UserPreferences) => {
    onUpdatePreferences({ [key]: !user.preferences[key] });
    showSavedAnimation(key);
  };

  const handleSliderChange = (key: keyof UserPreferences, value: number) => {
    onUpdatePreferences({ [key]: value });
    showSavedAnimation(key);
  };

  const handleArrayChange = (key: keyof UserPreferences, value: any) => {
    onUpdatePreferences({ [key]: value });
    showSavedAnimation(key);
  };

  const showSavedAnimation = (key: string) => {
    setSavedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSavedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    disabled = false 
  }: { 
    checked: boolean; 
    onChange: () => void; 
    disabled?: boolean; 
  }) => (
    <motion.button
      onClick={onChange}
      disabled={disabled}
      className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200"
      style={{ 
        backgroundColor: checked ? colors.sage[300] : colors.neutral[300]
      }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ 
        backgroundColor: disabled 
          ? (checked ? colors.sage[300] : colors.neutral[300])
          : (checked ? colors.sage[400] : colors.neutral[400])
      }}
    >
      <motion.span
        className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg"
        animate={{ x: checked ? 28 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );

  const SavedIndicator = ({ isVisible }: { isVisible: boolean }) => (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="flex items-center gap-2 text-sm"
          style={{ color: colors.sage[600] }}
          initial={{ opacity: 0, scale: 0.8, x: 10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          <Check size={16} />
          <span>Saved</span>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const TabButton = ({ 
    id, 
    label, 
    icon: Icon 
  }: { 
    id: 'profile' | 'voice' | 'bot' | 'memories' | 'credits'; 
    label: string; 
    icon: any; 
  }) => (
    <motion.button
      onClick={() => setActiveTab(id)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
      style={{
        backgroundColor: activeTab === id ? colors.sage[200] : colors.neutral[100],
        color: activeTab === id ? colors.sage[700] : textColors.secondary
      }}
      whileHover={{
        backgroundColor: activeTab === id ? colors.sage[300] : colors.neutral[200]
      }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon size={16} />
      <span>{label}</span>
    </motion.button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed right-0 top-0 h-full w-96 z-50 overflow-y-auto shadow-2xl"
            style={{ backgroundColor: colors.neutral[50] }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: colors.lavender[100] }}
                  >
                    <Settings size={20} style={{ color: colors.lavender[600] }} />
                  </div>
                  <h2 className="text-xl font-semibold" style={{ color: textColors.primary }}>
                    Settings
                  </h2>
                </div>
                
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-xl transition-colors duration-200"
                  style={{ 
                    backgroundColor: colors.neutral[100],
                    color: textColors.secondary
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: colors.neutral[200]
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 mb-6">
                <TabButton id="profile" label="Profile" icon={User} />
                <TabButton id="credits" label="Credits" icon={Coins} />
                <TabButton id="voice" label="Voice" icon={Volume2} />
                <TabButton id="bot" label="Bot Style" icon={Bot} />
                <TabButton id="memories" label="Memories" icon={Edit3} />
              </div>

              <div className="space-y-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Basic Info */}
                    <motion.div 
                      className="p-6 rounded-2xl border"
                      style={{ 
                        backgroundColor: colors.primary[50],
                        borderColor: colors.primary[200]
                      }}
                      whileHover={{ 
                        borderColor: colors.primary[300],
                        boxShadow: `0 4px 12px ${colors.primary[100]}`
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium" style={{ color: textColors.secondary }}>
                            Name
                          </p>
                          <p className="font-medium" style={{ color: textColors.primary }}>
                            {user.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: textColors.secondary }}>
                            Email
                          </p>
                          <p className="font-medium" style={{ color: textColors.primary }}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* User Bio */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium" style={{ color: textColors.primary }}>
                          About You
                        </h3>
                        <SavedIndicator isVisible={savedStates.userBio} />
                      </div>
                      
                      <motion.div 
                        className="p-4 rounded-xl border"
                        style={{ 
                          backgroundColor: colors.sage[50],
                          borderColor: colors.sage[200]
                        }}
                        whileHover={{ 
                          backgroundColor: colors.sage[100],
                          borderColor: colors.sage[300]
                        }}
                      >
                        <p className="text-sm mb-3" style={{ color: textColors.muted }}>
                          Tell Serenity about yourself - your interests, preferences, background, or anything that helps provide better support. This information is used thoughtfully and only when relevant.
                        </p>
                        
                        {isEditingBio ? (
                          <div className="space-y-3">
                            <textarea
                              value={userBio}
                              onChange={(e) => setUserBio(e.target.value)}
                              placeholder="Share something about yourself - your hobbies, work, family, goals, challenges, or anything you'd like Serenity to know..."
                              className="w-full p-3 border-2 rounded-xl resize-none focus:outline-none transition-all duration-300"
                              style={{ 
                                backgroundColor: colors.neutral[50],
                                borderColor: colors.sage[300],
                                color: textColors.primary,
                                minHeight: '120px'
                              }}
                              maxLength={500}
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-xs" style={{ color: textColors.muted }}>
                                {userBio.length}/500 characters
                              </span>
                              <div className="flex gap-2">
                                <motion.button
                                  onClick={() => {
                                    setUserBio(user.preferences.userBio || '');
                                    setIsEditingBio(false);
                                  }}
                                  className="px-3 py-1 rounded-lg text-sm transition-colors duration-200"
                                  style={{ 
                                    backgroundColor: colors.neutral[200],
                                    color: textColors.secondary
                                  }}
                                  whileHover={{ backgroundColor: colors.neutral[300] }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Cancel
                                </motion.button>
                                <motion.button
                                  onClick={handleSaveBio}
                                  className="px-3 py-1 rounded-lg text-sm transition-colors duration-200 flex items-center gap-1"
                                  style={{ 
                                    backgroundColor: colors.sage[200],
                                    color: colors.sage[700]
                                  }}
                                  whileHover={{ backgroundColor: colors.sage[300] }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Save size={12} />
                                  Save
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div 
                              className="min-h-[80px] p-3 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200"
                              style={{ 
                                backgroundColor: userBio ? colors.neutral[50] : colors.neutral[100],
                                borderColor: colors.neutral[300],
                                color: userBio ? textColors.primary : textColors.muted
                              }}
                              onClick={() => setIsEditingBio(true)}
                            >
                              {userBio || "Click to add information about yourself..."}
                            </div>
                            <motion.button
                              onClick={() => setIsEditingBio(true)}
                              className="flex items-center gap-2 text-sm transition-colors duration-200"
                              style={{ color: colors.sage[600] }}
                              whileHover={{ color: colors.sage[700] }}
                            >
                              <Edit3 size={14} />
                              {userBio ? 'Edit' : 'Add'} your information
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Credits Tab */}
                {activeTab === 'credits' && (
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Credits Overview */}
                    <motion.div 
                      className="p-6 rounded-2xl border text-center"
                      style={{ 
                        backgroundColor: user.unlimitedCredits ? colors.sage[50] : colors.primary[50],
                        borderColor: user.unlimitedCredits ? colors.sage[200] : colors.primary[200]
                      }}
                      whileHover={{ 
                        borderColor: user.unlimitedCredits ? colors.sage[300] : colors.primary[300],
                        boxShadow: `0 4px 12px ${user.unlimitedCredits ? colors.sage[100] : colors.primary[100]}`
                      }}
                    >
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: user.unlimitedCredits ? colors.sage[200] : colors.primary[200] }}
                      >
                        {user.unlimitedCredits ? (
                          <Infinity size={32} style={{ color: colors.sage[700] }} />
                        ) : (
                          <Coins size={32} style={{ color: colors.primary[700] }} />
                        )}
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-2" style={{ color: textColors.primary }}>
                        {user.unlimitedCredits ? 'Unlimited Credits' : `${user.credits} Credits`}
                      </h3>
                      
                      <p className="text-sm mb-4" style={{ color: textColors.secondary }}>
                        {user.unlimitedCredits 
                          ? 'You have unlimited access to all features!'
                          : creditsService.getCreditsStatusMessage(user.credits, user.unlimitedCredits)
                        }
                      </p>

                      {!user.unlimitedCredits && (
                        <div className="text-xs space-y-1" style={{ color: textColors.muted }}>
                          <p>Used today: {user.creditsUsedToday} credits</p>
                          <p>Credits reset daily at midnight</p>
                        </div>
                      )}
                    </motion.div>

                    {/* Credit Costs */}
                    <div className="space-y-4">
                      <h3 className="font-medium" style={{ color: textColors.primary }}>
                        Credit Costs
                      </h3>
                      
                      <div className="space-y-3">
                        <motion.div 
                          className="flex items-center justify-between p-4 rounded-xl border"
                          style={{ 
                            backgroundColor: colors.sage[50],
                            borderColor: colors.sage[200]
                          }}
                          whileHover={{ 
                            backgroundColor: colors.sage[100],
                            borderColor: colors.sage[300]
                          }}
                        >
                          <div>
                            <span className="text-sm font-medium" style={{ color: textColors.primary }}>
                              Text Messages
                            </span>
                            <p className="text-xs" style={{ color: textColors.muted }}>
                              Chat conversations
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold" style={{ color: colors.sage[600] }}>
                              FREE
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full" style={{ 
                              backgroundColor: colors.sage[200],
                              color: colors.sage[700]
                            }}>
                              Limited Time
                            </span>
                          </div>
                        </motion.div>

                        <motion.div 
                          className="flex items-center justify-between p-4 rounded-xl border"
                          style={{ 
                            backgroundColor: colors.lavender[50],
                            borderColor: colors.lavender[200]
                          }}
                          whileHover={{ 
                            backgroundColor: colors.lavender[100],
                            borderColor: colors.lavender[300]
                          }}
                        >
                          <div>
                            <span className="text-sm font-medium" style={{ color: textColors.primary }}>
                              Voice Responses
                            </span>
                            <p className="text-xs" style={{ color: textColors.muted }}>
                              AI speaks your responses
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Coins size={16} style={{ color: colors.lavender[600] }} />
                            <span className="text-lg font-bold" style={{ color: colors.lavender[600] }}>
                              10
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Upgrade Notice */}
                    {!user.unlimitedCredits && (
                      <motion.div 
                        className="p-6 rounded-2xl border"
                        style={{ 
                          backgroundColor: colors.primary[50],
                          borderColor: colors.primary[200]
                        }}
                        whileHover={{ 
                          backgroundColor: colors.primary[100],
                          borderColor: colors.primary[300]
                        }}
                      >
                        <h3 className="font-medium mb-3" style={{ color: textColors.primary }}>
                          Want Unlimited Access?
                        </h3>
                        <p className="text-sm mb-4" style={{ color: textColors.secondary }}>
                          Upgrade to Pro for unlimited conversations, voice responses, and advanced features.
                        </p>
                        <motion.button
                          className="w-full py-3 rounded-xl font-medium transition-all duration-300"
                          style={{ 
                            backgroundColor: colors.primary[200],
                            color: colors.primary[700]
                          }}
                          whileHover={{ backgroundColor: colors.primary[300] }}
                          whileTap={{ scale: 0.98 }}
                          disabled
                        >
                          Pro Plan Coming Soon - $5/month
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Voice Settings Tab */}
                {activeTab === 'voice' && (
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Enable Voice */}
                    <motion.div 
                      className="flex items-center justify-between p-4 rounded-xl border"
                      style={{ 
                        backgroundColor: colors.sage[50],
                        borderColor: colors.sage[200]
                      }}
                      whileHover={{ 
                        backgroundColor: colors.sage[100],
                        borderColor: colors.sage[300]
                      }}
                    >
                      <div className="flex-1">
                        <span className="text-sm font-medium" style={{ color: textColors.primary }}>
                          Enable Voice
                        </span>
                        <p className="text-xs mt-1" style={{ color: textColors.muted }}>
                          Allow Serenity to speak responses
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <SavedIndicator isVisible={savedStates.voiceEnabled} />
                        <ToggleSwitch
                          checked={user.preferences.voiceEnabled}
                          onChange={() => handleToggle('voiceEnabled')}
                        />
                      </div>
                    </motion.div>

                    {/* Voice Speed */}
                    {user.preferences.voiceEnabled && (
                      <motion.div 
                        className="p-4 rounded-xl border"
                        style={{ 
                          backgroundColor: colors.sage[50],
                          borderColor: colors.sage[200]
                        }}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        whileHover={{ 
                          backgroundColor: colors.sage[100],
                          borderColor: colors.sage[300]
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium" style={{ color: textColors.primary }}>
                            Voice Speed ({Math.round(user.preferences.voiceSpeed * 100)}%)
                          </label>
                          <SavedIndicator isVisible={savedStates.voiceSpeed} />
                        </div>
                        
                        <div className="space-y-3">
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={user.preferences.voiceSpeed}
                            onChange={(e) => handleSliderChange('voiceSpeed', parseFloat(e.target.value))}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                            style={{ 
                              background: `linear-gradient(to right, ${colors.sage[300]} 0%, ${colors.sage[300]} ${(user.preferences.voiceSpeed - 0.5) / 1.5 * 100}%, ${colors.neutral[200]} ${(user.preferences.voiceSpeed - 0.5) / 1.5 * 100}%, ${colors.neutral[200]} 100%)`
                            }}
                          />
                          <div className="flex justify-between text-xs" style={{ color: textColors.muted }}>
                            <span>Slow</span>
                            <span>Normal</span>
                            <span>Fast</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Voice Credits Warning */}
                    {user.preferences.voiceEnabled && !user.unlimitedCredits && (
                      <motion.div 
                        className="p-4 rounded-xl border"
                        style={{ 
                          backgroundColor: colors.accent.cream,
                          borderColor: colors.accent.peach
                        }}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center gap-3">
                          <Coins size={16} style={{ color: colors.accent.peach }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: textColors.primary }}>
                              Voice uses credits
                            </p>
                            <p className="text-xs" style={{ color: textColors.muted }}>
                              Each voice response costs 10 credits. You have {user.credits} credits remaining.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Bot Style Tab */}
                {activeTab === 'bot' && (
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Empathy Level */}
                    <motion.div 
                      className="p-4 rounded-xl border"
                      style={{ 
                        backgroundColor: colors.lavender[50],
                        borderColor: colors.lavender[200]
                      }}
                      whileHover={{ 
                        backgroundColor: colors.lavender[100],
                        borderColor: colors.lavender[300]
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium" style={{ color: textColors.primary }}>
                          Empathy Level ({Math.round(user.preferences.empathyLevel * 100)}%)
                        </label>
                        <SavedIndicator isVisible={savedStates.empathyLevel} />
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="0.2"
                          max="1"
                          step="0.1"
                          value={user.preferences.empathyLevel}
                          onChange={(e) => handleSliderChange('empathyLevel', parseFloat(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                          style={{ 
                            background: `linear-gradient(to right, ${colors.lavender[300]} 0%, ${colors.lavender[300]} ${(user.preferences.empathyLevel - 0.2) / 0.8 * 100}%, ${colors.neutral[200]} ${(user.preferences.empathyLevel - 0.2) / 0.8 * 100}%, ${colors.neutral[200]} 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs" style={{ color: textColors.muted }}>
                          <span>Direct</span>
                          <span>Balanced</span>
                          <span>Very Caring</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Response Length */}
                    <motion.div 
                      className="p-4 rounded-xl border"
                      style={{ 
                        backgroundColor: colors.lavender[50],
                        borderColor: colors.lavender[200]
                      }}
                      whileHover={{ 
                        backgroundColor: colors.lavender[100],
                        borderColor: colors.lavender[300]
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium" style={{ color: textColors.primary }}>
                          Response Length
                        </label>
                        <SavedIndicator isVisible={savedStates.responseLength} />
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="range"
                          min="0.3"
                          max="1"
                          step="0.1"
                          value={user.preferences.responseLength || 0.6}
                          onChange={(e) => handleSliderChange('responseLength', parseFloat(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                          style={{ 
                            background: `linear-gradient(to right, ${colors.lavender[300]} 0%, ${colors.lavender[300]} ${((user.preferences.responseLength || 0.6) - 0.3) / 0.7 * 100}%, ${colors.neutral[200]} ${((user.preferences.responseLength || 0.6) - 0.3) / 0.7 * 100}%, ${colors.neutral[200]} 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs" style={{ color: textColors.muted }}>
                          <span>Brief</span>
                          <span>Balanced</span>
                          <span>Detailed</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Conversation Style */}
                    <motion.div 
                      className="p-4 rounded-xl border"
                      style={{ 
                        backgroundColor: colors.lavender[50],
                        borderColor: colors.lavender[200]
                      }}
                      whileHover={{ 
                        backgroundColor: colors.lavender[100],
                        borderColor: colors.lavender[300]
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium" style={{ color: textColors.primary }}>
                          Conversation Style
                        </label>
                        <SavedIndicator isVisible={savedStates.conversationStyle} />
                      </div>
                      
                      <div className="space-y-3">
                        {['Casual Friend', 'Professional Therapist', 'Caring Mentor', 'Supportive Coach'].map((style) => (
                          <motion.label 
                            key={style} 
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200"
                            style={{ 
                              backgroundColor: (user.preferences.conversationStyle || 'Casual Friend') === style
                                ? colors.lavender[200]
                                : colors.neutral[100],
                              borderColor: (user.preferences.conversationStyle || 'Casual Friend') === style
                                ? colors.lavender[300]
                                : colors.neutral[200]
                            }}
                            whileHover={{ 
                              scale: 1.02,
                              backgroundColor: (user.preferences.conversationStyle || 'Casual Friend') === style
                                ? colors.lavender[300]
                                : colors.neutral[200]
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <input
                              type="radio"
                              name="conversationStyle"
                              checked={(user.preferences.conversationStyle || 'Casual Friend') === style}
                              onChange={() => handleArrayChange('conversationStyle', style)}
                              className="sr-only"
                            />
                            <div 
                              className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                              style={{ 
                                borderColor: (user.preferences.conversationStyle || 'Casual Friend') === style
                                  ? colors.lavender[500]
                                  : colors.neutral[400],
                                backgroundColor: (user.preferences.conversationStyle || 'Casual Friend') === style
                                  ? colors.lavender[500]
                                  : 'transparent'
                              }}
                            >
                              {(user.preferences.conversationStyle || 'Casual Friend') === style && (
                                <motion.div
                                  className="w-2 h-2 rounded-full bg-white"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                />
                              )}
                            </div>
                            <span className="text-sm" style={{ color: textColors.primary }}>
                              {style}
                            </span>
                          </motion.label>
                        ))}
                      </div>
                    </motion.div>

                    {/* Preferred Techniques */}
                    <motion.div 
                      className="p-4 rounded-xl border"
                      style={{ 
                        backgroundColor: colors.lavender[50],
                        borderColor: colors.lavender[200]
                      }}
                      whileHover={{ 
                        backgroundColor: colors.lavender[100],
                        borderColor: colors.lavender[300]
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-medium" style={{ color: textColors.primary }}>
                          Preferred Techniques
                        </label>
                        <SavedIndicator isVisible={savedStates.preferredTechniques} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {['CBT', 'DBT', 'Mindfulness', 'Journaling', 'ACT', 'Breathing'].map((technique) => (
                          <motion.label 
                            key={technique} 
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200"
                            style={{ 
                              backgroundColor: user.preferences.preferredTechniques.includes(technique)
                                ? colors.lavender[200]
                                : colors.neutral[100],
                              borderColor: user.preferences.preferredTechniques.includes(technique)
                                ? colors.lavender[300]
                                : colors.neutral[200]
                            }}
                            whileHover={{ 
                              scale: 1.02,
                              backgroundColor: user.preferences.preferredTechniques.includes(technique)
                                ? colors.lavender[300]
                                : colors.neutral[200]
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <input
                              type="checkbox"
                              checked={user.preferences.preferredTechniques.includes(technique)}
                              onChange={(e) => {
                                const techniques = e.target.checked
                                  ? [...user.preferences.preferredTechniques, technique]
                                  : user.preferences.preferredTechniques.filter(t => t !== technique);
                                onUpdatePreferences({ preferredTechniques: techniques });
                                showSavedAnimation('preferredTechniques');
                              }}
                              className="sr-only"
                            />
                            <div 
                              className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200"
                              style={{ 
                                borderColor: user.preferences.preferredTechniques.includes(technique)
                                  ? colors.lavender[500]
                                  : colors.neutral[400],
                                backgroundColor: user.preferences.preferredTechniques.includes(technique)
                                  ? colors.lavender[500]
                                  : 'transparent'
                              }}
                            >
                              {user.preferences.preferredTechniques.includes(technique) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Check size={10} color="white" />
                                </motion.div>
                              )}
                            </div>
                            <span className="text-sm" style={{ color: textColors.primary }}>
                              {technique}
                            </span>
                          </motion.label>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Memories Tab */}
                {activeTab === 'memories' && (
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium" style={{ color: textColors.primary }}>
                        Your Memories
                      </h3>
                      <SavedIndicator isVisible={savedStates['memory-deleted']} />
                    </div>
                    
                    <p className="text-sm" style={{ color: textColors.muted }}>
                      These are the memories Serenity has saved from your conversations. You can delete any memory you don't want referenced in future conversations.
                    </p>

                    {loadingMemories ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex gap-2">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: colors.sage[400] }}
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ 
                                duration: 1, 
                                repeat: Infinity, 
                                delay: i * 0.2 
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : memories.length === 0 ? (
                      <div 
                        className="text-center py-8 rounded-xl border-2 border-dashed"
                        style={{ 
                          borderColor: colors.neutral[300],
                          color: textColors.muted
                        }}
                      >
                        <p>No memories saved yet.</p>
                        <p className="text-sm mt-1">Start chatting to build your memory profile!</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        <p className="text-xs mb-3" style={{ color: textColors.muted }}>
                          Found {memories.length} memories (showing all memories with importance ≥ 0.4)
                        </p>
                        {memories.map((memory) => (
                          <motion.div
                            key={memory.id}
                            className="p-4 rounded-xl border group"
                            style={{ 
                              backgroundColor: colors.neutral[50],
                              borderColor: colors.neutral[200]
                            }}
                            whileHover={{ 
                              backgroundColor: colors.neutral[100],
                              borderColor: colors.neutral[300]
                            }}
                            layout
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm leading-relaxed" style={{ color: textColors.primary }}>
                                  {memory.content}
                                </p>
                                <div className="flex items-center gap-4 mt-3">
                                  <span className="text-xs" style={{ color: textColors.muted }}>
                                    {new Date(memory.createdAt).toLocaleDateString()}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs" style={{ color: textColors.muted }}>
                                      Importance: {(memory.importance * 100).toFixed(0)}%
                                    </span>
                                    <div className="flex gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <div
                                          key={i}
                                          className="w-2 h-2 rounded-full"
                                          style={{
                                            backgroundColor: i < Math.round(memory.importance * 5)
                                              ? colors.sage[400]
                                              : colors.neutral[300]
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {memory.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {memory.tags.slice(0, 3).map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-xs px-2 py-1 rounded-full"
                                        style={{
                                          backgroundColor: colors.sage[100],
                                          color: colors.sage[700]
                                        }}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <motion.button
                                onClick={() => handleDeleteMemory(memory.id)}
                                className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                style={{ 
                                  backgroundColor: colors.status.error,
                                  color: '#DC2626'
                                }}
                                whileHover={{ 
                                  scale: 1.1,
                                  backgroundColor: '#FEE2E2'
                                }}
                                whileTap={{ scale: 0.9 }}
                                title="Delete this memory"
                              >
                                <Trash2 size={14} />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Logout */}
                <motion.div 
                  className="pt-6 border-t"
                  style={{ borderTopColor: colors.neutral[200] }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 font-medium"
                    style={{ 
                      backgroundColor: colors.status.error,
                      color: '#DC2626',
                      border: `2px solid ${colors.status.error}`
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: '#FEE2E2',
                      borderColor: '#FCA5A5'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}