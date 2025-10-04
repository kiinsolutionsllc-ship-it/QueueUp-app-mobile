import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { StepComponentProps, PaymentData, PaymentResult } from '../../types/JobTypes';
import { useTheme } from '../../contexts/ThemeContext';
import { createJobStyles } from '../../styles/CreateJobScreenStyles';
import IconFallback from '../shared/IconFallback';
import { paymentServiceNew as paymentService } from '../../services/PaymentServiceNew';
// Stripe components removed - using backend API instead
import { MOCK_MODE } from '../../config/payment';

// Clean, modern styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  paymentGrid: {
    gap: 12,
  },
  paymentCard: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 80,
  },
  paymentCardSelected: {
    borderColor: '#0891B2',
    shadowColor: '#0891B2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  paymentIcon: {
    marginRight: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentContent: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectionIndicatorSelected: {
    backgroundColor: '#0891B2',
    borderColor: '#0891B2',
  },
  cardInputContainer: {
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardField: {
    height: 50,
    marginVertical: 8,
  },
  cardValidation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  termsCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  termsCheckboxSelected: {
    backgroundColor: '#0891B2',
    borderColor: '#0891B2',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termsLink: {
    color: '#0891B2',
    fontWeight: '600',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});

interface PostingDepositStepProps extends StepComponentProps {
  onPaymentSuccess: (result: PaymentResult) => void;
  onPaymentError: (error: string) => void;
  onShowPaymentModal: () => void;
  onScrollToBottom: (event: any) => void;
  onPaymentMethodChange?: (hasPaymentMethod: boolean) => void;
  onTermsAccepted?: (termsAccepted: boolean) => void;
  onCardDetailsComplete?: (complete: boolean) => void;
  onPaymentMethodSelect?: (methodId: string | null) => void;
  isPaymentProcessing?: boolean;
  paymentError?: string | null;
}

const PostingDepositStep: React.FC<PostingDepositStepProps> = ({
  formData,
  updateFormData,
  theme,
  onNext,
  onBack,
  canProceed,
  isLoading = false,
  onPaymentSuccess,
  onPaymentError,
  onShowPaymentModal,
  onScrollToBottom,
  onPaymentMethodChange,
  onTermsAccepted,
  onCardDetailsComplete,
  onPaymentMethodSelect,
  isPaymentProcessing = false,
  paymentError = null,
}) => {
  const baseStyles = createJobStyles(theme);
  const combinedStyles = { ...baseStyles, ...styles };
  
  // State management
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [showCardInput, setShowCardInput] = useState(false);
  const [isStripeAvailable, setIsStripeAvailable] = useState(false);
  
  // Stripe integration removed - using backend API
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  // Initialize animations (Stripe removed)
  useEffect(() => {

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Payment methods configuration
  const paymentMethods = useMemo(() => [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'card',
      description: 'Visa, Mastercard, American Express',
      processingFee: 0.029,
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      icon: 'logo-google',
      description: 'Pay with your Google account',
      processingFee: 0.029,
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: 'logo-apple',
      description: 'Pay with Touch ID or Face ID',
      processingFee: 0.029,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'wallet',
      description: 'Pay with your PayPal account',
      processingFee: 0.034,
    },
  ], []);

  // Calculate amounts
  const depositAmount = 10; // $10 booking fee
  const serviceCost = formData.estimatedCost || formData.budget || 0; // Use estimated cost or budget from form data
  const processingFee = useMemo(() => {
    if (!selectedPaymentMethod) return 0;
    const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
    return method ? Math.round(depositAmount * method.processingFee * 100) / 100 : 0;
  }, [selectedPaymentMethod, paymentMethods]);
  
  const totalAmount = depositAmount + processingFee;

  // Handle payment method selection
  const handlePaymentMethodSelect = useCallback((methodId: string) => {
    try {
      console.log('Selecting payment method:', methodId);
      
      setSelectedPaymentMethod(methodId);
      onPaymentMethodSelect?.(methodId);
      
      // Show card input for card payments
      if (methodId === 'card') {
        setShowCardInput(true);
        // In mock mode, automatically set card as complete
        if (MOCK_MODE) {
          setCardDetails({ complete: true });
          onCardDetailsComplete?.(true);
        }
      } else {
        setShowCardInput(false);
        setCardDetails(null);
      }
      
      // Notify parent
      onPaymentMethodChange?.(true);
      console.log('Payment method selected successfully:', methodId);
    } catch (error) {
      console.error('Error selecting payment method:', error);
      Alert.alert(
        'Payment Method Error',
        'There was an error selecting the payment method. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [onPaymentMethodChange, onPaymentMethodSelect, onCardDetailsComplete]);

  // Handle card details change
  const handleCardChange = useCallback((cardDetails: any) => {
    if (MOCK_MODE) {
      // In mock mode, always set card as complete
      setCardDetails({ complete: true });
      onCardDetailsComplete?.(true);
    } else {
      setCardDetails(cardDetails);
      onCardDetailsComplete?.(cardDetails.complete);
    }
  }, [onCardDetailsComplete]);

  // Handle terms acceptance
  const handleTermsToggle = useCallback(() => {
    const newTermsAccepted = !termsAccepted;
    setTermsAccepted(newTermsAccepted);
    onTermsAccepted?.(newTermsAccepted);
  }, [termsAccepted, onTermsAccepted]);

  // Create payment method for card payments
  const createPaymentMethod = useCallback(async () => {
    if (!cardDetails?.complete) {
      throw new Error('Card details are incomplete');
    }

    // For now, return a mock payment method ID since Stripe is removed
    // In a real implementation, this would create a payment method via backend API
    return { id: 'pm_mock_' + Date.now() };
  }, [cardDetails]);

  // Process payment
  const handlePayment = useCallback(async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method');
      return;
    }

    if (!termsAccepted) {
      Alert.alert('Terms Required', 'Please accept the terms and conditions');
      return;
    }

    try {
      console.log('Processing payment...');
      onShowPaymentModal();

      let paymentMethodId = selectedPaymentMethod;

      // Create payment method for card payments
      if (selectedPaymentMethod === 'card') {
        const paymentMethod = await createPaymentMethod();
        paymentMethodId = paymentMethod.id;
      }

      const paymentData: PaymentData = {
        amount: totalAmount,
        currency: 'USD',
        paymentMethodId: paymentMethodId,
        customerId: 'CUSTOMER-' + Date.now(),
        metadata: {
          jobId: 'job_' + Date.now(),
          depositAmount,
          processingFee,
          serviceCost,
          serviceType: formData.serviceType,
          vehicle: formData.vehicle,
        },
      };

      let result: PaymentResult;

      // Use payment service
      result = await processPayment(paymentData);

      if (result.success) {
        onPaymentSuccess(result);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onPaymentError(errorMessage);
    }
  }, [
    selectedPaymentMethod,
    termsAccepted,
    totalAmount,
    depositAmount,
    processingFee,
    serviceCost,
    formData,
    createPaymentMethod,
    onShowPaymentModal,
    onPaymentSuccess,
    onPaymentError,
  ]);

  // Process payment using new payment service
  const processPayment = useCallback(async (paymentData: PaymentData): Promise<PaymentResult> => {
    try {
      // Use the new payment service instead of Stripe
      return await paymentService.processPayment(paymentData);
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return `$${amount.toFixed(2)}`;
  }, []);

  // Render payment method card
  const renderPaymentCard = useCallback((method: any) => {
    const isSelected = selectedPaymentMethod === method.id;
    
    return (
      <TouchableOpacity
        key={method.id}
        style={[
          combinedStyles.paymentCard,
          {
            backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
            borderColor: isSelected ? theme.primary : theme.border,
          },
          isSelected && combinedStyles.paymentCardSelected,
        ]}
        onPress={() => handlePaymentMethodSelect(method.id)}
        activeOpacity={0.7}
      >
        <View style={[
          combinedStyles.paymentIcon,
          {
            backgroundColor: isSelected ? theme.primary + '20' : theme.background,
          }
        ]}>
          <Ionicons 
            name={method.icon as keyof typeof Ionicons.glyphMap} 
            size={24} 
            color={isSelected ? theme.primary : theme.textSecondary} 
          />
        </View>
        
        <View style={combinedStyles.paymentContent}>
          <Text style={[
            combinedStyles.paymentName,
            { color: isSelected ? theme.primary : theme.text }
          ]}>
            {method.name}
          </Text>
          <Text style={[
            combinedStyles.paymentDescription,
            { color: theme.textSecondary }
          ]}>
            {method.description}
          </Text>
        </View>
        
        <View style={[
          combinedStyles.selectionIndicator,
          isSelected && combinedStyles.selectionIndicatorSelected,
          { borderColor: isSelected ? theme.primary : theme.border }
        ]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
      </TouchableOpacity>
    );
  }, [selectedPaymentMethod, theme, combinedStyles, handlePaymentMethodSelect]);

  return (
    <Animated.View 
      style={[
        combinedStyles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <ScrollView 
        style={combinedStyles.scrollView}
        contentContainerStyle={combinedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[
          combinedStyles.heroSection,
          {
            backgroundColor: theme.primary + '15',
            borderColor: theme.primary + '30',
            borderWidth: 2,
          }
        ]}>
          <View style={combinedStyles.heroContent}>
            <View style={[
              combinedStyles.heroIcon,
              { backgroundColor: theme.primary }
            ]}>
              <Ionicons name="card" size={20} color={theme.onPrimary} />
            </View>
            
            <Text style={[
              combinedStyles.heroTitle,
              { color: theme.text }
            ]}>
              {selectedPaymentMethod ? 'Payment Method Selected' : 'Secure Payment'}
            </Text>
            
            <Text style={[
              combinedStyles.heroSubtitle,
              { color: theme.textSecondary }
            ]}>
              {selectedPaymentMethod ? 
                `Complete your ${formatCurrency(totalAmount)} deposit` :
                'Choose a payment method to complete your service request'
              }
            </Text>

            {/* Stripe Status */}
            <View style={[
              combinedStyles.statusIndicator,
              {
                backgroundColor: isStripeAvailable ? theme.success + '20' : theme.warning + '20',
                borderColor: isStripeAvailable ? theme.success : theme.warning,
                borderWidth: 1,
              }
            ]}>
              <Ionicons 
                name={isStripeAvailable ? "shield-checkmark" : "warning"} 
                size={16} 
                color={isStripeAvailable ? theme.success : theme.warning} 
              />
              <Text style={[
                combinedStyles.statusText,
                { color: isStripeAvailable ? theme.success : theme.warning }
              ]}>
                {isStripeAvailable ? 'Secure Stripe Payment' : 'Mock Payment Mode'}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={[
          combinedStyles.summaryCard,
          { backgroundColor: theme.surface, borderColor: theme.border }
        ]}>
          <View style={combinedStyles.summaryHeader}>
            <View style={[
              combinedStyles.summaryIcon,
              { backgroundColor: theme.primary + '20' }
            ]}>
              <Ionicons name="receipt" size={20} color={theme.primary} />
            </View>
            <Text style={[
              combinedStyles.summaryTitle,
              { color: theme.text }
            ]}>
              Payment Summary
            </Text>
          </View>
          
          <View style={combinedStyles.summaryRow}>
            <Text style={[combinedStyles.summaryLabel, { color: theme.textSecondary }]}>
              Service Cost
            </Text>
            <Text style={[combinedStyles.summaryValue, { color: theme.text }]}>
              {formatCurrency(serviceCost)}
            </Text>
          </View>
          
          {serviceCost > 0 && (
            <View style={[combinedStyles.summaryRow, { marginTop: -8 }]}>
              <Text style={[combinedStyles.summaryLabel, { color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }]}>
                (Paid after service completion)
              </Text>
            </View>
          )}
          
          <View style={combinedStyles.summaryRow}>
            <Text style={[combinedStyles.summaryLabel, { color: theme.textSecondary }]}>
              Booking Fee
            </Text>
            <Text style={[combinedStyles.summaryValue, { color: theme.text }]}>
              {formatCurrency(depositAmount)}
            </Text>
          </View>
          
          {processingFee > 0 && (
            <View style={combinedStyles.summaryRow}>
              <Text style={[combinedStyles.summaryLabel, { color: theme.textSecondary }]}>
                Processing Fee
              </Text>
              <Text style={[combinedStyles.summaryValue, { color: theme.text }]}>
                {formatCurrency(processingFee)}
              </Text>
            </View>
          )}
          
          <View style={[
            combinedStyles.totalRow,
            {
              backgroundColor: theme.primary + '10',
              borderColor: theme.primary + '30',
              borderWidth: 1,
            }
          ]}>
            <Text style={[combinedStyles.totalLabel, { color: theme.primary }]}>
              Total Due Now
            </Text>
            <Text style={[combinedStyles.totalValue, { color: theme.primary }]}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={combinedStyles.sectionContainer}>
          <Text style={[combinedStyles.sectionTitle, { color: theme.text }]}>
            Choose Payment Method
          </Text>
          
          <View style={combinedStyles.paymentGrid}>
            {paymentMethods.map(renderPaymentCard)}
          </View>

          {/* Card Input */}
          {showCardInput && selectedPaymentMethod === 'card' && (
            <View style={[
              combinedStyles.cardInputContainer,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}>
              <Text style={[combinedStyles.cardInputLabel, { color: theme.text }]}>
                Card Details
              </Text>
              
              {/* Card input removed - using backend payment methods */}
              <View style={{
                height: 50,
                backgroundColor: theme.background,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                justifyContent: 'center',
                marginVertical: 8,
              }}>
                <Text style={{ color: theme.text, fontSize: 16 }}>
                  💳 Payment methods managed by backend
                </Text>
              </View>
              
              {(cardDetails?.complete || MOCK_MODE) && (
                <View style={[
                  combinedStyles.cardValidation,
                  {
                    backgroundColor: theme.success + '20',
                    borderColor: theme.success + '40',
                    borderWidth: 1,
                  }
                ]}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <Text style={[
                    combinedStyles.statusText,
                    { color: theme.success, marginLeft: 8 }
                  ]}>
                    {MOCK_MODE ? '🧪 Mock card details are valid' : 'Card details are valid'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Terms and Conditions */}
        <TouchableOpacity
          style={[
            combinedStyles.termsContainer,
            {
              backgroundColor: termsAccepted ? theme.surface : theme.error + '10',
              borderColor: termsAccepted ? theme.border : theme.error,
            }
          ]}
          onPress={handleTermsToggle}
          activeOpacity={0.7}
        >
          <View style={[
            combinedStyles.termsCheckbox,
            termsAccepted && combinedStyles.termsCheckboxSelected,
            { borderColor: termsAccepted ? theme.primary : theme.error }
          ]}>
            {termsAccepted && (
              <Ionicons name="checkmark" size={12} color="white" />
            )}
          </View>
          
          <Text style={[
            combinedStyles.termsText,
            { color: termsAccepted ? theme.text : theme.error }
          ]}>
            I agree to the{' '}
            <Text style={[combinedStyles.termsLink, { color: theme.primary }]}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text style={[combinedStyles.termsLink, { color: theme.primary }]}>
              Privacy Policy
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Payment Processing */}
        {isPaymentProcessing && (
          <View style={[
            combinedStyles.summaryCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.primary + '30',
              borderWidth: 2,
              alignItems: 'center',
            }
          ]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[
              combinedStyles.summaryTitle,
              { color: theme.primary, marginTop: 16, textAlign: 'center' }
            ]}>
              Processing Payment...
            </Text>
            <Text style={[
              combinedStyles.summaryLabel,
              { color: theme.textSecondary, textAlign: 'center', marginTop: 8 }
            ]}>
              Please don't close this screen
            </Text>
          </View>
        )}

        {/* Payment Error */}
        {paymentError && (
          <View style={[
            combinedStyles.summaryCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.error + '30',
              borderWidth: 2,
              alignItems: 'center',
            }
          ]}>
            <Ionicons name="alert-circle" size={32} color={theme.error} />
            <Text style={[
              combinedStyles.summaryTitle,
              { color: theme.error, marginTop: 12, textAlign: 'center' }
            ]}>
              Payment Error
            </Text>
            <Text style={[
              combinedStyles.summaryLabel,
              { color: theme.textSecondary, textAlign: 'center', marginTop: 8 }
            ]}>
              {paymentError}
            </Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

export default PostingDepositStep;
