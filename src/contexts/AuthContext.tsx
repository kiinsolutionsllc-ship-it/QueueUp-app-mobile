import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';

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
  availabilityStatus: 'available' | 'busy' | 'offline';
  workingHours: WorkingHours[];
  signIn: (email: string, password: string, userType: 'customer' | 'mechanic') => Promise<{ success: boolean; error?: string }>;
  signUp: (userData: Partial<User>, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string, userType: 'customer' | 'mechanic') => Promise<{ success: boolean; error?: string }>; // Alias for signIn
  register: (userData: Partial<User>, password: string) => Promise<{ success: boolean; error?: string }>; // Alias for signUp
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  updateUser: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>; // Alias for updateUser
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateAvailabilityStatus: (status: 'available' | 'busy' | 'offline') => Promise<void>;
  updateWorkingHours: (hours: WorkingHours[]) => Promise<void>;
  checkAuthState: () => Promise<void>;
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
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'busy' | 'offline'>('available');
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
    // Add a flag to force complete reset on next app start
    const forceReset = async () => {
      try {
        const shouldReset = await AsyncStorage.getItem('FORCE_RESET_ALL_DATA');
        if (shouldReset === 'true') {
          console.log('🔄 FORCE RESET: Clearing all data...');
          await AsyncStorage.clear();
          console.log('✅ FORCE RESET: All data cleared!');
          return;
        }
      } catch (error) {
        console.warn('Force reset check failed:', error);
      }
    };
    
    forceReset().then(() => {
      checkAuthState();
    });
  }, []);

  const checkAuthState = async (): Promise<void> => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedUserType = await AsyncStorage.getItem('userType');
      const storedAvailabilityStatus = await AsyncStorage.getItem('availabilityStatus');
      const storedWorkingHours = await AsyncStorage.getItem('workingHours');
      
      if (storedUser && storedUserType) {
        const parsedUser: User = JSON.parse(storedUser);
        
        // Check if user ID needs to be updated to new format or if we need to ensure permanent ID consistency
        if (parsedUser.id && !parsedUser.id.startsWith('CUSTOMER-') && !parsedUser.id.startsWith('MECHANIC-')) {
          console.log('AuthContext: Updating old user ID format:', parsedUser.id);
          const oldId = parsedUser.id;
          
          // Check if we have a permanent ID stored for this email/userType
          const existingUserKey = `user_${parsedUser.email}_${parsedUser.user_type}`;
          const storedPermanentId = await AsyncStorage.getItem(existingUserKey);
          
          let newId;
          if (storedPermanentId) {
            // Use the stored permanent ID
            newId = storedPermanentId;
            console.log(`AuthContext: Found stored permanent ID: ${newId}`);
          } else {
            // Generate new permanent ID and store it
            newId = parsedUser.user_type === 'customer' 
              ? uniqueIdGenerator.generateCustomerId()
              : uniqueIdGenerator.generateMechanicId();
            await AsyncStorage.setItem(existingUserKey, newId);
            console.log(`AuthContext: Generated and stored new permanent ID: ${newId}`);
          }
          
          const updatedUser = { ...parsedUser, id: newId };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update existing jobs with the new customer ID
          try {
            console.log(`AuthContext: Attempting to update jobs from ${oldId} to ${newId}`);
            const UnifiedJobService = (await import('../services/UnifiedJobService')).default;
            const updateResult = await UnifiedJobService.updateCustomerIdForJobs(oldId, newId);
            console.log('AuthContext: Job update result:', updateResult);
            if (updateResult.success) {
              console.log(`AuthContext: Successfully updated ${updateResult.updatedJobs} jobs with new customer ID`);
            } else {
              console.warn('AuthContext: Job update failed:', updateResult.error);
            }
          } catch (error) {
            console.error('AuthContext: Failed to update existing jobs:', error);
          }
          
          setUser(updatedUser);
          setUserType(storedUserType as 'customer' | 'mechanic');
          console.log('AuthContext: User ID updated to permanent format:', newId);
        } else {
          // User already has new format ID - ensure it's stored as permanent
          const existingUserKey = `user_${parsedUser.email}_${parsedUser.user_type}`;
          const storedPermanentId = await AsyncStorage.getItem(existingUserKey);
          
          if (!storedPermanentId) {
            // Store this ID as permanent for this email/userType
            await AsyncStorage.setItem(existingUserKey, parsedUser.id);
            console.log(`AuthContext: Stored existing ID as permanent: ${parsedUser.id}`);
          }
          
          setUser(parsedUser);
          setUserType(storedUserType as 'customer' | 'mechanic');
          console.log('AuthContext: User loaded from storage with permanent ID:', parsedUser.id, parsedUser.user_type);
        }
        
        
        if (storedAvailabilityStatus) {
          setAvailabilityStatus(storedAvailabilityStatus as 'available' | 'busy' | 'offline');
        }
        
        if (storedWorkingHours) {
          setWorkingHours(JSON.parse(storedWorkingHours));
        }
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
      
      // Check if user already exists with this email (permanent ID system)
      let userId;
      const existingUserKey = `user_${email}_${userType}`;
      const storedUserId = await AsyncStorage.getItem(existingUserKey);
      
      if (storedUserId) {
        // User exists - use their permanent ID
        userId = storedUserId;
        console.log(`AuthContext: SignIn - Using existing permanent ID: ${userId}`);
      } else {
        // New user - generate permanent ID and store it
        if (email === 'customer@example.com' && userType === 'customer') {
          userId = 'CUSTOMER-20241215-143000-0001';
        } else if (email === 'mechanic@example.com' && userType === 'mechanic') {
          userId = 'MECHANIC-20241215-143000-0001';
        } else {
          // Generate new permanent ID for new users
          userId = userType === 'customer' 
            ? uniqueIdGenerator.generateCustomerId()
            : uniqueIdGenerator.generateMechanicId();
        }
        
        // Store the permanent ID for this email/userType combination
        await AsyncStorage.setItem(existingUserKey, userId);
        console.log(`AuthContext: SignIn - Generated and stored new permanent ID: ${userId}`);
      }
      
      // Mock authentication - replace with actual Supabase auth
      const mockUser: User = {
        id: userId,
        email,
        name: email === 'customer@example.com' ? 'John Customer' : 
              email === 'mechanic@example.com' ? 'Mike Mechanic' : 
              email.split('@')[0],
        user_type: userType,
        role: userType, // Add role alias
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_completed: true,
        subscription_tier: 'free',
        is_verified: true,
      };

      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('userType', userType);
      
      setUser(mockUser);
      setUserType(userType);
      
      return { success: true };
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
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Mock user creation - replace with actual Supabase auth
      const userType = userData.user_type || 'customer';
      const email = userData.email || '';
      
      // Check if user already exists with this email (prevent duplicate accounts)
      const existingUserKey = `user_${email}_${userType}`;
      const existingUserId = await AsyncStorage.getItem(existingUserKey);
      
      if (existingUserId) {
        return { 
          success: false, 
          error: 'An account with this email already exists. Please sign in instead.' 
        };
      }
      
      // Generate new permanent ID for new users
      const newId = userType === 'customer' 
        ? uniqueIdGenerator.generateCustomerId()
        : uniqueIdGenerator.generateMechanicId();
      
      // Store the permanent ID mapping
      await AsyncStorage.setItem(existingUserKey, newId);
      console.log(`AuthContext: SignUp - Generated and stored new permanent ID: ${newId}`);
      
      const newUser: User = {
        id: newId,
        displayId: userType === 'customer' 
          ? uniqueIdGenerator.generateCustomerDisplayId()
          : uniqueIdGenerator.generateMechanicDisplayId(),
        email: email,
        name: userData.name || '',
        phone: userData.phone,
        avatar: userData.avatar,
        user_type: userType,
        role: userType, // Add role alias
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_completed: false,
        subscription_tier: 'free',
        is_verified: false,
        location: userData.location,
      };

      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      await AsyncStorage.setItem('userType', newUser.user_type);
      
      setUser(newUser);
      setUserType(newUser.user_type);
      
      return { success: true };
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
      
      // Clear session data but keep permanent ID mappings
      await AsyncStorage.multiRemove([
        'user',
        'userType',
        'availabilityStatus',
        'workingHours'
      ]);
      
      // Note: We intentionally keep the permanent ID mappings (user_${email}_${userType})
      // so that when the user signs back in, they get the same ID and maintain data consistency
      
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
      
      console.log('AuthContext: User signed out, permanent ID mappings preserved for data consistency');
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

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
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

      // In a real app, you would verify the current password with your auth service
      // For now, we'll just simulate the password update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user's updated_at timestamp
      const updatedUser: User = {
        ...user,
        updated_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
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
      await AsyncStorage.setItem('availabilityStatus', status);
      setAvailabilityStatus(status);
    } catch (error) {
      console.error('Update availability status error:', error);
    }
  };

  const updateWorkingHours = async (hours: WorkingHours[]): Promise<void> => {
    try {
      await AsyncStorage.setItem('workingHours', JSON.stringify(hours));
      setWorkingHours(hours);
    } catch (error) {
      console.error('Update working hours error:', error);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
