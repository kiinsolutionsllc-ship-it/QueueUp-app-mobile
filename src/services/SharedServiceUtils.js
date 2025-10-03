// AsyncStorage removed - using Supabase only
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import { MOCK_MODE } from '../config/payment';

/**
 * SHARED SERVICE UTILITIES
 * 
 * Common utilities and patterns used across all services
 * Features:
 * - Standardized initialization patterns
 * - Common data persistence methods
 * - Shared validation utilities
 * - Mock mode detection
 * - Error handling patterns
 * - Performance monitoring
 */

// Common service configuration
export const SERVICE_CONFIG = {
  STORAGE_PREFIX: 'service_',
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  BATCH_DELAY: 100, // 100ms
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000 // 1 second
};

// Common service statuses
export const SERVICE_STATUS = {
  INITIALIZING: 'initializing',
  INITIALIZED: 'initialized',
  ERROR: 'error',
  DISABLED: 'disabled'
};

// Common data types
export const DATA_TYPES = {
  JOBS: 'jobs',
  USERS: 'users',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  LOCATIONS: 'locations',
  VEHICLES: 'vehicles',
  PAYMENTS: 'payments',
  SETTINGS: 'settings'
};

/**
 * Base Service Class with common functionality
 */
export class BaseService {
  constructor(serviceName, config = {}) {
    this.serviceName = serviceName;
    this.config = { ...SERVICE_CONFIG, ...config };
    this.isInitialized = false;
    this.status = SERVICE_STATUS.INITIALIZING;
    this.lastError = null;
    this.data = [];
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.pendingWrites = new Map();
    this.writeTimer = null;
  }

  // Initialize the service
  async initialize() {
    if (this.isInitialized) {
      console.log(`${this.serviceName}: Already initialized`);
      return;
    }

    try {
      console.log(`${this.serviceName}: Initializing...`);
      this.status = SERVICE_STATUS.INITIALIZING;
      
      // Load data from storage
      await this.loadData();
      
      // Initialize with default data if empty
      if (this.data.length === 0 && this.config.mockData) {
        await this.initializeWithMockData();
      }
      
      // Run service-specific initialization
      await this.initializeData();
      
      this.isInitialized = true;
      this.status = SERVICE_STATUS.INITIALIZED;
      console.log(`${this.serviceName}: Initialized successfully`);
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.status = SERVICE_STATUS.ERROR;
      console.error(`${this.serviceName}: Initialization failed:`, error);
      throw error;
    }
  }

  // Load data (now managed in memory only)
  async loadData() {
    try {
      // Data is now managed in memory only
      this.data = [];
    } catch (error) {
      console.error(`${this.serviceName}: Error loading data:`, error);
      this.data = [];
    }
  }

  // Save data (now managed in memory only)
  async saveData() {
    try {
      // Data is now managed in memory only
      console.log(`${this.serviceName}: Data is now managed in memory only`);
    } catch (error) {
      console.error(`${this.serviceName}: Error saving data:`, error);
    }
  }

  // Initialize with mock data (override in subclasses)
  async initializeWithMockData() {
    console.log(`${this.serviceName}: Initializing with mock data`);
    // Override in subclasses
  }

  // Service-specific initialization (override in subclasses)
  async initializeData() {
    // Override in subclasses
  }

  // Create a new item
  async createItem(itemData) {
    try {
      const item = {
        id: uniqueIdGenerator.generateId(),
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.data.push(item);
      await this.saveData();
      return { success: true, data: item };
    } catch (error) {
      console.error(`${this.serviceName}: Error creating item:`, error);
      return { success: false, error: error.message };
    }
  }

  // Get item by ID
  getItem(id) {
    return this.data.find(item => item.id === id);
  }

  // Get all items
  getAllItems() {
    return this.data;
  }

  // Update item
  async updateItem(id, updateData) {
    try {
      const index = this.data.findIndex(item => item.id === id);
      if (index === -1) {
        return { success: false, error: 'Item not found' };
      }

      this.data[index] = {
        ...this.data[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      await this.saveData();
      return { success: true, data: this.data[index] };
    } catch (error) {
      console.error(`${this.serviceName}: Error updating item:`, error);
      return { success: false, error: error.message };
    }
  }

  // Delete item
  async deleteItem(id) {
    try {
      const index = this.data.findIndex(item => item.id === id);
      if (index === -1) {
        return { success: false, error: 'Item not found' };
      }

      const deletedItem = this.data.splice(index, 1)[0];
      await this.saveData();
      return { success: true, data: deletedItem };
    } catch (error) {
      console.error(`${this.serviceName}: Error deleting item:`, error);
      return { success: false, error: error.message };
    }
  }

  // Search items
  searchItems(query, fields = []) {
    if (!query) return this.data;

    return this.data.filter(item => {
      if (fields.length === 0) {
        // Search all string fields
        return Object.values(item).some(value => 
          typeof value === 'string' && 
          value.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        // Search specific fields
        return fields.some(field => {
          const value = item[field];
          return typeof value === 'string' && 
                 value.toLowerCase().includes(query.toLowerCase());
        });
      }
    });
  }

  // Get service status
  getStatus() {
    return {
      serviceName: this.serviceName,
      isInitialized: this.isInitialized,
      status: this.status,
      lastError: this.lastError,
      dataCount: this.data.length,
      cacheSize: this.cache.size
    };
  }

  // Reset service
  async reset() {
    try {
      this.data = [];
      this.cache.clear();
      this.cacheExpiry.clear();
      this.pendingWrites.clear();
      this.isInitialized = false;
      this.status = SERVICE_STATUS.INITIALIZING;
      this.lastError = null;
      
      // Clear storage (now managed in memory only)
      console.log(`${this.serviceName}: Storage clearing not needed - data managed in memory only`);
      
      console.log(`${this.serviceName}: Reset successfully`);
    } catch (error) {
      console.error(`${this.serviceName}: Error resetting:`, error);
      throw error;
    }
  }
}

/**
 * Mock Service Base Class
 */
export class MockServiceBase extends BaseService {
  constructor(serviceName, config = {}) {
    super(serviceName, { ...config, mockData: true });
    this.mockMode = MOCK_MODE;
  }

  // Simulate network delay
  async simulateDelay(min = 100, max = 500) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Simulate random error
  simulateError(errorRate = 0.05) {
    return Math.random() < errorRate;
  }

  // Mock API call
  async mockApiCall(operation, data = null, errorRate = 0.05) {
    await this.simulateDelay();
    
    if (this.simulateError(errorRate)) {
      throw new Error(`Mock ${this.serviceName} ${operation} failed`);
    }
    
    return { success: true, data };
  }
}

/**
 * Common validation utilities
 */
export const ValidationUtils = {
  // Validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number
  isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  },

  // Validate required fields
  validateRequired(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field]);
    return {
      isValid: missing.length === 0,
      missingFields: missing
    };
  },

  // Sanitize string
  sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  }
};

/**
 * Common error handling
 */
export const ErrorHandler = {
  // Handle service errors
  handleServiceError(serviceName, operation, error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`${serviceName}: ${operation} failed:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
      service: serviceName,
      operation
    };
  },

  // Retry operation
  async retryOperation(operation, maxRetries = SERVICE_CONFIG.MAX_RETRIES) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, SERVICE_CONFIG.RETRY_DELAY));
        }
      }
    }
    
    throw lastError;
  }
};

/**
 * Performance monitoring
 */
export const PerformanceMonitor = {
  // Time operation
  async timeOperation(operation, operationName) {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;
      console.log(`${operationName}: ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`${operationName}: ${duration}ms (failed)`);
      throw error;
    }
  }
};

/**
 * Check if running in mock mode
 */
export const isMockMode = () => MOCK_MODE;

/**
 * Get service configuration
 */
export const getServiceConfig = (serviceName) => ({
  ...SERVICE_CONFIG,
  storageKey: `${SERVICE_CONFIG.STORAGE_PREFIX}${serviceName}`
});

export default {
  BaseService,
  MockServiceBase,
  ValidationUtils,
  ErrorHandler,
  PerformanceMonitor,
  isMockMode,
  getServiceConfig,
  SERVICE_CONFIG,
  SERVICE_STATUS,
  DATA_TYPES
};
