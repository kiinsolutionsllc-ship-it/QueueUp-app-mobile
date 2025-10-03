import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SupabaseAuthService } from '@/services/SupabaseAuthService';

// Real Supabase auth service
const authService = {
  login: async (credentials) => {
    try {
      console.log('AuthSlice: Attempting login with Supabase...');
      const result = await SupabaseAuthService.signIn(credentials.email, credentials.password);
      
      if (result.success && result.user) {
        console.log('AuthSlice: Login successful');
        return {
          user: result.user,
          token: result.session?.access_token,
          session: result.session,
        };
      } else {
        throw new Error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('AuthSlice: Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },
  
  register: async (userData) => {
    try {
      console.log('AuthSlice: Attempting registration with Supabase...');
      const result = await SupabaseAuthService.signUp(userData.email, userData.password, userData);
      
      if (result.success) {
        console.log('AuthSlice: Registration successful');
        return {
          user: result.user,
          requiresEmailConfirmation: result.requiresEmailConfirmation,
          message: result.message,
        };
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('AuthSlice: Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },
  
  logout: async () => {
    try {
      console.log('AuthSlice: Attempting logout...');
      await SupabaseAuthService.signOut();
      console.log('AuthSlice: Logout successful');
      return true;
    } catch (error) {
      console.error('AuthSlice: Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  },
  
  refreshToken: async (session) => {
    try {
      console.log('AuthSlice: Attempting token refresh...');
      // Supabase handles token refresh automatically
      // Just return the current session token
      return session?.access_token;
    } catch (error) {
      console.error('AuthSlice: Token refresh error:', error);
      throw new Error(error.message || 'Token refresh failed');
    }
  },
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  'auth/refreshUserToken',
  async (session, { rejectWithValue }) => {
    try {
      const newToken = await authService.refreshToken(session);
      return newToken;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const getInitialState = () => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  lastLogin: null,
  sessionExpiry: null,
});

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload;
    },
    
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastLogin = null;
      state.sessionExpiry = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.lastLogin = new Date().toISOString();
        // Use session expiry from Cognito if available, otherwise default to 24 hours
        if (action.payload.session) {
          const expiresAt = action.payload.session.getIdToken().getExpiration() * 1000;
          state.sessionExpiry = new Date(expiresAt).toISOString();
        } else {
          state.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        }
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token || null;
        state.isAuthenticated = !!action.payload.token;
        state.lastLogin = new Date().toISOString();
        // Only set session expiry if user is authenticated (token exists)
        if (action.payload.token) {
          state.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        } else {
          state.sessionExpiry = null;
        }
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.lastLogin = null;
        state.sessionExpiry = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Refresh token
      .addCase(refreshUserToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
        // Session expiry will be updated when the new session is used
        state.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      })
      .addCase(refreshUserToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If token refresh fails, logout user
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const {
  clearError,
  setUser,
  updateUserProfile,
  setSessionExpiry,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
