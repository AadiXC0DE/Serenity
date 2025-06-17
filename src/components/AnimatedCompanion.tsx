import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Brain, Sparkles, MessageCircle } from 'lucide-react';
import { colors, textColors } from '../styles/colors';

interface AnimatedCompanionProps {
  mood?: 'listening' | 'speaking' | 'thinking' | 'caring';
  isTyping?: boolean;
}

export function AnimatedCompanion({ mood = 'listening', isTyping = false }: AnimatedCompanionProps) {
  const getMoodGradient = () => {
    switch (mood) {
      case 'listening': return `linear-gradient(135deg, ${colors.sage[200]}, ${colors.sage[400]})`;
      case 'speaking': return `linear-gradient(135deg, ${colors.primary[200]}, ${colors.primary[400]})`;
      case 'thinking': return `linear-gradient(135deg, ${colors.lavender[200]}, ${colors.lavender[400]})`;
      case 'caring': return `linear-gradient(135deg, ${colors.accent.peach}, ${colors.primary[300]})`;
      default: return `linear-gradient(135deg, ${colors.sage[200]}, ${colors.sage[400]})`;
    }
  };

  const getMoodIcon = () => {
    switch (mood) {
      case 'listening': return <MessageCircle size={32} className="text-white" />;
      case 'speaking': return <Sparkles size={32} className="text-white" />;
      case 'thinking': return <Brain size={32} className="text-white" />;
      case 'caring': return <Heart size={32} className="text-white" />;
      default: return <Heart size={32} className="text-white" />;
    }
  };

  return (
    <div className="flex flex-col items-center relative">
      {/* Main Avatar */}
      <motion.div
        className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl relative overflow-hidden"
        style={{ 
          background: getMoodGradient(),
          boxShadow: `0 20px 40px -10px ${colors.neutral[400]}`
        }}
        animate={{
          scale: mood === 'speaking' ? [1, 1.05, 1] : 1,
          rotate: mood === 'thinking' ? [0, 3, -3, 0] : 0,
          y: mood === 'caring' ? [0, -4, 0] : 0
        }}
        transition={{
          scale: { duration: 1.5, repeat: mood === 'speaking' ? Infinity : 0 },
          rotate: { duration: 3, repeat: mood === 'thinking' ? Infinity : 0 },
          y: { duration: 2.5, repeat: mood === 'caring' ? Infinity : 0, ease: "easeInOut" }
        }}
      >
        {/* Breathing animation overlay */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Icon */}
        <motion.div
          animate={{ 
            scale: mood === 'speaking' ? [1, 1.1, 1] : 1,
          }}
          transition={{ 
            duration: 0.8, 
            repeat: mood === 'speaking' ? Infinity : 0
          }}
        >
          {getMoodIcon()}
        </motion.div>

        {/* Pulse effect for speaking */}
        {mood === 'speaking' && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white"
              animate={{ scale: [1, 2], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}
      </motion.div>

      {/* Name and Status */}
      <motion.div 
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-2" style={{ color: textColors.primary }}>
          Serenity
        </h2>
        <motion.p 
          className="text-sm"
          style={{ color: textColors.muted }}
          animate={{ opacity: isTyping ? [1, 0.5, 1] : 1 }}
          transition={{ duration: 1.5, repeat: isTyping ? Infinity : 0 }}
        >
          {isTyping ? 'Thinking carefully...' : 'Your AI Therapy Companion'}
        </motion.p>
        
        {/* Mood indicator */}
        <motion.div
          className="mt-3 px-4 py-2 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: colors.neutral[100],
            color: textColors.secondary
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {mood === 'listening' && '👂 Listening'}
          {mood === 'speaking' && '💬 Speaking'}
          {mood === 'thinking' && '🤔 Thinking'}
          {mood === 'caring' && '💝 Caring'}
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(45deg, ${colors.primary[200]}, ${colors.sage[200]})`,
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 20}%`,
            }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.6, 1.2, 0.6]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${colors.primary[100]}40, transparent 70%)`,
          filter: 'blur(20px)',
          transform: 'scale(1.5)'
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}