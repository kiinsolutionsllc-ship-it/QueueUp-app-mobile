/**
 * PERFORMANCE OPTIMIZATION UTILITIES
 * 
 * Provides React performance optimization utilities and patterns
 * for the QueueUp application.
 */

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';
import { Platform } from 'react-native';

// Performance monitoring
export const PerformanceMonitor = {
  startTime: null,
  
  start(label) {
    this.startTime = performance.now();
    console.log(`[PERF] Starting: ${label}`);
  },
  
  end(label) {
    if (this.startTime) {
      const duration = performance.now() - this.startTime;
      console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
      this.startTime = null;
    }
  },
  
  measure(label, fn) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
      return result;
  }
};

// Debounce utility
export const debounce = (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
      timeout = null;
      if (!immediate) func(...args);
      };
    const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
    };

// Throttle utility
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
};

// Memoization utility
export const memoize = (fn) => {
    const cache = new Map();
  return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
    const result = fn(...args);
      cache.set(key, result);
      return result;
    };
};

// Deep comparison utility
export const deepEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (let key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
};

// Custom hook for stable references
export const useStableCallback = (callback, deps) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, deps);
};

// Custom hook for stable values
export const useStableValue = (value, deps) => {
  const valueRef = useRef(value);
  
  useEffect(() => {
    if (!deepEqual(valueRef.current, value)) {
      valueRef.current = value;
    }
  }, deps);
  
  return valueRef.current;
};

// Optimized component wrapper
export const withPerformanceOptimization = (Component, options = {}) => {
  const {
    memoize = true,
    customComparison = null,
    displayName = Component.displayName || Component.name
  } = options;
  
  let OptimizedComponent = Component;
  
  if (memoize) {
    OptimizedComponent = React.memo(Component, customComparison);
  }
  
  OptimizedComponent.displayName = `Optimized(${displayName})`;
  
  return OptimizedComponent;
};

// List optimization utilities
export const ListOptimizer = {
  // Get item layout for FlatList optimization
  getItemLayout: (itemHeight) => (data, index) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  }),
  
  // Key extractor for lists
  keyExtractor: (item, index) => item.id || item.key || index.toString(),
  
  // Optimized render item wrapper
  renderItem: (renderItem) => memo(({ item, index }) => renderItem(item, index)),
  
  // Virtualization settings
  getVirtualizationSettings: (itemHeight, containerHeight) => ({
    getItemLayout: ListOptimizer.getItemLayout(itemHeight),
    removeClippedSubviews: Platform.OS === 'android',
    maxToRenderPerBatch: 10,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: Math.ceil(containerHeight / itemHeight) + 2,
    windowSize: 10,
  })
};

// Image optimization utilities
export const ImageOptimizer = {
  // Get optimized image props
  getOptimizedProps: (uri, width, height, quality = 0.8) => ({
    source: { uri },
    style: { width, height },
    resizeMode: 'cover',
    // Add caching and optimization props
    cache: 'force-cache',
    ...(Platform.OS === 'ios' && { progressiveRenderingEnabled: true }),
  }),
  
  // Lazy load images
  LazyImage: memo(({ uri, width, height, style, ...props }) => {
    const [loaded, setLoaded] = React.useState(false);
    const [error, setError] = React.useState(false);
    
    return (
      <React.Fragment>
        {!loaded && !error && (
          <React.Fragment>
            {/* Placeholder */}
          </React.Fragment>
        )}
        <React.Fragment>
          {/* Actual image */}
        </React.Fragment>
      </React.Fragment>
    );
  })
};

// Animation optimization utilities
export const AnimationOptimizer = {
  // Use native driver when possible
  useNativeDriver: true,
  
  // Optimized animation config
  getOptimizedConfig: (duration = 300, useNativeDriver = true) => ({
    duration,
    useNativeDriver,
    ...(Platform.OS === 'ios' && { 
      easing: require('react-native').Easing.bezier(0.4, 0.0, 0.2, 1)
    })
  }),
  
  // Batch animations
  batchAnimations: (animations) => {
    return require('react-native').Animated.parallel(animations, { stopTogether: false });
  }
};

// Memory optimization utilities
export const MemoryOptimizer = {
  // Clean up large objects
  cleanup: (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') {
          MemoryOptimizer.cleanup(obj[key]);
        }
        delete obj[key];
      });
    }
  },
  
  // Weak reference utility
  createWeakRef: (obj) => {
    if (typeof WeakRef !== 'undefined') {
      return new WeakRef(obj);
    }
    // Fallback for environments without WeakRef
    return { deref: () => obj };
  }
};

// Bundle size optimization
export const BundleOptimizer = {
  // Lazy load components
  lazyLoad: (importFunc) => {
    return React.lazy(importFunc);
  },
  
  // Dynamic imports
  dynamicImport: async (modulePath) => {
    try {
      const module = await import(modulePath);
      return module.default || module;
    } catch (error) {
      console.error('Dynamic import failed:', error);
      return null;
    }
  }
};

// Performance hooks
export const usePerformanceOptimization = (componentName) => {
  const renderCount = useRef(0);
  const startTime = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    startTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime.current;
      if (renderTime > 16) { // 60fps threshold
        console.warn(`[PERF] ${componentName} render took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
      }
    };
  });
    
    return {
    renderCount: renderCount.current,
    measureRender: (fn) => PerformanceMonitor.measure(`${componentName} render`, fn)
  };
};

// Performance best practices
export const PerformanceBestPractices = {
  // Avoid inline functions in render
  avoidInlineFunctions: true,
  
  // Use stable references
  useStableReferences: true,
  
  // Memoize expensive calculations
  memoizeExpensiveCalculations: true,
  
  // Optimize list rendering
  optimizeListRendering: true,
  
  // Use native driver for animations
  useNativeDriverForAnimations: true,
  
  // Implement proper cleanup
  implementCleanup: true,
  
  // Monitor performance
  monitorPerformance: true
};

export default {
  PerformanceMonitor,
  debounce,
  throttle,
  memoize,
  deepEqual,
  useStableCallback,
  useStableValue,
  withPerformanceOptimization,
  ListOptimizer,
  ImageOptimizer,
  AnimationOptimizer,
  MemoryOptimizer,
  BundleOptimizer,
  usePerformanceOptimization,
  PerformanceBestPractices
};