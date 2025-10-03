import { useState, useCallback, useMemo } from 'react';
import { JobFormData, ValidationResult, UseFormValidationReturn } from '../types/JobTypes';

interface UseUnifiedFormValidationProps {
  formData?: JobFormData;
  currentStep?: number;
  hasScrolledToBottom?: boolean;
  isSubmitting?: boolean;
  initialValues?: Record<string, any>;
  validationRules?: Record<string, any[]>;
}

interface GenericFormValidationReturn {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  submitCount: number;
  isValid: boolean;
  handleChange: (name: string, value: any) => void;
  handleBlur: (name: string) => void;
  handleSubmit: (onSubmit: (values: Record<string, any>) => Promise<void>) => Promise<boolean>;
  resetForm: () => void;
  validateForm: () => boolean;
  getFieldProps: (name: string) => {
    value: string;
    onChangeText: (value: string) => void;
    onBlur: () => void;
    error: string;
    touched: boolean;
  };
}

// Validation rules for job form steps
const stepValidationRules = {
  1: (data: JobFormData): ValidationResult => {
    const errors: string[] = [];
    
    if (!data.vehicle) {
      errors.push('Please select a vehicle type');
    }
    
    if (!data.serviceType) {
      errors.push('Please select a service type');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  },
  
  2: (data: JobFormData): ValidationResult => {
    const errors: string[] = [];
    
    if (!data.category) {
      errors.push('Please select a service category');
    }
    
    if (!data.subcategory) {
      errors.push('Please select a specific service');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  },
  
  3: (data: JobFormData): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!data.description || data.description.trim().length < 10) {
      errors.push('Please provide a detailed description (at least 10 characters)');
    }
    
    if (!data.location || data.location.trim().length < 5) {
      errors.push('Please provide a valid location');
    }
    
    if (!data.urgency) {
      errors.push('Please select urgency level');
    }
    
    if (data.description && data.description.length > 500) {
      warnings.push('Description is quite long. Consider being more concise.');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },
  
  4: (data: JobFormData): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (data.images.length === 0) {
      warnings.push('Adding photos can help mechanics understand your needs better');
    }
    
    if (data.images.length > 10) {
      warnings.push('Too many photos. Please select the most relevant ones.');
    }
    
    return {
      isValid: true, // Photos are optional
      errors,
      warnings,
    };
  },
  
  5: (data: JobFormData): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Contact information is optional but recommended
    if (!data.contactPhone || data.contactPhone.trim().length < 10) {
      warnings.push('Phone number is recommended for better communication');
    }
    
    if (!data.contactEmail || !isValidEmail(data.contactEmail)) {
      warnings.push('Email address is recommended for job updates');
    }
    
    return {
      isValid: true, // Review step is always valid - contact info is optional
      errors,
      warnings,
    };
  },
  
  6: (data: JobFormData): ValidationResult => {
    const errors: string[] = [];
    
    if (!data.estimatedCost || data.estimatedCost <= 0) {
      errors.push('Unable to calculate estimated cost. Please try again.');
    }
    
    // Note: paymentMethod is handled separately, not part of JobFormData
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  },
};

// Helper function to validate email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone number
const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Generic validation functions
const validators = {
  required: (value: any) => (!value || (typeof value === 'string' && value.trim() === '')) ? 'This field is required' : '',
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? 'Please enter a valid email' : '';
  },
  minLength: (min: number) => (value: string) => 
    value && value.length < min ? `Must be at least ${min} characters` : '',
  maxLength: (max: number) => (value: string) => 
    value && value.length > max ? `Must be no more than ${max} characters` : '',
  numeric: (value: any) => 
    value && isNaN(Number(value)) ? 'Must be a valid number' : '',
  positive: (value: any) => 
    value && Number(value) <= 0 ? 'Must be a positive number' : '',
  phone: (value: string) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return value && !phoneRegex.test(value.replace(/[\s\-()]/g, '')) ? 'Please enter a valid phone number' : '';
  },
  custom: (validator: (value: any) => string) => validator,
};

export const useUnifiedFormValidation = ({
  formData,
  currentStep = 1,
  hasScrolledToBottom = false,
  isSubmitting = false,
  initialValues = {},
  validationRules = {},
}: UseUnifiedFormValidationProps = {}): UseFormValidationReturn | GenericFormValidationReturn => {
  
  // Always call both hooks to avoid conditional hook calls
  const jobValidationResult = useJobFormValidation({ 
    formData: formData || {} as JobFormData, 
    currentStep, 
    hasScrolledToBottom, 
    isSubmitting 
  });
  
  const genericValidationResult = useGenericFormValidation({ 
    initialValues, 
    validationRules, 
    isSubmitting 
  });
  
  // Return the appropriate result based on whether formData is provided
  return formData ? jobValidationResult : genericValidationResult;
};

// Job form validation hook
const useJobFormValidation = ({
  formData,
  currentStep,
  hasScrolledToBottom,
  isSubmitting,
}: {
  formData: JobFormData;
  currentStep: number;
  hasScrolledToBottom: boolean;
  isSubmitting: boolean;
}): UseFormValidationReturn => {
  
  // Get validation result for current step
  const getValidationResult = useCallback((step: number): ValidationResult => {
    const validator = stepValidationRules[step as keyof typeof stepValidationRules];
    if (!validator) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
      };
    }
    
    return validator(formData);
  }, [formData]);
  
  // Check if current step can proceed
  const canProceedToNext = useMemo(() => {
    const validation = getValidationResult(currentStep);
    
    // Special case for review step - must scroll to bottom
    if (currentStep === 5 && !hasScrolledToBottom) {
      return false;
    }
    
    return validation.isValid && !isSubmitting;
  }, [currentStep, getValidationResult, hasScrolledToBottom, isSubmitting]);
  
  // Get next button text based on step and state
  const getNextButtonText = useCallback((step: number): string => {
    if (isSubmitting) {
      return 'Processing...';
    }
    
    switch (step) {
      case 1:
        return 'Next: Service Type';
      case 2:
        return 'Next: Details';
      case 3:
        return 'Next: Photos';
      case 4:
        return 'Next: Review';
      case 5:
        return hasScrolledToBottom ? 'Continue to Payment' : 'Scroll Down to Continue';
      case 6:
        return hasScrolledToBottom ? 'Create Job' : 'Scroll Down to Continue';
      default:
        return 'Next';
    }
  }, [hasScrolledToBottom, isSubmitting]);
  
  // Validate individual field
  const validateField = useCallback((field: keyof JobFormData, value: any): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    switch (field) {
      case 'description':
        if (!value || value.trim().length < 10) {
          errors.push('Description must be at least 10 characters');
        } else if (value.length > 500) {
          warnings.push('Description is quite long');
        }
        break;
        
      case 'location':
        if (!value || value.trim().length < 5) {
          errors.push('Location must be at least 5 characters');
        }
        break;
        
      case 'contactPhone':
        if (!value || !isValidPhone(value)) {
          errors.push('Please enter a valid phone number');
        }
        break;
        
      case 'contactEmail':
        if (!value || !isValidEmail(value)) {
          errors.push('Please enter a valid email address');
        }
        break;
        
      case 'vehicle':
        if (!value) {
          errors.push('Please select a vehicle type');
        }
        break;
        
      case 'serviceType':
        if (!value) {
          errors.push('Please select a service type');
        }
        break;
        
      case 'category':
        if (!value) {
          errors.push('Please select a service category');
        }
        break;
        
      case 'subcategory':
        if (!value) {
          errors.push('Please select a specific service');
        }
        break;
        
      case 'urgency':
        if (!value) {
          errors.push('Please select urgency level');
        }
        break;
        
      case 'images':
        if (Array.isArray(value) && value.length > 10) {
          warnings.push('Too many photos selected');
        }
        break;
        
      default:
        // No specific validation for other fields
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);
  
  // Get all validation errors for the entire form
  const getAllErrors = useCallback((): string[] => {
    const allErrors: string[] = [];
    
    for (let step = 1; step <= 6; step++) {
      const validation = getValidationResult(step);
      allErrors.push(...validation.errors);
    }
    
    return allErrors;
  }, [getValidationResult]);
  
  // Check if form is ready for submission
  const isFormReadyForSubmission = useMemo(() => {
    const allErrors = getAllErrors();
    return allErrors.length === 0 && !isSubmitting;
  }, [getAllErrors, isSubmitting]);
  
  // Get form completion percentage
  const getFormCompletionPercentage = useCallback((): number => {
    let completedFields = 0;
    const totalFields = 8; // Adjust based on your form fields
    
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
  
  return {
    canProceedToNext,
    getValidationResult,
    getNextButtonText,
    validateField,
    getAllErrors,
    isFormReadyForSubmission,
    getFormCompletionPercentage,
  };
};

// Generic form validation hook
const useGenericFormValidation = ({
  initialValues,
  validationRules,
  isSubmitting: externalIsSubmitting = false,
}: {
  initialValues: Record<string, any>;
  validationRules: Record<string, any[]>;
  isSubmitting: boolean;
}): GenericFormValidationReturn => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Validate a single field
  const validateField = useCallback((name: string, value: any) => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      let validator, message;
      
      if (typeof rule === 'string') {
        validator = validators[rule as keyof typeof validators];
        message = '';
      } else if (typeof rule === 'function') {
        validator = rule;
        message = '';
      } else if (rule.validator) {
        validator = validators[rule.validator as keyof typeof validators] || rule.validator;
        message = rule.message || '';
      } else {
        continue;
      }

      const error = validator(value);
      if (error) return message || error;
    }

    return '';
  }, [validationRules]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationRules]);

  // Handle field change
  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit: (values: Record<string, any>) => Promise<void>) => {
    setSubmitCount(prev => prev + 1);
    setTouched({}); // Mark all fields as touched
    
    const isValid = validateForm();
    if (!isValid) return false;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitCount(0);
  }, [initialValues]);

  // Get field props for easy integration
  const getFieldProps = useCallback((name: string) => ({
    value: values[name] || '',
    onChangeText: (value: string) => handleChange(name, value),
    onBlur: () => handleBlur(name),
    error: touched[name] ? errors[name] : '',
    touched: touched[name],
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    isSubmitting: isSubmitting || externalIsSubmitting,
    submitCount,
    isValid: Object.keys(errors).length === 0,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    validateForm,
    getFieldProps,
  };
};

export default useUnifiedFormValidation;
