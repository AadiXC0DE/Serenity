import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, RefreshCw, Infinity, Zap } from 'lucide-react';
import { creditsService } from '../services/creditsService';
import { colors, textColors } from '../styles/colors';

interface CreditsDisplayProps {
  credits: number;
  unlimitedCredits: boolean;
  onRefresh: () => void;
}

export function CreditsDisplay({ credits, unlimitedCredits, onRefresh }: CreditsDisplayProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getCreditsColor = () => {
    if (unlimitedCredits) return colors.sage[600];
    if (credits === 0) return colors.status.warning;
    if (credits < 20) return colors.accent.peach;
    return colors.sage[600];
  };

  const getCreditsIcon = () => {
    if (unlimitedCredits) return Infinity;
    if (credits === 0) return Zap;
    return Coins;
  };

  const CreditsIcon = getCreditsIcon();

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-300"
      style={{ 
        backgroundColor: colors.neutral[100],
        borderColor: getCreditsColor(),
        border: `2px solid ${getCreditsColor()}20`
      }}
      whileHover={{ 
        scale: 1.05,
        backgroundColor: colors.neutral[200],
        borderColor: getCreditsColor()
      }}
      whileTap={{ scale: 0.95 }}
      onClick={handleRefresh}
    >
      <motion.div
        animate={isRefreshing ? { rotate: 360 } : {}}
        transition={{ duration: 0.5 }}
      >
        {isRefreshing ? (
          <RefreshCw size={16} style={{ color: getCreditsColor() }} />
        ) : (
          <CreditsIcon size={16} style={{ color: getCreditsColor() }} />
        )}
      </motion.div>
      
      <span 
        className="text-sm font-medium"
        style={{ color: getCreditsColor() }}
      >
        {unlimitedCredits ? '∞' : credits}
      </span>
    </motion.div>
  );
}