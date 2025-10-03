/**
 * AWS Error Handler Utility
 * 
 * Handles AWS service errors gracefully, particularly SNS-related errors
 * that don't affect core app functionality.
 */

export interface AWSErrorResult {
  isCritical: boolean;
  shouldRetry: boolean;
  userMessage: string;
  logLevel: 'error' | 'warn' | 'info';
}

/**
 * Check if an error is SNS-related and non-critical
 */
export const isSNSError = (error: any): boolean => {
  const errorMessage = error?.message || error?.toString() || '';
  const errorName = error?.name || '';
  
  return (
    errorMessage.includes('SNS sandbox status') ||
    errorMessage.includes('Failed to get SNS sandbox status') ||
    errorMessage.includes('GetSMSSandboxAccountStatus') ||
    errorName === 'UserError' ||
    errorMessage.includes('SNS') && errorMessage.includes('sandbox')
  );
};

/**
 * Handle AWS service errors with appropriate logging and user messaging
 */
export const handleAWSError = (error: any, context: string = 'AWS Service'): AWSErrorResult => {
  // Check if it's a non-critical SNS error
  if (isSNSError(error)) {
    console.warn(`${context}: SNS Service Warning (non-critical):`, error.message || error);
    return {
      isCritical: false,
      shouldRetry: false,
      userMessage: 'Service temporarily unavailable. Please try again.',
      logLevel: 'warn'
    };
  }
  
  // Handle other AWS errors
  const errorCode = error?.code || '';
  const errorMessage = error?.message || 'Unknown AWS error';
  
  switch (errorCode) {
    case 'NetworkError':
    case 'NetworkingError':
      return {
        isCritical: true,
        shouldRetry: true,
        userMessage: 'Network error. Please check your connection.',
        logLevel: 'error'
      };
      
    case 'NotAuthorizedException':
      return {
        isCritical: true,
        shouldRetry: false,
        userMessage: 'Authentication failed. Please check your credentials.',
        logLevel: 'error'
      };
      
    case 'UserNotFoundException':
      return {
        isCritical: true,
        shouldRetry: false,
        userMessage: 'User not found. Please check your email.',
        logLevel: 'error'
      };
      
    case 'InvalidParameterException':
      return {
        isCritical: true,
        shouldRetry: false,
        userMessage: 'Invalid input. Please check your information.',
        logLevel: 'error'
      };
      
    case 'TooManyRequestsException':
      return {
        isCritical: true,
        shouldRetry: true,
        userMessage: 'Too many requests. Please wait a moment.',
        logLevel: 'error'
      };
      
    default:
      console.error(`${context}: Unhandled AWS error:`, error);
      return {
        isCritical: true,
        shouldRetry: true,
        userMessage: 'Service error. Please try again.',
        logLevel: 'error'
      };
  }
};

/**
 * Wrap AWS service calls with error handling
 */
export const withAWSErrorHandling = async <T>(
  serviceCall: () => Promise<T>,
  context: string = 'AWS Service',
  fallbackValue?: T
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const result = await serviceCall();
    return { success: true, data: result };
  } catch (error) {
    const errorResult = handleAWSError(error, context);
    
    // Log based on severity
    if (errorResult.logLevel === 'error') {
      console.error(`${context}:`, error);
    } else if (errorResult.logLevel === 'warn') {
      console.warn(`${context}:`, error);
    }
    
    // Return fallback value for non-critical errors
    if (!errorResult.isCritical && fallbackValue !== undefined) {
      return { success: true, data: fallbackValue };
    }
    
    return { 
      success: false, 
      error: errorResult.userMessage 
    };
  }
};

/**
 * Set up global AWS error filtering for console
 */
export const setupAWSConsoleFilter = () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = (...args) => {
    const errorMessage = args[0]?.toString() || '';
    
    // Filter out SNS sandbox status errors
    if (isSNSError({ message: errorMessage })) {
      console.warn('AWS SNS Service Warning (non-critical):', ...args);
      return;
    }
    
    originalConsoleError.apply(console, args);
  };
  
  console.warn = (...args) => {
    const errorMessage = args[0]?.toString() || '';
    
    // Convert SNS errors to info level
    if (isSNSError({ message: errorMessage })) {
      console.info('AWS SNS Service Info:', ...args);
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };
};
