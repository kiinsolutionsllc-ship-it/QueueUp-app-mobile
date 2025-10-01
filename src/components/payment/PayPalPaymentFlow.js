// PayPal Payment Flow Component
// Handles PayPal payments through Stripe integration

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { MOCK_MODE } from '../../config/payment';
import { paypalService } from '../../services/PayPalService';
import MaterialButton from '../shared/MaterialButton';
import MaterialCard from '../shared/MaterialCard';
import IconFallback from '../shared/IconFallback';

const PayPalPaymentFlow = ({
  amount,
  currency = 'USD',
  description = '',
  metadata = {},
  onSuccess,
  onError,
  onCancel,
  style,
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('idle'); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isPayPalAvailable, setIsPayPalAvailable] = useState(false);

  // Initialize PayPal service and check availability
  useEffect(() => {
    initializePayPal();
  }, []);

  const initializePayPal = async () => {
    try {
      const initResult = await paypalService.initialize();
      if (initResult.success) {
        const available = paypalService.isPayPalAvailable('US', currency);
        setIsPayPalAvailable(available);
        
        if (available && amount > 0) {
          await createPayPalPaymentIntent();
        }
      } else {
        setErrorMessage('PayPal service initialization failed');
        setPaymentStep('error');
      }
    } catch (error) {
      console.error('PayPal initialization error:', error);
      setErrorMessage('Failed to initialize PayPal service');
      setPaymentStep('error');
    }
  };

  const createPayPalPaymentIntent = async () => {
    try {
      setLoading(true);
      setPaymentStep('processing');
      setErrorMessage('');

      const result = await paypalService.createPayPalPaymentIntent(
        amount,
        currency,
        {
          ...metadata,
          description: description || `Payment for ${amount} ${currency}`,
        }
      );

      if (result.success) {
        setPaymentIntent(result.paymentIntent);
        setPaymentStep('idle');
      } else {
        throw new Error(result.error || 'Failed to create PayPal payment intent');
      }
    } catch (error) {
      console.error('PayPal payment intent creation error:', error);
      setErrorMessage(error.message);
      setPaymentStep('error');
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    if (!paymentIntent) {
      setErrorMessage('Payment not initialized');
      setPaymentStep('error');
      return;
    }

    try {
      setLoading(true);
      setPaymentStep('processing');
      setErrorMessage('');

      if (MOCK_MODE) {
        // Mock PayPal payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate occasional failures
        if (Math.random() < 0.1) { // 10% failure rate
          throw new Error('PayPal payment failed: User cancelled');
        }

        // Simulate successful PayPal payment
        const mockResult = {
          id: paymentIntent.id,
          status: 'succeeded',
          payment_method: {
            id: `pm_paypal_mock_${Date.now()}`,
            type: 'paypal',
            paypal: {
              payer_email: 'customer@example.com',
              payer_id: 'PAYPAL_PAYER_ID_MOCK'
            }
          },
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
        };

        setPaymentStep('success');
        
        // Simulate success callback
        setTimeout(() => {
          onSuccess?.(mockResult);
        }, 500);

      } else {
        // Production PayPal payment processing
        const result = await paypalService.confirmPayPalPayment(paymentIntent.id);

        if (result.success) {
          setPaymentStep('success');
          onSuccess?.(result.paymentIntent);
        } else {
          throw new Error(result.error || 'PayPal payment failed');
        }
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      setErrorMessage(error.message);
      setPaymentStep('error');
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (paymentIntent) {
      paypalService.cancelPayPalPayment(paymentIntent.id);
    }
    onCancel?.();
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (!isPayPalAvailable) {
    return (
      <MaterialCard style={[styles.container, style]}>
        <View style={styles.unavailableContainer}>
          <IconFallback name="account-balance-wallet" size={48} color={theme.textSecondary} />
          <Text style={[styles.unavailableTitle, { color: theme.text }]}>
            PayPal Not Available
          </Text>
          <Text style={[styles.unavailableText, { color: theme.textSecondary }]}>
            PayPal is not available for {currency} payments in your region.
          </Text>
        </View>
      </MaterialCard>
    );
  }

  return (
    <MaterialCard style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={[styles.paypalIcon, { backgroundColor: '#0070ba' }]}>
          <IconFallback name="account-balance-wallet" size={24} color="#ffffff" />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>Pay with PayPal</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Secure payment through PayPal
          </Text>
        </View>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>Amount</Text>
        <Text style={[styles.amount, { color: theme.text }]}>
          {formatAmount(amount, currency)}
        </Text>
      </View>

      {description && (
        <View style={styles.descriptionContainer}>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {description}
          </Text>
        </View>
      )}

      {paymentStep === 'error' && (
        <View style={[styles.errorContainer, { backgroundColor: theme.error + '10' }]}>
          <IconFallback name="error" size={20} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>
            {errorMessage}
          </Text>
        </View>
      )}

      {paymentStep === 'success' && (
        <View style={[styles.successContainer, { backgroundColor: theme.success + '10' }]}>
          <IconFallback name="check-circle" size={20} color={theme.success} />
          <Text style={[styles.successText, { color: theme.success }]}>
            Payment successful!
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {paymentStep === 'idle' && (
          <MaterialButton
            title="Pay with PayPal"
            onPress={handlePayPalPayment}
            loading={loading}
            disabled={loading || !paymentIntent}
            style={[styles.paypalButton, { backgroundColor: '#0070ba' }]}
            textStyle={styles.paypalButtonText}
            icon="account-balance-wallet"
          />
        )}

        {paymentStep === 'processing' && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#0070ba" />
            <Text style={[styles.processingText, { color: theme.text }]}>
              Processing PayPal payment...
            </Text>
          </View>
        )}

        {paymentStep === 'error' && (
          <View style={styles.retryContainer}>
            <MaterialButton
              title="Try Again"
              onPress={createPayPalPaymentIntent}
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
            />
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.securityContainer}>
        <IconFallback name="security" size={16} color={theme.textSecondary} />
        <Text style={[styles.securityText, { color: theme.textSecondary }]}>
          Secured by PayPal and Stripe
        </Text>
      </View>
    </MaterialCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  paypalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 112, 186, 0.05)',
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  paypalButton: {
    height: 50,
    borderRadius: 8,
  },
  paypalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
  },
  retryContainer: {
    gap: 12,
  },
  retryButton: {
    height: 50,
    borderRadius: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  securityText: {
    marginLeft: 8,
    fontSize: 12,
  },
  unavailableContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  unavailableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  unavailableText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PayPalPaymentFlow;
