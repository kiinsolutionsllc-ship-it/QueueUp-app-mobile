import React, { Suspense, lazy, ComponentType } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { StepComponentProps } from '../../types/JobTypes';
import { useTheme } from '../../contexts/ThemeContext';

// Direct imports for debugging
import VehicleServiceStep from './VehicleServiceStep';
import ServiceTypeStep from './ServiceTypeStep';
import DetailsStep from './DetailsStep';
import PhotosStep from './PhotosStep';
import ReviewStep from './ReviewStep';
import PostingDepositStep from './PostingDepositStep';

// Step component mapping
const stepComponents: Record<number, ComponentType<StepComponentProps>> = {
  1: VehicleServiceStep,
  2: ServiceTypeStep,
  3: DetailsStep,
  4: PhotosStep,
  5: ReviewStep,
  6: PostingDepositStep,
};

interface LazyStepWrapperProps extends StepComponentProps {
  stepNumber: number;
  fallback?: React.ReactNode;
  onLocationSelect?: () => void;
  onServiceTypeSelect?: (serviceType: 'mobile' | 'shop') => void;
  onVehicleSelect?: (vehicle: string) => void;
  onAddVehicle?: () => void;
  onCategorySelect?: (category: string) => void;
  onUrgencySelect?: (urgency: 'low' | 'medium' | 'high') => void;
  onShowSubcategoryModal?: () => void;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
  onShowPaymentModal?: () => void;
  onScrollToBottom?: (event: any) => void;
  onConfirmationChange?: (confirmed: boolean) => void;
  onPaymentMethodChange?: (hasPaymentMethod: boolean) => void;
  onTermsAccepted?: (termsAccepted: boolean) => void;
  onCardDetailsComplete?: (complete: boolean) => void;
  onPaymentMethodSelect?: (methodId: string | null) => void;
  isPaymentProcessing?: boolean;
  paymentError?: string | null;
  images?: any[];
  addImageFromCamera?: () => void;
  addImageFromGallery?: () => void;
  removeImage?: (index: number) => void;
  uploadImages?: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

const LazyStepWrapper: React.FC<LazyStepWrapperProps> = ({
  stepNumber,
  fallback,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme() || {
    primary: '#0891B2',
    text: '#000000',
    textSecondary: '#666666',
    error: '#EF4444',
  };

  const StepComponent = stepComponents[stepNumber];

  if (!StepComponent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          Step {stepNumber} not found
        </Text>
      </View>
    );
  }

  const defaultFallback = (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
        Loading step {stepNumber}...
      </Text>
    </View>
  );

  return <StepComponent {...props} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LazyStepWrapper;
