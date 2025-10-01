import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticService } from './HapticService';

class OfflineService {
  constructor() {
    this.isOnline = true;
    this.queuedActions = [];
    this.syncInProgress = false;
    this.listeners = [];
    this.setupNetworkListener();
    this.loadQueuedActions();
  }

  // Setup network state listener
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected;
      
      // Notify listeners
      this.notifyListeners({
        isOnline: this.isOnline,
        wasOnline,
        connectionType: state.type,
      });

      // If we just came back online, sync queued actions
      if (!wasOnline && this.isOnline) {
        this.syncQueuedActions();
      }

      // Trigger haptic feedback for connection changes
      if (wasOnline !== this.isOnline) {
        if (this.isOnline) {
          hapticService.success();
        } else {
          hapticService.warning();
        }
      }
    });
  }

  // Add listener for network state changes
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  // Queue an action for later execution
  async queueAction(action, priority = 'normal') {
    const actionData = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      priority,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 3,
    };

    if (this.isOnline) {
      try {
        await this.executeAction(actionData);
        return { success: true, data: actionData };
      } catch (error) {
        // If online but action failed, queue it
        this.queuedActions.push(actionData);
        await this.saveQueuedActions();
        return { success: false, error: error.message, queued: true };
      }
    } else {
      this.queuedActions.push(actionData);
      await this.saveQueuedActions();
      return { success: false, error: 'Offline', queued: true };
    }
  }

  // Execute a single action
  async executeAction(actionData) {
    try {
      const result = await actionData.action();
      return result;
    } catch (error) {
      actionData.retryCount++;
      if (actionData.retryCount < actionData.maxRetries) {
        // Retry after a delay
        setTimeout(() => {
          this.executeAction(actionData);
        }, 1000 * actionData.retryCount);
      } else {
        throw error;
      }
    }
  }

  // Sync all queued actions when back online
  async syncQueuedActions() {
    if (this.syncInProgress || this.queuedActions.length === 0) {
      return;
    }

    this.syncInProgress = true;
    const actionsToSync = [...this.queuedActions];
    this.queuedActions = [];

    try {
      // Sort by priority (high, normal, low)
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      actionsToSync.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      for (const actionData of actionsToSync) {
        try {
          await this.executeAction(actionData);
        } catch (error) {
          console.error(`Failed to sync action ${actionData.id}:`, error);
          // Re-queue failed actions
          this.queuedActions.push(actionData);
        }
      }

      await this.saveQueuedActions();
      hapticService.success();
    } catch (error) {
      console.error('Error syncing queued actions:', error);
      hapticService.error();
    } finally {
      this.syncInProgress = false;
    }
  }

  // Save queued actions to storage
  async saveQueuedActions() {
    try {
      await AsyncStorage.setItem('queuedActions', JSON.stringify(this.queuedActions));
    } catch (error) {
      console.error('Error saving queued actions:', error);
    }
  }

  // Load queued actions from storage
  async loadQueuedActions() {
    try {
      const stored = await AsyncStorage.getItem('queuedActions');
      if (stored) {
        this.queuedActions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading queued actions:', error);
    }
  }

  // Clear all queued actions
  async clearQueuedActions() {
    this.queuedActions = [];
    await this.saveQueuedActions();
  }

  // Get queued actions count
  getQueuedActionsCount() {
    return this.queuedActions.length;
  }

  // Get queued actions by priority
  getQueuedActionsByPriority(priority) {
    return this.queuedActions.filter(action => action.priority === priority);
  }

  // Check if we're online
  isConnected() {
    return this.isOnline;
  }

  // Get connection type
  async getConnectionType() {
    const state = await NetInfo.fetch();
    return state.type;
  }

  // Force sync (for manual sync button)
  async forceSync() {
    if (this.isOnline) {
      await this.syncQueuedActions();
    }
  }

  // Create offline-capable API call
  createOfflineApiCall(apiCall, fallbackData = null) {
    return async (...args) => {
      if (this.isOnline) {
        try {
          return await apiCall(...args);
        } catch (error) {
          if (fallbackData) {
            return fallbackData;
          }
          throw error;
        }
      } else {
        if (fallbackData) {
          return fallbackData;
        }
        throw new Error('Offline - no cached data available');
      }
    };
  }

  // Cache data for offline use
  async cacheData(key, data, ttl = 24 * 60 * 60 * 1000) { // 24 hours default
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  // Get cached data
  async getCachedData(key) {
    try {
      const stored = await AsyncStorage.getItem(`cache_${key}`);
      if (stored) {
        const cacheData = JSON.parse(stored);
        const now = Date.now();
        
        if (now - cacheData.timestamp < cacheData.ttl) {
          return cacheData.data;
        } else {
          // Cache expired, remove it
          await AsyncStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.error('Error getting cached data:', error);
    }
    
    return null;
  }

  // Clear expired cache
  async clearExpiredCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const cacheData = JSON.parse(stored);
          const now = Date.now();
          
          if (now - cacheData.timestamp >= cacheData.ttl) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  // Get cache size
  async getCacheSize() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      let totalSize = 0;
      
      for (const key of cacheKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          totalSize += stored.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
  }

  // Clear all cache
  async clearAllCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      for (const key of cacheKeys) {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }
}

export const offlineService = new OfflineService();
