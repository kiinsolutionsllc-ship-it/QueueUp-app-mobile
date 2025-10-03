import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContextSupabase';

interface EmailConfirmationCheckerProps {
  email: string;
  onConfirmed?: () => void;
  onResendSuccess?: () => void;
}

export default function EmailConfirmationChecker({ 
  email, 
  onConfirmed, 
  onResendSuccess 
}: EmailConfirmationCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { checkEmailConfirmationStatus, resendConfirmationEmail } = useAuth();

  const handleCheckConfirmation = async () => {
    if (!email) return;
    
    setIsChecking(true);
    try {
      const { confirmed, error } = await checkEmailConfirmationStatus();
      
      if (error) {
        Alert.alert('Error', error);
        return;
      }
      
      if (confirmed) {
        onConfirmed?.();
      } else {
        Alert.alert(
          'Email Not Confirmed', 
          'Please check your email and enter the verification code to verify your account.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check email confirmation status');
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      const result = await resendConfirmationEmail(email);
      
      if (result.success) {
        Alert.alert('Success', 'Verification code sent! Please check your inbox.');
        onResendSuccess?.();
      } else {
        Alert.alert('Error', result.error || 'Failed to resend verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="email" size={24} color="#EAB308" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Email Verification Required</Text>
        <Text style={styles.message}>
          Please verify your email address to continue. Check your inbox for a verification code.
        </Text>
        
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.checkButton]}
            onPress={handleCheckConfirmation}
            disabled={isChecking}
          >
            <Text style={styles.checkButtonText}>
              {isChecking ? 'Checking...' : 'Check Status'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.resendButton]}
            onPress={handleResendConfirmation}
            disabled={isResending}
          >
            <Text style={styles.resendButtonText}>
              {isResending ? 'Sending...' : 'Resend Email'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  checkButton: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  checkButtonText: {
    color: '#EAB308',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButton: {
    backgroundColor: '#EAB308',
  },
  resendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
