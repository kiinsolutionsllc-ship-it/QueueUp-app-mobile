import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Animated, StyleSheet } from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';

const MaterialTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error = '', // Make error optional with default
  helperText = '', // Make helperText optional with default
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  style = {}, // Make style optional with default
  inputStyle = {}, // Make inputStyle optional with default
  success = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  onRightIconPress = null,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [labelAnimation] = useState(new Animated.Value(0));

  const isFloating = isFocused || (value && value.length > 0);
  const hasError = error && error.length > 0;
  const hasSuccess = success && !hasError && value && value.length > 0;

  // Animate label on focus
  useEffect(() => {
    Animated.timing(labelAnimation, {
      toValue: isFloating ? 1 : 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  }, [isFloating, labelAnimation]);

  const getBorderColor = () => {
    if (hasError) return theme.error;
    if (hasSuccess) return theme.success;
    if (isFocused) return theme.primary;
    return theme.border;
  };

  const getRightIcon = () => {
    if (loading) {
      return <IconFallback name="refresh" size={20} color={theme.textSecondary} />;
    }
    if (secureTextEntry) {
      return (
        <IconFallback
          name={showPassword ? "visibility-off" : "visibility"}
          size={20}
          color={theme.textSecondary}
          onPress={() => setShowPassword(!showPassword)}
        />
      );
    }
    if (hasSuccess) {
      return <IconFallback name="check-circle" size={20} color={theme.success} />;
    }
    if (hasError) {
      return <IconFallback name="error" size={20} color={theme.error} />;
    }
    if (rightIcon) {
      return (
        <IconFallback
          name={rightIcon}
          size={20}
          color={theme.textSecondary}
          onPress={onRightIconPress}
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.inputContainer,
        {
          borderColor: getBorderColor(),
          backgroundColor: theme.surface,
          borderWidth: isFocused || hasError || hasSuccess ? 2 : 1}
      ]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <IconFallback name={leftIcon} size={20} color={theme.textSecondary} />
          </View>
        )}
        
        {label && (
          <Animated.Text
            style={[
              styles.label,
              {
                color: hasError ? theme.error : hasSuccess ? theme.success : isFocused ? theme.primary : theme.textSecondary,
                top: labelAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, -8]
                }),
                fontSize: labelAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 12]})}
            ]}
          >
            {label}
          </Animated.Text>
        )}
        
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              fontSize: 16,
              minHeight: multiline ? 80 : 48,
              paddingLeft: leftIcon ? 40 : 0,
              paddingRight: (rightIcon || secureTextEntry || hasSuccess || hasError || loading) ? 40 : 0},
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={!label ? placeholder : ''}
          placeholderTextColor={theme.textSecondary}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {(rightIcon || secureTextEntry || hasSuccess || hasError || loading) && (
          <View style={styles.rightIconContainer}>
            {getRightIcon()}
          </View>
        )}
      </View>
      
      {(hasError || helperText) && (
        <Text
          style={[
            styles.helperText,
            {
              color: hasError ? theme.error : theme.textSecondary}
          ]}
        >
          {hasError ? error : helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8},
  inputContainer: {
    borderRadius: 8,
    position: 'relative',
    paddingHorizontal: 12,
    paddingTop: 8,
    minHeight: 56},
  label: {
    position: 'absolute',
    left: 12,
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    fontWeight: '400'},
  input: {
    paddingVertical: 12,
    paddingHorizontal: 0,
    textAlignVertical: 'top'},
  leftIconContainer: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12}});

export default MaterialTextInput;
