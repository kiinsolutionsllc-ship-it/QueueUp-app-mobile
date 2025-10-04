/**
 * Simplified Payment Modal
 * Uses backend API instead of Stripe components
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { paymentServiceNew as PaymentServiceNew } from '../../services/PaymentServiceNew';

interface SimplePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  description?: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

export default function SimplePaymentModal({
  visible,
  onClose,
  amount,
  currency = 'USD',
  description = '',
  onPaymentSuccess,
  onPaymentError,
}: SimplePaymentModalProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();
  const styles = createStyles(theme);

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load payment methods when modal opens
  useEffect(() => {
    if (visible && user) {
      loadPaymentMethods();
    }
  }, [visible, user]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await PaymentServiceNew.getPaymentMethods(user?.id || '');
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    try {
      setIsProcessing(true);

      const result = await PaymentServiceNew.processPayment({
        amount,
        currency: currency.toLowerCase(),
        paymentMethodId: selectedMethod,
        customerId: user?.id || null,
        metadata: {
          description,
          user_id: user?.id,
        },
      });

      if (result.success) {
        onPaymentSuccess(result);
        onClose();
      } else {
        onPaymentError(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Payment Summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>{formatAmount(amount)}</Text>
            </View>
            {description && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Description:</Text>
                <Text style={styles.summaryValue}>{description}</Text>
              </View>
            )}
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentMethods}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={styles.loadingText}>Loading payment methods...</Text>
              </View>
            ) : (
              <View style={styles.methodsList}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.methodItem,
                      selectedMethod === method.id && styles.methodItemSelected,
                    ]}
                    onPress={() => setSelectedMethod(method.id)}
                  >
                    <View style={styles.methodInfo}>
                      <MaterialIcons
                        name={method.card?.brand === 'visa' ? 'credit-card' : 'payment'}
                        size={24}
                        color={theme.primary}
                      />
                      <View style={styles.methodDetails}>
                        <Text style={styles.methodBrand}>
                          {method.card?.brand?.toUpperCase() || 'CARD'}
                        </Text>
                        <Text style={styles.methodLast4}>
                          **** {method.card?.last4}
                        </Text>
                      </View>
                    </View>
                    {selectedMethod === method.id && (
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color={theme.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Payment Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.payButton,
              (!selectedMethod || isProcessing) && styles.payButtonDisabled,
            ]}
            onPress={handlePayment}
            disabled={!selectedMethod || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.payButtonText}>
                Pay {formatAmount(amount)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summary: {
    backgroundColor: theme.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
  },
  paymentMethods: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.textSecondary,
  },
  methodsList: {
    gap: 12,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodItemSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryLight || theme.background,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodDetails: {
    marginLeft: 12,
  },
  methodBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  methodLast4: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  payButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    backgroundColor: theme.textSecondary,
    opacity: 0.6,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
