import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Brain, MessageCircle, Volume2, Shield, Sparkles, ArrowRight, Star, Users, Clock, Zap, Check, X, Menu, Home, DollarSign, Layers } from 'lucide-react';
import { colors, textColors } from '../styles/colors';
import Brand from "./assets/Brand.png";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const features = [
    {
      icon: Brain,
      title: "Remembers Everything",
      description: "Unlike ChatGPT, Serenity builds a comprehensive memory of your conversations, learning about your unique situation and preferences.",
      color: colors.primary[200],
      bgColor: colors.primary[50]
    },
    {
      icon: Heart,
      title: "Genuinely Cares",
      description: "Designed specifically for emotional support with empathy, warmth, and therapeutic techniques tailored to your needs.",
      color: colors.sage[200],
      bgColor: colors.sage[50]
    },
    {
      icon: Volume2,
      title: "Voice Conversations",
      description: "Talk naturally with Serenity using voice mode. Beta feature with seamless voice conversations coming soon!",
      color: colors.lavender[200],
      bgColor: colors.lavender[50]
    },
    {
      icon: Sparkles,
      title: "Personalized Experience",
      description: "Customize everything - response style, empathy level, conversation approach, and therapeutic techniques.",
      color: colors.accent.peach,
      bgColor: colors.accent.cream
    }
  ];

  const stats = [
    { number: "10,000+", label: "Conversations", icon: MessageCircle },
    { number: "24/7", label: "Available", icon: Clock },
    { number: "100%", label: "Private", icon: Shield },
    { number: "∞", label: "Memory", icon: Brain }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const NavLink = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <motion.button
      onClick={() => scrollToSection(id)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
      style={{
        backgroundColor: activeSection === id ? colors.sage[200] : 'transparent',
        color: activeSection === id ? colors.sage[700] : textColors.secondary
      }}
      whileHover={{
        backgroundColor: activeSection === id ? colors.sage[300] : colors.neutral[100],
        scale: 1.02
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon size={16} />
      <span>{label}</span>
    </motion.button>
  );

  return (
    <div 
      className="min-h-screen overflow-x-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.sage[50]}, ${colors.lavender[50]})`
      }}
    >
      {/* Modern Navigation Bar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{ 
          backgroundColor: `${colors.neutral[50]}F0`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${colors.neutral[200]}`
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection('home')}
            style={{ cursor: 'pointer' }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.sage[200] }}
            >
              <Heart size={20} style={{ color: colors.sage[700] }} />
            </div>
            <span className="text-xl font-bold" style={{ color: textColors.primary }}>
              Serenity
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink id="home" label="Home" icon={Home} />
            <NavLink id="features" label="Features" icon={Layers} />
            <NavLink id="pricing" label="Pricing" icon={DollarSign} />
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <motion.button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-xl font-medium transition-all duration-300"
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
              Get Started Free
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-xl"
            style={{ 
              backgroundColor: colors.neutral[100],
              color: textColors.secondary
            }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden mt-4 p-4 rounded-2xl"
              style={{ backgroundColor: colors.neutral[50] }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-2">
                <NavLink id="home" label="Home" icon={Home} />
                <NavLink id="features" label="Features" icon={Layers} />
                <NavLink id="pricing" label="Pricing" icon={DollarSign} />
                <motion.button
                  onClick={onGetStarted}
                  className="w-full mt-4 px-6 py-3 rounded-xl font-medium transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.sage[200],
                    color: colors.sage[700]
                  }}
                  whileHover={{ backgroundColor: colors.sage[300] }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started Free
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        id="home"
        className="relative px-6 py-20 pt-32 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Floating Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full opacity-20"
              style={{
                background: `linear-gradient(45deg, ${colors.primary[200]}, ${colors.sage[200]})`,
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 6 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <motion.div
              className="text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Main Headline */}
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                style={{ color: textColors.primary }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Meet{' '}
                <motion.span
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.sage[400]}, ${colors.primary[400]})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Serenity
                </motion.span>
              </motion.h1>

              {/* Tagline */}
              <motion.p 
                className="text-xl md:text-2xl mb-8 leading-relaxed"
                style={{ color: textColors.secondary }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Stop talking to ChatGPT about your feelings.{' '}
                <motion.span 
                  className="font-semibold"
                  style={{ color: colors.sage[600] }}
                  whileHover={{ scale: 1.05 }}
                >
                  Talk to Serenity
                </motion.span>
                {' '}— she understands you, remembers everything about you, and genuinely cares.
              </motion.p>

              {/* Subtitle */}
              <motion.p 
                className="text-lg mb-12"
                style={{ color: textColors.muted }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Your AI therapy companion with infinite memory, voice conversations, and personalized emotional support available 24/7.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 items-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <motion.button
                  onClick={onGetStarted}
                  className="px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 relative overflow-hidden group"
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
                  <span className="relative z-10 flex items-center gap-2">
                    Start Talking to Serenity
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight size={20} />
                    </motion.div>
                  </span>
                  
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatDelay: 3 
                    }}
                  />
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Side - AI Persona Image */}
            <motion.div
              className="flex justify-center lg:justify-end"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Main Image Container */}
                <motion.div
                  className="w-80 h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl relative"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.sage[100]}, ${colors.primary[100]})`
                  }}
                  animate={{ 
                    boxShadow: [
                      `0 20px 40px -10px ${colors.sage[200]}40`,
                      `0 25px 50px -10px ${colors.primary[200]}40`,
                      `0 20px 40px -10px ${colors.sage[200]}40`
                    ]
                  }}
                  transition={{ 
                    boxShadow: {
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      type: "keyframes"
                    }
                  }}
                >
                  {/* Breathing animation overlay */}
                  <motion.div
                    className="absolute inset-0"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* AI Persona Image */}
                  <img
                    src="/src/Brand.png"
                    alt="Serenity - Your AI Therapy Companion"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gentle glow overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white opacity-10"
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>

                {/* Floating Elements Around Image */}
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.sage[200] }}
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart size={16} style={{ color: colors.sage[700] }} />
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-4 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.primary[200] }}
                  animate={{ 
                    y: [0, -8, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <Sparkles size={12} style={{ color: colors.primary[700] }} />
                </motion.div>

                <motion.div
                  className="absolute top-1/2 -left-6 w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors.lavender[200] }}
                  animate={{ 
                    x: [0, -5, 0],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        className="py-16 px-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-3xl"
            style={{ 
              backgroundColor: colors.neutral[50],
              border: `2px solid ${colors.neutral[200]}`
            }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: colors.sage[100] }}
                  whileHover={{ 
                    backgroundColor: colors.sage[200],
                    transition: { duration: 0.2 }
                  }}
                >
                  <stat.icon size={24} style={{ color: colors.sage[600] }} />
                </motion.div>
                <h3 
                  className="text-3xl font-bold mb-2"
                  style={{ color: textColors.primary }}
                >
                  {stat.number}
                </h3>
                <p style={{ color: textColors.muted }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        className="py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: textColors.primary }}>
              Why Serenity is Different
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: textColors.secondary }}>
              Unlike generic AI chatbots, Serenity is specifically designed for emotional support and mental wellness.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden"
                style={{ 
                  backgroundColor: hoveredFeature === index ? feature.bgColor : colors.neutral[50],
                  borderColor: hoveredFeature === index ? feature.color : colors.neutral[200]
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: `0 20px 40px -10px ${feature.color}40`
                }}
              >
                {/* Background gradient on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0"
                  style={{ 
                    background: `linear-gradient(135deg, ${feature.bgColor}, ${feature.color}20)`
                  }}
                  animate={{ 
                    opacity: hoveredFeature === index ? 0.3 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                />

                <div className="relative z-10">
                  <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: feature.color }}
                    animate={{ 
                      rotate: hoveredFeature === index ? [0, 5, -5, 0] : 0,
                      scale: hoveredFeature === index ? 1.1 : 1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon size={28} className="text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-4" style={{ color: textColors.primary }}>
                    {feature.title}
                  </h3>
                  <p className="text-lg leading-relaxed" style={{ color: textColors.secondary }}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="pricing"
        className="py-20 px-6"
        style={{ backgroundColor: colors.neutral[50] }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: textColors.primary }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: textColors.secondary }}>
              Start free and upgrade when you're ready for unlimited conversations and advanced features.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div
              className="p-8 rounded-3xl border-2 relative overflow-hidden flex flex-col"
              style={{ 
                backgroundColor: colors.neutral[50],
                borderColor: colors.neutral[300],
                minHeight: '600px'
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.02,
                borderColor: colors.sage[300],
                boxShadow: `0 20px 40px -10px ${colors.sage[200]}40`
              }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2" style={{ color: textColors.primary }}>
                  Free Forever
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold" style={{ color: textColors.primary }}>
                    $0
                  </span>
                  <span style={{ color: textColors.muted }}>/month</span>
                </div>
                <p style={{ color: textColors.secondary }}>
                  Perfect for getting started with Serenity
                </p>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                {[
                  "50 conversations per month",
                  "Basic memory (last 30 days)",
                  "Voice responses (limited)",
                  "Core therapeutic techniques",
                  "Basic customization",
                  "Community support"
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: colors.sage[200] }}
                    >
                      <Check size={12} style={{ color: colors.sage[700] }} />
                    </div>
                    <span style={{ color: textColors.secondary }}>{feature}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={onGetStarted}
                className="w-full py-4 rounded-2xl font-semibold transition-all duration-300 mt-auto"
                style={{ 
                  backgroundColor: colors.sage[200],
                  color: colors.sage[700],
                  border: `2px solid ${colors.sage[300]}`
                }}
                whileHover={{ 
                  backgroundColor: colors.sage[300],
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
              >
                Start Free Today
              </motion.button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              className="p-8 rounded-3xl border-2 relative overflow-hidden flex flex-col"
              style={{ 
                backgroundColor: colors.primary[50],
                borderColor: colors.primary[300],
                minHeight: '600px'
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.02,
                borderColor: colors.primary[400],
                boxShadow: `0 20px 40px -10px ${colors.primary[300]}40`
              }}
            >
              {/* Popular Badge - Fixed positioning */}
              <motion.div
                className="absolute top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full text-sm font-bold"
                style={{ 
                  backgroundColor: colors.primary[300],
                  color: colors.primary[700]
                }}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
              >
                Coming Soon
              </motion.div>

              <div className="text-center mb-8 mt-8">
                <h3 className="text-2xl font-bold mb-2" style={{ color: textColors.primary }}>
                  Pro Plan
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold" style={{ color: textColors.primary }}>
                    $5
                  </span>
                  <span style={{ color: textColors.muted }}>/month</span>
                </div>
                <p style={{ color: textColors.secondary }}>
                  Unlimited access to all features
                </p>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                {[
                  "Unlimited conversations",
                  "Infinite memory storage",
                  "Unlimited voice responses",
                  "Advanced therapeutic techniques",
                  "Full customization options",
                  "Priority support",
                  "Early access to new features",
                  "Export conversation history"
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: colors.primary[300] }}
                    >
                      <Check size={12} style={{ color: colors.primary[700] }} />
                    </div>
                    <span style={{ color: textColors.secondary }}>{feature}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                className="w-full py-4 rounded-2xl font-semibold transition-all duration-300 relative overflow-hidden mt-auto"
                style={{ 
                  backgroundColor: colors.primary[300],
                  color: colors.primary[700],
                  border: `2px solid ${colors.primary[400]}`
                }}
                whileHover={{ 
                  backgroundColor: colors.primary[400],
                  scale: 1.02
                }}
                whileTap={{ scale: 0.98 }}
                disabled
              >
                <span className="relative z-10">Coming Soon</span>
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatDelay: 3 
                  }}
                />
              </motion.button>
            </motion.div>
          </div>

          {/* Pricing FAQ */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-lg mb-4" style={{ color: textColors.secondary }}>
              Questions about pricing?
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: textColors.muted }}>
              <span>✓ No hidden fees</span>
              <span>✓ Cancel anytime</span>
              <span>✓ 30-day money-back guarantee</span>
              <span>✓ Your data stays private</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Voice Mode Highlight */}
      <motion.section 
        className="py-20 px-6"
        style={{ backgroundColor: colors.lavender[50] }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ backgroundColor: colors.lavender[200] }}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            viewport={{ once: true }}
            animate={{ 
              boxShadow: [
                `0 0 0 0 ${colors.lavender[200]}40`,
                `0 0 0 20px ${colors.lavender[200]}00`
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                type: "keyframes"
              }
            }}
          >
            <Volume2 size={36} style={{ color: colors.lavender[700] }} />
          </motion.div>

          <motion.h2 
            className="text-4xl font-bold mb-6"
            style={{ color: textColors.primary }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Talk Naturally with Voice Mode
          </motion.h2>

          <motion.p 
            className="text-xl mb-6"
            style={{ color: textColors.secondary }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Have real conversations with Serenity using your voice. No typing required.
          </motion.p>

          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: colors.lavender[200],
              color: colors.lavender[700]
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles size={16} />
            <span>Beta • Seamless voice mode coming soon</span>
          </motion.div>

          {/* Privacy & Security Note */}
          <motion.div
            className="mt-12 flex items-center justify-center gap-2 text-sm"
            style={{ color: textColors.muted }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <Shield size={16} />
            <span>100% Private & Secure • Your conversations stay confidential</span>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section 
        className="py-20 px-6 text-center"
        style={{ 
          background: `linear-gradient(135deg, ${colors.sage[100]}, ${colors.primary[100]})`
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: textColors.primary }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Ready to Feel Understood?
          </motion.h2>

          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto"
            style={{ color: textColors.secondary }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Join thousands who've found their perfect AI companion. Start your journey to better mental wellness today.
          </motion.p>

          <motion.button
            onClick={onGetStarted}
            className="px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 relative overflow-hidden group"
            style={{ 
              backgroundColor: colors.sage[200],
              color: colors.sage[700]
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: colors.sage[300]
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center gap-3">
              <Heart size={24} />
              Start Your Journey with Serenity
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={24} />
              </motion.div>
            </span>
            
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 3 
              }}
            />
          </motion.button>

          <motion.p 
            className="text-sm mt-6"
            style={{ color: textColors.muted }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Free to start • No credit card required • Your data stays private
          </motion.p>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="py-12 px-6 text-center border-t"
        style={{ 
          backgroundColor: colors.neutral[50],
          borderTopColor: colors.neutral[200]
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="flex items-center justify-center gap-2 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.sage[200] }}
            >
              <Heart size={16} style={{ color: colors.sage[700] }} />
            </div>
            <span className="text-xl font-bold" style={{ color: textColors.primary }}>
              Serenity
            </span>
          </motion.div>
          
          <p style={{ color: textColors.muted }}>
            Your AI therapy companion • Built with 💙 for mental wellness
          </p>
          
          <motion.p 
            className="text-xs mt-4"
            style={{ color: textColors.muted }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Powered by advanced AI • Secured by Supabase • Designed for you
          </motion.p>
        </div>
      </motion.footer>
    </div>
  );
}