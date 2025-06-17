import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Heart } from 'lucide-react';
import { authService } from '../services/authService';
import { colors, textColors } from '../styles/colors';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!isLogin && !formData.name.trim()) {
      setError('Please enter your full name');
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await authService.login({
          email: formData.email.trim(),
          password: formData.password
        });
      } else {
        await authService.register({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim()
        });
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="max-w-md w-full rounded-3xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: colors.neutral[50] }}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
          >
            {/* Header with gradient */}
            <div 
              className="p-8 text-center relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary[100]}, ${colors.sage[100]})`
              }}
            >
              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: `linear-gradient(45deg, ${colors.primary[200]}, ${colors.sage[200]})`,
                      left: `${20 + i * 30}%`,
                      top: `${20 + i * 20}%`,
                    }}
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.8,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.primary[200]}, ${colors.sage[200]})`
                }}
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Heart size={32} className="text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2 relative z-10" style={{ color: textColors.primary }}>
                {isLogin ? 'Welcome Back' : 'Join Serenity'}
              </h2>
              <p className="relative z-10" style={{ color: textColors.secondary }}>
                {isLogin 
                  ? 'Sign in to continue your therapy journey' 
                  : 'Create your account to start your mental health journey'
                }
              </p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium mb-2" style={{ color: textColors.primary }}>
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: textColors.muted }} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300"
                        style={{ 
                          backgroundColor: colors.neutral[50],
                          borderColor: colors.neutral[200],
                          color: textColors.primary
                        }}
                        placeholder="Enter your full name"
                        required={!isLogin}
                        onFocus={(e) => e.target.style.borderColor = colors.primary[300]}
                        onBlur={(e) => e.target.style.borderColor = colors.neutral[200]}
                      />
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textColors.primary }}>
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: textColors.muted }} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300"
                      style={{ 
                        backgroundColor: colors.neutral[50],
                        borderColor: colors.neutral[200],
                        color: textColors.primary
                      }}
                      placeholder="Enter your email"
                      required
                      onFocus={(e) => e.target.style.borderColor = colors.sage[300]}
                      onBlur={(e) => e.target.style.borderColor = colors.neutral[200]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: textColors.primary }}>
                    Password *
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: textColors.muted }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-12 pr-14 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300"
                      style={{ 
                        backgroundColor: colors.neutral[50],
                        borderColor: colors.neutral[200],
                        color: textColors.primary
                      }}
                      placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                      required
                      onFocus={(e) => e.target.style.borderColor = colors.lavender[300]}
                      onBlur={(e) => e.target.style.borderColor = colors.neutral[200]}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors duration-200"
                      style={{ color: textColors.muted }}
                      whileHover={{ 
                        scale: 1.1,
                        color: textColors.secondary
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </motion.button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    className="p-4 rounded-2xl border"
                    style={{ 
                      backgroundColor: colors.status.error,
                      borderColor: '#FCA5A5',
                      color: '#DC2626'
                    }}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl font-medium transition-all duration-300 relative overflow-hidden"
                  style={{ 
                    backgroundColor: isLoading ? colors.neutral[300] : colors.sage[200],
                    color: isLoading ? textColors.muted : colors.sage[700]
                  }}
                  whileHover={{ 
                    scale: isLoading ? 1 : 1.02,
                    backgroundColor: isLoading ? colors.neutral[300] : colors.sage[300]
                  }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: textColors.muted }}
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
                  <span style={{ opacity: isLoading ? 0 : 1 }}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </span>
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <motion.button
                  onClick={toggleMode}
                  className="font-medium transition-colors duration-200"
                  style={{ color: colors.sage[600] }}
                  whileHover={{ 
                    color: colors.sage[700],
                    scale: 1.02
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </motion.button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs" style={{ color: textColors.muted }}>
                  🔒 Your data is securely stored in Supabase
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}