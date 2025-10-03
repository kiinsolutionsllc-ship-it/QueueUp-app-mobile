/**
 * Data Loading Optimizer
 * 
 * Utility to optimize data loading by implementing:
 * - Lazy loading
 * - Caching
 * - Batch loading
 * - Conditional loading based on user needs
 */

import React from 'react';

export interface LoadingOptions {
  forceRefresh?: boolean;
  cache?: boolean;
  batchSize?: number;
  priority?: 'high' | 'medium' | 'low';
  ttl?: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class DataLoadingOptimizer {
  private static cache = new Map<string, CacheEntry<any>>();
  private static loadingPromises = new Map<string, Promise<any>>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get data with caching and deduplication
   */
  static async getData<T>(
    key: string,
    loader: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T> {
    const { forceRefresh = false, cache = true, ttl = this.DEFAULT_TTL } = options;

    // Check cache first (unless force refresh)
    if (cache && !forceRefresh) {
      const cached = this.getFromCache<T>(key);
      if (cached) {
        console.log(`DataLoadingOptimizer: Cache hit for ${key}`);
        return cached;
      }
    }

    // Check if already loading (deduplication)
    if (this.loadingPromises.has(key)) {
      console.log(`DataLoadingOptimizer: Deduplicating load for ${key}`);
      return this.loadingPromises.get(key)!;
    }

    // Load data
    const loadingPromise = this.loadData(key, loader, { cache, ttl });
    this.loadingPromises.set(key, loadingPromise);

    try {
      const result = await loadingPromise;
      return result;
    } finally {
      this.loadingPromises.delete(key);
    }
  }

  /**
   * Load data and optionally cache it
   */
  private static async loadData<T>(
    key: string,
    loader: () => Promise<T>,
    options: { cache: boolean; ttl: number }
  ): Promise<T> {
    try {
      console.log(`DataLoadingOptimizer: Loading data for ${key}`);
      const data = await loader();

      // Cache the result
      if (options.cache) {
        this.setCache(key, data, options.ttl);
      }

      return data;
    } catch (error) {
      console.error(`DataLoadingOptimizer: Error loading data for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get data from cache
   */
  private static getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache
   */
  private static setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear cache for a specific key or all cache
   */
  static clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
      console.log(`DataLoadingOptimizer: Cleared cache for ${key}`);
    } else {
      this.cache.clear();
      console.log('DataLoadingOptimizer: Cleared all cache');
    }
  }

  /**
   * Batch load multiple data items
   */
  static async batchLoad<T>(
    items: Array<{ key: string; loader: () => Promise<T> }>,
    options: LoadingOptions = {}
  ): Promise<Map<string, T>> {
    const { batchSize = 10, priority = 'medium' } = options;
    const results = new Map<string, T>();

    // Process in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ key, loader }) => {
        try {
          const data = await this.getData(key, loader, options);
          return { key, data };
        } catch (error) {
          console.error(`DataLoadingOptimizer: Error in batch load for ${key}:`, error);
          return { key, data: null };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(({ key, data }) => {
        if (data !== null) {
          results.set(key, data);
        }
      });

      // Add delay between batches for low priority requests
      if (priority === 'low' && i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Preload data for better user experience
   */
  static async preloadData<T>(
    key: string,
    loader: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<void> {
    // Preload in background without blocking
    this.getData(key, loader, { ...options, priority: 'low' }).catch(error => {
      console.warn(`DataLoadingOptimizer: Preload failed for ${key}:`, error);
    });
  }

  /**
   * Load data conditionally based on user needs
   */
  static async conditionalLoad<T>(
    key: string,
    loader: () => Promise<T>,
    condition: () => boolean,
    options: LoadingOptions = {}
  ): Promise<T | null> {
    if (!condition()) {
      console.log(`DataLoadingOptimizer: Skipping load for ${key} - condition not met`);
      return null;
    }

    return this.getData(key, loader, options);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    keys: string[];
    memoryUsage: number;
  } {
    const keys = Array.from(this.cache.keys());
    const memoryUsage = JSON.stringify(Array.from(this.cache.values())).length;

    return {
      size: this.cache.size,
      keys,
      memoryUsage
    };
  }

  /**
   * Clean up expired cache entries
   */
  static cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`DataLoadingOptimizer: Cleaned up ${cleaned} expired cache entries`);
    }
  }
}

/**
 * Hook for React components to use optimized data loading
 */
export function useOptimizedData<T>(
  key: string,
  loader: () => Promise<T>,
  options: LoadingOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await DataLoadingOptimizer.getData(key, loader, {
        ...options,
        forceRefresh
      });
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [key, loader, options]);

  const refresh = React.useCallback(() => {
    return loadData(true);
  }, [loadData]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refresh };
}

// Auto-cleanup cache every 10 minutes
setInterval(() => {
  DataLoadingOptimizer.cleanupCache();
}, 10 * 60 * 1000);
