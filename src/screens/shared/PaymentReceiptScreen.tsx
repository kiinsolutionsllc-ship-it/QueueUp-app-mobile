import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePayment } from '../../contexts/PaymentContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import { FadeIn } from '../../components/shared/Animations';


interface PaymentReceiptScreenProps {
  navigation: any;
  route: {
    params?: any;
  };
}
export default function PaymentReceiptScreen({ navigation, route }: PaymentReceiptScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { t } = useLanguage();
  const { payments } = usePayment();
  const theme = getCurrentTheme();

  const { paymentId } = route.params || {};
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    const foundPayment = payments.find(p => p.id === paymentId);
    setPayment(foundPayment);
  }, [paymentId, payments]);

  const handleShareReceipt = async () => {
    if (!payment) return;

    try {
      const receiptText = `
QueueUp Payment Receipt
========================

Payment ID: #${payment.id}
Job ID: #${payment.jobId}
Date: ${new Date(payment.createdAt).toLocaleDateString()}
Status: ${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}

Payment Details:
- Service Cost: $${payment.mechanicAmount}
- Platform Fee (10%): $${payment.platformFee}
- Total Paid: $${payment.amount}

Payment Method: ${payment.paymentMethod === 'card' ? 'Credit Card' : 'PayPal'}

Thank you for using QueueUp!
      `.trim();

      await Share.share({
        message: receiptText,
        title: 'Payment Receipt',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt');
    }
  };

  const handlePrintReceipt = () => {
    Alert.alert(
      'Print Receipt',
      'Print functionality would be implemented here. This would typically use a printing service or generate a PDF.',
      [{ text: 'OK' }]
    );
  };

  if (!payment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ModernHeader
          title="Payment Receipt"
          subtitle="Loading receipt..."
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading receipt...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Payment Receipt"
        subtitle="Transaction details and receipt"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          {
            icon: 'share',
            onPress: handleShareReceipt,
            color: theme.primary,
          },
        ]}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FadeIn delay={100}>
          <MaterialCard style={styles.receiptCard}>
            {/* Header */}
            <View style={styles.receiptHeader}>
              <View style={styles.logoContainer}>
                <IconFallback name="directions-car" size={32} color={theme.orange} />
              </View>
              <Text style={[styles.appName, { color: theme.text }]}>QueueUp</Text>
              <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
                Premium Automotive Service Platform
              </Text>
            </View>

            {/* Receipt Info */}
            <View style={styles.receiptInfo}>
              <Text style={[styles.receiptTitle, { color: theme.text }]}>
                PAYMENT RECEIPT
              </Text>
              <Text style={[styles.receiptNumber, { color: theme.textSecondary }]}>
                Receipt #${payment.id}
              </Text>
              <Text style={[styles.receiptDate, { color: theme.textSecondary }]}>
                {new Date(payment.createdAt).toLocaleString()}
              </Text>
            </View>

            {/* Payment Details */}
            <View style={styles.paymentDetails}>
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
                  Description
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {payment.description}
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
                  Status
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: theme.success + '20' }]}>
                  <Text style={[styles.statusText, { color: theme.success }]}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Amount Breakdown */}
            <View style={styles.amountBreakdown}>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>
                  Service Cost
                </Text>
                <Text style={[styles.breakdownValue, { color: theme.text }]}>
                  ${payment.mechanicAmount}
                </Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>
                  Platform Fee (10%)
                </Text>
                <Text style={[styles.breakdownValue, { color: theme.text }]}>
                  ${payment.platformFee}
                </Text>
              </View>

              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>
                  TOTAL PAID
                </Text>
                <Text style={[styles.totalValue, { color: theme.orange }]}>
                  ${payment.amount}
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.receiptFooter}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                Thank you for using QueueUp!
              </Text>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                For support, contact us at support@queued.app
              </Text>
            </View>
          </MaterialCard>
        </FadeIn>

        {/* Actions */}
        <FadeIn delay={200}>
          <View style={styles.actionsContainer}>
            <MaterialButton
              title="Share Receipt"
              onPress={handleShareReceipt}
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              textStyle={{ color: theme.onPrimary }}
              leftIcon="share"
            />
            
            <MaterialButton
              title="Print Receipt"
              onPress={handlePrintReceipt}
              style={[styles.actionButton, styles.printButton, { borderColor: theme.primary }]}
              textStyle={{ color: theme.primary }}
              leftIcon="print"
            />
          </View>
        </FadeIn>

        {/* Additional Info */}
        <FadeIn delay={300}>
          <MaterialCard style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <IconFallback name="info" size={20} color={theme.primary} />
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                Important Information
              </Text>
            </View>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • This receipt serves as proof of payment for tax purposes
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • Keep this receipt for your records
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • For disputes or refunds, contact support within 30 days
            </Text>
          </MaterialCard>
        </FadeIn>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  receiptCard: {
    marginVertical: 16,
    padding: 24,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 14,
    textAlign: 'center',
  },
  receiptInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  receiptNumber: {
    fontSize: 14,
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 14,
  },
  paymentDetails: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountBreakdown: {
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  receiptFooter: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 0,
  },
  printButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});
