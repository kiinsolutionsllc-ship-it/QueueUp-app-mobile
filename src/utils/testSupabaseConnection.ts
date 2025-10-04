/**
 * Supabase Connection Test Utility
 * 
 * This utility provides a simple way to test the Supabase MCP connection
 * and diagnose any configuration issues.
 */

import { getSupabaseMCP, getSupabaseMCPStatus, testSupabaseMCP } from '../services/SupabaseMCPService';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details: {
    configured: boolean;
    connected: boolean;
    fallback: boolean;
    error?: string;
  };
}

export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  console.log('=== SUPABASE CONNECTION TEST ===');
  
  try {
    // Get current status
    const status = getSupabaseMCPStatus();
    console.log('Current MCP Status:', status);
    
    // Test connection
    const connectionTest = await testSupabaseMCP();
    console.log('Connection Test Result:', connectionTest);
    
    // Get detailed health check
    const mcpService = getSupabaseMCP();
    const healthCheck = await mcpService.healthCheck();
    console.log('Health Check Result:', healthCheck);
    
    if (healthCheck.success) {
      return {
        success: true,
        message: 'Supabase MCP connection is working properly',
        details: {
          configured: true,
          connected: true,
          fallback: false
        }
      };
    } else {
      return {
        success: false,
        message: `Supabase MCP connection failed: ${healthCheck.error}`,
        details: {
          configured: status.connected,
          connected: false,
          fallback: status.fallback,
          error: healthCheck.error
        }
      };
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {
        configured: false,
        connected: false,
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

export async function diagnoseSupabaseIssues(): Promise<string[]> {
  const issues: string[] = [];
  
  try {
    // Check environment variables
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
      issues.push('EXPO_PUBLIC_SUPABASE_URL is not configured or using default value');
    }
    
    if (!supabaseKey || supabaseKey === 'your-anon-key') {
      issues.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is not configured or using default value');
    }
    
    // Check if keys look valid
    if (supabaseKey && !supabaseKey.startsWith('eyJ') && !supabaseKey.startsWith('sb_')) {
      issues.push('EXPO_PUBLIC_SUPABASE_ANON_KEY does not appear to be a valid Supabase key');
    }
    
    // Test connection
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest.success) {
      issues.push(`Connection test failed: ${connectionTest.message}`);
    }
    
    return issues;
  } catch (error) {
    issues.push(`Diagnosis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return issues;
  }
}

export async function getConnectionRecommendations(): Promise<string[]> {
  const recommendations: string[] = [];
  const issues = await diagnoseSupabaseIssues();
  
  if (issues.length === 0) {
    recommendations.push('✅ Supabase connection is properly configured');
    return recommendations;
  }
  
  if (issues.some(issue => issue.includes('EXPO_PUBLIC_SUPABASE_URL'))) {
    recommendations.push('1. Create a Supabase project at https://supabase.com');
    recommendations.push('2. Go to Settings → API in your Supabase dashboard');
    recommendations.push('3. Copy the Project URL to EXPO_PUBLIC_SUPABASE_URL in your .env file');
  }
  
  if (issues.some(issue => issue.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY'))) {
    recommendations.push('4. Copy the anon/public key to EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  }
  
  if (issues.some(issue => issue.includes('valid Supabase key'))) {
    recommendations.push('5. Ensure your Supabase anon key starts with "eyJ" or "sb_"');
  }
  
  recommendations.push('6. Restart your development server after updating .env file');
  recommendations.push('7. Check the console for detailed connection logs');
  
  return recommendations;
}

// Export convenience functions
export const runConnectionTest = testSupabaseConnection;
export const diagnoseIssues = diagnoseSupabaseIssues;
export const getRecommendations = getConnectionRecommendations;

export default {
  testSupabaseConnection,
  diagnoseSupabaseIssues,
  getConnectionRecommendations
};
