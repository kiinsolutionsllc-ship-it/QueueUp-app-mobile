import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import MaterialTextInput from '../../components/shared/MaterialTextInput';


interface BankAccountInfoScreenProps {
  navigation: any;
}
export default function BankAccountInfoScreen({ navigation }: BankAccountInfoScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  const [bankInfo, setBankInfo] = useState<any>({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking', // checking, savings
    isVerified: false,
    isDefault: true,
  });

  const [isEditing, setIsEditing] = useState<any>(false);
  const [loading, setLoading] = useState<any>(false);
  const [showAccountNumber, setShowAccountNumber] = useState<any>(false);

  useEffect(() => {
    loadBankInfo();
  }, []);

  const loadBankInfo = async () => {
    // In a real app, this would load from the backend
    // For now, we'll use mock data
    setBankInfo({
      accountHolderName: 'Mike Mechanic',
      bankName: 'Chase Bank',
      accountNumber: '****1234',
      routingNumber: '021000021',
      accountType: 'checking',
      isVerified: true,
      isDefault: true,
    });
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Bank account information updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update bank account information');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!bankInfo.accountHolderName.trim()) {
      Alert.alert('Validation Error', 'Please enter the account holder name');
      return false;
    }
    if (!bankInfo.bankName.trim()) {
      Alert.alert('Validation Error', 'Please enter the bank name');
      return false;
    }
    if (!bankInfo.accountNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter the account number');
      return false;
    }
    if (!bankInfo.routingNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter the routing number');
      return false;
    }
    if (bankInfo.routingNumber.length !== 9) {
      Alert.alert('Validation Error', 'Routing number must be 9 digits');
      return false;
    }
    return true;
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Bank Account',
      'Are you sure you want to delete this bank account? You will need to add a new account to receive payments.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBankInfo({
              accountHolderName: '',
              bankName: '',
              accountNumber: '',
              routingNumber: '',
              accountType: 'checking',
              isVerified: false,
              isDefault: true,
            });
            Alert.alert('Deleted', 'Bank account has been deleted');
          },
        },
      ]
    );
  };

  const handleVerifyAccount = () => {
    Alert.alert(
      'Verify Bank Account',
      'We will make two small deposits to your account within 1-2 business days. Please check your account and enter the amounts to verify.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Verification',
          onPress: () => {
            Alert.alert('Verification Started', 'Please check your bank account for verification deposits.');
          },
        },
      ]
    );
  };

  const maskAccountNumber = (number) => {
    if (!number) return '';
    if (number.length <= 4) return number;
    return '*'.repeat(number.length - 4) + number.slice(-4);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Bank Account"
        subtitle="Manage your payment information"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          {
            icon: isEditing ? 'save' : 'edit',
            onPress: isEditing ? handleSave : () => setIsEditing(true),
            color: theme.primary,
          },
        ]}
        showNotifications={true}
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile={true}
        profileAvatar={user?.avatar || user?.name || '👨‍🔧'}
        user={user}
        onProfilePress={() => navigation.navigate('MechanicProfile')}
      />

      <ScrollView style={styles.scrollView}>
        {/* Account Status */}
        <View style={styles.section}>
          <MaterialCard style={[styles.statusCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.statusHeader}>
              <IconFallback
                name={bankInfo.isVerified ? 'verified' : 'warning'}
                size={24}
                color={bankInfo.isVerified ? theme.success : theme.warning}
              />
              <Text style={[styles.statusTitle, { color: theme.text }]}>
                {bankInfo.isVerified ? 'Account Verified' : 'Account Not Verified'}
              </Text>
            </View>
            <Text style={[styles.statusDescription, { color: theme.textSecondary }]}>
              {bankInfo.isVerified
                ? 'Your bank account is verified and ready to receive payments.'
                : 'Please verify your bank account to receive payments.'}
            </Text>
            {!bankInfo.isVerified && (
              <MaterialButton
                title="Verify Account"
                onPress={handleVerifyAccount}
                variant="outlined"
                style={styles.verifyButton}
              />
            )}
          </MaterialCard>
        </View>

        {/* Bank Information Form */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Bank Information</Text>
          
          <MaterialCard style={[styles.formCard, { backgroundColor: theme.cardBackground }]}>
            <MaterialTextInput
              label="Account Holder Name"
              placeholder="Enter account holder name"
              value={bankInfo.accountHolderName}
              onChangeText={(text) => setBankInfo({ ...bankInfo, accountHolderName: text })}
              editable={isEditing}
              style={styles.input}
            />

            <MaterialTextInput
              label="Bank Name"
              placeholder="Enter bank name"
              value={bankInfo.bankName}
              onChangeText={(text) => setBankInfo({ ...bankInfo, bankName: text })}
              editable={isEditing}
              style={styles.input}
            />

            <View style={styles.inputRow}>
              <MaterialTextInput
                label="Account Number"
                placeholder="Enter account number"
                value={isEditing ? bankInfo.accountNumber : maskAccountNumber(bankInfo.accountNumber)}
                onChangeText={(text) => setBankInfo({ ...bankInfo, accountNumber: text })}
                editable={isEditing}
                secureTextEntry={!showAccountNumber && !isEditing}
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
              />
              {!isEditing && (
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowAccountNumber(!showAccountNumber)}
                >
                  <IconFallback
                    name={showAccountNumber ? 'visibility-off' : 'visibility'}
                    size={24}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            <MaterialTextInput
              label="Routing Number"
              placeholder="Enter routing number"
              value={bankInfo.routingNumber}
              onChangeText={(text) => setBankInfo({ ...bankInfo, routingNumber: text })}
              editable={isEditing}
              keyboardType="numeric"
              maxLength={9}
              style={styles.input}
            />

            <View style={styles.accountTypeContainer}>
              <Text style={[styles.accountTypeLabel, { color: theme.text }]}>Account Type</Text>
              <View style={styles.accountTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.accountTypeButton,
                    {
                      backgroundColor: bankInfo.accountType === 'checking' ? theme.primary : theme.surface,
                    },
                  ]}
                  onPress={() => setBankInfo({ ...bankInfo, accountType: 'checking' })}
                  disabled={!isEditing}
                >
                  <Text
                    style={[
                      styles.accountTypeButtonText,
                      {
                        color: bankInfo.accountType === 'checking' ? theme.onPrimary : theme.text,
                      },
                    ]}
                  >
                    Checking
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.accountTypeButton,
                    {
                      backgroundColor: bankInfo.accountType === 'savings' ? theme.primary : theme.surface,
                    },
                  ]}
                  onPress={() => setBankInfo({ ...bankInfo, accountType: 'savings' })}
                  disabled={!isEditing}
                >
                  <Text
                    style={[
                      styles.accountTypeButtonText,
                      {
                        color: bankInfo.accountType === 'savings' ? theme.onPrimary : theme.text,
                      },
                    ]}
                  >
                    Savings
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </MaterialCard>
        </View>

        {/* Security Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Security</Text>
          
          <MaterialCard style={[styles.securityCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.securityItem}>
              <IconFallback name="security" size={24} color={theme.primary} />
              <View style={styles.securityInfo}>
                <Text style={[styles.securityTitle, { color: theme.text }]}>
                  Bank-Level Security
                </Text>
                <Text style={[styles.securityDescription, { color: theme.textSecondary }]}>
                  Your bank information is encrypted and stored securely using industry-standard encryption.
                </Text>
              </View>
            </View>

            <View style={styles.securityItem}>
              <IconFallback name="verified-user" size={24} color={theme.success} />
              <View style={styles.securityInfo}>
                <Text style={[styles.securityTitle, { color: theme.text }]}>
                  PCI Compliant
                </Text>
                <Text style={[styles.securityDescription, { color: theme.textSecondary }]}>
                  We are PCI DSS compliant and never store your full account details.
                </Text>
              </View>
            </View>
          </MaterialCard>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <View style={styles.actionButtons}>
            {isEditing ? (
              <>
                <MaterialButton
                  title="Cancel"
                  onPress={() => {
                    setIsEditing(false);
                    loadBankInfo(); // Reset to original values
                  }}
                  variant="outlined"
                  style={styles.actionButton}
                />
                <MaterialButton
                  title="Save Changes"
                  onPress={handleSave}
                  variant="filled"
                  style={styles.actionButton}
                  loading={loading}
                />
              </>
            ) : (
              <MaterialButton
                title="Delete Account"
                onPress={handleDeleteAccount}
                variant="outlined"
                style={[styles.actionButton, { borderColor: theme.error }]}
                textColor={theme.error}
              />
            )}
          </View>
        </View>

        {/* Help Information */}
        <View style={styles.section}>
          <MaterialCard style={[styles.helpCard, { backgroundColor: theme.info + '20' }]}>
            <View style={styles.helpHeader}>
              <IconFallback name="help" size={24} color={theme.info} />
              <Text style={[styles.helpTitle, { color: theme.text }]}>Need Help?</Text>
            </View>
            <Text style={[styles.helpText, { color: theme.textSecondary }]}>
              If you're having trouble adding your bank account, please contact our support team. 
              We're here to help you get set up for payments.
            </Text>
            <MaterialButton
              title="Contact Support"
              onPress={() => navigation.navigate('HelpSupport')}
              variant="outlined"
              style={styles.helpButton}
            />
          </MaterialCard>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  verifyButton: {
    alignSelf: 'flex-start',
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
  },
  input: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  eyeButton: {
    padding: 12,
    marginLeft: 8,
  },
  accountTypeContainer: {
    marginTop: 8,
  },
  accountTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  accountTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  accountTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  accountTypeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  securityCard: {
    padding: 20,
    borderRadius: 16,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  securityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  helpCard: {
    padding: 20,
    borderRadius: 16,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    alignSelf: 'flex-start',
  },
  bottomSpacing: {
    height: 20,
  },
});
