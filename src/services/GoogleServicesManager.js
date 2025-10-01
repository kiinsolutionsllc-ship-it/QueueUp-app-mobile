import { Alert } from 'react-native';

class GoogleServicesManager {
  constructor() {
    this.mockupMode = false; // DISABLED FOR TESTING - No mock Google services // Enable mockup mode for deployment
    this.services = {
      maps: { enabled: false, mockup: false }, // DISABLED FOR TESTING
      signin: { enabled: false, mockup: false }, // DISABLED FOR TESTING
      location: { enabled: false, mockup: false }, // DISABLED FOR TESTING
      voice: { enabled: true, mockup: true },
      tts: { enabled: true, mockup: true }
    };
  }

  // Check if any Google service is available
  async isAnyServiceAvailable() {
    if (this.mockupMode) {
      return true; // Always return true in mockup mode
    }
    
    // In real mode, check actual service availability
    return Object.values(this.services).some(service => service.enabled);
  }

  // Get service status
  getServiceStatus(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      return { enabled: false, mockup: false, error: 'Service not found' };
    }
    
    return {
      enabled: service.enabled,
      mockup: this.mockupMode && service.mockup,
      available: service.enabled
    };
  }

  // Enable/disable mockup mode
  setMockupMode(enabled) {
    this.mockupMode = enabled;
  }

  // Get all services status
  getAllServicesStatus() {
    return Object.keys(this.services).reduce((acc, serviceName) => {
      acc[serviceName] = this.getServiceStatus(serviceName);
      return acc;
    }, {});
  }

  // Show mockup alert for any Google service
  showMockupAlert(serviceName, action = 'use') {
    const serviceNames = {
      maps: 'Google Maps',
      signin: 'Google Sign-In',
      location: 'Location Services',
      voice: 'Google Voice',
      tts: 'Text-to-Speech'
    };

    const displayName = serviceNames[serviceName] || serviceName;
    
    Alert.alert(
      '🎯 Preview Mode',
      `This is a preview of ${displayName} integration! In the full version, this feature will work with real ${displayName} services.\n\nThis feature will be available in a future update.`,
      [{ text: 'Got it!' }]
    );
  }

  // Mockup delay for realistic UX
  async simulateDelay(ms = 1000) {
    if (this.mockupMode) {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }


  // Google Maps Service
  async mapsService() {
    if (this.mockupMode) {
      await this.simulateDelay(300);
      return {
        available: true,
        mockup: true,
        message: 'Google Maps preview mode active',
        mockLocation: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'New York, NY (Mock Location)'
        }
      };
    }
    // Real implementation would go here
    return { available: false, mockup: false };
  }

  // Google Sign-In Service
  async signInService() {
    if (this.mockupMode) {
      await this.simulateDelay(800);
      return {
        available: true,
        mockup: true,
        message: 'Google Sign-In preview mode active',
        mockUser: {
          id: 'mock-user-123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          photo: null
        }
      };
    }
    // Real implementation would go here
    return { available: false, mockup: false };
  }

  // Location Services
  async locationService() {
    if (this.mockupMode) {
      await this.simulateDelay(400);
      return {
        available: true,
        mockup: true,
        message: 'Location Services preview mode active',
        mockLocation: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          timestamp: Date.now()
        }
      };
    }
    // Real implementation would go here
    return { available: false, mockup: false };
  }

  // Voice Services
  async voiceService() {
    if (this.mockupMode) {
      await this.simulateDelay(600);
      return {
        available: true,
        mockup: true,
        message: 'Voice Services preview mode active',
        mockTranscription: 'This is a mock voice transcription'
      };
    }
    // Real implementation would go here
    return { available: false, mockup: false };
  }

  // Text-to-Speech Service
  async ttsService() {
    if (this.mockupMode) {
      await this.simulateDelay(200);
      return {
        available: true,
        mockup: true,
        message: 'Text-to-Speech preview mode active'
      };
    }
    // Real implementation would go here
    return { available: false, mockup: false };
  }

  // Get mockup data for UI display
  getMockupData(serviceName) {
    const mockupData = {
      maps: {
        title: 'Google Maps Preview',
        subtitle: 'Find nearby mechanics',
        icon: 'map',
        color: '#34A853'
      },
      signin: {
        title: 'Google Sign-In Preview',
        subtitle: 'Quick account access',
        icon: 'account-circle',
        color: '#EA4335'
      },
      location: {
        title: 'Location Services Preview',
        subtitle: 'GPS-based services',
        icon: 'my-location',
        color: '#FBBC04'
      },
      voice: {
        title: 'Voice Services Preview',
        subtitle: 'Voice commands and dictation',
        icon: 'mic',
        color: '#9AA0A6'
      },
      tts: {
        title: 'Text-to-Speech Preview',
        subtitle: 'Audio feedback and accessibility',
        icon: 'volume-up',
        color: '#9AA0A6'
      }
    };

    return mockupData[serviceName] || {
      title: `${serviceName} Preview`,
      subtitle: 'Google service integration',
      icon: 'extension',
      color: '#5F6368'
    };
  }

  // Check if app is ready for production (all services in mockup mode)
  isProductionReady() {
    return this.mockupMode && Object.values(this.services).every(service => service.mockup);
  }

  // Get production readiness status
  getProductionStatus() {
    const status = this.getAllServicesStatus();
    const totalServices = Object.keys(status).length;
    const mockupServices = Object.values(status).filter(s => s.mockup).length;
    
    return {
      ready: this.isProductionReady(),
      totalServices,
      mockupServices,
      realServices: totalServices - mockupServices,
      percentage: Math.round((mockupServices / totalServices) * 100)
    };
  }
}

export const googleServicesManager = new GoogleServicesManager();
