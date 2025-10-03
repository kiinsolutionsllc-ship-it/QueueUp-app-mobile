import { supabase } from '../config/supabaseConfig';
import { User } from '../contexts/AuthContextSupabase';

export interface SignUpResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  message?: string;
  user?: User;
}

export interface SignInResult {
  success: boolean;
  error?: string;
  user?: User;
  session?: any;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    phone?: string;
    user_type?: 'customer' | 'mechanic';
    avatar?: string;
    location?: any;
  };
  app_metadata: any;
  aud: string;
  created_at: string;
}

export class SupabaseAuthService {
  /**
   * Check if Supabase is configured
   */
  private static isConfigured(): boolean {
    return supabase !== null;
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        console.warn('Supabase not configured - using mock authentication');
        return false;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking authentication:', error);
        return false;
      }

      return !!session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Supabase not configured'
        };
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (!user) {
        return {
          success: false,
          error: 'No user found'
        };
      }

      // Convert Supabase user to our User format
      const appUser: User = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        phone: user.user_metadata?.phone || '',
        avatar: user.user_metadata?.avatar || '',
        user_type: user.user_metadata?.user_type || 'customer',
        role: user.user_metadata?.user_type || 'customer',
        profile_completed: false,
        subscription_tier: 'free',
        is_verified: user.email_confirmed_at ? true : false,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
        location: user.user_metadata?.location,
        cognitoUserId: user.id, // Keep for compatibility
        cognitoAttributes: user.user_metadata,
      };

      return {
        success: true,
        user: appUser
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Sign up a new user
   */
  static async signUp(
    email: string, 
    password: string, 
    userData: Partial<User>
  ): Promise<SignUpResult> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Supabase not configured. Please set up your Supabase credentials in the .env file.'
        };
      }

      console.log('Supabase Auth: Starting signup for:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || email.split('@')[0],
            user_type: userData.user_type || 'customer',
            phone: userData.phone,
            avatar: userData.avatar,
            location: userData.location,
          }
        }
      });

      if (error) {
        console.error('Supabase signup error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      if (data.user) {
        const appUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: userData.name || email.split('@')[0],
          phone: userData.phone || '',
          avatar: userData.avatar || '',
          user_type: userData.user_type || 'customer',
          role: userData.user_type || 'customer',
          profile_completed: false,
          subscription_tier: 'free',
          is_verified: false,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at,
          location: userData.location,
          cognitoUserId: data.user.id,
          cognitoAttributes: data.user.user_metadata,
        };

        return {
          success: true,
          requiresEmailConfirmation: !data.user.email_confirmed_at,
          message: data.user.email_confirmed_at 
            ? 'Account created successfully' 
            : 'Please check your email for a verification code to confirm your account',
          user: appUser
        };
      }

      return {
        success: false,
        error: 'Failed to create account'
      };
    } catch (error) {
      console.error('Supabase signup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed'
      };
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Supabase not configured. Please set up your Supabase credentials in the .env file.'
        };
      }

      console.log('Supabase Auth: Starting signin for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase signin error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      if (data.user && data.session) {
        const appUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          phone: data.user.user_metadata?.phone || '',
          avatar: data.user.user_metadata?.avatar || '',
          user_type: data.user.user_metadata?.user_type || 'customer',
          role: data.user.user_metadata?.user_type || 'customer',
          profile_completed: false,
          subscription_tier: 'free',
          is_verified: data.user.email_confirmed_at ? true : false,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at,
          location: data.user.user_metadata?.location,
          cognitoUserId: data.user.id,
          cognitoAttributes: data.user.user_metadata,
        };

        return {
          success: true,
          user: appUser,
          session: data.session
        };
      }

      return {
        success: false,
        error: 'Sign in failed'
      };
    } catch (error) {
      console.error('Supabase signin error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: true,
          error: 'Supabase not configured - already signed out'
        };
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signout error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Supabase signout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      };
    }
  }

  /**
   * Resend verification code
   */
  static async resendConfirmationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Supabase not configured'
        };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Resend verification code error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resend verification code'
      };
    }
  }

  /**
   * Confirm sign up with email code
   */
  static async confirmSignUp(email: string, token: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Supabase not configured'
        };
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Confirm signup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm account'
      };
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Supabase not configured'
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reset email'
      };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string, token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Supabase not configured'
        };
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery'
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        return {
          success: false,
          error: updateError.message
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset password'
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Supabase not configured'
        };
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          phone: updates.phone,
          user_type: updates.user_type,
          avatar: updates.avatar,
          location: updates.location,
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      };
    }
  }
}

