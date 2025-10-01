import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StepComponentProps } from '../../types/JobTypes';
import { useTheme } from '../../contexts/ThemeContext';
import { createJobStyles } from '../../styles/CreateJobScreenStyles';
import IconFallback from '../shared/IconFallback';

interface DetailsStepProps extends StepComponentProps {
  onUrgencySelect: (urgency: 'low' | 'medium' | 'high') => void;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  formData,
  updateFormData,
  theme,
  onNext,
  onBack,
  canProceed,
  isLoading = false,
  onUrgencySelect,
}) => {
  const baseStyles = createJobStyles(theme);
  const styles = { ...baseStyles, ...additionalStyles };
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animation values for hero section
  const heroScale = useRef(new Animated.Value(1)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroIconPulse = useRef(new Animated.Value(1)).current;

  // Hero animation on mount
  useEffect(() => {
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

  // Keyboard handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to description input when keyboard appears
        if (focusedField === 'description') {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({
              y: 400, // Scroll to description section
              animated: true,
            });
          }, 100);
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        // Allow scrolling back to top when keyboard is dismissed
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: 0,
            animated: true,
          });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [focusedField]);

  // Urgency options
  const urgencyOptions = useMemo(() => [
    {
      id: 'low',
      title: 'Low',
      description: 'Can wait a few days',
      icon: 'calendar-outline',
      color: '#10B981',
      backgroundColor: '#ECFDF5',
    },
    {
      id: 'medium',
      title: 'Medium',
      description: 'Within 24 hours',
      icon: 'time-outline',
      color: '#F59E0B',
      backgroundColor: '#FFFBEB',
    },
    {
      id: 'high',
      title: 'High',
      description: 'ASAP - Emergency',
      icon: 'warning',
      color: '#EF4444',
      backgroundColor: '#FEF2F2',
    },
  ], []);

  // Handle text input changes
  const handleTextChange = useCallback((field: keyof typeof formData, value: string) => {
    updateFormData(field, value);
  }, [updateFormData]);

  // Handle urgency selection
  const handleUrgencySelect = useCallback((urgency: 'low' | 'medium' | 'high') => {
    updateFormData('urgency', urgency);
    onUrgencySelect(urgency);
  }, [updateFormData, onUrgencySelect]);


  // Get character count for description
  const getDescriptionCharCount = useCallback(() => {
    return formData.description?.length || 0;
  }, [formData.description]);

  // Check if description is valid
  const isDescriptionValid = useCallback(() => {
    const length = getDescriptionCharCount();
    return length >= 10 && length <= 500;
  }, [getDescriptionCharCount]);

  // Get description validation message
  const getDescriptionValidationMessage = useCallback(() => {
    const length = getDescriptionCharCount();
    if (length < 10) {
      return `Please provide more details (${10 - length} more characters needed)`;
    }
    if (length > 500) {
      return `Description is too long (${length - 500} characters over limit)`;
    }
    return null;
  }, [getDescriptionCharCount]);

  // Get field validation state
  const getFieldValidationState = useCallback((field: keyof typeof formData) => {
    switch (field) {
      case 'description':
        return {
          isValid: isDescriptionValid(),
          message: getDescriptionValidationMessage(),
        };
      default:
        return { isValid: true, message: null };
    }
  }, [isDescriptionValid, getDescriptionValidationMessage]);

  // Render urgency card
  const renderUrgencyCard = (urgency: any) => {
    const isSelected = formData.urgency === urgency.id;
    const isRequired = !formData.urgency;
    
    return (
      <TouchableOpacity
        key={urgency.id}
        style={[
          styles.urgencyCard,
          { backgroundColor: urgency.backgroundColor },
          isSelected && styles.urgencyCardSelected,
          isSelected && { 
            backgroundColor: urgency.backgroundColor,
            borderColor: urgency.color,
            shadowColor: urgency.color,
          },
          isRequired && !isSelected && styles.urgencyCardRequired
        ]}
        onPress={() => handleUrgencySelect(urgency.id)}
        activeOpacity={0.8}
      >
        <View style={styles.selectionIndicator}>
          <View style={[
            styles.selectionIndicatorUnselected,
            isSelected && { backgroundColor: urgency.color }
          ]}>
            {isSelected && (
              <Ionicons 
                name="checkmark" 
                size={10} 
                color="white" 
              />
            )}
          </View>
        </View>
        
        <View style={styles.urgencyIcon}>
          <Ionicons 
            name={urgency.icon as keyof typeof Ionicons.glyphMap} 
            size={20} 
            color={urgency.color} 
          />
        </View>
        
        <Text style={[
          styles.urgencyTitle,
          { color: urgency.color }
        ]}>
          {urgency.title}
        </Text>
        
        <Text style={[
          styles.urgencyDescription,
          { color: theme.textSecondary }
        ]}>
          {urgency.description}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render hero section
  const renderHeroSection = () => {
    const selectedUrgency = urgencyOptions.find(option => option.id === formData.urgency);
    
    return (
      <Animated.View 
        style={[
          styles.heroSection,
          { 
            backgroundColor: selectedUrgency ? selectedUrgency.backgroundColor : theme.primary + '15',
            borderWidth: 2,
            borderColor: selectedUrgency ? selectedUrgency.color + '30' : theme.primary + '30',
            opacity: heroOpacity,
            transform: [{ scale: heroScale }]
          }
        ]}
      >
        {/* Background Pattern */}
        <View style={[
          styles.heroBackground,
          { backgroundColor: selectedUrgency ? selectedUrgency.color : theme.primary }
        ]} />
        
        <View style={styles.heroContent}>
          {/* Hero Icon */}
          <Animated.View style={[
            styles.heroIcon,
            { 
              backgroundColor: selectedUrgency ? selectedUrgency.color : theme.primary,
              transform: [{ scale: heroIconPulse }]
            }
          ]}>
            <Ionicons 
              name={selectedUrgency ? selectedUrgency.icon as keyof typeof Ionicons.glyphMap : 'information-circle'} 
              size={20} 
              color="white" 
            />
          </Animated.View>
          
          {/* Hero Title */}
          <Text style={[
            styles.heroTitle,
            { color: selectedUrgency ? selectedUrgency.color : theme.text }
          ]}>
            {selectedUrgency ? `${selectedUrgency.title} Priority` : 'Job Details'}
          </Text>
          
          {/* Hero Subtitle */}
          <Text style={[
            styles.heroSubtitle,
            { color: theme.textSecondary }
          ]}>
            {selectedUrgency ? 
              selectedUrgency.description :
              'Provide additional details for your service request'
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

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 50 }
        ]} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
      <View style={styles.stepContainer}>
        
        {/* Hero Section */}
        {renderHeroSection()}
        
        {/* Urgency Section */}
        <View style={styles.sectionContainer}>
          {!formData.urgency && (
            <Text style={styles.requiredFieldIndicator}>
              * Required
            </Text>
          )}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            How urgent is this?
          </Text>
          
          <View style={styles.urgencyGrid}>
            {urgencyOptions.map(renderUrgencyCard)}
          </View>
        </View>

        {/* Description Section - New Design */}
        <View style={styles.sectionContainer}>
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <View style={styles.inputTitleContainer}>
                <IconFallback name="edit" size={20} color={theme.primary} style={styles.inputTitleIcon} />
                <Text style={[styles.inputTitle, { color: theme.text }]}>What's the issue?</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={styles.charCounter}>
                <Text style={[styles.charCounterText, { color: theme.textSecondary }]}>
                  {getDescriptionCharCount()}/500
                </Text>
              </View>
            </View>
            
            <View style={[
              styles.modernInputContainer,
              { 
                borderColor: focusedField === 'description' ? theme.primary : theme.border,
                backgroundColor: focusedField === 'description' ? theme.primary + '05' : theme.surface,
                shadowColor: focusedField === 'description' ? theme.primary : '#000',
              }
            ]}>
              <TextInput
                style={[
                  styles.modernTextArea,
                  { color: theme.text }
                ]}
                value={formData.description}
                onChangeText={(value) => handleTextChange('description', value)}
                placeholder="Describe the issue or service needed in detail..."
                placeholderTextColor={theme.textSecondary + '80'}
                multiline
                numberOfLines={5}
                maxLength={500}
                onFocus={() => {
                  setFocusedField('description');
                  // Ensure input is visible when focused
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({
                      y: 350,
                      animated: true,
                    });
                  }, 300);
                }}
                onBlur={() => setFocusedField(null)}
                returnKeyType="default"
                blurOnSubmit={false}
              />
            </View>
            
            {getFieldValidationState('description').message && (
              <View style={styles.errorContainer}>
                <IconFallback name="error" size={16} color={theme.error} style={styles.errorIcon} />
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {getFieldValidationState('description').message}
                </Text>
              </View>
            )}
          </View>
        </View>


      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Modern, clean styles with new input designs
const additionalStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
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
  urgencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  urgencyCard: {
    width: '31%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
    minHeight: 80,
  },
  urgencyCardSelected: {
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  urgencyIcon: {
    marginBottom: 6,
  },
  urgencyTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  urgencyDescription: {
    fontSize: 9,
    textAlign: 'center',
    opacity: 0.8,
    fontWeight: '500',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicatorUnselected: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  requiredFieldIndicator: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  urgencyCardRequired: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
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
  // New modern input styles
  inputSection: {
    marginBottom: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputTitleIcon: {
    marginRight: 8,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  requiredStar: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 4,
  },
  charCounter: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  charCounterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputSubtitle: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  modernInputContainer: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernTextArea: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    textAlignVertical: 'top',
    minHeight: 120,
    lineHeight: 22,
  },
  modernTextInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  locationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
});

export default DetailsStep;
