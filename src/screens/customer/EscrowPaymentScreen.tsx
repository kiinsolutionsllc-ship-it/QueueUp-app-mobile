import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useJob } from '../../contexts/SimplifiedJobContext';
import IconFallback from '../../components/shared/IconFallback';
import { FadeIn } from '../../components/shared/Animations';
import { hapticService } from '../../services/HapticService';
import { useStripeHook } from '../../providers/StripeProvider';
import { paymentServiceNew as paymentService } from '../../services/PaymentServiceNew';
import { MOCK_MODE } from '../../config/payment';
// JobAssignmentService removed - using UnifiedJobService through SimplifiedJobContext

const EscrowPaymentScreen = ({ navigation, route }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  // Stripe integration
  const stripe = useStripeHook();
  // Use merged payment service (singleton)

  const { job, bid } = route.params;
  const [loading, setLoading] = useState<any>(false);
  const [paymentStep, setPaymentStep] = useState<any>('ready'); // ready, processing, success, error
  const [paymentError, setPaymentError] = useState<any>(null);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  // Calculate escrow amount (15% of bid amount)
  const escrowAmount = Math.round(bid.amount * 0.15 * 100) / 100;
  const finalBalance = bid.amount - escrowAmount;

  useEffect(() => {
    // Set up back handler to prevent going back during payment
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (paymentStep === 'processing') {
        e.preventDefault();
        Alert.alert(
          'Payment in Progress',
          'Please wait for the payment to complete before going back.',
          [{ text: 'OK' }]
        );
      }
    });

    return unsubscribe;
  }, [navigation, paymentStep]);

  const handleEscrowPayment = async () => {
    try {
      setLoading(true);
      setPaymentStep('processing');
      setPaymentError(null);
      
      await hapticService.medium();

      if (MOCK_MODE) {
        // Mock implementation for development
        await new Promise(resolve => setTimeout(resolve, 3000));
        setPaymentStep('success');
        await hapticService.success();
        
        // Show success and navigate
        setTimeout(() => {
          Alert.alert(
            'Payment Successful!',
            `Your escrow deposit of $${escrowAmount} has been secured. ${bid.mechanic.name} has been notified and will contact you soon.`,
            [
              {
                text: 'View Job Details',
                onPress: () => navigation.navigate('Jobs'),
              },
            ]
          );
        }, 2000);
      } else {
        // Real Stripe integration
        if (!stripe) {
          throw new Error('Stripe is not initialized');
        }

        // 1. Create payment intent with Stripe
        const paymentIntentData = await paymentService.createPaymentIntent({
          amount: escrowAmount,
          currency: 'usd',
          customer: user?.id || '',
          metadata: {
            jobId: job.id,
            bidId: bid.id,
            type: 'escrow_deposit',
            mechanicId: bid.mechanic.id,
          },
        });

        setPaymentIntent(paymentIntentData);

        // 2. Confirm payment with Stripe
        const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmPayment(
          paymentIntentData.client_secret,
          {
            paymentMethodType: {
              // Use default payment method or prompt for new one
              type: 'card',
            },
          } as any
        );

        if (error) {
          throw new Error(error.message);
        }

        if (confirmedPaymentIntent.status === 'succeeded') {
          // 3. Update job status and notify mechanic
          await paymentService.processEscrowPayment({
            jobId: job.id,
            bidId: bid.id,
            paymentIntentId: confirmedPaymentIntent.id,
            amount: escrowAmount,
            customerId: user?.id || '',
            mechanicId: bid.mechanic.id,
          });

          setPaymentStep('success');
          await hapticService.success();
          
          // Show success and navigate
          setTimeout(() => {
            Alert.alert(
              'Payment Successful!',
              `Your escrow deposit of $${escrowAmount} has been secured. ${bid.mechanic.name} has been notified and will contact you soon.`,
              [
                {
                  text: 'View Job Details',
                  onPress: () => navigation.navigate('Jobs'),
                },
              ]
            );
          }, 2000);
        } else {
          throw new Error('Payment was not completed successfully');
        }
      }
      
    } catch (error) {
      setPaymentStep('error');
      setPaymentError((error instanceof Error ? error.message : 'Unknown error') || 'Payment failed. Please try again.');
      await hapticService.error();
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentStep = () => {
    switch (paymentStep) {
      case 'ready':
        return (
          <FadeIn delay={200}>
            <View style={styles.paymentContent}>
              {/* Job Summary */}
              <View style={[styles.jobSummary, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Summary</Text>
                <View style={styles.jobDetails}>
                  <Text style={[styles.jobTitle, { color: theme.text }]}>
                    {job.category} - {job.subcategory?.name || job.subcategory || 'General'}
                  </Text>
                  <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
                    {job.description}
                  </Text>
                  <View style={styles.jobInfo}>
                    <View style={styles.jobInfoItem}>
                      <IconFallback name="directions-car" size={16} color={theme.textSecondary} />
                      <Text style={[styles.jobInfoText, { color: theme.textSecondary }]}>
                        {job.vehicle?.year} {job.vehicle?.make} {job.vehicle?.model}
                      </Text>
                    </View>
                    <View style={styles.jobInfoItem}>
                      <IconFallback name="schedule" size={16} color={theme.textSecondary} />
                      <Text style={[styles.jobInfoText, { color: theme.textSecondary }]}>
                        {bid.estimated_duration} minutes
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Selected Mechanic */}
              <View style={[styles.mechanicCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Selected Mechanic</Text>
                <View style={styles.mechanicInfo}>
                  <View style={[styles.mechanicAvatar, { backgroundColor: theme.primary + '20' }]}>
                    <IconFallback name="person" size={24} color={theme.primary} />
                  </View>
                  <View style={styles.mechanicDetails}>
                    <Text style={[styles.mechanicName, { color: theme.text }]}>
                      {bid.mechanic.name}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <IconFallback name="star" size={14} color="#FFD700" />
                      <Text style={[styles.rating, { color: theme.textSecondary }]}>
                        {bid.mechanic.rating} ({bid.mechanic.review_count} reviews)
                      </Text>
                    </View>
                    <Text style={[styles.mechanicLocation, { color: theme.textSecondary }]}>
                      {bid.mechanic.location}
                    </Text>
                  </View>
                </View>
                <View style={[styles.bidMessage, { backgroundColor: theme.background }]}>
                  <Text style={[styles.bidMessageText, { color: theme.text }]}>
                    "{bid.message}"
                  </Text>
                </View>
              </View>

              {/* Payment Breakdown */}
              <View style={[styles.paymentBreakdown, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Breakdown</Text>
                <View style={styles.paymentItems}>
                  <View style={styles.paymentItem}>
                    <Text style={[styles.paymentLabel, { color: theme.textSecondary }]}>Job Total</Text>
                    <Text style={[styles.paymentValue, { color: theme.text }]}>${bid.amount}</Text>
                  </View>
                  <View style={styles.paymentItem}>
                    <Text style={[styles.paymentLabel, { color: theme.textSecondary }]}>Escrow Deposit (15%)</Text>
                    <Text style={[styles.paymentValue, { color: theme.primary }]}>${escrowAmount}</Text>
                  </View>
                  <View style={[styles.paymentDivider, { backgroundColor: theme.divider }]} />
                  <View style={styles.paymentItem}>
                    <Text style={[styles.paymentLabel, { color: theme.textSecondary }]}>Due Now</Text>
                    <Text style={[styles.paymentValue, { color: theme.primary }]}>${escrowAmount}</Text>
                  </View>
                  <View style={styles.paymentItem}>
                    <Text style={[styles.paymentLabel, { color: theme.textSecondary }]}>Final Balance</Text>
                    <Text style={[styles.paymentValue, { color: theme.text }]}>${finalBalance}</Text>
                  </View>
                </View>
              </View>

              {/* Security Notice */}
              <View style={[styles.securityNotice, { backgroundColor: theme.success + '10', borderColor: theme.success + '30' }]}>
                <IconFallback name="security" size={20} color={theme.success} />
                <View style={styles.securityContent}>
                  <Text style={[styles.securityTitle, { color: theme.text }]}>
                    Secure Escrow Protection
                  </Text>
                  <Text style={[styles.securityText, { color: theme.textSecondary }]}>
                    Your payment is held securely until the job is completed. You'll only be charged the final balance after confirming the work is done to your satisfaction.
                  </Text>
                </View>
              </View>
            </View>
          </FadeIn>
        );

      case 'processing':
        return (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.processingTitle, { color: theme.text }]}>
              Processing Payment
            </Text>
            <Text style={[styles.processingSubtitle, { color: theme.textSecondary }]}>
              Securing your escrow deposit...
            </Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.successContainer}>
            <IconFallback name="check-circle" size={64} color={theme.success} />
            <Text style={[styles.successTitle, { color: theme.text }]}>
              Payment Successful!
            </Text>
            <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
              Your escrow deposit has been secured
            </Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.errorContainer}>
            <IconFallback name="error" size={64} color={theme.error} />
            <Text style={[styles.errorTitle, { color: theme.text }]}>
              Payment Failed
            </Text>
            <Text style={[styles.errorSubtitle, { color: theme.textSecondary }]}>
              {paymentError}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setPaymentStep('ready');
                setPaymentError(null);
              }}
            >
              <Text style={[styles.retryButtonText, { color: theme.onPrimary }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle as any} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={paymentStep === 'processing'}
        >
          <IconFallback name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Secure Payment
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Escrow deposit required
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPaymentStep()}
      </ScrollView>

      {/* Payment Button */}
      {paymentStep === 'ready' && (
        <View style={[styles.paymentActions, { backgroundColor: theme.surface, borderTopColor: theme.divider }]}>
          <TouchableOpacity
            style={[
              styles.payButton,
              {
                backgroundColor: loading ? theme.divider : theme.primary,
                opacity: loading ? 0.6 : 1,
              }
            ]}
            onPress={handleEscrowPayment}
            disabled={loading}
          >
            <Text style={[styles.payButtonText, { color: theme.onPrimary }]}>
              {loading ? 'Processing...' : `Pay $${escrowAmount} Escrow Deposit`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  paymentContent: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  jobSummary: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  jobDetails: {
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  jobInfo: {
    gap: 8,
  },
  jobInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobInfoText: {
    fontSize: 13,
    marginLeft: 8,
  },
  mechanicCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  mechanicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mechanicAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  mechanicDetails: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 13,
    marginLeft: 4,
  },
  mechanicLocation: {
    fontSize: 13,
  },
  bidMessage: {
    padding: 16,
    borderRadius: 12,
  },
  bidMessageText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  paymentBreakdown: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  paymentItems: {
    gap: 12,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentDivider: {
    height: 1,
    marginVertical: 8,
  },
  securityNotice: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  securityContent: {
    flex: 1,
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  payButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EscrowPaymentScreen;
