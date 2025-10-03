import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

class LocationService {
  constructor() {
    this.isInitialized = false;
    this.currentLocation = null;
    this.locationPermission = null;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Request location permissions
      await this.requestLocationPermissions();
      this.isInitialized = true;
    } catch (error) {
      console.error('LocationService: Initialization failed:', error);
      throw error;
    }
  }

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
      console.error('LocationService: Permission request failed:', error);
      throw error;
    }
  }

  async getCurrentLocation() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      
      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 60000, // Accept location up to 1 minute old
      });

      this.currentLocation = location;

      return location;
    } catch (error) {
      console.error('LocationService: Failed to get current location:', error);
      throw error;
    }
  }

  async reverseGeocode(latitude, longitude) {
    try {
      
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = this.formatAddress(address);
        
        return {
          success: true,
          address: formattedAddress,
          rawAddress: address,
          coordinates: { latitude, longitude }
        };
      } else {
        throw new Error('No address found for the given coordinates');
      }
    } catch (error) {
      console.error('LocationService: Reverse geocoding failed:', error);
      return {
        success: false,
        error: error.message,
        coordinates: { latitude, longitude }
      };
    }
  }

  formatAddress(address) {
    const parts = [];
    
    // Add street number and name
    if (address.streetNumber && address.street) {
      parts.push(`${address.streetNumber} ${address.street}`);
    } else if (address.street) {
      parts.push(address.street);
    }
    
    // Add city
    if (address.city) {
      parts.push(address.city);
    }
    
    // Add state/province
    if (address.region) {
      parts.push(address.region);
    }
    
    // Add postal code
    if (address.postalCode) {
      parts.push(address.postalCode);
    }
    
    // Add country
    if (address.country) {
      parts.push(address.country);
    }

    return parts.join(', ');
  }

  async getCurrentLocationWithAddress() {
    try {
      // Get current location
      const location = await this.getCurrentLocation();
      
      // Reverse geocode to get address
      const geocodeResult = await this.reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );

      if (geocodeResult.success) {
        return {
          success: true,
          location: location,
          address: geocodeResult.address,
          rawAddress: geocodeResult.rawAddress,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy
          }
        };
      } else {
        // Return location even if geocoding fails
        return {
          success: true,
          location: location,
          address: `${(location.coords.latitude || 0).toFixed(6)}, ${(location.coords.longitude || 0).toFixed(6)}`,
          rawAddress: null,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy
          }
        };
      }
    } catch (error) {
      console.error('LocationService: Failed to get location with address:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async searchAddresses(query) {
    try {
      // Check if Google Places API key is available
      const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!googleMapsApiKey) {
        console.warn('Google Maps API key not found, falling back to Expo Location');
        return await this.searchAddressesFallback(query);
      }

      // Use Google Places API for better address search
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${googleMapsApiKey}&types=address`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
        // Get detailed information for each prediction
        const detailedResults = await Promise.all(
          data.predictions.slice(0, 5).map(async (prediction) => {
            try {
              const detailsResponse = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${googleMapsApiKey}&fields=formatted_address,geometry`
              );
              const detailsData = await detailsResponse.json();
              
              if (detailsData.status === 'OK' && detailsData.result) {
                return {
                  address: detailsData.result.formatted_address,
                  coordinates: {
                    latitude: detailsData.result.geometry.location.lat,
                    longitude: detailsData.result.geometry.location.lng
                  },
                  placeId: prediction.place_id,
                  rawResult: detailsData.result
                };
              }
            } catch (error) {
              console.error('Error fetching place details:', error);
            }
            
            // Fallback to basic prediction data
            return {
              address: prediction.description,
              coordinates: null,
              placeId: prediction.place_id,
              rawResult: prediction
            };
          })
        );

        return {
          success: true,
          results: detailedResults.filter(result => result !== null)
        };
      } else {
        return {
          success: true,
          results: []
        };
      }
    } catch (error) {
      console.error('LocationService: Google Places search failed:', error);
      
      // Fallback to Expo Location if Google Places fails
      return await this.searchAddressesFallback(query);
    }
  }

  // Fallback method using Expo Location
  async searchAddressesFallback(query) {
    try {
      // Ensure we have location permissions before using geocoding
      if (!this.locationPermission || this.locationPermission !== 'granted') {
        await this.requestLocationPermissions();
      }
      
      // Use geocoding to search for addresses
      const results = await Location.geocodeAsync(query);
      
      if (results && results.length > 0) {
        const formattedResults = results.map(result => ({
          coordinates: {
            latitude: result.latitude,
            longitude: result.longitude
          },
          // For search results, we'll use the query as the address
          // since geocoding doesn't return formatted addresses
          address: query,
          rawResult: result
        }));

        return {
          success: true,
          results: formattedResults
        };
      } else {
        return {
          success: true,
          results: []
        };
      }
    } catch (error) {
      console.error('LocationService: Fallback address search failed:', error);
      
      // Return a fallback response instead of failing completely
      return {
        success: false,
        error: error.message,
        results: [],
        fallback: true
      };
    }
  }

  // Utility method to check if location services are available
  async isLocationAvailable() {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      return isEnabled;
    } catch (error) {
      console.error('LocationService: Error checking location availability:', error);
      return false;
    }
  }

  // Utility method to get location permission status
  async getPermissionStatus() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status;
    } catch (error) {
      console.error('LocationService: Error getting permission status:', error);
      return 'undetermined';
    }
  }

  // Show user-friendly error messages
  getErrorMessage(error) {
    if (error.message.includes('permission')) {
      return 'Location permission is required to use this feature. Please enable location access in your device settings.';
    } else if (error.message.includes('timeout')) {
      return 'Location request timed out. Please try again.';
    } else if (error.message.includes('not enabled')) {
      return 'Location services are not enabled. Please enable location services in your device settings.';
    } else if (error.message.includes('geocodeAsync')) {
      return 'Address search is temporarily unavailable. You can still enter your address manually.';
    } else {
      return 'Unable to get your location. Please try again or enter your address manually.';
    }
  }
}

// Create singleton instance
const locationService = new LocationService();

export default locationService;
