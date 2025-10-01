import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import { paymentServiceNew as paymentService } from '../../services/PaymentServiceNew';
import { STRIPE_CONFIG, MOCK_MODE } from '../../config/payment';


interface StripeConnectScreenProps {
  navigation: any;
}
export default function StripeConnectScreen({ navigation }: StripeConnectScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  // Use merged payment service (singleton)
  const [isConnected, setIsConnected] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<any>(false);
  const [stripeAccount, setStripeAccount] = useState<any>(null);

  useEffect(() => {
    checkStripeConnection();
  }, []);

  const checkStripeConnection = async () => {
    setIsLoading(true);
    try {
      if (MOCK_MODE) {
        // Mock implementation for development
        setTimeout(() => {
          setIsConnected(false); // Simulate not connected
          setIsLoading(false);
        }, 1000);
      } else {
        // Real Stripe Connect integration
        const accountStatus = await paymentService.getStripeConnectAccount(user?.id || '');
        
        if (accountStatus && accountStatus.charges_enabled) {
          setIsConnected(true);
          setStripeAccount(accountStatus);
        } else {
          setIsConnected(false);
          setStripeAccount(null);
        }
      }
    } catch (error) {
      console.error('Error checking Stripe connection:', error);
      setIsConnected(false);
      setStripeAccount(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setIsLoading(true);
    try {
      if (MOCK_MODE) {
        // Mock implementation for development
        Alert.alert(
          'Connect to Stripe',
          'This will redirect you to Stripe to set up your payout account. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Continue', 
              onPress: () => {
                // Simulate successful connection
                setTimeout(() => {
                  setIsConnected(true);
                  setStripeAccount({
                    id: 'acct_1234567890',
                    email: user?.email || 'mechanic@example.com',
                    country: 'US',
                    currency: 'usd',
                    payouts_enabled: true,
                    charges_enabled: true,
                  });
                  setIsLoading(false);
                  Alert.alert('Success', 'Stripe account connected successfully!');
                }, 2000);
              }
            }
          ]
        );
      } else {
        // Real Stripe Connect OAuth flow
        const connectUrl = await paymentService.createStripeConnectAccount({
          userId: user?.id || '',
          email: user?.email || '',
          returnUrl: STRIPE_CONFIG.connect.redirectUri,
        });

        // Open Stripe Connect OAuth in browser
        const supported = await Linking.canOpenURL(connectUrl);
        if (supported) {
          await Linking.openURL(connectUrl);
        } else {
          throw new Error('Cannot open Stripe Connect URL');
        }
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error);
      Alert.alert('Error', 'Failed to connect to Stripe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectStripe = () => {
    Alert.alert(
      'Disconnect Stripe',
      'Are you sure you want to disconnect your Stripe account? You won\'t be able to receive payouts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (MOCK_MODE) {
                setIsConnected(false);
                setStripeAccount(null);
                Alert.alert('Disconnected', 'Stripe account has been disconnected.');
              } else {
                // Real Stripe Connect disconnect
                await paymentService.disconnectStripeAccount(user?.id || '');
                setIsConnected(false);
                setStripeAccount(null);
                Alert.alert('Disconnected', 'Stripe account has been disconnected.');
              }
            } catch (error) {
              console.error('Error disconnecting Stripe:', error);
              Alert.alert('Error', 'Failed to disconnect Stripe account.');
            }
          }
        }
      ]
    );
  };

  const handleManageAccount = async () => {
    try {
      if (MOCK_MODE) {
        // Mock implementation
        Alert.alert(
          'Stripe Dashboard',
          'This would open your Stripe Dashboard in a browser to manage your account settings, view payouts, and access tax documents.',
          [
            { text: 'OK' }
          ]
        );
      } else {
        // Real Stripe Dashboard integration
        const dashboardUrl = await paymentService.getStripeDashboardUrl(user?.id || '');
        
        const supported = await Linking.canOpenURL(dashboardUrl);
        if (supported) {
          await Linking.openURL(dashboardUrl);
        } else {
          Alert.alert('Error', 'Cannot open Stripe Dashboard');
        }
      }
    } catch (error) {
      console.error('Error opening Stripe Dashboard:', error);
      Alert.alert('Error', 'Failed to open Stripe Dashboard');
    }
  };

  const renderConnectionStatus = () => {
    if (isLoading) {
      return (
        <MaterialCard style={[styles.statusCard, { backgroundColor: theme.surface }]}>
          <View style={styles.statusContent}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.statusText, { color: theme.text }]}>
              Checking connection...
            </Text>
          </View>
        </MaterialCard>
      );
    }

    if (isConnected && stripeAccount) {
      return (
        <MaterialCard style={[styles.statusCard, { backgroundColor: theme.success + '10' }]}>
          <View style={styles.statusContent}>
            <View style={[styles.statusIcon, { backgroundColor: theme.success }]}>
              <IconFallback name="check" size={24} color="white" />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: theme.success }]}>
                Connected to Stripe
              </Text>
              <Text style={[styles.statusSubtitle, { color: theme.textSecondary }]}>
                Account: {stripeAccount.email}
              </Text>
              <Text style={[styles.statusSubtitle, { color: theme.textSecondary }]}>
                Payouts: {stripeAccount.payouts_enabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        </MaterialCard>
      );
    }

    return (
      <MaterialCard style={[styles.statusCard, { backgroundColor: theme.warning + '10' }]}>
        <View style={styles.statusContent}>
          <View style={[styles.statusIcon, { backgroundColor: theme.warning }]}>
            <IconFallback name="warning" size={24} color="white" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: theme.warning }]}>
              Not Connected
            </Text>
            <Text style={[styles.statusSubtitle, { color: theme.textSecondary }]}>
              Connect your Stripe account to receive payouts
            </Text>
          </View>
        </View>
      </MaterialCard>
    );
  };

  const renderAccountDetails = () => {
    if (!isConnected || !stripeAccount) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Details</Text>
        
        <MaterialCard style={[styles.detailCard, { backgroundColor: theme.surface }]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Account ID</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{stripeAccount.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Email</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{stripeAccount.email}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Country</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{stripeAccount.country}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Currency</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{stripeAccount.currency.toUpperCase()}</Text>
          </View>
        </MaterialCard>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Stripe Connect"
        subtitle="Manage your payout account"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showStatusBar={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Connection Status</Text>
          {renderConnectionStatus()}
        </View>

        {/* Account Details */}
        {renderAccountDetails()}

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>What you can do</Text>
          
          <MaterialCard style={[styles.featureCard, { backgroundColor: theme.surface }]}>
            <View style={styles.featureItem}>
              <IconFallback name="account-balance" size={20} color={theme.primary} />
              <Text style={[styles.featureText, { color: theme.text }]}>
                Receive automatic payouts
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <IconFallback name="security" size={20} color={theme.primary} />
              <Text style={[styles.featureText, { color: theme.text }]}>
                Secure bank account verification
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <IconFallback name="receipt" size={20} color={theme.primary} />
              <Text style={[styles.featureText, { color: theme.text }]}>
                Access tax documents (1099s)
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <IconFallback name="language" size={20} color={theme.primary} />
              <Text style={[styles.featureText, { color: theme.text }]}>
                Multi-currency support
              </Text>
            </View>
          </MaterialCard>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          {!isConnected ? (
            <MaterialButton
              title="Connect Stripe Account"
              onPress={handleConnectStripe}
              loading={isLoading}
              style={styles.connectButton}
            />
          ) : (
            <View style={styles.actionButtons}>
              <MaterialButton
                title="Manage Account"
                onPress={handleManageAccount}
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
              />
              <MaterialButton
                title="Disconnect"
                onPress={handleDisconnectStripe}
                style={[styles.actionButton, { backgroundColor: theme.error }]}
              />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.section}>
          <MaterialCard style={[styles.infoCard, { backgroundColor: theme.info + '10' }]}>
            <View style={styles.infoContent}>
              <IconFallback name="info" size={20} color={theme.info} />
              <Text style={[styles.infoText, { color: theme.text }]}>
                Stripe Connect is a secure platform that handles all bank account verification, 
                compliance, and payout processing. Your financial data is protected by Stripe's 
                industry-leading security standards.
              </Text>
            </View>
          </MaterialCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  detailCard: {
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  featureCard: {
    padding: 16,
    borderRadius: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  connectButton: {
    paddingVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});
