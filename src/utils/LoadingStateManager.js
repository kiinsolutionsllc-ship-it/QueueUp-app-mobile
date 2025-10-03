/**
 * LOADING STATE MANAGER
 * 
 * Provides centralized loading state management for the QueueUp application.
 * Handles multiple concurrent operations and provides loading indicators.
 */

import { useState, useCallback, useRef } from 'react';

// Loading state types
export const LOADING_TYPES = {
  INITIAL: 'initial',
  REFRESH: 'refresh',
  LOAD_MORE: 'load_more',
  SUBMIT: 'submit',
  DELETE: 'delete',
  UPDATE: 'update',
  SEARCH: 'search',
  UPLOAD: 'upload',
  DOWNLOAD: 'download'
};

// Loading priorities
export const LOADING_PRIORITY = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
};

class LoadingStateManager {
  constructor() {
    this.loadingStates = new Map();
    this.listeners = new Set();
  }

  /**
   * Start loading for a specific operation
   */
  startLoading(operationId, options = {}) {
    const {
      type = LOADING_TYPES.INITIAL,
      priority = LOADING_PRIORITY.MEDIUM,
      message = 'Loading...',
      timeout = 30000 // 30 seconds default timeout
    } = options;

    const loadingState = {
      id: operationId,
      type,
      priority,
      message,
      startTime: Date.now(),
      timeout,
      isActive: true
    };

    this.loadingStates.set(operationId, loadingState);
    this.notifyListeners();

    // Set timeout to prevent infinite loading
    setTimeout(() => {
      if (this.loadingStates.has(operationId)) {
        this.stopLoading(operationId, { timeout: true });
      }
    }, timeout);

    return operationId;
  }

  /**
   * Stop loading for a specific operation
   */
  stopLoading(operationId, options = {}) {
    const loadingState = this.loadingStates.get(operationId);
    if (!loadingState) return;

    const { timeout = false, error = null } = options;

    loadingState.isActive = false;
    loadingState.endTime = Date.now();
    loadingState.duration = loadingState.endTime - loadingState.startTime;
    loadingState.timeout = timeout;
    loadingState.error = error;

    this.loadingStates.delete(operationId);
    this.notifyListeners();

    return loadingState;
  }

  /**
   * Check if any loading is active
   */
  isLoading(operationId = null) {
    if (operationId) {
      return this.loadingStates.has(operationId);
    }
    return this.loadingStates.size > 0;
  }

  /**
   * Get loading state for a specific operation
   */
  getLoadingState(operationId) {
    return this.loadingStates.get(operationId);
  }

  /**
   * Get all active loading states
   */
  getAllLoadingStates() {
    return Array.from(this.loadingStates.values());
  }

  /**
   * Get the highest priority loading state
   */
  getHighestPriorityLoading() {
    const states = this.getAllLoadingStates();
    if (states.length === 0) return null;

    return states.reduce((highest, current) => 
      current.priority > highest.priority ? current : highest
    );
  }

  /**
   * Get loading states by type
   */
  getLoadingStatesByType(type) {
    return this.getAllLoadingStates().filter(state => state.type === type);
  }

  /**
   * Clear all loading states
   */
  clearAllLoading() {
    this.loadingStates.clear();
    this.notifyListeners();
  }

  /**
   * Add listener for loading state changes
   */
  addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of loading state changes
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getAllLoadingStates());
      } catch (error) {
        console.error('Error in loading state listener:', error);
      }
    });
  }

  /**
   * Get loading statistics
   */
  getStats() {
    const states = this.getAllLoadingStates();
    return {
      active: states.length,
      byType: states.reduce((acc, state) => {
        acc[state.type] = (acc[state.type] || 0) + 1;
        return acc;
      }, {}),
      byPriority: states.reduce((acc, state) => {
        acc[state.priority] = (acc[state.priority] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// Create singleton instance
export const loadingStateManager = new LoadingStateManager();

/**
 * React hook for loading state management
 */
export const useLoadingState = (operationId = null) => {
  const [loadingStates, setLoadingStates] = useState([]);
  const listenerRef = useRef(null);

  const updateLoadingStates = useCallback((states) => {
    setLoadingStates(states);
  }, []);

  // Set up listener
  useState(() => {
    listenerRef.current = loadingStateManager.addListener(updateLoadingStates);
    return () => {
      if (listenerRef.current) {
        listenerRef.current();
      }
    };
  });

  const isLoading = operationId 
    ? loadingStateManager.isLoading(operationId)
    : loadingStates.length > 0;

  const loadingState = operationId 
    ? loadingStateManager.getLoadingState(operationId)
    : loadingStateManager.getHighestPriorityLoading();

  const startLoading = useCallback((options = {}) => {
    const id = operationId || `loading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return loadingStateManager.startLoading(id, options);
  }, [operationId]);

  const stopLoading = useCallback((options = {}) => {
    if (operationId) {
      return loadingStateManager.stopLoading(operationId, options);
    }
  }, [operationId]);

  return {
    isLoading,
    loadingState,
    loadingStates,
    startLoading,
    stopLoading,
    message: loadingState?.message || 'Loading...',
    type: loadingState?.type || LOADING_TYPES.INITIAL,
    priority: loadingState?.priority || LOADING_PRIORITY.MEDIUM
  };
};

/**
 * Higher-order component for loading state management
 */
export const withLoadingState = (WrappedComponent, operationId = null) => {
  return function WithLoadingStateComponent(props) {
    const loadingState = useLoadingState(operationId);
    
    return (
      <WrappedComponent 
        {...props} 
        loadingState={loadingState}
      />
    );
  };
};

/**
 * Utility function to wrap async operations with loading state
 */
export const withLoading = async (operation, options = {}) => {
  const {
    operationId = `operation_${Date.now()}`,
    type = LOADING_TYPES.INITIAL,
    priority = LOADING_PRIORITY.MEDIUM,
    message = 'Loading...',
    timeout = 30000
  } = options;

  const loadingId = loadingStateManager.startLoading(operationId, {
    type,
    priority,
    message,
    timeout
  });

  try {
    const result = await operation();
    loadingStateManager.stopLoading(loadingId, { success: true });
    return result;
  } catch (error) {
    loadingStateManager.stopLoading(loadingId, { error });
    throw error;
  }
};

/**
 * Utility function for retry with loading state
 */
export const withRetryAndLoading = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    delay = 1000,
    operationId = `retry_${Date.now()}`,
    ...loadingOptions
  } = options;

  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withLoading(operation, {
        ...loadingOptions,
        operationId: `${operationId}_attempt_${attempt}`,
        message: attempt > 1 ? `Retrying... (${attempt}/${maxRetries})` : loadingOptions.message
      });
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};

export default loadingStateManager;
