// Comprehensive Pastel Color System
export const colors = {
  // Primary Pastel Colors
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
  
  // Neutral Grays with Warm Undertones
  neutral: {
    50: '#FEFEFE',   // Pure white
    100: '#F9F9F9',  // Off white
    200: '#F0F0F0',  // Light gray (for borders)
    300: '#E5E5E5',  // Medium light gray
    400: '#D4D4D4',  // Medium gray
    500: '#A3A3A3',  // True gray
    600: '#737373',  // Dark gray
    700: '#525252',  // Darker gray
    800: '#404040',  // Very dark gray
    900: '#262626'   // Almost black
  },
  
  // Accent Colors
  accent: {
    peach: '#FFDBCC',    // Soft peach
    mint: '#D4F4DD',     // Soft mint
    cream: '#FFF8DC',    // Warm cream
    blush: '#F8E8E8',    // Soft blush
    sky: '#E8F4FD'       // Soft sky blue
  },
  
  // Status Colors (Pastel Versions)
  status: {
    success: '#D4F4DD',  // Soft green
    warning: '#FFF3CD',  // Soft yellow
    error: '#F8D7DA',    // Soft red
    info: '#D1ECF1'      // Soft blue
  }
};

// WCAG AA Compliant Text Colors
export const textColors = {
  primary: '#2D3748',      // Dark gray for primary text
  secondary: '#4A5568',    // Medium gray for secondary text
  muted: '#718096',        // Light gray for muted text
  inverse: '#FFFFFF',      // White for dark backgrounds
  accent: '#553C9A'        // Purple for accent text
};

// Semantic Color Mappings
export const semanticColors = {
  background: {
    primary: colors.neutral[50],
    secondary: colors.neutral[100],
    tertiary: colors.primary[50]
  },
  surface: {
    primary: colors.neutral[50],
    secondary: colors.neutral[100],
    elevated: colors.neutral[50]
  },
  border: {
    light: colors.neutral[200],
    medium: colors.neutral[300],
    strong: colors.neutral[400]
  }
};