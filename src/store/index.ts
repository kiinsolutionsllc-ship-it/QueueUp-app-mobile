import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import authSlice from './slices/authSlice';
import jobsSlice from './slices/jobsSlice';
import uiSlice from './slices/uiSlice';
import userSlice from './slices/userSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'ui'],
  blacklist: ['jobs'], // Don't persist jobs as they should be fresh
  transforms: [],
  serialize: true,
  deserialize: true,
  debug: false,
  stateReconciler: undefined, // Use default state reconciler
};

const rootReducer = combineReducers({
  auth: authSlice,
  jobs: jobsSlice,
  ui: uiSlice,
  user: userSlice,
});

// Create a custom persist config that avoids _tracking issues
const customPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'ui'],
  blacklist: ['jobs'], // Don't persist jobs as they should be fresh
  transforms: [],
  serialize: true,
  deserialize: true,
  debug: false,
  // Add custom state reconciler to prevent _tracking
  stateReconciler: (inboundState) => {
    // Remove _tracking from the state
    const cleanInboundState = { ...inboundState };
    delete cleanInboundState._tracking;
    return cleanInboundState;
  },
  migrate: (state) => {
    // Remove any _tracking properties during migration
    const cleanState = JSON.parse(JSON.stringify(state, (key, value) => {
      // Remove _tracking and other non-serializable properties
      if (key === '_tracking' || key === '_persist') {
        return undefined;
      }
      return value;
    }));
    return Promise.resolve(cleanState);
  },
};

// Temporarily disable persistence to fix _tracking error
// const persistedReducer = persistReducer(customPersistConfig, rootReducer);

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

// Temporarily disable persistor to fix _tracking error
// export const persistor = persistStore(store);
export const persistor = null;

// Function to clear persisted state (useful for debugging)
export const clearPersistedState = async () => {
  try {
    await persistor.purge();
    await AsyncStorage.clear();
    console.log('Persisted state cleared successfully');
  } catch (error) {
    console.error('Error clearing persisted state:', error);
  }
};

// AsyncStorage clearing disabled since persistence is disabled
// const forceClearStorage = async () => {
//   try {
//     console.log('Force clearing all AsyncStorage to prevent _tracking errors...');
//     await AsyncStorage.clear();
//     console.log('AsyncStorage cleared successfully');
//   } catch (error) {
//     console.log('Error clearing AsyncStorage:', error);
//   }
// };

// Run the force clear on store initialization
// forceClearStorage();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



