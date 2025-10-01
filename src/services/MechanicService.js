// Mechanic Service
// Provides mechanic data for the app

import AsyncStorage from '@react-native-async-storage/async-storage';

class MechanicService {
  constructor() {
    this.mechanics = [];
    this.initialized = false;
  }

  // Initialize the service
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load mechanics from storage or use sample data
      await this.loadMechanics();
      this.initialized = true;
    } catch (error) {
      console.error('MechanicService: Initialization failed:', error);
    }
  }

  // Load mechanics from storage or sample data
  async loadMechanics() {
    try {
      // Try to load from AsyncStorage first
      const storedMechanics = await AsyncStorage.getItem('mechanics');
      
      if (storedMechanics) {
        this.mechanics = JSON.parse(storedMechanics);
      } else {
        // Start with empty mechanics array
        this.mechanics = [];
        // Save empty array to storage
        await AsyncStorage.setItem('mechanics', JSON.stringify(this.mechanics));
      }
      
      console.log(`MechanicService: Loaded ${this.mechanics.length} mechanics`);
    } catch (error) {
      console.error('MechanicService: Error loading mechanics:', error);
      // Fallback to empty array
      this.mechanics = [];
    }
  }

  // Save mechanics to storage
  async saveMechanics() {
    try {
      await AsyncStorage.setItem('mechanics', JSON.stringify(this.mechanics));
    } catch (error) {
      console.error('MechanicService: Error saving mechanics:', error);
    }
  }

  // Get all mechanics
  getAllMechanics() {
    return this.mechanics;
  }

  // Get available mechanics
  getAvailableMechanics() {
    return this.mechanics.filter(mechanic => mechanic.isAvailable);
  }

  // Get mechanic by ID
  getMechanicById(mechanicId) {
    return this.mechanics.find(mechanic => mechanic.id === mechanicId);
  }

  // Get mechanics by specialty
  getMechanicsBySpecialty(specialty) {
    return this.mechanics.filter(mechanic => 
      mechanic.specialties && mechanic.specialties.includes(specialty)
    );
  }

  // Get mechanics by location (within radius)
  getMechanicsByLocation(latitude, longitude, radiusKm = 50) {
    return this.mechanics.filter(mechanic => {
      if (!mechanic.location) return false;
      
      const distance = this.calculateDistance(
        latitude, longitude,
        mechanic.location.latitude, mechanic.location.longitude
      );
      
      return distance <= radiusKm;
    });
  }

  // Calculate distance between two points in kilometers
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return d;
  }

  // Convert degrees to radians
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Add a new mechanic
  async addMechanic(mechanicData) {
    try {
      const newMechanic = {
        ...mechanicData,
        id: `mechanic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        joinDate: new Date().toISOString(),
        isAvailable: true,
      };
      
      this.mechanics.push(newMechanic);
      await this.saveMechanics();
      
      return { success: true, mechanic: newMechanic };
    } catch (error) {
      console.error('MechanicService: Error adding mechanic:', error);
      return { success: false, error: error.message };
    }
  }

  // Update mechanic
  async updateMechanic(mechanicId, updates) {
    try {
      const mechanicIndex = this.mechanics.findIndex(m => m.id === mechanicId);
      
      if (mechanicIndex === -1) {
        return { success: false, error: 'Mechanic not found' };
      }
      
      this.mechanics[mechanicIndex] = {
        ...this.mechanics[mechanicIndex],
        ...updates,
      };
      
      await this.saveMechanics();
      
      return { success: true, mechanic: this.mechanics[mechanicIndex] };
    } catch (error) {
      console.error('MechanicService: Error updating mechanic:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete mechanic
  async deleteMechanic(mechanicId) {
    try {
      const mechanicIndex = this.mechanics.findIndex(m => m.id === mechanicId);
      
      if (mechanicIndex === -1) {
        return { success: false, error: 'Mechanic not found' };
      }
      
      this.mechanics.splice(mechanicIndex, 1);
      await this.saveMechanics();
      
      return { success: true };
    } catch (error) {
      console.error('MechanicService: Error deleting mechanic:', error);
      return { success: false, error: error.message };
    }
  }

  // Search mechanics
  searchMechanics(query) {
    const lowercaseQuery = query.toLowerCase();
    
    return this.mechanics.filter(mechanic => 
      mechanic.name.toLowerCase().includes(lowercaseQuery) ||
      mechanic.specialties?.some(specialty => 
        specialty.toLowerCase().includes(lowercaseQuery)
      ) ||
      mechanic.statement?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get top rated mechanics
  getTopRatedMechanics(limit = 10) {
    return this.mechanics
      .filter(mechanic => mechanic.rating)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  // Get mechanics by price range
  getMechanicsByPriceRange(minPrice, maxPrice) {
    return this.mechanics.filter(mechanic => 
      mechanic.hourlyRate >= minPrice && mechanic.hourlyRate <= maxPrice
    );
  }

  // Clear all mechanics (for testing)
  async clearMechanics() {
    try {
      this.mechanics = [];
      await AsyncStorage.removeItem('mechanics');
      console.log('MechanicService: All mechanics cleared');
    } catch (error) {
      console.error('MechanicService: Error clearing mechanics:', error);
    }
  }

  // Reset to empty data
  async resetToSampleData() {
    try {
      this.mechanics = [];
      await this.saveMechanics();
      console.log('MechanicService: Reset to empty data');
    } catch (error) {
      console.error('MechanicService: Error resetting to empty data:', error);
    }
  }
}

export default new MechanicService();
