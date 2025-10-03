import React from 'react';
import { Theme as ThemeType } from './ThemeTypes';

// Core job creation types
export interface JobFormData {
  vehicle: string | null;
  serviceType: 'mobile' | 'shop' | null;
  category: string | null;
  subcategory: string | null;
  description: string;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  budget: number | null;
  estimatedCost: number | null;
  images: string[];
  preferredDate: string | null;
  preferredTime: string | null;
  specialInstructions: string;
  contactPhone: string;
  contactEmail: string;
}

export interface Bid {
  id: string;
  jobId: string;
  mechanicId: string;
  price: number;
  message: string;
  estimatedDuration?: number;
  mechanicName?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  bidType?: 'hourly' | 'fixed';
}

// Step management types
export interface StepState {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  hasScrolledToBottom: boolean;
  progressPercentage: number;
}

export interface StepNavigation {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (stepNumber: number) => void;
  canProceedToNext: boolean;
  isStepCompleted: (stepNumber: number) => boolean;
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  field: keyof JobFormData;
  validator: (value: any, formData: JobFormData) => boolean;
  message: string;
}

// Modal management types
export interface ModalState {
  isSubcategoryModalVisible: boolean;
  isPaymentModalVisible: boolean;
  isImageOptionsModalVisible: boolean;
  isPaymentProcessing: boolean;
  paymentError: string | null;
}

// Payment types
export interface PaymentData {
  amount: number;
  currency: string;
  paymentMethodId: string | null;
  customerId: string | null;
  metadata: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  paymentMethod?: string;
  errorCode?: string;
  paymentIntentId?: string;
  customerId?: string;
  requiresAction?: boolean;
  amount?: number;
  currency?: string;
}

// Image management types
export interface ImageData {
  uri: string;
  name: string;
  type: string;
  size: number;
  compressed?: boolean;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Animation types
export interface AnimationConfig {
  duration: number;
  useNativeDriver: boolean;
  tension?: number;
  friction?: number;
}

export interface CardAnimationState {
  scale: any; // Animated.Value
  shadow: any; // Animated.Value
  opacity: any; // Animated.Value
}

// Service category types
export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: ServiceSubcategory[];
  basePrice: number;
  priceRange: [number, number];
}

export interface ServiceSubcategory {
  id: string;
  name: string;
  price: number;
  estimatedTime: string;
  description: string;
}

// Vehicle types
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  type: 'car' | 'truck' | 'motorcycle' | 'other';
  engineType: 'gas' | 'diesel' | 'electric' | 'hybrid';
}

// Mechanic types
export interface Mechanic {
  id: string;
  name: string;
  type: 'shops' | 'freelance';
  isMobile?: boolean;
  isShop?: boolean;
  specialties?: string[];
  rating?: number;
  reviews?: number;
}

// Theme types
export interface Theme {
  primary: string;
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  cardBackground: string;
  cardShadow: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  onPrimary: string;
  onBackground: string;
  onSurface: string;
}

// Navigation types
export interface NavigationProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
    reset: (state: any) => void;
    addListener: (event: string, callback: (e: any) => void) => () => void;
    dispatch: (action: any) => void;
  };
  route?: {
    params?: any;
  };
}

// Hook return types
export interface UseStepManagementReturn extends StepState, StepNavigation {
  markStepCompleted: (stepNumber: number) => void;
  markStepIncomplete: (stepNumber: number) => void;
  resetSteps: () => void;
  resetToStep: (stepNumber: number) => void;
  handleScroll: (event: any) => void;
  stepInfo: any;
}

export interface UseFormValidationReturn {
  canProceedToNext: boolean;
  getValidationResult: (step: number) => ValidationResult;
  getNextButtonText: (step: number) => string;
  validateField: (field: keyof JobFormData, value: any) => ValidationResult;
  getAllErrors: () => string[];
  isFormReadyForSubmission: boolean;
  getFormCompletionPercentage: () => number;
}

export interface UseModalManagementReturn {
  modalState: ModalState;
  showModal: (modalType: keyof ModalState) => void;
  hideModal: (modalType: keyof ModalState) => void;
  toggleModal: (modalType: keyof ModalState) => void;
  setPaymentError: (error: string | null) => void;
  setPaymentProcessing: (processing: boolean) => void;
  hideAllModals: () => void;
  isAnyModalVisible: () => boolean;
  getVisibleModalCount: () => number;
  resetModals: () => void;
}

export interface UsePaymentProcessingReturn {
  processPayment: (paymentData: PaymentData) => Promise<PaymentResult>;
  retryPayment: (paymentData: PaymentData) => Promise<PaymentResult>;
  isProcessing: boolean;
  error: string | null;
  resetPayment: () => void;
  validatePaymentData: (data: PaymentData) => ValidationResult;
  getPaymentStatus: () => string;
  canRetry: () => boolean;
  retryCount: number;
  maxRetries: number;
}

export interface UseImageManagementReturn {
  images: ImageData[];
  addImage: (image: ImageData) => void;
  removeImage: (index: number) => void;
  addImageFromCamera: () => Promise<void>;
  addImageFromGallery: () => Promise<void>;
  compressImage: (uri: string) => Promise<string>;
  uploadImages: () => Promise<ImageUploadResult[]>;
  clearImages: () => void;
  isUploading: boolean;
  uploadProgress: number;
  getImageCount: () => number;
  canAddMoreImages: () => boolean;
  getTotalSize: () => number;
  getTotalSizeMB: () => number;
}

export interface UseAutoSaveReturn {
  saveFormData: (data: JobFormData) => Promise<void>;
  loadFormData: () => Promise<JobFormData | null>;
  clearSavedData: () => Promise<void>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  markDataChanged: () => void;
  startAutoSave: (data: JobFormData) => void;
  stopAutoSave: () => void;
  hasDataChanged: (currentData: JobFormData) => boolean;
  getSaveStatus: () => string;
  getTimeSinceLastSave: () => string;
  handleDataChange: (data: JobFormData) => void;
}

export interface UseNetworkStatusReturn {
  isOnline: boolean;
  isConnected: boolean;
  connectionType: string | null;
  isInternetReachable: boolean;
  isGoodConnection: boolean;
  isSlowConnection: boolean;
  getConnectionQuality: () => string;
  getConnectionStatusText: () => string;
  shouldShowOfflineWarning: () => boolean;
  canPerformNetworkOperations: () => boolean;
  getNetworkInfo: () => any;
}

// Step Management Hook (extended version)
export interface UseStepManagementReturnExtended {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  hasScrolledToBottom: boolean;
  progressPercentage: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  canProceedToNext: boolean;
  isStepCompleted: (step: number) => boolean;
  markStepCompleted: (step: number) => void;
  markStepIncomplete: (step: number) => void;
  resetSteps: () => void;
  resetToStep: (step: number) => void;
  handleScroll: (event: any) => void;
  stepInfo: {
    currentStep: number;
    totalSteps: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    canGoBack: boolean;
    canGoForward: boolean;
    progress: number;
    progressPercentage: number;
  };
}

// Component prop types
export interface StepComponentProps {
  formData: JobFormData;
  updateFormData: (field: keyof JobFormData, value: any) => void;
  theme: ThemeType;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  isLoading?: boolean;
}

export interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeType;
  children?: React.ReactNode;
}

export interface PaymentModalProps extends ModalComponentProps {
  amount: number;
  onPaymentSuccess: (result: PaymentResult) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: any;
}

// Performance types
export interface PerformanceMetrics {
  componentRenderTime: number;
  bundleSize: number;
  memoryUsage: number;
  networkRequests: number;
}

// Accessibility types
export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: {
    selected?: boolean;
    disabled?: boolean;
    checked?: boolean;
  };
}

// Testing types
export interface TestProps {
  testID?: string;
  accessibilityTestID?: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
