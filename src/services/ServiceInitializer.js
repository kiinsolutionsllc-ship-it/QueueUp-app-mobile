// Service Initializer
// Initializes all services with proper authentication-aware data loading

import UnifiedJobService from './UnifiedJobService';
import NotificationService from './NotificationService';
import MechanicService from './MechanicService';
import PublicDataService from './PublicDataService';
// Firebase notification service disabled for Expo managed workflow
// import firebaseNotificationService from './FirebaseNotificationService';
// MockPaymentService removed - no mock data

class ServiceInitializer {
  constructor() {
    this.initialized = false;
  }

  // Initialize all services with proper authentication-aware data loading
  async initializeServices() {
    if (this.initialized) {
      return;
    }

    try {
      console.log('ServiceInitializer: Initializing services with authentication-aware data loading...');
      
      // Initialize PublicDataService first (can be loaded before authentication)
      await PublicDataService.initialize();
      
      // Initialize UnifiedJobService (will load user data after authentication)
      await UnifiedJobService.initialize();
      
      // Initialize MechanicService
      await MechanicService.initialize();
      
      // Initialize NotificationService
      await NotificationService.initialize();
      
      // Firebase notification service disabled for Expo managed workflow
      // await firebaseNotificationService.initialize();
      
      // Push notifications disabled
      console.log('Push notifications are disabled');
      
      // MockPaymentService removed - no mock data
      
      this.initialized = true;
      console.log('ServiceInitializer: All services initialized successfully');
    } catch (error) {
      console.error('ServiceInitializer: Error initializing services:', error);
    }
  }

  // Initialize user-specific data after authentication
  async initializeUserServices(userId, userType) {
    if (!userId) {
      console.log('ServiceInitializer: No user ID provided, skipping user service initialization');
      return;
    }

    try {
      console.log(`ServiceInitializer: Initializing user-specific services for ${userType} user:`, userId);
      
      // Load user-specific data for services that require authentication
      await Promise.all([
        UnifiedJobService.loadUserData(userId, userType),
        // Add other user-specific service initializations here
      ]);
      
      console.log('ServiceInitializer: User-specific services initialized successfully');
    } catch (error) {
      console.error('ServiceInitializer: Error initializing user services:', error);
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
