import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Volume2, VolumeX } from 'lucide-react';
import { User } from '../types';
import { voiceRecognitionService } from '../services/voiceRecognitionService';
import { colors, textColors } from '../styles/colors';

interface VoiceConversationModeProps {
  isActive: boolean;
  onToggle: () => void;
  onSendMessage: (message: string) => void;
  isVoicePlaying: boolean;
  onStopVoice: () => void;
  user: User;
  isTyping: boolean;
}

export function VoiceConversationMode({
  isActive,
  onToggle,
  onSendMessage,
  isVoicePlaying,
  onStopVoice,
  user,
  isTyping
}: VoiceConversationModeProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported] = useState(voiceRecognitionService.isRecognitionSupported());

  // Auto-stop microphone when user sends a message or AI starts processing
  useEffect(() => {
    if (isTyping && isListening) {
      console.log('🔇 AI processing - stopping microphone');
      stopListening();
    }
  }, [isTyping, isListening]);

  const startListening = () => {
    if (!isSupported || isVoicePlaying || isTyping) {
      console.log('🚫 Cannot start listening - conditions not met');
      return;
    }

    console.log('🎤 Starting to listen');
    setIsListening(true);
    setTranscript('');

    voiceRecognitionService.startListening({
      onResult: (newTranscript) => {
        setTranscript(newTranscript);
      },
      onEnd: () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
        
        // Send the transcript if we have one
        if (transcript.trim()) {
          handleSendTranscript(transcript.trim());
        }
      },
      onError: (error) => {
        console.error('🎤 Voice recognition error:', error);
        setIsListening(false);
        setTranscript('');
      }
    });
  };

  const stopListening = () => {
    console.log('🔇 Stopping microphone');
    voiceRecognitionService.stopListening();
    setIsListening(false);
    
    // Send transcript if we have one
    if (transcript.trim()) {
      handleSendTranscript(transcript.trim());
    }
    setTranscript('');
  };

  const handleSendTranscript = (transcriptText: string) => {
    if (!transcriptText.trim()) return;

    console.log('📤 Sending transcript:', transcriptText);
    setTranscript('');
    setIsListening(false);
    onSendMessage(transcriptText);
  };

  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="max-w-md w-full mx-4 rounded-3xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: colors.neutral[50] }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Header */}
            <div 
              className="p-6 text-center relative"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary[100]}, ${colors.sage[100]})`
              }}
            >
              <motion.button
                onClick={onToggle}
                className="absolute top-4 right-4 p-2 rounded-xl transition-colors duration-200"
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

              <h2 className="text-2xl font-bold mb-2" style={{ color: textColors.primary }}>
                Voice Conversation
              </h2>
              <div className="flex items-center justify-center gap-2">
                <p style={{ color: textColors.secondary }}>
                  Manual Voice Mode
                </p>
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: colors.lavender[200],
                    color: colors.lavender[700]
                  }}
                >
                  Beta
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: textColors.muted }}>
                Seamless voice mode coming soon
              </p>
            </div>

            {/* Voice Controls */}
            <div className="p-8 text-center">
              {/* Status Display */}
              <div className="mb-6">
                <motion.h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: textColors.primary }}
                >
                  {isTyping ? 'Processing...' : 
                   isVoicePlaying ? 'Speaking...' : 
                   isListening ? 'Listening...' : 'Ready'}
                </motion.h3>
                
                <p className="text-sm" style={{ color: textColors.muted }}>
                  {isTyping && 'Analyzing your message...'}
                  {isVoicePlaying && 'Serenity is speaking'}
                  {isListening && 'Microphone is active - speak now'}
                  {!isTyping && !isVoicePlaying && !isListening && 'Press the microphone to start speaking'}
                </p>
              </div>

              {/* Microphone Button */}
              <div className="mb-6">
                <motion.button
                  onClick={toggleMicrophone}
                  disabled={isTyping || isVoicePlaying}
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden"
                  style={{ 
                    backgroundColor: isListening 
                      ? colors.status.error 
                      : (isTyping || isVoicePlaying) 
                        ? colors.neutral[300] 
                        : colors.sage[200],
                    color: isListening 
                      ? '#DC2626' 
                      : (isTyping || isVoicePlaying) 
                        ? textColors.muted 
                        : colors.sage[700]
                  }}
                  whileHover={{ 
                    scale: (isTyping || isVoicePlaying) ? 1 : 1.05
                  }}
                  whileTap={{ 
                    scale: (isTyping || isVoicePlaying) ? 1 : 0.95 
                  }}
                  animate={isListening ? { 
                    boxShadow: [
                      `0 0 0 0 ${colors.status.error}40`,
                      `0 0 0 20px ${colors.status.error}00`,
                      `0 0 0 0 ${colors.status.error}40`
                    ]
                  } : {}}
                  transition={isListening ? { duration: 1.5, repeat: Infinity } : { duration: 0.2 }}
                >
                  <motion.div
                    animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                    transition={isListening ? { duration: 1, repeat: Infinity } : {}}
                  >
                    {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                  </motion.div>
                  
                  {/* Recording indicator */}
                  {isListening && (
                    <motion.div
                      className="absolute top-2 right-2 w-3 h-3 rounded-full"
                      style={{ backgroundColor: '#DC2626' }}
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}

                  {/* Disabled overlay */}
                  {(isTyping || isVoicePlaying) && (
                    <motion.div
                      className="absolute inset-0 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className="text-xs font-medium">
                        {isTyping ? 'Processing' : 'Speaking'}
                      </span>
                    </motion.div>
                  )}
                </motion.button>
              </div>

              {/* Transcript Display */}
              <AnimatePresence>
                {transcript && (
                  <motion.div
                    className="p-4 rounded-2xl mb-4"
                    style={{ 
                      backgroundColor: colors.sage[100],
                      color: colors.sage[700]
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-sm font-medium mb-1">You're saying:</p>
                    <p className="text-base">{transcript}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Instructions */}
              <div className="space-y-2 text-sm" style={{ color: textColors.muted }}>
                <p>• Press and hold microphone to speak</p>
                <p>• Release or press again to send message</p>
                <p>• Microphone auto-stops during processing</p>
              </div>

              {/* Stop Voice Button */}
              {isVoicePlaying && (
                <motion.button
                  onClick={onStopVoice}
                  className="mt-6 px-6 py-3 rounded-2xl font-medium transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.status.error,
                    color: '#DC2626'
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: '#FEE2E2'
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <VolumeX size={20} className="inline mr-2" />
                  Stop Speaking
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}