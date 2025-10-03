/**
 * Unique ID Generator Utility
 * Provides robust, collision-resistant unique ID generation for jobs, messages, and other entities
 */

class UniqueIdGenerator {
  constructor() {
    this.usedIds = new Set();
    this.prefixCounters = new Map();
  }

  /**
   * Generate a unique job ID with format: JOB-YYYYMMDD-HHMMSS-XXXX
   * Where XXXX is a 4-digit random number
   */
  generateJobId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const jobId = `JOB-${dateStr}-${timeStr}-${randomSuffix}`;
    
    // Ensure uniqueness
    if (this.usedIds.has(jobId)) {
      return this.generateJobId(); // Recursive call if collision
    }
    
    this.usedIds.add(jobId);
    return jobId;
  }

  /**
   * Generate a unique bid ID with format: BID-YYYYMMDD-HHMMSS-XXXX
   */
  generateBidId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const bidId = `BID-${dateStr}-${timeStr}-${randomSuffix}`;
    
    if (this.usedIds.has(bidId)) {
      return this.generateBidId();
    }
    
    this.usedIds.add(bidId);
    return bidId;
  }

  /**
   * Generate a unique conversation ID with format: CONV-YYYYMMDD-HHMMSS-XXXX
   */
  generateConversationId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const convId = `CONV-${dateStr}-${timeStr}-${randomSuffix}`;
    
    if (this.usedIds.has(convId)) {
      return this.generateConversationId();
    }
    
    this.usedIds.add(convId);
    return convId;
  }

  /**
   * Generate a unique message ID with format: MSG-YYYYMMDD-HHMMSS-XXXX
   */
  generateMessageId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const msgId = `MSG-${dateStr}-${timeStr}-${randomSuffix}`;
    
    if (this.usedIds.has(msgId)) {
      return this.generateMessageId();
    }
    
    this.usedIds.add(msgId);
    return msgId;
  }

  /**
   * Generate a unique change order ID with format: CO-YYYYMMDD-HHMMSS-XXXX
   */
  generateChangeOrderId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const coId = `CO-${dateStr}-${timeStr}-${randomSuffix}`;
    
    if (this.usedIds.has(coId)) {
      return this.generateChangeOrderId();
    }
    
    this.usedIds.add(coId);
    return coId;
  }

  /**
   * Generate a unique work item ID with format: WORK-YYYYMMDD-HHMMSS-XXXX
   */
  generateWorkId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const workId = `WORK-${dateStr}-${timeStr}-${randomSuffix}`;
    
    if (this.usedIds.has(workId)) {
      return this.generateWorkId();
    }
    
    this.usedIds.add(workId);
    return workId;
  }

  /**
   * Generate a unique payment ID with format: PAY-YYYYMMDD-HHMMSS-XXXX
   */
  generatePaymentId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const payId = `PAY-${dateStr}-${timeStr}-${randomSuffix}`;
    
    if (this.usedIds.has(payId)) {
      return this.generatePaymentId();
    }
    
    this.usedIds.add(payId);
    return payId;
  }

  /**
   * Generate a unique user ID with format: USER-YYYYMMDD-HHMMSS-XXXX
   */
  generateUserId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const userId = `USER-${dateStr}-${timeStr}-${randomSuffix}`;
    
    if (this.usedIds.has(userId)) {
      return this.generateUserId();
    }
    
    this.usedIds.add(userId);
    return userId;
  }

  /**
   * Generate a unique customer ID with format: CUSTOMER-YYYYMMDD-HHMMSS-XXXX
   */
  generateCustomerId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const customerId = `CUSTOMER-${dateStr}-${timeStr}-${randomSuffix}`;
    
    if (this.usedIds.has(customerId)) {
      return this.generateCustomerId();
    }
    
    this.usedIds.add(customerId);
    return customerId;
  }

  /**
   * Generate a unique mechanic ID with format: MECHANIC-YYYYMMDD-HHMMSS-XXXX
   */
  generateMechanicId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const mechanicId = `MECHANIC-${dateStr}-${timeStr}-${randomSuffix}`;
    
    if (this.usedIds.has(mechanicId)) {
      return this.generateMechanicId();
    }
    
    this.usedIds.add(mechanicId);
    return mechanicId;
  }

  /**
   * Generate a user-friendly display ID for customers with format: CUST-XXXX
   */
  generateCustomerDisplayId() {
    const counter = this.prefixCounters.get('CUST') || 0;
    const newCounter = counter + 1;
    this.prefixCounters.set('CUST', newCounter);
    
    const displayId = `CUST-${newCounter.toString().padStart(3, '0')}`;
    return displayId;
  }

  /**
   * Generate a user-friendly display ID for mechanics with format: MECH-XXXX
   */
  generateMechanicDisplayId() {
    const counter = this.prefixCounters.get('MECH') || 0;
    const newCounter = counter + 1;
    this.prefixCounters.set('MECH', newCounter);
    
    const displayId = `MECH-${newCounter.toString().padStart(3, '0')}`;
    return displayId;
  }

  /**
   * Generate a generic unique ID (defaults to 'ID' prefix)
   * @returns {string} Unique ID
   */
  generateId() {
    return this.generateCustomId('ID');
  }

  /**
   * Generate a generic unique ID with custom prefix
   * @param {string} prefix - The prefix for the ID (e.g., 'NOTIF', 'REVIEW')
   * @returns {string} Unique ID
   */
  generateCustomId(prefix) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const customId = `${prefix.toUpperCase()}-${dateStr}-${timeStr}-${randomSuffix}`;
    
    if (this.usedIds.has(customId)) {
      return this.generateCustomId(prefix);
    }
    
    this.usedIds.add(customId);
    return customId;
  }

  /**
   * Parse a job ID to extract creation date and time
   * @param {string} jobId - The job ID to parse
   * @returns {Object} Parsed information
   */
  parseJobId(jobId) {
    try {
      const parts = jobId.split('-');
      if (parts.length !== 4 || parts[0] !== 'JOB') {
        throw new Error('Invalid job ID format');
      }

      const dateStr = parts[1];
      const timeStr = parts[2];
      
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      
      const hour = timeStr.slice(0, 2);
      const minute = timeStr.slice(2, 4);
      const second = timeStr.slice(4, 6);
      
      const createdAt = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
      
      return {
        prefix: parts[0],
        date: dateStr, // Keep original format without dashes
        time: timeStr, // Keep original format without colons
        createdAt,
        randomSuffix: parts[3]
      };
    } catch (error) {
      console.error('Error parsing job ID:', error);
      return null;
    }
  }

  /**
   * Sort jobs by creation date using their IDs
   * @param {Array} jobs - Array of job objects with id property
   * @param {string} order - 'asc' or 'desc'
   * @returns {Array} Sorted jobs array
   */
  sortJobsById(jobs, order = 'desc') {
    return [...jobs].sort((a, b) => {
      const aInfo = this.parseJobId(a.id);
      const bInfo = this.parseJobId(b.id);
      
      if (!aInfo || !bInfo) {
        // Fallback to string comparison if parsing fails
        return order === 'desc' ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
      }
      
      const aTime = aInfo.createdAt.getTime();
      const bTime = bInfo.createdAt.getTime();
      
      return order === 'desc' ? bTime - aTime : aTime - bTime;
    });
  }

  /**
   * Get jobs created on a specific date
   * @param {Array} jobs - Array of job objects
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Array} Jobs created on the specified date
   */
  getJobsByDate(jobs, date) {
    const targetDate = date.replace(/-/g, ''); // Convert YYYY-MM-DD to YYYYMMDD
    return jobs.filter(job => {
      const jobInfo = this.parseJobId(job.id);
      return jobInfo && jobInfo.date === targetDate;
    });
  }

  /**
   * Get jobs created within a date range
   * @param {Array} jobs - Array of job objects
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Jobs created within the date range
   */
  getJobsByDateRange(jobs, startDate, endDate) {
    return jobs.filter(job => {
      const jobInfo = this.parseJobId(job.id);
      if (!jobInfo) return false;
      
      const jobDate = jobInfo.createdAt;
      return jobDate >= startDate && jobDate <= endDate;
    });
  }

  /**
   * Check if an ID is already in use
   * @param {string} id - The ID to check
   * @returns {boolean} True if ID is in use
   */
  isIdInUse(id) {
    return this.usedIds.has(id);
  }

  /**
   * Register an existing ID to prevent collisions
   * @param {string} id - The ID to register
   */
  registerId(id) {
    this.usedIds.add(id);
  }

  /**
   * Clear all registered IDs (useful for testing)
   */
  clearRegisteredIds() {
    this.usedIds.clear();
    this.prefixCounters.clear();
  }

  /**
   * Get statistics about generated IDs
   * @returns {Object} Statistics object
   */
  getStats() {
    const stats = {
      totalIds: this.usedIds.size,
      byPrefix: {}
    };

    this.usedIds.forEach(id => {
      const prefix = id.split('-')[0];
      stats.byPrefix[prefix] = (stats.byPrefix[prefix] || 0) + 1;
    });

    return stats;
  }
}

// Create and export a singleton instance
const uniqueIdGenerator = new UniqueIdGenerator();

export default uniqueIdGenerator;
