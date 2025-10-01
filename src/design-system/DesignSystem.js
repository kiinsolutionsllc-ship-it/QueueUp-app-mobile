import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced Design Tokens with Accessibility Focus
export const designTokens = {
  // Spacing Scale (8px base)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Typography Scale with Accessibility Considerations
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      base: 16, // Minimum readable size
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    fontWeights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5, // Recommended for accessibility
      relaxed: 1.75,
    },
    // Accessibility-focused typography
    accessible: {
      minFontSize: 16, // Minimum for WCAG AA
      minLineHeight: 1.5, // Minimum for readability
      maxLineLength: 75, // Characters per line for optimal reading
    },
  },
  
  // Border Radius Scale
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  // Enhanced Shadow Scale with Theme Awareness
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Accessibility Tokens
  accessibility: {
    minTouchTarget: 44, // Minimum touch target size (iOS/Android guidelines)
    minContrastRatio: 4.5, // WCAG AA standard
    maxContrastRatio: 7.0, // WCAG AAA standard
    focusRingWidth: 2,
    focusRingOffset: 2,
  },
  
  // Animation Tokens
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeOut: 'ease-out',
      easeIn: 'ease-in',
    },
  },
};

// Responsive Hook
export const useResponsive = () => {
  const getBreakpoint = () => {
    if (screenWidth >= designTokens.breakpoints.xl) return 'xl';
    if (screenWidth >= designTokens.breakpoints.lg) return 'lg';
    if (screenWidth >= designTokens.breakpoints.md) return 'md';
    return 'sm';
  };

  const isMobile = screenWidth < designTokens.breakpoints.md;
  const isTablet = screenWidth >= designTokens.breakpoints.md && screenWidth < designTokens.breakpoints.lg;
  const isDesktop = screenWidth >= designTokens.breakpoints.lg;

  return {
    breakpoint: getBreakpoint(),
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
  };
};

// Enhanced Typography Components
export const Typography = {
  H1: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <Text
        style={[
          styles.h1,
          { color: theme.text },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  },
  
  H2: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <Text
        style={[
          styles.h2,
          { color: theme.text },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  },
  
  H3: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <Text
        style={[
          styles.h3,
          { color: theme.text },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  },
  
  Body: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <Text
        style={[
          styles.body,
          { color: theme.text },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  },
  
  Caption: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <Text
        style={[
          styles.caption,
          { color: theme.textSecondary },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  },
  
  Label: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <Text
        style={[
          styles.label,
          { color: theme.text },
          style,
        ]}
        {...props}
      >
        {children}
      </Text>
    );
  },
};

// Enhanced Layout Components
export const Layout = {
  Container: ({ children, style, padding = 'md', ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            padding: designTokens.spacing[padding],
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  },
  
  Row: ({ children, style, spacing = 'md', align = 'center', justify = 'flex-start', ...props }) => {
    return (
      <View
        style={[
          styles.row,
          {
            alignItems: align,
            justifyContent: justify,
            gap: designTokens.spacing[spacing],
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  },
  
  Column: ({ children, style, spacing = 'md', align = 'stretch', ...props }) => {
    return (
      <View
        style={[
          styles.column,
          {
            alignItems: align,
            gap: designTokens.spacing[spacing],
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  },
  
  Grid: ({ children, columns = 2, style, spacing = 'md', ...props }) => {
    const { isMobile } = useResponsive();
    const actualColumns = isMobile ? 1 : columns;
    
    return (
      <View
        style={[
          styles.grid,
          {
            gap: designTokens.spacing[spacing],
          },
          style,
        ]}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <View
            key={index}
            style={[
              styles.gridItem,
              {
                flex: 1 / actualColumns,
                minWidth: `${100 / actualColumns}%`,
              },
            ]}
          >
            {child}
          </View>
        ))}
      </View>
    );
  },
  
  Spacer: ({ size = 'md', ...props }) => {
    return (
      <View
        style={[
          styles.spacer,
          {
            height: designTokens.spacing[size],
          },
        ]}
        {...props}
      />
    );
  },
  
  Divider: ({ style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          styles.divider,
          {
            backgroundColor: theme.divider,
          },
          style,
        ]}
        {...props}
      />
    );
  },
};

// Enhanced Card Components
export const Card = {
  Base: ({ children, style, padding = 'md', shadow = 'base', ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            padding: designTokens.spacing[padding],
            borderRadius: designTokens.borderRadius.lg,
            ...designTokens.shadows[shadow],
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  },
  
  Header: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          styles.cardHeader,
          {
            borderBottomColor: theme.divider,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  },
  
  Body: ({ children, style, ...props }) => {
    return (
      <View
        style={[styles.cardBody, style]}
        {...props}
      >
        {children}
      </View>
    );
  },
  
  Footer: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          styles.cardFooter,
          {
            borderTopColor: theme.divider,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  },
};

// Enhanced Button Components with Accessibility
export const Button = {
  Primary: ({ children, style, size = 'md', disabled = false, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          styles.button,
          styles.buttonPrimary,
          {
            backgroundColor: disabled ? theme.textDisabled : theme.primary,
            paddingVertical: designTokens.spacing[size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'],
            paddingHorizontal: designTokens.spacing[size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg'],
            borderRadius: designTokens.borderRadius[size === 'sm' ? 'sm' : 'base'],
            minHeight: designTokens.accessibility.minTouchTarget,
          },
          style,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        {...props}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: disabled ? theme.textLight : theme.onPrimary,
              fontSize: designTokens.typography.fontSizes[size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base'],
            },
          ]}
        >
          {children}
        </Text>
      </View>
    );
  },
  
  Secondary: ({ children, style, size = 'md', disabled = false, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          styles.button,
          styles.buttonSecondary,
          {
            backgroundColor: 'transparent',
            borderColor: disabled ? theme.textDisabled : theme.primary,
            borderWidth: 1,
            paddingVertical: designTokens.spacing[size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'],
            paddingHorizontal: designTokens.spacing[size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg'],
            borderRadius: designTokens.borderRadius[size === 'sm' ? 'sm' : 'base'],
            minHeight: designTokens.accessibility.minTouchTarget,
          },
          style,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        {...props}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: disabled ? theme.textDisabled : theme.primary,
              fontSize: designTokens.typography.fontSizes[size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base'],
            },
          ]}
        >
          {children}
        </Text>
      </View>
    );
  },
  
  Ghost: ({ children, style, size = 'md', disabled = false, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          styles.button,
          styles.buttonGhost,
          {
            backgroundColor: 'transparent',
            paddingVertical: designTokens.spacing[size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'],
            paddingHorizontal: designTokens.spacing[size === 'sm' ? 'md' : size === 'lg' ? 'xl' : 'lg'],
            borderRadius: designTokens.borderRadius[size === 'sm' ? 'sm' : 'base'],
            minHeight: designTokens.accessibility.minTouchTarget,
          },
          style,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        {...props}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: disabled ? theme.textDisabled : theme.text,
              fontSize: designTokens.typography.fontSizes[size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'base'],
            },
          ]}
        >
          {children}
        </Text>
      </View>
    );
  },
};

// Status Badge Component with Semantic Colors
export const StatusBadge = ({ status, children, style, ...props }) => {
  const { getStatusColor } = useTheme();
  const statusColor = getStatusColor(status);
  
  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: statusColor + '20', // 20% opacity
          borderColor: statusColor,
          borderWidth: 1,
          borderRadius: designTokens.borderRadius.full,
          paddingVertical: designTokens.spacing.xs,
          paddingHorizontal: designTokens.spacing.sm,
          minHeight: designTokens.accessibility.minTouchTarget,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${status}`}
      {...props}
    >
      <Text
        style={[
          styles.statusText,
          {
            color: statusColor,
            fontSize: designTokens.typography.fontSizes.sm,
            fontWeight: designTokens.typography.fontWeights.medium,
          },
        ]}
      >
        {children || status?.replace('_', ' ').toUpperCase()}
      </Text>
    </View>
  );
};

// Semantic Color Components
export const SemanticColors = {
  Success: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          {
            backgroundColor: theme.success + '10',
            borderColor: theme.success,
            borderWidth: 1,
            borderRadius: designTokens.borderRadius.base,
            padding: designTokens.spacing.md,
          },
          style,
        ]}
        {...props}
      >
        <Text
          style={[
            {
              color: theme.success,
              fontSize: designTokens.typography.fontSizes.base,
              fontWeight: designTokens.typography.fontWeights.medium,
            },
          ]}
        >
          {children}
        </Text>
      </View>
    );
  },
  
  Warning: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          {
            backgroundColor: theme.warning + '10',
            borderColor: theme.warning,
            borderWidth: 1,
            borderRadius: designTokens.borderRadius.base,
            padding: designTokens.spacing.md,
          },
          style,
        ]}
        {...props}
      >
        <Text
          style={[
            {
              color: theme.warning,
              fontSize: designTokens.typography.fontSizes.base,
              fontWeight: designTokens.typography.fontWeights.medium,
            },
          ]}
        >
          {children}
        </Text>
      </View>
    );
  },
  
  Error: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          {
            backgroundColor: theme.error + '10',
            borderColor: theme.error,
            borderWidth: 1,
            borderRadius: designTokens.borderRadius.base,
            padding: designTokens.spacing.md,
          },
          style,
        ]}
        {...props}
      >
        <Text
          style={[
            {
              color: theme.error,
              fontSize: designTokens.typography.fontSizes.base,
              fontWeight: designTokens.typography.fontWeights.medium,
            },
          ]}
        >
          {children}
        </Text>
      </View>
    );
  },
  
  Info: ({ children, style, ...props }) => {
    const { getCurrentTheme } = useTheme();
    const theme = getCurrentTheme();
    
    return (
      <View
        style={[
          {
            backgroundColor: theme.info + '10',
            borderColor: theme.info,
            borderWidth: 1,
            borderRadius: designTokens.borderRadius.base,
            padding: designTokens.spacing.md,
          },
          style,
        ]}
        {...props}
      >
        <Text
          style={[
            {
              color: theme.info,
              fontSize: designTokens.typography.fontSizes.base,
              fontWeight: designTokens.typography.fontWeights.medium,
            },
          ]}
        >
          {children}
        </Text>
      </View>
    );
  },
};

const styles = StyleSheet.create({
  // Typography Styles
  h1: {
    fontSize: designTokens.typography.fontSizes['4xl'],
    fontWeight: designTokens.typography.fontWeights.bold,
    lineHeight: designTokens.typography.lineHeights.tight * designTokens.typography.fontSizes['4xl'],
  },
  h2: {
    fontSize: designTokens.typography.fontSizes['3xl'],
    fontWeight: designTokens.typography.fontWeights.bold,
    lineHeight: designTokens.typography.lineHeights.tight * designTokens.typography.fontSizes['3xl'],
  },
  h3: {
    fontSize: designTokens.typography.fontSizes['2xl'],
    fontWeight: designTokens.typography.fontWeights.semibold,
    lineHeight: designTokens.typography.lineHeights.tight * designTokens.typography.fontSizes['2xl'],
  },
  body: {
    fontSize: designTokens.typography.fontSizes.base,
    fontWeight: designTokens.typography.fontWeights.normal,
    lineHeight: designTokens.typography.lineHeights.normal * designTokens.typography.fontSizes.base,
  },
  caption: {
    fontSize: designTokens.typography.fontSizes.sm,
    fontWeight: designTokens.typography.fontWeights.normal,
    lineHeight: designTokens.typography.lineHeights.normal * designTokens.typography.fontSizes.sm,
  },
  label: {
    fontSize: designTokens.typography.fontSizes.sm,
    fontWeight: designTokens.typography.fontWeights.medium,
    lineHeight: designTokens.typography.lineHeights.normal * designTokens.typography.fontSizes.sm,
  },
  
  // Layout Styles
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    flex: 1,
  },
  spacer: {
    width: '100%',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  
  // Card Styles
  card: {
    marginVertical: designTokens.spacing.sm,
  },
  cardHeader: {
    paddingBottom: designTokens.spacing.md,
    borderBottomWidth: 1,
    marginBottom: designTokens.spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  cardFooter: {
    paddingTop: designTokens.spacing.md,
    borderTopWidth: 1,
    marginTop: designTokens.spacing.md,
  },
  
  // Button Styles
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: designTokens.borderRadius.base,
  },
  buttonPrimary: {
    // Primary button styles
  },
  buttonSecondary: {
    // Secondary button styles
  },
  buttonGhost: {
    // Ghost button styles
  },
  buttonText: {
    fontWeight: designTokens.typography.fontWeights.medium,
    textAlign: 'center',
  },
  
  // Status Badge Styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    textAlign: 'center',
  },
});

export default {
  designTokens,
  useResponsive,
  Typography,
  Layout,
  Card,
  Button,
  StatusBadge,
  SemanticColors,
};
