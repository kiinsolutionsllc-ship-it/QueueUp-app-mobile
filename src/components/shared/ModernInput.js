import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { designTokens } from '../../design-system/DesignSystem';
import IconFallback from './IconFallback';

const ModernInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  icon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  required = false,
  style,
  inputStyle,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  
  const labelAnimation = useRef(new Animated.Value(hasValue ? 1 : 0)).current;
  const borderAnimation = useRef(new Animated.Value(0)).current;
  const errorAnimation = useRef(new Animated.Value(error ? 1 : 0)).current;

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  useEffect(() => {
    Animated.timing(labelAnimation, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue, labelAnimation]);

  useEffect(() => {
    Animated.timing(borderAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, borderAnimation]);

  useEffect(() => {
    Animated.timing(errorAnimation, {
      toValue: error ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [error, errorAnimation]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChangeText = (text) => {
    setHasValue(!!text);
    onChangeText?.(text);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getBorderColor = () => {
    if (error) return theme.error;
    if (isFocused) return theme.primary;
    return theme.border;
  };

  const getLabelStyle = () => {
    const translateY = labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -8],
    });

    const scale = labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.85],
    });

    return {
      transform: [
        { translateY },
        { scale },
      ],
    };
  };

  const getBorderStyle = () => {
    const borderWidth = borderAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2],
    });

    return {
      borderWidth,
    };
  };

  const getErrorStyle = () => {
    const opacity = errorAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return {
      opacity,
    };
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        {label && (
          <Animated.Text
            style={[
              styles.label,
              {
                color: error ? theme.error : isFocused ? theme.primary : theme.textSecondary,
                ...getLabelStyle(),
              },
            ]}
          >
            {label}
            {required && (
              <Text style={{ color: theme.error }}> *</Text>
            )}
          </Animated.Text>
        )}
        
        <View
          style={[
            styles.inputWrapper,
            {
              borderColor: getBorderColor(),
              backgroundColor: disabled ? theme.surfaceVariant : theme.cardBackground,
            },
            getBorderStyle(),
          ]}
        >
          {icon && (
            <View style={styles.iconContainer}>
              <IconFallback
                name={icon}
                size={20}
                color={isFocused ? theme.primary : theme.textSecondary}
              />
            </View>
          )}
          
          <TextInput
            style={[
              styles.input,
              {
                color: disabled ? theme.textDisabled : theme.text,
                fontSize: designTokens.typography.fontSizes.base,
              },
              multiline && styles.multilineInput,
              inputStyle,
            ]}
            value={value}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor={theme.textLight}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={!disabled}
            accessibilityLabel={label}
            accessibilityHint={helperText}
            accessibilityState={{ disabled }}
            {...props}
          />
          
          {secureTextEntry && (
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={togglePasswordVisibility}
              accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            >
              <IconFallback
                name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          )}
          
          {rightIcon && (
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
            >
              <IconFallback
                name={rightIcon}
                size={20}
                color={isFocused ? theme.primary : theme.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {(error || helperText) && (
        <Animated.View style={[styles.helperContainer, getErrorStyle()]}>
          <Text
            style={[
              styles.helperText,
              {
                color: error ? theme.error : theme.textSecondary,
              },
            ]}
          >
            {error || helperText}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

// Search Input Component
export const SearchInput = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <ModernInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      icon="search"
      rightIcon={value ? 'close' : undefined}
      onRightIconPress={value ? onClear : undefined}
      style={style}
      {...props}
    />
  );
};

// Password Input Component
export const PasswordInput = ({
  value,
  onChangeText,
  placeholder = 'Password',
  style,
  ...props
}) => {
  return (
    <ModernInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry
      style={style}
      {...props}
    />
  );
};

// Email Input Component
export const EmailInput = ({
  value,
  onChangeText,
  placeholder = 'Email',
  style,
  ...props
}) => {
  return (
    <ModernInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      style={style}
      {...props}
    />
  );
};

// Phone Input Component
export const PhoneInput = ({
  value,
  onChangeText,
  placeholder = 'Phone number',
  style,
  ...props
}) => {
  return (
    <ModernInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType="phone-pad"
      style={style}
      {...props}
    />
  );
};

// Number Input Component
export const NumberInput = ({
  value,
  onChangeText,
  placeholder = 'Number',
  style,
  ...props
}) => {
  return (
    <ModernInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType="numeric"
      style={style}
      {...props}
    />
  );
};

// Text Area Component
export const TextArea = ({
  value,
  onChangeText,
  placeholder = 'Enter text...',
  numberOfLines = 4,
  style,
  ...props
}) => {
  return (
    <ModernInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline
      numberOfLines={numberOfLines}
      style={style}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: designTokens.spacing.md,
  },
  inputContainer: {
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: designTokens.spacing.md,
    top: designTokens.spacing.md,
    fontSize: designTokens.typography.fontSizes.base,
    fontWeight: designTokens.typography.fontWeights.medium,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: designTokens.borderRadius.base,
    minHeight: designTokens.accessibility.minTouchTarget,
    paddingHorizontal: designTokens.spacing.md,
  },
  iconContainer: {
    padding: designTokens.spacing.sm,
    marginRight: designTokens.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: designTokens.spacing.md,
    fontSize: designTokens.typography.fontSizes.base,
    lineHeight: designTokens.typography.lineHeights.normal * designTokens.typography.fontSizes.base,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  helperContainer: {
    marginTop: designTokens.spacing.xs,
    paddingHorizontal: designTokens.spacing.sm,
  },
  helperText: {
    fontSize: designTokens.typography.fontSizes.sm,
    lineHeight: designTokens.typography.lineHeights.normal * designTokens.typography.fontSizes.sm,
  },
});

export default ModernInput;






