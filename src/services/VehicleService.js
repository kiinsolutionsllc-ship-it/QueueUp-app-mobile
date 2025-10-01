import { Alert } from 'react-native';
import { hapticService } from './HapticService';

class VehicleService {
  constructor() {
    this.baseUrl = 'https://api.queued-app.com/vehicles'; // Replace with actual API endpoint
  }

  // Vehicle Management
  async getVehicles() {
    try {
      // Simulate API call
      await this.delay(1000);
      
      // Return empty array - vehicles are now managed by VehicleContext
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addVehicle(vehicleData) {
    try {
      await this.delay(1500);
      
      const newVehicle = {
        id: Date.now().toString(),
        ...vehicleData,
        healthScore: this.calculateHealthScore(vehicleData),
        lastService: new Date().toISOString().split('T')[0],
        nextService: this.calculateNextServiceDate(vehicleData),
      };

      await hapticService.success();
      return { success: true, data: newVehicle };
    } catch (error) {
      await hapticService.error();
      return { success: false, error: error.message };
    }
  }

  async updateVehicle(vehicleId, updates) {
    try {
      await this.delay(1000);
      
      // In a real app, this would be an API call
      const updatedVehicle = { id: vehicleId, ...updates };
      
      await hapticService.success();
      return { success: true, data: updatedVehicle };
    } catch (error) {
      await hapticService.error();
      return { success: false, error: error.message };
    }
  }

  async deleteVehicle(vehicleId) {
    try {
      await this.delay(1000);
      
      await hapticService.success();
      return { success: true };
    } catch (error) {
      await hapticService.error();
      return { success: false, error: error.message };
    }
  }

  // Service History
  async getServiceHistory(vehicleId = null) {
    try {
      await this.delay(1000);
      
      const mockServiceHistory = [
        {
          id: '1',
          vehicleId: '1',
          service: 'Oil Change',
          date: '2024-01-15',
          mileage: 44500,
          cost: 45,
          mechanic: 'Mike Johnson',
          status: 'completed',
          type: 'maintenance',
          description: 'Regular oil change service',
        },
        {
          id: '2',
          vehicleId: '1',
          service: 'Brake Inspection',
          date: '2024-01-10',
          mileage: 44000,
          cost: 120,
          mechanic: 'Sarah Williams',
          status: 'completed',
          type: 'inspection',
          description: 'Complete brake system inspection',
        },
        {
          id: '3',
          vehicleId: '2',
          service: 'Tire Rotation',
          date: '2024-01-08',
          mileage: 61500,
          cost: 60,
          mechanic: 'David Brown',
          status: 'completed',
          type: 'maintenance',
          description: 'Tire rotation and balance',
        },
      ];

      const filteredHistory = vehicleId 
        ? mockServiceHistory.filter(service => service.vehicleId === vehicleId)
        : mockServiceHistory;

      return { success: true, data: filteredHistory };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addService(serviceData) {
    try {
      await this.delay(1500);
      
      const newService = {
        id: Date.now().toString(),
        ...serviceData,
        status: 'completed',
      };

      await hapticService.success();
      return { success: true, data: newService };
    } catch (error) {
      await hapticService.error();
      return { success: false, error: error.message };
    }
  }

  // Upcoming Services
  async getUpcomingServices(vehicleId = null) {
    try {
      await this.delay(1000);
      
      const mockUpcomingServices = [
        {
          id: '1',
          vehicleId: '1',
          service: 'Engine Diagnostic',
          date: '2024-02-15',
          mileage: 45000,
          estimatedCost: 100,
          mechanic: 'Mike Johnson',
          type: 'diagnostic',
          priority: 'high',
          description: 'Check engine light diagnostic',
        },
        {
          id: '2',
          vehicleId: '2',
          service: 'AC System Check',
          date: '2024-03-10',
          mileage: 62000,
          estimatedCost: 75,
          mechanic: 'Lisa Chen',
          type: 'maintenance',
          priority: 'medium',
          description: 'Air conditioning system maintenance',
        },
      ];

      const filteredServices = vehicleId 
        ? mockUpcomingServices.filter(service => service.vehicleId === vehicleId)
        : mockUpcomingServices;

      return { success: true, data: filteredServices };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Recall Notifications
  async getRecalls(vehicleId = null) {
    try {
      await this.delay(1000);
      
      const mockRecalls = [
        {
          id: '1',
          vehicleId: '1',
          title: 'Airbag Recall Notice',
          description: 'Honda has issued a recall for airbag inflators in 2020 Civic models',
          severity: 'high',
          date: '2024-01-20',
          actionRequired: true,
          recallNumber: 'NHTSA-24-001',
        },
        {
          id: '2',
          vehicleId: '2',
          title: 'Software Update Available',
          description: 'Toyota has released a software update for infotainment system',
          severity: 'low',
          date: '2024-01-18',
          actionRequired: false,
          recallNumber: 'NHTSA-24-002',
        },
      ];

      const filteredRecalls = vehicleId 
        ? mockRecalls.filter(recall => recall.vehicleId === vehicleId)
        : mockRecalls;

      return { success: true, data: filteredRecalls };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mileage Tracking
  async updateMileage(vehicleId, newMileage) {
    try {
      await this.delay(1000);
      
      // Validate mileage
      if (isNaN(newMileage) || newMileage < 0) {
        throw new Error('Invalid mileage value');
      }

      await hapticService.success();
      return { success: true, data: { vehicleId, mileage: newMileage } };
    } catch (error) {
      await hapticService.error();
      return { success: false, error: error.message };
    }
  }

  // Service Reminders
  async getServiceReminders(vehicleId = null) {
    try {
      await this.delay(1000);
      
      const mockReminders = [
        {
          id: '1',
          vehicleId: '1',
          service: 'Oil Change Due',
          dueDate: '2024-02-15',
          mileage: 45000,
          priority: 'high',
          type: 'maintenance',
        },
        {
          id: '2',
          vehicleId: '2',
          service: 'Brake Inspection',
          dueDate: '2024-03-10',
          mileage: 62000,
          priority: 'medium',
          type: 'inspection',
        },
      ];

      const filteredReminders = vehicleId 
        ? mockReminders.filter(reminder => reminder.vehicleId === vehicleId)
        : mockReminders;

      return { success: true, data: filteredReminders };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Utility Functions
  calculateHealthScore(vehicle) {
    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - vehicle.year;
    const mileagePerYear = vehicle.mileage / Math.max(vehicleAge, 1);
    
    let score = 100;
    
    // Deduct points for high mileage
    if (mileagePerYear > 15000) score -= 20;
    else if (mileagePerYear > 12000) score -= 10;
    
    // Deduct points for age
    if (vehicleAge > 10) score -= 15;
    else if (vehicleAge > 5) score -= 5;
    
    return Math.max(score, 0);
  }

  calculateNextServiceDate(vehicle) {
    const nextService = new Date();
    nextService.setMonth(nextService.getMonth() + 3); // 3 months from now
    return nextService.toISOString().split('T')[0];
  }

  calculateServiceInterval(vehicle) {
    // Calculate service interval based on vehicle make/model
    const baseInterval = 5000; // miles
    const makeMultiplier = {
      'Honda': 1.0,
      'Toyota': 1.0,
      'BMW': 0.8,
      'Mercedes': 0.8,
      'Audi': 0.8,
    };
    
    return Math.round(baseInterval * (makeMultiplier[vehicle.make] || 1.0));
  }

  // Validation Functions
  validateVehicleData(vehicleData) {
    const errors = [];
    
    if (!vehicleData.make || vehicleData.make.trim() === '') {
      errors.push('Make is required');
    }
    
    if (!vehicleData.model || vehicleData.model.trim() === '') {
      errors.push('Model is required');
    }
    
    if (!vehicleData.year || vehicleData.year < 1900 || vehicleData.year > new Date().getFullYear() + 1) {
      errors.push('Valid year is required');
    }
    
    if (!vehicleData.mileage || vehicleData.mileage < 0) {
      errors.push('Valid mileage is required');
    }
    
    if (!vehicleData.licensePlate || vehicleData.licensePlate.trim() === '') {
      errors.push('License plate is required');
    }
    
    return errors;
  }

  validateServiceData(serviceData) {
    const errors = [];
    
    if (!serviceData.service || serviceData.service.trim() === '') {
      errors.push('Service name is required');
    }
    
    if (!serviceData.date) {
      errors.push('Service date is required');
    }
    
    if (!serviceData.cost || serviceData.cost < 0) {
      errors.push('Valid cost is required');
    }
    
    if (!serviceData.mechanic || serviceData.mechanic.trim() === '') {
      errors.push('Mechanic name is required');
    }
    
    return errors;
  }

  // Helper function to simulate API delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Error handling
  handleError(error, context = 'Vehicle Service') {
    console.error(`${context}:`, error);
    
    const errorMessage = error.message || 'An unexpected error occurred';
    
    Alert.alert(
      'Error',
      errorMessage,
      [{ text: 'OK' }]
    );
  }
}

export const vehicleService = new VehicleService();
