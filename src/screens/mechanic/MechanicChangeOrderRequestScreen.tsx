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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useChangeOrderWorkflow, ChangeOrder } from '../../contexts/ChangeOrderWorkflowContext';
import IconFallback from '../../components/shared/IconFallback';
import MaterialTextInput from '../../components/shared/MaterialTextInput';
import MaterialButton from '../../components/shared/MaterialButton';
import { FadeIn } from '../../components/shared/Animations';
import { hapticService } from '../../services/HapticService';

// Types for the screen
interface MechanicChangeOrderRequestScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
  route: {
    params: {
      jobId: string;
    };
  };
}

interface FormData {
  description: string;
  totalAmount: string;
}

interface FormErrors {
  description?: string;
  totalAmount?: string;
}

const MechanicChangeOrderRequestScreen: React.FC<MechanicChangeOrderRequestScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { getJobForChangeOrder, createChangeOrder } = useChangeOrderWorkflow();
  const theme = getCurrentTheme();

  const { jobId } = route.params;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Change order form data
  const [formData, setFormData] = useState<FormData>({
    description: '',
    totalAmount: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const loadJobData = async (): Promise<void> => {
    try {
      setLoading(true);
      // Use the change order workflow context to get job data (separate from job creation workflow)
      const jobData = getJobForChangeOrder(jobId);
      if (jobData) {
        setJob(jobData);
      }
    } catch (error) {
      console.error('Error loading job data:', error);
      Alert.alert('Error', 'Failed to load job information');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.totalAmount.trim()) {
      newErrors.totalAmount = 'Total amount is required';
    } else {
      const amount = parseFloat(formData.totalAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.totalAmount = 'Please enter a valid amount';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    await hapticService.buttonPress();
    setSubmitting(true);

    try {
      const totalAmount = parseFloat(formData.totalAmount);

      const changeOrderData = {
        jobId: job.id,
        mechanicId: user?.id || 'mechanic1',
        customerId: job.customerId,
        title: `Additional work for ${job.title}`,
        description: formData.description.trim(),
        totalAmount,
        requiresImmediateApproval: false,
        reason: `Additional work discovered during ${job.title}`,
        mechanicName: user?.name || 'Mechanic',
        customerName: job.customerName
      };

      // Create the change order using the change order workflow context
      // This uses ChangeOrderWorkflowContext -> UnifiedJobService.createChangeOrder() for ADDITIONAL work
      // This is DIFFERENT from CreateJobScreen which uses SimplifiedJobContext for NEW job creation
      const result = await createChangeOrder(changeOrderData);

      if (result.success) {
        Alert.alert(
          'Change Order Created',
          'Your change order request has been sent to the customer for approval.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error(result.error || 'Failed to create change order');
      }
    } catch (error) {
      console.error('Error creating change order:', error);
      Alert.alert('Error', 'Failed to create change order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    Alert.alert(
      'Cancel Change Order',
      'Are you sure you want to cancel creating this change order?',
      [
        { text: 'Continue Editing', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };


  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'posted': theme.info,
      'bidding': theme.warning,
      'scheduled': theme.accent,
      'confirmed': theme.success,
      'in_progress': theme.warning,
      'completed': theme.success,
      'cancelled': theme.error
    };
    return statusColors[status] || theme.textSecondary;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <IconFallback name="build" size={48} color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading job information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <IconFallback name="error" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Job not found
          </Text>
          <MaterialButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle as any} backgroundColor={theme.background} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <FadeIn>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <IconFallback name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  Request Additional Work
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  {job.title}
                </Text>
              </View>
              <View style={[styles.headerBadge, { backgroundColor: theme.accent + '20' }]}>
                <IconFallback name="add-circle" size={16} color={theme.accent} />
              </View>
            </View>
          </FadeIn>

          {/* Job Info Card */}
          <FadeIn delay={100}>
            <View style={[styles.jobCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.jobHeader}>
                <View style={[styles.jobIconContainer, { backgroundColor: theme.accent + '15' }]}>
                  <IconFallback name="build" size={20} color={theme.accent} />
                </View>
                <View style={styles.jobHeaderText}>
                  <Text style={[styles.jobTitle, { color: theme.text }]}>
                    {job.title}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                      {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : 'Unknown'}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
                {job.description}
              </Text>
              <View style={[styles.jobDetails, { borderTopColor: theme.border }]}>
                <View style={styles.jobDetail}>
                  <IconFallback name="person" size={14} color={theme.textSecondary} />
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Customer:</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>{job.customerName}</Text>
                </View>
                <View style={styles.jobDetail}>
                  <IconFallback name="schedule" size={14} color={theme.textSecondary} />
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Created:</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </FadeIn>

          {/* Change Order Form */}
          <FadeIn delay={200}>
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Additional Work Details
              </Text>

              <MaterialTextInput
                label="Describe the additional work needed *"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="What additional work is needed and why?"
                multiline
                numberOfLines={4}
                error={errors.description}
              />
            </View>
          </FadeIn>

          {/* Pricing Section */}
          <FadeIn delay={300}>
            <View style={styles.pricingSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Pricing
              </Text>
              
              <MaterialTextInput
                label="Total Cost *"
                value={formData.totalAmount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, totalAmount: text }))}
                placeholder="Enter the total cost for additional work"
                keyboardType="numeric"
                error={errors.totalAmount}
                rightIcon="attach-money"
              />
            </View>
          </FadeIn>

          {/* Summary Card - Shows when both fields are filled */}
          {formData.description.trim() && formData.totalAmount.trim() && (
            <FadeIn delay={400}>
              <View style={[styles.summaryCard, { 
                backgroundColor: theme.success + '15', 
                borderColor: theme.success + '40',
                borderWidth: 2
              }]}>
                <View style={styles.summaryHeader}>
                  <IconFallback name="check-circle" size={20} color={theme.success} />
                  <Text style={[styles.summaryTitle, { color: theme.success }]}>
                    Ready to Submit
                  </Text>
                </View>
                
                <View style={styles.summaryContent}>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                      Additional Work:
                    </Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]} numberOfLines={2}>
                      {formData.description}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                      Original Job Cost:
                    </Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>
                      ${(job.estimatedCost || 0).toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                      Additional Cost:
                    </Text>
                    <Text style={[styles.summaryValue, { color: theme.warning, fontWeight: '600' }]}>
                      ${parseFloat(formData.totalAmount || '0').toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={[styles.summaryRow, { borderTopColor: theme.border, borderTopWidth: 1, paddingTop: 8, marginTop: 4 }]}>
                    <Text style={[styles.summaryLabel, { color: theme.text, fontWeight: '600' }]}>
                      Total Cost:
                    </Text>
                    <Text style={[styles.summaryValue, { color: theme.success, fontWeight: 'bold', fontSize: 18 }]}>
                      ${((job.estimatedCost || 0) + parseFloat(formData.totalAmount || '0')).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </FadeIn>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={[styles.actionButtons, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <MaterialButton
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
            icon="close"
          />
          <MaterialButton
            title="Send to Customer"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting || !formData.totalAmount}
            style={[styles.submitButton, { backgroundColor: theme.accent }]}
            icon="send"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  headerBadge: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  jobCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobIconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  jobHeaderText: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  jobDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  jobDetails: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pricingSection: {
    marginBottom: 24,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryContent: {
    marginTop: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 34, // Account for home indicator
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default MechanicChangeOrderRequestScreen;
