import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import IconFallback from './IconFallback';
import { FadeIn } from './Animations';

const BidSubmissionModal = ({ 
  visible, 
  onClose, 
  job, 
  mechanic, 
  onSubmitBid 
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const [bidData, setBidData] = useState({
    amount: '',
    message: '',
    estimatedDuration: '',
    estimatedStartDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!bidData.amount || parseFloat(bidData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid bid amount';
    }

    if (!bidData.message || bidData.message.trim().length < 10) {
      newErrors.message = 'Please provide a detailed message (at least 10 characters)';
    }

    if (!bidData.estimatedDuration || parseInt(bidData.estimatedDuration) <= 0) {
      newErrors.estimatedDuration = 'Please enter estimated duration in minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const bidSubmission = {
        amount: parseFloat(bidData.amount),
        message: bidData.message.trim(),
        estimatedDuration: parseInt(bidData.estimatedDuration),
        estimatedStartDate: bidData.estimatedStartDate || new Date().toISOString(),
      };

      await onSubmitBid(bidSubmission);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    return numValue.toFixed(2);
  };

  if (!visible) return null;

  return (
    <KeyboardAvoidingView 
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity 
        style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={[styles.modal, { backgroundColor: theme.surface, borderColor: theme.divider }]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <FadeIn delay={100}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.divider }]}>
              <View style={styles.headerLeft}>
                <IconFallback name="gavel" size={24} color={theme.primary} />
                <Text style={[styles.title, { color: theme.text }]}>Submit Bid</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <IconFallback name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Job Info */}
              <View style={styles.jobInfo}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Details</Text>
                <View style={[styles.jobCard, { backgroundColor: theme.background, borderColor: theme.divider }]}>
                  <Text style={[styles.jobTitle, { color: theme.text }]}>
                    {job?.category} - {job?.subcategory}
                  </Text>
                  <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
                    {job?.description}
                  </Text>
                  <View style={styles.jobDetails}>
                    <View style={styles.jobDetailItem}>
                      <IconFallback name="directions-car" size={16} color={theme.textSecondary} />
                      <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                        {job?.vehicle?.year} {job?.vehicle?.make} {job?.vehicle?.model}
                      </Text>
                    </View>
                    <View style={styles.jobDetailItem}>
                      <IconFallback name="location-on" size={16} color={theme.textSecondary} />
                      <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                        {job?.serviceType === 'mobile' ? 'Mobile Service' : 'Shop Service'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bid Form */}
              <View style={styles.bidForm}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Bid</Text>

                {/* Bid Amount */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Bid Amount ($)</Text>
                  <View style={[styles.amountInputContainer, { borderColor: errors.amount ? theme.error : theme.divider }]}>
                    <Text style={[styles.currencySymbol, { color: theme.textSecondary }]}>$</Text>
                    <TextInput
                      style={[styles.amountInput, { color: theme.text }]}
                      value={bidData.amount}
                      onChangeText={(text) => {
                        setBidData({ ...bidData, amount: text });
                        if (errors.amount) setErrors({ ...errors, amount: null });
                      }}
                      placeholder="0.00"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      returnKeyType="next"
                    />
                  </View>
                  {errors.amount && (
                    <Text style={[styles.errorText, { color: theme.error }]}>{errors.amount}</Text>
                  )}
                </View>

                {/* Estimated Duration */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Estimated Duration (minutes)</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        borderColor: errors.estimatedDuration ? theme.error : theme.divider,
                        color: theme.text,
                        backgroundColor: theme.background
                      }
                    ]}
                    value={bidData.estimatedDuration}
                    onChangeText={(text) => {
                      setBidData({ ...bidData, estimatedDuration: text });
                      if (errors.estimatedDuration) setErrors({ ...errors, estimatedDuration: null });
                    }}
                    placeholder="e.g., 120"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    returnKeyType="next"
                  />
                  {errors.estimatedDuration && (
                    <Text style={[styles.errorText, { color: theme.error }]}>{errors.estimatedDuration}</Text>
                  )}
                </View>

                {/* Message */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Message to Customer</Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      { 
                        borderColor: errors.message ? theme.error : theme.divider,
                        color: theme.text,
                        backgroundColor: theme.background
                      }
                    ]}
                    value={bidData.message}
                    onChangeText={(text) => {
                      setBidData({ ...bidData, message: text });
                      if (errors.message) setErrors({ ...errors, message: null });
                    }}
                    placeholder="Tell the customer about your experience, approach, and why you're the best choice for this job..."
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    returnKeyType="done"
                  />
                  {errors.message && (
                    <Text style={[styles.errorText, { color: theme.error }]}>{errors.message}</Text>
                  )}
                </View>

                {/* Tips */}
                <View style={[styles.tipsContainer, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                  <IconFallback name="lightbulb" size={16} color={theme.primary} />
                  <Text style={[styles.tipsText, { color: theme.text }]}>
                    Tip: Include your experience, approach, and availability to stand out from other mechanics.
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={[styles.actions, { borderTopColor: theme.divider }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.divider }]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { 
                    backgroundColor: loading ? theme.divider : theme.primary,
                    opacity: loading ? 0.6 : 1
                  }
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={[styles.submitButtonText, { color: theme.onPrimary }]}>
                  {loading ? 'Submitting...' : 'Submit Bid'}
                </Text>
              </TouchableOpacity>
            </View>
          </FadeIn>
        </TouchableOpacity>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: '90%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  jobInfo: {
    marginTop: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  jobCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
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
  jobDetails: {
    gap: 8,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobDetailText: {
    fontSize: 13,
    marginLeft: 8,
  },
  bidForm: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default BidSubmissionModal;

