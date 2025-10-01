import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { useTheme } from '../../contexts/ThemeContext';

const ResponsiveText = ({
  children,
  variant = 'body1',
  color,
  style,
  numberOfLines,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  // Typography variants with responsive scaling
  const typographyVariants = {
    h1: {
      fontSize: responsive.getFontSize(32),
      fontWeight: 'bold',
      lineHeight: responsive.getFontSize(40),
    },
    h2: {
      fontSize: responsive.getFontSize(28),
      fontWeight: 'bold',
      lineHeight: responsive.getFontSize(36),
    },
    h3: {
      fontSize: responsive.getFontSize(24),
      fontWeight: '600',
      lineHeight: responsive.getFontSize(32),
    },
    h4: {
      fontSize: responsive.getFontSize(20),
      fontWeight: '600',
      lineHeight: responsive.getFontSize(28),
    },
    h5: {
      fontSize: responsive.getFontSize(18),
      fontWeight: '600',
      lineHeight: responsive.getFontSize(24),
    },
    h6: {
      fontSize: responsive.getFontSize(16),
      fontWeight: '600',
      lineHeight: responsive.getFontSize(22),
    },
    subtitle1: {
      fontSize: responsive.getFontSize(16),
      fontWeight: '500',
      lineHeight: responsive.getFontSize(24),
    },
    subtitle2: {
      fontSize: responsive.getFontSize(14),
      fontWeight: '500',
      lineHeight: responsive.getFontSize(20),
    },
    body1: {
      fontSize: responsive.getFontSize(16),
      fontWeight: '400',
      lineHeight: responsive.getFontSize(24),
    },
    body2: {
      fontSize: responsive.getFontSize(14),
      fontWeight: '400',
      lineHeight: responsive.getFontSize(20),
    },
    caption: {
      fontSize: responsive.getFontSize(12),
      fontWeight: '400',
      lineHeight: responsive.getFontSize(16),
    },
    overline: {
      fontSize: responsive.getFontSize(10),
      fontWeight: '500',
      lineHeight: responsive.getFontSize(16),
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    button: {
      fontSize: responsive.getFontSize(14),
      fontWeight: '500',
      lineHeight: responsive.getFontSize(20),
      textTransform: 'uppercase',
      letterSpacing: 1.25,
    },
  };

  const variantStyle = typographyVariants[variant] || typographyVariants.body1;

  return (
    <Text
      style={[
        styles.base,
        variantStyle,
        {
          color: color || theme.text,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

// Specialized text components
export const Heading1 = (props) => <ResponsiveText variant="h1" {...props} />;
export const Heading2 = (props) => <ResponsiveText variant="h2" {...props} />;
export const Heading3 = (props) => <ResponsiveText variant="h3" {...props} />;
export const Heading4 = (props) => <ResponsiveText variant="h4" {...props} />;
export const Heading5 = (props) => <ResponsiveText variant="h5" {...props} />;
export const Heading6 = (props) => <ResponsiveText variant="h6" {...props} />;

export const Subtitle1 = (props) => <ResponsiveText variant="subtitle1" {...props} />;
export const Subtitle2 = (props) => <ResponsiveText variant="subtitle2" {...props} />;

export const Body1 = (props) => <ResponsiveText variant="body1" {...props} />;
export const Body2 = (props) => <ResponsiveText variant="body2" {...props} />;

export const Caption = (props) => <ResponsiveText variant="caption" {...props} />;
export const Overline = (props) => <ResponsiveText variant="overline" {...props} />;
export const ButtonText = (props) => <ResponsiveText variant="button" {...props} />;

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
});

export default ResponsiveText;
