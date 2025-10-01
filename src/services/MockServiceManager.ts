// Mock Service Manager - Centralized mock service management for testing
import { MOCK_MODE } from '../config/payment';

// Mock data generators
export const generateMockId = (prefix: string = 'mock'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateMockEmail = (): string => {
  const domains = ['example.com', 'test.com', 'mock.com'];
  const names = ['user', 'test', 'demo', 'mock'];
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return `${randomName}${Math.floor(Math.random() * 1000)}@${randomDomain}`;
};

export const generateMockPhone = (): string => {
  return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
};

export const generateMockAddress = (): string => {
  const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Cedar Blvd'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  const randomStreet = streets[Math.floor(Math.random() * streets.length)];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const number = Math.floor(Math.random() * 9999) + 1;
  return `${number} ${randomStreet}, ${randomCity}`;
};

// Mock delay simulation
export const simulateNetworkDelay = (min: number = 500, max: number = 2000): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock error simulation
export const simulateRandomError = (errorRate: number = 0.1): boolean => {
  return Math.random() < errorRate;
};

// Mock success/failure simulation
export const simulateSuccess = (successRate: number = 0.9): boolean => {
  return Math.random() < successRate;
};

// Mock service base class
export abstract class MockServiceBase {
  protected serviceName: string;
  protected isInitialized: boolean = false;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  // Public getter for service name
  get name(): string {
    return this.serviceName;
  }

  // Initialize the mock service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log(`MockServiceBase - Initializing ${this.serviceName}`);
    await simulateNetworkDelay(100, 300);
    this.isInitialized = true;
    console.log(`MockServiceBase - ${this.serviceName} initialized`);
  }

  // Check if service is initialized
  isReady(): boolean {
    return this.isInitialized;
  }

  // Simulate API call with delay and potential error
  protected async mockApiCall<T>(
    operation: string,
    data?: any,
    errorRate: number = 0.05
  ): Promise<T> {
    console.log(`MockServiceBase - ${this.serviceName} ${operation}:`, data);
    
    await simulateNetworkDelay();
    
    if (simulateRandomError(errorRate)) {
      throw new Error(`Mock ${this.serviceName} ${operation} failed`);
    }
    
    return {} as T;
  }
}

// Mock service manager
export class MockServiceManager {
  private static instance: MockServiceManager;
  private services: Map<string, MockServiceBase> = new Map();
  private isGlobalMockMode: boolean;

  constructor() {
    this.isGlobalMockMode = MOCK_MODE;
  }

  static getInstance(): MockServiceManager {
    if (!MockServiceManager.instance) {
      MockServiceManager.instance = new MockServiceManager();
    }
    return MockServiceManager.instance;
  }

  // Register a mock service
  registerService(serviceName: string, service: MockServiceBase): void {
    this.services.set(serviceName, service);
    console.log(`MockServiceManager - Registered service: ${serviceName}`);
  }

  // Get a mock service
  getService<T extends MockServiceBase>(serviceName: string): T | undefined {
    return this.services.get(serviceName) as T;
  }

  // Initialize all registered services
  async initializeAllServices(): Promise<void> {
    console.log('MockServiceManager - Initializing all mock services...');
    
    const initPromises = Array.from(this.services.values()).map(service => 
      service.initialize().catch(error => 
        console.error(`MockServiceManager - Failed to initialize ${service.name}:`, error)
      )
    );
    
    await Promise.all(initPromises);
    console.log('MockServiceManager - All mock services initialized');
  }

  // Check if global mock mode is enabled
  isMockMode(): boolean {
    return this.isGlobalMockMode;
  }

  // Set global mock mode
  setMockMode(enabled: boolean): void {
    this.isGlobalMockMode = enabled;
    console.log(`MockServiceManager - Mock mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get all registered services
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  // Reset all services
  async resetAllServices(): Promise<void> {
    console.log('MockServiceManager - Resetting all mock services...');
    this.services.clear();
    console.log('MockServiceManager - All mock services reset');
  }
}

// Export singleton instance
export const mockServiceManager = MockServiceManager.getInstance();

// Mock service decorator for easy service creation
export function MockService(serviceName: string) {
  return function <T extends { new (...args: any[]): MockServiceBase }>(constructor: T) {
    const instance = new constructor();
    mockServiceManager.registerService(serviceName, instance);
    return constructor;
  };
}

// Mock data constants
export const MOCK_CONSTANTS = {
  // User data - Using current date format to match UniqueIdGenerator
  USERS: {
    CUSTOMER: {
      id: 'CUSTOMER-20241215-143000-0001',
      name: 'John Customer',
      email: 'customer@example.com',
      phone: '+1234567890',
      type: 'customer',
    },
    MECHANIC: {
      id: 'MECHANIC-20241215-143000-0001',
      name: 'Mike Mechanic',
      email: 'mechanic@example.com',
      phone: '+1987654321',
      type: 'mechanic',
      rating: 4.8,
      reviewCount: 127,
    },
  },
  
  // Vehicle data
  VEHICLES: {
    SEDAN: {
      id: 'vehicle_123',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      color: 'Silver',
      licensePlate: 'ABC123',
    },
    SUV: {
      id: 'vehicle_456',
      make: 'Honda',
      model: 'CR-V',
      year: 2019,
      color: 'Black',
      licensePlate: 'XYZ789',
    },
  },
  
  // Job data - Updated to use new customer ID
  JOBS: {
    OIL_CHANGE: {
      id: 'JOB-20241215-143000-0001',
      title: 'Oil Change Service',
      description: 'Regular oil change and filter replacement',
      category: 'maintenance',
      subcategory: 'oil-change',
      status: 'pending',
      urgency: 'medium',
      estimatedCost: 50,
      customerId: 'CUSTOMER-20241215-143000-0001',
      customerName: 'John Customer',
    },
    BRAKE_REPAIR: {
      id: 'JOB-20241215-143000-0002',
      title: 'Brake System Repair',
      description: 'Brake pad replacement and system inspection',
      category: 'repair',
      subcategory: 'brake-repair',
      status: 'in_progress',
      urgency: 'high',
      estimatedCost: 200,
      customerId: 'CUSTOMER-20241215-143000-0001',
      customerName: 'John Customer',
    },
  },
  
  // Location data
  LOCATIONS: {
    NEW_YORK: {
      id: 'loc_ny',
      name: 'New York, NY',
      address: '123 Main St, New York, NY 10001',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
    },
    LOS_ANGELES: {
      id: 'loc_la',
      name: 'Los Angeles, CA',
      address: '456 Oak Ave, Los Angeles, CA 90210',
      coordinates: { latitude: 34.0522, longitude: -118.2437 },
    },
  },
};

// Mock response generators
export const generateMockResponse = <T>(data: T, success: boolean = true): { success: boolean; data: T; message?: string } => {
  return {
    success,
    data,
    message: success ? 'Operation completed successfully' : 'Operation failed',
  };
};

// Mock pagination helper
export const generateMockPagination = <T>(
  items: T[],
  page: number = 1,
  limit: number = 10
): { items: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } } => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / limit);

  return {
    items: paginatedItems,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages,
    },
  };
};

// Export for easy access
export default mockServiceManager;
