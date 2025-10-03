import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Image,
  Alert,
  Animated 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { StepComponentProps, ImageData } from '../../types/JobTypes';
import { useTheme } from '../../contexts/ThemeContext';
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
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  photoCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  photoCardSelected: {
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  addPhotoCard: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderWidth: 2,
  },
  addPhotoCardSelected: {
    backgroundColor: '#EAB308' + '15',
    borderColor: '#EAB308',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Hero section styles - Compact
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
  // Required field validation styles
  requiredFieldIndicator: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  photoCardRequired: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
});

interface PhotosStepProps extends StepComponentProps {
  images: ImageData[];
  addImageFromCamera?: () => void;
  addImageFromGallery?: () => void;
  removeImage?: (index: number) => void;
  uploadImages?: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

const PhotosStep: React.FC<PhotosStepProps> = ({
  formData,
  updateFormData,
  theme,
  onNext,
  onBack,
  canProceed,
  isLoading = false,
  images,
  addImageFromCamera,
  addImageFromGallery,
  removeImage,
  uploadImages,
  isUploading = false,
  uploadProgress = 0,
}) => {
  const baseStyles = createJobStyles(theme);
  const styles = { ...baseStyles, ...additionalStyles };
  const scrollViewRef = useRef<ScrollView>(null);

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

  // Check if photos are required (optional for now, but can be made required)
  const isPhotosRequired = false; // Can be changed to true if photos become required

  // Handle image addition from camera
  const handleAddFromCamera = useCallback(() => {
    if (addImageFromCamera) {
      addImageFromCamera();
    }
  }, [addImageFromCamera]);

  // Handle image addition from gallery
  const handleAddFromGallery = useCallback(() => {
    if (addImageFromGallery) {
      addImageFromGallery();
    }
  }, [addImageFromGallery]);

  // Handle image removal
  const handleRemoveImage = useCallback((index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            if (removeImage) {
              removeImage(index);
            }
          }
        },
      ]
    );
  }, [removeImage]);

  // Get image count
  const imageCount = useMemo(() => images?.length || 0, [images]);

  // Check if can add more images
  const canAddMore = useMemo(() => imageCount < 5, [imageCount]);

  // Get total size in MB
  const totalSizeInMB = useMemo(() => {
    const totalBytes = images.reduce((total, img) => total + img.size, 0);
    return ((totalBytes || 0) / (1024 * 1024)).toFixed(2);
  }, [images]);

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
              name="camera" 
              size={20} 
              color={theme.onPrimary} 
            />
          </Animated.View>
          
          {/* Hero Title */}
          <Text style={[
            styles.heroTitle,
            { color: theme.text }
          ]}>
            {imageCount > 0 ? `${imageCount} Photo${imageCount > 1 ? 's' : ''} Added` : 'Add Photos'}
          </Text>
          
          {/* Hero Subtitle */}
          <Text style={[
            styles.heroSubtitle,
            { color: theme.textSecondary }
          ]}>
            {imageCount > 0 ? 
              `Help mechanics understand your issue better` :
              'Photos help mechanics understand your issue better'
            }
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

  // Render photo card
  const renderPhotoCard = (image: ImageData, index: number) => {
    return (
      <View key={index} style={styles.photoCard}>
        <Image source={{ uri: image.uri }} style={styles.photoImage} />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveImage(index)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Remove photo"
          accessibilityHint="Removes this photo from the selection"
        >
          <Ionicons name="close" size={14} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render add photo card
  const renderAddPhotoCard = () => {
    return (
      <TouchableOpacity
        style={[
          styles.photoCard,
          styles.addPhotoCard,
          { 
            backgroundColor: theme.surfaceVariant,
            borderColor: theme.border
          }
        ]}
        onPress={() => {
          // Show both options - for now default to camera, but could show modal
          handleAddFromCamera();
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Add photo"
        accessibilityHint="Opens options to add a photo from camera or gallery"
      >
        <Ionicons 
          name="add" 
          size={28} 
          color={theme.textSecondary} 
        />
        <Text style={[
          styles.heroSubtitle,
          { 
            color: theme.textSecondary, 
            marginTop: 8,
            fontSize: 12,
            fontWeight: '600'
          }
        ]}>
          Add Photo
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.scrollView} 
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stepContainer}>
        
        {/* Hero Section */}
        {renderHeroSection()}

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18, marginBottom: 16 }]}>
            Add Photos
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { 
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 16,
                  opacity: canAddMore ? 1 : 0.6
                }
              ]}
              onPress={handleAddFromCamera}
              activeOpacity={0.8}
              disabled={!canAddMore}
            >
              <Ionicons name="camera" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={[styles.buttonText, { fontSize: 16 }]}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { 
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 16,
                  opacity: canAddMore ? 1 : 0.6
                }
              ]}
              onPress={handleAddFromGallery}
              activeOpacity={0.8}
              disabled={!canAddMore}
            >
              <Ionicons name="images" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={[styles.buttonText, { fontSize: 16 }]}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Gallery */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Your Photos
          </Text>
          
          <View style={styles.photoGrid}>
            {images.map((image, index) => renderPhotoCard(image, index))}
            {canAddMore && renderAddPhotoCard()}
          </View>
          
          {imageCount === 0 && (
            <View style={styles.sectionContainer}>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary, textAlign: 'center' }]}>
                No photos added yet. Photos help mechanics understand your service needs better.
              </Text>
            </View>
          )}
        </View>

        {/* Upload Progress */}
        {isUploading && (
          <View style={[
            styles.summaryCard,
            { 
              backgroundColor: theme.primary + '10',
              borderColor: theme.primary + '30',
              borderWidth: 1,
              borderRadius: 16,
              padding: 20,
              marginTop: 20
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
                <IconFallback name="cloud-upload" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.summaryTitle,
                  { 
                    color: theme.primary,
                    fontSize: 16,
                    fontWeight: '700'
                  }
                ]}>
                  Uploading photos...
                </Text>
                <Text style={[
                  styles.errorText,
                  { 
                    color: theme.textSecondary,
                    fontSize: 12,
                    marginTop: 4
                  }
                ]}>
                  Please don't close this screen
                </Text>
              </View>
              <Text style={[
                styles.errorText,
                { 
                  color: theme.primary,
                  fontSize: 14,
                  fontWeight: '600'
                }
              ]}>
                {Math.round(uploadProgress)}%
              </Text>
            </View>
            
            <View style={{ marginTop: 12 }}>
              <View style={{
                height: 4,
                backgroundColor: theme.border,
                borderRadius: 2,
                overflow: 'hidden'
              }}>
                <View 
                  style={{
                    height: '100%',
                    backgroundColor: theme.primary,
                    width: `${uploadProgress}%`,
                    borderRadius: 2
                  }} 
                />
              </View>
            </View>
          </View>
        )}

        {/* Photo Tips */}
        <View style={[
          styles.summaryCard,
          { 
            backgroundColor: theme.warning + '10',
            borderColor: theme.warning + '30',
            borderWidth: 1,
            borderRadius: 16,
            padding: 20,
            marginTop: 20
          }
        ]}>
          <View style={styles.summaryHeader}>
            <View style={[
              styles.iconContainer,
              { 
                backgroundColor: theme.warning + '20',
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }
            ]}>
              <IconFallback name="tips-and-updates" size={20} color={theme.warning} />
            </View>
            <Text style={[
              styles.summaryTitle,
              { 
                color: theme.warning,
                fontSize: 16,
                fontWeight: '700',
                flex: 1
              }
            ]}>
              Photo Guidelines (Max 5 photos, 5MB each)
            </Text>
          </View>
          
          <View style={{ marginTop: 16, gap: 12 }}>
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
              <IconFallback name="visibility" size={16} color={theme.warning} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: '600',
                    marginBottom: 2
                  }
                ]}>
                  Clear & Bright
                </Text>
                <Text style={[
                  styles.errorText,
                  { 
                    color: theme.textSecondary,
                    fontSize: 12
                  }
                ]}>
                  Take well-lit photos with good visibility
                </Text>
              </View>
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
              <IconFallback name="360" size={16} color={theme.warning} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: '600',
                    marginBottom: 2
                  }
                ]}>
                  Multiple Angles
                </Text>
                <Text style={[
                  styles.errorText,
                  { 
                    color: theme.textSecondary,
                    fontSize: 12
                  }
                ]}>
                  Show different perspectives of the issue
                </Text>
              </View>
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
              <IconFallback name="zoom-in" size={16} color={theme.warning} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: '600',
                    marginBottom: 2
                  }
                ]}>
                  Close-ups
                </Text>
                <Text style={[
                  styles.errorText,
                  { 
                    color: theme.textSecondary,
                    fontSize: 12
                  }
                ]}>
                  Include detailed shots of problem areas
                </Text>
              </View>
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
              <IconFallback name="warning" size={16} color={theme.warning} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.inputLabel,
                  { 
                    color: theme.text,
                    fontSize: 13,
                    fontWeight: '600',
                    marginBottom: 2
                  }
                ]}>
                  Error Messages
                </Text>
                <Text style={[
                  styles.errorText,
                  { 
                    color: theme.textSecondary,
                    fontSize: 12
                  }
                ]}>
                  Capture any warning lights or displays
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        {imageCount > 0 && !isUploading && (
          <View style={[
            styles.summaryCard,
            { 
              backgroundColor: theme.success + '10',
              borderColor: theme.success + '30',
              borderWidth: 1,
              borderRadius: 16,
              padding: 20,
              marginTop: 20
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
                Photos Ready!
              </Text>
            </View>
            
            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[
                    styles.inputLabel,
                    { 
                      color: theme.text,
                      fontSize: 18,
                      fontWeight: '700'
                    }
                  ]}>
                    {imageCount}
                  </Text>
                  <Text style={[
                    styles.errorText,
                    { 
                      color: theme.textSecondary,
                      fontSize: 12
                    }
                  ]}>
                    Photos
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[
                    styles.inputLabel,
                    { 
                      color: theme.text,
                      fontSize: 18,
                      fontWeight: '700'
                    }
                  ]}>
                    {totalSizeInMB}
                  </Text>
                  <Text style={[
                    styles.errorText,
                    { 
                      color: theme.textSecondary,
                      fontSize: 12
                    }
                  ]}>
                    MB
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[
                    styles.inputLabel,
                    { 
                      color: theme.text,
                      fontSize: 18,
                      fontWeight: '700'
                    }
                  ]}>
                    {5 - imageCount}
                  </Text>
                  <Text style={[
                    styles.errorText,
                    { 
                      color: theme.textSecondary,
                      fontSize: 12
                    }
                  ]}>
                    Slots Left
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Optional Notice */}
        {imageCount === 0 && (
          <View style={[
            styles.summaryCard,
            { 
              backgroundColor: theme.textSecondary + '10',
              borderColor: theme.textSecondary + '30',
              borderWidth: 1,
              borderRadius: 16,
              padding: 20,
              marginTop: 20
            }
          ]}>
            <View style={styles.summaryHeader}>
              <View style={[
                styles.iconContainer,
                { 
                  backgroundColor: theme.textSecondary + '20',
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }
              ]}>
                <IconFallback name="info" size={20} color={theme.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.summaryTitle,
                  { 
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: '700',
                    marginBottom: 4
                  }
                ]}>
                  Photos are Optional
                </Text>
                <Text style={[
                  styles.errorText,
                  { 
                    color: theme.textSecondary,
                    fontSize: 13,
                    lineHeight: 18
                  }
                ]}>
                  You can skip this step and add photos later if needed. Photos help mechanics provide more accurate service estimates.
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PhotosStep;