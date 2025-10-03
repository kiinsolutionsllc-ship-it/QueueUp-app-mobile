import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { useStepManagement } from '../../hooks/useStepManagement';
import { useCreateJobOptimizations } from '../../hooks/useCreateJobOptimizations';
import { useModalManagement } from '../../hooks/useModalManagement';
import { usePaymentProcessing } from '../../hooks/usePaymentProcessing';
import { useImageManagement } from '../../hooks/useImageManagement';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { createJobStyles } from '../../styles/CreateJobScreenStyles';
import { JobFormData, NavigationProps } from '../../types/JobTypes';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
import LazyStepWrapper from '../../components/steps/LazyStepWrapper';
import PaymentModal from '../../components/modals/PaymentModal';
import SubcategoryModal from '../../components/modals/SubcategoryModal';
import ImageOptionsModal from '../../components/modals/ImageOptionsModal';
import { hapticService } from '../../services/HapticService';

interface CreateJobScreenProps extends NavigationProps {}

const CreateJobScreen: React.FC<CreateJobScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  
  // Use hooks at the top level - they must be called unconditionally
  const authContext = useAuth();
  const jobContext = useJob();
  
  // Extract values with null checks
  const user = authContext?.user || null;
  const createJob = jobContext?.createJob || null;
  const loading = authContext?.loading || false;
  
  const theme = getCurrentTheme();
  const styles = createJobStyles(theme as any);

  // Initialize form data
  const initialFormData: JobFormData = useMemo(() => ({
    vehicle: null,
    serviceType: null,
    category: null,
    subcategory: null,
    description: '',
    location: '',
    urgency: 'medium',
    budget: null,
    estimatedCost: null,
    images: [],
    preferredDate: null,
    preferredTime: null,
    specialInstructions: '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
  }), [user]);

  // State management
  const [formData, setFormData] = useState<JobFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewConfirmed, setIsReviewConfirmed] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cardDetailsComplete, setCardDetailsComplete] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // ScrollView ref for scroll to top functionality
  const scrollViewRef = useRef<ScrollView>(null);

  // Step management
  const totalSteps = 6;
  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    progressPercentage,
    resetSteps,
  } = useStepManagement({
    totalSteps,
    initialStep: 1,
    onStepChange: (step) => {
      hapticService.light();
      // Scroll to top when step changes
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    },
  });


  // Auto-save functionality
  const { saveFormData, loadFormData, clearSavedData, hasUnsavedChanges } = useAutoSave();

  // Network status
  const { canPerformNetworkOperations } = useNetworkStatus();

  // Form optimizations
  const {
    updateFormData: optimizedUpdateFormData,
    canProceedToNext: canProceedOptimized,
    estimatedCost,
  } = useCreateJobOptimizations({
    formData,
    theme,
    onFormDataChange: (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    onAutoSave: saveFormData,
  });

  // Modal management
  const {
    modalState,
    showModal,
    hideModal,
    setPaymentError,
    setPaymentProcessing,
  } = useModalManagement();

  // Payment processing
  const {
    processPayment,
    isProcessing: isPaymentProcessing,
    error: paymentError,
  } = usePaymentProcessing();

  // Image management
  const {
    images,
    addImageFromCamera,
    addImageFromGallery,
    removeImage,
    uploadImages,
    isUploading: isImageUploading,
    uploadProgress,
  } = useImageManagement({
    onUploadSuccess: (urls) => {
      optimizedUpdateFormData('images', urls);
    },
    onUploadError: (error) => {
      Alert.alert('Upload Error', error);
    },
  });

  // No need to load saved data since we reset on focus

  // Update form data when images change
  useEffect(() => {
    const imageUrls = images.map(img => img.uri);
    if (JSON.stringify(imageUrls) !== JSON.stringify(formData.images)) {
      optimizedUpdateFormData('images', imageUrls);
    }
  }, [images, formData.images, optimizedUpdateFormData]);

  // Update estimated cost in form data (only if not already set from subcategory)
  useEffect(() => {
    // Only update if no subcategory is selected or if the current estimated cost is 0
    if (estimatedCost !== formData.estimatedCost && (!formData.subcategory || formData.estimatedCost === 0)) {
      optimizedUpdateFormData('estimatedCost', estimatedCost);
    }
  }, [estimatedCost, formData.estimatedCost, formData.subcategory, optimizedUpdateFormData]);

  // Handle form data updates
  const handleFormDataChange = useCallback((field: keyof JobFormData, value: any) => {
    optimizedUpdateFormData(field, value);
  }, [optimizedUpdateFormData]);

  // Reset form data to initial state
  const resetFormData = useCallback(() => {
    setFormData(initialFormData);
    setIsReviewConfirmed(false); // Reset confirmation state
    setHasPaymentMethod(false); // Reset payment method state
    setTermsAccepted(false); // Reset terms acceptance state
    clearSavedData(); // Clear any auto-saved data
    resetSteps(); // Reset to step 1
  }, [initialFormData, clearSavedData, resetSteps]);

  // Reset form every time screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reset form data when screen comes into focus
      resetFormData();
    });

    return unsubscribe;
  }, [navigation, resetFormData]);

  // Reset form when user navigates back to home or away from create job
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Always allow navigation since form resets on focus
      return;
    });

    return unsubscribe;
  }, [navigation]);

  // Handle confirmation change for review step
  const handleConfirmationChange = useCallback((confirmed: boolean) => {
    setIsReviewConfirmed(confirmed);
  }, []);

  // Handle payment method change from PostingDepositStep
  const handlePaymentMethodChange = useCallback((hasPayment: boolean) => {
    try {
      setHasPaymentMethod(hasPayment);
    } catch (error) {
      console.error('Error setting payment method:', error);
    }
  }, []);

  // Handle terms acceptance from PostingDepositStep
  const handleTermsAccepted = useCallback((accepted: boolean) => {
    setTermsAccepted(accepted);
  }, []);

  // Handle card details completion from PostingDepositStep
  const handleCardDetailsComplete = useCallback((complete: boolean) => {
    setCardDetailsComplete(complete);
  }, []);

  // Handle payment method selection from PostingDepositStep
  const handlePaymentMethodSelect = useCallback((methodId: string | null) => {
    try {
      setSelectedPaymentMethod(methodId);
      setCardDetailsComplete(false); // Reset card details when method changes
    } catch (error) {
      console.error('Error setting payment method details:', error);
    }
  }, []);

  // Handle step navigation
  const handleNext = useCallback(() => {
    // For step 5 (ReviewStep), check if user has confirmed
    if (currentStep === 5 && !isReviewConfirmed) {
      hapticService.error();
      Alert.alert('Confirmation Required', 'Please confirm that all details are correct before proceeding.');
      return;
    }
    
    if (canProceedOptimized(currentStep)) {
      goToNextStep();
    } else {
      hapticService.error();
      Alert.alert('Incomplete Step', 'Please complete all required fields before proceeding.');
    }
  }, [canProceedOptimized, currentStep, goToNextStep, isReviewConfirmed]);

  const handleBack = useCallback(() => {
    // Reset confirmation state when going back from step 6 to step 5
    if (currentStep === 6) {
      setIsReviewConfirmed(false);
      setHasPaymentMethod(false); // Reset payment method state
      setTermsAccepted(false); // Reset terms acceptance state
    }
    goToPreviousStep();
  }, [goToPreviousStep, currentStep]);

  // Handle location selection
  const handleLocationSelect = useCallback(() => {
    // Location input is now built into VehicleServiceStep with Google Maps autocomplete
    // No need to navigate to a separate screen
    console.log('Location selection handled by built-in location input');
  }, []);

  // Handle vehicle selection
  const handleVehicleSelect = useCallback((vehicle: string) => {
    handleFormDataChange('vehicle', vehicle);
  }, [handleFormDataChange]);

  // Handle add vehicle
  const handleAddVehicle = useCallback(() => {
    // Navigate to CarInfo screen directly for adding vehicle
    navigation.navigate('CarInfo', { 
      mode: 'add'
    });
  }, [navigation]);

  // Handle service type selection
  const handleServiceTypeSelect = useCallback((serviceType: 'mobile' | 'shop') => {
    handleFormDataChange('serviceType', serviceType);
  }, [handleFormDataChange]);


  // Handle category selection
  const handleCategorySelect = useCallback((category: string) => {
    handleFormDataChange('category', category);
    handleFormDataChange('subcategory', null); // Reset subcategory
  }, [handleFormDataChange]);

  // Handle urgency selection
  const handleUrgencySelect = useCallback((urgency: 'low' | 'medium' | 'high') => {
    handleFormDataChange('urgency', urgency);
  }, [handleFormDataChange]);

  // Get subcategories for a given category
  const getSubcategoriesForCategory = useCallback((categoryId: string | null) => {
    if (!categoryId) return [];
    
    
    const serviceCategories = [
      {
        id: 'maintenance',
        subcategories: [
          { id: 'oil-change', name: 'Oil Change', price: 50, estimatedTime: '30 min', description: 'Engine oil and filter replacement' },
          { id: 'tire-rotation', name: 'Tire Rotation', price: 25, estimatedTime: '15 min', description: 'Rotate tires for even wear' },
          { id: 'brake-check', name: 'Brake Check', price: 75, estimatedTime: '45 min', description: 'Inspect and test brake system' },
          { id: 'battery-check', name: 'Battery Check', price: 30, estimatedTime: '20 min', description: 'Test battery and charging system' },
        ],
      },
      {
        id: 'repair',
        subcategories: [
          { id: 'engine-repair', name: 'Engine Repair', price: 200, estimatedTime: '2-4 hours', description: 'Engine diagnostics and repair' },
          { id: 'transmission', name: 'Transmission', price: 300, estimatedTime: '3-6 hours', description: 'Transmission service and repair' },
          { id: 'electrical', name: 'Electrical', price: 150, estimatedTime: '1-3 hours', description: 'Electrical system repair' },
          { id: 'ac-repair', name: 'A/C Repair', price: 120, estimatedTime: '1-2 hours', description: 'Air conditioning system repair' },
        ],
      },
      {
        id: 'diagnostic',
        subcategories: [
          { id: 'check-engine', name: 'Check Engine Light', price: 80, estimatedTime: '30 min', description: 'Diagnose check engine light' },
          { id: 'full-diagnostic', name: 'Full Diagnostic', price: 120, estimatedTime: '1 hour', description: 'Comprehensive vehicle inspection' },
          { id: 'emissions', name: 'Emissions Test', price: 60, estimatedTime: '20 min', description: 'Emissions system testing' },
          { id: 'computer-scan', name: 'Computer Scan', price: 90, estimatedTime: '45 min', description: 'Advanced computer diagnostics' },
        ],
      },
      {
        id: 'emergency',
        subcategories: [
          { id: 'jump-start', name: 'Jump Start', price: 40, estimatedTime: '15 min', description: 'Jump start dead battery' },
          { id: 'tire-change', name: 'Tire Change', price: 60, estimatedTime: '30 min', description: 'Change flat tire' },
          { id: 'lockout', name: 'Lockout Service', price: 50, estimatedTime: '20 min', description: 'Unlock vehicle' },
          { id: 'towing', name: 'Towing', price: 100, estimatedTime: '30-60 min', description: 'Tow vehicle to shop' },
        ],
      },
    ];

    const category = serviceCategories.find(cat => cat.id === categoryId);
    const subcategories = category ? category.subcategories : [];
    return subcategories;
  }, []);

  // Handle payment success
  const handlePaymentSuccess = useCallback(async () => {
    setPaymentProcessing(false);
    hideModal('isPaymentModalVisible');
    
    try {
      setIsSubmitting(true);
      
      // Generate job title from form data
      const generateJobTitle = () => {
        const categoryMap: Record<string, string> = {
          'maintenance': 'Maintenance',
          'repair': 'Repair',
          'diagnostic': 'Diagnostic',
          'emergency': 'Emergency',
        };
        
        const subcategoryMap: Record<string, string> = {
          'oil-change': 'Oil Change',
          'tire-rotation': 'Tire Rotation',
          'brake-check': 'Brake Check',
          'battery-check': 'Battery Check',
          'engine-repair': 'Engine Repair',
          'transmission': 'Transmission',
          'electrical': 'Electrical',
          'ac-repair': 'A/C Repair',
          'check-engine': 'Check Engine Light',
          'full-diagnostic': 'Full Diagnostic',
          'emissions': 'Emissions Test',
          'computer-scan': 'Computer Scan',
          'jump-start': 'Jump Start',
          'tire-change': 'Tire Change',
          'lockout': 'Lockout Service',
          'towing': 'Towing',
        };
        
        const category = categoryMap[formData.category || ''] || formData.category || 'Service';
        const subcategory = subcategoryMap[formData.subcategory || ''] || formData.subcategory || 'Request';
        
        return `${category} - ${subcategory}`;
      };
      
      // Create the job
      
      // Use the same fallback logic as CustomerJobsScreen for consistency
      const customerId = user?.id || getFallbackUserIdWithTypeDetection(user?.id, user?.user_type);
      console.log('CreateJobScreen - Creating job with customerId:', customerId);
      console.log('CreateJobScreen - Current user:', { id: user?.id, user_type: user?.user_type });
      
      const jobResult = await createJob({
        ...formData,
        title: generateJobTitle(),
        customerId: customerId,
        customerName: user?.name || 'Customer',
        userType: user?.user_type || 'customer', // Add user type to prevent mechanic restriction
        status: 'posted',
        createdAt: new Date().toISOString(),
      } as any);
      

      if (jobResult.success) {
        // Clear saved form data and reset form
        await clearSavedData();
        resetFormData();
        
        // Show success message
        Alert.alert(
          'Job Created Successfully!',
          'Your job has been posted and mechanics will be able to bid on it.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        throw new Error(jobResult.error || 'Failed to create job');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, createJob, clearSavedData, navigation, setPaymentProcessing, hideModal, resetFormData]);

  // Handle payment error
  const handlePaymentError = useCallback((error: string) => {
    setPaymentError(error);
    setPaymentProcessing(false);
    Alert.alert('Payment Error', error);
  }, [setPaymentError, setPaymentProcessing]);

  // Handle payment processing
  const handlePayment = useCallback(async () => {
    if (!canPerformNetworkOperations) {
      Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
      return;
    }

    // Validate payment method is selected
    if (!selectedPaymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method before proceeding.');
      return;
    }

    setPaymentProcessing(true);
    showModal('isPaymentModalVisible');

    try {
      const paymentData = {
        amount: 10, // $10 booking fee
        currency: 'USD',
        paymentMethodId: selectedPaymentMethod, // Use the selected payment method
        customerId: user?.id || '',
        metadata: {
          jobType: 'booking_fee',
          customerId: user?.id,
        },
      };


      const result = await processPayment(paymentData);
      
      if (result.success) {
        await handlePaymentSuccess();
      } else {
        handlePaymentError(result.error || 'Payment failed');
      }
    } catch (error) {
      handlePaymentError(error instanceof Error ? error.message : 'Payment failed');
    }
  }, [canPerformNetworkOperations, user, selectedPaymentMethod, processPayment, handlePaymentSuccess, handlePaymentError, setPaymentProcessing, showModal]);

  // Handle exit confirmation
  const handleExit = useCallback(() => {
    resetFormData(); // Reset form and navigate back
    navigation.goBack();
  }, [navigation, resetFormData]);


  // Handle scroll to bottom for step 5 (Review)
  const handleScrollToBottom = useCallback(() => {
    // This will be handled by the ReviewStep component
  }, []);

  // Get step title
  const getStepTitle = useCallback((step: number) => {
    const titles = {
      1: 'Vehicle & Service Type',
      2: 'Service Category',
      3: 'Job Details',
      4: 'Photos (Optional)',
      5: 'Review & Confirm',
      6: 'Payment & Post',
    };
    return titles[step as keyof typeof titles] || '';
  }, []);

  // Show loading screen if AuthProvider is still loading
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#0891B2" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Render step progress
  const renderStepProgress = () => (
    <View style={styles.stepProgressContainer}>
      <View style={styles.stepProgressBar}>
        <View 
          style={[
            styles.stepProgressFill, 
            { width: `${progressPercentage}%` }
          ]} 
        />
      </View>
      <Text style={styles.stepText}>
        Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
      </Text>
    </View>
  );

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleExit}
        style={styles.closeButton}
        accessibilityLabel="Close"
        accessibilityHint="Close job creation and return to previous screen"
      >
        <MaterialIcons name="close" size={24} color={theme.textSecondary} />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Create New Job</Text>
      
      <View style={styles.headerSpacer} />
    </View>
  );

  // Render navigation buttons
  const renderNavigationButtons = () => {
    // Determine if we can proceed based on current step
    let canProceed = false;
    
    if (currentStep === 5) {
      // Review step - requires confirmation
      canProceed = isReviewConfirmed;
    } else if (currentStep === 6) {
      // Payment step - requires payment method selection AND terms acceptance
      // For card payments, also require card details to be complete (lenient in mock mode)
      const isCardPayment = selectedPaymentMethod === 'card';
      // In mock mode, be more lenient with card validation for testing
      const cardDetailsValid = !isCardPayment || cardDetailsComplete || true; // Always true in mock mode
      canProceed = hasPaymentMethod && termsAccepted && cardDetailsValid;
      
    } else {
      // All other steps - use optimized validation
      canProceed = canProceedOptimized(currentStep);
    }
    
    return (
      <View style={styles.navigationContainer}>
        {currentStep > 1 && (
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.navButton, styles.backButton]}
            accessibilityLabel="Go back to previous step"
          >
            <MaterialIcons name="arrow-back" size={20} color={theme.text} />
            <Text style={[styles.navButtonText, { color: theme.text }]}>Back</Text>
          </TouchableOpacity>
        )}

        <View style={styles.navSpacer} />

        {currentStep < totalSteps ? (
          <TouchableOpacity
            onPress={handleNext}
            style={[
              styles.navButton,
              styles.nextButton,
              { 
                backgroundColor: canProceed ? theme.primary : theme.border,
                opacity: canProceed ? 1 : 0.5,
              }
            ]}
            disabled={!canProceed}
            accessibilityLabel="Go to next step"
          >
            <Text style={[styles.navButtonText, { color: theme.onPrimary }]}>Next</Text>
            <MaterialIcons name="arrow-forward" size={20} color={theme.onPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handlePayment}
            style={[
              styles.navButton,
              styles.nextButton,
              { 
                backgroundColor: canProceed ? theme.primary : theme.border,
                opacity: canProceed ? 1 : 0.5,
              }
            ]}
            disabled={!canProceed || isSubmitting}
            accessibilityLabel="Create job and proceed to payment"
          >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.onPrimary} />
          ) : (
            <>
              <Text style={[styles.navButtonText, { color: theme.onPrimary }]}>Create Job</Text>
              <MaterialIcons name="check" size={20} color={theme.onPrimary} />
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      
      {renderHeader()}
      {renderStepProgress()}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LazyStepWrapper
          stepNumber={currentStep}
          formData={formData}
          updateFormData={handleFormDataChange}
          theme={theme as any}
          onNext={handleNext}
          onBack={handleBack}
          canProceed={currentStep === 5 ? isReviewConfirmed : canProceedOptimized(currentStep)}
          isLoading={isSubmitting}
          onLocationSelect={handleLocationSelect}
          onServiceTypeSelect={handleServiceTypeSelect}
          onPaymentMethodChange={handlePaymentMethodChange}
          onTermsAccepted={handleTermsAccepted}
          onCardDetailsComplete={handleCardDetailsComplete}
          onPaymentMethodSelect={handlePaymentMethodSelect}
          onVehicleSelect={handleVehicleSelect}
          onAddVehicle={handleAddVehicle}
          onCategorySelect={handleCategorySelect}
          onUrgencySelect={handleUrgencySelect}
          onShowSubcategoryModal={() => showModal('isSubcategoryModalVisible')}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          onShowPaymentModal={() => showModal('isPaymentModalVisible')}
          onScrollToBottom={handleScrollToBottom}
          onConfirmationChange={handleConfirmationChange}
          isPaymentProcessing={isPaymentProcessing}
          paymentError={paymentError}
          images={images}
          addImageFromCamera={addImageFromCamera}
          addImageFromGallery={addImageFromGallery}
          removeImage={removeImage}
          uploadImages={uploadImages}
          isUploading={isImageUploading}
          uploadProgress={uploadProgress}
        />
      </ScrollView>

      {renderNavigationButtons()}


      {/* Payment Modal */}
      <PaymentModal
        visible={modalState.isPaymentModalVisible}
        onClose={() => hideModal('isPaymentModalVisible')}
        theme={theme as any}
        amount={10}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        isProcessing={isPaymentProcessing}
      />

      {/* Subcategory Modal */}
      <SubcategoryModal
        visible={modalState.isSubcategoryModalVisible}
        onClose={() => hideModal('isSubcategoryModalVisible')}
        theme={theme as any}
        category={formData.category || ''}
        subcategories={getSubcategoriesForCategory(formData.category)}
        selectedSubcategory={formData.subcategory || undefined}
        onSubcategorySelect={(subcategory) => {
          handleFormDataChange('subcategory', subcategory.id || '');
          handleFormDataChange('estimatedCost', subcategory.price);
          hideModal('isSubcategoryModalVisible');
        }}
      />

      {/* Image Options Modal */}
      <ImageOptionsModal
        visible={modalState.isImageOptionsModalVisible}
        onClose={() => hideModal('isImageOptionsModalVisible')}
        theme={theme as any}
        onCameraPress={addImageFromCamera}
        onGalleryPress={addImageFromGallery}
      />
    </SafeAreaView>
  );
};

export default CreateJobScreen;
