import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { Rating } from 'react-native-ratings';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import ValidatedForm from '../../components/shared/ValidatedForm';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialButton from '../../components/shared/MaterialButton';
import MaterialCard from '../../components/shared/MaterialCard';


interface RatingScreenProps {
  navigation: any;
  route: {
    params?: any;
  };
}
export default function RatingScreen({ navigation, route }: RatingScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();
  const [isLoading, setIsLoading] = useState<any>(false);
  const [rating, setRating] = useState<any>(0);
  const [selectedCategories, setSelectedCategories] = useState<any>({});

  const { job, userType, onRatingComplete } = route.params || {};

  const ratingCategories = [
    { key: 'quality', label: 'Service Quality', icon: 'star' },
    { key: 'timeliness', label: 'Timeliness', icon: 'schedule' },
    { key: 'communication', label: 'Communication', icon: 'chat' },
    { key: 'professionalism', label: 'Professionalism', icon: 'business' },
    { key: 'value', label: 'Value for Money', icon: 'attach-money' },
  ];

  const validationRules = {
    review: [{ validator: 'minLength', message: 'Review must be at least 10 characters' }],
  };

  const handleCategoryRating = (category, value) => {
    setSelectedCategories(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmitRating = async (values) => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please provide an overall rating');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const ratingData = {
        jobId: job?.id,
        raterId: user?.id,
        raterType: userType,
        overallRating: rating,
        categoryRatings: selectedCategories,
        review: values.review || '',
        timestamp: new Date().toISOString(),
      };

      // In a real app, you would save this to your API
      
      Alert.alert(
        'Thank You!',
        'Your rating has been submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onRatingComplete) {
                onRatingComplete(ratingData);
              }
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryRating = (category) => (
    <View key={category.key} style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <IconFallback name={category.icon} size={20} color={theme.primary} />
        <Text style={[styles.categoryLabel, { color: theme.text }]}>
          {category.label}
        </Text>
      </View>
      <Rating
        type="star"
        ratingCount={5}
        imageSize={24}
        startingValue={selectedCategories[category.key] || 0}
        onFinishRating={(rating) => handleCategoryRating(category.key, rating)}
        style={styles.rating}
        tintColor={theme.background}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Rate Service"
        onBackPress={() => navigation.goBack()}
        showBack
      />
      
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Job Info */}
          {job && (
            <MaterialCard style={[styles.jobCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.jobTitle, { color: theme.text }]}>{job.title}</Text>
              <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
                {job.description}
              </Text>
              <View style={styles.jobDetails}>
                <Text style={[styles.jobDetail, { color: theme.textSecondary }]}>
                  {job.mechanic?.name || 'Service Provider'}
                </Text>
                <Text style={[styles.jobDetail, { color: theme.textSecondary }]}>
                  ${job.price}
                </Text>
              </View>
            </MaterialCard>
          )}

          {/* Overall Rating */}
          <View style={styles.ratingSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Overall Rating
            </Text>
            <View style={styles.overallRatingContainer}>
              <Rating
                type="star"
                ratingCount={5}
                imageSize={40}
                startingValue={rating}
                onFinishRating={setRating}
                style={styles.overallRating}
                tintColor={theme.background}
              />
              <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                {rating > 0 ? `${rating} out of 5 stars` : 'Tap to rate'}
              </Text>
            </View>
          </View>

          {/* Category Ratings */}
          <View style={styles.categoriesSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Rate by Category
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Help others by rating specific aspects of the service
            </Text>
            {ratingCategories.map(renderCategoryRating)}
          </View>

          {/* Review Form */}
          <ValidatedForm
            initialValues={{ review: '' }}
            validationRules={validationRules}
            onSubmit={handleSubmitRating}
            submitButtonText="Submit Rating"
            submitButtonVariant="filled"
          >
            {({ MaterialTextInput }) => (
              <View style={styles.reviewSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Write a Review
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Share your experience with others (optional)
                </Text>
                
                <MaterialTextInput
                  name="review"
                  label="Your Review"
                  placeholder="Tell others about your experience..."
                  multiline
                  numberOfLines={4}
                  leftIcon="rate-review"
                />
              </View>
            )}
          </ValidatedForm>

          {/* Rating Guidelines */}
          <MaterialCard style={[styles.guidelinesCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.guidelinesTitle, { color: theme.text }]}>
              Rating Guidelines
            </Text>
            <Text style={[styles.guideline, { color: theme.textSecondary }]}>
              • 5 stars: Excellent service, exceeded expectations
            </Text>
            <Text style={[styles.guideline, { color: theme.textSecondary }]}>
              • 4 stars: Good service, met expectations
            </Text>
            <Text style={[styles.guideline, { color: theme.textSecondary }]}>
              • 3 stars: Average service, room for improvement
            </Text>
            <Text style={[styles.guideline, { color: theme.textSecondary }]}>
              • 2 stars: Below average, significant issues
            </Text>
            <Text style={[styles.guideline, { color: theme.textSecondary }]}>
              • 1 star: Poor service, major problems
            </Text>
          </MaterialCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  jobCard: {
    padding: 16,
    marginBottom: 24,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jobDetail: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  overallRatingContainer: {
    alignItems: 'center',
  },
  overallRating: {
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoriesSection: {
    marginBottom: 32,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  rating: {
    alignSelf: 'flex-start',
  },
  reviewSection: {
    marginBottom: 24,
  },
  guidelinesCard: {
    padding: 16,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  guideline: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
});
