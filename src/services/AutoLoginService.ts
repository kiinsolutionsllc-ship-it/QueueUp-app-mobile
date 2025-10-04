/**
 * Auto Login Service
 * 
 * Handles automatic login using saved credentials when the app starts
 */

import { SecureStorageService } from './SecureStorageService';
import { SupabaseAuthService } from './SupabaseAuthService';

export interface AutoLoginResult {
  success: boolean;
  user?: any;
  userType?: 'customer' | 'mechanic';
  error?: string;
  requiresManualLogin?: boolean;
}

export class AutoLoginService {
  /**
   * Attempt to automatically log in using saved credentials
   */
  static async attemptAutoLogin(): Promise<AutoLoginResult> {
    try {
      console.log('AutoLoginService: Attempting auto-login...');
      
      // First check if there's already a valid Supabase session
      const isAuthenticated = await SupabaseAuthService.isAuthenticated();
      if (isAuthenticated) {
        console.log('AutoLoginService: Valid Supabase session found');
        const { success, user } = await SupabaseAuthService.getCurrentUser();
        if (success && user) {
          return {
            success: true,
            user,
            userType: user.user_type
          };
        }
      }

      // If no valid session, try saved credentials
      const credentialsResult = await SecureStorageService.getSavedCredentials();
      if (!credentialsResult.success || !credentialsResult.credentials) {
        console.log('AutoLoginService: No saved credentials found');
        return {
          success: false,
          requiresManualLogin: true,
          error: 'No saved credentials'
        };
      }

      const { email, password, userType } = credentialsResult.credentials;
      console.log('AutoLoginService: Found saved credentials, attempting login...');

      // Attempt to sign in with saved credentials
      const signInResult = await SupabaseAuthService.signIn(email, password, userType);
      if (signInResult.success && signInResult.user) {
        console.log('AutoLoginService: Auto-login successful');
        return {
          success: true,
          user: signInResult.user,
          userType: userType
        };
      } else {
        console.log('AutoLoginService: Auto-login failed, clearing invalid credentials');
        // Clear invalid credentials
        await SecureStorageService.clearSavedCredentials();
        return {
          success: false,
          requiresManualLogin: true,
          error: signInResult.error || 'Invalid saved credentials'
        };
      }
    } catch (error) {
      console.error('AutoLoginService: Error during auto-login:', error);
      return {
        success: false,
        requiresManualLogin: true,
        error: error instanceof Error ? error.message : 'Auto-login failed'
      };
    }
  }

  /**
   * Check if auto-login should be attempted
   */
  static async shouldAttemptAutoLogin(): Promise<boolean> {
    try {
      // Check if there's a valid Supabase session first
      const isAuthenticated = await SupabaseAuthService.isAuthenticated();
      if (isAuthenticated) {
        return true; // Always try to restore existing session
      }

      // Check if there are saved credentials
      const credentialsResult = await SecureStorageService.getSavedCredentials();
      return credentialsResult.success && !!credentialsResult.credentials;
    } catch (error) {
      console.error('AutoLoginService: Error checking if should attempt auto-login:', error);
      return false;
    }
  }

  /**
   * Clear auto-login data (useful for logout)
   */
  static async clearAutoLoginData(): Promise<void> {
    try {
      await SecureStorageService.clearSavedCredentials();
      console.log('AutoLoginService: Cleared auto-login data');
    } catch (error) {
      console.error('AutoLoginService: Error clearing auto-login data:', error);
    }
  }
}
