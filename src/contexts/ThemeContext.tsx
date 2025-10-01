import * as React from 'react';
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Light Theme Only - Simplified Theme interface
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
  onAccent: string;
  
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
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  isDark?: boolean;
}

export interface ThemeContextType {
  isThemeLoaded: boolean;
  getCurrentTheme: (userType?: 'customer' | 'mechanic') => Theme;
  isDarkMode: () => boolean;
  getStatusColor: (status: string) => string;
  getSemanticColor: (type: string) => string;
}

// Light Theme Only - No theme switching
const lightTheme: Theme = {
  // Primary Brand Colors
  primary: '#DC2626', // Red for mechanics, will be overridden for customers
  primaryVariant: '#B91C1C',
  primaryLight: '#EF4444',
  primaryDark: '#991B1B',
  
  // Secondary Colors
  secondary: '#7C3AED',
  secondaryVariant: '#6D28D9',
  secondaryLight: '#8B5CF6',
  secondaryDark: '#5B21B6',
  
  // Accent Colors
  accent: '#DC2626',
  accentLight: '#EF4444',
  accentDark: '#991B1B',
  
  // Surface Colors
  background: '#F0F0F0',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  cardBackground: '#FFFFFF',
  navigationBackground: '#F8FAFC',
  
  // Text Colors
  text: '#333333',
  textPrimary: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  textDisabled: '#CCCCCC',
  buttonText: '#FFFFFF',
  
  // Semantic Colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',
  
  warning: '#EAB308',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  
  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',
  
  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  
  // Status Colors
  completed: '#10B981',
  pending: '#EAB308',
  cancelled: '#EF4444',
  inProgress: '#3B82F6',
  scheduled: '#7C3AED',
  
  // Interactive Elements
  onPrimary: '#FFFFFF',
  onSecondary: '#FFFFFF',
  onBackground: '#333333',
  onSurface: '#333333',
  onError: '#FFFFFF',
  onSuccess: '#FFFFFF',
  onWarning: '#FFFFFF',
  onInfo: '#FFFFFF',
  onAccent: '#FFFFFF',
  
  // Dividers and Borders
  divider: '#E0E0E0',
  border: '#E0E0E0',
  borderLight: '#E0E0E0',
  borderDark: '#CCCCCC',
  
  // Special Colors
  orange: '#F59E0B',
  orangeLight: '#FBBF24',
  orangeDark: '#D97706',
  
  // Shadows and Elevation
  cardShadow: '#000000',
  elevation: {
    level0: 'transparent',
    level1: 'rgba(15, 23, 42, 0.05)',
    level2: 'rgba(15, 23, 42, 0.08)',
    level3: 'rgba(15, 23, 42, 0.12)',
    level4: 'rgba(15, 23, 42, 0.16)',
    level5: 'rgba(15, 23, 42, 0.20)',
  },
  
  // Avatar and Special Backgrounds
  avatarBackground: '#F1F5F9',
  
  // Progress Colors
  progressGreen: '#10B981',
  progressRed: '#EF4444',
  progressYellow: '#EAB308',
  progressBlue: '#3B82F6',
  statusBarStyle: 'dark-content' as const,
  isDark: false,
};

const ThemeContext = createContext<ThemeContextType>({
  isThemeLoaded: true,
  getCurrentTheme: () => lightTheme,
  isDarkMode: () => false,
  getStatusColor: () => '#666666',
  getSemanticColor: () => '#666666',
});

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { userType } = useAuth();

  const getCurrentTheme = (providedUserType?: 'customer' | 'mechanic'): Theme => {
    // Use provided userType or fall back to context userType
    const effectiveUserType = providedUserType || userType;
    
    // Create a copy of the light theme
    const themeWithUserColors = { ...lightTheme };
    
    if (effectiveUserType === 'customer') {
      // Customer app uses yellow colors
      themeWithUserColors.primary = '#EAB308';
      themeWithUserColors.primaryVariant = '#f39c12';
      themeWithUserColors.primaryLight = '#fdd835';
      themeWithUserColors.primaryDark = '#e67e22';
      themeWithUserColors.accent = '#EAB308';
      themeWithUserColors.accentLight = '#fdd835';
      themeWithUserColors.accentDark = '#e67e22';
      themeWithUserColors.avatarBackground = '#fdd835';
    } else if (effectiveUserType === 'mechanic') {
      // Mechanic app uses red colors (already set in lightTheme)
      // No changes needed as red is already the default
    }
    
    return themeWithUserColors;
  };

  const isDarkMode = (): boolean => {
    return false; // Always light mode
  };

  // Color utility functions
  const getStatusColor = (status: string): string => {
    const theme = getCurrentTheme();
    switch (status) {
      case 'completed':
        return theme.completed;
      case 'pending':
        return theme.pending;
      case 'cancelled':
        return theme.cancelled;
      case 'in_progress':
        return theme.inProgress;
      case 'scheduled':
        return theme.scheduled;
      default:
        return theme.textSecondary;
    }
  };

  const getSemanticColor = (type: string): string => {
    const theme = getCurrentTheme();
    switch (type) {
      case 'success':
        return theme.success;
      case 'warning':
        return theme.warning;
      case 'error':
        return theme.error;
      case 'info':
        return theme.info;
      default:
        return theme.textSecondary;
    }
  };

  const value: ThemeContextType = {
    isThemeLoaded: true, // Always loaded since we only have one theme
    getCurrentTheme,
    isDarkMode,
    getStatusColor,
    getSemanticColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
