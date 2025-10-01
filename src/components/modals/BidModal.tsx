import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
import { formatJobCost } from '../../utils/JobCostUtils';
import MaterialButton from '../shared/MaterialButton';
import MaterialTextInput from '../shared/MaterialTextInput';
import MaterialCard from '../shared/MaterialCard';
import IconFallback from '../shared/IconFallback';

interface BidModalProps {
  visible: boolean;
  onClose: () => void;
  selectedJob: any;
  onBidSubmitted?: (bid: any) => void;
}

interface BidFormData {
  price: string;
  message: string;
  estimatedDuration: string;
  bidType: 'fixed' | 'hourly';
}

export default function BidModal({ visible, onClose, selectedJob, onBidSubmitted }: BidModalProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const { user } = useAuth();
  const { createBid, isJobAvailableForBidding } = useJob();

  const [formData, setFormData] = useState<BidFormData>({
    price: '',
    message: '',
    estimatedDuration: '',
    bidType: 'fixed',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<BidFormData>>({});

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      setFormData({
        price: '',
        message: '',
        estimatedDuration: '',
        bidType: 'fixed',
      });
      setErrors({});
      
      // Animate in
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, fadeAnim]);

  // Handle back button for Android
  useEffect(() => {
    const backAction = () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [visible, onClose]);

  const validateForm = (): boolean => {
    const newErrors: Partial<BidFormData> = {};

    // Validate price
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price greater than $0';
    }

    // Validate message
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please enter a detailed message (at least 10 characters)';
    }

    // Validate duration for hourly bids
    if (formData.bidType === 'hourly') {
      if (!formData.estimatedDuration || isNaN(parseInt(formData.estimatedDuration)) || parseInt(formData.estimatedDuration) <= 0) {
        newErrors.estimatedDuration = 'Please enter a valid estimated duration';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBid = async () => {
    if (!selectedJob) {
      Alert.alert('Error', 'No job selected');
      return;
    }

    // Check if job is still available for bidding
    if (!isJobAvailableForBidding(selectedJob)) {
      Alert.alert(
        'Job Not Available',
        'This job is no longer available for bidding. It may have been accepted by another mechanic or is in progress.',
        [{ text: 'OK', onPress: onClose }]
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const bidData = {
      jobId: selectedJob.id || selectedJob._id,
      mechanicId: getFallbackUserIdWithTypeDetection(user?.id, user?.user_type),
      mechanicName: user?.name || 'Test Mechanic',
      price: parseFloat(formData.price),
      message: formData.message.trim(),
      estimatedDuration: formData.bidType === 'hourly' ? parseInt(formData.estimatedDuration) : undefined,
      bidType: formData.bidType,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await createBid(bidData);
      
      if (result.success) {
        Alert.alert(
          'Bid Submitted Successfully! 🎉',
          `Your bid of $${formData.price}${formData.bidType === 'hourly' ? '/hour' : ''} has been submitted for "${selectedJob.title || 'this job'}".`,
          [{ text: 'OK', onPress: () => {
            onClose();
            if (onBidSubmitted) {
              onBidSubmitted(result.bid);
            }
          }}]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit bid. Please try again.');
      }
    } catch (error) {
      console.error('Bid submission error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof BidFormData, value: string | 'fixed' | 'hourly') => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const calculateTotalCost = (): string => {
    if (formData.bidType === 'hourly' && formData.price && formData.estimatedDuration) {
      const hourlyRate = parseFloat(formData.price);
      const durationHours = parseInt(formData.estimatedDuration) / 60;
      return (hourlyRate * durationHours).toFixed(2);
    }
    return formData.price;
  };

  const formatJobTitle = (title: string | undefined): string => {
    if (!title) return 'Untitled Job';
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer, 
            { 
              backgroundColor: theme.background,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.divider }]}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <IconFallback name="close" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: theme.text }]}>Place Bid</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Job Information */}
              <MaterialCard style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <IconFallback name="work" size={24} color={theme.primary} />
                  <View style={styles.jobInfo}>
                    <Text style={[styles.jobTitle, { color: theme.text }]} numberOfLines={2}>
                      {formatJobTitle(selectedJob?.title)}
                    </Text>
                    <Text style={[styles.jobCategory, { color: theme.textSecondary }]}>
                      {selectedJob?.category || 'General Service'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.jobDetails}>
                  <View style={styles.jobDetail}>
                    <IconFallback name="location-on" size={16} color={theme.textSecondary} />
                    <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                      {selectedJob?.location || 'Location not specified'}
                    </Text>
                  </View>
                  <View style={styles.jobDetail}>
                    <IconFallback name="attach-money" size={16} color={theme.textSecondary} />
                    <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                      {formatJobCost(selectedJob)}
                    </Text>
                  </View>
                </View>
              </MaterialCard>

              {/* Bid Type Selection */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Bid Type</Text>
                <View style={styles.bidTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.bidTypeButton,
                      { 
                        backgroundColor: formData.bidType === 'fixed' ? theme.primary : theme.surface,
                        borderColor: theme.primary
                      }
                    ]}
                    onPress={() => updateFormData('bidType', 'fixed')}
                  >
                    <IconFallback 
                      name="work" 
                      size={20} 
                      color={formData.bidType === 'fixed' ? 'white' : theme.primary} 
                    />
                    <Text style={[
                      styles.bidTypeText, 
                      { color: formData.bidType === 'fixed' ? 'white' : theme.primary }
                    ]}>
                      Fixed Price
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.bidTypeButton,
                      { 
                        backgroundColor: formData.bidType === 'hourly' ? theme.primary : theme.surface,
                        borderColor: theme.primary
                      }
                    ]}
                    onPress={() => updateFormData('bidType', 'hourly')}
                  >
                    <IconFallback 
                      name="access-time" 
                      size={20} 
                      color={formData.bidType === 'hourly' ? 'white' : theme.primary} 
                    />
                    <Text style={[
                      styles.bidTypeText, 
                      { color: formData.bidType === 'hourly' ? 'white' : theme.primary }
                    ]}>
                      Hourly Rate
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Price Input */}
              <View style={styles.section}>
                <MaterialTextInput
                  label={formData.bidType === 'hourly' ? 'Hourly Rate ($)' : 'Total Price ($)'}
                  value={formData.price}
                  onChangeText={(value) => updateFormData('price', value)}
                  keyboardType="numeric"
                  rightIcon="attach-money"
                  placeholder={formData.bidType === 'hourly' ? '75' : '150'}
                  error={errors.price}
                />
              </View>

              {/* Duration Input (for hourly) */}
              {formData.bidType === 'hourly' && (
                <View style={styles.section}>
                  <MaterialTextInput
                    label="Estimated Duration (minutes)"
                    value={formData.estimatedDuration}
                    onChangeText={(value) => updateFormData('estimatedDuration', value)}
                    keyboardType="numeric"
                    rightIcon="schedule"
                    placeholder="60"
                    error={errors.estimatedDuration}
                  />
                </View>
              )}

              {/* Cost Preview */}
              {formData.bidType === 'hourly' && formData.price && formData.estimatedDuration && (
                <View style={styles.section}>
                  <MaterialCard style={[styles.costPreview, { backgroundColor: theme.success + '15' }]}>
                    <View style={styles.costPreviewContent}>
                      <IconFallback name="calculate" size={20} color={theme.success} />
                      <Text style={[styles.costPreviewText, { color: theme.success }]}>
                        Estimated total: ${calculateTotalCost()}
                      </Text>
                    </View>
                  </MaterialCard>
                </View>
              )}

              {/* Message Input */}
              <View style={styles.section}>
                <MaterialTextInput
                  label="Message to Customer"
                  value={formData.message}
                  onChangeText={(value) => updateFormData('message', value)}
                  multiline
                  numberOfLines={4}
                  rightIcon="message"
                  placeholder="I can help you with this service. I have experience with..."
                  error={errors.message}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Action Buttons */}
          <View style={[styles.actions, { borderTopColor: theme.divider }]}>
            <MaterialButton
              title="Cancel"
              onPress={onClose}
              variant="outlined"
              style={styles.cancelButton}
            />
            <MaterialButton
              title={isSubmitting ? "Submitting..." : "Submit Bid"}
              onPress={handleSubmitBid}
              style={[styles.submitButton, { opacity: isSubmitting ? 0.7 : 1 }]}
              icon={isSubmitting ? "hourglass-empty" : "send"}
              disabled={isSubmitting}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  overlayTouchable: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    minHeight: '75%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  jobCard: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  jobInfo: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  jobCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  jobDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobDetailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bidTypeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  bidTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    gap: 6,
  },
  bidTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  costPreview: {
    padding: 14,
  },
  costPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  costPreviewText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 25,
  },
  submitButton: {
    flex: 1,
    borderRadius: 25,
  },
});
