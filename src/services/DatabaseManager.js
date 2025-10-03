import localDatabase from './LocalDatabase';

/**
 * Database Manager Service
 * 
 * This service provides high-level access to all database operations
 * with convenient methods for common operations.
 */

class DatabaseManager {
  constructor() {
    this.db = localDatabase;
    this.initialized = false;
  }

  /**
   * Initialize the database manager
   */
  async initialize() {
    if (this.initialized) return;
    
    await this.db.initialize();
    this.initialized = true;
    console.log('DatabaseManager: Initialized successfully');
  }

  // ==================== JOBS ====================

  /**
   * Get all jobs
   */
  async getJobs(filters = {}) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.JOBS, filters);
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId) {
    await this.initialize();
    return await this.db.findById(this.db.KEYS.JOBS, jobId);
  }

  /**
   * Get jobs by customer
   */
  async getJobsByCustomer(customerId) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.JOBS, { customerId });
  }

  /**
   * Get jobs by mechanic
   */
  async getJobsByMechanic(mechanicId) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.JOBS, { mechanicId });
  }

  /**
   * Get open jobs (no mechanic assigned)
   */
  async getOpenJobs() {
    await this.initialize();
    return await this.db.find(this.db.KEYS.JOBS, { mechanicId: null, status: 'open' });
  }

  /**
   * Create a new job
   */
  async createJob(jobData) {
    await this.initialize();
    return await this.db.add(this.db.KEYS.JOBS, jobData);
  }

  /**
   * Update a job
   */
  async updateJob(jobId, updates) {
    await this.initialize();
    return await this.db.update(this.db.KEYS.JOBS, jobId, updates);
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId) {
    await this.initialize();
    return await this.db.remove(this.db.KEYS.JOBS, jobId);
  }

  // ==================== USERS ====================

  /**
   * Get all users
   */
  async getUsers(filters = {}) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.USERS, filters);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    await this.initialize();
    return await this.db.findById(this.db.KEYS.USERS, userId);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.USERS, { role });
  }

  /**
   * Get all customers
   */
  async getCustomers() {
    return await this.getUsersByRole('customer');
  }

  /**
   * Get all mechanics
   */
  async getMechanics() {
    return await this.getUsersByRole('mechanic');
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    await this.initialize();
    return await this.db.add(this.db.KEYS.USERS, userData);
  }

  /**
   * Update a user
   */
  async updateUser(userId, updates) {
    await this.initialize();
    return await this.db.update(this.db.KEYS.USERS, userId, updates);
  }

  /**
   * Delete a user
   */
  async deleteUser(userId) {
    await this.initialize();
    return await this.db.remove(this.db.KEYS.USERS, userId);
  }

  // ==================== MESSAGING ====================

  /**
   * Get all conversations
   */
  async getConversations(filters = {}) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.CONVERSATIONS, filters);
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(conversationId) {
    await this.initialize();
    return await this.db.findById(this.db.KEYS.CONVERSATIONS, conversationId);
  }

  /**
   * Get conversations for a user
   */
  async getConversationsByUser(userId) {
    await this.initialize();
    const conversations = await this.db.get(this.db.KEYS.CONVERSATIONS);
    return conversations.filter(conv => conv.participants.includes(userId));
  }

  /**
   * Get conversation between two users
   */
  async getConversationBetweenUsers(userId1, userId2) {
    await this.initialize();
    const conversations = await this.db.get(this.db.KEYS.CONVERSATIONS);
    return conversations.find(conv => 
      conv.participants.includes(userId1) && conv.participants.includes(userId2)
    );
  }

  /**
   * Create a new conversation
   */
  async createConversation(conversationData) {
    await this.initialize();
    return await this.db.add(this.db.KEYS.CONVERSATIONS, conversationData);
  }

  /**
   * Update a conversation
   */
  async updateConversation(conversationId, updates) {
    await this.initialize();
    return await this.db.update(this.db.KEYS.CONVERSATIONS, conversationId, updates);
  }

  /**
   * Get all messages
   */
  async getMessages(filters = {}) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.MESSAGES, filters);
  }

  /**
   * Get messages for a conversation
   */
  async getMessagesByConversation(conversationId) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.MESSAGES, { conversationId });
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId) {
    await this.initialize();
    return await this.db.findById(this.db.KEYS.MESSAGES, messageId);
  }

  /**
   * Create a new message
   */
  async createMessage(messageData) {
    await this.initialize();
    return await this.db.add(this.db.KEYS.MESSAGES, messageData);
  }

  /**
   * Update a message
   */
  async updateMessage(messageId, updates) {
    await this.initialize();
    return await this.db.update(this.db.KEYS.MESSAGES, messageId, updates);
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId) {
    await this.initialize();
    return await this.db.remove(this.db.KEYS.MESSAGES, messageId);
  }

  // ==================== BIDS ====================

  /**
   * Get all bids
   */
  async getBids(filters = {}) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.BIDS, filters);
  }

  /**
   * Get bids for a job
   */
  async getBidsByJob(jobId) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.BIDS, { jobId });
  }

  /**
   * Get bids by mechanic
   */
  async getBidsByMechanic(mechanicId) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.BIDS, { mechanicId });
  }

  /**
   * Create a new bid
   */
  async createBid(bidData) {
    await this.initialize();
    return await this.db.add(this.db.KEYS.BIDS, bidData);
  }

  /**
   * Update a bid
   */
  async updateBid(bidId, updates) {
    await this.initialize();
    return await this.db.update(this.db.KEYS.BIDS, bidId, updates);
  }

  /**
   * Delete a bid
   */
  async deleteBid(bidId) {
    await this.initialize();
    return await this.db.remove(this.db.KEYS.BIDS, bidId);
  }

  // ==================== VEHICLES ====================

  /**
   * Get all vehicles
   */
  async getVehicles(filters = {}) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.VEHICLES, filters);
  }

  /**
   * Get vehicles by customer
   */
  async getVehiclesByCustomer(customerId) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.VEHICLES, { customerId });
  }

  /**
   * Create a new vehicle
   */
  async createVehicle(vehicleData) {
    await this.initialize();
    return await this.db.add(this.db.KEYS.VEHICLES, vehicleData);
  }

  /**
   * Update a vehicle
   */
  async updateVehicle(vehicleId, updates) {
    await this.initialize();
    return await this.db.update(this.db.KEYS.VEHICLES, vehicleId, updates);
  }

  /**
   * Delete a vehicle
   */
  async deleteVehicle(vehicleId) {
    await this.initialize();
    return await this.db.remove(this.db.KEYS.VEHICLES, vehicleId);
  }

  // ==================== REVIEWS ====================

  /**
   * Get all reviews
   */
  async getReviews(filters = {}) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.REVIEWS, filters);
  }

  /**
   * Get reviews for a mechanic
   */
  async getReviewsByMechanic(mechanicId) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.REVIEWS, { mechanicId });
  }

  /**
   * Get reviews by customer
   */
  async getReviewsByCustomer(customerId) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.REVIEWS, { customerId });
  }

  /**
   * Create a new review
   */
  async createReview(reviewData) {
    await this.initialize();
    return await this.db.add(this.db.KEYS.REVIEWS, reviewData);
  }

  /**
   * Update a review
   */
  async updateReview(reviewId, updates) {
    await this.initialize();
    return await this.db.update(this.db.KEYS.REVIEWS, reviewId, updates);
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId) {
    await this.initialize();
    return await this.db.remove(this.db.KEYS.REVIEWS, reviewId);
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Get all notifications
   */
  async getNotifications(filters = {}) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.NOTIFICATIONS, filters);
  }

  /**
   * Get notifications for a user
   */
  async getNotificationsByUser(userId) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.NOTIFICATIONS, { userId });
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotificationsByUser(userId) {
    await this.initialize();
    return await this.db.find(this.db.KEYS.NOTIFICATIONS, { userId, read: false });
  }

  /**
   * Create a new notification
   */
  async createNotification(notificationData) {
    await this.initialize();
    return await this.db.add(this.db.KEYS.NOTIFICATIONS, notificationData);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    await this.initialize();
    return await this.db.update(this.db.KEYS.NOTIFICATIONS, notificationId, { read: true });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId) {
    await this.initialize();
    const notifications = await this.getUnreadNotificationsByUser(userId);
    for (const notification of notifications) {
      await this.markNotificationAsRead(notification.id);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get database statistics
   */
  async getStats() {
    await this.initialize();
    return await this.db.getStats();
  }

  /**
   * Clear all data
   */
  async clearAllData() {
    await this.initialize();
    return await this.db.clear();
  }

  /**
   * Export all data
   */
  async exportData() {
    await this.initialize();
    return await this.db.exportData();
  }

  /**
   * Import data
   */
  async importData(backupData) {
    await this.initialize();
    return await this.db.importData(backupData);
  }

  /**
   * Force flush all pending writes
   */
  async flush() {
    await this.initialize();
    return await this.db.flush();
  }

  /**
   * Search across multiple collections
   */
  async search(query, collections = ['jobs', 'users', 'messages']) {
    await this.initialize();
    const results = {};
    
    for (const collection of collections) {
      const key = this.db.KEYS[collection.toUpperCase()];
      if (key) {
        const data = await this.db.get(key);
        results[collection] = data.filter(item => {
          return JSON.stringify(item).toLowerCase().includes(query.toLowerCase());
        });
      }
    }
    
    return results;
  }

  /**
   * Get recent activity for a user
   */
  async getRecentActivity(userId, limit = 10) {
    await this.initialize();
    const activities = [];
    
    // Get recent jobs
    const jobs = await this.getJobsByCustomer(userId);
    activities.push(...jobs.slice(0, 5).map(job => ({
      type: 'job',
      data: job,
      timestamp: job.updatedAt
    })));
    
    // Get recent messages
    const conversations = await this.getConversationsByUser(userId);
    for (const conv of conversations.slice(0, 3)) {
      const messages = await this.getMessagesByConversation(conv.id);
      const recentMessage = messages[messages.length - 1];
      if (recentMessage) {
        activities.push({
          type: 'message',
          data: recentMessage,
          timestamp: recentMessage.timestamp
        });
      }
    }
    
    // Sort by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

export default databaseManager;


