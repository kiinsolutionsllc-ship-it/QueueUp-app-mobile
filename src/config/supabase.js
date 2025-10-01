// Supabase Configuration for QueueUp
// Now includes mock support for development

// Re-export from the new configuration
export { 
  supabase, 
  TABLES, 
  STORAGE_BUCKETS, 
  REALTIME_CHANNELS, 
  SupabaseService,
  config 
} from './supabaseConfig';

// Export default
export { default } from './supabaseConfig';
