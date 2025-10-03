import { useState, useCallback, useMemo } from 'react';
import { UseStepManagementReturn } from '../types/JobTypes';

interface UseStepManagementProps {
  totalSteps: number;
  initialStep?: number;
  onStepChange?: (step: number) => void;
}

export const useStepManagement = ({
  totalSteps,
  initialStep = 1,
  onStepChange,
}: UseStepManagementProps): UseStepManagementReturn => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Navigation functions
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    }
  }, [currentStep, totalSteps, onStepChange]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  }, [currentStep, onStepChange]);

  const goToStep = useCallback((stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setCurrentStep(stepNumber);
      onStepChange?.(stepNumber);
    }
  }, [totalSteps, onStepChange]);

  // Step completion tracking
  const markStepCompleted = useCallback((stepNumber: number) => {
    setCompletedSteps(prev => {
      if (!prev.includes(stepNumber)) {
        return [...prev, stepNumber].sort();
      }
      return prev;
    });
  }, []);

  const markStepIncomplete = useCallback((stepNumber: number) => {
    setCompletedSteps(prev => prev.filter(step => step !== stepNumber));
  }, []);

  const isStepCompleted = useCallback((stepNumber: number) => {
    return completedSteps.includes(stepNumber);
  }, [completedSteps]);

  // Progress calculation
  const progress = useMemo(() => {
    return (currentStep - 1) / (totalSteps - 1);
  }, [currentStep, totalSteps]);

  const progressPercentage = useMemo(() => {
    return Math.round(progress * 100);
  }, [progress]);

  // Step validation (basic - can be overridden by specific step validation)
  const canProceedToNext = useMemo(() => {
    // This is a basic implementation - specific validation should be handled by useFormValidation
    return currentStep < totalSteps;
  }, [currentStep, totalSteps]);

  // Reset functions
  const resetSteps = useCallback(() => {
    setCurrentStep(initialStep);
    setCompletedSteps([]);
    setHasScrolledToBottom(false);
  }, [initialStep]);

  const resetToStep = useCallback((stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= totalSteps) {
      setCurrentStep(stepNumber);
      setCompletedSteps(prev => prev.filter(step => step < stepNumber));
      setHasScrolledToBottom(false);
    }
  }, [totalSteps]);

  // Scroll tracking
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isScrolledToBottom = 
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 20; // 20px threshold
    
    setHasScrolledToBottom(isScrolledToBottom);
  }, []);


  // Step information
  const stepInfo = useMemo(() => ({
    currentStep,
    totalSteps,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    canGoBack: currentStep > 1,
    canGoForward: currentStep < totalSteps,
    progress,
    progressPercentage,
  }), [currentStep, totalSteps, progress, progressPercentage]);

  return {
    // State
    currentStep,
    totalSteps,
    completedSteps,
    hasScrolledToBottom,
    progressPercentage,
    
    // Navigation
    goToNextStep,
    goToPreviousStep,
    goToStep,
    canProceedToNext,
    isStepCompleted,
    
    // Additional utilities
    markStepCompleted,
    markStepIncomplete,
    resetSteps,
    resetToStep,
    handleScroll,
    stepInfo,
  };
};

export default useStepManagement;
