import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { useReview } from '../../contexts/ReviewContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import NotificationService from '../../services/NotificationService';
import { useVehicle } from '../../contexts/VehicleContext';
import ModernHeader from '../../components/shared/ModernHeader';
import { formatVehicle, formatJobTitle, formatJobType, capitalizeText } from '../../utils/UnifiedJobFormattingUtils';


interface RateMechanicScreenProps {
  navigation: any;
  route: {
    params?: any;
  };
}
export default function RateMechanicScreen({ navigation, route }: RateMechanicScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { jobs } = useJob();
  const { createReview, hasUserReviewed } = useReview() as any;
  const { user } = useAuth();
  const { vehicles } = useVehicle();
  const theme = getCurrentTheme();

  const { jobId } = route.params || {};
  const job = jobs.find(j => j.id === jobId);
  const alreadyReviewed = !!hasUserReviewed?.(jobId, user?.id || 'customer1', 'customer_to_mechanic');

  // Helper function to resolve vehicle data (handle both objects and IDs)
  const resolveVehicleData = (vehicle: any) => {
    if (!vehicle) return null;
    
    // If it's already an object with make/model/year, return it
    if (typeof vehicle === 'object' && vehicle.make && vehicle.model) {
      return vehicle;
    }
    
    // If it's a string that looks like a vehicle ID, try to find the full vehicle object
    if (typeof vehicle === 'string' && /^\d{13,}$/.test(vehicle)) {
      const fullVehicle = vehicles.find(v => v.id === vehicle);
      if (fullVehicle) {
        return fullVehicle;
      }
    }
    
    // Return the original vehicle data
    return vehicle;
  };

  // Helper function to get urgency color
  const getUrgencyColor = (urgency: any) => {
    switch (urgency) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return theme.textSecondary;
    }
  };

  const [rating, setRating] = useState<any>(0);
  const [comment, setComment] = useState<any>('');
  const [loading, setLoading] = useState<any>(false);
  const [aspectRatings, setAspectRatings] = useState<any>({
    quality: 0,
    punctuality: 0,
    communication: 0,
    professionalism: 0,
    value: 0,
  });

  const ratingOptions = [
    { value: 1, label: 'Poor', color: theme.error },
    { value: 2, label: 'Fair', color: theme.warning },
    { value: 3, label: 'Good', color: theme.primary },
    { value: 4, label: 'Very Good', color: theme.success },
    { value: 5, label: 'Excellent', color: theme.success },
  ];

  const handleRatingSelect = (value: any) => {
    setRating(value);
  };

  const handleAspectRating = (aspect: any, value: any) => {
    setAspectRatings((prev: any) => ({
      ...prev,
      [aspect]: value
    }));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    if (alreadyReviewed) {
      Alert.alert('Already reviewed', 'You have already submitted a review for this job.');
      return;
    }

    setLoading(true);
    try {
      const result = await createReview?.(
        jobId,
        user?.id || 'customer1',
        user?.name || 'John Customer',
        job?.mechanicId || 'mechanic1',
        job?.mechanicName || 'Mechanic',
        rating,
        comment,
        'customer_to_mechanic'
      );

      if (result.success) {
        // Notify the mechanic about the new rating
        if (job?.mechanicId) {
          try {
            await NotificationService.notifyMechanic(
              job.mechanicId,
              jobId,
              'rating_received',
              {
                rating: rating,
                customerName: user?.name || 'Customer',
                jobTitle: job?.title || 'Service Request',
                review: comment
              }
            );
          } catch (error) {
            console.error('Error sending rating notification to mechanic:', error);
          }
        }
        
        Alert.alert(
          'Success',
          'Thank you for your review!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', 'Failed to submit review');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingSelect(star)}
            style={styles.starButton}
          >
            <IconFallback name={star <= rating ? 'star' : 'star-border'} size={40} color={star <= rating ? theme.warning : theme.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Rate Mechanic"
        subtitle="Share your experience"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          { 
            icon: 'check', 
            onPress: handleSubmit,
            disabled: rating === 0 || !comment.trim() || loading || alreadyReviewed
          },
        ]}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Already Reviewed Notice */}
        {alreadyReviewed && (
          <View style={[styles.section]}>
            <View style={[styles.guidelinesCard, { backgroundColor: theme.cardBackground }]}> 
              <View style={styles.guidelineItem}>
                <IconFallback name="info" size={16} color={theme.warning} />
                <Text style={[styles.guidelineText, { color: theme.textSecondary }]}> 
                  You have already submitted a review for this job. Submitting multiple reviews for the same job is not allowed.
                </Text>
              </View>
            </View>
          </View>
        )}
        {/* Job Details */}
        {job && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Service Details</Text>
            <View style={[styles.jobDetailsCard, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.jobHeader}>
                <Text style={[styles.jobTitle, { color: theme.text }]}>
                  {formatJobTitle(job.title)}
                </Text>
                <View style={[styles.jobStatusBadge, { backgroundColor: theme.success }]}>
                  <IconFallback name="check-circle" size={12} color="white" />
                  <Text style={styles.jobStatusText}>Completed</Text>
                </View>
              </View>
              
              <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
                {job.description || 'No description provided'}
              </Text>
              
              <View style={styles.jobInfoGrid}>
                <View style={styles.jobInfoItem}>
                  <IconFallback name="build" size={16} color={theme.primary} />
                  <Text style={[styles.jobInfoLabel, { color: theme.textSecondary }]}>Service Type</Text>
                  <Text style={[styles.jobInfoValue, { color: theme.text }]}>
                    {formatJobType(job.category || '') || 'General Service'}
                  </Text>
                </View>
                
                <View style={styles.jobInfoItem}>
                  <IconFallback name="schedule" size={16} color={theme.primary} />
                  <Text style={[styles.jobInfoLabel, { color: theme.textSecondary }]}>Duration</Text>
                  <Text style={[styles.jobInfoValue, { color: theme.text }]}>
                    {job.estimatedDuration || 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.jobInfoItem}>
                  <IconFallback name="attach-money" size={16} color={theme.primary} />
                  <Text style={[styles.jobInfoLabel, { color: theme.textSecondary }]}>Total Cost</Text>
                  <Text style={[styles.jobInfoValue, { color: theme.accent }]}>
                    ${job.budget || job.estimatedCost || 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.jobInfoItem}>
                  <IconFallback name="location-on" size={16} color={theme.primary} />
                  <Text style={[styles.jobInfoLabel, { color: theme.textSecondary }]}>Location</Text>
                  <Text style={[styles.jobInfoValue, { color: theme.text }]}>
                    {job.location || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Vehicle Information */}
              {job.vehicleId && (
                <View style={styles.vehicleInfo}>
                  <IconFallback name="directions-car" size={16} color={theme.textSecondary} />
                  <Text style={[styles.vehicleText, { color: theme.textSecondary }]}>
                    {(() => {
                      const resolvedVehicle = resolveVehicleData(job.vehicleId);
                      const formatted = formatVehicle(resolvedVehicle);
                      return formatted || 'Vehicle information not available';
                    })()}
                  </Text>
                </View>
              )}

              {/* Additional Job Details */}
              <View style={styles.additionalDetails}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Service Category:</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {formatJobType(job.subcategory || '') || 'General Service'}
                  </Text>
                </View>
                
                {job.urgency && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Priority:</Text>
                    <Text style={[styles.detailValue, { color: getUrgencyColor(job.urgency) }]}>
                      {capitalizeText(job.urgency)}
                    </Text>
                  </View>
                )}
                
                {job.createdAt && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Job Created:</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
              
              {job.completedAt && (
                <View style={styles.completionInfo}>
                  <IconFallback name="check-circle" size={16} color={theme.success} />
                  <Text style={[styles.completionText, { color: theme.success }]}>
                    Completed on {new Date(job.completedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>How was your experience?</Text>
          
          {renderStars()}
          
          {rating > 0 && (
            <Text style={[styles.ratingLabel, { color: theme.text }]}>
              {ratingOptions[rating - 1].label}
            </Text>
          )}
        </View>

        {/* Rating Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Rate different aspects</Text>
          
          <View style={styles.ratingAspects}>
            {[
              { aspect: 'Quality of Work', icon: 'build', key: 'quality' },
              { aspect: 'Punctuality', icon: 'schedule', key: 'punctuality' },
              { aspect: 'Communication', icon: 'chat', key: 'communication' },
              { aspect: 'Professionalism', icon: 'person', key: 'professionalism' },
              { aspect: 'Value for Money', icon: 'attach-money', key: 'value' },
            ].map((item, index) => (
              <View key={index} style={[styles.aspectItem, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.aspectHeader}>
                  <IconFallback name={item.icon} size={20} color={theme.primary} />
                  <Text style={[styles.aspectName, { color: theme.text }]}>
                    {item.aspect}
                  </Text>
                </View>
                <View style={styles.aspectStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => {
                        if (!alreadyReviewed && !loading) {
                          handleAspectRating(item.key, star);
                        }
                      }}
                    >
                      <MaterialIcons
                        name={star <= aspectRatings[item.key] ? 'star' : 'star-border'}
                        size={16}
                        color={star <= aspectRatings[item.key] ? theme.warning : theme.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Write a Review</Text>
          
          <View style={[styles.commentContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.commentLabel, { color: theme.textSecondary }]}>
              Tell others about your experience with this mechanic
            </Text>
            <TextInput
              style={[styles.commentInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Write your review here..."
              placeholderTextColor={theme.textSecondary}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
              textAlignVertical="top"
              editable={!alreadyReviewed && !loading}
            />
            <Text style={[styles.commentHint, { color: theme.textSecondary }]}>
              {comment.length}/500 characters
            </Text>
          </View>
        </View>

        {/* Review Guidelines */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Review Guidelines</Text>
          
          <View style={[styles.guidelinesCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.guidelineItem}>
              <IconFallback name="check-circle" size={16} color={theme.success} />
              <Text style={[styles.guidelineText, { color: theme.textSecondary }]}>
                Be honest and constructive in your feedback
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <IconFallback name="check-circle" size={16} color={theme.success} />
              <Text style={[styles.guidelineText, { color: theme.textSecondary }]}>
                Focus on the service quality and professionalism
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <IconFallback name="check-circle" size={16} color={theme.success} />
              <Text style={[styles.guidelineText, { color: theme.textSecondary }]}>
                Avoid personal attacks or inappropriate language
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <IconFallback name="check-circle" size={16} color={theme.success} />
              <Text style={[styles.guidelineText, { color: theme.textSecondary }]}>
                Your review helps other customers make informed decisions
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.submitContainer, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: rating > 0 && comment.trim() && !alreadyReviewed ? theme.primary : theme.textSecondary,
            }
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || !comment.trim() || loading || alreadyReviewed}
        >
          <IconFallback name="star" size={20} color={theme.onPrimary} />
          <Text style={[styles.submitButtonText, { color: theme.onPrimary }]}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  ratingAspects: {
    gap: 12,
  },
  aspectItem: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  aspectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  aspectName: {
    fontSize: 16,
    fontWeight: '500',
  },
  aspectStars: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  commentContainer: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  commentLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 24,
  },
  commentHint: {
    fontSize: 12,
    textAlign: 'right',
  },
  guidelinesCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  guidelineText: {
    fontSize: 14,
    flex: 1,
  },
  bottomSpacing: {
    height: 100,
  },
  submitContainer: {
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Job Details Card Styles
  jobDetailsCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  jobStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  jobInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  jobInfoItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    alignItems: 'center',
  },
  jobInfoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
  },
  jobInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: 8,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 6,
  },
  vehicleText: {
    fontSize: 12,
    marginLeft: 4,
    fontStyle: 'italic',
    flex: 1,
  },
  additionalDetails: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});
