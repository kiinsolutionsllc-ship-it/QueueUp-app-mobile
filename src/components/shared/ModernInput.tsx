import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  Animated, 
  StyleSheet,
  TextInputProps 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../types/JobTypes';

interface ModernInputProps extends TextInputProps {
  label: string;
  theme: Theme;
  error?: string;
  success?: string;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
}

const ModernInput: React.FC<ModernInputProps> = ({
  label,
  theme,
  error,
  success,
  icon,
  rightIcon,
  onRightIconPress,
  variant = 'outlined',
  size = 'medium',
  disabled = false,
  required = false,
  helperText,
  value,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(!!value);
  
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || isFilled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    Animated.timing(iconAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isFocused, isFilled, labelAnim, borderAnim, iconAnim]);

  useEffect(() => {
    setIsFilled(!!value);
  }, [value]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'outlined':
        return {
          borderWidth: 2,
          borderColor: error 
            ? theme.error 
            : success 
              ? theme.success 
              : isFocused 
                ? theme.primary 
                : theme.border + '60',
          backgroundColor: 'transparent',
        };
      case 'filled':
        return {
          borderWidth: 0,
          backgroundColor: theme.surface,
          borderBottomWidth: 2,
          borderBottomColor: error 
            ? theme.error 
            : success 
              ? theme.success 
              : isFocused 
                ? theme.primary 
                : theme.border + '60',
        };
      default:
        return {
          borderWidth: 1,
          borderColor: error 
            ? theme.error 
            : success 
              ? theme.success 
              : theme.border + '40',
          backgroundColor: theme.surface,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          height: 40,
          paddingHorizontal: 12,
          fontSize: 14,
        };
      case 'medium':
        return {
          height: 48,
          paddingHorizontal: 16,
          fontSize: 16,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: 20,
          fontSize: 18,
        };
      default:
        return {
          height: 48,
          paddingHorizontal: 16,
          fontSize: 16,
        };
    }
  };

  const getLabelStyle = () => {
    const top = labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [size === 'small' ? 12 : size === 'large' ? 18 : 15, -8],
    });

    const fontSize = labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [size === 'small' ? 14 : size === 'large' ? 18 : 16, 12],
    });

    const color = error 
      ? theme.error 
      : success 
        ? theme.success 
        : isFocused 
          ? theme.primary 
          : theme.textSecondary;

    return {
      position: 'absolute' as const,
      left: icon ? 40 : 16,
      top,
      fontSize,
      color,
      backgroundColor: theme.background,
      paddingHorizontal: 4,
      zIndex: 1,
    };
  };

  const getIconStyle = () => {
    return {
      transform: [
        {
          scale: iconAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          }),
        },
      ],
    };
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.inputContainer, variantStyle, sizeStyle]}>
        {icon && (
          <Animated.View style={[styles.iconContainer, getIconStyle()]}>
            <MaterialIcons
              name={icon as any}
              size={20}
              color={error 
                ? theme.error 
                : success 
                  ? theme.success 
                  : isFocused 
                    ? theme.primary 
                    : theme.textSecondary}
            />
          </Animated.View>
        )}
        
        <TextInput
          {...props}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          style={[
            styles.input,
            {
              color: theme.text,
              fontSize: sizeStyle.fontSize,
              paddingLeft: icon ? 40 : 16,
              paddingRight: rightIcon ? 40 : 16,
            },
          ]}
          placeholderTextColor={theme.textSecondary + '80'}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            disabled={!onRightIconPress}
          >
            <MaterialIcons
              name={rightIcon as any}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <Animated.Text style={[styles.label, getLabelStyle()]}>
        {label}
        {required && <Text style={{ color: theme.error }}> *</Text>}
      </Animated.Text>

      {(error || success || helperText) && (
        <View style={styles.helperContainer}>
          <MaterialIcons
            name={error ? 'error' : success ? 'check-circle' : 'info'}
            size={16}
            color={error ? theme.error : success ? theme.success : theme.textSecondary}
            style={styles.helperIcon}
          />
          <Text
            style={[
              styles.helperText,
              {
                color: error ? theme.error : success ? theme.success : theme.textSecondary,
              },
            ]}
          >
            {error || success || helperText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  inputContainer: {
    position: 'relative',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  label: {
    fontWeight: '500',
  },
  iconContainer: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  rightIconContainer: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  helperIcon: {
    marginRight: 6,
  },
  helperText: {
    fontSize: 12,
    flex: 1,
  },
});

export default ModernInput;
