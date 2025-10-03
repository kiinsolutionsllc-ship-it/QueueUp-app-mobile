import { configureStore } from '@reduxjs/toolkit';
// AsyncStorage and persistence removed - using Supabase only
import { combineReducers } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import jobsSlice from './slices/jobsSlice';
import uiSlice from './slices/uiSlice';
import userSlice from './slices/userSlice';

const rootReducer = combineReducers({
  auth: authSlice,
  jobs: jobsSlice,
  ui: uiSlice,
  user: userSlice,
});

// Persistence removed - using Supabase only

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Completely disable serializable check to prevent _tracking errors
      immutableCheck: false, // Disable immutable check to prevent _tracking errors
      thunk: {
        extraArgument: {},
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor removed - no persistence needed
export const persistor = null;

// Function to clear state (no persistence needed)
export const clearPersistedState = async () => {
  try {
    console.log('State clearing not needed - no persistence');
  } catch (error) {
    console.error('Error clearing state:', error);
  }
};

// AsyncStorage clearing not needed since persistence is disabled

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



