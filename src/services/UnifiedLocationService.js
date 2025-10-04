import * as Location from 'expo-location';
import { MOCK_MODE } from '../config/payment';
import { safeSupabase, TABLES } from '../config/supabase';

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
  async saveLocation(locationData, userId = null) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const location = {
        id: `location-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...locationData,
        userId: userId,
        createdAt: new Date().toISOString()
      };

      if (this.mockMode) {
        this.mockLocations.push(location);
        return { success: true, data: location };
      }

      // Save to Supabase for persistence
      if (!safeSupabase) {
        console.warn('UnifiedLocationService: Supabase not configured, cannot save location');
        return { success: false, error: 'Supabase not configured' };
      }

      const locationRecord = {
        ...locationData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await safeSupabase
        .from(TABLES.SAVED_LOCATIONS)
        .insert([locationRecord])
        .select()
        .single();

      if (error) {
        console.error('UnifiedLocationService: Error saving location to Supabase:', error);
        return { success: false, error: error.message };
      }

      console.log('UnifiedLocationService: Location saved to Supabase:', data);
      return { success: true, data: data };
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

      // Get locations from Supabase
      if (!safeSupabase) {
        console.warn('UnifiedLocationService: Supabase not configured, cannot get saved locations');
        return { success: false, error: 'Supabase not configured' };
      }

      let query = safeSupabase
        .from(TABLES.SAVED_LOCATIONS)
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('UnifiedLocationService: Error getting saved locations from Supabase:', error);
        return { success: false, error: error.message };
      }

      console.log('UnifiedLocationService: Retrieved saved locations from Supabase:', data?.length || 0);
      return { success: true, data: data || [] };
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

      // Delete from Supabase
      if (!safeSupabase) {
        console.warn('UnifiedLocationService: Supabase not configured, cannot delete location');
        return { success: false, error: 'Supabase not configured' };
      }

      const { error } = await safeSupabase
        .from(TABLES.SAVED_LOCATIONS)
        .delete()
        .eq('id', locationId);

      if (error) {
        console.error('UnifiedLocationService: Error deleting location from Supabase:', error);
        return { success: false, error: error.message };
      }

      console.log('UnifiedLocationService: Location deleted from Supabase:', locationId);
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

  // Google Maps/Places API integration methods
  async searchPlaces(query, location = null, radius = 5000) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Mock search results for testing
      if (this.mockMode) {
        const mockResults = [
          {
            place_id: 'mock-place-1',
            name: `${query} - Auto Repair Shop`,
            formatted_address: '123 Main St, Test City, TC 12345',
            geometry: {
              location: {
                lat: 40.7128 + (Math.random() - 0.5) * 0.01,
                lng: -74.0060 + (Math.random() - 0.5) * 0.01
              }
            },
            rating: 4.2 + Math.random() * 0.8,
            price_level: Math.floor(Math.random() * 4),
            types: ['car_repair', 'establishment'],
            opening_hours: {
              open_now: Math.random() > 0.3
            }
          }
        ];
        return { success: true, data: mockResults };
      }

      // Real Google Places API call would go here
      // This would require Google Places API key and proper implementation
      console.log('UnifiedLocationService: Google Places API search not implemented yet');
      return { success: true, data: [] };
    } catch (error) {
      console.error('UnifiedLocationService: Error searching places:', error);
      return { success: false, error: error.message };
    }
  }

  async getPlaceDetails(placeId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Mock place details for testing
      if (this.mockMode) {
        const mockDetails = {
          place_id: placeId,
          name: 'Mock Auto Repair Shop',
          formatted_address: '123 Main St, Test City, TC 12345',
          formatted_phone_number: '+1 (555) 123-4567',
          website: 'https://example.com',
          rating: 4.5,
          user_ratings_total: 127,
          opening_hours: {
            open_now: true,
            weekday_text: [
              'Monday: 8:00 AM – 6:00 PM',
              'Tuesday: 8:00 AM – 6:00 PM',
              'Wednesday: 8:00 AM – 6:00 PM',
              'Thursday: 8:00 AM – 6:00 PM',
              'Friday: 8:00 AM – 6:00 PM',
              'Saturday: 9:00 AM – 4:00 PM',
              'Sunday: Closed'
            ]
          },
          photos: [
            { photo_reference: 'mock-photo-1', height: 400, width: 600 }
          ],
          reviews: [
            {
              author_name: 'John Doe',
              rating: 5,
              text: 'Great service and fair prices!',
              time: Date.now() - 86400000
            }
          ]
        };
        return { success: true, data: mockDetails };
      }

      // Real Google Places API call would go here
      console.log('UnifiedLocationService: Google Places API details not implemented yet');
      return { success: true, data: null };
    } catch (error) {
      console.error('UnifiedLocationService: Error getting place details:', error);
      return { success: false, error: error.message };
    }
  }

  async geocodeAddress(address) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Mock geocoding for testing
      if (this.mockMode) {
        const mockResult = {
          formatted_address: address,
          geometry: {
            location: {
              lat: 40.7128 + (Math.random() - 0.5) * 0.01,
              lng: -74.0060 + (Math.random() - 0.5) * 0.01
            }
          },
          place_id: `mock-place-${Date.now()}`,
          types: ['street_address', 'geocode']
        };
        return { success: true, data: mockResult };
      }

      // Real Google Geocoding API call would go here
      console.log('UnifiedLocationService: Google Geocoding API not implemented yet');
      return { success: true, data: null };
    } catch (error) {
      console.error('UnifiedLocationService: Error geocoding address:', error);
      return { success: false, error: error.message };
    }
  }

  async reverseGeocode(latitude, longitude) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Mock reverse geocoding for testing
      if (this.mockMode) {
        const mockResult = {
          formatted_address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)} - Mock Address`,
          geometry: {
            location: {
              lat: latitude,
              lng: longitude
            }
          },
          place_id: `mock-reverse-${Date.now()}`,
          types: ['street_address', 'geocode']
        };
        return { success: true, data: mockResult };
      }

      // Real Google Reverse Geocoding API call would go here
      console.log('UnifiedLocationService: Google Reverse Geocoding API not implemented yet');
      return { success: true, data: null };
    } catch (error) {
      console.error('UnifiedLocationService: Error reverse geocoding:', error);
      return { success: false, error: error.message };
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

