import * as React from 'react';
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [state, dispatch] = useReducer(vehicleReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (): Promise<void> => {
    try {
      dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: true });
      
      // Try to load saved vehicles from AsyncStorage
      const savedVehicles = await AsyncStorage.getItem('vehicles');
      const savedServiceHistory = await AsyncStorage.getItem('serviceHistory');
      const savedUpcomingServices = await AsyncStorage.getItem('upcomingServices');
      const savedRecalls = await AsyncStorage.getItem('recalls');

      let vehicles: Vehicle[] = [];
      let serviceHistory: ServiceRecord[] = [];
      let upcomingServices: UpcomingService[] = [];
      let recalls: Recall[] = [];

      // Parse saved data if it exists
      if (savedVehicles) {
        vehicles = JSON.parse(savedVehicles);
      } else {
        // Start with empty vehicles array - users can add their own vehicles
        vehicles = [];
      }
      if (savedServiceHistory) {
        serviceHistory = JSON.parse(savedServiceHistory);
      }
      if (savedUpcomingServices) {
        upcomingServices = JSON.parse(savedUpcomingServices);
      }
      if (savedRecalls) {
        recalls = JSON.parse(savedRecalls);
      }

      dispatch({ type: VEHICLE_ACTIONS.SET_VEHICLES, payload: vehicles });
      dispatch({ type: VEHICLE_ACTIONS.SET_SERVICE_HISTORY, payload: serviceHistory });
      dispatch({ type: VEHICLE_ACTIONS.SET_UPCOMING_SERVICES, payload: upcomingServices });
      dispatch({ type: VEHICLE_ACTIONS.SET_RECALLS, payload: recalls });
    } catch (error) {
      dispatch({ type: VEHICLE_ACTIONS.SET_ERROR, payload: (error as Error).message });
    }
  };

  // Vehicle management functions
  const addVehicle = async (vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      dispatch({ type: VEHICLE_ACTIONS.SET_LOADING, payload: true });
      
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
        customerId: vehicleData.customerId,
      };

      dispatch({ type: VEHICLE_ACTIONS.ADD_VEHICLE, payload: newVehicle });
      
      // Save to AsyncStorage
      const updatedVehicles = [...state.vehicles, newVehicle];
      await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      
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

      const updatedVehicle: Vehicle = {
        ...existingVehicle,
        ...updates,
        healthScore: calculateHealthScore({ ...existingVehicle, ...updates }),
      };

      dispatch({ type: VEHICLE_ACTIONS.UPDATE_VEHICLE, payload: updatedVehicle });
      
      // Save to AsyncStorage
      const updatedVehicles = state.vehicles.map(vehicle =>
        vehicle.id === vehicleId ? updatedVehicle : vehicle
      );
      await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      
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
      
      dispatch({ type: VEHICLE_ACTIONS.DELETE_VEHICLE, payload: vehicleId });
      
      // Save to AsyncStorage
      const updatedVehicles = state.vehicles.filter(vehicle => vehicle.id !== vehicleId);
      await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      
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
    // For now, return all vehicles since we don't have customer association in mock data
    // In a real app, this would filter by customerId
    return state.vehicles;
  };

  const clearError = (): void => {
    dispatch({ type: VEHICLE_ACTIONS.CLEAR_ERROR });
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
