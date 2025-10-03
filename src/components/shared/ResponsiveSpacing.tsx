import React from 'react';
import { View, ViewStyle, ViewProps } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';

// Type definitions
interface ResponsiveSpacingProps extends ViewProps {
  size?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  direction?: 'vertical' | 'horizontal';
  style?: ViewStyle;
}

interface ResponsiveContainerProps extends ViewProps {
  children: React.ReactNode;
  padding?: 'none' | 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  margin?: 'none' | 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  maxWidth?: number;
  center?: boolean;
  style?: ViewStyle;
}

interface ResponsivePaddingProps extends ViewProps {
  children: React.ReactNode;
  all?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  horizontal?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  vertical?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  top?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  bottom?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  left?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  right?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  style?: ViewStyle;
}

interface ResponsiveMarginProps extends ViewProps {
  children: React.ReactNode;
  all?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  horizontal?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  vertical?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  top?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  bottom?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  left?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  right?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl' | number;
  style?: ViewStyle;
}

// Responsive spacing component
const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  size = 'medium',
  direction = 'vertical',
  style,
  ...props
}) => {
  const responsive = useResponsive();
  
  // Spacing sizes
  const spacingSizes = {
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
    xxl: 48
  };
  
  const baseSpacing = spacingSizes[size] || spacingSizes.medium;
  const scaledSpacing = responsive.getSpacing(baseSpacing);
  
  const spacingStyle = direction === 'horizontal' 
    ? { width: scaledSpacing }
    : { height: scaledSpacing };
  
  return (
    <View
      style={[spacingStyle, style]}
      {...props}
    />
  );
};

// Predefined spacing components
export const SpacingXS: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="xs" {...props} />;
export const SpacingSmall: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="small" {...props} />;
export const SpacingMedium: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="medium" {...props} />;
export const SpacingLarge: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="large" {...props} />;
export const SpacingXL: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="xl" {...props} />;
export const SpacingXXL: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="xxl" {...props} />;

// Horizontal spacing
export const SpacingHorizontalXS: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="xs" direction="horizontal" {...props} />;
export const SpacingHorizontalSmall: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="small" direction="horizontal" {...props} />;
export const SpacingHorizontalMedium: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="medium" direction="horizontal" {...props} />;
export const SpacingHorizontalLarge: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="large" direction="horizontal" {...props} />;
export const SpacingHorizontalXL: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="xl" direction="horizontal" {...props} />;
export const SpacingHorizontalXXL: React.FC<ResponsiveSpacingProps> = (props) => <ResponsiveSpacing size="xxl" direction="horizontal" {...props} />;

// Responsive container
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  padding = 'medium',
  margin = 'none',
  maxWidth,
  center = false,
  style,
  ...props
}) => {
  const responsive = useResponsive();
  
  const spacingSizes = {
    none: 0,
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
    xxl: 48
  };
  
  const paddingSize = typeof padding === 'string' ? spacingSizes[padding] : padding;
  const marginSize = typeof margin === 'string' ? spacingSizes[margin] : margin;
  
  const scaledPadding = responsive.getSpacing(paddingSize);
  const scaledMargin = responsive.getSpacing(marginSize);
  
  const containerStyle: ViewStyle = {
    padding: scaledPadding,
    margin: scaledMargin,
    maxWidth: maxWidth || (responsive.isTablet ? responsive.screenWidth * 0.9 : undefined),
    alignSelf: center ? 'center' : 'stretch'
  };
  
  return (
    <View
      style={[containerStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
};

// Responsive padding
export const ResponsivePadding: React.FC<ResponsivePaddingProps> = ({
  children,
  all,
  horizontal,
  vertical,
  top,
  bottom,
  left,
  right,
  style,
  ...props
}) => {
  const responsive = useResponsive();
  
  const getSpacing = (value?: string | number): number => {
    if (typeof value === 'string') {
      const spacingSizes = {
        xs: 4,
        small: 8,
        medium: 16,
        large: 24,
        xl: 32,
        xxl: 48
      };
      return responsive.getSpacing(spacingSizes[value as keyof typeof spacingSizes] || 16);
    }
    return responsive.getSpacing(value || 16);
  };
  
  const paddingStyle: ViewStyle = {
    paddingTop: getSpacing(top || vertical || all),
    paddingBottom: getSpacing(bottom || vertical || all),
    paddingLeft: getSpacing(left || horizontal || all),
    paddingRight: getSpacing(right || horizontal || all)
  };
  
  return (
    <View
      style={[paddingStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
};

// Responsive margin
export const ResponsiveMargin: React.FC<ResponsiveMarginProps> = ({
  children,
  all,
  horizontal,
  vertical,
  top,
  bottom,
  left,
  right,
  style,
  ...props
}) => {
  const responsive = useResponsive();
  
  const getSpacing = (value?: string | number): number => {
    if (typeof value === 'string') {
      const spacingSizes = {
        xs: 4,
        small: 8,
        medium: 16,
        large: 24,
        xl: 32,
        xxl: 48
      };
      return responsive.getSpacing(spacingSizes[value as keyof typeof spacingSizes] || 16);
    }
    return responsive.getSpacing(value || 16);
  };
  
  const marginStyle: ViewStyle = {
    marginTop: getSpacing(top || vertical || all),
    marginBottom: getSpacing(bottom || vertical || all),
    marginLeft: getSpacing(left || horizontal || all),
    marginRight: getSpacing(right || horizontal || all)
  };
  
  return (
    <View
      style={[marginStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
};

export default ResponsiveSpacing;
