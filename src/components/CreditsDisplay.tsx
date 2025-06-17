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
  const [showTooltip, setShowTooltip] = useState(false);

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
    <div className="relative">
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
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
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

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 rounded-lg shadow-lg border z-50"
            style={{ 
              backgroundColor: colors.neutral[50],
              borderColor: colors.neutral[200],
              minWidth: '200px'
            }}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-center">
              <p className="text-sm font-medium mb-1" style={{ color: textColors.primary }}>
                {creditsService.getCreditsStatusMessage(credits, unlimitedCredits)}
              </p>
              <div className="text-xs space-y-1" style={{ color: textColors.muted }}>
                <p>• Text messages: Free (limited time)</p>
                <p>• Voice responses: 10 credits each</p>
                {!unlimitedCredits && credits === 0 && (
                  <p className="font-medium" style={{ color: colors.accent.peach }}>
                    Voice locked - upgrade to Pro for unlimited!
                  </p>
                )}
              </div>
            </div>
            
            {/* Tooltip arrow */}
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45"
              style={{ backgroundColor: colors.neutral[50] }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}