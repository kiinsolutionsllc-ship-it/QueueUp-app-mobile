import * as React from 'react';
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { safeSupabase } from '../config/supabase';
import { useAuth } from './AuthContextSupabase';

// Define TABLES constant locally
const TABLES = {
  VEHICLES: 'vehicles',
  VEHICLE_SERVICES: 'vehicle_services',
  VEHICLE_ISSUES: 'vehicle_issues',
  VEHICLE_PHOTOS: 'vehicle_photos',
};
import { hapticService } from '../services/HapticService';

// Type definitions
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
  healthScore: number;
  lastService: string;
  nextService: string;
  color?: string;
  vin?: string;
  engineType?: string;
  transmission?: string;
  fuelType?: string;
  customerId?: string;
  // Additional properties used in the app
  nickname?: string;
  trim?: string;
  lastServiceDate?: string;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  serviceType: string;
  description: string;
  cost: number;
  date: string;
  mileage: number;
  status: 'completed' | 'pending' | 'cancelled';
  mechanicId?: string;
  notes?: string;
}

export interface UpcomingService {
  id: string;
  vehicleId: string;
  serviceType: string;
  dueDate: string;
  dueMileage: number;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export interface Recall {
  id: string;
  vehicleId: string;
  recallNumber: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dateIssued: string;
  status: 'open' | 'closed';
}

export interface VehicleState {
  vehicles: Vehicle[];
  serviceHistory: ServiceRecord[];
  upcomingServices: UpcomingService[];
  recalls: Recall[];
  loading: boolean;
  error: string | null;
}

export interface VehicleContextType {
  // State
  vehicles: Vehicle[];
  serviceHistory: ServiceRecord[];
  upcomingServices: UpcomingService[];
  recalls: Recall[];
  loading: boolean;
  error: string | null;
  
  // Actions
  addVehicle: (vehicleData: Partial<Vehicle>) => Promise<Vehicle>;
  updateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => Promise<Vehicle>;
  deleteVehicle: (vehicleId: string) => Promise<void>;
  updateMileage: (vehicleId: string, newMileage: number) => Promise<void>;
  addService: (serviceData: Partial<ServiceRecord>) => Promise<ServiceRecord>;
  clearError: () => void;
  clearAllVehicleData: () => Promise<void>;
  refreshVehicleData: () => Promise<void>;
  
  // Getters
  getVehicleById: (vehicleId: string) => Vehicle | undefined;
  getServicesByVehicleId: (vehicleId: string) => ServiceRecord[];
  getUpcomingServicesByVehicleId: (vehicleId: string) => UpcomingService[];
  getRecallsByVehicleId: (vehicleId: string) => Recall[];
  getVehiclesByCustomer: () => Vehicle[];
}

// Action types
const VEHICLE_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_VEHICLES: 'SET_VEHICLES',
  ADD_VEHICLE: 'ADD_VEHICLE',
  UPDATE_VEHICLE: 'UPDATE_VEHICLE',
  DELETE_VEHICLE: 'DELETE_VEHICLE',
  SET_SERVICE_HISTORY: 'SET_SERVICE_HISTORY',
  ADD_SERVICE: 'ADD_SERVICE',
  UPDATE_SERVICE: 'UPDATE_SERVICE',
  SET_UPCOMING_SERVICES: 'SET_UPCOMING_SERVICES',
  SET_RECALLS: 'SET_RECALLS',
  UPDATE_MILEAGE: 'UPDATE_MILEAGE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_ALL_DATA: 'CLEAR_ALL_DATA',
} as const;

type VehicleActionType = typeof VEHICLE_ACTIONS[keyof typeof VEHICLE_ACTIONS];

interface VehicleAction {
  type: VehicleActionType;
  payload?: any;
}

// Initial state
const initialState: VehicleState = {
  vehicles: [],
  serviceHistory: [],
  upcomingServices: [],
  recalls: [],
  loading: false,
  error: null,
};

// Reducer
function vehicleReducer(state: VehicleState, action: VehicleAction): VehicleState {
  switch (action.type) {
    case VEHICLE_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case VEHICLE_ACTIONS.SET_VEHICLES:
      return { ...state, vehicles: action.payload, loading: false };
    
    case VEHICLE_ACTIONS.ADD_VEHICLE:
      return { 
        ...state, 
        vehicles: [...state.vehicles, action.payload],
        loading: false 
      };
    
    case VEHICLE_ACTIONS.UPDATE_VEHICLE:
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle =>
          vehicle.id === action.payload.id ? action.payload : vehicle
        ),
        loading: false
      };
    
    case VEHICLE_ACTIONS.DELETE_VEHICLE:
      return {
        ...state,
        vehicles: state.vehicles.filter(vehicle => vehicle.id !== action.payload),
        loading: false
      };
    
    case VEHICLE_ACTIONS.SET_SERVICE_HISTORY:
      return { ...state, serviceHistory: action.payload, loading: false };
    
    case VEHICLE_ACTIONS.ADD_SERVICE:
      return {
        ...state,
        serviceHistory: [action.payload, ...state.serviceHistory],
        loading: false
      };
    
    case VEHICLE_ACTIONS.UPDATE_SERVICE:
      return {
        ...state,
        serviceHistory: state.serviceHistory.map(service =>
          service.id === action.payload.id ? action.payload : service
        ),
        loading: false
      };
    
    case VEHICLE_ACTIONS.SET_UPCOMING_SERVICES:
      return { ...state, upcomingServices: action.payload, loading: false };
    
    case VEHICLE_ACTIONS.SET_RECALLS:
      return { ...state, recalls: action.payload, loading: false };
    
    case VEHICLE_ACTIONS.UPDATE_MILEAGE:
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle =>
          vehicle.id === action.payload.vehicleId
            ? { ...vehicle, mileage: action.payload.mileage }
            : vehicle
        ),
        loading: false
      };
    
    case VEHICLE_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case VEHICLE_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case VEHICLE_ACTIONS.CLEAR_ALL_DATA:
      return {
        ...initialState,
        loading: false,
        error: null
      };
    
    default:
      return state;
  }
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

interface VehicleProviderProps {
  children: ReactNode;
}

// Provider component
export function VehicleProvider({ children }: VehicleProviderProps): React.ReactElement {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(vehicleReducer, initialState);

  // Load initial data and reload when user changes
  useEffect(() => {
    loadInitialData();
  }, [user?.id]);

  const loadInitialData = async (): Promise<void> => {
    try {
      dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: true });
      
      console.log('Loading vehicle data for user:', user?.id);
      
      if (!user?.id) {
        console.log('No user ID available, skipping vehicle data load');
        dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      if (!safeSupabase) {
        console.error('Supabase not configured - cannot load vehicle data');
        dispatch({ type: VEHICLE_ACTIONS.SET_ERROR, payload: 'Supabase not configured' });
        dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: false });
        return;
      }
      
      // Load data from Supabase filtered by current user
      const [vehiclesResult, serviceHistoryResult, upcomingServicesResult, recallsResult] = await Promise.all([
        safeSupabase.from(TABLES.VEHICLES).select('*').eq('customer_id', user.id),
        safeSupabase.from('service_history').select('*').eq('customer_id', user.id),
        safeSupabase.from('upcoming_services').select('*').eq('customer_id', user.id),
        safeSupabase.from('recalls').select('*').eq('customer_id', user.id)
      ]);

      const vehicles: Vehicle[] = vehiclesResult.data || [];
      const serviceHistory: ServiceRecord[] = serviceHistoryResult.data || [];
      const upcomingServices: UpcomingService[] = upcomingServicesResult.data || [];
      const recalls: Recall[] = recallsResult.data || [];

      console.log('Loaded vehicles for user:', vehicles.length, vehicles);
      console.log('Vehicle loading errors:', vehiclesResult.error, serviceHistoryResult.error);

      dispatch({ type: VEHICLE_ACTIONS.SET_VEHICLES, payload: vehicles });
      dispatch({ type: VEHICLE_ACTIONS.SET_SERVICE_HISTORY, payload: serviceHistory });
      dispatch({ type: VEHICLE_ACTIONS.SET_UPCOMING_SERVICES, payload: upcomingServices });
      dispatch({ type: VEHICLE_ACTIONS.SET_RECALLS, payload: recalls });
    } catch (error) {
      console.error('Error loading vehicle data:', error);
      dispatch({ type: VEHICLE_ACTIONS.SET_ERROR, payload: (error as Error).message });
    }
  };

  // Vehicle management functions
  const addVehicle = async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: true });
      
      console.log('Adding vehicle:', vehicleData);
      console.log('Current user:', user);
      console.log('User ID:', user?.id);
      
      const newVehicleData = {
        make: vehicleData.make || '',
        model: vehicleData.model || '',
        year: vehicleData.year || new Date().getFullYear(),
        license_plate: vehicleData.licensePlate || '',
        mileage: vehicleData.mileage || 0,
        health_score: calculateHealthScore(vehicleData),
        last_service: new Date().toISOString().split('T')[0],
        next_service: calculateNextServiceDate(),
        color: vehicleData.color,
        vin: vehicleData.vin,
        engine_type: vehicleData.engineType,
        transmission: vehicleData.transmission,
        fuel_type: vehicleData.fuelType,
        customer_id: user?.id || vehicleData.customerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('Vehicle data with customer_id:', newVehicleData);

      // Check if Supabase is properly configured
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl.includes('your-project') || 
          supabaseKey.includes('your-anon-key')) {
        
        // Fallback to local storage when Supabase is not configured
        console.log('Supabase not configured, saving vehicle locally');
        
        const newVehicle: Vehicle = {
          id: Date.now().toString(),
          make: vehicleData.make || '',
          model: vehicleData.model || '',
          year: vehicleData.year || new Date().getFullYear(),
          licensePlate: vehicleData.licensePlate || '',
          mileage: vehicleData.mileage || 0,
          healthScore: calculateHealthScore(vehicleData),
          lastService: new Date().toISOString().split('T')[0],
          nextService: calculateNextServiceDate(),
          color: vehicleData.color,
          vin: vehicleData.vin,
          engineType: vehicleData.engineType,
          transmission: vehicleData.transmission,
          fuelType: vehicleData.fuelType,
          customerId: user?.id || vehicleData.customerId,
          nickname: vehicleData.nickname,
          trim: vehicleData.trim,
          lastServiceDate: vehicleData.lastServiceDate,
        };

        dispatch({ type: VEHICLE_ACTIONS.ADD_VEHICLE, payload: newVehicle });
        
        await hapticService.success();
        
        return newVehicle;
      }

      // Save to Supabase when properly configured
      console.log('Attempting to insert vehicle into Supabase...');
      const { data, error } = await safeSupabase
        .from(TABLES.VEHICLES)
        .insert([newVehicleData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(error.message);
      }
      
      console.log('Vehicle saved successfully to Supabase:', data);

      const newVehicle: Vehicle = {
        id: data.id,
        make: data.make,
        model: data.model,
        year: data.year,
        licensePlate: data.license_plate,
        mileage: data.mileage,
        healthScore: data.health_score,
        lastService: data.last_service,
        nextService: data.next_service,
        color: data.color,
        vin: data.vin,
        engineType: data.engine_type,
        transmission: data.transmission,
        fuelType: data.fuel_type,
        customerId: data.customer_id,
      };

      dispatch({ type: VEHICLE_ACTIONS.ADD_VEHICLE, payload: newVehicle });
      await hapticService.success();
      
      return newVehicle;
    } catch (error) {
      dispatch({ type: VEHICLE_ACTIONS.SET_ERROR, payload: (error as Error).message });
      throw error;
    }
  };

  const updateVehicle = async (vehicleId: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: true });
      
      const existingVehicle = state.vehicles.find(v => v.id === vehicleId);
      if (!existingVehicle) {
        throw new Error('Vehicle not found');
      }

      const updateData = {
        ...(updates.make && { make: updates.make }),
        ...(updates.model && { model: updates.model }),
        ...(updates.year && { year: updates.year }),
        ...(updates.licensePlate && { license_plate: updates.licensePlate }),
        ...(updates.mileage !== undefined && { mileage: updates.mileage }),
        ...(updates.color && { color: updates.color }),
        ...(updates.vin && { vin: updates.vin }),
        ...(updates.engineType && { engine_type: updates.engineType }),
        ...(updates.transmission && { transmission: updates.transmission }),
        ...(updates.fuelType && { fuel_type: updates.fuelType }),
        health_score: calculateHealthScore({ ...existingVehicle, ...updates }),
        updated_at: new Date().toISOString(),
      };

      // Update in Supabase
      const { data, error } = await safeSupabase
        .from(TABLES.VEHICLES)
        .update(updateData)
        .eq('id', vehicleId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const updatedVehicle: Vehicle = {
        id: data.id,
        make: data.make,
        model: data.model,
        year: data.year,
        licensePlate: data.license_plate,
        mileage: data.mileage,
        healthScore: data.health_score,
        lastService: data.last_service,
        nextService: data.next_service,
        color: data.color,
        vin: data.vin,
        engineType: data.engine_type,
        transmission: data.transmission,
        fuelType: data.fuel_type,
        customerId: data.customer_id,
      };

      dispatch({ type: VEHICLE_ACTIONS.UPDATE_VEHICLE, payload: updatedVehicle });
      await hapticService.success();
      
      return updatedVehicle;
    } catch (error) {
      dispatch({ type: VEHICLE_ACTIONS.SET_ERROR, payload: (error as Error).message });
      throw error;
    }
  };

  const deleteVehicle = async (vehicleId: string): Promise<void> => {
    try {
      dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: true });
      
      // Delete from Supabase
      const { error } = await safeSupabase
        .from(TABLES.VEHICLES)
        .delete()
        .eq('id', vehicleId);

      if (error) {
        throw new Error(error.message);
      }

      dispatch({ type: VEHICLE_ACTIONS.DELETE_VEHICLE, payload: vehicleId });
      await hapticService.success();
      
      Alert.alert('Success', 'Vehicle deleted successfully');
    } catch (error) {
      dispatch({ type: VEHICLE_ACTIONS.SET_ERROR, payload: (error as Error).message });
      throw error;
    }
  };

  const updateMileage = async (vehicleId: string, newMileage: number): Promise<void> => {
    try {
      dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: true });
      
      const vehicle = state.vehicles.find(v => v.id === vehicleId);
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }
      if (newMileage < vehicle.mileage) {
        throw new Error('New mileage cannot be less than current mileage');
      }

      dispatch({ 
        type: VEHICLE_ACTIONS.UPDATE_MILEAGE, 
        payload: { vehicleId, mileage: newMileage } 
      });
      
      await hapticService.success();
    } catch (error) {
      dispatch({ type: VEHICLE_ACTIONS.SET_ERROR, payload: (error as Error).message });
      throw error;
    }
  };

  // Service management functions
  const addService = async (serviceData: Partial<ServiceRecord>): Promise<ServiceRecord> => {
    try {
      dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: true });
      
      const newService: ServiceRecord = {
        id: Date.now().toString(),
        vehicleId: serviceData.vehicleId || '',
        serviceType: serviceData.serviceType || '',
        description: serviceData.description || '',
        cost: serviceData.cost || 0,
        date: serviceData.date || new Date().toISOString().split('T')[0],
        mileage: serviceData.mileage || 0,
        status: 'completed',
        mechanicId: serviceData.mechanicId,
        notes: serviceData.notes,
      };

      dispatch({ type: VEHICLE_ACTIONS.ADD_SERVICE, payload: newService });
      await hapticService.success();
      
      return newService;
    } catch (error) {
      dispatch({ type: VEHICLE_ACTIONS.SET_ERROR, payload: (error as Error).message });
      throw error;
    }
  };

  // Utility functions
  const calculateHealthScore = (vehicle: Partial<Vehicle>): number => {
    // Simple health score calculation based on mileage and age
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - (vehicle.year || currentYear);
    const mileagePerYear = (vehicle.mileage || 0) / Math.max(vehicleAge, 1);
    
    let score = 100;
    
    // Deduct points for high mileage
    if (mileagePerYear > 15000) score -= 20;
    else if (mileagePerYear > 12000) score -= 10;
    
    // Deduct points for age
    if (vehicleAge > 10) score -= 15;
    else if (vehicleAge > 5) score -= 5;
    
    return Math.max(score, 0);
  };

  const calculateNextServiceDate = (): string => {
    const nextService = new Date();
    nextService.setMonth(nextService.getMonth() + 3); // 3 months from now
    return nextService.toISOString().split('T')[0];
  };

  const getVehicleById = (vehicleId: string): Vehicle | undefined => {
    return state.vehicles.find(vehicle => vehicle.id === vehicleId);
  };

  const getServicesByVehicleId = (vehicleId: string): ServiceRecord[] => {
    return state.serviceHistory.filter(service => service.vehicleId === vehicleId);
  };

  const getUpcomingServicesByVehicleId = (vehicleId: string): UpcomingService[] => {
    return state.upcomingServices.filter(service => service.vehicleId === vehicleId);
  };

  const getRecallsByVehicleId = (vehicleId: string): Recall[] => {
    return state.recalls.filter(recall => recall.vehicleId === vehicleId);
  };

  const getVehiclesByCustomer = (): Vehicle[] => {
    // Filter vehicles by current user's ID
    if (!user?.id) {
      return [];
    }
    return state.vehicles.filter(vehicle => vehicle.customerId === user.id);
  };

  const clearError = (): void => {
    dispatch({ type: VEHICLE_ACTIONS.CLEAR_ERROR });
  };

  const clearAllVehicleData = async (): Promise<void> => {
    try {
      dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: true });
      
      // Clear data from Supabase (this would typically be done by user ID in a real app)
      // For now, we'll just clear the local state
      dispatch({ type: VEHICLE_ACTIONS.CLEAR_ALL_DATA });
      
      console.log('VehicleContext: All vehicle data cleared');
    } catch (error) {
      dispatch({ type: VEHICLE_ACTIONS.SET_ERROR, payload: (error as Error).message });
      throw error;
    }
  };

  const refreshVehicleData = async (): Promise<void> => {
    console.log('Manually refreshing vehicle data...');
    await loadInitialData();
  };

  const value: VehicleContextType = {
    // State
    vehicles: state.vehicles,
    serviceHistory: state.serviceHistory,
    upcomingServices: state.upcomingServices,
    recalls: state.recalls,
    loading: state.loading,
    error: state.error,
    
    // Actions
    addVehicle,
    updateVehicle,
    deleteVehicle,
    updateMileage,
    addService,
    clearError,
    clearAllVehicleData,
    refreshVehicleData,
    
    // Getters
    getVehicleById,
    getServicesByVehicleId,
    getUpcomingServicesByVehicleId,
    getRecallsByVehicleId,
    getVehiclesByCustomer,
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
}

// Custom hook to use the vehicle context
export function useVehicle(): VehicleContextType {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle must be used within a VehicleProvider');
  }
  return context;
}
