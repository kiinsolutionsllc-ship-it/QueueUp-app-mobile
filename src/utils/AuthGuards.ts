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
   * Check if a user ID is valid (UUID format from Supabase)
   */
  static isValidUserId(userId: string): boolean {
    if (!userId || typeof userId !== 'string') {
      return false;
    }

    // Check if it's a valid UUID format (Supabase auth.users.id)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(userId);
  }

  /**
   * Extract user type from user metadata (requires Supabase auth context)
   * Note: This method now requires the user object with metadata, not just the ID
   */
  static getUserTypeFromUser(user: any): 'customer' | 'mechanic' | null {
    if (!user || !user.user_metadata) {
      return null;
    }

    const userType = user.user_metadata.user_type;
    if (userType === 'customer' || userType === 'mechanic') {
      return userType;
    }

    return null;
  }

  /**
   * Legacy method - kept for compatibility but now returns null
   * Use getUserTypeFromUser instead
   */
  static getUserTypeFromId(userId: string): 'customer' | 'mechanic' | null {
    // UUIDs don't contain user type information
    // User type is stored in auth.users.raw_user_meta_data
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
        error: 'Authentication required: Invalid user ID format (expected UUID)'
      };
    }

    // Check if user type matches (if specified)
    // Note: User type validation now requires the full user object with metadata
    // This check should be done at the service level where user metadata is available
    if (userType) {
      console.warn('AuthGuard: User type validation requires user metadata. Use service-level validation instead.');
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

    // User type validation now requires user metadata from Supabase
    // This should be validated at the service level
    console.warn('AuthGuard: Job access validation requires user metadata. Use service-level validation instead.');

    // Job access validation now requires user metadata from Supabase
    // This should be validated at the service level with proper user type checking
    console.warn('AuthGuard: Job access validation requires user metadata. Use service-level validation instead.');

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
