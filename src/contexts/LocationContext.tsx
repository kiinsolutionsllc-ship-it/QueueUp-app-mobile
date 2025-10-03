import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// AsyncStorage removed - using Supabase only
import { SavedLocation } from '../types/UserTypes';
import { useAuth } from './AuthContextAWS';

interface LocationContextType {
  homeAddress: SavedLocation | null;
  savedLocations: SavedLocation[];
  loading: boolean;
  setHomeAddress: (address: Omit<SavedLocation, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  addSavedLocation: (location: Omit<SavedLocation, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string }>;
  updateSavedLocation: (id: string, updates: Partial<SavedLocation>) => Promise<{ success: boolean; error?: string }>;
  removeSavedLocation: (id: string) => Promise<{ success: boolean; error?: string }>;
  getCurrentLocation: () => Promise<{ latitude: number; longitude: number; address: string } | null>;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [homeAddress, setHomeAddressState] = useState<SavedLocation | null>(null);
  const [savedLocations, setSavedLocationsState] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load locations from user data
  useEffect(() => {
    if (user) {
      loadLocations();
    }
  }, [user]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      
      if (user?.homeAddress) {
        const home: SavedLocation = {
          id: 'home',
          name: 'Home',
          address: user.homeAddress.address,
          latitude: user.homeAddress.latitude,
          longitude: user.homeAddress.longitude,
          nickname: user.homeAddress.nickname || 'Home',
          isHome: true,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };
        setHomeAddressState(home);
      }

      if (user?.savedLocations) {
        setSavedLocationsState(user.savedLocations);
      }
    } catch (error) {
      console.error('LocationContext: Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const setHomeAddress = async (address: Omit<SavedLocation, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const homeLocation: SavedLocation = {
        ...address,
        id: 'home',
        isHome: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update user data
      const result = await updateUser({
        homeAddress: {
          latitude: address.latitude,
          longitude: address.longitude,
          address: address.address,
          nickname: address.nickname,
        }
      });

      if (result.success) {
        setHomeAddressState(homeLocation);
        
        // Also add to saved locations if not already there
        const existingIndex = savedLocations.findIndex(loc => loc.isHome);
        if (existingIndex >= 0) {
          const updatedLocations = [...savedLocations];
          updatedLocations[existingIndex] = homeLocation;
          setSavedLocationsState(updatedLocations);
        } else {
          setSavedLocationsState(prev => [homeLocation, ...prev]);
        }
      }

      return result;
    } catch (error) {
      console.error('LocationContext: Error setting home address:', error);
      return { success: false, error: 'Failed to set home address' };
    }
  };

  const addSavedLocation = async (location: Omit<SavedLocation, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const newLocation: SavedLocation = {
        ...location,
        id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedLocations = [...savedLocations, newLocation];
      
      // Update user data
      const result = await updateUser({
        savedLocations: updatedLocations
      });

      if (result.success) {
        setSavedLocationsState(updatedLocations);
      }

      return result;
    } catch (error) {
      console.error('LocationContext: Error adding saved location:', error);
      return { success: false, error: 'Failed to add saved location' };
    }
  };

  const updateSavedLocation = async (id: string, updates: Partial<SavedLocation>): Promise<{ success: boolean; error?: string }> => {
    try {
      const updatedLocations = savedLocations.map(location => 
        location.id === id 
          ? { ...location, ...updates, updated_at: new Date().toISOString() }
          : location
      );

      // Update user data
      const result = await updateUser({
        savedLocations: updatedLocations
      });

      if (result.success) {
        setSavedLocationsState(updatedLocations);
        
        // Update home address state if this was the home location
        if (id === 'home' && homeAddress) {
          setHomeAddressState(updatedLocations.find(loc => loc.id === id) || null);
        }
      }

      return result;
    } catch (error) {
      console.error('LocationContext: Error updating saved location:', error);
      return { success: false, error: 'Failed to update saved location' };
    }
  };

  const removeSavedLocation = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Don't allow removing home address
      if (id === 'home') {
        return { success: false, error: 'Cannot remove home address' };
      }

      const updatedLocations = savedLocations.filter(location => location.id !== id);
      
      // Update user data
      const result = await updateUser({
        savedLocations: updatedLocations
      });

      if (result.success) {
        setSavedLocationsState(updatedLocations);
      }

      return result;
    } catch (error) {
      console.error('LocationContext: Error removing saved location:', error);
      return { success: false, error: 'Failed to remove saved location' };
    }
  };

  const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number; address: string } | null> => {
    try {
      // This would integrate with actual location services
      // For now, return null to indicate location services are not available
      console.log('LocationContext: Mock location service - returning null');
      return null;
    } catch (error) {
      console.error('LocationContext: Error getting current location:', error);
      return null;
    }
  };

  const refreshLocations = async (): Promise<void> => {
    await loadLocations();
  };

  const value: LocationContextType = {
    homeAddress,
    savedLocations,
    loading,
    setHomeAddress,
    addSavedLocation,
    updateSavedLocation,
    removeSavedLocation,
    getCurrentLocation,
    refreshLocations,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
