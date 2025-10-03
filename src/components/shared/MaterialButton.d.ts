import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';

export interface MaterialButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  leftIcon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  textColor?: string;
  children?: React.ReactNode;
  hapticFeedback?: boolean;
  hapticType?: string;
}

declare const MaterialButton: React.FC<MaterialButtonProps>;
export default MaterialButton;
