// Stripe Payment Flow Component
// Handles the complete payment flow with proper error handling and mock support

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useStripeHook, useElementsHook } from '../../providers/StripeProvider';
import { useTheme } from '../../contexts/ThemeContext';
import { MOCK_MODE, MOCK_SETTINGS } from '../../config/payment';
import MaterialButton from '../shared/MaterialButton';
import MaterialCard from '../shared/MaterialCard';
import IconFallback from '../shared/IconFallback';

const StripePaymentFlow = ({
  amount,
  currency = 'usd',
  description = '',
  metadata = {},
  onSuccess,
  onError,
  onCancel,
  style,
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  // Stripe hooks (will be mock hooks in development)
  const stripe = useStripeHook();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('idle'); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);


  // Initialize payment
  useEffect(() => {
    if (amount > 0) {
      initializePayment();
    }
  }, [amount, currency, description, metadata, initializePayment]);

  const initializePayment = useCallback(async () => {
    try {
      setLoading(true);
      setPaymentStep('processing');
      setErrorMessage('');

      if (MOCK_MODE) {
        // Mock payment initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockPaymentIntent = {
          id: `pi_mock_${Date.now()}`,
          client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
          amount: Math.round(amount * 100),
          currency,
          status: 'requires_payment_method',
          metadata: {
            ...metadata,
            mock_mode: true,
          },
        };
        
        setPaymentIntent(mockPaymentIntent);
        setPaymentStep('idle');
      } else {
        // Production payment initialization
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency,
            description,
            metadata,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setPaymentIntent(data.paymentIntent);
        setPaymentStep('idle');
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      setErrorMessage(error.message);
      setPaymentStep('error');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [amount, currency, description, metadata, onError]);

  const handlePayment = async () => {
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
        // Mock payment processing
        const delay = MOCK_SETTINGS.simulateDelays ? MOCK_SETTINGS.delays.paymentConfirmation : 0;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Simulate occasional failures
        if (MOCK_SETTINGS.simulateFailures && Math.random() < MOCK_SETTINGS.failureRate) {
          throw new Error('Payment failed: Insufficient funds');
        }

        // Simulate successful payment
        const mockPaymentMethod = {
          id: `pm_mock_${Date.now()}`,
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
        };

        setPaymentMethod(mockPaymentMethod);
        setPaymentStep('success');
        
        // Simulate success callback
        setTimeout(() => {
          onSuccess?.({
            paymentIntent: {
              ...paymentIntent,
              status: 'succeeded',
            },
            paymentMethod: mockPaymentMethod,
          });
        }, 500);

      } else {
        // Production payment processing
        const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmPayment({
          paymentIntentId: paymentIntent.id,
          paymentMethodId: paymentMethod?.id,
        });

        if (error) {
          throw new Error(error.message);
        }

        setPaymentStep('success');
        onSuccess?.(confirmedPaymentIntent);
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      setErrorMessage(error.message);
      setPaymentStep('error');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setPaymentStep('idle');
    setErrorMessage('');
    initializePayment();
  };

  const handleCancel = () => {
    setPaymentStep('idle');
    setErrorMessage('');
    onCancel?.();
  };

  const renderPaymentStep = () => {
    switch (paymentStep) {
      case 'idle':
        return (
          <View style={styles.stepContainer}>
            <IconFallback name="credit-card" size={48} color={theme.primary} />
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              Ready to Pay
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              {MOCK_MODE ? 'Mock payment ready - tap to simulate payment' : 'Tap to process payment'}
            </Text>
            <Text style={[styles.amount, { color: theme.primary }]}>
              ${(amount ?? 0).toFixed(2)} {currency.toUpperCase()}
            </Text>
            {description && (
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {description}
              </Text>
            )}
          </View>
        );

      case 'processing':
        return (
          <View style={styles.stepContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              Processing Payment
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Please wait while we process your payment...
            </Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.stepContainer}>
            <IconFallback name="check-circle" size={48} color={theme.success} />
            <Text style={[styles.stepTitle, { color: theme.success }]}>
              Payment Successful!
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Your payment has been processed successfully.
            </Text>
            {paymentMethod && (
              <Text style={[styles.paymentMethod, { color: theme.textSecondary }]}>
                Paid with •••• {paymentMethod.card?.last4 || '4242'}
              </Text>
            )}
          </View>
        );

      case 'error':
        return (
          <View style={styles.stepContainer}>
            <IconFallback name="error" size={48} color={theme.error} />
            <Text style={[styles.stepTitle, { color: theme.error }]}>
              Payment Failed
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              {errorMessage || 'An error occurred while processing your payment.'}
            </Text>
            <View style={styles.errorActions}>
              <MaterialButton
                title="Retry"
                onPress={handleRetry}
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
              />
              <MaterialButton
                title="Cancel"
                onPress={handleCancel}
                style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                textColor={theme.text}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <MaterialCard style={[styles.container, style]}>
      {loading && paymentStep === 'idle' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Initializing payment...
          </Text>
        </View>
      ) : (
        <>
          {renderPaymentStep()}
          
          {paymentStep === 'idle' && (
            <View style={styles.actionContainer}>
              <MaterialButton
                title={MOCK_MODE ? 'Simulate Payment' : 'Pay Now'}
                onPress={handlePayment}
                loading={loading}
                disabled={loading || !paymentIntent}
                style={[styles.payButton, { backgroundColor: theme.primary }]}
              />
              <MaterialButton
                title="Cancel"
                onPress={handleCancel}
                style={[styles.cancelButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                textColor={theme.text}
              />
            </View>
          )}
        </>
      )}
      
      {MOCK_MODE && (
        <View style={[styles.mockIndicator, { backgroundColor: theme.warning + '20' }]}>
          <IconFallback name="build" size={16} color={theme.warning} />
          <Text style={[styles.mockText, { color: theme.warning }]}>
            Mock Mode - No real payment will be processed
          </Text>
        </View>
      )}
    </MaterialCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    margin: 16,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  paymentMethod: {
    fontSize: 12,
    marginTop: 8,
  },
  actionContainer: {
    marginTop: 20,
    gap: 12,
  },
  payButton: {
    paddingVertical: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    borderWidth: 1,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  mockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    marginTop: 16,
  },
  mockText: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default StripePaymentFlow;
