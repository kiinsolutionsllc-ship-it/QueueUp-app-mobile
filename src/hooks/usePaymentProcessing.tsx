import { useState, useCallback } from 'react';
import { PaymentData, PaymentResult, UsePaymentProcessingReturn, ValidationResult } from '../types/JobTypes';

interface UsePaymentProcessingProps {
  onPaymentSuccess?: (result: PaymentResult) => void;
  onPaymentError?: (error: string) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

export const usePaymentProcessing = ({
  onPaymentSuccess,
  onPaymentError,
  retryAttempts = 3,
  retryDelay = 1000,
}: UsePaymentProcessingProps = {}): UsePaymentProcessingReturn => {
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Simulate payment processing (replace with actual Stripe integration)
  const processPayment = useCallback(async (paymentData: PaymentData): Promise<PaymentResult> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment processing logic
      if (!paymentData.paymentMethodId) {
        throw new Error('Payment method is required');
      }
      
      if (paymentData.amount <= 0) {
        throw new Error('Invalid payment amount');
      }
      
      // Simulate random success/failure for testing
      const success = Math.random() > 0.1; // 90% success rate for demo
      
      if (!success) {
        throw new Error('Payment processing failed. Please try again.');
      }
      
      const result: PaymentResult = {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      setRetryCount(0);
      onPaymentSuccess?.(result);
      
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      onPaymentError?.(errorMessage);
      
      const result: PaymentResult = {
        success: false,
        error: errorMessage,
      };
      
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [onPaymentSuccess, onPaymentError]);

  // Retry payment with exponential backoff
  const retryPayment = useCallback(async (paymentData: PaymentData): Promise<PaymentResult> => {
    if (retryCount >= retryAttempts) {
      const errorMessage = 'Maximum retry attempts reached';
      setError(errorMessage);
      onPaymentError?.(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    setRetryCount(prev => prev + 1);
    
    // Wait before retry with exponential backoff
    const delay = retryDelay * Math.pow(2, retryCount - 1);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return processPayment(paymentData);
  }, [retryCount, retryAttempts, retryDelay, processPayment, onPaymentError]);

  // Reset payment state
  const resetPayment = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setRetryCount(0);
  }, []);

  // Validate payment data
  const validatePaymentData = useCallback((data: PaymentData): ValidationResult => {
    const errors: string[] = [];
    
    if (!data.amount || data.amount <= 0) {
      errors.push('Invalid payment amount');
    }
    
    if (!data.currency || data.currency.length !== 3) {
      errors.push('Invalid currency code');
    }
    
    if (!data.paymentMethodId) {
      errors.push('Payment method is required');
    }
    
    if (!data.customerId) {
      errors.push('Customer ID is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }, []);

  // Process payment with validation
  const processPaymentWithValidation = useCallback(async (paymentData: PaymentData): Promise<PaymentResult> => {
    const validationErrors = validatePaymentData(paymentData);
    
    if (!validationErrors.isValid) {
      const errorMessage = validationErrors.errors.join(', ');
      setError(errorMessage);
      onPaymentError?.(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    return processPayment(paymentData);
  }, [validatePaymentData, processPayment, onPaymentError]);

  // Get payment status
  const getPaymentStatus = useCallback(() => {
    if (isProcessing) {
      return 'processing';
    }
    
    if (error) {
      return 'error';
    }
    
    if (retryCount > 0) {
      return 'retrying';
    }
    
    return 'idle';
  }, [isProcessing, error, retryCount]);

  // Check if payment can be retried
  const canRetry = useCallback(() => {
    return !isProcessing && retryCount < retryAttempts;
  }, [isProcessing, retryCount, retryAttempts]);

  return {
    processPayment: processPaymentWithValidation,
    retryPayment,
    isProcessing,
    error,
    resetPayment,
    validatePaymentData,
    getPaymentStatus,
    canRetry,
    retryCount,
    maxRetries: retryAttempts,
  };
};

export default usePaymentProcessing;
