import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  Pressable
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PaymentModalProps, PaymentData, PaymentResult } from '../../types/JobTypes';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import { useStripeHook } from '../../providers/StripeProvider';
import { paymentServiceNew as paymentService } from '../../services/PaymentServiceNew';
import { MOCK_MODE } from '../../config/payment';
// import { createJobStyles } from '../../styles/CreateJobScreenStyles';
import IconFallback from '../shared/IconFallback';

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  theme,
  amount,
  onPaymentSuccess,
  onPaymentError,
  isProcessing,
}) => {
  // const styles = createJobStyles(theme);
  const styles = additionalStyles;
  
  // Stripe integration
  const { user } = useAuth();
  const stripe = useStripeHook();
  // Use merged payment service (singleton)
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  // Load saved payment methods when modal opens
  useEffect(() => {
    if (visible) {
      loadSavedPaymentMethods();
    }
  }, [visible]);

  const loadSavedPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      if (MOCK_MODE) {
        // Mock saved payment methods
        setSavedPaymentMethods([
          {
            id: 'pm_card_1234',
            type: 'card',
            card: { last4: '4242', brand: 'visa' },
            isDefault: true,
          },
        ]);
      } else {
        // Real Stripe integration
        const methods = await paymentService.getPaymentMethods(user?.id || '');
        setSavedPaymentMethods(methods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoadingMethods(false);
    }
  };

  // Payment methods
  const paymentMethods = useMemo(() => {
    const methods = [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: 'credit-card',
        description: 'Visa, Mastercard, American Express',
        available: true,
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: 'account-balance-wallet',
        description: 'Pay with your PayPal account',
        available: true,
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        icon: 'phone-iphone',
        description: 'Pay with Touch ID or Face ID',
        available: false, // Would check device capabilities
      },
    ];

    // Add saved payment methods
    if (savedPaymentMethods.length > 0) {
      methods.unshift({
        id: 'saved_methods',
        name: 'Saved Payment Methods',
        icon: 'bookmark',
        description: `${savedPaymentMethods.length} saved method${savedPaymentMethods.length > 1 ? 's' : ''}`,
        available: true,
        isSavedMethods: true,
      } as any);
    }

    return methods;
  }, [savedPaymentMethods]);

  // Format currency
  const formatCurrency = useCallback((amount: number | undefined) => {
    const safeAmount = amount ?? 0;
    return `$${safeAmount.toFixed(2)}`;
  }, []);

  // Handle payment method selection
  const handlePaymentMethodSelect = useCallback((methodId: string) => {
    setSelectedPaymentMethod(methodId);
  }, []);

  // Handle payment processing
  const handlePayment = useCallback(async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method');
      return;
    }

    setIsProcessingPayment(true);

    try {
      if (MOCK_MODE) {
        // Mock implementation for development
        if (selectedPaymentMethod === 'paypal') {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const success = Math.random() > 0.1; // 90% success rate for demo
          
          if (success) {
            const result: PaymentResult = {
              success: true,
              transactionId: `paypal_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              paymentMethod: 'paypal',
            };
            onPaymentSuccess(result);
          } else {
            throw new Error('PayPal payment failed. Please try again.');
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 3000));
          const success = Math.random() > 0.1; // 90% success rate for demo
          
          if (success) {
            const result: PaymentResult = {
              success: true,
              transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              paymentMethod: selectedPaymentMethod,
            };
            onPaymentSuccess(result);
          } else {
            throw new Error('Payment processing failed. Please try again.');
          }
        }
      } else {
        // Real Stripe integration
        if (!stripe) {
          throw new Error('Stripe is not initialized');
        }

        // Create payment intent
        const paymentIntentData = await paymentService.createPaymentIntent({
          amount: amount || 0,
          currency: 'usd',
          customer: user?.id || '',
          metadata: {
            type: 'job_booking_fee',
          },
        });

        let paymentMethodId = null;

        // Handle different payment method types
        if (selectedPaymentMethod === 'saved_methods' && savedPaymentMethods.length > 0) {
          // Use default saved payment method
          const defaultMethod = savedPaymentMethods.find(m => m.isDefault) || savedPaymentMethods[0];
          paymentMethodId = defaultMethod.id;
        } else if (selectedPaymentMethod === 'card') {
          // Create new card payment method
          const { error, paymentMethod } = await stripe.createPaymentMethod({
            paymentMethodType: 'card',
            // In a real implementation, you'd use Stripe Elements for card input
          } as any);

          if (error) {
            throw new Error(error.message);
          }

          paymentMethodId = paymentMethod.id;
        } else if (selectedPaymentMethod === 'paypal') {
          // Handle PayPal through Stripe
          const { error, paymentMethod } = await stripe.createPaymentMethod({
            paymentMethodType: 'paypal',
          } as any);

          if (error) {
            throw new Error(error.message);
          }

          paymentMethodId = paymentMethod.id;
        }

        // Confirm payment
        const { error, paymentIntent } = await stripe.confirmPayment(
          paymentIntentData.client_secret,
          {
            paymentMethodType: paymentMethodId,
          } as any
        );

        if (error) {
          throw new Error(error.message);
        }

        if (paymentIntent.status === 'succeeded') {
          const result: PaymentResult = {
            success: true,
            transactionId: paymentIntent.id,
            paymentMethod: selectedPaymentMethod,
          };
          onPaymentSuccess(result);
        } else {
          throw new Error('Payment was not completed successfully');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onPaymentError(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedPaymentMethod, onPaymentSuccess, onPaymentError, amount, user, stripe, paymentService, savedPaymentMethods]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isProcessingPayment) {
      Alert.alert(
        'Cancel Payment',
        'Are you sure you want to cancel this payment?',
        [
          { text: 'Continue Payment', style: 'cancel' },
          { 
            text: 'Cancel', 
            style: 'destructive',
            onPress: onClose
          },
        ]
      );
    } else {
      onClose();
    }
  }, [isProcessingPayment, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <Pressable 
        style={[styles.modalOverlay, { backgroundColor: theme.background }]}
        onPress={handleCancel}
      >
        <Pressable 
          style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Payment
            </Text>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.closeButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close payment modal"
            >
              <MaterialIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalContent}>
            {/* Payment Amount */}
            <View style={styles.paymentAmountContainer}>
              <Text style={[styles.paymentAmountLabel, { color: theme.textSecondary }]}>
                Amount to Pay
              </Text>
              <Text style={[styles.paymentAmount, { color: theme.primary }]}>
                {formatCurrency(amount)}
              </Text>
            </View>

            {/* Payment Methods */}
            <View style={styles.paymentMethodsContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Select Payment Method
              </Text>
              
              {loadingMethods ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Loading payment methods...
                  </Text>
                </View>
              ) : (
                paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    { borderColor: theme.border },
                    selectedPaymentMethod === method.id && {
                      borderColor: theme.primary,
                      backgroundColor: theme.primary + '10',
                    },
                    !method.available && styles.paymentMethodDisabled,
                  ]}
                  onPress={() => method.available && handlePaymentMethodSelect(method.id)}
                  disabled={!method.available}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${method.name}`}
                  accessibilityHint={method.available ? method.description : 'Not available'}
                  accessibilityState={{ 
                    selected: selectedPaymentMethod === method.id,
                    disabled: !method.available 
                  }}
                >
                  <View style={styles.paymentMethodContent}>
                    <IconFallback
                      name={method.icon}
                      size={24}
                      color={selectedPaymentMethod === method.id ? theme.primary : theme.textSecondary}
                      style={styles.paymentMethodIcon}
                    />
                    <View style={styles.paymentMethodInfo}>
                      <Text
                        style={[
                          styles.paymentMethodName,
                          { 
                            color: selectedPaymentMethod === method.id ? theme.primary : theme.text,
                            opacity: method.available ? 1 : 0.5,
                          }
                        ]}
                      >
                        {method.name}
                      </Text>
                      <Text
                        style={[
                          styles.paymentMethodDescription,
                          { 
                            color: selectedPaymentMethod === method.id ? theme.primary : theme.textSecondary,
                            opacity: method.available ? 1 : 0.5,
                          }
                        ]}
                      >
                        {method.description}
                      </Text>
                    </View>
                    <MaterialIcons
                      name={selectedPaymentMethod === method.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                      size={20}
                      color={selectedPaymentMethod === method.id ? theme.primary : theme.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
                ))
              )}
            </View>

            {/* Security Information */}
            <View style={styles.securityContainer}>
              <Text style={[styles.securityTitle, { color: theme.success }]}>
                Secure Payment
              </Text>
              <View style={styles.securityFeatures}>
                <View style={styles.securityFeature}>
                  <IconFallback
                    name="security"
                    size={16}
                    color={theme.success}
                    style={styles.securityIcon}
                  />
                  <Text style={[styles.securityText, { color: theme.textSecondary }]}>
                    SSL encrypted
                  </Text>
                </View>
                <View style={styles.securityFeature}>
                  <IconFallback
                    name="verified-user"
                    size={16}
                    color={theme.success}
                    style={styles.securityIcon}
                  />
                  <Text style={[styles.securityText, { color: theme.textSecondary }]}>
                    PCI compliant
                  </Text>
                </View>
                <View style={styles.securityFeature}>
                  <IconFallback
                    name="lock"
                    size={16}
                    color={theme.success}
                    style={styles.securityIcon}
                  />
                  <Text style={[styles.securityText, { color: theme.textSecondary }]}>
                    Secure processing
                  </Text>
                </View>
              </View>
            </View>

            {/* Processing State */}
            {(isProcessing || isProcessingPayment) && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.processingText, { color: theme.text }]}>
                  Processing Payment...
                </Text>
                <Text style={[styles.processingSubtext, { color: theme.textSecondary }]}>
                  Please don't close this screen
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={handleCancel}
              disabled={isProcessing || isProcessingPayment}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel payment"
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.payButton,
                { backgroundColor: theme.primary },
                (!selectedPaymentMethod || isProcessing || isProcessingPayment) && styles.payButtonDisabled,
              ]}
              onPress={handlePayment}
              disabled={!selectedPaymentMethod || isProcessing || isProcessingPayment}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Pay ${formatCurrency(amount)}`}
              accessibilityState={{ disabled: !selectedPaymentMethod || isProcessing || isProcessingPayment }}
            >
              <Text style={[styles.payButtonText, { color: theme.onPrimary }]}>
                {isProcessing || isProcessingPayment ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Additional styles for this component
const additionalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
  },
  modalContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  paymentAmountContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 20,
  },
  paymentAmountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  paymentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  paymentMethodsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentMethodCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentMethodDisabled: {
    opacity: 0.5,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  paymentMethodDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  securityContainer: {
    marginBottom: 20,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  securityFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityIcon: {
    marginRight: 4,
  },
  securityText: {
    fontSize: 12,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  processingSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  payButton: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default PaymentModal;
