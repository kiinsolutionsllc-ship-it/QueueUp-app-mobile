// Service Initializer
// Initializes all services with mock data for development

import UnifiedJobService from './UnifiedJobService';
import NotificationService from './NotificationService';
import MechanicService from './MechanicService';
// MockPaymentService removed - no mock data

class ServiceInitializer {
  constructor() {
    this.initialized = false;
  }

  // Initialize all services with minimal data for testing
  async initializeServices() {
    if (this.initialized) {
      return;
    }

    try {
      
      // Initialize UnifiedJobService with persistence
      await UnifiedJobService.initialize();
      
      // Initialize MechanicService
      await MechanicService.initialize();
      
      // Initialize NotificationService
      await NotificationService.initialize();
      
      // Push notifications disabled
      console.log('Push notifications are disabled');
      
      // MockPaymentService removed - no mock data
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  }


  // Reset all services (useful for testing)
  async resetServices() {
    try {
      
      // Clear all data
      // UnifiedJobService data is managed internally
      
      NotificationService.notifications = [];
      
      // Reset MechanicService to sample data
      await MechanicService.resetToSampleData();
      
      // MockPaymentService removed - no mock data
      
      this.initialized = false;
    } catch (error) {
      console.error('Error resetting services:', error);
    }
  }

  // Get initialization status
  isInitialized() {
    return this.initialized;
  }
}

export default new ServiceInitializer();
