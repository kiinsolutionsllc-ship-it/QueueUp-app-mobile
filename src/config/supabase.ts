import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database table names
export const TABLES = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  USERS: 'users',
  JOBS: 'jobs',
  BIDS: 'bids',
  MECHANICS: 'mechanics',
  CUSTOMERS: 'customers',
  VEHICLES: 'vehicles',
  VEHICLE_SERVICES: 'vehicle_services',
  VEHICLE_ISSUES: 'vehicle_issues',
  VEHICLE_PHOTOS: 'vehicle_photos',
  NOTIFICATIONS: 'notifications',
  REVIEWS: 'reviews',
  PAYMENTS: 'payments',
  BANK_ACCOUNTS: 'bank_accounts',
  SUBSCRIPTIONS: 'subscriptions',
  SUPPORT_TICKETS: 'support_tickets',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  FEATURES: 'features',
};

export default supabase;
