import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePayment } from '../../contexts/PaymentContext';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { useReview } from '../../contexts/ReviewContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { formatJobCost } from '../../utils/JobCostUtils';
import NotificationService from '../../services/NotificationService';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import { FadeIn, SlideInFromBottom } from '../../components/shared/Animations';


interface JobCompletionScreenProps {
  navigation: any;
  route: {
    params?: any;
  };
}
export default function JobCompletionScreen({ navigation, route }: JobCompletionScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { t } = useLanguage();
  const { payments, releasePayment } = usePayment();
  const { updateJobStatus, getJob, refreshData } = useJob();
  const { hasUserReviewed } = useReview() as any;
  const { user } = useAuth();
  const theme = getCurrentTheme();

  const { jobId } = route.params || {};
  const [job, setJob] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState<any>(false);
  const [showPaymentRelease, setShowPaymentRelease] = useState<any>(false);
  const hasRated = !!hasUserReviewed?.(jobId, user?.id || 'customer1', 'customer_to_mechanic');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!jobId) return;
      try {
        await refreshData();
      } catch (error) {
        console.warn('Failed to refresh job data:', error);
      }
      if (!isMounted) return;
      const actualJob = getJob ? getJob(jobId) : null;
      if (actualJob) {
        setJob(actualJob);
      } else {
        setJob({
          id: jobId,
          title: 'Service Request',
          description: 'Automotive service completed',
          customerId: 'customer1',
          mechanicId: 'mechanic1',
          status: 'completed',
          estimatedCost: 0,
          price: 0,
          additionalWorkAmount: 0,
          completedAt: new Date().toISOString(),
        });
      }
      const associatedPayment = payments.find(p => p.jobId === jobId);
      setPayment(associatedPayment);
    })();
    return () => { isMounted = false; };
  }, [jobId, payments, getJob, refreshData]);

  const handleReleasePayment = async () => {
    if (!payment) return;

    Alert.alert(
      'Release Payment',
      `Are you sure you want to release the payment of $${payment.amount} to the mechanic? This action cannot be undone.`,
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
                // Update job status to paid
                await updateJobStatus(jobId, 'paid');
                
                // Notify the mechanic about payment release
                if (job?.mechanicId) {
                  try {
                    await NotificationService.notifyMechanic(
                      job.mechanicId,
                      jobId,
                      'payment_released',
                      {
                        amount: payment.amount,
                        jobTitle: job.title || 'Service Request',
                        customerName: job.customerName || 'Customer'
                      }
                    );
                  } catch (error) {
                    console.error('Error sending payment notification to mechanic:', error);
                  }
                }
                
                Alert.alert(
                  'Payment Released',
                  'The payment has been successfully released to the mechanic.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('Jobs'),
                    },
                  ]
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

  const handleRateMechanic = () => {
    navigation.navigate('RateMechanic', { 
      jobId,
      mechanicId: job?.mechanicId 
    });
  };

  const handleDisputeJob = () => {
    Alert.alert(
      'Dispute Job',
      'If you have an issue with the completed work, please contact support. A dispute will be opened and reviewed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Dispute',
          onPress: () => {
            navigation.navigate('HelpSupport');
          },
        },
      ]
    );
  };

  if (!job) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ModernHeader
          title="Job Completion"
          subtitle="Loading job details..."
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading job details...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Job Completed"
        subtitle="Service has been completed successfully"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showNotifications={false}
        showProfile={false}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <FadeIn delay={100}>
          <MaterialCard style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <View style={[styles.completionIcon, { backgroundColor: theme.success + '20' }]}>
                <IconFallback name="check-circle" size={32} color={theme.success} />
              </View>
              <View style={styles.completionInfo}>
                <Text style={[styles.completionTitle, { color: theme.text }]}>
                  Service Completed
                </Text>
                <Text style={[styles.completionSubtitle, { color: theme.textSecondary }]}> 
                  Your automotive service has been 
                  <Text style={{ color: theme.success, fontWeight: '700' }}> completed successfully</Text>
                </Text>
              </View>
            </View>
          </MaterialCard>
        </FadeIn>

        {/* Job Details */}
        <FadeIn delay={200}>
          <MaterialCard style={styles.detailsCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Service Details
            </Text>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Service Type
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {job.title || job.category || 'Service Request'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Description
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {job.description || job.notes || 'Service completed successfully'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Completed On
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Total Amount
              </Text>
              <Text style={[styles.detailValue, { color: theme.primary }]}>
                {formatJobCost(job)}
              </Text>
            </View>
          </MaterialCard>
        </FadeIn>

        {/* Payment Status */}
        {payment && (
          <FadeIn delay={300}>
            <MaterialCard style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <IconFallback name={payment.status === 'completed' ? 'check-circle' : 'schedule'} size={24} color={payment.status === 'completed' ? theme.success : theme.warning} />
                <Text style={[styles.paymentTitle, { color: theme.text }]}>
                  Payment Status
                </Text>
              </View>
              
              <Text style={[styles.paymentStatus, { 
                color: payment.status === 'completed' ? theme.success : theme.warning 
              }]}>
                {payment.status === 'completed' ? 'Payment Released' : 'Held in Escrow'}
              </Text>
              
              <Text style={[styles.paymentDescription, { color: theme.textSecondary }]}>
                {payment.status === 'completed' 
                  ? 'The payment has been released to the mechanic.'
                  : 'Payment is held in escrow until you approve the service.'
                }
              </Text>
            </MaterialCard>
          </FadeIn>
        )}

        {/* Actions */}
        <FadeIn delay={400}>
          <View style={styles.actionsContainer}>
            {payment && payment.status === 'escrow' && (
              <MaterialButton
                title="Release Payment"
                onPress={handleReleasePayment}
                loading={loading}
                style={[styles.actionButton, { backgroundColor: theme.success }]}
                textStyle={{ color: theme.onSuccess }}
                leftIcon="payment"
              />
            )}
            
            <MaterialButton
              title={hasRated ? 'Rating has been submitted' : 'Rate Mechanic'}
              onPress={handleRateMechanic}
              disabled={hasRated}
              style={[
                styles.actionButton,
                styles.rateButton,
                hasRated ? { borderWidth: 0 } : { borderColor: theme.primary }
              ]}
              textStyle={{ color: hasRated ? theme.success : theme.primary }}
              leftIcon="star"
            />
            
            <MaterialButton
              title="Open Dispute"
              onPress={handleDisputeJob}
              style={[styles.actionButton, styles.disputeButton, { borderColor: theme.error }]}
              textStyle={{ color: theme.error }}
              leftIcon="warning"
            />
          </View>
        </FadeIn>

        {/* Next Steps */}
        <FadeIn delay={500}>
          <MaterialCard style={styles.nextStepsCard}>
            <View style={styles.nextStepsHeader}>
              <IconFallback name="info" size={20} color={theme.primary} />
              <Text style={[styles.nextStepsTitle, { color: theme.text }]}>
                What's Next?
              </Text>
            </View>
            
            <Text style={[styles.nextStepText, { color: theme.textSecondary }]}>
              • Rate your mechanic to help other customers
            </Text>
            <Text style={[styles.nextStepText, { color: theme.textSecondary }]}>
              • Book another service if needed
            </Text>
            <Text style={[styles.nextStepText, { color: theme.textSecondary }]}>
              • Contact support if you have any issues
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
  completionCard: {
    marginVertical: 16,
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  completionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionInfo: {
    flex: 1,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  completionSubtitle: {
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
  paymentCard: {
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentStatus: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  paymentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 0,
  },
  rateButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  disputeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  nextStepsCard: {
    marginBottom: 16,
  },
  nextStepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextStepText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});
