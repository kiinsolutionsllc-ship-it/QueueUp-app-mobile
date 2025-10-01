/**
 * Performance Monitoring Configuration
 * Optimizes app performance and provides monitoring capabilities
 */

import React from 'react';
import { Platform } from 'react-native';

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Animation frame rate
  TARGET_FPS: 60,
  MIN_FPS: 30,
  
  // Memory usage (MB)
  MAX_MEMORY_USAGE: 150,
  WARNING_MEMORY_USAGE: 100,
  
  // Bundle size (KB)
  MAX_BUNDLE_SIZE: 2000,
  WARNING_BUNDLE_SIZE: 1500,
  
  // Network timeouts (ms)
  API_TIMEOUT: 10000,
  WEBSOCKET_TIMEOUT: 5000,
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
};

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTime: [],
      memoryUsage: [],
      networkLatency: [],
      errorCount: 0,
      crashCount: 0,
    };
    
    this.isMonitoring = false;
    this.startTime = Date.now();
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startTime = Date.now();
    
    // Monitor frame rate
    this.monitorFrameRate();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor network performance
    this.monitorNetworkPerformance();
  }

  stopMonitoring() {
    this.isMonitoring = false;
  }

  monitorFrameRate() {
    if (!this.isMonitoring) return;
    
    const checkFrameRate = () => {
      const now = Date.now();
      const deltaTime = now - (this.lastFrameTime || now);
      const fps = 1000 / deltaTime;
      
      this.metrics.renderTime.push({
        timestamp: now,
        fps: Math.round(fps),
        deltaTime
      });
      
      // Keep only last 100 measurements
      if (this.metrics.renderTime.length > 100) {
        this.metrics.renderTime.shift();
      }
      
      this.lastFrameTime = now;
      
      if (this.isMonitoring) {
        global.requestAnimationFrame(checkFrameRate);
      }
    };
    
    global.requestAnimationFrame(checkFrameRate);
  }

  monitorMemoryUsage() {
    if (!this.isMonitoring) return;
    
    const checkMemory = () => {
      if (Platform.OS === 'web' && performance.memory) {
        const memoryInfo = performance.memory;
        const usedMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
        
        this.metrics.memoryUsage.push({
          timestamp: Date.now(),
          usedMB,
          totalMB: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
          limitMB: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024)
        });
        
        // Check for memory warnings
        if (usedMB > PERFORMANCE_THRESHOLDS.WARNING_MEMORY_USAGE) {
          console.warn(`High memory usage: ${usedMB}MB`);
        }
      }
      
      if (this.isMonitoring) {
        setTimeout(checkMemory, 5000); // Check every 5 seconds
      }
    };
    
    checkMemory();
  }

  monitorNetworkPerformance() {
    if (!this.isMonitoring) return;
    
    // This would integrate with your API calls
    // For now, we'll just track basic metrics
  }

  recordError(error, context = {}) {
    this.metrics.errorCount++;
    
    const errorData = {
      timestamp: Date.now(),
      error: error.message || error,
      stack: error.stack,
      context,
      platform: Platform.OS,
      version: Platform.Version
    };
    
    console.error('Performance Error:', errorData);
    
    // In production, send to crash reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry, Crashlytics, etc.
    }
  }

  recordCrash(error) {
    this.metrics.crashCount++;
    
    const crashData = {
      timestamp: Date.now(),
      error: error.message || error,
      stack: error.stack,
      metrics: this.getMetrics(),
      platform: Platform.OS,
      version: Platform.Version
    };
    
    console.error('App Crash:', crashData);
    
    // In production, send to crash reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry, Crashlytics, etc.
    }
  }

  getMetrics() {
    const avgFPS = this.metrics.renderTime.length > 0 
      ? Math.round(this.metrics.renderTime.reduce((sum, m) => sum + m.fps, 0) / this.metrics.renderTime.length)
      : 0;
    
    const avgMemory = this.metrics.memoryUsage.length > 0
      ? Math.round(this.metrics.memoryUsage.reduce((sum, m) => sum + m.usedMB, 0) / this.metrics.memoryUsage.length)
      : 0;
    
    return {
      avgFPS,
      avgMemory,
      errorCount: this.metrics.errorCount,
      crashCount: this.metrics.crashCount,
      uptime: Date.now() - this.startTime,
      renderTimeCount: this.metrics.renderTime.length,
      memoryUsageCount: this.metrics.memoryUsage.length
    };
  }

  getPerformanceScore() {
    const metrics = this.getMetrics();
    let score = 100;
    
    // Deduct points for low FPS
    if (metrics.avgFPS < PERFORMANCE_THRESHOLDS.MIN_FPS) {
      score -= 30;
    } else if (metrics.avgFPS < PERFORMANCE_THRESHOLDS.TARGET_FPS) {
      score -= 15;
    }
    
    // Deduct points for high memory usage
    if (metrics.avgMemory > PERFORMANCE_THRESHOLDS.MAX_MEMORY_USAGE) {
      score -= 25;
    } else if (metrics.avgMemory > PERFORMANCE_THRESHOLDS.WARNING_MEMORY_USAGE) {
      score -= 10;
    }
    
    // Deduct points for errors
    score -= Math.min(metrics.errorCount * 2, 20);
    
    // Deduct points for crashes
    score -= Math.min(metrics.crashCount * 10, 30);
    
    return Math.max(0, Math.round(score));
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Performance optimization utilities
export const optimizePerformance = {
  // Debounce function calls
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function calls
  throttle: (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Memoize expensive calculations
  memoize: (func) => {
    const cache = new Map();
    return function executedFunction(...args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func.apply(this, args);
      cache.set(key, result);
      return result;
    };
  },

  // Lazy load components
  lazyLoad: (importFunc) => {
    return React.lazy(importFunc);
  },

  // Optimize images
  optimizeImage: (uri, width, height, quality = 0.8) => {
    if (Platform.OS === 'web') {
      return uri; // Web handles optimization differently
    }
    
    // For React Native, you might use a library like react-native-image-resizer
    return {
      uri,
      width,
      height,
      quality
    };
  }
};

// Performance-aware theme switching
export const getOptimizedTheme = (theme) => {
  const performanceScore = performanceMonitor.getPerformanceScore();
  
  // Reduce animations for low performance
  if (performanceScore < 70) {
    return {
      ...theme,
      animations: {
        ...theme.animations,
        duration: theme.animations.duration * 0.5,
        enabled: false
      }
    };
  }
  
  return theme;
};

export default performanceMonitor;
