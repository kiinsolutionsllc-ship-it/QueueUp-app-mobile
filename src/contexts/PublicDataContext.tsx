/**
 * Public Data Context
 * 
 * This context provides access to public data that can be loaded before authentication.
 * This includes subscription plans, service types, and app configuration.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PublicDataService, { SubscriptionPlan, ServiceType } from '../services/PublicDataService';

export interface PublicDataContextType {
  // Subscription plans
  subscriptionPlans: SubscriptionPlan[];
  getSubscriptionPlan: (planId: string) => SubscriptionPlan | null;
  
  // Service types
  serviceTypes: ServiceType[];
  getServiceTypesByCategory: (category: string) => ServiceType[];
  getServiceType: (serviceId: string) => ServiceType | null;
  
  // App configuration
  getAppConfig: (key: string) => any;
  getAllAppConfig: () => Map<string, any>;
  
  // Loading state
  loading: boolean;
  error: string | null;
  
  // Refresh function
  refresh: () => Promise<void>;
}

const PublicDataContext = createContext<PublicDataContextType | undefined>(undefined);

export const usePublicData = (): PublicDataContextType => {
  const context = useContext(PublicDataContext);
  if (!context) {
    throw new Error('usePublicData must be used within a PublicDataProvider');
  }
  return context;
};

interface PublicDataProviderProps {
  children: ReactNode;
}

export const PublicDataProvider: React.FC<PublicDataProviderProps> = ({ children }) => {
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize public data
  useEffect(() => {
    const initializePublicData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize the public data service
        await PublicDataService.initialize();
        
        // Load data from the service
        setSubscriptionPlans(PublicDataService.getSubscriptionPlans());
        setServiceTypes(PublicDataService.getServiceTypes());
        
        console.log('PublicDataContext: Public data loaded successfully');
      } catch (err) {
        console.error('PublicDataContext: Error initializing public data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load public data');
      } finally {
        setLoading(false);
      }
    };

    initializePublicData();
  }, []);

  // Get subscription plan by ID
  const getSubscriptionPlan = (planId: string): SubscriptionPlan | null => {
    return PublicDataService.getSubscriptionPlan(planId);
  };

  // Get service types by category
  const getServiceTypesByCategory = (category: string): ServiceType[] => {
    return PublicDataService.getServiceTypesByCategory(category);
  };

  // Get service type by ID
  const getServiceType = (serviceId: string): ServiceType | null => {
    return PublicDataService.getServiceType(serviceId);
  };

  // Get app configuration value
  const getAppConfig = (key: string): any => {
    return PublicDataService.getAppConfig(key);
  };

  // Get all app configuration
  const getAllAppConfig = (): Map<string, any> => {
    return PublicDataService.getAllAppConfig();
  };

  // Refresh public data
  const refresh = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await PublicDataService.refresh();
      
      // Reload data from the service
      setSubscriptionPlans(PublicDataService.getSubscriptionPlans());
      setServiceTypes(PublicDataService.getServiceTypes());
      
      console.log('PublicDataContext: Public data refreshed successfully');
    } catch (err) {
      console.error('PublicDataContext: Error refreshing public data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh public data');
    } finally {
      setLoading(false);
    }
  };

  const value: PublicDataContextType = {
    subscriptionPlans,
    getSubscriptionPlan,
    serviceTypes,
    getServiceTypesByCategory,
    getServiceType,
    getAppConfig,
    getAllAppConfig,
    loading,
    error,
    refresh,
  };

  return (
    <PublicDataContext.Provider value={value}>
      {children}
    </PublicDataContext.Provider>
  );
};
