export interface Theme {
  // Primary Brand Colors
  primary: string;
  primaryVariant: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary Colors
  secondary: string;
  secondaryVariant: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Accent Colors
  accent: string;
  accentLight: string;
  accentDark: string;
  
  // Surface Colors
  background: string;
  surface: string;
  surfaceVariant: string;
  cardBackground: string;
  navigationBackground: string;
  
  // Text Colors
  text: string;
  textPrimary: string;
  textSecondary: string;
  textLight: string;
  textDisabled: string;
  buttonText: string;
  
  // Semantic Colors
  success: string;
  successLight: string;
  successDark: string;
  
  warning: string;
  warningLight: string;
  warningDark: string;
  
  error: string;
  errorLight: string;
  errorDark: string;
  
  info: string;
  infoLight: string;
  infoDark: string;
  
  // Status Colors
  completed: string;
  pending: string;
  cancelled: string;
  inProgress: string;
  scheduled: string;
  
  // Interactive Elements
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onError: string;
  onSuccess: string;
  onWarning: string;
  onInfo: string;
  
  // Dividers and Borders
  divider: string;
  border: string;
  borderLight: string;
  borderDark: string;
  
  // Special Colors
  orange: string;
  orangeLight: string;
  orangeDark: string;
  
  // Shadows and Elevation
  cardShadow: string;
  elevation: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
  };
  
  // Avatar and Special Backgrounds
  avatarBackground: string;
  
  // Progress Colors
  progressGreen: string;
  progressRed: string;
  progressYellow: string;
  progressBlue: string;
  
  // Additional properties
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  isDark?: boolean;
  [key: string]: any; // For additional properties
}

export interface ThemeContextType {
  isThemeLoaded: boolean;
  getCurrentTheme: (userType?: 'customer' | 'mechanic') => Theme;
  isDarkMode: () => boolean;
  getStatusColor: (status: string) => string;
  getSemanticColor: (type: string) => string;
}


