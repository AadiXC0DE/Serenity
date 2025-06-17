import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Volume2, Sparkles } from 'lucide-react';
import { Message, User } from '../types';
import { VoiceButton } from './VoiceButton';
import { colors, textColors } from '../styles/colors';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  isVoicePlaying: boolean;
  onStopVoice: () => void;
  onPlayVoice: (text: string) => void;
  onShowSettings: () => void;
  user: User;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isTyping,
  isVoicePlaying,
  onStopVoice,
  onPlayVoice,
  onShowSettings,
  user
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    if (transcript.trim()) {
      onSendMessage(transcript.trim());
    }
  };

  return (
    <div 
      className="h-full flex flex-col rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
      style={{ 
        backgroundColor: colors.neutral[50],
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)'
      }}
    >
      {/* Messages - Takes remaining space and scrolls */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 min-h-0">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut"
              }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] sm:max-w-[75%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                <motion.div
                  className="px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl shadow-sm relative overflow-hidden"
                  style={{
                    backgroundColor: message.sender === 'user' 
                      ? colors.sage[100] 
                      : colors.primary[100],
                    color: textColors.primary,
                    borderRadius: message.sender === 'user' 
                      ? '20px 20px 6px 20px' 
                      : '20px 20px 20px 6px'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Subtle gradient overlay */}
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: message.sender === 'user'
                        ? `linear-gradient(135deg, ${colors.sage[50]}, ${colors.sage[200]})`
                        : `linear-gradient(135deg, ${colors.primary[50]}, ${colors.primary[200]})`
                    }}
                  />
                  
                  <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap relative z-10">
                    {message.content}
                  </p>
                  
                  {/* Technique indicator */}
                  {message.technique && (
                    <motion.div 
                      className="mt-3 flex items-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Sparkles size={12} style={{ color: colors.lavender[600] }} />
                      <span 
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ 
                          backgroundColor: colors.lavender[100],
                          color: colors.lavender[700]
                        }}
                      >
                        {message.technique}
                      </span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Voice button for AI messages */}
                {message.sender === 'therapist' && user.preferences.voiceEnabled && (
                  <motion.button
                    onClick={() => onPlayVoice(message.content)}
                    className="mt-2 flex items-center gap-2 text-xs px-3 py-2 rounded-full transition-all duration-300"
                    style={{ 
                      color: textColors.muted,
                      backgroundColor: colors.neutral[100]
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: colors.sage[100],
                      color: colors.sage[700]
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Volume2 size={12} />
                    <span>Listen</span>
                  </motion.button>
                )}

                <motion.span 
                  className="text-xs mt-2 block"
                  style={{ color: textColors.muted }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div 
              className="px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl shadow-sm"
              style={{ 
                backgroundColor: colors.primary[100],
                borderRadius: '20px 20px 20px 6px'
              }}
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.primary[400] }}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section - Fixed at bottom */}
      <motion.div 
        className="flex-shrink-0 p-3 sm:p-4 lg:p-6 border-t"
        style={{ 
          backgroundColor: colors.neutral[50],
          borderTopColor: colors.neutral[200]
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={`Hey ${user.name}, what's on your mind?`}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 text-sm sm:text-base"
              style={{ 
                backgroundColor: colors.neutral[50],
                borderColor: isInputFocused ? colors.sage[300] : colors.neutral[200],
                color: textColors.primary,
                boxShadow: isInputFocused 
                  ? `0 0 0 3px ${colors.sage[100]}` 
                  : 'none',
                height: '48px'
              }}
              disabled={isTyping}
            />
            
            {/* Character count indicator */}
            {inputValue.length > 200 && (
              <motion.div
                className="absolute bottom-2 right-4 text-xs"
                style={{ color: textColors.muted }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {inputValue.length}/500
              </motion.div>
            )}
          </div>
          
          {/* Voice Input Button */}
          {user.preferences.voiceEnabled && (
            <VoiceButton
              onTranscript={handleVoiceTranscript}
              isVoicePlaying={isVoicePlaying}
              onStopVoice={onStopVoice}
              disabled={isTyping}
            />
          )}
          
          {/* Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="rounded-2xl transition-all duration-300 relative overflow-hidden flex items-center justify-center"
            style={{ 
              backgroundColor: inputValue.trim() && !isTyping 
                ? colors.sage[200] 
                : colors.neutral[200],
              color: inputValue.trim() && !isTyping 
                ? colors.sage[700] 
                : textColors.muted,
              width: '48px',
              height: '48px',
              minWidth: '48px',
              minHeight: '48px'
            }}
            whileHover={{ 
              scale: inputValue.trim() && !isTyping ? 1.05 : 1,
              backgroundColor: inputValue.trim() && !isTyping 
                ? colors.sage[300] 
                : colors.neutral[200]
            }}
            whileTap={{ 
              scale: inputValue.trim() && !isTyping ? 0.95 : 1 
            }}
          >
            <motion.div
              animate={inputValue.trim() && !isTyping ? { rotate: [0, 15, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Send size={20} />
            </motion.div>
            
            {/* Ripple effect on send */}
            {inputValue.trim() && !isTyping && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ backgroundColor: colors.sage[100] }}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}