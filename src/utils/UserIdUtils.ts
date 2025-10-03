/**
 * Utility functions for consistent user ID handling across the app
 * Ensures all fallback user IDs follow the new CUSTOMER-/MECHANIC- format
 */

import { MOCK_CONSTANTS } from '../services/MockServiceManager';

/**
 * Get a fallback customer ID in the new format
 * @returns A properly formatted customer ID
 */
export const getFallbackCustomerId = (): string => {
  return MOCK_CONSTANTS.USERS.CUSTOMER.id;
};

/**
 * Get a fallback mechanic ID in the new format
 * @returns A properly formatted mechanic ID
 */
export const getFallbackMechanicId = (): string => {
  return MOCK_CONSTANTS.USERS.MECHANIC.id;
};

/**
 * Get a fallback user ID based on user type
 * @param userType - The type of user ('customer' | 'mechanic')
 * @returns A properly formatted user ID
 */
export const getFallbackUserId = (userType: 'customer' | 'mechanic'): string => {
  return userType === 'customer' 
    ? getFallbackCustomerId() 
    : getFallbackMechanicId();
};

/**
 * Get a fallback user ID with automatic type detection
 * @param currentUserId - The current user's ID (if available)
 * @param userType - The user type (if available)
 * @returns A properly formatted fallback user ID
 */
export const getFallbackUserIdWithTypeDetection = (
  currentUserId?: string | null,
  userType?: 'customer' | 'mechanic' | null
): string => {
  // If we have a current user ID, use it
  if (currentUserId) {
    return currentUserId;
  }
  
  // If we have user type, use appropriate fallback
  if (userType) {
    return getFallbackUserId(userType);
  }
  
  // Default to customer fallback
  return getFallbackCustomerId();
};

/**
 * Validate if a user ID follows the new format
 * @param userId - The user ID to validate
 * @returns True if the ID follows the new format
 */
export const isValidUserIdFormat = (userId: string): boolean => {
  return userId.startsWith('CUSTOMER-') || userId.startsWith('MECHANIC-');
};

/**
 * Get user type from user ID
 * @param userId - The user ID
 * @returns The user type or null if invalid
 */
export const getUserTypeFromId = (userId: string): 'customer' | 'mechanic' | null => {
  if (userId.startsWith('CUSTOMER-')) {
    return 'customer';
  }
  if (userId.startsWith('MECHANIC-')) {
    return 'mechanic';
  }
  return null;
};
