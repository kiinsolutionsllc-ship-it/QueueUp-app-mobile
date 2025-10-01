import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hapticService } from '../../services/HapticService';

// Mock user service - replace with actual API calls
const userService = {
  updateProfile: async (userId, profileData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: userId,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
  },
  
  updatePreferences: async (userId, preferences) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: userId,
      preferences,
      updatedAt: new Date().toISOString(),
    };
  },
  
  uploadAvatar: async (userId, avatarUri) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      id: userId,
      avatar: avatarUri,
      updatedAt: new Date().toISOString(),
    };
  },
  
  changePassword: async (userId, passwordData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (passwordData.currentPassword !== 'password') {
      throw new Error('Current password is incorrect');
    }
    
    return {
      success: true,
      message: 'Password changed successfully',
    };
  },
  
  deleteAccount: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      message: 'Account deleted successfully',
    };
  },
  
  getProfile: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: userId,
      name: 'John Customer',
      email: 'customer@test.com',
      phone: '+1234567890',
      avatar: '👤',
      type: 'customer',
      preferences: {
        notifications: true,
        emailUpdates: true,
        smsUpdates: false,
        locationSharing: true,
        dataUsage: 'standard',
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    };
  },
};

// Async thunks
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const updatedProfile = await userService.updateProfile(userId, profileData);
      await hapticService.success();
      return updatedProfile;
    } catch (error) {
      await hapticService.error();
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async ({ userId, preferences }, { rejectWithValue }) => {
    try {
      const updatedUser = await userService.updatePreferences(userId, preferences);
      await hapticService.light();
      return updatedUser;
    } catch (error) {
      await hapticService.error();
      return rejectWithValue(error.message);
    }
  }
);

export const uploadUserAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async ({ userId, avatarUri }, { rejectWithValue }) => {
    try {
      const updatedUser = await userService.uploadAvatar(userId, avatarUri);
      await hapticService.success();
      return updatedUser;
    } catch (error) {
      await hapticService.error();
      return rejectWithValue(error.message);
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'user/changePassword',
  async ({ userId, passwordData }, { rejectWithValue }) => {
    try {
      const result = await userService.changePassword(userId, passwordData);
      await hapticService.success();
      return result;
    } catch (error) {
      await hapticService.error();
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUserAccount = createAsyncThunk(
  'user/deleteAccount',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await userService.deleteAccount(userId);
      await hapticService.light();
      return result;
    } catch (error) {
      await hapticService.error();
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const profile = await userService.getProfile(userId);
      return profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const getInitialState = () => ({
  profile: null,
  preferences: {
    notifications: true,
    emailUpdates: true,
    smsUpdates: false,
    locationSharing: true,
    dataUsage: 'standard',
    theme: 'light', // Default to light theme for all users
    language: 'en',
    hapticFeedback: true,
    soundEffects: true,
    animations: true,
    reducedMotion: false,
    fontSize: 'medium',
    compactMode: false,
  },
  loading: false,
  error: null,
  lastUpdated: null,
  isProfileComplete: false,
  verificationStatus: {
    email: false,
    phone: false,
    identity: false,
  },
  subscription: {
    plan: 'free',
    status: 'active',
    expiresAt: null,
    features: [],
  },
  statistics: {
    totalJobs: 0,
    completedJobs: 0,
    rating: 0,
    joinDate: null,
    lastActive: null,
  },
});

const userSlice = createSlice({
  name: 'user',
  initialState: getInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.isProfileComplete = !!(
        action.payload?.name &&
        action.payload?.email &&
        action.payload?.phone
      );
    },
    
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      if (state.profile) {
        state.profile[field] = value;
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    
    resetPreferences: (state) => {
      state.preferences = getInitialState().preferences;
    },
    
    setVerificationStatus: (state, action) => {
      state.verificationStatus = { ...state.verificationStatus, ...action.payload };
    },
    
    setSubscription: (state, action) => {
      state.subscription = { ...state.subscription, ...action.payload };
    },
    
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },
    
    clearUser: (state) => {
      const initial = getInitialState();
      state.profile = initial.profile;
      state.preferences = initial.preferences;
      state.error = initial.error;
      state.lastUpdated = initial.lastUpdated;
      state.isProfileComplete = initial.isProfileComplete;
      state.verificationStatus = initial.verificationStatus;
      state.subscription = initial.subscription;
      state.statistics = initial.statistics;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = { ...state.profile, ...action.payload };
        state.lastUpdated = action.payload.updatedAt;
        state.isProfileComplete = !!(
          action.payload?.name &&
          action.payload?.email &&
          action.payload?.phone
        );
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.preferences = { ...state.preferences, ...action.payload.preferences };
        state.lastUpdated = action.payload.updatedAt;
        state.error = null;
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload avatar
      .addCase(uploadUserAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        state.loading = false;
        if (state.profile) {
          state.profile.avatar = action.payload.avatar;
          state.profile.updatedAt = action.payload.updatedAt;
        }
        state.lastUpdated = action.payload.updatedAt;
        state.error = null;
      })
      .addCase(uploadUserAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Change password
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete account
      .addCase(deleteUserAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAccount.fulfilled, (state) => {
        state.loading = false;
        // Clear all user data
        const initial = getInitialState();
        state.profile = initial.profile;
        state.preferences = initial.preferences;
        state.error = initial.error;
        state.lastUpdated = initial.lastUpdated;
        state.isProfileComplete = initial.isProfileComplete;
      })
      .addCase(deleteUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.isProfileComplete = !!(
          action.payload?.name &&
          action.payload?.email &&
          action.payload?.phone
        );
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setProfile,
  updateProfileField,
  setPreferences,
  resetPreferences,
  setVerificationStatus,
  setSubscription,
  updateStatistics,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
