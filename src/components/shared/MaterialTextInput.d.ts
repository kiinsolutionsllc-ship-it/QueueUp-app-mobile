import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';

export interface MaterialTextInputProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string | null;
  error?: string;
  helperText?: string | null;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
  success?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: (() => void) | null;
  maxLength?: number;
  editable?: boolean;
  autoFocus?: boolean;
}

declare const MaterialTextInput: React.FC<MaterialTextInputProps>;
export default MaterialTextInput;
