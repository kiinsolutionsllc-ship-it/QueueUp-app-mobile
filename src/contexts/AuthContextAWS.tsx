import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import MechanicAvailabilityService from '../services/MechanicAvailabilityService';
import { AWSCognitoService } from '../services/AWSCognitoService';
import { initializeAWS } from '../config/awsConfig';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';

export interface User {
  id: string;
  displayId?: string; // User-friendly display ID (e.g., "CUST-001", "MECH-001")
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  user_type: 'customer' | 'mechanic';
  role: 'customer' | 'mechanic'; // Alias for user_type for compatibility
  mechanic_type?: 'mobile' | 'shop'; // For mechanics: mobile or shop
  created_at: string;
  updated_at: string;
  profile_completed?: boolean;
  subscription_tier?: 'free' | 'professional' | 'enterprise';
  stripe_customer_id?: string;
  is_verified?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  homeAddress?: {
    latitude: number;
    longitude: number;
    address: string;
    nickname?: string;
  };
  savedLocations?: any[]; // Will be properly typed later
  // Additional properties for mechanics
  bio?: string;
  specialties?: string[];
  experience?: number;
  certifications?: any[]; // Will be properly typed later
  // AWS Cognito specific
  cognitoUserId?: string;
  cognitoAttributes?: any;
}

export interface WorkingHours {
  day: string;
  start: string;
  end: string;
  enabled: boolean;
}

export interface AuthContextType {
  user: User | null;
  userType: 'customer' | 'mechanic' | null;
  loading: boolean;
  availabilityStatus: 'available' | 'busy' | 'offline' | 'break';
  workingHours: WorkingHours[];
  signIn: (email: string, password: string, userType: 'customer' | 'mechanic') => Promise<{ success: boolean; error?: string }>;
  signUp: (userData: Partial<User>, password: string) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean; message?: string }>;
  login: (email: string, password: string, userType: 'customer' | 'mechanic') => Promise<{ success: boolean; error?: string }>; // Alias for signIn
  register: (userData: Partial<User>, password: string) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean; message?: string }>; // Alias for signUp
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  updateUser: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>; // Alias for updateUser
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateAvailabilityStatus: (status: 'available' | 'busy' | 'offline') => Promise<void>;
  updateWorkingHours: (hours: WorkingHours[]) => Promise<void>;
  checkAuthState: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  checkEmailConfirmationStatus: () => Promise<{ confirmed: boolean; error?: string }>;
  confirmSignUp: (email: string, confirmationCode: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, confirmationCode: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'customer' | 'mechanic' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'busy' | 'offline' | 'break'>('available');
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
    { day: 'Monday', start: '08:00', end: '17:00', enabled: true },
    { day: 'Tuesday', start: '08:00', end: '17:00', enabled: true },
    { day: 'Wednesday', start: '08:00', end: '17:00', enabled: true },
    { day: 'Thursday', start: '08:00', end: '17:00', enabled: true },
    { day: 'Friday', start: '08:00', end: '17:00', enabled: true },
    { day: 'Saturday', start: '09:00', end: '15:00', enabled: false },
    { day: 'Sunday', start: '09:00', end: '15:00', enabled: false },
  ]);

  useEffect(() => {
    // Initialize AWS Amplify
    const initAWS = async () => {
      try {
        const result = initializeAWS();
        if (result.success) {
          console.log('AWS Amplify initialized successfully');
        } else {
          console.error('Failed to initialize AWS Amplify:', result.error);
        }
      } catch (error) {
        console.error('Error initializing AWS Amplify:', error);
      }
    };

    initAWS().then(() => {
      checkAuthState();
    });
  }, []);

  const checkAuthState = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Check if user is authenticated with AWS Cognito
      const isAuthenticated = await AWSCognitoService.isAuthenticated();
      
      if (isAuthenticated) {
        // Get current user from Cognito
        const { success: userSuccess, user: cognitoUser } = await AWSCognitoService.getCurrentUser();
        
        if (userSuccess && cognitoUser) {
          // Get user attributes from Cognito
          const attributes: any = cognitoUser.signInDetails?.loginId ? {} : {};
          
          // Create user object from Cognito attributes
          const userData: User = {
            id: cognitoUser.userId || '',
            email: attributes.email || cognitoUser.signInDetails?.loginId || '',
            name: attributes.name || attributes.email?.split('@')[0] || 'User',
            phone: attributes.phone_number || '',
            avatar: attributes.picture || '',
            user_type: 'customer', // Default to customer, can be changed later
            role: 'customer', // Default to customer, can be changed later
            profile_completed: false,
            subscription_tier: 'free',
            is_verified: attributes.email_verified === 'true',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            cognitoUserId: cognitoUser.username || '',
            cognitoAttributes: attributes,
          };

          // Parse location if available
          if (attributes['custom:location']) {
            try {
              userData.location = JSON.parse(attributes['custom:location']);
            } catch (error) {
              console.warn('Failed to parse location from Cognito attributes:', error);
            }
          }

          setUser(userData);
          setUserType(userData.user_type);

          // Load availability data for mechanics
          if (userData.user_type === 'mechanic') {
            try {
              const availabilityResult = await MechanicAvailabilityService.getAvailabilityStatus(userData.id);
              if (availabilityResult.success && availabilityResult.data) {
                setAvailabilityStatus(availabilityResult.data.status);
              }

              const workingHoursResult = await MechanicAvailabilityService.getWorkingHours(userData.id);
              if (workingHoursResult.success && workingHoursResult.data) {
                setWorkingHours(workingHoursResult.data);
              }
            } catch (error) {
              console.warn('Failed to load availability data:', error);
            }
          }

          // User data is now managed in memory only
        }
      } else {
        // No stored user data - user needs to sign in
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (
    email: string, 
    password: string, 
    userType: 'customer' | 'mechanic'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const result = await AWSCognitoService.signIn(email, password);
      
      if (result.success && result.user && result.session) {
        // Get user attributes from Cognito
        const attributes: any = result.user.signInDetails?.loginId ? {} : {};
        
        // Create user object
        const userData: User = {
            id: attributes['custom:user_id'] || result.user.username || '',
            email: attributes.email || result.user.username || '',
          name: attributes.name || attributes.email?.split('@')[0] || 'User',
          phone: attributes['custom:phone'] || attributes.phone_number,
          avatar: attributes['custom:avatar'] || attributes.picture,
          user_type: (attributes['custom:user_type'] as 'customer' | 'mechanic') || userType,
          role: (attributes['custom:user_type'] as 'customer' | 'mechanic') || userType,
          profile_completed: attributes['custom:profile_completed'] === 'true',
          subscription_tier: (attributes['custom:subscription_tier'] as 'free' | 'professional' | 'enterprise') || 'free',
          is_verified: attributes.email_verified === 'true',
          created_at: attributes.created_at || new Date().toISOString(),
          updated_at: attributes.updated_at || new Date().toISOString(),
            cognitoUserId: result.user.username || '',
          cognitoAttributes: attributes,
        };

        // Parse location if available
        if (attributes['custom:location']) {
          try {
            userData.location = JSON.parse(attributes['custom:location']);
          } catch (error) {
            console.warn('Failed to parse location from Cognito attributes:', error);
          }
        }

        setUser(userData);
        setUserType(userData.user_type);

        // User data is now managed in memory only
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Sign in failed' 
        };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    userData: Partial<User>, 
    password: string
  ): Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean; message?: string }> => {
    try {
      setLoading(true);
      
      const userType = userData.user_type || 'customer';
      const email = userData.email || '';
      
      if (!email || !password) {
        return { 
          success: false, 
          error: 'Email and password are required' 
        };
      }

      // Generate a unique user ID
      const userId = userType === 'customer' 
        ? uniqueIdGenerator.generateCustomerId()
        : uniqueIdGenerator.generateMechanicId();

      const cognitoUserData = {
        email,
        name: userData.name || email.split('@')[0],
        user_type: userType,
        phone: userData.phone,
        avatar: userData.avatar,
        location: userData.location,
      };

      const result = await AWSCognitoService.signUp(email, password, cognitoUserData);
      
      if (result.success) {
        if (result.requiresEmailConfirmation) {
          // Store pending user data for after email confirmation
          const pendingUser = {
            email,
            name: userData.name || '',
            user_type: userType,
            phone: userData.phone,
            avatar: userData.avatar,
            location: userData.location,
            id: userId,
            created_at: new Date().toISOString(),
          };
          
          // Pending user data is now managed in memory only
        }
        
        return {
          success: true,
          requiresEmailConfirmation: result.requiresEmailConfirmation,
          message: result.message
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to create account'
        };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Sign out from AWS Cognito
      await AWSCognitoService.signOut();
      
      // Clear all user-specific data (now managed in memory only)
      
      setUser(null);
      setUserType(null);
      setAvailabilityStatus('available');
      setWorkingHours([
        { day: 'Monday', start: '08:00', end: '17:00', enabled: true },
        { day: 'Tuesday', start: '08:00', end: '17:00', enabled: true },
        { day: 'Wednesday', start: '08:00', end: '17:00', enabled: true },
        { day: 'Thursday', start: '08:00', end: '17:00', enabled: true },
        { day: 'Friday', start: '08:00', end: '17:00', enabled: true },
        { day: 'Saturday', start: '09:00', end: '15:00', enabled: false },
        { day: 'Sunday', start: '09:00', end: '15:00', enabled: false },
      ]);
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      const updatedUser: User = {
        ...user,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Update failed' 
      };
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    return updateUser(updates);
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      // In a real implementation, you would use AWS Cognito's changePassword method
      // For now, we'll simulate the password update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser: User = {
        ...user,
        updated_at: new Date().toISOString(),
      };

      setUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password update failed' 
      };
    }
  };

  const updateAvailabilityStatus = async (status: 'available' | 'busy' | 'offline'): Promise<void> => {
    try {
      setAvailabilityStatus(status);
      
      if (user?.user_type === 'mechanic' && user?.id) {
        const result = await MechanicAvailabilityService.updateAvailabilityStatus(user.id, status);
        if (!result.success) {
          console.warn('Failed to sync availability status with backend:', result.error);
        }
      } else {
        // Availability status is now managed in memory only
      }
    } catch (error) {
      console.error('Update availability status error:', error);
      setAvailabilityStatus(availabilityStatus);
    }
  };

  const updateWorkingHours = async (hours: WorkingHours[]): Promise<void> => {
    try {
      setWorkingHours(hours);
      
      if (user?.user_type === 'mechanic' && user?.id) {
        const result = await MechanicAvailabilityService.updateWorkingHours(user.id, hours);
        if (!result.success) {
          console.warn('Failed to sync working hours with backend:', result.error);
        }
      } else {
        // Working hours are now managed in memory only
      }
    } catch (error) {
      console.error('Update working hours error:', error);
      setWorkingHours(workingHours);
    }
  };

  const resendConfirmationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await AWSCognitoService.resendConfirmationEmail(email);
      return result;
    } catch (error) {
      console.error('Resend confirmation email error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to resend confirmation email' 
      };
    }
  };

  const checkEmailConfirmationStatus = async (): Promise<{ confirmed: boolean; error?: string }> => {
    try {
      if (!user) {
        return { confirmed: false, error: 'No user logged in' };
      }
      
      const { success, user: cognitoUser } = await AWSCognitoService.getCurrentUser();
      
      if (success && cognitoUser) {
        const attributes: any = cognitoUser.signInDetails?.loginId ? {} : {};
        const confirmed = attributes.email_verified === 'true';
        return { confirmed };
      }
      
      return { confirmed: false, error: 'Failed to check confirmation status' };
    } catch (error) {
      console.error('Check email confirmation status error:', error);
      return { 
        confirmed: false, 
        error: error instanceof Error ? error.message : 'Failed to check email confirmation status' 
      };
    }
  };

  const confirmSignUp = async (email: string, confirmationCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await AWSCognitoService.confirmSignUp(email, confirmationCode);
      
      if (result.success) {
        // User data is now managed in memory only
        // Note: Pending user data would need to be handled differently without AsyncStorage
      }
      
      return result;
    } catch (error) {
      console.error('Confirm signup error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to confirm account' 
      };
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await AWSCognitoService.forgotPassword(email);
      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send reset code' 
      };
    }
  };

  const resetPassword = async (email: string, confirmationCode: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await AWSCognitoService.resetPassword(email, confirmationCode, newPassword);
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reset password' 
      };
    }
  };

  const value: AuthContextType = {
    user,
    userType,
    loading,
    availabilityStatus,
    workingHours,
    signIn,
    signUp,
    login: signIn, // Alias for signIn
    register: signUp, // Alias for signUp
    signOut,
    logout: signOut, // Alias for signOut
    updateUser,
    updateProfile,
    updatePassword,
    updateAvailabilityStatus,
    updateWorkingHours,
    checkAuthState,
    resendConfirmationEmail,
    checkEmailConfirmationStatus,
    confirmSignUp,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
