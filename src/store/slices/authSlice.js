import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock auth service - replace with actual API calls
const authService = {
  login: async (credentials) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.email === 'customer@test.com' && credentials.password === 'SecurePass123!') {
      return {
        user: {
          id: 'customer1',
          email: 'customer@test.com',
          name: 'John Customer',
          type: 'customer',
          avatar: '👤',
        },
        token: 'mock-jwt-token-customer',
      };
    }
    
    if (credentials.email === 'mechanic@test.com' && credentials.password === 'SecurePass123!') {
      return {
        user: {
          id: 'mechanic1',
          email: 'mechanic@test.com',
          name: 'Mike Mechanic',
          type: 'mechanic',
          avatar: '🔧',
          rating: 4.9,
          specialties: ['Engine Repair', 'Brake Service', 'AC Repair'],
        },
        token: 'mock-jwt-token-mechanic',
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      user: {
        id: `user_${Date.now()}`,
        ...userData,
        avatar: userData.type === 'mechanic' ? '🔧' : '👤',
      },
      token: `mock-jwt-token-${userData.type}`,
    };
  },
  
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  },
  
  refreshToken: async (token) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `refreshed-${token}`;
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
  async (token, { rejectWithValue }) => {
    try {
      const newToken = await authService.refreshToken(token);
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
        state.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
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
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.lastLogin = new Date().toISOString();
        state.sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
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
