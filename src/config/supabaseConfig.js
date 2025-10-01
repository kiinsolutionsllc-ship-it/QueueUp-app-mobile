// Supabase Configuration with Mock Support
// This file provides a unified interface for both real and mock Supabase

import { createClient } from '@supabase/supabase-js';
// MockSupabaseService removed - no mock data

// Environment configuration
const USE_MOCK_SUPABASE = process.env.EXPO_PUBLIC_USE_MOCK_SUPABASE === 'true' || 
                         process.env.NODE_ENV === 'development' ||
                         !process.env.EXPO_PUBLIC_SUPABASE_URL ||
                         process.env.EXPO_PUBLIC_SUPABASE_URL === 'your_supabase_project_url';

// Real Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your_supabase_project_url';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key';

// Create real Supabase client only when not using mock
const realSupabase = USE_MOCK_SUPABASE ? null : createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Choose which Supabase instance to use
export const supabase = realSupabase;

// Log configuration status

// Database table names
export const TABLES = {
  USERS: 'users',
  VEHICLES: 'vehicles',
  JOBS: 'jobs',
  MESSAGES: 'messages',
  PAYMENTS: 'payments',
  REVIEWS: 'reviews',
  MECHANIC_PROFILES: 'mechanic_profiles',
  SERVICE_CATEGORIES: 'service_categories',
  BIDS: 'bids',
  DISPUTES: 'disputes',
  PAYOUTS: 'payouts'
};

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROFILE_IMAGES: 'profile-images',
  VEHICLE_IMAGES: 'vehicle-images',
  JOB_IMAGES: 'job-images',
  DOCUMENTS: 'documents'
};

// Real-time channels
export const REALTIME_CHANNELS = {
  JOBS: 'jobs',
  MESSAGES: 'messages',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  BIDS: 'bids'
};

// Enhanced Supabase service with mock support
export class SupabaseService {
  // Authentication
  static async signUp(email, password, userData) {
    try {
      if (USE_MOCK_SUPABASE || !realSupabase) {
        return await supabase.auth.signUp({ email, password, options: { data: userData } });
      }
      
      const { data, error } = await realSupabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async signIn(email, password) {
    try {
      if (USE_MOCK_SUPABASE || !realSupabase) {
        return await supabase.auth.signInWithPassword({ email, password });
      }
      
      const { data, error } = await realSupabase.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  }

  // Database operations
  static async create(table, data) {
    try {
      if (USE_MOCK_SUPABASE) {
        return await supabase.from(table).insert([data]).select().single();
      }
      
      const { data: result, error } = await supabase
        .from(table)
        .insert([data])
        .select()
        .single();
      return { data: result, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async read(table, filters = {}) {
    try {
      if (USE_MOCK_SUPABASE) {
        let query = supabase.from(table).select('*');
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        return await query;
      }
      
      let query = supabase.from(table).select('*');
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async update(table, id, updates) {
    try {
      if (USE_MOCK_SUPABASE) {
        return await supabase.from(table).update(updates).eq('id', id).select().single();
      }
      
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async delete(table, id) {
    try {
      if (USE_MOCK_SUPABASE) {
        return await supabase.from(table).delete().eq('id', id);
      }
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      return { error };
    }
  }

  // File upload
  static async uploadFile(bucket, path, file) {
    try {
      if (USE_MOCK_SUPABASE) {
        return await supabase.storage.from(bucket).upload(path, file);
      }
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get file URL
  static getFileUrl(bucket, path) {
    if (USE_MOCK_SUPABASE) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    }
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  // Real-time subscriptions
  static subscribeToChannel(channel, callback) {
    if (USE_MOCK_SUPABASE) {
      return supabase.channel(channel).on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: channel 
      }, callback).subscribe();
    }
    
    return supabase
      .channel(channel)
      .on('postgres_changes', { event: '*', schema: 'public', table: channel }, callback)
      .subscribe();
  }

  static unsubscribeFromChannel(subscription) {
    if (USE_MOCK_SUPABASE) {
      return supabase.removeChannel(subscription);
    }
    
    return supabase.removeChannel(subscription);
  }

  // Mock-specific methods (only available when using mock)
  static isUsingMock() {
    return USE_MOCK_SUPABASE;
  }

  static getMockData() {
    if (USE_MOCK_SUPABASE) {
      return {
        users: supabase.getTableData('users'),
        jobs: supabase.getTableData('jobs'),
        messages: supabase.getTableData('messages'),
        bookings: supabase.getTableData('bookings'),
        reviews: supabase.getTableData('reviews'),
        notifications: supabase.getTableData('notifications'),
        serviceCategories: supabase.getTableData('service_categories'),
        mechanics: supabase.getTableData('mechanic_profiles')
      };
    }
    return null;
  }

  static addMockJob(job) {
    if (USE_MOCK_SUPABASE) {
      return supabase.addMockJob(job);
    }
    return null;
  }

  static addMockMessage(message) {
    if (USE_MOCK_SUPABASE) {
      return supabase.addMockMessage(message);
    }
    return null;
  }

  static updateJobStatus(jobId, status) {
    if (USE_MOCK_SUPABASE) {
      return supabase.updateJobStatus(jobId, status);
    }
    return null;
  }

  static simulateRealtimeUpdate(table, eventType, data) {
    if (USE_MOCK_SUPABASE) {
      return supabase.simulateRealtimeUpdate(table, eventType, data);
    }
    return null;
  }
}

// Export configuration info
export const config = {
  useMock: USE_MOCK_SUPABASE,
  supabaseUrl: USE_MOCK_SUPABASE ? 'mock://localhost' : supabaseUrl,
  hasRealConfig: !USE_MOCK_SUPABASE && supabaseUrl !== 'your_supabase_project_url'
};

// Export default
export default supabase;
