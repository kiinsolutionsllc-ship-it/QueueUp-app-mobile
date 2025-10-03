import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import MaterialButton from '../../components/shared/MaterialButton';
import MaterialTextInput from '../../components/shared/MaterialTextInput';
import ValidatedForm from '../../components/shared/ValidatedForm';
import ModernHeader from '../../components/shared/ModernHeader';


interface TwoFactorAuthScreenProps {
  navigation: any;
}
export default function TwoFactorAuthScreen({ navigation }: TwoFactorAuthScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();
  const [isLoading, setIsLoading] = useState<any>(false);
  const [isEnabled, setIsEnabled] = useState<any>(false);
  const [qrCode, setQrCode] = useState<any>(null);
  const [backupCodes, setBackupCodes] = useState<any>([]);

  useEffect(() => {
    // Simulate checking if 2FA is already enabled
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    // Simulate API call to check 2FA status
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEnabled(false); // Mock: 2FA is not enabled
  };

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to generate QR code
      await new Promise(resolve => setTimeout(resolve, 2000));
      setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const enable2FA = async (values) => {
    setIsLoading(true);
    try {
      // Simulate API call to enable 2FA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate backup codes
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
      setIsEnabled(true);
      
      Alert.alert(
        'Success',
        'Two-Factor Authentication has been enabled successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Show backup codes
              Alert.alert(
                'Backup Codes',
                'Please save these backup codes in a safe place. You can use them to access your account if you lose your phone:\n\n' + 
                codes.join('\n'),
                [{ text: 'I\'ve Saved Them', style: 'default' }]
              );
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to enable 2FA. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    Alert.alert(
      'Disable Two-Factor Authentication',
      'Are you sure you want to disable 2FA? This will make your account less secure.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Simulate API call to disable 2FA
              await new Promise(resolve => setTimeout(resolve, 2000));
              setIsEnabled(false);
              setQrCode(null);
              setBackupCodes([]);
              Alert.alert('Success', 'Two-Factor Authentication has been disabled.');
            } catch (error) {
              Alert.alert('Error', 'Failed to disable 2FA. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const validationRules = {
    verificationCode: ['required'],
  };

  if (isEnabled) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ModernHeader
          title="Two-Factor Authentication"
          onBackPress={() => navigation.goBack()}
        />
        
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.success + '20' }]}>
              <IconFallback name="security" size={32} color={theme.success} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>2FA Enabled</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Your account is now protected with two-factor authentication
            </Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
            <View style={styles.statusItem}>
              <IconFallback name="check-circle" size={20} color={theme.success} />
              <Text style={[styles.statusText, { color: theme.text }]}>
                Two-Factor Authentication is active
              </Text>
            </View>
            <View style={styles.statusItem}>
              <IconFallback name="smartphone" size={20} color={theme.primary} />
              <Text style={[styles.statusText, { color: theme.text }]}>
                Authenticator app connected
              </Text>
            </View>
          </View>

          <MaterialButton
            title="Disable 2FA"
            onPress={disable2FA}
            variant="outlined"
            style={[styles.button, { borderColor: theme.error }]}
            textStyle={{ color: theme.error }}
            loading={isLoading}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Two-Factor Authentication"
        onBackPress={() => navigation.goBack()}
        showBack
      />
      
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <IconFallback name="security" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Enable 2FA</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Add an extra layer of security to your account
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              How Two-Factor Authentication Works:
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              1. Download an authenticator app like Google Authenticator or Authy
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              2. Scan the QR code with your authenticator app
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              3. Enter the verification code from your app
            </Text>
          </View>

          {!qrCode ? (
            <MaterialButton
              title="Generate QR Code"
              onPress={generateQRCode}
              variant="filled"
              style={styles.button}
              loading={isLoading}
            />
          ) : (
            <ValidatedForm
              initialValues={{ verificationCode: '' }}
              validationRules={validationRules}
              onSubmit={enable2FA}
              submitButtonText="Enable 2FA"
              submitButtonVariant="filled"
            >
              {({ MaterialTextInput }) => (
                <View style={styles.form}>
                  <View style={[styles.qrContainer, { backgroundColor: theme.background }]}>
                    <Text style={[styles.qrTitle, { color: theme.text }]}>
                      Scan this QR code with your authenticator app:
                    </Text>
                    <View style={[styles.qrCode, { backgroundColor: theme.divider }]}>
                      <Text style={[styles.qrPlaceholder, { color: theme.textSecondary }]}>
                        QR Code Placeholder
                      </Text>
                    </View>
                  </View>

                  <MaterialTextInput
                    name="verificationCode"
                    label="Verification Code *"
                    placeholder="Enter 6-digit code from your app"
                    keyboardType="numeric"
                    leftIcon="pin"
                    maxLength={6}
                  />
                </View>
              )}
            </ValidatedForm>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 12,
  },
  form: {
    marginBottom: 20,
  },
  qrContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  qrCode: {
    width: 200,
    height: 200,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholder: {
    fontSize: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
});
