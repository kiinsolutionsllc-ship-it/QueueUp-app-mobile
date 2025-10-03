import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { useTheme } from '../../contexts/ThemeContext';
import ModernInput from '../../components/shared/ModernInput';
import MaterialButton from '../../components/shared/MaterialButton';

interface EmailVerificationScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
      userType?: 'customer' | 'mechanic';
    };
  };
}

export default function EmailVerificationScreen({ navigation, route }: EmailVerificationScreenProps) {
  const { email, userType = 'customer' } = route.params;
  const { confirmSignUp, resendConfirmationEmail } = useAuth();
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<boolean>(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    const startAnimations = () => {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.8);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Continuous rotate animation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
    };

    startAnimations();
  }, [fadeAnim, pulseAnim, rotateAnim, scaleAnim, slideAnim]);

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (verificationCode.length < 6) {
      Alert.alert('Error', 'Verification code must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await confirmSignUp(email, verificationCode);
      
      if (result.success) {
        Alert.alert(
          'Success!',
          'Your email has been verified successfully. You can now sign in to your account.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate back to login screen
                navigation.navigate('Login');
              },
            },
          ]
        );
      } else {
        Alert.alert('Verification Failed', result.error || 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const result = await resendConfirmationEmail(email);
      
      if (result.success) {
        Alert.alert('Success', 'A new verification code has been sent to your email address.');
        setVerificationCode(''); // Clear the current code
      } else {
        Alert.alert('Error', result.error || 'Failed to resend verification code. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <Animated.View
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
            >
              <MaterialIcons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>

            {/* Logo/Icon */}
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [
                    { scale: pulseAnim },
                    { rotate: rotateInterpolate },
                  ],
                },
              ]}
            >
              <MaterialIcons name="email" size={48} color="#EAB308" />
            </Animated.View>

            <Text style={[styles.title, { color: theme.text }]}>
              Verify Your Email
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              We've sent a verification code to:
            </Text>
            <Text style={[styles.emailText, { color: theme.primary }]}>
              {email}
            </Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={[
              styles.formSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.inputContainer}>
              <ModernInput
                label="Verification Code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Enter 6-digit code"
                keyboardType="numeric"
                maxLength={6}
                icon="pin"
                required
                theme={theme}
                style={[
                  styles.verificationInput,
                  focusedField && styles.inputFocused,
                ]}
                onFocus={() => setFocusedField(true)}
                onBlur={() => setFocusedField(false)}
              />
            </View>

            <Text style={[styles.helpText, { color: theme.textSecondary }]}>
              Check your email inbox (and spam folder) for the verification code.
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <MaterialButton
                title={loading ? 'Verifying...' : 'Verify Email'}
                onPress={handleVerifyCode}
                variant="filled"
                style={styles.verifyButton}
                loading={loading}
                disabled={loading || !verificationCode.trim()}
              />

              <TouchableOpacity
                style={[styles.resendButton, resending && styles.resendButtonDisabled]}
                onPress={handleResendCode}
                disabled={resending}
              >
                <MaterialIcons
                  name="refresh"
                  size={20}
                  color={resending ? theme.textDisabled : theme.primary}
                />
                <Text style={[
                  styles.resendButtonText,
                  { color: resending ? theme.textDisabled : theme.primary }
                ]}>
                  {resending ? 'Sending...' : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer Section */}
          <Animated.View
            style={[
              styles.footerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
            >
              <MaterialIcons name="arrow-back" size={20} color={theme.textSecondary} />
              <Text style={[styles.backToLoginText, { color: theme.textSecondary }]}>
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
    zIndex: 1,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 16,
  },
  verificationInput: {
    marginBottom: 8,
  },
  inputFocused: {
    borderColor: '#EAB308',
    borderWidth: 2,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  verifyButton: {
    marginBottom: 8,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAB308',
    backgroundColor: 'transparent',
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 20,
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backToLoginText: {
    fontSize: 16,
    marginLeft: 8,
  },
});
