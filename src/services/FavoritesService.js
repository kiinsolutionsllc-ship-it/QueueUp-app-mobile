// Favorites Service - Manages customer favorites for mechanics and shops
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';

class FavoritesService {
  constructor() {
    this.favorites = [];
    this.initialized = false;
  }

  // Initialize the service
  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadFavorites();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize FavoritesService:', error);
    }
  }

  // Load favorites from AsyncStorage
  async loadFavorites() {
    try {
      const favoritesData = await AsyncStorage.getItem('customer_favorites');
      this.favorites = favoritesData ? JSON.parse(favoritesData) : [];
    } catch (error) {
      console.error('Failed to load favorites:', error);
      this.favorites = [];
    }
  }

  // Save favorites to AsyncStorage
  async saveFavorites() {
    try {
      await AsyncStorage.setItem('customer_favorites', JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }

  // Add a mechanic/shop to favorites
  async addToFavorites(customerId, mechanicData) {
    try {
      const favorite = {
        id: `fav-${Date.now()}`,
        customerId,
        mechanicId: mechanicData.id,
        mechanicName: mechanicData.name,
        mechanicType: mechanicData.mechanicType || 'freelance', // 'freelance' or 'shop'
        rating: mechanicData.rating,
        specialties: mechanicData.specialties || [],
        location: mechanicData.location,
        avatar: mechanicData.avatar,
        isAvailable: mechanicData.isAvailable || true,
        addedAt: new Date().toISOString(),
        // Store additional mechanic data for quick access
        mechanicData: {
          ...mechanicData,
          isFavorite: true
        }
      };

      // Check if already favorited
      const existingFavorite = this.favorites.find(
        fav => fav.customerId === customerId && fav.mechanicId === mechanicData.id
      );

      if (existingFavorite) {
        return { success: false, error: 'Mechanic already in favorites' };
      }

      this.favorites.push(favorite);
      await this.saveFavorites();

      // Send notification to mechanic (optional)
      try {
        await NotificationService.notifyMechanic(
          mechanicData.id,
          null,
          'added_to_favorites',
          {
            customerName: 'A customer',
            mechanicName: mechanicData.name
          }
        );
      } catch (error) {
        // Don't fail if notification fails
        console.log('Failed to send favorite notification:', error);
      }

      return { success: true, favorite };
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove a mechanic/shop from favorites
  async removeFromFavorites(customerId, mechanicId) {
    try {
      const initialLength = this.favorites.length;
      this.favorites = this.favorites.filter(
        fav => !(fav.customerId === customerId && fav.mechanicId === mechanicId)
      );

      if (this.favorites.length === initialLength) {
        return { success: false, error: 'Mechanic not found in favorites' };
      }

      await this.saveFavorites();
      return { success: true };
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      return { success: false, error: error.message };
    }
  }

  // Toggle favorite status
  async toggleFavorite(customerId, mechanicData) {
    const isFavorited = this.isFavorited(customerId, mechanicData.id);
    
    if (isFavorited) {
      return await this.removeFromFavorites(customerId, mechanicData.id);
    } else {
      return await this.addToFavorites(customerId, mechanicData);
    }
  }

  // Check if a mechanic is favorited by a customer
  isFavorited(customerId, mechanicId) {
    return this.favorites.some(
      fav => fav.customerId === customerId && fav.mechanicId === mechanicId
    );
  }

  // Get all favorites for a customer
  getCustomerFavorites(customerId) {
    return this.favorites.filter(fav => fav.customerId === customerId);
  }

  // Get favorites by type (freelance or shop)
  getFavoritesByType(customerId, type) {
    return this.favorites.filter(
      fav => fav.customerId === customerId && fav.mechanicType === type
    );
  }

  // Get favorite mechanics (freelance)
  getFavoriteMechanics(customerId) {
    return this.getFavoritesByType(customerId, 'freelance');
  }

  // Get favorite shops
  getFavoriteShops(customerId) {
    return this.getFavoritesByType(customerId, 'shop');
  }

  // Search favorites
  searchFavorites(customerId, query) {
    const customerFavorites = this.getCustomerFavorites(customerId);
    const lowercaseQuery = query.toLowerCase();
    
    return customerFavorites.filter(fav => 
      fav.mechanicName.toLowerCase().includes(lowercaseQuery) ||
      fav.specialties.some(specialty => 
        specialty.toLowerCase().includes(lowercaseQuery)
      ) ||
      fav.location.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get favorite statistics
  getFavoriteStats(customerId) {
    const customerFavorites = this.getCustomerFavorites(customerId);
    
    return {
      total: customerFavorites.length,
      mechanics: customerFavorites.filter(fav => fav.mechanicType === 'freelance').length,
      shops: customerFavorites.filter(fav => fav.mechanicType === 'shop').length,
      available: customerFavorites.filter(fav => fav.isAvailable).length,
      averageRating: customerFavorites.length > 0 
        ? customerFavorites.reduce((sum, fav) => sum + fav.rating, 0) / customerFavorites.length 
        : 0
    };
  }

  // Get recently added favorites
  getRecentFavorites(customerId, limit = 5) {
    const customerFavorites = this.getCustomerFavorites(customerId);
    return customerFavorites
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      .slice(0, limit);
  }

  // Clear all favorites for a customer (useful for account deletion)
  async clearCustomerFavorites(customerId) {
    try {
      this.favorites = this.favorites.filter(fav => fav.customerId !== customerId);
      await this.saveFavorites();
      return { success: true };
    } catch (error) {
      console.error('Failed to clear customer favorites:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all data (for debugging/export)
  getAllData() {
    return [...this.favorites];
  }

  // Utility methods
  isReady() {
    return this.initialized;
  }

  async refresh() {
    await this.loadFavorites();
  }

  // Reset all data (for testing)
  async resetAllData() {
    try {
      this.favorites = [];
      await AsyncStorage.removeItem('customer_favorites');
      return { success: true, message: 'All favorites data reset successfully' };
    } catch (error) {
      console.error('FavoritesService: Error resetting data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export default new FavoritesService();
