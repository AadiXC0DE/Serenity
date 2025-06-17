/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Pastel Primary Colors
        primary: {
          50: '#FFF8F8',   // Lightest muted pink
          100: '#FFE4E1',  // Main muted pink
          200: '#FFCCCB',  // Slightly deeper pink
          300: '#FFB3B3',  // Medium pink
          400: '#FF9999',  // Deeper pink
          500: '#FF8080',  // Strong pink
          600: '#FF6666',  // Bold pink
          700: '#FF4D4D',  // Deep pink
          800: '#FF3333',  // Very deep pink
          900: '#FF1A1A'   // Darkest pink
        },
        
        // Sage Green Palette
        sage: {
          50: '#F8FBF8',   // Lightest sage
          100: '#E0EEE0',  // Main sage green
          200: '#C8E6C8',  // Light sage
          300: '#B0DEB0',  // Medium sage
          400: '#98D698',  // Deeper sage
          500: '#80CE80',  // Strong sage
          600: '#68C668',  // Bold sage
          700: '#50BE50',  // Deep sage
          800: '#38B638',  // Very deep sage
          900: '#20AE20'   // Darkest sage
        },
        
        // Lavender Palette
        lavender: {
          50: '#FAFAFA',   // Lightest lavender
          100: '#E6E6FA',  // Main lavender
          200: '#DCDCF7',  // Light lavender
          300: '#D2D2F4',  // Medium lavender
          400: '#C8C8F1',  // Deeper lavender
          500: '#BEBEBE',  // Strong lavender
          600: '#B4B4EB',  // Bold lavender
          700: '#AAAAEB',  // Deep lavender
          800: '#A0A0E5',  // Very deep lavender
          900: '#9696DF'   // Darkest lavender
        },
        
        // Accent Colors
        accent: {
          peach: '#FFDBCC',    // Soft peach
          mint: '#D4F4DD',     // Soft mint
          cream: '#FFF8DC',    // Warm cream
          blush: '#F8E8E8',    // Soft blush
          sky: '#E8F4FD'       // Soft sky blue
        }
      },
      
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
      },
      
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      fontFamily: {
        'system': [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
      },
    },
  },
  plugins: [],
};