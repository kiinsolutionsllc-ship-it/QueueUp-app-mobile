import { useMemo, useCallback } from 'react';
import { JobFormData, Theme } from '../types/JobTypes';
import { useDeepMemo, useDebouncedCallback, useExpensiveCalculation } from '../utils/memoization';

interface UseCreateJobOptimizationsProps {
  formData: JobFormData;
  theme: Theme;
  onFormDataChange: (field: keyof JobFormData, value: any) => void;
  onAutoSave: (data: JobFormData) => void;
}

export const useCreateJobOptimizations = ({
  formData,
  theme,
  onFormDataChange,
  onAutoSave,
}: UseCreateJobOptimizationsProps) => {
  
  // Memoized form data updates
  const updateFormData = useCallback((field: keyof JobFormData, value: any) => {
    onFormDataChange(field, value);
  }, [onFormDataChange]);

  // Debounced auto-save
  const debouncedAutoSave = useDebouncedCallback(
    (data: JobFormData) => {
      onAutoSave(data);
    },
    2000, // 2 second delay
    [onAutoSave]
  );

  // Auto-save when form data changes
  const handleFormDataChange = useCallback((field: keyof JobFormData, value: any) => {
    updateFormData(field, value);
    
    // Trigger auto-save with debouncing
    const newFormData = { ...formData, [field]: value };
    debouncedAutoSave(newFormData);
  }, [updateFormData, formData, debouncedAutoSave]);

  // Memoized step validation
  const stepValidation = useDeepMemo(() => {
    const validations = {
      step1: {
        isValid: !!(formData.vehicle && formData.serviceType && formData.location),
        errors: [],
      },
      step2: {
        isValid: !!(formData.category && formData.subcategory),
        errors: [],
      },
      step3: {
        isValid: !!(formData.description && formData.urgency),
        errors: [],
      },
      step4: {
        isValid: true, // Photos are optional
        errors: [],
      },
      step5: {
        isValid: true, // Review step - validation handled by confirmation state
        errors: [],
      },
      step6: {
        isValid: !!formData.estimatedCost,
        errors: [],
      },
    };

    return validations;
  }, [formData]);

  // Memoized estimated cost calculation
  const estimatedCost = useExpensiveCalculation(
    () => {
      if (!formData.category) return 0;
      
      // Simulate expensive calculation
      const baseCosts: Record<string, number> = {
        maintenance: 50,
        repair: 200,
        diagnostic: 80,
        emergency: 100,
      };
      
      const baseCost = baseCosts[formData.category] || 0;
      const urgencyMultiplier = formData.urgency === 'high' ? 1.5 : 1;
      
      return Math.round(baseCost * urgencyMultiplier);
    },
    [formData.category, formData.urgency],
    { maxAge: 10000 } // 10 second cache
  );

  // Memoized service categories
  const serviceCategories = useMemo(() => [
    {
      id: 'maintenance',
      name: 'Maintenance',
      icon: 'build',
      basePrice: 50,
      priceRange: [25, 100],
    },
    {
      id: 'repair',
      name: 'Repair',
      icon: 'handyman',
      basePrice: 200,
      priceRange: [100, 500],
    },
    {
      id: 'diagnostic',
      name: 'Diagnostic',
      icon: 'search',
      basePrice: 80,
      priceRange: [60, 150],
    },
    {
      id: 'emergency',
      name: 'Emergency',
      icon: 'emergency',
      basePrice: 100,
      priceRange: [50, 200],
    },
  ], []);

  // Memoized vehicle options
  const vehicleOptions = useMemo(() => [
    { id: 'car', name: 'Car', icon: 'directions-car' },
    { id: 'truck', name: 'Truck', icon: 'local-shipping' },
    { id: 'motorcycle', name: 'Motorcycle', icon: 'motorcycle' },
    { id: 'other', name: 'Other', icon: 'miscellaneous-services' },
  ], []);

  // Memoized urgency options
  const urgencyOptions = useMemo(() => [
    {
      id: 'low',
      title: 'Low',
      description: 'Can wait a few days',
      icon: 'schedule',
      color: theme.success,
    },
    {
      id: 'medium',
      title: 'Medium',
      description: 'Within 24 hours',
      icon: 'access-time',
      color: theme.warning,
    },
    {
      id: 'high',
      title: 'High',
      description: 'ASAP - Emergency',
      icon: 'emergency',
      color: theme.error,
    },
  ], [theme.success, theme.warning, theme.error]);

  // Memoized step props
  const stepProps = useDeepMemo(() => ({
    formData,
    updateFormData: handleFormDataChange,
    theme,
  }), [formData, handleFormDataChange, theme]);

  // Memoized validation results
  const validationResults = useDeepMemo(() => {
    const results: Record<string, { isValid: boolean; errors: string[] }> = {};
    
    Object.entries(stepValidation).forEach(([step, validation]) => {
      results[step] = {
        isValid: validation.isValid,
        errors: validation.errors,
      };
    });
    
    return results;
  }, [stepValidation]);

  // Memoized can proceed logic
  const canProceedToNext = useCallback((currentStep: number) => {
    const stepKey = `step${currentStep}` as keyof typeof stepValidation;
    return stepValidation[stepKey]?.isValid || false;
  }, [stepValidation]);

  // Memoized form completion percentage
  const formCompletionPercentage = useMemo(() => {
    const totalFields = 8;
    let completedFields = 0;
    
    const requiredFields: (keyof JobFormData)[] = [
      'vehicle',
      'serviceType',
      'category',
      'description',
      'location',
      'urgency',
      'contactPhone',
      'contactEmail',
    ];
    
    requiredFields.forEach(field => {
      const value = formData[field];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) completedFields++;
        } else {
          completedFields++;
        }
      }
    });
    
    return Math.round((completedFields / totalFields) * 100);
  }, [formData]);

  // Memoized step navigation
  const stepNavigation = useMemo(() => ({
    goToNextStep: () => {
      // Implementation would go here
    },
    goToPreviousStep: () => {
      // Implementation would go here
    },
    goToStep: (stepNumber: number) => {
      // Implementation would go here
    },
  }), []);

  return {
    // Form handling
    updateFormData: handleFormDataChange,
    formData,
    
    // Validation
    stepValidation,
    validationResults,
    canProceedToNext,
    
    // Calculations
    estimatedCost,
    formCompletionPercentage,
    
    // Options
    serviceCategories,
    vehicleOptions,
    urgencyOptions,
    
    // Props
    stepProps,
    stepNavigation,
    
    // Utilities
    debouncedAutoSave,
  };
};

export default useCreateJobOptimizations;
