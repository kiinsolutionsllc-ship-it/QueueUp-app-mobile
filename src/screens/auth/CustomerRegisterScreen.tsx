import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, StatusBar, TextInput, Modal, SafeAreaView, Animated, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { LinearGradient } from 'expo-linear-gradient';

// const { width, height } = Dimensions.get('window');

interface CustomerRegisterScreenProps {
  navigation: any;
}

export default function CustomerRegisterScreen({ navigation }: CustomerRegisterScreenProps) {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string>('');
  const { register, resendConfirmationEmail } = useAuth();

  // Animation values from loading screen
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Reset animation values first
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    pulseAnim.setValue(1);
    rotateAnim.setValue(0);

    // Start entrance animations
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

    // Start continuous animations
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      // Stop animations safely
      try {
        pulseAnimation.stop();
        rotateAnimation.stop();
        fadeAnim.stopAnimation();
        slideAnim.stopAnimation();
        scaleAnim.stopAnimation();
        pulseAnim.stopAnimation();
        rotateAnim.stopAnimation();
      } catch (error) {
        console.warn('Error stopping animations:', error);
      }
    };
  }, [fadeAnim, pulseAnim, rotateAnim, scaleAnim, slideAnim]);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await register({ email, name, user_type: 'customer' }, password);
      if (result.success) {
        if (result.requiresEmailConfirmation) {
          // Navigate to email verification screen
          navigation.navigate('EmailVerification', {
            email: email,
            userType: 'customer'
          });
        } else {
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
            navigation.navigate('Login');
          }, 2000);
        }
      } else {
        Alert.alert('Registration Failed', result.error || 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleResendConfirmation = async () => {
    try {
      const result = await resendConfirmationEmail(confirmationEmail);
      if (result.success) {
        Alert.alert('Success', 'Verification code sent! Please check your inbox.');
      } else {
        Alert.alert('Error', result.error || 'Failed to resend verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification code');
    }
  };

  const handleEmailConfirmationClose = () => {
    setShowEmailConfirmationModal(false);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#F8F8F8', '#E5E5E5', '#F0F0F0']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons name="arrow-back" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
              {/* Logo Section */}
              <Animated.View 
                style={[
                  styles.logoSection,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: scaleAnim }
                    ]
                  }
                ]}
              >
                <Animated.View 
                  style={[
                    styles.logoContainer,
                    { 
                      transform: [
                        { scale: pulseAnim },
                        { 
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '15deg'],
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <Image 
                    source={require('../../../assets/Logo.jpg')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </Animated.View>
                
                <Animated.Text 
                  style={[
                    styles.title, 
                    { 
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }]
                    }
                  ]}
                >
                  Create Account
                </Animated.Text>
                <Text style={styles.subtitle}>Join as a customer</Text>
              </Animated.View>

              {/* Form Section */}
              <View style={styles.formSection}>
                {/* Name Field */}
                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'name' && styles.inputFocused
                  ]}>
                    <MaterialIcons name="person" size={20} color="#666666" />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Full Name"
                      placeholderTextColor="#999999"
                      autoCapitalize="words"
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
                
                {/* Email Field */}
                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'email' && styles.inputFocused
                  ]}>
                    <MaterialIcons name="email" size={20} color="#666666" />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email"
                      placeholderTextColor="#999999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
                
                {/* Password Field */}
                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'password' && styles.inputFocused
                  ]}>
                    <MaterialIcons name="lock" size={20} color="#666666" />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Password"
                      placeholderTextColor="#999999"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons
                        name={showPassword ? "visibility-off" : "visibility"}
                        size={20}
                        color="#666666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Confirm Password Field */}
                <View style={styles.inputGroup}>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'confirmPassword' && styles.inputFocused
                  ]}>
                    <MaterialIcons name="lock" size={20} color="#666666" />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm Password"
                      placeholderTextColor="#999999"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <MaterialIcons
                        name={showConfirmPassword ? "visibility-off" : "visibility"}
                        size={20}
                        color="#666666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Register Button */}
                <TouchableOpacity
                  style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <Text style={styles.registerButtonText}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer Links */}
              <View style={styles.footerSection}>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginText}>
                    Already have an account? <Text style={styles.loginLink}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <MaterialIcons name="check-circle" size={48} color="#EAB308" />
              <Text style={styles.successTitle}>Success!</Text>
              <Text style={styles.successMessage}>
                Account created successfully!
              </Text>
            </View>
          </View>
        </Modal>

        {/* Email Confirmation Modal */}
        <Modal
          visible={showEmailConfirmationModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleEmailConfirmationClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.emailConfirmationModal}>
              <MaterialIcons name="email" size={48} color="#EAB308" />
              <Text style={styles.confirmationTitle}>Check Your Email</Text>
              <Text style={styles.confirmationMessage}>
                We've sent a verification code to:
              </Text>
              <Text style={styles.confirmationEmail}>{confirmationEmail}</Text>
              <Text style={styles.confirmationInstructions}>
                Please enter the 6-digit verification code from your email to complete your registration.
              </Text>
              
              <View style={styles.confirmationButtons}>
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendConfirmation}
                >
                  <Text style={styles.resendButtonText}>Resend Email</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.confirmationCloseButton}
                  onPress={handleEmailConfirmationClose}
                >
                  <Text style={styles.confirmationCloseButtonText}>Continue to Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputFocused: {
    borderColor: '#EAB308',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  input: {
    flex: 1,
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  registerButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#EAB308',
    fontSize: 16,
    fontWeight: '700',
  },
  footerSection: {
    alignItems: 'center',
  },
  loginText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  loginLink: {
    color: '#EAB308',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    margin: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  emailConfirmationModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    margin: 20,
    maxWidth: 400,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  confirmationMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  confirmationEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EAB308',
    marginBottom: 15,
  },
  confirmationInstructions: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 25,
    lineHeight: 20,
  },
  confirmationButtons: {
    width: '100%',
    gap: 12,
  },
  resendButton: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  resendButtonText: {
    color: '#EAB308',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationCloseButton: {
    backgroundColor: '#EAB308',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  confirmationCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});