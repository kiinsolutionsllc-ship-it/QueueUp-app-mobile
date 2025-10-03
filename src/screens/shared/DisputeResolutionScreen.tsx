import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import IconFallback from '../../components/shared/IconFallback';
import { FadeIn } from '../../components/shared/Animations';
import { hapticService } from '../../services/HapticService';

const DisputeResolutionScreen = ({ navigation, route }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  const { job, mechanic } = route.params;
  const [disputeType, setDisputeType] = useState<any>('');
  const [disputeDescription, setDisputeDescription] = useState<any>('');
  const [evidence, setEvidence] = useState<any>([]);
  const [submitting, setSubmitting] = useState<any>(false);

  const disputeTypes = [
    {
      id: 'work_not_completed',
      title: 'Work Not Completed',
      description: 'Mechanic did not complete the agreed work',
      icon: 'build',
    },
    {
      id: 'poor_quality',
      title: 'Poor Quality Work',
      description: 'Work quality does not meet expectations',
      icon: 'warning',
    },
    {
      id: 'overcharged',
      title: 'Overcharged',
      description: 'Final bill exceeds agreed amount',
      icon: 'attach-money',
    },
    {
      id: 'damage_caused',
      title: 'Damage Caused',
      description: 'Mechanic caused damage to vehicle',
      icon: 'error',
    },
    {
      id: 'no_show',
      title: 'No Show',
      description: 'Mechanic did not show up for scheduled appointment',
      icon: 'schedule',
    },
    {
      id: 'other',
      title: 'Other',
      description: 'Other dispute not listed above',
      icon: 'help',
    },
  ];

  const handleSubmitDispute = async () => {
    if (!disputeType) {
      Alert.alert('Error', 'Please select a dispute type');
      return;
    }

    if (!disputeDescription.trim()) {
      Alert.alert('Error', 'Please provide a detailed description of the dispute');
      return;
    }

    try {
      setSubmitting(true);
      await hapticService.medium();

      // Simulate dispute submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Dispute Submitted',
        'Your dispute has been submitted for review. Our support team will investigate and get back to you within 24-48 hours.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderDisputeTypeCard = (type) => {
    const isSelected = disputeType === type.id;
    
    return (
      <TouchableOpacity
        key={type.id}
        style={[
          styles.disputeTypeCard,
          {
            backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
            borderColor: isSelected ? theme.primary : theme.divider,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => {
          setDisputeType(type.id);
          hapticService.light();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.disputeTypeHeader}>
          <View style={[
            styles.disputeTypeIcon,
            { backgroundColor: isSelected ? theme.primary + '20' : theme.divider + '20' }
          ]}>
            <IconFallback 
              name={type.icon} 
              size={24} 
              color={isSelected ? theme.primary : theme.textSecondary} 
            />
          </View>
          <View style={styles.disputeTypeContent}>
            <Text style={[styles.disputeTypeTitle, { color: theme.text }]}>
              {type.title}
            </Text>
            <Text style={[styles.disputeTypeDescription, { color: theme.textSecondary }]}>
              {type.description}
            </Text>
          </View>
          {isSelected && (
            <IconFallback name="check-circle" size={24} color={theme.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle as any} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <IconFallback name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Dispute Resolution
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Report an issue with your service
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Job Summary */}
        <FadeIn delay={100}>
          <View style={[styles.jobSummary, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Details</Text>
            <View style={styles.jobInfo}>
              <Text style={[styles.jobTitle, { color: theme.text }]}>
                {job.category} - {job.subcategory?.name || job.subcategory || 'General'}
              </Text>
              <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
                {job.description}
              </Text>
              <View style={styles.jobDetails}>
                <View style={styles.jobDetailItem}>
                  <IconFallback name="person" size={16} color={theme.textSecondary} />
                  <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                    {mechanic.name}
                  </Text>
                </View>
                <View style={styles.jobDetailItem}>
                  <IconFallback name="attach-money" size={16} color={theme.textSecondary} />
                  <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                    ${job.price}
                  </Text>
                </View>
                <View style={styles.jobDetailItem}>
                  <IconFallback name="event" size={16} color={theme.textSecondary} />
                  <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Dispute Types */}
        <FadeIn delay={200}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              What is the issue?
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Please select the type of dispute you're reporting
            </Text>
            
            <View style={styles.disputeTypesList}>
              {disputeTypes.map((type) => renderDisputeTypeCard(type))}
            </View>
          </View>
        </FadeIn>

        {/* Dispute Description */}
        <FadeIn delay={300}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Describe the Issue
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Provide as much detail as possible to help us resolve your dispute
            </Text>
            
            <TextInput
              style={[
                styles.descriptionInput,
                {
                  borderColor: theme.divider,
                  color: theme.text,
                  backgroundColor: theme.background,
                }
              ]}
              value={disputeDescription}
              onChangeText={setDisputeDescription}
              placeholder="Describe what happened, when it occurred, and how it affected you..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </FadeIn>

        {/* Evidence Upload */}
        <FadeIn delay={400}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Evidence (Optional)
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Upload photos, receipts, or other documents that support your dispute
            </Text>
            
            <TouchableOpacity
              style={[styles.uploadButton, { borderColor: theme.divider, backgroundColor: theme.surface }]}
              onPress={() => {
                // In production, this would open image picker
                Alert.alert('Upload Evidence', 'Evidence upload feature coming soon');
              }}
            >
              <IconFallback name="cloud-upload" size={24} color={theme.primary} />
              <Text style={[styles.uploadButtonText, { color: theme.primary }]}>
                Upload Photos or Documents
              </Text>
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Resolution Process Info */}
        <FadeIn delay={500}>
          <View style={[styles.infoCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
            <IconFallback name="info" size={20} color={theme.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                Resolution Process
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                • We'll review your dispute within 24-48 hours{'\n'}
                • We may contact you or the mechanic for additional information{'\n'}
                • Resolution typically takes 3-5 business days{'\n'}
                • You'll receive updates via email and in-app notifications
              </Text>
            </View>
          </View>
        </FadeIn>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.submitContainer, { backgroundColor: theme.surface, borderTopColor: theme.divider }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: submitting ? theme.divider : theme.primary,
              opacity: submitting ? 0.6 : 1,
            }
          ]}
          onPress={handleSubmitDispute}
          disabled={submitting || !disputeType || !disputeDescription.trim()}
        >
          <Text style={[styles.submitButtonText, { color: theme.onPrimary }]}>
            {submitting ? 'Submitting...' : 'Submit Dispute'}
          </Text>
        </TouchableOpacity>
      </View>
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  jobSummary: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  jobInfo: {
    marginTop: 8,
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
  disputeTypesList: {
    gap: 12,
  },
  disputeTypeCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  disputeTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disputeTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  disputeTypeContent: {
    flex: 1,
  },
  disputeTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  disputeTypeDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  descriptionInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 40,
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default DisputeResolutionScreen;

