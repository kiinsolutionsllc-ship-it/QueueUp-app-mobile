import databaseManager from '../services/DatabaseManager';

/**
 * Database Utilities
 * 
 * Helper functions for common database operations
 * and debugging tools for development.
 */

export class DatabaseUtils {
  /**
   * Get a summary of all data in the database
   */
  static async getDataSummary() {
    try {
      const stats = await databaseManager.getStats();
      const summary = {
        totalItems: Object.values(stats).reduce((sum, count) => sum + count, 0),
        breakdown: stats,
        lastUpdated: new Date().toISOString()
      };
      
      return summary;
    } catch (error) {
      console.error('Error getting data summary:', error);
      return null;
    }
  }

  /**
   * Get sample data for testing
   */
  static async getSampleData() {
    try {
      const [users, jobs, conversations, messages] = await Promise.all([
        databaseManager.getUsers(),
        databaseManager.getJobs(),
        databaseManager.getConversations(),
        databaseManager.getMessages()
      ]);

      return {
        users: users.slice(0, 3), // First 3 users
        jobs: jobs.slice(0, 3), // First 3 jobs
        conversations: conversations.slice(0, 2), // First 2 conversations
        messages: messages.slice(0, 5) // First 5 messages
      };
    } catch (error) {
      console.error('Error getting sample data:', error);
      return null;
    }
  }

  /**
   * Create a test job
   */
  static async createTestJob(customerId = 'customer1') {
    try {
      const testJob = {
        customerId: customerId,
        title: 'Test Job - ' + new Date().toLocaleTimeString(),
        description: 'This is a test job created for development purposes',
        category: 'maintenance',
        priority: 'medium',
        status: 'open',
        location: {
          address: '123 Test St, Test City, TC 12345',
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        vehicle: {
          make: 'Test',
          model: 'Car',
          year: 2020,
          vin: 'TEST123456789',
          mileage: 10000
        },
        estimatedCost: 100,
        estimatedDuration: 60
      };

      const job = await databaseManager.createJob(testJob);
      console.log('Test job created:', job.id);
      return job;
    } catch (error) {
      console.error('Error creating test job:', error);
      return null;
    }
  }

  /**
   * Create a test message
   */
  static async createTestMessage(conversationId, senderId = 'customer1') {
    try {
      const testMessage = {
        conversationId: conversationId,
        senderId: senderId,
        senderRole: 'customer',
        content: 'Test message - ' + new Date().toLocaleTimeString(),
        type: 'text',
        status: 'sent'
      };

      const message = await databaseManager.createMessage(testMessage);
      console.log('Test message created:', message.id);
      return message;
    } catch (error) {
      console.error('Error creating test message:', error);
      return null;
    }
  }

  /**
   * Get database health status
   */
  static async getHealthStatus() {
    try {
      const stats = await databaseManager.getStats();
      const health = {
        status: 'healthy',
        totalItems: Object.values(stats).reduce((sum, count) => sum + count, 0),
        collections: Object.keys(stats).length,
        lastCheck: new Date().toISOString(),
        issues: []
      };

      // Check for potential issues
      if (health.totalItems === 0) {
        health.issues.push('No data found in database');
      }

      if (stats.local_users === 0) {
        health.issues.push('No users found');
      }

      if (health.issues.length > 0) {
        health.status = 'warning';
      }

      return health;
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Export data for debugging
   */
  static async exportForDebugging() {
    try {
      const data = await databaseManager.exportData();
      const debugInfo = {
        ...data,
        debug: {
          timestamp: new Date().toISOString(),
          userAgent: 'React Native App',
          version: '1.0.0'
        }
      };

      console.log('Database export for debugging:', JSON.stringify(debugInfo, null, 2));
      return debugInfo;
    } catch (error) {
      console.error('Error exporting data for debugging:', error);
      return null;
    }
  }

  /**
   * Clear all data (use with caution!)
   */
  static async clearAllData() {
    try {
      await databaseManager.clearAllData();
      console.log('All database data cleared');
      return { success: true };
    } catch (error) {
      console.error('Error clearing data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset to sample data
   */
  static async resetToSampleData() {
    try {
      // Clear existing data
      await databaseManager.clearAllData();
      
      // Re-initialize to get sample data
      const { initializeDatabase } = await import('../services/initializeDatabase');
      const result = await initializeDatabase();
      
      console.log('Database reset to sample data:', result.success ? 'SUCCESS' : 'FAILED');
      return result;
    } catch (error) {
      console.error('Error resetting to sample data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search across all data
   */
  static async searchAll(query) {
    try {
      const results = await databaseManager.search(query, ['jobs', 'users', 'messages', 'conversations']);
      return results;
    } catch (error) {
      console.error('Error searching data:', error);
      return null;
    }
  }

  /**
   * Get recent activity for debugging
   */
  static async getRecentActivity(userId = 'customer1') {
    try {
      const activity = await databaseManager.getRecentActivity(userId, 10);
      return activity;
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }
}

export default DatabaseUtils;


