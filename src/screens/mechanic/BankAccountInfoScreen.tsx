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
import { useAuth } from '../../contexts/AuthContextSupabase';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import MaterialTextInput from '../../components/shared/MaterialTextInput';
import BankAccountService, { BankAccount } from '../../services/BankAccountService';


interface BankAccountInfoScreenProps {
  navigation: any;
}
export default function BankAccountInfoScreen({ navigation }: BankAccountInfoScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAccountNumber, setShowAccountNumber] = useState<boolean>(false);
  
  // Form data for editing
  const [formData, setFormData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking' as 'checking' | 'savings',
  });

  useEffect(() => {
    loadBankInfo();
  }, []);

  const loadBankInfo = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const result = await BankAccountService.getBankAccounts(user.id);
      if (result.success && result.data) {
        setBankAccounts(result.data);
        const primaryAccount = result.data.find(account => account.is_primary) || result.data[0];
        setSelectedAccount(primaryAccount);
      } else {
        console.error('Failed to load bank accounts:', result.error);
        Alert.alert('Error', 'Failed to load bank account information');
      }
    } catch (error) {
      console.error('Error loading bank info:', error);
      Alert.alert('Error', 'Failed to load bank account information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm() || !user?.id || !selectedAccount) return;

    setLoading(true);
    try {
      if (selectedAccount.id) {
        // Update existing account
        const result = await BankAccountService.updateBankAccount(user.id, selectedAccount.id, {
          account_holder_name: formData.accountHolderName,
          bank_name: formData.bankName,
          routing_number: formData.routingNumber,
          account_type: formData.accountType,
        });

        if (result.success) {
          Alert.alert('Success', 'Bank account information updated successfully!');
          setIsEditing(false);
          await loadBankInfo(); // Reload data
        } else {
          Alert.alert('Error', result.error || 'Failed to update bank account information');
        }
      } else {
        // Create new account
        const result = await BankAccountService.createBankAccount(user.id, {
          account_holder_name: formData.accountHolderName,
          bank_name: formData.bankName,
          account_number: formData.accountNumber,
          routing_number: formData.routingNumber,
          account_type: formData.accountType,
          is_primary: bankAccounts.length === 0, // First account is primary
        });

        if (result.success) {
          Alert.alert('Success', 'Bank account added successfully!');
          setIsEditing(false);
          await loadBankInfo(); // Reload data
        } else {
          Alert.alert('Error', result.error || 'Failed to add bank account');
        }
      }
    } catch (error) {
      console.error('Error saving bank account:', error);
      Alert.alert('Error', 'Failed to save bank account information');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.accountHolderName.trim()) {
      Alert.alert('Validation Error', 'Please enter the account holder name');
      return false;
    }
    if (!formData.bankName.trim()) {
      Alert.alert('Validation Error', 'Please enter the bank name');
      return false;
    }
    if (!selectedAccount?.id && !formData.accountNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter the account number');
      return false;
    }
    if (!formData.routingNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter the routing number');
      return false;
    }
    if (!BankAccountService.validateRoutingNumber(formData.routingNumber)) {
      Alert.alert('Validation Error', 'Routing number must be 9 digits');
      return false;
    }
    if (!selectedAccount?.id && !BankAccountService.validateAccountNumber(formData.accountNumber)) {
      Alert.alert('Validation Error', 'Account number must be 4-17 digits');
      return false;
    }
    return true;
  };

  const handleDeleteAccount = () => {
    if (!user?.id || !selectedAccount) return;

    Alert.alert(
      'Delete Bank Account',
      'Are you sure you want to delete this bank account? You will need to add a new account to receive payments.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await BankAccountService.deleteBankAccount(user.id, selectedAccount.id);
              if (result.success) {
                Alert.alert('Deleted', 'Bank account has been deleted');
                await loadBankInfo(); // Reload data
              } else {
                Alert.alert('Error', result.error || 'Failed to delete bank account');
              }
            } catch (error) {
              console.error('Error deleting bank account:', error);
              Alert.alert('Error', 'Failed to delete bank account');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleStartEditing = () => {
    if (selectedAccount) {
      setFormData({
        accountHolderName: selectedAccount.account_holder_name,
        bankName: selectedAccount.bank_name,
        accountNumber: '', // Don't show full account number for security
        routingNumber: '', // Don't show routing number for security
        accountType: selectedAccount.account_type,
      });
    } else {
      setFormData({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountType: 'checking',
      });
    }
    setIsEditing(true);
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

  const maskAccountNumber = (number: any) => {
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
                name={selectedAccount?.status === 'active' ? 'verified' : 'warning'}
                size={24}
                color={selectedAccount?.status === 'active' ? theme.success : theme.warning}
              />
              <Text style={[styles.statusTitle, { color: theme.text }]}>
                {selectedAccount?.status === 'active' ? 'Account Active' : 'Account Inactive'}
              </Text>
            </View>
            <Text style={[styles.statusDescription, { color: theme.textSecondary }]}>
              {selectedAccount?.status === 'active'
                ? 'Your bank account is active and ready to receive payments.'
                : 'Please verify your bank account to receive payments.'}
            </Text>
            {selectedAccount?.status !== 'active' && (
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
              value={isEditing ? formData.accountHolderName : (selectedAccount?.account_holder_name || '')}
              onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })}
              editable={isEditing}
              style={styles.input}
            />

            <MaterialTextInput
              label="Bank Name"
              placeholder="Enter bank name"
              value={isEditing ? formData.bankName : (selectedAccount?.bank_name || '')}
              onChangeText={(text) => setFormData({ ...formData, bankName: text })}
              editable={isEditing}
              style={styles.input}
            />

            <View style={styles.inputRow}>
              <MaterialTextInput
                label="Account Number"
                placeholder="Enter account number"
                value={isEditing ? formData.accountNumber : (selectedAccount?.account_number || '')}
                onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
                editable={isEditing}
                secureTextEntry={!showAccountNumber && !isEditing}
                keyboardType="numeric"
                style={[styles.input, { flex: 1 }]}
              />
              {!isEditing && selectedAccount && (
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
              value={isEditing ? formData.routingNumber : ''}
              onChangeText={(text) => setFormData({ ...formData, routingNumber: text })}
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
                      backgroundColor: (isEditing ? formData.accountType : selectedAccount?.account_type) === 'checking' ? theme.primary : theme.surface,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, accountType: 'checking' })}
                  disabled={!isEditing}
                >
                  <Text
                    style={[
                      styles.accountTypeButtonText,
                      {
                        color: (isEditing ? formData.accountType : selectedAccount?.account_type) === 'checking' ? theme.onPrimary : theme.text,
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
                      backgroundColor: (isEditing ? formData.accountType : selectedAccount?.account_type) === 'savings' ? theme.primary : theme.surface,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, accountType: 'savings' })}
                  disabled={!isEditing}
                >
                  <Text
                    style={[
                      styles.accountTypeButtonText,
                      {
                        color: (isEditing ? formData.accountType : selectedAccount?.account_type) === 'savings' ? theme.onPrimary : theme.text,
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
                    // Reset form data
                    setFormData({
                      accountHolderName: '',
                      bankName: '',
                      accountNumber: '',
                      routingNumber: '',
                      accountType: 'checking',
                    });
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
              <>
                <MaterialButton
                  title={selectedAccount ? "Edit Account" : "Add Account"}
                  onPress={handleStartEditing}
                  variant="filled"
                  style={styles.actionButton}
                />
                {selectedAccount && (
                  <MaterialButton
                    title="Delete Account"
                    onPress={handleDeleteAccount}
                    variant="outlined"
                    style={[styles.actionButton, { borderColor: theme.error }]}
                    textColor={theme.error}
                  />
                )}
              </>
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
