/**
 * ENHANCED ERROR HANDLING UTILITY
 * 
 * Provides comprehensive error handling, logging, and user-friendly error messages
 * for the QueueUp application.
 */

import { Alert } from 'react-native';

// Error types and categories
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  DATABASE: 'database',
  PAYMENT: 'payment',
  LOCATION: 'location',
  NOTIFICATION: 'notification',
  UNKNOWN: 'unknown'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// User-friendly error messages
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_TIMEOUT: 'Connection timed out. Please check your internet connection and try again.',
  NETWORK_UNAVAILABLE: 'No internet connection. Please check your network settings.',
  SERVER_ERROR: 'Server is temporarily unavailable. Please try again later.',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  ACCOUNT_LOCKED: 'Your account has been temporarily locked. Please contact support.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Authorization errors
  ACCESS_DENIED: 'You do not have permission to perform this action.',
  SUBSCRIPTION_REQUIRED: 'This feature requires an active subscription.',
  
  // Validation errors
  INVALID_INPUT: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  
  // Database errors
  DATA_NOT_FOUND: 'The requested information could not be found.',
  DATA_CONFLICT: 'This information already exists.',
  DATA_CORRUPTED: 'Data integrity issue. Please contact support.',
  
  // Payment errors
  PAYMENT_FAILED: 'Payment could not be processed. Please try again.',
  INSUFFICIENT_FUNDS: 'Insufficient funds. Please check your payment method.',
  PAYMENT_DECLINED: 'Payment was declined. Please contact your bank.',
  
  // Location errors
  LOCATION_PERMISSION_DENIED: 'Location permission is required for this feature.',
  LOCATION_UNAVAILABLE: 'Unable to get your current location.',
  LOCATION_TIMEOUT: 'Location request timed out. Please try again.',
  
  // Notification errors
  NOTIFICATION_PERMISSION_DENIED: 'Notification permission is required for updates.',
  NOTIFICATION_FAILED: 'Failed to send notification.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  OPERATION_FAILED: 'Operation failed. Please try again.',
  FEATURE_UNAVAILABLE: 'This feature is currently unavailable.'
};

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Handle and categorize errors
   */
  handleError(error, context = {}, options = {}) {
    const errorInfo = this.categorizeError(error, context);
    this.logError(errorInfo);
    
    // Show user-friendly message if requested
    if (options.showAlert) {
      this.showUserFriendlyAlert(errorInfo, options);
    }
    
    // Return structured error information
    return errorInfo;
  }

  /**
   * Categorize error by type and severity
   */
  categorizeError(error, context = {}) {
    const timestamp = new Date().toISOString();
    let type = ERROR_TYPES.UNKNOWN;
    let severity = ERROR_SEVERITY.MEDIUM;
    let userMessage = ERROR_MESSAGES.UNKNOWN_ERROR;
    let technicalMessage = error.message || 'Unknown error';

    // Determine error type based on error properties
    if (error.code) {
      switch (error.code) {
        case 'NETWORK_ERROR':
        case 'TIMEOUT':
          type = ERROR_TYPES.NETWORK;
          severity = ERROR_SEVERITY.MEDIUM;
          userMessage = ERROR_MESSAGES.NETWORK_TIMEOUT;
          break;
        case 'AUTH_ERROR':
        case 'INVALID_CREDENTIALS':
          type = ERROR_TYPES.AUTHENTICATION;
          severity = ERROR_SEVERITY.HIGH;
          userMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
          break;
        case 'PERMISSION_DENIED':
          type = ERROR_TYPES.AUTHORIZATION;
          severity = ERROR_SEVERITY.HIGH;
          userMessage = ERROR_MESSAGES.ACCESS_DENIED;
          break;
        case 'VALIDATION_ERROR':
          type = ERROR_TYPES.VALIDATION;
          severity = ERROR_SEVERITY.LOW;
          userMessage = ERROR_MESSAGES.INVALID_INPUT;
          break;
        case 'DATABASE_ERROR':
          type = ERROR_TYPES.DATABASE;
          severity = ERROR_SEVERITY.HIGH;
          userMessage = ERROR_MESSAGES.DATA_NOT_FOUND;
          break;
        case 'PAYMENT_ERROR':
          type = ERROR_TYPES.PAYMENT;
          severity = ERROR_SEVERITY.HIGH;
          userMessage = ERROR_MESSAGES.PAYMENT_FAILED;
          break;
        case 'LOCATION_ERROR':
          type = ERROR_TYPES.LOCATION;
          severity = ERROR_SEVERITY.MEDIUM;
          userMessage = ERROR_MESSAGES.LOCATION_UNAVAILABLE;
          break;
      }
    }

    // Determine type from error message patterns
    if (error.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('network') || message.includes('connection')) {
        type = ERROR_TYPES.NETWORK;
        userMessage = ERROR_MESSAGES.NETWORK_UNAVAILABLE;
      } else if (message.includes('auth') || message.includes('login')) {
        type = ERROR_TYPES.AUTHENTICATION;
        userMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
      } else if (message.includes('permission') || message.includes('access')) {
        type = ERROR_TYPES.AUTHORIZATION;
        userMessage = ERROR_MESSAGES.ACCESS_DENIED;
      } else if (message.includes('validation') || message.includes('invalid')) {
        type = ERROR_TYPES.VALIDATION;
        userMessage = ERROR_MESSAGES.INVALID_INPUT;
      } else if (message.includes('database') || message.includes('supabase')) {
        type = ERROR_TYPES.DATABASE;
        userMessage = ERROR_MESSAGES.DATA_NOT_FOUND;
      } else if (message.includes('payment') || message.includes('stripe')) {
        type = ERROR_TYPES.PAYMENT;
        userMessage = ERROR_MESSAGES.PAYMENT_FAILED;
      } else if (message.includes('location') || message.includes('gps')) {
        type = ERROR_TYPES.LOCATION;
        userMessage = ERROR_MESSAGES.LOCATION_UNAVAILABLE;
      }
    }

    // Determine severity based on type and context
    if (type === ERROR_TYPES.AUTHENTICATION || type === ERROR_TYPES.PAYMENT) {
      severity = ERROR_SEVERITY.HIGH;
    } else if (type === ERROR_TYPES.NETWORK || type === ERROR_TYPES.LOCATION) {
      severity = ERROR_SEVERITY.MEDIUM;
    } else if (type === ERROR_TYPES.VALIDATION) {
      severity = ERROR_SEVERITY.LOW;
    }

    return {
      id: this.generateErrorId(),
      timestamp,
      type,
      severity,
      userMessage,
      technicalMessage,
      originalError: error,
      context,
      stack: error.stack,
      code: error.code,
      status: error.status || error.statusCode
    };
  }

  /**
   * Log error for debugging and monitoring
   */
  logError(errorInfo) {
    // Add to local log
    this.errorLog.unshift(errorInfo);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console logging based on severity
    const logMessage = `[${errorInfo.severity.toUpperCase()}] ${errorInfo.type}: ${errorInfo.technicalMessage}`;
    
    switch (errorInfo.severity) {
      case ERROR_SEVERITY.CRITICAL:
        console.error(logMessage, errorInfo);
        break;
      case ERROR_SEVERITY.HIGH:
        console.error(logMessage, errorInfo);
        break;
      case ERROR_SEVERITY.MEDIUM:
        console.warn(logMessage, errorInfo);
        break;
      case ERROR_SEVERITY.LOW:
        console.log(logMessage, errorInfo);
        break;
    }

    // In production, you might want to send errors to a monitoring service
    // this.sendToMonitoringService(errorInfo);
  }

  /**
   * Show user-friendly alert
   */
  showUserFriendlyAlert(errorInfo, options = {}) {
    const {
      title = 'Error',
      showRetry = false,
      onRetry = null,
      showContactSupport = false
    } = options;

    const buttons = [
      { text: 'OK', style: 'default' }
    ];

    if (showRetry && onRetry) {
      buttons.unshift({
        text: 'Retry',
        onPress: onRetry,
        style: 'default'
      });
    }

    if (showContactSupport) {
      buttons.push({
        text: 'Contact Support',
        onPress: () => this.contactSupport(errorInfo),
        style: 'default'
      });
    }

    Alert.alert(title, errorInfo.userMessage, buttons);
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      bySeverity: {},
      recent: this.errorLog.slice(0, 10)
    };

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Contact support with error information
   */
  contactSupport(errorInfo) {
    // In a real app, this would open support contact or email
    console.log('Contacting support with error:', errorInfo);
    
    Alert.alert(
      'Contact Support',
      'Error information has been prepared for support. Please contact us with error ID: ' + errorInfo.id,
      [{ text: 'OK' }]
    );
  }

  /**
   * Create retry wrapper for async operations
   */
  async withRetry(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError;
  }

  /**
   * Create timeout wrapper for async operations
   */
  async withTimeout(operation, timeoutMs = 10000) {
    return Promise.race([
      operation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ]);
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Convenience functions
export const handleError = (error, context, options) => 
  errorHandler.handleError(error, context, options);

export const withRetry = (operation, maxRetries, delay) => 
  errorHandler.withRetry(operation, maxRetries, delay);

export const withTimeout = (operation, timeoutMs) => 
  errorHandler.withTimeout(operation, timeoutMs);

export default errorHandler;
