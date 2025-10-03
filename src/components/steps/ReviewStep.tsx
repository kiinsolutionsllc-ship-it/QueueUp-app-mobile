import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  Animated 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { StepComponentProps, ImageData } from '../../types/JobTypes';
import { useTheme } from '../../contexts/ThemeContext';
import { useVehicle } from '../../contexts/VehicleContext';
import { createJobStyles } from '../../styles/CreateJobScreenStyles';
import IconFallback from '../shared/IconFallback';

// Enhanced styles with yellow theme integration
const additionalStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.4,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  reviewCardSelected: {
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  editButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Hero section styles
  heroSection: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
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
    marginBottom: 8,
  },
  heroWave: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 12,
  },
});

interface ReviewStepProps extends StepComponentProps {
  images: ImageData[];
  onScrollToBottom: (event: any) => void;
  onConfirmationChange?: (confirmed: boolean) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  updateFormData,
  theme,
  onNext,
  onBack,
  canProceed,
  isLoading = false,
  images,
  onScrollToBottom,
  onConfirmationChange,
}) => {
  const baseStyles = createJobStyles(theme);
  const styles = { ...baseStyles, ...additionalStyles };
  const { vehicles } = useVehicle();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // State for user confirmation
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Animation values for enhanced interactions
  const heroScale = React.useRef(new Animated.Value(1)).current;
  const heroOpacity = React.useRef(new Animated.Value(0)).current;
  const heroIconPulse = React.useRef(new Animated.Value(1)).current;

  // Scroll to top when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Hero animation on mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for hero icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(heroIconPulse, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(heroIconPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [heroIconPulse, heroOpacity, heroScale]);

  // Handle confirmation toggle
  const handleConfirmationToggle = useCallback(() => {
    const newConfirmed = !isConfirmed;
    setIsConfirmed(newConfirmed);
    onConfirmationChange?.(newConfirmed);
  }, [isConfirmed, onConfirmationChange]);


  // Format service type display
  const getServiceTypeDisplay = useCallback(() => {
    switch (formData.serviceType) {
      case 'mobile':
        return 'Mobile Service';
      case 'shop':
        return 'Shop Service';
      default:
        return 'Not selected';
    }
  }, [formData.serviceType]);

  // Format vehicle display
  const getVehicleDisplay = useCallback(() => {
    if (!formData.vehicle) {
      return 'Not selected';
    }
    
    // Handle both vehicle object and vehicle ID
    if (typeof formData.vehicle === 'object' && formData.vehicle && (formData.vehicle as any).id) {
      return `${(formData.vehicle as any).make} ${(formData.vehicle as any).model} (${(formData.vehicle as any).year})`;
    }
    
    // Find the selected vehicle from VehicleContext
    const selectedVehicle = vehicles.find(v => v.id === formData.vehicle);
    if (selectedVehicle) {
      return `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.year})`;
    }
    
    // If vehicle is a string but not found in context, return the string
    if (typeof formData.vehicle === 'string') {
      return formData.vehicle;
    }
    
    return 'Not selected';
  }, [formData.vehicle, vehicles]);

  // Format urgency display
  const getUrgencyDisplay = useCallback(() => {
    const urgencyMap: Record<string, string> = {
      'low': 'Low (Can wait a few days)',
      'medium': 'Medium (Within 24 hours)',
      'high': 'High (ASAP - Emergency)',
    };
    return urgencyMap[formData.urgency || ''] || 'Not selected';
  }, [formData.urgency]);

  // Render hero section
  const renderHeroSection = () => {
    return (
      <Animated.View 
        style={[
          styles.heroSection,
          { 
            backgroundColor: theme.primary + '15',
            borderWidth: 2,
            borderColor: theme.primary + '30',
            opacity: heroOpacity,
            transform: [{ scale: heroScale }]
          }
        ]}
      >
        {/* Background Pattern */}
        <View style={[
          styles.heroBackground,
          { backgroundColor: theme.primary }
        ]} />
        
        <View style={styles.heroContent}>
          {/* Hero Icon */}
          <Animated.View style={[
            styles.heroIcon,
            { 
              backgroundColor: theme.primary,
              transform: [{ scale: heroIconPulse }]
            }
          ]}>
            <Ionicons 
              name="checkmark-circle" 
              size={20} 
              color={theme.onPrimary} 
            />
          </Animated.View>
          
          {/* Hero Title */}
          <Text style={[
            styles.heroTitle,
            { color: theme.text }
          ]}>
            Review Your Request
          </Text>
          
          {/* Hero Subtitle */}
          <Text style={[
            styles.heroSubtitle,
            { color: theme.textSecondary }
          ]}>
            Please review all details before submitting your service request
          </Text>
        </View>
        
        {/* Decorative Wave */}
        <View style={[
          styles.heroWave,
          { backgroundColor: theme.background }
        ]} />
      </Animated.View>
    );
  };

  // Format category display
  const getCategoryDisplay = useCallback(() => {
    if (!formData.category) {
      return 'Not selected';
    }
    
    const categoryMap: Record<string, string> = {
      'maintenance': 'Maintenance',
      'repair': 'Repair',
      'diagnostic': 'Diagnostic',
      'emergency': 'Emergency',
    };
    
    return categoryMap[formData.category] || formData.category;
  }, [formData.category]);

  // Format subcategory display
  const getSubcategoryDisplay = useCallback(() => {
    if (!formData.subcategory) {
      return 'Not selected';
    }
    
    const subcategoryMap: Record<string, string> = {
      // Maintenance subcategories
      'oil-change': 'Oil Change',
      'tire-rotation': 'Tire Rotation',
      'brake-check': 'Brake Check',
      'battery-check': 'Battery Check',
      
      // Repair subcategories
      'engine-repair': 'Engine Repair',
      'transmission': 'Transmission',
      'electrical': 'Electrical',
      
      // Diagnostic subcategories
      'check-engine': 'Check Engine Light',
      'full-diagnostic': 'Full Diagnostic',
      'emissions': 'Emissions Test',
      
      // Emergency subcategories
      'jump-start': 'Jump Start',
      'tire-change': 'Tire Change',
      'lockout': 'Lockout Service',
      'towing': 'Towing',
    };
    
    return subcategoryMap[formData.subcategory] || formData.subcategory;
  }, [formData.subcategory]);

  // Format estimated cost
  const getEstimatedCostDisplay = useCallback(() => {
    if (formData.estimatedCost) {
      return `$${formData.estimatedCost}`;
    }
    return 'To be determined';
  }, [formData.estimatedCost]);

  // Get urgency color
  const getUrgencyColor = useCallback(() => {
    switch (formData.urgency) {
      case 'low':
        return theme.success;
      case 'medium':
        return theme.warning;
      case 'high':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  }, [formData.urgency, theme]);

  // Get service type specific description
  const getServiceTypeDescription = useCallback(() => {
    switch (formData.serviceType) {
      case 'mobile':
        return 'Your mobile service request is complete and ready to be submitted. A qualified mechanic will bid on your request and complete the work once scheduled.';
      case 'shop':
        return 'Your shop service request is complete and ready to be submitted. A qualified mechanic at your selected shop will review your request and contact you soon.';
      default:
        return 'Your service request is complete and ready to be submitted. A qualified mechanic will review your request and contact you soon.';
    }
  }, [formData.serviceType]);

  // Get service type specific mechanic text
  const getServiceTypeMechanicText = useCallback(() => {
    switch (formData.serviceType) {
      case 'mobile':
        return 'Mechanics come to you';
      case 'shop':
        return 'Certified Mechanics';
      default:
        return 'Verified mechanics';
    }
  }, [formData.serviceType]);

  // Render image grid
  const renderImageGrid = useCallback(() => {
    if (!images || images.length === 0) {
      return (
        <View>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            No photos added
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {images.slice(0, 4).map((image, index) => (
          <Image
            key={index}
            source={{ uri: image.uri }}
            style={{ width: 80, height: 80, borderRadius: 8 }}
          />
        ))}
        {images.length > 4 && (
          <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
            <Text style={[styles.errorText, { color: theme.onPrimary }]}>
              +{images.length - 4}
            </Text>
          </View>
        )}
      </View>
    );
  }, [images, styles, theme]);

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.scrollView} 
      contentContainerStyle={styles.scrollContent}
      onScroll={onScrollToBottom}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stepContainer}>
        
        {/* Hero Section */}
        {renderHeroSection()}

        {/* Consolidated Service Request Review */}
        <View style={[
          styles.summaryCard,
          { 
            backgroundColor: theme.surface,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16
          }
        ]}>
          <View style={styles.summaryHeader}>
            <View style={[
              styles.iconContainer,
              { 
                backgroundColor: theme.primary + '20',
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }
            ]}>
              <IconFallback name="assignment" size={20} color={theme.primary} />
            </View>
            <Text style={[
              styles.summaryTitle,
              { 
                color: theme.primary,
                fontSize: 18,
                fontWeight: '700',
                flex: 1
              }
            ]}>
              Service Request Summary
            </Text>
          </View>
          
          <View style={{ marginTop: 20, gap: 16 }}>
            {/* Service Information */}
            <View style={{ gap: 8 }}>
              <Text style={[
                styles.inputLabel,
                { 
                  color: theme.primary,
                  fontSize: 14,
                  fontWeight: '700',
                  marginBottom: 4
                }
              ]}>
                Service Information
              </Text>
              <View style={[
                styles.inputContainer,
                { 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.textSecondary,
                    fontSize: 13,
                    fontWeight: '600'
                  }
                ]}>
                  Service Type
                </Text>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.text,
                    fontSize: 14,
                    fontWeight: '600'
                  }
                ]}>
                  {getServiceTypeDisplay()}
                </Text>
              </View>
              <View style={[
                styles.inputContainer,
                { 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.textSecondary,
                    fontSize: 13,
                    fontWeight: '600'
                  }
                ]}>
                  Vehicle
                </Text>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.text,
                    fontSize: 14,
                    fontWeight: '600'
                  }
                ]}>
                  {getVehicleDisplay()}
                </Text>
              </View>
            </View>

            {/* Service Details */}
            <View style={{ gap: 8 }}>
              <Text style={[
                styles.inputLabel,
                { 
                  color: theme.warning,
                  fontSize: 14,
                  fontWeight: '700',
                  marginBottom: 4
                }
              ]}>
                Service Details
              </Text>
              <View style={[
                styles.inputContainer,
                { 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.textSecondary,
                    fontSize: 13,
                    fontWeight: '600'
                  }
                ]}>
                  Category
                </Text>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.text,
                    fontSize: 14,
                    fontWeight: '600'
                  }
                ]}>
                  {getCategoryDisplay()}
                </Text>
              </View>
              <View style={[
                styles.inputContainer,
                { 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.textSecondary,
                    fontSize: 13,
                    fontWeight: '600'
                  }
                ]}>
                  Subcategory
                </Text>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.text,
                    fontSize: 14,
                    fontWeight: '600'
                  }
                ]}>
                  {getSubcategoryDisplay()}
                </Text>
              </View>
              <View style={[
                styles.inputContainer,
                { 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.textSecondary,
                    fontSize: 13,
                    fontWeight: '600'
                  }
                ]}>
                  Estimated Cost
                </Text>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.text,
                    fontSize: 14,
                    fontWeight: '600'
                  }
                ]}>
                  {getEstimatedCostDisplay()}
                </Text>
              </View>
            </View>

            {/* Description & Location */}
            <View style={{ gap: 8 }}>
              <Text style={[
                styles.inputLabel,
                { 
                  color: theme.error,
                  fontSize: 14,
                  fontWeight: '700',
                  marginBottom: 4
                }
              ]}>
                Description & Location
              </Text>
              <View style={[
                styles.inputContainer,
                { 
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.textSecondary,
                    fontSize: 13,
                    fontWeight: '600',
                    marginBottom: 6
                  }
                ]}>
                  Description
                </Text>
                <Text style={[
                  styles.errorText,
                  { 
                    color: theme.text,
                    fontSize: 14,
                    lineHeight: 20
                  }
                ]}>
                  {formData.description || 'No description provided'}
                </Text>
              </View>
              <View style={[
                styles.inputContainer,
                { 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.textSecondary,
                    fontSize: 13,
                    fontWeight: '600'
                  }
                ]}>
                  Location
                </Text>
                <Text style={[
                  styles.errorText,
                  { 
                    color: theme.text,
                    fontSize: 14,
                    fontWeight: '600',
                    flex: 1,
                    textAlign: 'right'
                  }
                ]}>
                  {formData.location || 'Not selected'}
                </Text>
              </View>
              <View style={[
                styles.inputContainer,
                { 
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.textSecondary,
                    fontSize: 13,
                    fontWeight: '600'
                  }
                ]}>
                  Urgency
                </Text>
                <Text style={[
                  styles.errorText,
                  { 
                    color: getUrgencyColor(),
                    fontSize: 14,
                    fontWeight: '600'
                  }
                ]}>
                  {getUrgencyDisplay()}
                </Text>
              </View>
            </View>

            {/* Photos */}
            <View style={{ gap: 8 }}>
              <Text style={[
                styles.inputLabel,
                { 
                  color: theme.textSecondary,
                  fontSize: 14,
                  fontWeight: '700',
                  marginBottom: 4
                }
              ]}>
                Photos ({images?.length || 0})
              </Text>
              <View style={[
                styles.inputContainer,
                { 
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                {renderImageGrid()}
              </View>
            </View>
          </View>
        </View>


        {/* Ready to Submit Card */}
        <View style={[
          styles.summaryCard,
          { 
            backgroundColor: theme.success + '10',
            borderColor: theme.success + '30',
            borderWidth: 1,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16
          }
        ]}>
          <View style={styles.summaryHeader}>
            <View style={[
              styles.iconContainer,
              { 
                backgroundColor: theme.success + '20',
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }
            ]}>
              <IconFallback name="check-circle" size={20} color={theme.success} />
            </View>
            <Text style={[
              styles.summaryTitle,
              { 
                color: theme.success,
                fontSize: 16,
                fontWeight: '700',
                flex: 1
              }
            ]}>
              Ready to Submit!
            </Text>
          </View>
          
          <View style={{ marginTop: 16 }}>
            <Text style={[
              styles.errorText,
              { 
                color: theme.text,
                fontSize: 14,
                lineHeight: 20,
                marginBottom: 16
              }
            ]}>
              {getServiceTypeDescription()}
            </Text>
            
            <View style={{ gap: 8 }}>
              <View style={[
                styles.inputContainer,
                { 
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: theme.surface,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                <IconFallback name="verified" size={16} color={theme.success} style={{ marginRight: 8 }} />
                <Text style={[
                  styles.errorText,
                  { 
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: '600'
                  }
                ]}>
                  {getServiceTypeMechanicText()}
                </Text>
              </View>
              <View style={[
                styles.inputContainer,
                { 
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: theme.surface,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                <IconFallback name="schedule" size={16} color={theme.success} style={{ marginRight: 8 }} />
                <Text style={[
                  styles.errorText,
                  { 
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: '600'
                  }
                ]}>
                  Quick response
                </Text>
              </View>
              <View style={[
                styles.inputContainer,
                { 
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: theme.surface,
                  borderRadius: 8,
                  marginBottom: 0
                }
              ]}>
                <IconFallback name="security" size={16} color={theme.success} style={{ marginRight: 8 }} />
                <Text style={[
                  styles.errorText,
                  { 
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: '600'
                  }
                ]}>
                  Secure payment
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Confirmation Section - User must confirm before proceeding */}
        <View style={[
          styles.summaryCard,
          { 
            backgroundColor: isConfirmed ? theme.success + '10' : theme.error + '15',
            borderColor: isConfirmed ? theme.success + '30' : theme.error,
            borderWidth: 3,
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            shadowColor: isConfirmed ? theme.success : theme.error,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }
        ]}>
          <View style={[
            styles.summaryHeader,
            { 
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16
            }
          ]}>
            <IconFallback 
              name={isConfirmed ? "check-circle" : "help-outline"} 
              size={20} 
              color={isConfirmed ? theme.success : theme.error} 
              style={{ marginRight: 8 }} 
            />
            <Text style={[
              styles.errorText,
              { 
                color: isConfirmed ? theme.success : theme.error,
                fontSize: 16,
                fontWeight: '700'
              }
            ]}>
              Does everything look correct?
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.inputContainer,
              { 
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor: isConfirmed ? theme.success + '20' : theme.error + '10',
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isConfirmed ? theme.success : theme.error,
                marginBottom: 0
              }
            ]}
            onPress={handleConfirmationToggle}
            activeOpacity={0.7}
          >
            <View style={[
              {
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isConfirmed ? theme.success : theme.error,
                backgroundColor: isConfirmed ? theme.success : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }
            ]}>
              {isConfirmed && (
                <IconFallback name="check" size={16} color={theme.onPrimary} />
              )}
            </View>
            <Text style={[
              styles.errorText,
              { 
                color: theme.text,
                fontSize: 15,
                fontWeight: '600',
                flex: 1
              }
            ]}>
              Yes, all the information above is accurate and I'm ready to submit my service request
            </Text>
          </TouchableOpacity>
          
          {!isConfirmed && (
            <Text style={[
              styles.errorText,
              { 
                color: theme.textSecondary,
                fontSize: 13,
                textAlign: 'center',
                marginTop: 12,
                fontStyle: 'italic'
              }
            ]}>
              Please confirm that all details are correct before proceeding
            </Text>
          )}
        </View>

        {/* Ready to Submit - Enable next button when user has confirmed */}
        {isConfirmed && (
          <View style={[
            styles.summaryCard,
            { 
              backgroundColor: theme.success + '15',
              borderColor: theme.success + '40',
              borderWidth: 2,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16
            }
          ]}>
            <View style={[
              styles.summaryHeader,
              { 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }
            ]}>
              <IconFallback name="check-circle" size={20} color={theme.success} style={{ marginRight: 8 }} />
              <Text style={[
                styles.errorText,
                { 
                  color: theme.success,
                  fontSize: 14,
                  fontWeight: '700'
                }
              ]}>
                Ready to submit! You can now proceed to the next step.
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ReviewStep;