import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';

/**
 * Unified Local Database Service
 * 
 * This service provides a centralized way to manage all local data storage
 * including jobs, messaging, users, and other app data.
 * 
 * Features:
 * - Centralized data management
 * - Automatic data persistence
 * - Data validation and sanitization
 * - Backup and restore functionality
 * - Data migration support
 * - Performance optimization with batching
 */

class LocalDatabase {
  constructor() {
    // Database version for migration support
    this.DB_VERSION = '1.0.0';
    this.VERSION_KEY = 'db_version';
    
    // Storage keys
    this.KEYS = {
      VERSION: 'db_version',
      JOBS: 'local_jobs',
      BIDS: 'local_bids',
      MESSAGES: 'local_messages',
      CONVERSATIONS: 'local_conversations',
      USERS: 'local_users',
      MECHANICS: 'local_mechanics',
      CUSTOMERS: 'local_customers',
      VEHICLES: 'local_vehicles',
      REVIEWS: 'local_reviews',
      NOTIFICATIONS: 'local_notifications',
      SETTINGS: 'local_settings',
      CHANGE_ORDERS: 'local_change_orders',
      JOB_HISTORY: 'local_job_history',
      PAYMENTS: 'local_payments',
      SCHEDULES: 'local_schedules'
    };

    // In-memory cache for performance
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // Batch operations for performance
    this.pendingWrites = new Map();
    this.writeTimer = null;
    this.BATCH_DELAY = 100; // 100ms

    this.initialized = false;
  }

  /**
   * Initialize the database
   */
  async initialize() {
    if (this.initialized) return;

    try {
      console.log('LocalDatabase: Initializing...');
      
      // Check database version and migrate if needed
      await this.checkVersion();
      
      // Load initial data
      await this.loadAllData();
      
      // Production: No sample data initialization
      console.log('LocalDatabase: Production mode - no sample data');
      
      this.initialized = true;
      console.log('LocalDatabase: Initialized successfully');
    } catch (error) {
      console.error('LocalDatabase: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check database version and migrate if needed
   */
  async checkVersion() {
    try {
      const currentVersion = await AsyncStorage.getItem(this.VERSION_KEY);
      
      if (!currentVersion) {
        // First time setup
        await AsyncStorage.setItem(this.VERSION_KEY, this.DB_VERSION);
        console.log('LocalDatabase: First time setup completed');
      } else if (currentVersion !== this.DB_VERSION) {
        // Version mismatch - perform migration
        await this.migrateData(currentVersion, this.DB_VERSION);
        await AsyncStorage.setItem(this.VERSION_KEY, this.DB_VERSION);
        console.log('LocalDatabase: Migration completed');
      }
    } catch (error) {
      console.error('LocalDatabase: Version check failed:', error);
    }
  }

  /**
   * Migrate data between versions
   */
  async migrateData(fromVersion, toVersion) {
    console.log(`LocalDatabase: Migrating from ${fromVersion} to ${toVersion}`);
    
    // Add migration logic here as the database schema evolves
    // For now, we'll just ensure all keys exist
    const allKeys = Object.values(this.KEYS);
    for (const key of allKeys) {
      if (key !== this.KEYS.VERSION) {
        const data = await AsyncStorage.getItem(key);
        if (!data) {
          await AsyncStorage.setItem(key, JSON.stringify([]));
        }
      }
    }
  }

  /**
   * Load all data into cache
   */
  async loadAllData() {
    const keys = Object.values(this.KEYS).filter(key => key !== this.KEYS.VERSION);
    
    try {
      const data = await AsyncStorage.multiGet(keys);
      
      for (const [key, value] of data) {
        if (value) {
          try {
            const parsed = JSON.parse(value);
            this.cache.set(key, parsed);
            this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
          } catch (error) {
            console.error(`LocalDatabase: Error parsing ${key}:`, error);
            this.cache.set(key, []);
          }
        } else {
          this.cache.set(key, []);
        }
      }
      
      console.log('LocalDatabase: All data loaded into cache');
    } catch (error) {
      console.error('LocalDatabase: Error loading data:', error);
    }
  }

  /**
   * Get data from cache or storage
   */
  async get(key) {
    // Check cache first
    if (this.cache.has(key)) {
      const expiry = this.cacheExpiry.get(key);
      if (expiry && Date.now() < expiry) {
        return this.cache.get(key);
      }
    }

    // Load from storage
    try {
      const data = await AsyncStorage.getItem(key);
      const parsed = data ? JSON.parse(data) : [];
      this.cache.set(key, parsed);
      this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
      return parsed;
    } catch (error) {
      console.error(`LocalDatabase: Error getting ${key}:`, error);
      return [];
    }
  }

  /**
   * Set data with batching for performance
   */
  async set(key, data) {
    // Update cache immediately
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);

    // Add to pending writes
    this.pendingWrites.set(key, data);

    // Schedule batch write
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
    }

    this.writeTimer = setTimeout(() => {
      this.flushPendingWrites();
    }, this.BATCH_DELAY);
  }

  /**
   * Flush all pending writes to storage
   */
  async flushPendingWrites() {
    if (this.pendingWrites.size === 0) return;

    try {
      const writePairs = Array.from(this.pendingWrites.entries()).map(([key, data]) => [
        key,
        JSON.stringify(data)
      ]);

      await AsyncStorage.multiSet(writePairs);
      this.pendingWrites.clear();
      
      console.log(`LocalDatabase: Flushed ${writePairs.length} writes to storage`);
    } catch (error) {
      console.error('LocalDatabase: Error flushing writes:', error);
    }
  }

  /**
   * Add item to a collection
   */
  async add(key, item) {
    const collection = await this.get(key);
    
    // Add ID if not present
    if (!item.id) {
      item.id = uniqueIdGenerator.generateId();
    }
    
    // Add timestamp
    item.createdAt = item.createdAt || new Date().toISOString();
    item.updatedAt = new Date().toISOString();

    collection.push(item);
    await this.set(key, collection);
    
    return item;
  }

  /**
   * Update item in a collection
   */
  async update(key, id, updates) {
    const collection = await this.get(key);
    const index = collection.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${key}`);
    }

    collection[index] = {
      ...collection[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.set(key, collection);
    return collection[index];
  }

  /**
   * Remove item from a collection
   */
  async remove(key, id) {
    const collection = await this.get(key);
    const filtered = collection.filter(item => item.id !== id);
    await this.set(key, filtered);
    return true;
  }

  /**
   * Find item by ID
   */
  async findById(key, id) {
    const collection = await this.get(key);
    return collection.find(item => item.id === id);
  }

  /**
   * Find items by criteria
   */
  async find(key, criteria = {}) {
    const collection = await this.get(key);
    
    if (Object.keys(criteria).length === 0) {
      return collection;
    }

    return collection.filter(item => {
      return Object.entries(criteria).every(([field, value]) => {
        if (typeof value === 'function') {
          return value(item[field]);
        }
        return item[field] === value;
      });
    });
  }

  /**
   * Clear all data
   */
  async clear() {
    try {
      const keys = Object.values(this.KEYS);
      await AsyncStorage.multiRemove(keys);
      
      // Clear cache
      this.cache.clear();
      this.cacheExpiry.clear();
      this.pendingWrites.clear();
      
      console.log('LocalDatabase: All data cleared');
    } catch (error) {
      console.error('LocalDatabase: Error clearing data:', error);
    }
  }

  /**
   * Export all data for backup
   */
  async exportData() {
    try {
      const data = {};
      const keys = Object.values(this.KEYS).filter(key => key !== this.KEYS.VERSION);
      
      for (const key of keys) {
        data[key] = await this.get(key);
      }
      
      return {
        version: this.DB_VERSION,
        timestamp: new Date().toISOString(),
        data
      };
    } catch (error) {
      console.error('LocalDatabase: Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Import data from backup
   */
  async importData(backupData) {
    try {
      if (!backupData || !backupData.data) {
        throw new Error('Invalid backup data format');
      }

      // Clear existing data
      await this.clear();

      // Import new data
      for (const [key, value] of Object.entries(backupData.data)) {
        if (this.KEYS[key.toUpperCase()]) {
          await this.set(key, value);
        }
      }

      console.log('LocalDatabase: Data imported successfully');
    } catch (error) {
      console.error('LocalDatabase: Error importing data:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    const stats = {};
    const keys = Object.values(this.KEYS).filter(key => key !== this.KEYS.VERSION);
    
    for (const key of keys) {
      const data = await this.get(key);
      stats[key] = data.length;
    }
    
    return stats;
  }

  /**
   * Force flush all pending writes
   */
  async flush() {
    await this.flushPendingWrites();
  }
}

// Create singleton instance
const localDatabase = new LocalDatabase();

export default localDatabase;