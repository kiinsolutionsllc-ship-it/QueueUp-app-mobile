import { Platform, Dimensions } from 'react-native';
import { performanceOptimizer } from './PerformanceOptimizer';

class FeatureOptimizer {
  constructor() {
    this.featureFlags = new Map();
    this.performanceMetrics = new Map();
    this.userPreferences = new Map();
    this.deviceCapabilities = this.analyzeDeviceCapabilities();
  }

  // Analyze device capabilities
  analyzeDeviceCapabilities() {
    const { width, height } = Dimensions.get('window');
    const screenSize = Math.sqrt(width * width + height * height);
    
    return {
      platform: Platform.OS,
      screenSize,
      isTablet: screenSize > 1000,
      isLowEndDevice: screenSize < 600,
      hasHapticFeedback: true,
      hasBiometricAuth: true, // This would be checked at runtime
      memoryLimit: this.getMemoryLimit(),
      processorCores: this.getProcessorCores(),
    };
  }

  // Get memory limit based on device
  getMemoryLimit() {
    if (Platform.OS === 'ios') {
      return 2048; // 2GB for iOS
    } else if (Platform.OS === 'android') {
      return 1024; // 1GB for Android
    }
    return 512; // Default
  }

  // Get processor cores (estimated)
  getProcessorCores() {
    if (Platform.OS === 'ios') {
      return 6; // Modern iOS devices
    } else if (Platform.OS === 'android') {
      return 4; // Average Android devices
    }
    return 2; // Default
  }

  // Optimize features based on device capabilities
  optimizeFeatures() {
    const optimizations = {
      animations: this.optimizeAnimations(),
      images: this.optimizeImages(),
      realTime: this.optimizeRealTime(),
      offline: this.optimizeOffline(),
      analytics: this.optimizeAnalytics(),
      security: this.optimizeSecurity(),
    };

    return optimizations;
  }

  // Optimize animations based on device performance
  optimizeAnimations() {
    const { isLowEndDevice, processorCores } = this.deviceCapabilities;
    
    return {
      enableAnimations: !isLowEndDevice,
      animationDuration: isLowEndDevice ? 200 : 300,
      enableComplexAnimations: processorCores >= 4,
      enableGestures: !isLowEndDevice,
      enableParallax: processorCores >= 6,
      enableShadows: !isLowEndDevice,
      enableBlur: processorCores >= 6,
    };
  }

  // Optimize images based on device capabilities
  optimizeImages() {
    const { isLowEndDevice, screenSize } = this.deviceCapabilities;
    
    return {
      quality: isLowEndDevice ? 0.6 : 0.8,
      maxWidth: isLowEndDevice ? 800 : 1200,
      maxHeight: isLowEndDevice ? 600 : 900,
      enableWebP: true,
      enableProgressiveLoading: !isLowEndDevice,
      enableLazyLoading: true,
      enableCaching: true,
      cacheSize: isLowEndDevice ? 50 : 100, // MB
    };
  }

  // Optimize real-time features
  optimizeRealTime() {
    const { isLowEndDevice, processorCores } = this.deviceCapabilities;
    
    return {
      enableWebSocket: true,
      enableHeartbeat: true,
      heartbeatInterval: isLowEndDevice ? 30000 : 15000, // ms
      enableReconnection: true,
      maxReconnectAttempts: isLowEndDevice ? 3 : 5,
      enableMessageQueue: true,
      queueSize: isLowEndDevice ? 50 : 100,
      enableCompression: true,
      enableBatchUpdates: processorCores >= 4,
    };
  }

  // Optimize offline features
  optimizeOffline() {
    const { isLowEndDevice } = this.deviceCapabilities;
    
    return {
      enableOfflineMode: true,
      cacheSize: isLowEndDevice ? 100 : 200, // MB
      enableBackgroundSync: !isLowEndDevice,
      syncInterval: isLowEndDevice ? 300000 : 60000, // ms
      enableDataCompression: true,
      enableSelectiveSync: true,
      maxRetryAttempts: isLowEndDevice ? 2 : 3,
    };
  }

  // Optimize analytics
  optimizeAnalytics() {
    const { isLowEndDevice } = this.deviceCapabilities;
    
    return {
      enableAnalytics: true,
      enableCrashReporting: true,
      enablePerformanceMonitoring: !isLowEndDevice,
      enableUserTracking: true,
      enableEventTracking: true,
      batchSize: isLowEndDevice ? 10 : 20,
      flushInterval: isLowEndDevice ? 60000 : 30000, // ms
      enableDebugMode: process.env.NODE_ENV !== 'production',
    };
  }

  // Optimize security features
  optimizeSecurity() {
    const { hasBiometricAuth, isLowEndDevice } = this.deviceCapabilities;
    
    return {
      enableBiometricAuth: hasBiometricAuth,
      enableEncryption: true,
      enableSecureStorage: true,
      enableSessionTimeout: true,
      sessionTimeout: isLowEndDevice ? 900000 : 1800000, // ms
      enablePasswordValidation: true,
      enableSecurityAudit: !isLowEndDevice,
      enableJailbreakDetection: true,
    };
  }

  // Get optimized configuration for a feature
  getFeatureConfig(featureName) {
    const optimizations = this.optimizeFeatures();
    return optimizations[featureName] || {};
  }

  // Check if a feature should be enabled
  isFeatureEnabled(featureName) {
    const config = this.getFeatureConfig(featureName);
    return config.enable !== false;
  }

  // Get performance-optimized settings
  getPerformanceSettings() {
    const { isLowEndDevice, processorCores, memoryLimit } = this.deviceCapabilities;
    
    return {
      // Rendering
      enableHardwareAcceleration: !isLowEndDevice,
      enableViewFlattening: isLowEndDevice,
      enableRemoveClippedSubviews: isLowEndDevice,
      
      // Memory
      enableMemoryOptimization: true,
      maxMemoryUsage: memoryLimit * 0.8, // 80% of available memory
      enableGarbageCollection: true,
      
      // Network
      enableRequestBatching: isLowEndDevice,
      enableRequestCaching: true,
      enableRequestCompression: true,
      
      // UI
      enableVirtualization: isLowEndDevice,
      enableLazyLoading: true,
      enableImageOptimization: true,
      
      // Background
      enableBackgroundProcessing: !isLowEndDevice,
      enableBackgroundSync: !isLowEndDevice,
      enableBackgroundTasks: processorCores >= 4,
    };
  }

  // Monitor feature performance
  monitorFeaturePerformance(featureName, startTime, endTime) {
    const duration = endTime - startTime;
    const metrics = this.performanceMetrics.get(featureName) || {
      totalCalls: 0,
      totalDuration: 0,
      averageDuration: 0,
      maxDuration: 0,
      minDuration: Infinity,
    };

    metrics.totalCalls++;
    metrics.totalDuration += duration;
    metrics.averageDuration = metrics.totalDuration / metrics.totalCalls;
    metrics.maxDuration = Math.max(metrics.maxDuration, duration);
    metrics.minDuration = Math.min(metrics.minDuration, duration);

    this.performanceMetrics.set(featureName, metrics);

    // Log performance issues
    if (duration > 1000) { // More than 1 second
      console.warn(`Performance issue: ${featureName} took ${duration}ms`);
    }
  }

  // Get performance report
  getPerformanceReport() {
    const report = {
      deviceCapabilities: this.deviceCapabilities,
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      recommendations: this.getPerformanceRecommendations(),
      timestamp: new Date().toISOString(),
    };

    return report;
  }

  // Get performance recommendations
  getPerformanceRecommendations() {
    const recommendations = [];
    const { isLowEndDevice, processorCores, memoryLimit } = this.deviceCapabilities;

    if (isLowEndDevice) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Device has limited resources. Consider reducing animation complexity and image quality.',
        action: 'Enable low-end device optimizations',
      });
    }

    if (processorCores < 4) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Device has limited processing power. Consider reducing real-time features.',
        action: 'Optimize real-time features for low-end devices',
      });
    }

    if (memoryLimit < 1024) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'Device has limited memory. Consider reducing cache sizes and enabling memory optimization.',
        action: 'Enable aggressive memory management',
      });
    }

    return recommendations;
  }

  // Update user preferences
  updateUserPreferences(preferences) {
    this.userPreferences.set('preferences', preferences);
    this.optimizeFeatures(); // Re-optimize based on new preferences
  }

  // Get user preferences
  getUserPreferences() {
    return this.userPreferences.get('preferences') || {};
  }

  // Check if device can handle a feature
  canHandleFeature(featureName, requirements = {}) {
    const { isLowEndDevice, processorCores, memoryLimit } = this.deviceCapabilities;
    const { minProcessorCores = 1, minMemory = 512, requiresHighPerformance = false } = requirements;

    if (requiresHighPerformance && isLowEndDevice) {
      return false;
    }

    if (processorCores < minProcessorCores) {
      return false;
    }

    if (memoryLimit < minMemory) {
      return false;
    }

    return true;
  }

  // Get optimized bundle configuration
  getBundleConfiguration() {
    const { isLowEndDevice } = this.deviceCapabilities;
    
    return {
      enableCodeSplitting: true,
      enableTreeShaking: true,
      enableMinification: true,
      enableCompression: true,
      enableSourceMaps: process.env.NODE_ENV !== 'production',
      enableBundleAnalysis: process.env.NODE_ENV !== 'production',
      maxBundleSize: isLowEndDevice ? 2 * 1024 * 1024 : 5 * 1024 * 1024, // 2MB or 5MB
      enableLazyLoading: true,
      enablePreloading: !isLowEndDevice,
    };
  }

  // Get accessibility optimizations
  getAccessibilityOptimizations() {
    return {
      enableScreenReader: true,
      enableHighContrast: true,
      enableLargeText: true,
      enableReducedMotion: true,
      enableVoiceOver: Platform.OS === 'ios',
      enableTalkBack: Platform.OS === 'android',
      enableHapticFeedback: this.deviceCapabilities.hasHapticFeedback,
      enableAudioCues: true,
      enableVisualCues: true,
    };
  }

  // Get security optimizations
  getSecurityOptimizations() {
    const { hasBiometricAuth, isLowEndDevice } = this.deviceCapabilities;
    
    return {
      enableBiometricAuth: hasBiometricAuth,
      enableEncryption: true,
      enableSecureStorage: true,
      enableSessionTimeout: true,
      enablePasswordValidation: true,
      enableSecurityAudit: !isLowEndDevice,
      enableJailbreakDetection: true,
      enableRootDetection: Platform.OS === 'android',
      enableCertificatePinning: true,
      enableObfuscation: process.env.NODE_ENV === 'production',
    };
  }

  // Get complete optimization configuration
  getCompleteConfiguration() {
    return {
      deviceCapabilities: this.deviceCapabilities,
      featureOptimizations: this.optimizeFeatures(),
      performanceSettings: this.getPerformanceSettings(),
      bundleConfiguration: this.getBundleConfiguration(),
      accessibilityOptimizations: this.getAccessibilityOptimizations(),
      securityOptimizations: this.getSecurityOptimizations(),
      userPreferences: this.getUserPreferences(),
      performanceReport: this.getPerformanceReport(),
    };
  }
}

export const featureOptimizer = new FeatureOptimizer();
