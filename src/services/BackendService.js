// Backend Service for QueueUp
// Handles all API calls to Supabase backend

import { SupabaseService, TABLES } from '../config/supabase';

class BackendService {
  constructor() {
    this.isOnline = true;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  // Check network connectivity
  async checkConnectivity() {
    try {
      // Simple connectivity check
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'GET',
        timeout: 5000
      });
      this.isOnline = response.ok;
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  // Retry mechanism for failed requests
  async retryRequest(operation, ...args) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await operation(...args);
        if (result.error) {
          throw new Error(result.error.message);
        }
        return result;
      } catch (error) {
        lastError = error;
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }
    
    throw lastError;
  }

  // User Management
  async createUser(userData) {
    return await this.retryRequest(SupabaseService.create, TABLES.USERS, userData);
  }

  async getUser(userId) {
    return await this.retryRequest(SupabaseService.read, TABLES.USERS, { id: userId });
  }

  async updateUser(userId, updates) {
    return await this.retryRequest(SupabaseService.update, TABLES.USERS, userId, updates);
  }

  // Vehicle Management
  async createVehicle(vehicleData) {
    return await this.retryRequest(SupabaseService.create, TABLES.VEHICLES, vehicleData);
  }

  async getVehicles(userId) {
    return await this.retryRequest(SupabaseService.read, TABLES.VEHICLES, { user_id: userId });
  }

  async updateVehicle(vehicleId, updates) {
    return await this.retryRequest(SupabaseService.update, TABLES.VEHICLES, vehicleId, updates);
  }

  async deleteVehicle(vehicleId) {
    return await this.retryRequest(SupabaseService.delete, TABLES.VEHICLES, vehicleId);
  }

  // Job Management
  async createJob(jobData) {
    return await this.retryRequest(SupabaseService.create, TABLES.JOBS, jobData);
  }

  async getJobs(userId, userType) {
    const filters = userType === 'customer' 
      ? { customer_id: userId }
      : { mechanic_id: userId };
    
    return await this.retryRequest(SupabaseService.read, TABLES.JOBS, filters);
  }

  async getJob(jobId) {
    return await this.retryRequest(SupabaseService.read, TABLES.JOBS, { id: jobId });
  }

  async updateJob(jobId, updates) {
    return await this.retryRequest(SupabaseService.update, TABLES.JOBS, jobId, updates);
  }

  async getAvailableJobs(mechanicId, filters = {}) {
    try {
      const { data, error } = await SupabaseService.supabase
        .from(TABLES.JOBS)
        .select(`
          *,
          customer:users!customer_id(*),
          vehicle:vehicles(*)
        `)
        .eq('status', 'pending')
        .neq('mechanic_id', mechanicId)
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Messaging
  async sendMessage(messageData) {
    return await this.retryRequest(SupabaseService.create, TABLES.MESSAGES, messageData);
  }

  async getMessages(jobId) {
    return await this.retryRequest(SupabaseService.read, TABLES.MESSAGES, { job_id: jobId });
  }

  // Payments
  async createPayment(paymentData) {
    return await this.retryRequest(SupabaseService.create, TABLES.PAYMENTS, paymentData);
  }

  async getPayments(userId, userType) {
    const filters = userType === 'customer' 
      ? { customer_id: userId }
      : { mechanic_id: userId };
    
    return await this.retryRequest(SupabaseService.read, TABLES.PAYMENTS, filters);
  }

  async updatePayment(paymentId, updates) {
    return await this.retryRequest(SupabaseService.update, TABLES.PAYMENTS, paymentId, updates);
  }

  // Reviews
  async createReview(reviewData) {
    return await this.retryRequest(SupabaseService.create, TABLES.REVIEWS, reviewData);
  }

  async getReviews(mechanicId) {
    return await this.retryRequest(SupabaseService.read, TABLES.REVIEWS, { mechanic_id: mechanicId });
  }

  // File Upload
  async uploadProfileImage(userId, imageFile) {
    const path = `profiles/${userId}/${Date.now()}.jpg`;
    return await this.retryRequest(SupabaseService.uploadFile, 'profile-images', path, imageFile);
  }

  async uploadVehicleImage(vehicleId, imageFile) {
    const path = `vehicles/${vehicleId}/${Date.now()}.jpg`;
    return await this.retryRequest(SupabaseService.uploadFile, 'vehicle-images', path, imageFile);
  }

  async uploadJobImage(jobId, imageFile) {
    const path = `jobs/${jobId}/${Date.now()}.jpg`;
    return await this.retryRequest(SupabaseService.uploadFile, 'job-images', path, imageFile);
  }

  // Real-time subscriptions
  subscribeToJobUpdates(jobId, callback) {
    return SupabaseService.subscribeToChannel(`job_${jobId}`, callback);
  }

  subscribeToMessages(jobId, callback) {
    return SupabaseService.subscribeToChannel(`messages_${jobId}`, callback);
  }

  subscribeToNotifications(userId, callback) {
    return SupabaseService.subscribeToChannel(`notifications_${userId}`, callback);
  }

  // Search and filtering
  async searchMechanics(filters = {}) {
    try {
      const { data, error } = await SupabaseService.supabase
        .from(TABLES.USERS)
        .select(`
          *,
          mechanic_profile:mechanic_profiles(*),
          reviews:reviews(*)
        `)
        .eq('user_type', 'mechanic')
        .order('created_at', { ascending: false });
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getNearbyMechanics(latitude, longitude, radius = 10) {
    // This would use PostGIS for location-based queries
    // For now, return all mechanics (you can implement location filtering later)
    return await this.searchMechanics();
  }

  // Analytics
  async getJobStats(userId, userType, period = 'month') {
    try {
      const { data, error } = await SupabaseService.supabase
        .from(TABLES.JOBS)
        .select('status, created_at, estimated_cost')
        .eq(userType === 'customer' ? 'customer_id' : 'mechanic_id', userId);
      
      if (error) return { data: null, error };
      
      // Process stats
      const stats = {
        total: data.length,
        completed: data.filter(job => job.status === 'completed').length,
        pending: data.filter(job => job.status === 'pending').length,
        inProgress: data.filter(job => job.status === 'in_progress').length,
        totalRevenue: data
          .filter(job => job.status === 'completed')
          .reduce((sum, job) => sum + (job.estimated_cost || 0), 0)
      };
      
      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Offline support
  async syncOfflineData() {
    // This would sync any offline data when connection is restored
    // Implementation would depend on your offline storage strategy
  }
}

// Create singleton instance
const backendService = new BackendService();

export default backendService;
