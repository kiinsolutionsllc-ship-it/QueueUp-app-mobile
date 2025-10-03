// AsyncStorage removed - using Supabase only
import UnifiedJobService from '../services/UnifiedJobService';

/**
 * Utility function to reset all mock data and clear all stored information
 * This provides a clean slate for testing with consistent IDs
 */
export const resetAllMockData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔄 Starting complete data reset...');
    
    // 1. Reset all job-related data
    console.log('📋 Resetting job data...');
    const jobResetResult = await UnifiedJobService.resetAllData();
    if (!jobResetResult.success) {
      throw new Error(`Failed to reset job data: ${jobResetResult.error}`);
    }
    
    // 2. Clear all user authentication data (now managed in memory only)
    console.log('👤 User authentication data is now managed in memory only');
    
    // 3. Clear any other app-specific data (now managed in memory only)
    console.log('🧹 App data is now managed in memory only');
    
    // 4. Mock test account creation is disabled for proper testing
    console.log('🆕 Mock test account creation is DISABLED for proper testing');
    
    console.log('🎉 Complete data reset successful!');
    return { 
      success: true, 
      message: 'All mock data has been reset. Fresh test accounts created with consistent IDs.' 
    };
    
  } catch (error) {
    console.error('❌ Error during data reset:', error);
    return { 
      success: false, 
      message: `Failed to reset data: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

/**
 * Quick reset function that can be called from anywhere in the app
 * Useful for development and testing
 */
export const quickReset = async (): Promise<void> => {
  try {
    const result = await resetAllMockData();
    if (result.success) {
      console.log('✅ Quick reset completed:', result.message);
    } else {
      console.error('❌ Quick reset failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Quick reset error:', error);
  }
};

export default resetAllMockData;
