import { signIn, signUp, signOut, getCurrentUser, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword, AuthUser } from 'aws-amplify/auth';
import Constants from 'expo-constants';

export interface CognitoUserData {
  email: string;
  name?: string;
  user_type: 'customer' | 'mechanic';
  phone?: string;
  avatar?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface SignUpResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  user?: AuthUser;
  message?: string;
}

export interface SignInResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  session?: any;
}

export interface ResendConfirmationResult {
  success: boolean;
  error?: string;
}

export class AWSCognitoService {
  /**
   * Check if AWS Cognito is configured
   */
  private static isConfigured(): boolean {
    const userPoolId = Constants.expoConfig?.extra?.aws?.userPoolId || process.env.EXPO_PUBLIC_AWS_USER_POOL_ID;
    const userPoolClientId = Constants.expoConfig?.extra?.aws?.userPoolClientId || process.env.EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID;
    
    return userPoolId && userPoolClientId && 
      userPoolId !== '' && userPoolClientId !== '' &&
      !userPoolId.includes('XXXXXXXXX') && !userPoolClientId.includes('your_cognito');
  }

  /**
   * Sign up a new user with AWS Cognito
   */
  static async signUp(
    email: string, 
    password: string, 
    userData: CognitoUserData
  ): Promise<SignUpResult> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'AWS Cognito is not configured. Please set up your AWS Cognito User Pool credentials in the .env file.'
        };
      }

      console.log('AWS Cognito: Starting signup for:', email);
      
      const attributes = {
        email: email,
        name: userData.name || email.split('@')[0],
        // Note: Custom attributes need to be defined in AWS Cognito User Pool first
        // For now, we'll store user_type in the username or use standard attributes
      };

      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: attributes,
        },
      });

      console.log('AWS Cognito: Signup successful:', result.userId);

      // Check if email confirmation is required
      const requiresEmailConfirmation = !result.isSignUpComplete;

      return {
        success: true,
        requiresEmailConfirmation,
        user: result as any,
        message: requiresEmailConfirmation 
          ? 'Please check your email and click the confirmation link to complete your registration.'
          : 'Account created successfully!'
      };

    } catch (error: any) {
      console.error('AWS Cognito: Signup error:', error);
      console.error('Error details:', {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'UsernameExistsException') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'InvalidPasswordException') {
        errorMessage = 'Password does not meet requirements';
      } else if (error.code === 'InvalidParameterException') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'TooManyRequestsException') {
        errorMessage = 'Too many signup attempts. Please try again later';
      } else if (error.code === 'LimitExceededException') {
        errorMessage = 'Signup limit exceeded. Please try again later';
      } else if (error.name === 'Unknown') {
        errorMessage = `Unknown error: ${error.message || 'Please check your AWS Cognito configuration'}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
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
          error: 'AWS Cognito is not configured. Please set up your AWS Cognito User Pool credentials in the .env file.'
        };
      }

      console.log('AWS Cognito: Starting signin for:', email);
      console.log('AWS Cognito: Configuration check:', {
        userPoolId: (Constants.expoConfig?.extra?.aws?.userPoolId || process.env.EXPO_PUBLIC_AWS_USER_POOL_ID) ? 'Set' : 'Missing',
        userPoolClientId: (Constants.expoConfig?.extra?.aws?.userPoolClientId || process.env.EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID) ? 'Set' : 'Missing',
        region: Constants.expoConfig?.extra?.aws?.region || process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-2'
      });
      
      const result = await signIn({ username: email, password });
      
      if (result.isSignedIn) {
        const session = await getCurrentUser();
        
        console.log('AWS Cognito: Signin successful');
        
        return {
          success: true,
          user: result as any,
          session: result
        };
      }

      return {
        success: false,
        error: 'Sign in failed - user not signed in'
      };

    } catch (error: any) {
      console.error('AWS Cognito: Signin error:', error);
      console.error('Error details:', {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      let errorMessage = 'Sign in failed';
      
      if (error.code === 'NotAuthorizedException') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'UserNotConfirmedException') {
        errorMessage = 'Please confirm your email address before signing in';
      } else if (error.code === 'UserNotFoundException') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'InvalidParameterException') {
        errorMessage = 'Invalid email or password format';
      } else if (error.code === 'TooManyRequestsException') {
        errorMessage = 'Too many sign-in attempts. Please try again later';
      } else if (error.code === 'LimitExceededException') {
        errorMessage = 'Sign-in limit exceeded. Please try again later';
      } else if (error.code === 'InvalidUserPoolConfigurationException') {
        errorMessage = 'AWS Cognito configuration error. Please check your User Pool settings.';
      } else if (error.code === 'NetworkError') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.name === 'Unknown') {
        errorMessage = `Unknown error: ${error.message || 'Please check your AWS Cognito configuration'}`;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut();
      console.log('AWS Cognito: Signout successful');
      return { success: true };
    } catch (error: any) {
      console.error('AWS Cognito: Signout error:', error);
      return { 
        success: false, 
        error: error.message || 'Sign out failed' 
      };
    }
  }

  /**
   * Resend confirmation email
   */
  static async resendConfirmationEmail(email: string): Promise<ResendConfirmationResult> {
    try {
      console.log('AWS Cognito: Resending confirmation email for:', email);
      
      await resendSignUpCode({ username: email });
      
      console.log('AWS Cognito: Confirmation email resent successfully');
      
      return { success: true };
    } catch (error: any) {
      console.error('AWS Cognito: Resend confirmation error:', error);
      
      let errorMessage = 'Failed to resend confirmation email';
      
      if (error.code === 'UserNotFoundException') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'InvalidParameterException') {
        errorMessage = 'Invalid email format';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Confirm user account with verification code
   */
  static async confirmSignUp(
    email: string, 
    confirmationCode: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('AWS Cognito: Confirming signup for:', email);
      
      await confirmSignUp({ username: email, confirmationCode });
      
      console.log('AWS Cognito: Account confirmed successfully');
      
      return { success: true };
    } catch (error: any) {
      console.error('AWS Cognito: Confirm signup error:', error);
      
      let errorMessage = 'Failed to confirm account';
      
      if (error.code === 'CodeMismatchException') {
        errorMessage = 'Invalid confirmation code';
      } else if (error.code === 'ExpiredCodeException') {
        errorMessage = 'Confirmation code has expired';
      } else if (error.code === 'UserNotFoundException') {
        errorMessage = 'No account found with this email';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const user = await getCurrentUser();
      return { success: true, user };
    } catch (error: any) {
      console.error('AWS Cognito: Get current user error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to get current user' 
      };
    }
  }

  /**
   * Get current session
   */
  static async getCurrentSession(): Promise<{ success: boolean; session?: any; error?: string }> {
    try {
      const session = await getCurrentUser();
      return { success: true, session };
    } catch (error: any) {
      console.error('AWS Cognito: Get current session error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to get current session' 
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Forgot password - send reset code
   */
  static async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('AWS Cognito: Sending forgot password code for:', email);
      
      await resetPassword({ username: email });
      
      console.log('AWS Cognito: Forgot password code sent successfully');
      
      return { success: true };
    } catch (error: any) {
      console.error('AWS Cognito: Forgot password error:', error);
      
      let errorMessage = 'Failed to send reset code';
      
      if (error.code === 'UserNotFoundException') {
        errorMessage = 'No account found with this email';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Reset password with confirmation code
   */
  static async resetPassword(
    email: string, 
    confirmationCode: string, 
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('AWS Cognito: Resetting password for:', email);
      
      await confirmResetPassword({ username: email, confirmationCode, newPassword });
      
      console.log('AWS Cognito: Password reset successfully');
      
      return { success: true };
    } catch (error: any) {
      console.error('AWS Cognito: Reset password error:', error);
      
      let errorMessage = 'Failed to reset password';
      
      if (error.code === 'CodeMismatchException') {
        errorMessage = 'Invalid reset code';
      } else if (error.code === 'ExpiredCodeException') {
        errorMessage = 'Reset code has expired';
      } else if (error.code === 'InvalidPasswordException') {
        errorMessage = 'New password does not meet requirements';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

export default AWSCognitoService;
