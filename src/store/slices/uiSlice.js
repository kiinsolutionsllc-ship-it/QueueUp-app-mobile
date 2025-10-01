import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Theme
  theme: 'light', // 'light' or 'dark' - Default to light theme
  colorPalette: 0, // Index of color palette - 0 = Light theme
  
  // Language
  language: 'en',
  
  // Loading states
  globalLoading: false,
  loadingMessage: '',
  
  // Modals and overlays
  modals: {
    jobDetails: false,
    createJob: false,
    editProfile: false,
    settings: false,
    notifications: false,
  },
  
  // Notifications
  notifications: [],
  unreadCount: 0,
  
  // App state
  isOnline: true,
  lastActive: null,
  
  // Navigation
  currentScreen: 'Home',
  navigationHistory: [],
  
  // UI preferences
  preferences: {
    hapticFeedback: true,
    soundEffects: true,
    animations: true,
    reducedMotion: false,
    fontSize: 'medium', // 'small', 'medium', 'large'
    compactMode: false,
  },
  
  // Error states
  errors: {
    global: null,
    network: null,
    validation: [],
  },
  
  // Success messages
  successMessages: [],
  
  // App version and updates
  appVersion: '5.0.0',
  lastUpdateCheck: null,
  updateAvailable: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions (disabled - light theme only)
    // setTheme: (state, action) => {
    //   state.theme = action.payload;
    // },
    
    // toggleTheme: (state) => {
    //   state.theme = state.theme === 'light' ? 'dark' : 'light';
    // },
    
    // setColorPalette: (state, action) => {
    //   state.colorPalette = action.payload;
    // },
    
    // Language actions
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message || '';
    },
    
    clearGlobalLoading: (state) => {
      state.globalLoading = false;
      state.loadingMessage = '';
    },
    
    // Modal actions
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: `notif_${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    
    removeNotification: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    // App state actions
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    
    updateLastActive: (state) => {
      state.lastActive = new Date().toISOString();
    },
    
    // Navigation actions
    setCurrentScreen: (state, action) => {
      state.currentScreen = action.payload;
      state.navigationHistory.push(action.payload);
      
      // Keep only last 10 screens in history
      if (state.navigationHistory.length > 10) {
        state.navigationHistory = state.navigationHistory.slice(-10);
      }
    },
    
    goBack: (state) => {
      if (state.navigationHistory.length > 1) {
        state.navigationHistory.pop();
        state.currentScreen = state.navigationHistory[state.navigationHistory.length - 1];
      }
    },
    
    clearNavigationHistory: (state) => {
      state.navigationHistory = [state.currentScreen];
    },
    
    // UI preferences actions
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    
    resetPreferences: (state) => {
      state.preferences = initialState.preferences;
    },
    
    // Error actions
    setGlobalError: (state, action) => {
      state.errors.global = action.payload;
    },
    
    setNetworkError: (state, action) => {
      state.errors.network = action.payload;
    },
    
    addValidationError: (state, action) => {
      state.errors.validation.push(action.payload);
    },
    
    clearValidationErrors: (state) => {
      state.errors.validation = [];
    },
    
    clearAllErrors: (state) => {
      state.errors = {
        global: null,
        network: null,
        validation: [],
      };
    },
    
    // Success message actions
    addSuccessMessage: (state, action) => {
      const message = {
        id: `success_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.successMessages.push(message);
    },
    
    removeSuccessMessage: (state, action) => {
      state.successMessages = state.successMessages.filter(m => m.id !== action.payload);
    },
    
    clearAllSuccessMessages: (state) => {
      state.successMessages = [];
    },
    
    // App update actions
    setUpdateAvailable: (state, action) => {
      state.updateAvailable = action.payload;
    },
    
    updateLastUpdateCheck: (state) => {
      state.lastUpdateCheck = new Date().toISOString();
    },
    
    // Reset UI state
    resetUI: (state) => {
      return { ...initialState, theme: state.theme, language: state.language };
    },
  },
});

export const {
  // Theme (disabled - light theme only)
  // setTheme,
  // toggleTheme,
  // setColorPalette,
  
  // Language
  setLanguage,
  
  // Loading
  setGlobalLoading,
  clearGlobalLoading,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  
  // Notifications
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearAllNotifications,
  
  // App state
  setOnlineStatus,
  updateLastActive,
  
  // Navigation
  setCurrentScreen,
  goBack,
  clearNavigationHistory,
  
  // Preferences
  updatePreferences,
  resetPreferences,
  
  // Errors
  setGlobalError,
  setNetworkError,
  addValidationError,
  clearValidationErrors,
  clearAllErrors,
  
  // Success messages
  addSuccessMessage,
  removeSuccessMessage,
  clearAllSuccessMessages,
  
  // App updates
  setUpdateAvailable,
  updateLastUpdateCheck,
  
  // Reset
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
