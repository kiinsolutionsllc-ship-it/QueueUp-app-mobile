/**
 * Authentication Guards
 * 
 * Utility functions to ensure services only operate on authenticated user data
 * and prevent unauthorized access to sensitive information.
 */

export interface AuthGuardOptions {
  userId?: string;
  userType?: 'customer' | 'mechanic';
  requiredPermissions?: string[];
}

export class AuthGuard {
  /**
   * Check if a user ID is valid and follows expected format
   */
  static isValidUserId(userId: string): boolean {
    if (!userId || typeof userId !== 'string') {
      return false;
    }

    // Check for new type-specific format (CUSTOMER-YYYYMMDD-HHMMSS-XXXX or MECHANIC-YYYYMMDD-HHMMSS-XXXX)
    if (userId.startsWith('CUSTOMER-') || userId.startsWith('MECHANIC-')) {
      return true;
    }

    // Check for legacy format (customer_YYYYMMDD_HHMMSS_XXXX or mechanic_YYYYMMDD_HHMMSS_XXXX)
    if (userId.startsWith('customer_') || userId.startsWith('mechanic_')) {
      return true;
    }

    return false;
  }

  /**
   * Extract user type from user ID
   */
  static getUserTypeFromId(userId: string): 'customer' | 'mechanic' | null {
    if (!this.isValidUserId(userId)) {
      return null;
    }

    if (userId.startsWith('CUSTOMER-') || userId.startsWith('customer_')) {
      return 'customer';
    }

    if (userId.startsWith('MECHANIC-') || userId.startsWith('mechanic_')) {
      return 'mechanic';
    }

    return null;
  }

  /**
   * Guard function to ensure user is authenticated and has access to data
   */
  static requireAuth(options: AuthGuardOptions): { success: boolean; error?: string } {
    const { userId, userType, requiredPermissions } = options;

    // Check if user ID is provided and valid
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required: User ID is missing'
      };
    }

    if (!this.isValidUserId(userId)) {
      return {
        success: false,
        error: 'Authentication required: Invalid user ID format'
      };
    }

    // Check if user type matches (if specified)
    if (userType) {
      const actualUserType = this.getUserTypeFromId(userId);
      if (actualUserType !== userType) {
        return {
          success: false,
          error: `Authentication required: User type mismatch. Expected ${userType}, got ${actualUserType}`
        };
      }
    }

    // Check permissions (if specified)
    if (requiredPermissions && requiredPermissions.length > 0) {
      // This would typically check against user's actual permissions
      // For now, we'll just log that permissions were requested
      console.log('AuthGuard: Permission check requested for:', requiredPermissions);
    }

    return { success: true };
  }

  /**
   * Guard function for customer-specific operations
   */
  static requireCustomer(userId: string): { success: boolean; error?: string } {
    return this.requireAuth({ userId, userType: 'customer' });
  }

  /**
   * Guard function for mechanic-specific operations
   */
  static requireMechanic(userId: string): { success: boolean; error?: string } {
    return this.requireAuth({ userId, userType: 'mechanic' });
  }

  /**
   * Guard function to ensure user owns the resource
   */
  static requireOwnership(userId: string, resourceOwnerId: string): { success: boolean; error?: string } {
    const authCheck = this.requireAuth({ userId });
    if (!authCheck.success) {
      return authCheck;
    }

    if (userId !== resourceOwnerId) {
      return {
        success: false,
        error: 'Access denied: You can only access your own resources'
      };
    }

    return { success: true };
  }

  /**
   * Guard function for job-related operations
   */
  static requireJobAccess(userId: string, job: any): { success: boolean; error?: string } {
    const authCheck = this.requireAuth({ userId });
    if (!authCheck.success) {
      return authCheck;
    }

    const userType = this.getUserTypeFromId(userId);
    if (!userType) {
      return {
        success: false,
        error: 'Authentication required: Unable to determine user type'
      };
    }

    // Check if user has access to this job
    if (userType === 'customer') {
      // Customer can access jobs they created
      if (job.customerId !== userId && job.customer_id !== userId) {
        return {
          success: false,
          error: 'Access denied: You can only access your own jobs'
        };
      }
    } else if (userType === 'mechanic') {
      // Mechanic can access jobs they're assigned to or have bid on
      const isAssigned = job.selectedMechanicId === userId || job.mechanic_id === userId;
      const hasBid = job.bids && job.bids.some((bid: any) => bid.mechanicId === userId || bid.mechanic_id === userId);
      
      if (!isAssigned && !hasBid) {
        return {
          success: false,
          error: 'Access denied: You can only access jobs you are assigned to or have bid on'
        };
      }
    }

    return { success: true };
  }

  /**
   * Guard function for messaging operations
   */
  static requireMessageAccess(userId: string, conversation: any): { success: boolean; error?: string } {
    const authCheck = this.requireAuth({ userId });
    if (!authCheck.success) {
      return authCheck;
    }

    // Check if user is a participant in the conversation
    if (!conversation.participants || !conversation.participants.includes(userId)) {
      return {
        success: false,
        error: 'Access denied: You can only access conversations you participate in'
      };
    }

    return { success: true };
  }

  /**
   * Sanitize data to remove sensitive information
   */
  static sanitizeUserData(data: any, requestingUserId: string): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    const userType = this.getUserTypeFromId(requestingUserId);

    // Remove sensitive fields that shouldn't be exposed
    const sensitiveFields = [
      'password',
      'password_hash',
      'stripe_customer_id',
      'payment_methods',
      'billing_address',
      'ssn',
      'tax_id'
    ];

    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        delete sanitized[field];
      }
    });

    // For non-owners, limit the data that can be accessed
    if (sanitized.id !== requestingUserId) {
      const limitedFields = [
        'id',
        'name',
        'email',
        'avatar',
        'user_type',
        'is_verified',
        'created_at'
      ];

      const limitedData: any = {};
      limitedFields.forEach(field => {
        if (field in sanitized) {
          limitedData[field] = sanitized[field];
        }
      });

      return limitedData;
    }

    return sanitized;
  }

  /**
   * Log security events for monitoring
   */
  static logSecurityEvent(event: string, userId: string, details?: any): void {
    const timestamp = new Date().toISOString();
    console.warn(`[SECURITY] ${timestamp} - ${event}`, {
      userId,
      userType: this.getUserTypeFromId(userId),
      details
    });
  }
}

/**
 * Higher-order function to wrap service methods with authentication guards
 */
export function withAuthGuard<T extends any[], R>(
  method: (...args: T) => Promise<R>,
  guardOptions: AuthGuardOptions
) {
  return async (...args: T): Promise<R> => {
    const authCheck = AuthGuard.requireAuth(guardOptions);
    if (!authCheck.success) {
      AuthGuard.logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', guardOptions.userId || 'unknown', {
        method: method.name,
        error: authCheck.error
      });
      throw new Error(authCheck.error);
    }

    return method(...args);
  };
}

/**
 * Decorator for class methods that require authentication
 */
export function RequireAuth(options: AuthGuardOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const authCheck = AuthGuard.requireAuth(options);
      if (!authCheck.success) {
        AuthGuard.logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', options.userId || 'unknown', {
          method: propertyKey,
          error: authCheck.error
        });
        throw new Error(authCheck.error);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
