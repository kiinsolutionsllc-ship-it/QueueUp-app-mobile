import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
  Linking,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialButton from '../../components/shared/MaterialButton';
import BidSubmissionModal from '../../components/shared/BidSubmissionModal';
// Supabase integration disabled - no mock data
// import backendService from '../../services/BackendService';
import BiddingService from '../../services/BiddingService';
import FavoritesService from '../../services/FavoritesService';

const { width, height } = Dimensions.get('window');

interface MechanicProfileScreenProps {
  navigation: any;
  route: any;
}

export default function MechanicProfileScreen({ navigation, route }: MechanicProfileScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const theme = getCurrentTheme();
  
  const { mechanic, mechanicId } = route.params;
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // State
  const [isFavorite, setIsFavorite] = useState<any>(false);
  const [showFullDescription, setShowFullDescription] = useState<any>(false);
  const [selectedTab, setSelectedTab] = useState<any>('overview'); // 'overview', 'reviews', 'booking'
  
  // Real data state
  const [realMechanicData, setRealMechanicData] = useState<any>(null);
  const [realReviews, setRealReviews] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<any>(true);
  const [error, setError] = useState<any>(null);
  
  // Bidding state
  const [showBidModal, setShowBidModal] = useState<any>(false);
  const [submittingBid, setSubmittingBid] = useState<any>(false);

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      customerName: 'Sarah Johnson',
      rating: 5,
      date: '2024-01-15',
      comment: 'Excellent service! Mike was professional, knowledgeable, and fixed my car quickly. Highly recommend!',
      service: 'Engine Diagnostics',
      verified: true
    },
    {
      id: 2,
      customerName: 'David Chen',
      rating: 4,
      date: '2024-01-10',
      comment: 'Good work, fair pricing. The mechanic was honest about what needed to be done and what could wait.',
      service: 'Brake Service',
      verified: true
    },
    {
      id: 3,
      customerName: 'Maria Garcia',
      rating: 5,
      date: '2024-01-05',
      comment: 'Outstanding service! They went above and beyond to help me understand what was wrong with my car.',
      service: 'AC Repair',
      verified: true
    },
    {
      id: 4,
      customerName: 'John Smith',
      rating: 4,
      date: '2023-12-28',
      comment: 'Professional and efficient. The work was completed on time and the price was reasonable.',
      service: 'Oil Change',
      verified: true
    },
    {
      id: 5,
      customerName: 'Lisa Brown',
      rating: 5,
      date: '2023-12-20',
      comment: 'Amazing experience! The mechanic was very thorough and explained everything clearly.',
      service: 'Transmission Service',
      verified: true
    }
  ];

  // Mock booking information
  const bookingInfo = {
    availability: {
      today: ['9:00 AM', '2:00 PM', '4:00 PM'],
      tomorrow: ['8:00 AM', '10:00 AM', '1:00 PM', '3:00 PM'],
      thisWeek: ['Tuesday: 9:00 AM - 5:00 PM', 'Wednesday: 8:00 AM - 4:00 PM', 'Thursday: 9:00 AM - 6:00 PM']
    },
    services: [
      { name: 'Engine Diagnostics', price: '$80-120', duration: '1-2 hours' },
      { name: 'Brake Service', price: '$150-300', duration: '2-3 hours' },
      { name: 'Oil Change', price: '$40-80', duration: '30-45 minutes' },
      { name: 'AC Repair', price: '$100-250', duration: '1-3 hours' },
      { name: 'Transmission Service', price: '$200-500', duration: '3-6 hours' }
    ],
    policies: [
      'Free diagnostic for first-time customers',
      '12-month warranty on all repairs',
      '24/7 emergency service available',
      'Mobile service within 10 miles',
      'Payment accepted: Cash, Credit, PayPal'
    ]
  };

  // Fetch real mechanic data (DISABLED - using mock data only)
  const fetchMechanicData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Supabase integration disabled - using mock data only
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set loading to false to show mock data
      setIsLoading(false);
      
      // Uncomment below to re-enable Supabase integration:
      /*
      // Try to fetch real data from backend
      if (mechanicId) {
        
        // Fetch mechanic profile
        const mechanicResult = await backendService.getUser(mechanicId);
        if (mechanicResult.data && !mechanicResult.error) {
          setRealMechanicData(mechanicResult.data);
        }
        
        // Fetch reviews
        const reviewsResult = await backendService.getReviews(mechanicId);
        if (reviewsResult.data && !reviewsResult.error) {
          setRealReviews(reviewsResult.data);
        }
      }
      */
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fall back to mock data - no need to set error state as we have fallbacks
    } finally {
      setIsLoading(false);
    }
  };

  // Animation effects and data loading
  useEffect(() => {
    // Start data fetching
    fetchMechanicData();
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, mechanicId]);

  // Helper functions to get data (real or fallback)
  const getMechanicData = () => {
    // Use real data if available, otherwise fall back to route params or mock data
    if (realMechanicData) {
      return {
        ...realMechanicData,
        // Ensure we have all required fields with fallbacks
        name: realMechanicData.name || mechanic?.name || 'Unknown Mechanic',
        rating: realMechanicData.rating || mechanic?.rating || 4.5,
        reviews: realMechanicData.reviews || mechanic?.reviews || 0,
        specialties: realMechanicData.specialties || mechanic?.specialties || ['General Repair'],
        experience: realMechanicData.experience || mechanic?.experience || 'Contact for details',
        availability: realMechanicData.availability || mechanic?.availability || 'Contact for availability',
        priceRange: realMechanicData.priceRange || mechanic?.priceRange || { min: 50, max: 100 },
        description: realMechanicData.bio || realMechanicData.statement || mechanic?.description || 'Professional automotive service provider.',
        phone: realMechanicData.phone || mechanic?.phone,
        address: realMechanicData.address || mechanic?.address,
        hours: realMechanicData.hours || mechanic?.hours,
        languages: realMechanicData.languages || mechanic?.languages || ['English'],
        certifications: realMechanicData.certifications || mechanic?.certifications || [],
        amenities: realMechanicData.amenities || mechanic?.amenities || [],
        mechanicType: realMechanicData.mechanicType || mechanic?.mechanicType || 'freelance',
        image: realMechanicData.avatar || realMechanicData.image || mechanic?.image,
        distance: realMechanicData.distance || mechanic?.distance,
      };
    }
    
    // Fall back to route params or empty object
    return mechanic || {};
  };

  const getReviewsData = () => {
    // Use real reviews if available, otherwise fall back to mock data
    if (realReviews && realReviews.length > 0) {
      return realReviews.map(review => ({
        id: review.id,
        customerName: review.customer_name || 'Anonymous',
        rating: review.rating || 5,
        date: review.created_at || new Date().toISOString(),
        comment: review.comment || 'Great service!',
        service: review.service_type || 'General Service',
        verified: review.verified || false,
      }));
    }
    
    // Fall back to mock reviews
    return reviews;
  };

  // Get current data
  const currentMechanic = getMechanicData();
  const currentReviews = getReviewsData();

  // Load favorite status on mount
  useEffect(() => {
    loadFavoriteStatus();
  }, [mechanic, user]);

  const loadFavoriteStatus = async () => {
    try {
      await FavoritesService.initialize();
      const favoriteStatus = FavoritesService.isFavorited(
        user?.id || 'customer1',
        mechanic?.id || mechanicId
      );
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Failed to load favorite status:', error);
    }
  };

  // Handle favorite toggle
  const toggleFavorite = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const mechanicData = realMechanicData || mechanic || {
        id: mechanicId,
        name: 'Mechanic',
        rating: 4.5,
        specialties: [],
        location: 'Location',
        mechanicType: 'freelance'
      };

      const result = await FavoritesService.toggleFavorite(
        user?.id || 'customer1',
        mechanicData
      );

      if (result.success) {
        setIsFavorite(!isFavorite);
        Alert.alert(
          isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
          isFavorite 
            ? 'This mechanic has been removed from your favorites.'
            : 'This mechanic has been added to your favorites!'
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  // Handle phone call
  const handlePhoneCall = () => {
    if (currentMechanic?.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Linking.openURL(`tel:${currentMechanic.phone}`);
    }
  };

  // Handle message
  const handleMessage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      // Navigate directly to messaging screen with mechanic context
      navigation.navigate('Messaging', {
        mechanicId: currentMechanic?.id || 'mechanic1',
        mechanicName: currentMechanic?.name || 'Mechanic',
        customerId: user?.id || 'customer1',
        customerName: user?.name || 'Customer'
      });
    } catch (error) {
      console.error('Error handling message:', error);
      // Fallback: navigate to conversation list
      navigation.navigate('ConversationList');
    }
  };

  // Handle book service
  const handleBookService = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('CreateJob', { 
      mechanicId: currentMechanic.id || mechanicId,
      mechanicName: currentMechanic.name 
    });
  };

  // Handle submit bid
  const handleSubmitBid = async (bidData) => {
    try {
      setSubmittingBid(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // For development, simulate bid submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, use real API:
      // const result = await BiddingService.submitBid('temp_job_id', currentMechanic.id, bidData);
      // if (result.success) {
      //   Alert.alert('Success', 'Your bid has been submitted successfully!');
      //   setShowBidModal(false);
      // } else {
      //   throw new Error(result.error);
      // }

      // Mock success
      Alert.alert(
        'Bid Submitted!',
        'Your bid has been submitted successfully. The customer will review it and get back to you soon.',
        [{ text: 'OK', onPress: () => setShowBidModal(false) }]
      );
    } catch (error) {
      console.error('Error submitting bid:', error);
      Alert.alert('Error', 'Failed to submit bid. Please try again.');
    } finally {
      setSubmittingBid(false);
    }
  };

  // Render stars
  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconFallback
            key={star}
            name={star <= Math.floor(rating) ? 'star' : 'star-border'}
            size={20}
            color={theme.accentLight}
          />
        ))}
      </View>
    );
  };

  // Render specialty tags
  const renderSpecialties = () => {
    return (currentMechanic?.specialties || []).map((specialty, index) => (
      <View key={index} style={[styles.specialtyTag, { backgroundColor: theme.surface }]}>
        <Text style={[styles.specialtyText, { color: theme.textSecondary }]}>
          {specialty}
        </Text>
      </View>
    ));
  };

  // Render amenities (for shops)
  const renderAmenities = () => {
    if (currentMechanic?.mechanicType !== 'shops' || !currentMechanic?.amenities) return null;
    
    return currentMechanic.amenities.map((amenity, index) => (
      <View key={index} style={[styles.amenityItem, { backgroundColor: theme.surface }]}>
        <IconFallback name="check" size={16} color={theme.success} />
        <Text style={[styles.amenityText, { color: theme.text }]}>
          {amenity}
        </Text>
      </View>
    ));
  };

  // Render certifications
  const renderCertifications = () => {
    if (!currentMechanic?.certifications) return null;
    
    return currentMechanic.certifications.map((cert, index) => (
      <View key={index} style={[styles.certificationItem, { backgroundColor: theme.surface }]}>
        <IconFallback name="verified" size={16} color={theme.accentLight} />
        <Text style={[styles.certificationText, { color: theme.text }]}>
          {cert}
        </Text>
      </View>
    ));
  };

  // Render individual review
  const renderReview = (review) => {
    return (
      <View key={review.id} style={[styles.reviewCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <View style={[styles.reviewerAvatar, { backgroundColor: theme.surface }]}>
              <Text style={[styles.reviewerInitial, { color: theme.text }]}>
                {review.customerName.charAt(0)}
              </Text>
            </View>
            <View style={styles.reviewerDetails}>
              <View style={styles.reviewerNameRow}>
                <Text style={[styles.reviewerName, { color: theme.text }]}>
                  {review.customerName}
                </Text>
                {review.verified && (
                  <IconFallback name="verified" size={16} color={theme.accentLight} />
                )}
              </View>
              <View style={styles.reviewMeta}>
                {renderStars(review.rating)}
                <Text style={[styles.reviewDate, { color: theme.textSecondary }]}>
                  {new Date(review.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        <Text style={[styles.reviewService, { color: theme.accentLight }]}>
          Service: {review.service}
        </Text>
        
        <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>
          {review.comment}
        </Text>
      </View>
    );
  };

  // Render booking availability
  const renderAvailability = () => {
    return (
      <View style={styles.availabilitySection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Available Times</Text>
        
        {/* Today */}
        <View style={styles.availabilityDay}>
          <Text style={[styles.availabilityDayTitle, { color: theme.text }]}>Today</Text>
          <View style={styles.timeSlots}>
            {bookingInfo.availability.today.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.timeSlot, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  // Handle time selection
                }}
              >
                <Text style={[styles.timeSlotText, { color: theme.text }]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tomorrow */}
        <View style={styles.availabilityDay}>
          <Text style={[styles.availabilityDayTitle, { color: theme.text }]}>Tomorrow</Text>
          <View style={styles.timeSlots}>
            {bookingInfo.availability.tomorrow.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.timeSlot, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  // Handle time selection
                }}
              >
                <Text style={[styles.timeSlotText, { color: theme.text }]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Render services and pricing
  const renderServices = () => {
    return (
      <View style={styles.servicesSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Services & Pricing</Text>
        {bookingInfo.services.map((service, index) => (
          <View key={index} style={[styles.serviceItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
              <Text style={[styles.serviceDuration, { color: theme.textSecondary }]}>{service.duration}</Text>
            </View>
            <Text style={[styles.servicePrice, { color: theme.accentLight }]}>{service.price}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render policies
  const renderPolicies = () => {
    return (
      <View style={styles.policiesSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Policies & Information</Text>
        {bookingInfo.policies.map((policy, index) => (
          <View key={index} style={styles.policyItem}>
            <IconFallback name="check-circle" size={16} color={theme.success} />
            <Text style={[styles.policyText, { color: theme.textSecondary }]}>{policy}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ModernHeader
          title="Mechanic Profile"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accentLight} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading mechanic profile...
          </Text>
        </View>
      </View>
    );
  }

  // Show error state if no mechanic data available
  if (!currentMechanic || (!mechanic && !realMechanicData)) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ModernHeader
          title="Mechanic Profile"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <IconFallback name="error" size={48} color={theme.textSecondary} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Mechanic not found
          </Text>
          {error && (
            <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>
              {error}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      <ModernHeader
        title="Mechanic Profile"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          { 
            icon: isFavorite ? 'favorite' : 'favorite-border', 
            onPress: toggleFavorite,
            color: isFavorite ? theme.error : theme.text
          },
        ]}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <Animated.View 
          style={[
            styles.profileHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Profile Image */}
          <View style={[styles.profileImageContainer, { backgroundColor: theme.surface }]}>
            {currentMechanic.image ? (
              <Image source={{ uri: currentMechanic.image }} style={styles.profileImage} />
            ) : (
              <IconFallback 
                name={currentMechanic.mechanicType === 'shops' ? 'store' : 'person'} 
                size={60} 
                color={theme.textSecondary} 
              />
            )}
          </View>

          {/* Basic Info */}
          <View style={styles.basicInfo}>
            <Text style={[styles.mechanicName, { color: theme.text }]}>
              {currentMechanic.name}
            </Text>
            
            {/* Rating */}
            <View style={styles.ratingContainer}>
              {renderStars(currentMechanic.rating)}
              <Text style={[styles.ratingText, { color: theme.accentLight }]}>
                {currentMechanic.rating} ({currentMechanic.reviews} reviews)
              </Text>
            </View>

            {/* Type Badge */}
            <View style={[
              styles.typeBadge, 
              { 
                backgroundColor: currentMechanic.mechanicType === 'shops' ? theme.accentLight + '20' : theme.accent + '20',
                borderColor: currentMechanic.mechanicType === 'shops' ? theme.accentLight : theme.accent
              }
            ]}>
              <IconFallback 
                name={currentMechanic.mechanicType === 'shops' ? "store" : "person"} 
                size={16} 
                color={currentMechanic.mechanicType === 'shops' ? theme.accentLight : theme.accent} 
              />
              <Text style={[
                styles.typeText, 
                { color: currentMechanic.mechanicType === 'shops' ? theme.accentLight : theme.accent }
              ]}>
                {currentMechanic.mechanicType === 'shops' ? 'Mechanic Shop' : 'Freelance Mechanic'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Tab Navigation */}
        <Animated.View 
          style={[
            styles.tabContainer,
            {
              backgroundColor: theme.surface,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'overview' && { backgroundColor: theme.accentLight }
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSelectedTab('overview');
            }}
          >
            <Text style={[
              styles.tabText,
              { 
                color: selectedTab === 'overview' ? theme.background : theme.text,
                fontWeight: selectedTab === 'overview' ? 'bold' : 'normal'
              }
            ]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'reviews' && { backgroundColor: theme.accentLight }
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSelectedTab('reviews');
            }}
          >
            <Text style={[
              styles.tabText,
              { 
                color: selectedTab === 'reviews' ? theme.background : theme.text,
                fontWeight: selectedTab === 'reviews' ? 'bold' : 'normal'
              }
            ]}>
              Reviews ({currentReviews.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'booking' && { backgroundColor: theme.accentLight }
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSelectedTab('booking');
            }}
          >
            <Text style={[
              styles.tabText,
              { 
                color: selectedTab === 'booking' ? theme.background : theme.text,
                fontWeight: selectedTab === 'booking' ? 'bold' : 'normal'
              }
            ]}>
              Booking
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <Animated.View 
            style={[
              styles.tabContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Quick Info Cards */}
            <View style={styles.quickInfoContainer}>
              {/* Availability */}
              <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <IconFallback name="schedule" size={24} color={theme.accentLight} />
                <Text style={[styles.infoCardTitle, { color: theme.text }]}>Availability</Text>
                <Text style={[styles.infoCardValue, { color: theme.textSecondary }]}>
                  {currentMechanic.availability || 'Contact for availability'}
                </Text>
              </View>

              {/* Experience */}
              <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <IconFallback name="work" size={24} color={theme.accentLight} />
                <Text style={[styles.infoCardTitle, { color: theme.text }]}>Experience</Text>
                <Text style={[styles.infoCardValue, { color: theme.textSecondary }]}>
                  {currentMechanic.experience || 'Contact for details'}
                </Text>
              </View>

              {/* Price Range */}
              <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <IconFallback name="attach-money" size={24} color={theme.accentLight} />
                <Text style={[styles.infoCardTitle, { color: theme.text }]}>Price Range</Text>
                <Text style={[styles.infoCardValue, { color: theme.textSecondary }]}>
                  ${currentMechanic.priceRange?.min || 0}-${currentMechanic.priceRange?.max || 100}/hr
                </Text>
              </View>

              {/* Distance (if available) */}
              {currentMechanic.distance && (
                <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <IconFallback name="location-on" size={24} color={theme.accentLight} />
                  <Text style={[styles.infoCardTitle, { color: theme.text }]}>Distance</Text>
                  <Text style={[styles.infoCardValue, { color: theme.textSecondary }]}>
                    {(currentMechanic.distance || 0).toFixed(1)} miles
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {currentMechanic.description && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>
                  {showFullDescription ? currentMechanic.description : currentMechanic.description.substring(0, 200)}
                  {currentMechanic.description.length > 200 && !showFullDescription && '...'}
                </Text>
                {currentMechanic.description.length > 200 && (
                  <TouchableOpacity
                    onPress={() => setShowFullDescription(!showFullDescription)}
                    style={styles.readMoreButton}
                  >
                    <Text style={[styles.readMoreText, { color: theme.accentLight }]}>
                      {showFullDescription ? 'Read Less' : 'Read More'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Specialties */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Specialties</Text>
              <View style={styles.specialtiesContainer}>
                {renderSpecialties()}
              </View>
            </View>

            {/* Languages */}
            {currentMechanic.languages && currentMechanic.languages.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Languages</Text>
                <Text style={[styles.languagesText, { color: theme.textSecondary }]}>
                  {currentMechanic.languages.join(' • ')}
                </Text>
              </View>
            )}

            {/* Certifications */}
            {currentMechanic.certifications && currentMechanic.certifications.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Certifications</Text>
                <View style={styles.certificationsContainer}>
                  {renderCertifications()}
                </View>
              </View>
            )}

            {/* Amenities (for shops) */}
            {currentMechanic.mechanicType === 'shops' && currentMechanic.amenities && currentMechanic.amenities.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Amenities</Text>
                <View style={styles.amenitiesContainer}>
                  {renderAmenities()}
                </View>
              </View>
            )}

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Information</Text>
              
              {currentMechanic.address && (
                <View style={styles.contactItem}>
                  <IconFallback name="location-on" size={20} color={theme.textSecondary} />
                  <Text style={[styles.contactText, { color: theme.textSecondary }]}>
                    {currentMechanic.address}
                  </Text>
                </View>
              )}
              
              {currentMechanic.phone && (
                <TouchableOpacity style={styles.contactItem} onPress={handlePhoneCall}>
                  <IconFallback name="phone" size={20} color={theme.accentLight} />
                  <Text style={[styles.contactText, { color: theme.accentLight }]}>
                    {currentMechanic.phone}
                  </Text>
                </TouchableOpacity>
              )}
              
              {currentMechanic.hours && (
                <View style={styles.contactItem}>
                  <IconFallback name="schedule" size={20} color={theme.textSecondary} />
                  <Text style={[styles.contactText, { color: theme.textSecondary }]}>
                    {currentMechanic.hours}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Reviews Tab Content */}
        {selectedTab === 'reviews' && (
          <Animated.View 
            style={[
              styles.tabContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Rating Summary */}
            <View style={[styles.ratingSummary, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.ratingSummaryLeft}>
                <Text style={[styles.overallRating, { color: theme.text }]}>{currentMechanic.rating}</Text>
                <View style={styles.ratingStarsLarge}>
                  {renderStars(currentMechanic.rating)}
                </View>
                <Text style={[styles.totalReviews, { color: theme.textSecondary }]}>
                  Based on {currentMechanic.reviews} reviews
                </Text>
              </View>
              <View style={styles.ratingBreakdown}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = Math.floor(Math.random() * 10) + 1; // Mock data
                  const percentage = (count / currentMechanic.reviews) * 100;
                  return (
                    <View key={star} style={styles.ratingBar}>
                      <Text style={[styles.ratingBarLabel, { color: theme.textSecondary }]}>{star}</Text>
                      <View style={[styles.ratingBarContainer, { backgroundColor: theme.surface }]}>
                        <View style={[
                          styles.ratingBarFill, 
                          { 
                            backgroundColor: theme.accentLight,
                            width: `${percentage}%`
                          }
                        ]} />
                      </View>
                      <Text style={[styles.ratingBarCount, { color: theme.textSecondary }]}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Individual Reviews */}
            <View style={styles.reviewsList}>
              {currentReviews.map(renderReview)}
            </View>
          </Animated.View>
        )}

        {/* Booking Tab Content */}
        {selectedTab === 'booking' && (
          <Animated.View 
            style={[
              styles.tabContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {renderAvailability()}
            {renderServices()}
            {renderPolicies()}
          </Animated.View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Action Buttons */}
      <Animated.View 
        style={[
          styles.actionButtonsContainer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <MaterialButton
          title="Submit Bid"
          onPress={() => setShowBidModal(true)}
          variant="outlined"
          style={styles.actionButton}
        />
        <MaterialButton
          title="Message"
          onPress={handleMessage}
          style={styles.actionButton}
        />
      </Animated.View>

      {/* Bid Submission Modal */}
      <BidSubmissionModal
        visible={showBidModal}
        onClose={() => setShowBidModal(false)}
        job={{
          id: 'temp_job_id',
          category: 'Repair',
          subcategory: 'Brake Repair',
          description: 'Need brake pads and rotors replaced on my 2020 Vehicle',
          vehicle: {
            year: '2020',
            make: 'Vehicle',
            model: 'Model'
          },
          serviceType: 'mobile'
        }}
        mechanic={currentMechanic}
        onSubmitBid={handleSubmitBid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for fixed action buttons
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  basicInfo: {
    alignItems: 'center',
  },
  mechanicName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    marginBottom: 20,
  },
  quickInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  infoCardValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  languagesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  certificationsContainer: {
    gap: 8,
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  certificationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  amenitiesContainer: {
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  amenityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    flex: 1,
  },
  ratingSummary: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    flexDirection: 'row',
  },
  ratingSummaryLeft: {
    alignItems: 'center',
    marginRight: 20,
  },
  overallRating: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingStarsLarge: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
  },
  ratingBreakdown: {
    flex: 1,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBarLabel: {
    fontSize: 14,
    width: 20,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratingBarCount: {
    fontSize: 12,
    width: 20,
    textAlign: 'right',
  },
  reviewsList: {
    gap: 16,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reviewHeader: {
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewService: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  availabilitySection: {
    marginBottom: 24,
  },
  availabilityDay: {
    marginBottom: 16,
  },
  availabilityDayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  servicesSection: {
    marginBottom: 24,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  policiesSection: {
    marginBottom: 24,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  policyText: {
    fontSize: 14,
    flex: 1,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Safe area
    borderTopWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});
