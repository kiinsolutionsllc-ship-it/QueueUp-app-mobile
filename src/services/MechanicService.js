// Mechanic Service
// Provides mechanic data for the app using Supabase

import { safeSupabase, TABLES } from '../config/supabaseConfig';

class MechanicService {
  constructor() {
    this.mechanics = [];
    this.initialized = false;
  }

  // Initialize the service
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Load mechanics from Supabase
      await this.loadMechanics();
      this.initialized = true;
    } catch (error) {
      console.error('MechanicService: Initialization failed:', error);
    }
  }

  // Load mechanics from Supabase
  async loadMechanics() {
    try {
      if (!safeSupabase) {
        console.warn('MechanicService: Supabase not configured, using empty array');
        this.mechanics = [];
        return;
      }

      const { data, error } = await safeSupabase
        .from(TABLES.MECHANICS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('MechanicService: Error loading mechanics from Supabase:', error);
        this.mechanics = [];
        return;
      }

      this.mechanics = data || [];
      console.log(`MechanicService: Loaded ${this.mechanics.length} mechanics from Supabase`);
    } catch (error) {
      console.error('MechanicService: Error loading mechanics:', error);
      // Fallback to empty array
      this.mechanics = [];
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
      if (!safeSupabase) {
        console.warn('MechanicService: Supabase not configured, cannot add mechanic');
        return { success: false, error: 'Supabase not configured' };
      }

      const newMechanic = {
        ...mechanicData,
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await safeSupabase
        .from(TABLES.MECHANICS)
        .insert([newMechanic])
        .select()
        .single();

      if (error) {
        console.error('MechanicService: Error adding mechanic to Supabase:', error);
        return { success: false, error: error.message };
      }

      // Update local cache
      this.mechanics.unshift(data);
      
      return { success: true, mechanic: data };
    } catch (error) {
      console.error('MechanicService: Error adding mechanic:', error);
      return { success: false, error: error.message };
    }
  }

  // Update mechanic
  async updateMechanic(mechanicId, updates) {
    try {
      if (!safeSupabase) {
        console.warn('MechanicService: Supabase not configured, cannot update mechanic');
        return { success: false, error: 'Supabase not configured' };
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await safeSupabase
        .from(TABLES.MECHANICS)
        .update(updateData)
        .eq('id', mechanicId)
        .select()
        .single();

      if (error) {
        console.error('MechanicService: Error updating mechanic in Supabase:', error);
        return { success: false, error: error.message };
      }

      // Update local cache
      const mechanicIndex = this.mechanics.findIndex(m => m.id === mechanicId);
      if (mechanicIndex !== -1) {
        this.mechanics[mechanicIndex] = data;
      }
      
      return { success: true, mechanic: data };
    } catch (error) {
      console.error('MechanicService: Error updating mechanic:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete mechanic
  async deleteMechanic(mechanicId) {
    try {
      if (!safeSupabase) {
        console.warn('MechanicService: Supabase not configured, cannot delete mechanic');
        return { success: false, error: 'Supabase not configured' };
      }

      const { error } = await safeSupabase
        .from(TABLES.MECHANICS)
        .delete()
        .eq('id', mechanicId);

      if (error) {
        console.error('MechanicService: Error deleting mechanic from Supabase:', error);
        return { success: false, error: error.message };
      }

      // Update local cache
      const mechanicIndex = this.mechanics.findIndex(m => m.id === mechanicId);
      if (mechanicIndex !== -1) {
        this.mechanics.splice(mechanicIndex, 1);
      }
      
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
      if (!safeSupabase) {
        console.warn('MechanicService: Supabase not configured, cannot clear mechanics');
        return;
      }

      const { error } = await safeSupabase
        .from(TABLES.MECHANICS)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('MechanicService: Error clearing mechanics from Supabase:', error);
        return;
      }

      this.mechanics = [];
      console.log('MechanicService: All mechanics cleared from Supabase');
    } catch (error) {
      console.error('MechanicService: Error clearing mechanics:', error);
    }
  }

  // Reset to empty data
  async resetToSampleData() {
    try {
      await this.clearMechanics();
      console.log('MechanicService: Reset to empty data');
    } catch (error) {
      console.error('MechanicService: Error resetting to empty data:', error);
    }
  }
}

export default new MechanicService();
