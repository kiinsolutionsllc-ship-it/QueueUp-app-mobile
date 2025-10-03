// Mock Vehicle Service - Full mock implementation for testing
import { MockServiceBase, simulateNetworkDelay, generateMockId, MOCK_CONSTANTS } from './MockServiceManager';

export interface MockVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  vin?: string;
  mileage?: number;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'automatic' | 'manual' | 'cvt';
  engineSize?: string;
  userId: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockVehicleMaintenance {
  id: string;
  vehicleId: string;
  serviceType: string;
  description: string;
  mileage: number;
  cost: number;
  date: string;
  nextServiceDate?: string;
  nextServiceMileage?: number;
}

export interface MockVehicleRecall {
  id: string;
  make: string;
  model: string;
  year: number;
  recallNumber: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dateIssued: string;
  affectedVins?: string[];
}

export class MockVehicleService extends MockServiceBase {
  private vehicles: MockVehicle[] = [];
  private maintenanceRecords: MockVehicleMaintenance[] = [];
  private recalls: MockVehicleRecall[] = [];

  constructor() {
    super('VehicleService');
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // DISABLED FOR TESTING - No mock vehicles will be created
    console.log('MockVehicleService: Mock data initialization is DISABLED for proper testing');
    this.vehicles = [];

    // Initialize empty maintenance records and recalls
    this.maintenanceRecords = [];
    this.recalls = [];
  }

  // Get user vehicles
  async getUserVehicles(userId: string): Promise<MockVehicle[]> {
    await simulateNetworkDelay(200, 600);

    return this.vehicles.filter(vehicle => vehicle.userId === userId);
  }

  // Add new vehicle
  async addVehicle(vehicle: Omit<MockVehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<MockVehicle> {
    await simulateNetworkDelay(300, 800);

    const newVehicle: MockVehicle = {
      ...vehicle,
      id: generateMockId('vehicle'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.vehicles.push(newVehicle);
    console.log(`MockVehicleService - Added vehicle: ${newVehicle.year} ${newVehicle.make} ${newVehicle.model}`);
    
    return newVehicle;
  }

  // Update vehicle
  async updateVehicle(vehicleId: string, updates: Partial<MockVehicle>): Promise<MockVehicle | null> {
    await simulateNetworkDelay(200, 600);

    const index = this.vehicles.findIndex(vehicle => vehicle.id === vehicleId);
    if (index !== -1) {
      this.vehicles[index] = { 
        ...this.vehicles[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      console.log(`MockVehicleService - Updated vehicle: ${vehicleId}`);
      return this.vehicles[index];
    }
    return null;
  }

  // Delete vehicle
  async deleteVehicle(vehicleId: string): Promise<boolean> {
    await simulateNetworkDelay(200, 500);

    const index = this.vehicles.findIndex(vehicle => vehicle.id === vehicleId);
    if (index !== -1) {
      this.vehicles.splice(index, 1);
      // Also delete related maintenance records
      this.maintenanceRecords = this.maintenanceRecords.filter(record => record.vehicleId !== vehicleId);
      console.log(`MockVehicleService - Deleted vehicle: ${vehicleId}`);
      return true;
    }
    return false;
  }

  // Get vehicle by ID
  async getVehicleById(vehicleId: string): Promise<MockVehicle | null> {
    await simulateNetworkDelay(100, 300);

    return this.vehicles.find(vehicle => vehicle.id === vehicleId) || null;
  }

  // Set default vehicle
  async setDefaultVehicle(userId: string, vehicleId: string): Promise<boolean> {
    await simulateNetworkDelay(200, 500);

    // Remove default from all user vehicles
    this.vehicles.forEach(vehicle => {
      if (vehicle.userId === userId) {
        vehicle.isDefault = false;
      }
    });

    // Set new default
    const vehicle = this.vehicles.find(v => v.id === vehicleId && v.userId === userId);
    if (vehicle) {
      vehicle.isDefault = true;
      vehicle.updatedAt = new Date().toISOString();
      console.log(`MockVehicleService - Set default vehicle: ${vehicleId}`);
      return true;
    }
    return false;
  }

  // Get default vehicle for user
  async getDefaultVehicle(userId: string): Promise<MockVehicle | null> {
    await simulateNetworkDelay(100, 300);

    return this.vehicles.find(vehicle => vehicle.userId === userId && vehicle.isDefault) || null;
  }

  // Get vehicle maintenance records
  async getMaintenanceRecords(vehicleId: string): Promise<MockVehicleMaintenance[]> {
    await simulateNetworkDelay(200, 500);

    return this.maintenanceRecords
      .filter(record => record.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Add maintenance record
  async addMaintenanceRecord(record: Omit<MockVehicleMaintenance, 'id'>): Promise<MockVehicleMaintenance> {
    await simulateNetworkDelay(300, 700);

    const newRecord: MockVehicleMaintenance = {
      ...record,
      id: generateMockId('maintenance'),
    };

    this.maintenanceRecords.push(newRecord);
    
    // Update vehicle mileage if provided
    const vehicle = this.vehicles.find(v => v.id === record.vehicleId);
    if (vehicle && record.mileage > (vehicle.mileage || 0)) {
      vehicle.mileage = record.mileage;
      vehicle.updatedAt = new Date().toISOString();
    }

    console.log(`MockVehicleService - Added maintenance record: ${record.serviceType}`);
    return newRecord;
  }

  // Get upcoming maintenance
  async getUpcomingMaintenance(userId: string): Promise<MockVehicleMaintenance[]> {
    await simulateNetworkDelay(200, 500);

    const userVehicles = this.vehicles.filter(v => v.userId === userId);
    const vehicleIds = userVehicles.map(v => v.id);
    
    const upcoming = this.maintenanceRecords.filter(record => {
      if (!vehicleIds.includes(record.vehicleId)) return false;
      
      const nextDate = record.nextServiceDate ? new Date(record.nextServiceDate) : null;
      const nextMileage = record.nextServiceMileage || 0;
      const vehicle = userVehicles.find(v => v.id === record.vehicleId);
      
      if (nextDate && nextDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) return true;
      if (nextMileage > 0 && vehicle && vehicle.mileage && vehicle.mileage >= nextMileage - 1000) return true;
      
      return false;
    });

    return upcoming;
  }

  // Get vehicle recalls
  async getVehicleRecalls(vehicleId: string): Promise<MockVehicleRecall[]> {
    await simulateNetworkDelay(200, 500);

    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return [];

    return this.recalls.filter(recall => 
      recall.make === vehicle.make &&
      recall.model === vehicle.model &&
      recall.year === vehicle.year &&
      (!recall.affectedVins || recall.affectedVins.includes(vehicle.vin || ''))
    );
  }

  // Get all recalls for user's vehicles
  async getUserVehicleRecalls(userId: string): Promise<Array<MockVehicleRecall & { vehicleId: string }>> {
    await simulateNetworkDelay(300, 700);

    const userVehicles = this.vehicles.filter(v => v.userId === userId);
    const allRecalls: Array<MockVehicleRecall & { vehicleId: string }> = [];

    for (const vehicle of userVehicles) {
      const vehicleRecalls = await this.getVehicleRecalls(vehicle.id);
      allRecalls.push(...vehicleRecalls.map(recall => ({ ...recall, vehicleId: vehicle.id })));
    }

    return allRecalls;
  }

  // Validate VIN
  async validateVIN(vin: string): Promise<{ valid: boolean; make?: string; model?: string; year?: number }> {
    await simulateNetworkDelay(200, 600);

    // Mock VIN validation
    const isValid = vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
    
    if (isValid) {
      // Mock decode based on VIN pattern
      return {
        valid: true,
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
      };
    }

    return { valid: false };
  }

  // Search vehicles by make/model
  async searchVehicles(query: string): Promise<Array<{ make: string; model: string; years: number[] }>> {
    await simulateNetworkDelay(300, 800);

    const results = [
      { make: 'Toyota', model: 'Camry', years: [2018, 2019, 2020, 2021, 2022] },
      { make: 'Honda', model: 'Civic', years: [2018, 2019, 2020, 2021, 2022] },
      { make: 'Ford', model: 'F-150', years: [2018, 2019, 2020, 2021, 2022] },
      { make: 'Chevrolet', model: 'Silverado', years: [2018, 2019, 2020, 2021, 2022] },
    ];

    return results.filter(result => 
      result.make.toLowerCase().includes(query.toLowerCase()) ||
      result.model.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get vehicle statistics
  async getVehicleStats(userId: string): Promise<{
    totalVehicles: number;
    totalMileage: number;
    averageMileage: number;
    maintenanceCount: number;
    recallCount: number;
  }> {
    await simulateNetworkDelay(200, 500);

    const userVehicles = this.vehicles.filter(v => v.userId === userId);
    const totalMileage = userVehicles.reduce((sum, v) => sum + (v.mileage || 0), 0);
    const averageMileage = userVehicles.length > 0 ? totalMileage / userVehicles.length : 0;
    
    const vehicleIds = userVehicles.map(v => v.id);
    const maintenanceCount = this.maintenanceRecords.filter(r => vehicleIds.includes(r.vehicleId)).length;
    const recallCount = (await this.getUserVehicleRecalls(userId)).length;

    return {
      totalVehicles: userVehicles.length,
      totalMileage,
      averageMileage,
      maintenanceCount,
      recallCount,
    };
  }

  // Get maintenance reminders
  async getMaintenanceReminders(userId: string): Promise<Array<{
    vehicle: MockVehicle;
    maintenance: MockVehicleMaintenance;
    type: 'date' | 'mileage' | 'both';
    urgency: 'low' | 'medium' | 'high';
  }>> {
    await simulateNetworkDelay(300, 700);

    const upcoming = await this.getUpcomingMaintenance(userId);
    const reminders: Array<{
      vehicle: MockVehicle;
      maintenance: MockVehicleMaintenance;
      type: 'date' | 'mileage' | 'both';
      urgency: 'low' | 'medium' | 'high';
    }> = [];

    for (const maintenance of upcoming) {
      const vehicle = this.vehicles.find(v => v.id === maintenance.vehicleId);
      if (!vehicle) continue;

      let type: 'date' | 'mileage' | 'both' = 'date';
      let urgency: 'low' | 'medium' | 'high' = 'low';

      const nextDate = maintenance.nextServiceDate ? new Date(maintenance.nextServiceDate) : null;
      const nextMileage = maintenance.nextServiceMileage || 0;
      const currentMileage = vehicle.mileage || 0;

      if (nextDate && nextMileage > 0) {
        type = 'both';
      } else if (nextMileage > 0) {
        type = 'mileage';
      }

      // Determine urgency
      if (nextDate && nextDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
        urgency = 'high';
      } else if (nextDate && nextDate <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)) {
        urgency = 'medium';
      } else if (nextMileage > 0 && currentMileage >= nextMileage - 500) {
        urgency = 'high';
      } else if (nextMileage > 0 && currentMileage >= nextMileage - 1000) {
        urgency = 'medium';
      }

      reminders.push({ vehicle, maintenance, type, urgency });
    }

    return reminders;
  }
}

// Export singleton instance
export const mockVehicleService = new MockVehicleService();
export default mockVehicleService;
