/**
 * Utility functions for UUID handling across the app
 * Replaces UserIdUtils - now works with Supabase UUIDs instead of custom IDs
 */

/**
 * Validate if a string is a valid UUID format
 * @param uuid - The string to validate
 * @returns True if the string is a valid UUID
 */
export const isValidUuid = (uuid: string): boolean => {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Get user type from Supabase user metadata
 * @param user - The Supabase user object with metadata
 * @returns The user type or null if invalid
 */
export const getUserTypeFromMetadata = (user: any): 'customer' | 'mechanic' | null => {
  if (!user || !user.user_metadata) {
    return null;
  }
  
  const userType = user.user_metadata.user_type;
  if (userType === 'customer' || userType === 'mechanic') {
    return userType;
  }
  
  return null;
};

/**
 * Validate user access based on expected user type
 * @param user - The Supabase user object
 * @param expectedType - The expected user type
 * @returns True if user type matches expected type
 */
export const validateUserType = (user: any, expectedType: 'customer' | 'mechanic'): boolean => {
  const actualType = getUserTypeFromMetadata(user);
  return actualType === expectedType;
};

/**
 * Create a user-friendly display ID from UUID
 * @param uuid - The UUID to convert
 * @param userType - The user type for prefix
 * @returns A user-friendly display ID
 */
export const createDisplayId = (uuid: string, userType: 'customer' | 'mechanic'): string => {
  if (!isValidUuid(uuid)) {
    return 'INVALID-ID';
  }
  
  // Take first 8 characters of UUID and add type prefix
  const shortId = uuid.substring(0, 8).toUpperCase();
  const prefix = userType === 'customer' ? 'CUST' : 'MECH';
  
  return `${prefix}-${shortId}`;
};

/**
 * Sanitize user data for display (remove sensitive information)
 * @param user - The user object to sanitize
 * @returns Sanitized user object
 */
export const sanitizeUserForDisplay = (user: any): any => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    user_type: user.user_type,
    avatar: user.avatar,
    created_at: user.created_at,
    // Remove sensitive fields
    // password, stripe_customer_id, etc. are not included
  };
};

/**
 * Check if a user has permission to access a resource
 * @param user - The user object
 * @param resourceOwnerId - The ID of the resource owner
 * @returns True if user can access the resource
 */
export const canAccessResource = (user: any, resourceOwnerId: string): boolean => {
  if (!user || !user.id || !resourceOwnerId) {
    return false;
  }
  
  return user.id === resourceOwnerId;
};

/**
 * Format UUID for display (shows first 8 characters)
 * @param uuid - The UUID to format
 * @returns Formatted UUID string
 */
export const formatUuidForDisplay = (uuid: string): string => {
  if (!isValidUuid(uuid)) {
    return 'Invalid ID';
  }
  
  return `${uuid.substring(0, 8)}...`;
};

/**
 * Legacy function - kept for compatibility but now returns null
 * @deprecated Use getUserTypeFromMetadata instead
 */
export const getUserTypeFromId = (userId: string): 'customer' | 'mechanic' | null => {
  console.warn('getUserTypeFromId is deprecated. Use getUserTypeFromMetadata instead.');
  return null;
};

/**
 * Legacy function - kept for compatibility but now returns false
 * @deprecated Use isValidUuid instead
 */
export const isValidUserIdFormat = (userId: string): boolean => {
  console.warn('isValidUserIdFormat is deprecated. Use isValidUuid instead.');
  return isValidUuid(userId);
};
