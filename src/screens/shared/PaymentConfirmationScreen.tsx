import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePayment } from '../../contexts/PaymentContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import { FadeIn, SlideInFromBottom } from '../../components/shared/Animations';


interface PaymentConfirmationScreenProps {
  navigation: any;
  route: {
    params?: any;
  };
}
export default function PaymentConfirmationScreen({ navigation, route }: PaymentConfirmationScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { t } = useLanguage();
  const { payments, releasePayment } = usePayment();
  const theme = getCurrentTheme();

  const { paymentId, jobId } = route.params || {};
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState<any>(false);
  const [fadeAnim] = useState<any>(new Animated.Value(0));
  const [scaleAnim] = useState<any>(new Animated.Value(0.8));

  useEffect(() => {
    // Find the payment by ID
    const foundPayment = payments.find(p => p.id === paymentId);
    setPayment(foundPayment);

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [paymentId, payments]);

  const handleReleasePayment = async () => {
    if (!payment) return;

    Alert.alert(
      'Release Payment',
      'Are you sure you want to release the payment to the mechanic? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release Payment',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await releasePayment(payment.id);
              if (result.success) {
                Alert.alert(
                  'Payment Released',
                  'The payment has been successfully released to the mechanic.',
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to release payment');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDisputePayment = () => {
    Alert.alert(
      'Dispute Payment',
      'If you have an issue with the service, please contact support. A dispute will be opened and reviewed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Dispute',
          onPress: () => {
            // Navigate to support or dispute screen
            navigation.navigate('HelpSupport');
          },
        },
      ]
    );
  };

  if (!payment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ModernHeader
          title="Payment Details"
          subtitle="Loading payment information..."
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading payment details...
          </Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.success;
      case 'escrow': return theme.warning;
      case 'refunded': return theme.error;
      case 'disputed': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'escrow': return 'schedule';
      case 'refunded': return 'money-off';
      case 'disputed': return 'warning';
      default: return 'help';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Payment Confirmation"
        subtitle="Payment details and status"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Payment Status */}
          <FadeIn delay={100}>
            <MaterialCard style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusIcon, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
                  <IconFallback name={getStatusIcon(payment.status)} size={24} color={getStatusColor(payment.status)} />
                </View>
                <View style={styles.statusInfo}>
                  <Text style={[styles.statusTitle, { color: theme.text }]}>
                    Payment {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Text>
                  <Text style={[styles.statusSubtitle, { color: theme.textSecondary }]}>
                    {payment.status === 'escrow' 
                      ? 'Held in escrow until service completion'
                      : payment.status === 'completed'
                      ? 'Successfully released to mechanic'
                      : 'Payment status information'
                    }
                  </Text>
                </View>
              </View>
            </MaterialCard>
          </FadeIn>

          {/* Payment Details */}
          <FadeIn delay={200}>
            <MaterialCard style={styles.detailsCard}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Payment Details
              </Text>
              
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Payment ID
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  #{payment.id}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Job ID
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  #{payment.jobId}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Payment Method
                </Text>
                <View style={styles.paymentMethodInfo}>
                  <IconFallback name={payment.paymentMethod === 'card' ? 'credit-card' : 'account-balance-wallet'} size={16} color={theme.primary} />
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {payment.paymentMethod === 'card' ? 'Credit Card' : 'PayPal'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Created
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {new Date(payment.createdAt).toLocaleDateString()}
                </Text>
              </View>

              {payment.completedAt && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                    Completed
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {new Date(payment.completedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </MaterialCard>
          </FadeIn>

          {/* Payment Summary */}
          <FadeIn delay={300}>
            <MaterialCard style={styles.summaryCard}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Payment Summary
              </Text>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Service Cost
                </Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  ${payment.mechanicAmount}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Platform Fee (10%)
                </Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  ${payment.platformFee}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>
                  Total Paid
                </Text>
                <Text style={[styles.totalValue, { color: theme.primary }]}>
                  ${payment.amount}
                </Text>
              </View>
            </MaterialCard>
          </FadeIn>

          {/* Actions */}
          {payment.status === 'escrow' && (
            <FadeIn delay={400}>
              <View style={styles.actionsContainer}>
                <MaterialButton
                  title="Release Payment"
                  onPress={handleReleasePayment}
                  loading={loading}
                  style={[styles.actionButton, { backgroundColor: theme.success }]}
                  textStyle={{ color: theme.onSuccess }}
                />
                
                <MaterialButton
                  title="Open Dispute"
                  onPress={handleDisputePayment}
                  style={[styles.actionButton, styles.disputeButton, { borderColor: theme.error }]}
                  textStyle={{ color: theme.error }}
                />
              </View>
            </FadeIn>
          )}

          {/* Receipt Download */}
          <FadeIn delay={500}>
            <MaterialCard style={styles.receiptCard}>
              <View style={styles.receiptHeader}>
                <IconFallback name="receipt" size={20} color={theme.primary} />
                <Text style={[styles.receiptTitle, { color: theme.text }]}>
                  Receipt
                </Text>
              </View>
              <Text style={[styles.receiptDescription, { color: theme.textSecondary }]}>
                Download your payment receipt for tax purposes
              </Text>
              <TouchableOpacity
                style={[styles.downloadButton, { backgroundColor: theme.primary + '20' }]}
                onPress={() => {
                  // Implement receipt download
                  Alert.alert('Receipt', 'Receipt download functionality would be implemented here');
                }}
              >
                <IconFallback name="download" size={16} color={theme.primary} />
                <Text style={[styles.downloadText, { color: theme.primary }]}>
                  Download Receipt
                </Text>
              </TouchableOpacity>
            </MaterialCard>
          </FadeIn>
        </Animated.View>
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
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 0,
  },
  disputeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  receiptCard: {
    marginBottom: 16,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  receiptDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  downloadText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
