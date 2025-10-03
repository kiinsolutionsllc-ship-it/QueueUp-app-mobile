import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base context configuration interface
export interface BaseContextConfig<T> {
  storageKey: string;
  defaultState: T;
  autoSave?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  dependencies?: string[];
}

// Base context state interface
export interface BaseContextState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Base context type interface
export interface BaseContextType<T> {
  // State
  data: T;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Actions
  setData: (data: T) => Promise<void>;
  updateData: (updates: Partial<T>) => Promise<void>;
  clearData: () => Promise<void>;
  refreshData: () => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Utilities
  isInitialized: boolean;
  saveToStorage: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

// Base context provider props
export interface BaseContextProviderProps<T> {
  children: ReactNode;
  config: BaseContextConfig<T>;
  onDataChange?: (data: T) => void;
  onError?: (error: string) => void;
}

// Create a base context provider factory
export function createBaseContextProvider<T>(
  contextName: string,
  defaultConfig: Partial<BaseContextConfig<T>> = {}
) {
  const Context = createContext<BaseContextType<T> | undefined>(undefined);

  const useBaseContext = (): BaseContextType<T> => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(`use${contextName} must be used within a ${contextName}Provider`);
    }
    return context;
  };

  const BaseContextProvider: React.FC<BaseContextProviderProps<T>> = ({
    children,
    config: userConfig,
    onDataChange,
    onError,
  }) => {
    const config = { ...defaultConfig, ...userConfig } as BaseContextConfig<T>;
    
    const [state, setState] = useState<BaseContextState<T>>({
      data: config.defaultState,
      loading: true,
      error: null,
      lastUpdated: null,
    });

    const [isInitialized, setIsInitialized] = useState(false);

    // Load data from storage
    const loadFromStorage = useCallback(async (): Promise<void> => {
      try {
        const storedData = await AsyncStorage.getItem(config.storageKey);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setState(prev => ({
            ...prev,
            data: parsedData,
            lastUpdated: new Date().toISOString(),
          }));
        }
      } catch (error) {
        console.error(`${contextName}: Error loading from storage:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
        setState(prev => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
      }
    }, [config.storageKey, onError]);

    // Save data to storage
    const saveToStorage = useCallback(async (): Promise<void> => {
      if (!config.autoSave) return;

      try {
        await AsyncStorage.setItem(config.storageKey, JSON.stringify(state.data));
      } catch (error) {
        console.error(`${contextName}: Error saving to storage:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save data';
        setState(prev => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
      }
    }, [config.storageKey, config.autoSave, state.data, onError]);

    // Set data
    const setData = useCallback(async (newData: T): Promise<void> => {
      try {
        setState(prev => ({
          ...prev,
          data: newData,
          lastUpdated: new Date().toISOString(),
          error: null,
        }));
        
        await saveToStorage();
        onDataChange?.(newData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to set data';
        setState(prev => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
      }
    }, [saveToStorage, onDataChange, onError]);

    // Update data
    const updateData = useCallback(async (updates: Partial<T>): Promise<void> => {
      try {
        const newData = { ...state.data, ...updates };
        await setData(newData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update data';
        setState(prev => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
      }
    }, [state.data, setData, onError]);

    // Clear data
    const clearData = useCallback(async (): Promise<void> => {
      try {
        setState(prev => ({
          ...prev,
          data: config.defaultState,
          lastUpdated: new Date().toISOString(),
          error: null,
        }));
        
        await AsyncStorage.removeItem(config.storageKey);
        onDataChange?.(config.defaultState);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to clear data';
        setState(prev => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
      }
    }, [config.defaultState, config.storageKey, onDataChange, onError]);

    // Refresh data
    const refreshData = useCallback(async (): Promise<void> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        await loadFromStorage();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
        setState(prev => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    }, [loadFromStorage, onError]);

    // Set error
    const setError = useCallback((error: string | null): void => {
      setState(prev => ({ ...prev, error }));
      if (error) {
        onError?.(error);
      }
    }, [onError]);

    // Set loading
    const setLoading = useCallback((loading: boolean): void => {
      setState(prev => ({ ...prev, loading }));
    }, []);

    // Initialize on mount
    useEffect(() => {
      const initialize = async () => {
        try {
          setState(prev => ({ ...prev, loading: true }));
          await loadFromStorage();
          setIsInitialized(true);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
          setState(prev => ({ ...prev, error: errorMessage }));
          onError?.(errorMessage);
        } finally {
          setState(prev => ({ ...prev, loading: false }));
        }
      };

      initialize();
    }, [loadFromStorage, onError]);

    // Auto-refresh if enabled
    useEffect(() => {
      if (!config.autoRefresh || !isInitialized) return;

      const interval = setInterval(() => {
        refreshData();
      }, config.refreshInterval || 30000); // Default 30 seconds

      return () => clearInterval(interval);
    }, [config.autoRefresh, config.refreshInterval, isInitialized, refreshData]);

    // Auto-save when data changes
    useEffect(() => {
      if (isInitialized && config.autoSave) {
        saveToStorage();
      }
    }, [state.data, isInitialized, config.autoSave, saveToStorage]);

    const value: BaseContextType<T> = {
      // State
      data: state.data,
      loading: state.loading,
      error: state.error,
      lastUpdated: state.lastUpdated,
      
      // Actions
      setData,
      updateData,
      clearData,
      refreshData,
      setError,
      setLoading,
      
      // Utilities
      isInitialized,
      saveToStorage,
      loadFromStorage,
    };

    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  };

  return {
    Context,
    Provider: BaseContextProvider,
    useHook: useBaseContext,
  };
}

// Utility function to create a simple context provider
export function createSimpleContextProvider<T>(
  contextName: string,
  defaultState: T,
  storageKey?: string
) {
  return createBaseContextProvider<T>(contextName, {
    storageKey: storageKey || `${contextName.toLowerCase()}_data`,
    defaultState,
    autoSave: true,
    autoRefresh: false,
  });
}
