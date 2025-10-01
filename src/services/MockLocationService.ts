// Mock Location Service - Full mock implementation for testing
import { MockServiceBase, simulateNetworkDelay, generateMockId, MOCK_CONSTANTS } from './MockServiceManager';

export interface MockLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: 'customer' | 'mechanic' | 'service_center';
  userId?: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface MockLocationSearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // in miles
  rating?: number;
  isOpen?: boolean;
}

export class MockLocationService extends MockServiceBase {
  private locations: MockLocation[] = [];
  private searchResults: MockLocationSearchResult[] = [];

  constructor() {
    super('LocationService');
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // DISABLED FOR TESTING - No mock locations will be created
    console.log('MockLocationService: Mock data initialization is DISABLED for proper testing');
    this.locations = [];

    // Initialize empty search results
    this.searchResults = [];
  }

  // Get current location (mock GPS)
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    await simulateNetworkDelay(500, 1500); // Simulate GPS delay

    // Return mock current location (Times Square)
    return {
      latitude: 40.7580,
      longitude: -73.9855,
    };
  }

  // Get user locations
  async getUserLocations(userId: string): Promise<MockLocation[]> {
    await simulateNetworkDelay(200, 600);

    return this.locations.filter(loc => loc.userId === userId);
  }

  // Add new location
  async addLocation(location: Omit<MockLocation, 'id' | 'createdAt'>): Promise<MockLocation> {
    await simulateNetworkDelay(300, 800);

    const newLocation: MockLocation = {
      ...location,
      id: generateMockId('loc'),
      createdAt: new Date().toISOString(),
    };

    this.locations.push(newLocation);
    console.log(`MockLocationService - Added location: ${newLocation.name}`);
    
    return newLocation;
  }

  // Update location
  async updateLocation(locationId: string, updates: Partial<MockLocation>): Promise<MockLocation | null> {
    await simulateNetworkDelay(200, 600);

    const index = this.locations.findIndex(loc => loc.id === locationId);
    if (index !== -1) {
      this.locations[index] = { ...this.locations[index], ...updates };
      console.log(`MockLocationService - Updated location: ${locationId}`);
      return this.locations[index];
    }
    return null;
  }

  // Delete location
  async deleteLocation(locationId: string): Promise<boolean> {
    await simulateNetworkDelay(200, 500);

    const index = this.locations.findIndex(loc => loc.id === locationId);
    if (index !== -1) {
      this.locations.splice(index, 1);
      console.log(`MockLocationService - Deleted location: ${locationId}`);
      return true;
    }
    return false;
  }

  // Set default location
  async setDefaultLocation(userId: string, locationId: string): Promise<boolean> {
    await simulateNetworkDelay(200, 500);

    // Remove default from all user locations
    this.locations.forEach(loc => {
      if (loc.userId === userId) {
        loc.isDefault = false;
      }
    });

    // Set new default
    const location = this.locations.find(loc => loc.id === locationId && loc.userId === userId);
    if (location) {
      location.isDefault = true;
      console.log(`MockLocationService - Set default location: ${locationId}`);
      return true;
    }
    return false;
  }

  // Search for nearby locations
  async searchNearbyLocations(
    query: string,
    coordinates: { latitude: number; longitude: number },
    radius: number = 10 // miles
  ): Promise<MockLocationSearchResult[]> {
    await simulateNetworkDelay(800, 2000); // Simulate search delay

    const filteredResults = this.searchResults.filter(result => 
      result.name.toLowerCase().includes(query.toLowerCase()) ||
      result.address.toLowerCase().includes(query.toLowerCase())
    );

    // Simulate distance calculation
    const resultsWithDistance = filteredResults.map(result => ({
      ...result,
      distance: this.calculateDistance(coordinates, result.coordinates),
    }));

    // Filter by radius and sort by distance
    return resultsWithDistance
      .filter(result => result.distance <= radius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  // Get directions between two points
  async getDirections(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<{
    distance: string;
    duration: string;
    steps: Array<{
      instruction: string;
      distance: string;
      duration: string;
    }>;
  }> {
    await simulateNetworkDelay(1000, 3000); // Simulate routing delay

    const distance = this.calculateDistance(origin, destination);
    const duration = Math.round(distance * 2); // Assume 30 mph average

    return {
      distance: `${distance.toFixed(1)} mi`,
      duration: `${duration} min`,
      steps: [
        {
          instruction: 'Head north on Main St',
          distance: '0.2 mi',
          duration: '1 min',
        },
        {
          instruction: 'Turn right onto Oak Ave',
          distance: '0.5 mi',
          duration: '2 min',
        },
        {
          instruction: 'Arrive at destination',
          distance: '0.0 mi',
          duration: '0 min',
        },
      ],
    };
  }

  // Geocode address to coordinates
  async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    await simulateNetworkDelay(500, 1500);

    // Mock geocoding - return coordinates for known addresses
    const mockGeocoding: Record<string, { latitude: number; longitude: number }> = {
      '123 main st new york': { latitude: 40.7128, longitude: -74.0060 },
      '456 oak ave los angeles': { latitude: 34.0522, longitude: -118.2437 },
      '789 pine rd chicago': { latitude: 41.8781, longitude: -87.6298 },
    };

    const normalizedAddress = address.toLowerCase().replace(/[^\w\s]/g, '');
    return mockGeocoding[normalizedAddress] || {
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
    };
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(coordinates: { latitude: number; longitude: number }): Promise<string> {
    await simulateNetworkDelay(500, 1500);

    // Mock reverse geocoding
    return `${Math.floor(Math.random() * 9999) + 1} Mock St, Test City, TC 12345`;
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get location by ID
  async getLocationById(locationId: string): Promise<MockLocation | null> {
    await simulateNetworkDelay(100, 300);

    return this.locations.find(loc => loc.id === locationId) || null;
  }

  // Get default location for user
  async getDefaultLocation(userId: string): Promise<MockLocation | null> {
    await simulateNetworkDelay(100, 300);

    return this.locations.find(loc => loc.userId === userId && loc.isDefault) || null;
  }

  // Validate address
  async validateAddress(address: string): Promise<{ valid: boolean; formatted?: string }> {
    await simulateNetworkDelay(200, 600);

    // Mock validation - consider valid if it has at least 10 characters
    const isValid = address.length >= 10;
    
    return {
      valid: isValid,
      formatted: isValid ? address : undefined,
    };
  }

  // Get location history for user
  async getLocationHistory(userId: string, limit: number = 10): Promise<MockLocation[]> {
    await simulateNetworkDelay(200, 500);

    return this.locations
      .filter(loc => loc.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

// Export singleton instance
export const mockLocationService = new MockLocationService();
export default mockLocationService;
