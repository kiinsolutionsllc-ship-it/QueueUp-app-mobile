import React, { useState } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
// import MaterialButton from '../../components/shared/MaterialButton';
// import MaterialTextInput from '../../components/shared/MaterialTextInput';
import ValidatedForm from '../../components/shared/ValidatedForm';
import ModernHeader from '../../components/shared/ModernHeader';


interface ChangePasswordScreenProps {
  navigation: any;
}
export default function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user, updatePassword } = useAuth();
  const theme = getCurrentTheme();
  const [isLoading, setIsLoading] = useState<any>(false);

  const validationRules = {
    currentPassword: ['required'],
    newPassword: [
      'required',
      { validator: 'minLength', message: 'Password must be at least 12 characters' },
    ],
    confirmPassword: ['required'],
  };

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (values.currentPassword === values.newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would call your API here
      // await updatePassword(values.currentPassword, values.newPassword);
      
      Alert.alert(
        'Success',
        'Password updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Change Password"
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
              <IconFallback name="lock" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Update Your Password</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter your current password and choose a new secure password
            </Text>
          </View>

          <ValidatedForm
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            }}
            validationRules={validationRules}
            onSubmit={handleChangePassword}
            submitButtonText="Update Password"
            submitButtonVariant="filled"
          >
            {({ MaterialTextInput }) => (
              <View style={styles.form}>
                <MaterialTextInput
                  name="currentPassword"
                  label="Current Password *"
                  placeholder="Enter your current password"
                  secureTextEntry
                  leftIcon="lock"
                />
                
                <MaterialTextInput
                  name="newPassword"
                  label="New Password *"
                  placeholder="Enter your new password"
                  secureTextEntry
                  leftIcon="lock-outline"
                />
                
                <MaterialTextInput
                  name="confirmPassword"
                  label="Confirm New Password *"
                  placeholder="Confirm your new password"
                  secureTextEntry
                  leftIcon="lock-outline"
                />

                <View style={[styles.passwordRequirements, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.requirementsTitle, { color: theme.text }]}>
                    Password Requirements:
                  </Text>
                  <Text style={[styles.requirement, { color: theme.textSecondary }]}>
                    • At least 12 characters long
                  </Text>
                  <Text style={[styles.requirement, { color: theme.textSecondary }]}>
                    • Mix of uppercase and lowercase letters
                  </Text>
                  <Text style={[styles.requirement, { color: theme.textSecondary }]}>
                    • At least one number
                  </Text>
                  <Text style={[styles.requirement, { color: theme.textSecondary }]}>
                    • At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                  </Text>
                  <Text style={[styles.requirement, { color: theme.textSecondary }]}>
                    • No spaces allowed
                  </Text>
                  <Text style={[styles.requirement, { color: theme.textSecondary }]}>
                    • No common patterns (123, abc, password, etc.)
                  </Text>
                  <Text style={[styles.requirement, { color: theme.textSecondary }]}>
                    • Different from your current password
                  </Text>
                </View>
              </View>
            )}
          </ValidatedForm>
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
  form: {
    marginBottom: 20,
  },
  passwordRequirements: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 13,
    marginBottom: 4,
  },
});
