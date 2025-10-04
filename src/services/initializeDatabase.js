/**
 * Database Initialization Script
 * 
 * This script initializes Supabase connection
 * when the app starts up.
 */

import { testSupabaseConnection } from '../config/supabase';
import { getSupabaseMCP } from './SupabaseMCPService';

let initializationPromise = null;

/**
 * Initialize the database system (Supabase)
 */
export async function initializeDatabase() {
  // Prevent multiple simultaneous initializations
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('Database Initialization: Starting Supabase connection...');
      
      // Test Supabase connection using MCP service
      const mcpService = getSupabaseMCP();
      const healthCheck = await mcpService.healthCheck();
      
      if (healthCheck.success) {
        console.log('Database Initialization: Supabase MCP connection successful');
        return {
          success: true,
          message: 'Supabase MCP connection ready',
          mcpStatus: healthCheck.data
        };
      } else {
        console.warn('Database Initialization: Supabase MCP connection failed - using fallback mode');
        return {
          success: false,
          error: healthCheck.error || 'Supabase MCP not configured properly',
          fallback: true,
          mcpStatus: healthCheck.data
        };
      }
    } catch (error) {
      console.error('Database Initialization: Failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  })();

  return initializationPromise;
}

/**
 * Get database status
 */
export async function getDatabaseStatus() {
  return {
    initialized: true,
    message: 'Supabase backend ready',
    type: 'supabase'
  };
}

/**
 * Clear all database data (not applicable for Supabase)
 */
export async function clearDatabase() {
  console.log('Clear database: Not applicable for Supabase backend');
  return { 
    success: true, 
    message: 'Clear database not applicable for Supabase backend' 
  };
}

/**
 * Export database data (not applicable for Supabase)
 */
export async function exportDatabase() {
  console.log('Export database: Not applicable for Supabase backend');
  return { 
    success: true, 
    message: 'Export database not applicable for Supabase backend' 
  };
}

/**
 * Import database data (not applicable for Supabase)
 */
export async function importDatabase(backupData) {
  console.log('Import database: Not applicable for Supabase backend');
  return { 
    success: true, 
    message: 'Import database not applicable for Supabase backend' 
  };
}

export default {
  initializeDatabase,
  getDatabaseStatus,
  clearDatabase,
  exportDatabase,
  importDatabase
};