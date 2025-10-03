import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobFormData, UseAutoSaveReturn } from '../types/JobTypes';

interface UseAutoSaveProps {
  storageKey?: string;
  autoSaveInterval?: number; // in milliseconds
  onSave?: (data: JobFormData) => void;
  onLoad?: (data: JobFormData) => void;
  onError?: (error: string) => void;
}

const DEFAULT_STORAGE_KEY = 'createJobFormData';
const DEFAULT_AUTO_SAVE_INTERVAL = 10000; // 10 seconds

export const useAutoSave = ({
  storageKey = DEFAULT_STORAGE_KEY,
  autoSaveInterval = DEFAULT_AUTO_SAVE_INTERVAL,
  onSave,
  onLoad,
  onError,
}: UseAutoSaveProps = {}): UseAutoSaveReturn => {
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const autoSaveIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // Save form data to storage
  const saveFormData = useCallback(async (data: JobFormData): Promise<void> => {
    try {
      setIsSaving(true);
      
      const dataString = JSON.stringify(data);
      
      // Only save if data has changed
      if (dataString !== lastSavedDataRef.current) {
        await AsyncStorage.setItem(storageKey, dataString);
        lastSavedDataRef.current = dataString;
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        onSave?.(data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save form data';
      console.error('Auto-save error:', errorMessage);
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [storageKey, onSave, onError]);

  // Load form data from storage
  const loadFormData = useCallback(async (): Promise<JobFormData | null> => {
    try {
      setIsLoading(true);
      
      const savedData = await AsyncStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData) as JobFormData;
        lastSavedDataRef.current = savedData;
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        onLoad?.(parsedData);
        return parsedData;
      }
      
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load form data';
      console.error('Auto-load error:', errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, onLoad, onError]);

  // Clear saved data
  const clearSavedData = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(storageKey);
      lastSavedDataRef.current = '';
      setLastSaved(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear saved data';
      console.error('Clear data error:', errorMessage);
      onError?.(errorMessage);
      throw error;
    }
  }, [storageKey, onError]);

  // Mark data as changed
  const markDataChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Start auto-save interval
  const startAutoSave = useCallback((data: JobFormData) => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(async () => {
      try {
        await saveFormData(data);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, autoSaveInterval);
  }, [autoSaveInterval, saveFormData]);

  // Stop auto-save interval
  const stopAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
  }, []);

  // Check if data has changed
  const hasDataChanged = useCallback((currentData: JobFormData): boolean => {
    const currentDataString = JSON.stringify(currentData);
    return currentDataString !== lastSavedDataRef.current;
  }, []);

  // Get save status
  const getSaveStatus = useCallback(() => {
    if (isSaving) {
      return 'saving';
    }
    
    if (hasUnsavedChanges) {
      return 'unsaved';
    }
    
    if (lastSaved) {
      return 'saved';
    }
    
    return 'idle';
  }, [isSaving, hasUnsavedChanges, lastSaved]);

  // Get time since last save
  const getTimeSinceLastSave = useCallback((): string => {
    if (!lastSaved) {
      return 'Never saved';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
  }, [lastSaved]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  // Auto-save when data changes
  const handleDataChange = useCallback((newData: JobFormData) => {
    markDataChanged();
    
    // Debounced auto-save
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }
    
    autoSaveIntervalRef.current = setTimeout(async () => {
      try {
        await saveFormData(newData);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000); // 2 second debounce
  }, [markDataChanged, saveFormData]);

  return {
    saveFormData,
    loadFormData,
    clearSavedData,
    hasUnsavedChanges,
    isSaving,
    isLoading,
    lastSaved,
    markDataChanged,
    startAutoSave,
    stopAutoSave,
    hasDataChanged,
    getSaveStatus,
    getTimeSinceLastSave,
    handleDataChange,
  };
};

export default useAutoSave;
