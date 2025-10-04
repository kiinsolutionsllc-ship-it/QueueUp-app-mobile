import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Debug Supabase configuration
console.log('=== SUPABASE CONFIGURATION DEBUG ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
console.log('Supabase Anon Key format valid:', supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.startsWith('sb_'));
console.log('Environment variables loaded:', {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
});

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key' &&
  !supabaseUrl.includes('your-project') && 
  !supabaseAnonKey.includes('your-anon');

console.log('Supabase configured:', isSupabaseConfigured);

// Create Supabase client
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}) : null;

// Test Supabase connection
export const testSupabaseConnection = async () => {
  if (!supabase) {
    console.log('❌ Supabase client is null - not configured');
    return false;
  }
  
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('jobs').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection test successful');
    return true;
  } catch (err) {
    console.log('❌ Supabase connection test error:', err);
    return false;
  }
};

// Safe Supabase operations that handle null client
export const safeSupabase = {
  from: (table: string) => {
    if (!supabase) {
      console.warn(`Supabase not configured. Mocking table access: ${table}`);
      const mockResult = { data: [], error: null };
      return {
        select: () => ({
          ...mockResult,
          eq: () => mockResult,
          neq: () => mockResult,
          gt: () => mockResult,
          gte: () => mockResult,
          lt: () => mockResult,
          lte: () => mockResult,
          like: () => mockResult,
          ilike: () => mockResult,
          is: () => mockResult,
          in: () => mockResult,
          contains: () => mockResult,
          containedBy: () => mockResult,
          rangeGt: () => mockResult,
          rangeGte: () => mockResult,
          rangeLt: () => mockResult,
          rangeLte: () => mockResult,
          rangeAdjacent: () => mockResult,
          overlaps: () => mockResult,
          textSearch: () => mockResult,
          match: () => mockResult,
          not: () => mockResult,
          or: () => mockResult,
          filter: () => mockResult,
          order: () => mockResult,
          limit: () => mockResult,
          range: () => mockResult,
          abortSignal: () => mockResult,
          single: () => mockResult,
          maybeSingle: () => mockResult,
          csv: () => mockResult,
          geojson: () => mockResult,
          explain: () => mockResult,
          rollback: () => mockResult,
          returns: () => mockResult,
        }),
        insert: () => ({
          ...mockResult,
          select: () => ({
            ...mockResult,
            single: () => mockResult,
          }),
          upsert: () => mockResult,
        }),
        update: () => ({
          ...mockResult,
          select: () => ({
            ...mockResult,
            single: () => mockResult,
          }),
          eq: () => ({
            ...mockResult,
            select: () => ({
              ...mockResult,
              single: () => mockResult,
            }),
          }),
        }),
        delete: () => ({
          ...mockResult,
          eq: () => mockResult,
        }),
        upsert: () => ({
          ...mockResult,
          select: () => mockResult,
        }),
      };
    }
    return supabase.from(table);
  },
  auth: supabase?.auth || {
    signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    signIn: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  },
  storage: supabase?.storage || {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      download: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      remove: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    }),
  },
};

// Database table names
export const TABLES = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  USERS: 'users',
  JOBS: 'jobs',
  BIDS: 'bids',
  MECHANICS: 'mechanic_profiles',
  CUSTOMERS: 'customers',
  VEHICLES: 'vehicles',
  VEHICLE_SERVICES: 'vehicle_services',
  VEHICLE_ISSUES: 'vehicle_issues',
  VEHICLE_PHOTOS: 'vehicle_photos',
  NOTIFICATIONS: 'notifications',
  REVIEWS: 'reviews',
  PAYMENTS: 'payments',
  BANK_ACCOUNTS: 'bank_accounts',
  SUBSCRIPTION_PLANS: 'subscription_plans',
  SUBSCRIPTIONS: 'subscriptions',
  SUPPORT_TICKETS: 'support_tickets',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  FEATURES: 'features',
};

export default supabase;
