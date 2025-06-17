import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, VolumeX } from 'lucide-react';
import { voiceRecognitionService } from '../services/voiceRecognitionService';
import { colors, textColors } from '../styles/colors';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  isVoicePlaying: boolean;
  onStopVoice: () => void;
  disabled?: boolean;
}

export function VoiceButton({ onTranscript, isVoicePlaying, onStopVoice, disabled }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported] = useState(voiceRecognitionService.isRecognitionSupported());

  useEffect(() => {
    if (!isSupported) {
      console.warn('Speech recognition not supported in this browser');
    }
  }, [isSupported]);

  const startListening = () => {
    if (!isSupported || disabled) return;

    setIsListening(true);
    setTranscript('');

    voiceRecognitionService.startListening({
      onResult: (text) => {
        setTranscript(text);
      },
      onEnd: () => {
        setIsListening(false);
        if (transcript.trim()) {
          onTranscript(transcript.trim());
          setTranscript('');
        }
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        setTranscript('');
      }
    });
  };

  const stopListening = () => {
    voiceRecognitionService.stopListening();
    setIsListening(false);
    if (transcript.trim()) {
      onTranscript(transcript.trim());
    }
    setTranscript('');
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 relative">
      {/* Voice Input Button */}
      <motion.button
        onClick={isListening ? stopListening : startListening}
        disabled={disabled || isVoicePlaying}
        className="rounded-2xl transition-all duration-300 relative overflow-hidden flex items-center justify-center"
        style={{ 
          backgroundColor: isListening 
            ? colors.status.error 
            : (disabled || isVoicePlaying) 
              ? colors.neutral[200] 
              : colors.sage[200],
          color: isListening 
            ? '#DC2626' 
            : (disabled || isVoicePlaying) 
              ? textColors.muted 
              : colors.sage[700],
          width: '48px',
          height: '48px',
          minWidth: '48px',
          minHeight: '48px'
        }}
        whileHover={{ 
          scale: disabled || isVoicePlaying ? 1 : 1.05,
          backgroundColor: isListening 
            ? '#FEE2E2' 
            : (disabled || isVoicePlaying) 
              ? colors.neutral[200] 
              : colors.sage[300]
        }}
        whileTap={{ scale: disabled || isVoicePlaying ? 1 : 0.95 }}
        animate={isListening ? { 
          boxShadow: [
            `0 0 0 0 ${colors.status.error}40`,
            `0 0 0 10px ${colors.status.error}00`,
            `0 0 0 0 ${colors.status.error}40`
          ]
        } : {}}
        transition={isListening ? { duration: 1.5, repeat: Infinity } : { duration: 0.2 }}
      >
        <motion.div
          animate={isListening ? { scale: [1, 1.1, 1] } : {}}
          transition={isListening ? { duration: 1, repeat: Infinity } : {}}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </motion.div>
        
        {/* Recording indicator */}
        {isListening && (
          <motion.div
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: '#DC2626' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Stop Voice Playback Button */}
      {isVoicePlaying && (
        <motion.button
          onClick={onStopVoice}
          className="rounded-2xl transition-all duration-300 flex items-center justify-center"
          style={{ 
            backgroundColor: colors.status.error,
            color: '#DC2626',
            width: '48px',
            height: '48px',
            minWidth: '48px',
            minHeight: '48px'
          }}
          whileHover={{ 
            scale: 1.05,
            backgroundColor: '#FEE2E2'
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 20 }}
        >
          <VolumeX size={20} />
        </motion.button>
      )}

      {/* Transcript Display */}
      {transcript && (
        <motion.div
          className="absolute bottom-full left-0 right-0 mb-3 p-4 rounded-2xl shadow-lg border"
          style={{ 
            backgroundColor: colors.sage[100],
            borderColor: colors.sage[200],
            color: colors.sage[700]
          }}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm font-medium mb-1">Listening...</p>
          <p className="text-xs">{transcript}</p>
          
          {/* Animated dots */}
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full"
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
        </motion.div>
      )}
    </div>
  );
}