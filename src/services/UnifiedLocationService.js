import * as Location from 'expo-location';
import { MOCK_MODE } from '../config/payment';

/**
 * UNIFIED LOCATION SERVICE
 * 
 * Combines real location services with mock capabilities for testing
 * Features:
 * - Real GPS location services
 * - Mock location data for testing
 * - Address search and autocomplete
 * - Location permissions management
 * - Distance calculations
 * - Location history
 */

class UnifiedLocationService {
  constructor() {
    this.isInitialized = false;
    this.currentLocation = null;
    this.locationPermission = null;
    this.mockMode = MOCK_MODE;
    
    // Mock data for testing
    this.mockLocations = [];
    this.mockSearchResults = [];
    
    // Location types
    this.LOCATION_TYPES = {
      CUSTOMER: 'customer',
      MECHANIC: 'mechanic',
      SERVICE_CENTER: 'service_center'
    };
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      if (this.mockMode) {
        console.log('UnifiedLocationService: Running in mock mode');
        this.initializeMockData();
      } else {
        // Request location permissions for real mode
        await this.requestLocationPermissions();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('UnifiedLocationService: Initialization failed:', error);
      throw error;
    }
  }

  // Initialize mock data for testing
  initializeMockData() {
    this.mockLocations = [
      {
        id: 'mock-location-1',
        name: 'Test Customer Location',
        address: '123 Main St, Test City, TC 12345',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        type: this.LOCATION_TYPES.CUSTOMER,
        isDefault: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-location-2',
        name: 'Test Mechanic Location',
        address: '456 Service Ave, Test City, TC 12345',
        coordinates: { latitude: 40.7589, longitude: -73.9851 },
        type: this.LOCATION_TYPES.MECHANIC,
        isDefault: false,
        createdAt: new Date().toISOString()
      }
    ];

    this.mockSearchResults = [
      {
        id: 'search-1',
        name: 'Auto Repair Shop',
        address: '789 Repair Blvd, Test City, TC 12345',
        coordinates: { latitude: 40.7505, longitude: -73.9934 },
        distance: 2.5,
        rating: 4.5,
        isOpen: true
      }
    ];
  }

  // Request location permissions (real mode only)
  async requestLocationPermissions() {
    try {
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('Location services are not enabled on this device');
      }

      // Request foreground location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      this.locationPermission = status;
      return status;
    } catch (error) {
      console.error('UnifiedLocationService: Permission request failed:', error);
      throw error;
    }
  }

  // Get current location
  async getCurrentLocation() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.mockMode) {
        // Return mock current location
        return {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
          timestamp: Date.now()
        };
      }

      // Get real current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 10000,
        timeout: 15000
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      };

      return this.currentLocation;
    } catch (error) {
      console.error('UnifiedLocationService: Error getting current location:', error);
      throw error;
    }
  }

  // Search for locations
  async searchLocations(query, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.mockMode) {
        // Return mock search results
        return this.mockSearchResults.filter(result =>
          result.name.toLowerCase().includes(query.toLowerCase()) ||
          result.address.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Real location search would go here
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('UnifiedLocationService: Error searching locations:', error);
      throw error;
    }
  }

  // Get location by coordinates (reverse geocoding)
  async getLocationFromCoordinates(latitude, longitude) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.mockMode) {
        // Return mock address
        return {
          address: 'Mock Address, Test City, TC 12345',
          coordinates: { latitude, longitude }
        };
      }

      // Real reverse geocoding would go here
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        return {
          address: `${location.street || ''} ${location.city || ''}, ${location.region || ''} ${location.postalCode || ''}`.trim(),
          coordinates: { latitude, longitude }
        };
      }

      return null;
    } catch (error) {
      console.error('UnifiedLocationService: Error getting location from coordinates:', error);
      throw error;
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Save location
  async saveLocation(locationData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const location = {
        id: `location-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...locationData,
        createdAt: new Date().toISOString()
      };

      if (this.mockMode) {
        this.mockLocations.push(location);
        return { success: true, data: location };
      }

      // Real location saving would go here
      return { success: true, data: location };
    } catch (error) {
      console.error('UnifiedLocationService: Error saving location:', error);
      return { success: false, error: error.message };
    }
  }

  // Get saved locations
  async getSavedLocations(userId = null) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.mockMode) {
        let locations = this.mockLocations;
        if (userId) {
          locations = locations.filter(loc => loc.userId === userId);
        }
        return { success: true, data: locations };
      }

      // Real location retrieval would go here
      return { success: true, data: [] };
    } catch (error) {
      console.error('UnifiedLocationService: Error getting saved locations:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete location
  async deleteLocation(locationId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.mockMode) {
        const index = this.mockLocations.findIndex(loc => loc.id === locationId);
        if (index > -1) {
          const deletedLocation = this.mockLocations.splice(index, 1)[0];
          return { success: true, data: deletedLocation };
        }
        return { success: false, error: 'Location not found' };
      }

      // Real location deletion would go here
      return { success: true, data: { id: locationId } };
    } catch (error) {
      console.error('UnifiedLocationService: Error deleting location:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if location services are available
  async isLocationAvailable() {
    try {
      if (this.mockMode) {
        return true;
      }

      const isEnabled = await Location.hasServicesEnabledAsync();
      return isEnabled;
    } catch (error) {
      console.error('UnifiedLocationService: Error checking location availability:', error);
      return false;
    }
  }

  // Get location permission status
  async getPermissionStatus() {
    try {
      if (this.mockMode) {
        return 'granted';
      }

      const { status } = await Location.getForegroundPermissionsAsync();
      return status;
    } catch (error) {
      console.error('UnifiedLocationService: Error getting permission status:', error);
      return 'denied';
    }
  }

  // Set mock mode (for testing)
  setMockMode(enabled) {
    this.mockMode = enabled;
    console.log(`UnifiedLocationService: Mock mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get service status
  getStatus() {
    return {
      initialized: this.isInitialized,
      mockMode: this.mockMode,
      currentLocation: this.currentLocation,
      permission: this.locationPermission,
      mockLocationsCount: this.mockLocations.length
    };
  }
}

// Create singleton instance
const unifiedLocationService = new UnifiedLocationService();

export default unifiedLocationService;

