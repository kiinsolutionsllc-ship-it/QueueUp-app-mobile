import { ReactNode } from 'react';
import { ViewStyle, TextStyle } from 'react-native';

export interface MaterialButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string | ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: ReactNode;
  hapticFeedback?: boolean;
  hapticType?: 'buttonPress' | 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy';
  [key: string]: any; // For additional props
}

export interface MaterialTextInputProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  success?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  type?: string;
  onPress?: () => void;
  min?: number;
  max?: number;
  step?: number;
  [key: string]: any; // For additional props
}

export interface MaterialIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle | TextStyle;
  onPress?: () => void;
  [key: string]: any; // For additional props
}

export interface ValidatedFormProps {
  initialValues?: Record<string, any>;
  validationRules?: Record<string, any>;
  onSubmit: (values: any) => void;
  submitButtonText?: string;
  submitButtonVariant?: string;
  submitButtonSize?: string;
  children: (props: {
    MaterialTextInput: any;
    values: any;
    errors: any;
    touched: any;
  }) => ReactNode;
  showValidationErrors?: boolean;
  style?: ViewStyle;
  [key: string]: any; // For additional props
}

export interface CalendarWidgetProps {
  selectedDate?: Date | any;
  selectedDates?: any[];
  onDateSelect?: (date: Date | any) => void;
  onDateRangeSelect?: (dates: any) => void;
  showDateRange?: boolean;
  minDate?: Date;
  maxDate?: Date;
  style?: ViewStyle;
  isDateAvailable?: (date: any) => boolean;
  [key: string]: any; // For additional props
}

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightActions?: ReactNode[];
  showNotifications?: boolean;
  onNotificationPress?: () => void;
  showProfile?: boolean;
  onProfilePress?: () => void;
  user?: any;
  showGreeting?: boolean;
  showStatusBar?: boolean;
  showBackButton?: boolean;
  [key: string]: any; // For additional props
}

export interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'sm' | 'base' | 'md' | 'lg';
  onPress?: () => void;
  disabled?: boolean;
  haptic?: boolean;
  [key: string]: any; // For additional props
}


