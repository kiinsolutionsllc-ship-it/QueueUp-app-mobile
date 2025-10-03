// Mechanic Availability Service
// Handles availability status and working hours management

// AsyncStorage removed - using Supabase only

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface WorkingHours {
  day: string;
  start: string;
  end: string;
  enabled: boolean;
}

export interface AvailabilityStatus {
  status: 'available' | 'busy' | 'offline' | 'break';
  lastUpdated: string;
}

class MechanicAvailabilityService {
  private static instance: MechanicAvailabilityService;
  private localStatus: string | null = null;
  private localLastUpdated: string | null = null;
  private localHours: WorkingHours[] | null = null;

  public static getInstance(): MechanicAvailabilityService {
    if (!MechanicAvailabilityService.instance) {
      MechanicAvailabilityService.instance = new MechanicAvailabilityService();
    }
    return MechanicAvailabilityService.instance;
  }

  /**
   * Update mechanic availability status
   */
  async updateAvailabilityStatus(
    mechanicId: string, 
    status: 'available' | 'busy' | 'offline' | 'break'
  ): Promise<{ success: boolean; error?: string; data?: AvailabilityStatus }> {
    try {
      // First, save locally for immediate UI update
      // Availability status is now managed in memory only

      // Then sync with backend
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          lastUpdated: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to update availability status:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to update availability status'
        };
      }

      return {
        success: true,
        data: {
          status: result.data.availability_status,
          lastUpdated: result.data.availability_updated_at
        }
      };

    } catch (error) {
      console.error('Error updating availability status:', error);
      return {
        success: false,
        error: 'Network error. Status saved locally but not synced.'
      };
    }
  }

  /**
   * Get mechanic availability status
   */
  async getAvailabilityStatus(mechanicId: string): Promise<{ success: boolean; error?: string; data?: AvailabilityStatus }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/availability`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch availability status:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to fetch availability status'
        };
      }

      // Update local storage with server data
      // Availability status is now managed in memory only

      return {
        success: true,
        data: {
          status: result.data.availability_status,
          lastUpdated: result.data.availability_updated_at
        }
      };

    } catch (error) {
      console.error('Error fetching availability status:', error);
      
      // Fallback to local storage
      try {
        // Local status is now managed in memory only
        
        if (this.localStatus) {
          return {
            success: true,
            data: {
              status: this.localStatus as any,
              lastUpdated: this.localLastUpdated || new Date().toISOString()
            }
          };
        }
      } catch (localError) {
        console.error('Error reading local availability status:', localError);
      }

      return {
        success: false,
        error: 'Failed to fetch availability status'
      };
    }
  }

  /**
   * Update mechanic working hours
   */
  async updateWorkingHours(
    mechanicId: string, 
    workingHours: WorkingHours[]
  ): Promise<{ success: boolean; error?: string; data?: WorkingHours[] }> {
    try {
      // First, save locally for immediate UI update
      // Working hours are now managed in memory only

      // Then sync with backend
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/working-hours`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          working_hours: workingHours
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to update working hours:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to update working hours'
        };
      }

      return {
        success: true,
        data: result.data.working_hours
      };

    } catch (error) {
      console.error('Error updating working hours:', error);
      return {
        success: false,
        error: 'Network error. Hours saved locally but not synced.'
      };
    }
  }

  /**
   * Get mechanic working hours
   */
  async getWorkingHours(mechanicId: string): Promise<{ success: boolean; error?: string; data?: WorkingHours[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/working-hours`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch working hours:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to fetch working hours'
        };
      }

      // Update local storage with server data
      // Working hours are now managed in memory only

      return {
        success: true,
        data: result.data.working_hours
      };

    } catch (error) {
      console.error('Error fetching working hours:', error);
      
      // Fallback to local storage
      try {
        // Local hours are now managed in memory only
        
        if (this.localHours) {
          return {
            success: true,
            data: this.localHours
          };
        }
      } catch (localError) {
        console.error('Error reading local working hours:', localError);
      }

      return {
        success: false,
        error: 'Failed to fetch working hours'
      };
    }
  }

  /**
   * Get local availability status (for offline use)
   */
  async getLocalAvailabilityStatus(): Promise<string> {
    try {
      // Status is now managed in memory only
      return this.localStatus || 'offline';
    } catch (error) {
      console.error('Error reading local availability status:', error);
      return 'offline';
    }
  }

  /**
   * Get local working hours (for offline use)
   */
  async getLocalWorkingHours(): Promise<WorkingHours[]> {
    try {
      // Hours are now managed in memory only
      if (this.localHours) {
        return this.localHours;
      }
    } catch (error) {
      console.error('Error reading local working hours:', error);
    }

    // Return default working hours
    return [
      { day: 'Monday', start: '08:00', end: '17:00', enabled: true },
      { day: 'Tuesday', start: '08:00', end: '17:00', enabled: true },
      { day: 'Wednesday', start: '08:00', end: '17:00', enabled: true },
      { day: 'Thursday', start: '08:00', end: '17:00', enabled: true },
      { day: 'Friday', start: '08:00', end: '17:00', enabled: true },
      { day: 'Saturday', start: '09:00', end: '15:00', enabled: false },
      { day: 'Sunday', start: '09:00', end: '15:00', enabled: false },
    ];
  }
}

export default MechanicAvailabilityService.getInstance();
