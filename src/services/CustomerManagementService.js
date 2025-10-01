import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import { MOCK_MODE } from '../config/payment';

/**
 * CUSTOMER MANAGEMENT SERVICE
 * 
 * Comprehensive customer relationship management for Professional and Enterprise tiers
 * Features:
 * - Customer profile management
 * - Communication history tracking
 * - Follow-up reminders
 * - Customer segmentation
 * - Loyalty tracking
 * - Service history
 */

class CustomerManagementService {
  constructor() {
    this.customers = [];
    this.communicationLogs = [];
    this.followUpReminders = [];
    this.customerSegments = [];
    this.serviceHistory = [];
    this.initialized = false;
    
    // Storage keys
    this.CUSTOMERS_KEY = 'customer_management_customers';
    this.COMMUNICATION_KEY = 'customer_management_communication';
    this.REMINDERS_KEY = 'customer_management_reminders';
    this.SEGMENTS_KEY = 'customer_management_segments';
    this.SERVICE_HISTORY_KEY = 'customer_management_service_history';
    
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadData();
      await this.initializeDefaultSegments();
      this.initialized = true;
      console.log('CustomerManagementService: Initialized successfully');
    } catch (error) {
      console.error('CustomerManagementService: Error initializing:', error);
    }
  }

  async loadData() {
    try {
      const [customers, communication, reminders, segments, serviceHistory] = await Promise.all([
        AsyncStorage.getItem(this.CUSTOMERS_KEY),
        AsyncStorage.getItem(this.COMMUNICATION_KEY),
        AsyncStorage.getItem(this.REMINDERS_KEY),
        AsyncStorage.getItem(this.SEGMENTS_KEY),
        AsyncStorage.getItem(this.SERVICE_HISTORY_KEY)
      ]);

      this.customers = customers ? JSON.parse(customers) : [];
      this.communicationLogs = communication ? JSON.parse(communication) : [];
      this.followUpReminders = reminders ? JSON.parse(reminders) : [];
      this.customerSegments = segments ? JSON.parse(segments) : [];
      this.serviceHistory = serviceHistory ? JSON.parse(serviceHistory) : [];
    } catch (error) {
      console.error('CustomerManagementService: Error loading data:', error);
    }
  }

  async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(this.customers)),
        AsyncStorage.setItem(this.COMMUNICATION_KEY, JSON.stringify(this.communicationLogs)),
        AsyncStorage.setItem(this.REMINDERS_KEY, JSON.stringify(this.followUpReminders)),
        AsyncStorage.setItem(this.SEGMENTS_KEY, JSON.stringify(this.customerSegments)),
        AsyncStorage.setItem(this.SERVICE_HISTORY_KEY, JSON.stringify(this.serviceHistory))
      ]);
    } catch (error) {
      console.error('CustomerManagementService: Error saving data:', error);
    }
  }

  async initializeDefaultSegments() {
    if (this.customerSegments.length > 0) return;

    const defaultSegments = [
      {
        id: 'vip_customers',
        name: 'VIP Customers',
        description: 'High-value customers with excellent loyalty',
        criteria: {
          total_spent: { min: 2000 },
          loyalty_score: { min: 90 },
          service_frequency: { min: 5 }
        },
        benefits: ['Priority scheduling', 'Discounts', 'Premium support'],
        color: '#FFD700',
        created_at: new Date().toISOString()
      },
      {
        id: 'regular_customers',
        name: 'Regular Customers',
        description: 'Consistent customers with good loyalty',
        criteria: {
          total_spent: { min: 500, max: 1999 },
          loyalty_score: { min: 70, max: 89 },
          service_frequency: { min: 2 }
        },
        benefits: ['Standard support', 'Loyalty rewards'],
        color: '#4CAF50',
        created_at: new Date().toISOString()
      },
      {
        id: 'new_customers',
        name: 'New Customers',
        description: 'Recently acquired customers',
        criteria: {
          first_service_date: { min_days_ago: 90 },
          service_frequency: { max: 2 }
        },
        benefits: ['Welcome package', 'First-time discounts'],
        color: '#2196F3',
        created_at: new Date().toISOString()
      },
      {
        id: 'at_risk_customers',
        name: 'At-Risk Customers',
        description: 'Customers showing signs of churn',
        criteria: {
          last_service_date: { max_days_ago: 180 },
          satisfaction_trend: 'declining',
          loyalty_score: { max: 60 }
        },
        benefits: ['Retention offers', 'Personal outreach'],
        color: '#FF9800',
        created_at: new Date().toISOString()
      }
    ];

    this.customerSegments = defaultSegments;
    await this.saveData();
  }

  // ========================================
  // CUSTOMER PROFILE MANAGEMENT
  // ========================================

  async createCustomerProfile(userId, customerData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const customer = {
          id: uniqueIdGenerator.generateId('customer'),
          user_id: userId, // This should be a CUSTOMER- prefixed ID
          customer_id: customerData.customer_id,
          personal_info: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address,
            date_of_birth: customerData.date_of_birth,
            preferred_contact_method: customerData.preferred_contact_method || 'phone'
          },
          vehicle_info: customerData.vehicle_info || [],
          preferences: {
            preferred_service_times: customerData.preferred_service_times || [],
            communication_preferences: customerData.communication_preferences || {},
            service_reminders: customerData.service_reminders || true,
            marketing_communications: customerData.marketing_communications || false
          },
          loyalty_metrics: {
            total_spent: 0,
            service_count: 0,
            loyalty_score: 0,
            first_service_date: null,
            last_service_date: null,
            average_rating: 0,
            referral_count: 0
          },
          tags: customerData.tags || [],
          notes: customerData.notes || '',
          status: 'active', // active, inactive, blocked
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.customers.push(customer);
        await this.saveData();
        return { success: true, customer };
      }
    } catch (error) {
      console.error('CustomerManagementService: Error creating customer profile:', error);
      return { success: false, error: error.message };
    }
  }

  async updateCustomerProfile(customerId, updateData) {
    try {
      const customer = this.customers.find(c => c.id === customerId);
      if (!customer) {
        return { success: false, error: 'Customer not found' };
      }

      // Update customer data
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
            customer[key] = { ...customer[key], ...updateData[key] };
          } else {
            customer[key] = updateData[key];
          }
        }
      });

      customer.updated_at = new Date().toISOString();
      await this.saveData();
      return { success: true, customer };
    } catch (error) {
      console.error('CustomerManagementService: Error updating customer profile:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // COMMUNICATION TRACKING
  // ========================================

  async logCommunication(customerId, communicationData) {
    try {
      if (MOCK_MODE) {
        const communication = {
          id: uniqueIdGenerator.generateId('communication'),
          customer_id: customerId,
          type: communicationData.type, // call, email, sms, in_person, app_message
          direction: communicationData.direction, // inbound, outbound
          subject: communicationData.subject || '',
          content: communicationData.content || '',
          outcome: communicationData.outcome || '', // scheduled, resolved, follow_up_needed
          duration_minutes: communicationData.duration_minutes || 0,
          follow_up_required: communicationData.follow_up_required || false,
          follow_up_date: communicationData.follow_up_date || null,
          created_at: new Date().toISOString()
        };

        this.communicationLogs.push(communication);
        await this.saveData();
        return { success: true, communication };
      }
    } catch (error) {
      console.error('CustomerManagementService: Error logging communication:', error);
      return { success: false, error: error.message };
    }
  }

  getCommunicationHistory(customerId, limit = 50) {
    return this.communicationLogs
      .filter(c => c.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }

  // ========================================
  // FOLLOW-UP REMINDERS
  // ========================================

  async createFollowUpReminder(customerId, reminderData) {
    try {
      if (MOCK_MODE) {
        const reminder = {
          id: uniqueIdGenerator.generateId('reminder'),
          customer_id: customerId,
          type: reminderData.type, // service_follow_up, payment_reminder, satisfaction_survey, maintenance_reminder
          title: reminderData.title,
          description: reminderData.description,
          due_date: reminderData.due_date,
          priority: reminderData.priority || 'medium', // low, medium, high, urgent
          status: 'pending', // pending, completed, cancelled, overdue
          assigned_to: reminderData.assigned_to,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.followUpReminders.push(reminder);
        await this.saveData();
        return { success: true, reminder };
      }
    } catch (error) {
      console.error('CustomerManagementService: Error creating follow-up reminder:', error);
      return { success: false, error: error.message };
    }
  }

  async completeFollowUpReminder(reminderId, completionData) {
    try {
      const reminder = this.followUpReminders.find(r => r.id === reminderId);
      if (!reminder) {
        return { success: false, error: 'Reminder not found' };
      }

      reminder.status = 'completed';
      reminder.completed_at = new Date().toISOString();
      reminder.completion_notes = completionData.notes || '';
      reminder.updated_at = new Date().toISOString();

      await this.saveData();
      return { success: true, reminder };
    } catch (error) {
      console.error('CustomerManagementService: Error completing follow-up reminder:', error);
      return { success: false, error: error.message };
    }
  }

  getPendingReminders(userId, limit = 20) {
    const userCustomers = this.customers.filter(c => c.user_id === userId);
    const userCustomerIds = userCustomers.map(c => c.id);
    
    return this.followUpReminders
      .filter(r => userCustomerIds.includes(r.customer_id) && r.status === 'pending')
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, limit);
  }

  // ========================================
  // SERVICE HISTORY TRACKING
  // ========================================

  async addServiceRecord(customerId, serviceData) {
    try {
      if (MOCK_MODE) {
        const serviceRecord = {
          id: uniqueIdGenerator.generateId('service'),
          customer_id: customerId,
          job_id: serviceData.job_id,
          service_date: serviceData.service_date || new Date().toISOString(),
          service_type: serviceData.service_type,
          description: serviceData.description,
          amount: serviceData.amount,
          rating: serviceData.rating,
          feedback: serviceData.feedback || '',
          technician_notes: serviceData.technician_notes || '',
          next_service_due: serviceData.next_service_due || null,
          warranty_expires: serviceData.warranty_expires || null,
          created_at: new Date().toISOString()
        };

        this.serviceHistory.push(serviceRecord);

        // Update customer loyalty metrics
        await this.updateCustomerLoyaltyMetrics(customerId, serviceData);

        await this.saveData();
        return { success: true, serviceRecord };
      }
    } catch (error) {
      console.error('CustomerManagementService: Error adding service record:', error);
      return { success: false, error: error.message };
    }
  }

  getServiceHistory(customerId, limit = 50) {
    return this.serviceHistory
      .filter(s => s.customer_id === customerId)
      .sort((a, b) => new Date(b.service_date) - new Date(a.service_date))
      .slice(0, limit);
  }

  // ========================================
  // CUSTOMER SEGMENTATION
  // ========================================

  async segmentCustomers(userId) {
    try {
      const userCustomers = this.customers.filter(c => c.user_id === userId);
      const segmentedCustomers = {};

      this.customerSegments.forEach(segment => {
        segmentedCustomers[segment.id] = {
          segment: segment,
          customers: userCustomers.filter(customer => 
            this.customerMatchesSegment(customer, segment.criteria)
          )
        };
      });

      return { success: true, segments: segmentedCustomers };
    } catch (error) {
      console.error('CustomerManagementService: Error segmenting customers:', error);
      return { success: false, error: error.message };
    }
  }

  customerMatchesSegment(customer, criteria) {
    // Check total spent
    if (criteria.total_spent) {
      const totalSpent = customer.loyalty_metrics.total_spent;
      if (criteria.total_spent.min && totalSpent < criteria.total_spent.min) return false;
      if (criteria.total_spent.max && totalSpent > criteria.total_spent.max) return false;
    }

    // Check loyalty score
    if (criteria.loyalty_score) {
      const loyaltyScore = customer.loyalty_metrics.loyalty_score;
      if (criteria.loyalty_score.min && loyaltyScore < criteria.loyalty_score.min) return false;
      if (criteria.loyalty_score.max && loyaltyScore > criteria.loyalty_score.max) return false;
    }

    // Check service frequency
    if (criteria.service_frequency) {
      const serviceCount = customer.loyalty_metrics.service_count;
      if (criteria.service_frequency.min && serviceCount < criteria.service_frequency.min) return false;
      if (criteria.service_frequency.max && serviceCount > criteria.service_frequency.max) return false;
    }

    // Check first service date
    if (criteria.first_service_date) {
      const firstService = customer.loyalty_metrics.first_service_date;
      if (firstService) {
        const daysSinceFirst = Math.floor((new Date() - new Date(firstService)) / (1000 * 60 * 60 * 24));
        if (criteria.first_service_date.min_days_ago && daysSinceFirst < criteria.first_service_date.min_days_ago) return false;
      }
    }

    // Check last service date
    if (criteria.last_service_date) {
      const lastService = customer.loyalty_metrics.last_service_date;
      if (lastService) {
        const daysSinceLast = Math.floor((new Date() - new Date(lastService)) / (1000 * 60 * 60 * 24));
        if (criteria.last_service_date.max_days_ago && daysSinceLast > criteria.last_service_date.max_days_ago) return false;
      }
    }

    return true;
  }

  // ========================================
  // LOYALTY TRACKING
  // ========================================

  async updateCustomerLoyaltyMetrics(customerId, serviceData) {
    try {
      const customer = this.customers.find(c => c.id === customerId);
      if (!customer) return;

      const metrics = customer.loyalty_metrics;

      // Update total spent
      metrics.total_spent += serviceData.amount || 0;

      // Update service count
      metrics.service_count += 1;

      // Update dates
      if (!metrics.first_service_date) {
        metrics.first_service_date = serviceData.service_date || new Date().toISOString();
      }
      metrics.last_service_date = serviceData.service_date || new Date().toISOString();

      // Update average rating
      if (serviceData.rating) {
        const totalRating = metrics.average_rating * (metrics.service_count - 1) + serviceData.rating;
        metrics.average_rating = totalRating / metrics.service_count;
      }

      // Calculate loyalty score
      metrics.loyalty_score = this.calculateLoyaltyScore(metrics);

      customer.updated_at = new Date().toISOString();
      await this.saveData();
    } catch (error) {
      console.error('CustomerManagementService: Error updating loyalty metrics:', error);
    }
  }

  calculateLoyaltyScore(metrics) {
    let score = 0;

    // Service frequency (0-30 points)
    if (metrics.service_count >= 10) score += 30;
    else if (metrics.service_count >= 5) score += 20;
    else if (metrics.service_count >= 2) score += 10;

    // Total spent (0-25 points)
    if (metrics.total_spent >= 2000) score += 25;
    else if (metrics.total_spent >= 1000) score += 20;
    else if (metrics.total_spent >= 500) score += 15;
    else if (metrics.total_spent >= 200) score += 10;

    // Average rating (0-25 points)
    if (metrics.average_rating >= 4.5) score += 25;
    else if (metrics.average_rating >= 4.0) score += 20;
    else if (metrics.average_rating >= 3.5) score += 15;
    else if (metrics.average_rating >= 3.0) score += 10;

    // Recency (0-20 points)
    if (metrics.last_service_date) {
      const daysSinceLast = Math.floor((new Date() - new Date(metrics.last_service_date)) / (1000 * 60 * 60 * 24));
      if (daysSinceLast <= 30) score += 20;
      else if (daysSinceLast <= 90) score += 15;
      else if (daysSinceLast <= 180) score += 10;
      else if (daysSinceLast <= 365) score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  // ========================================
  // ANALYTICS AND REPORTING
  // ========================================

  getCustomerAnalytics(userId, timeframe = '30_days') {
    try {
      const now = new Date();
      const daysBack = timeframe === '7_days' ? 7 : timeframe === '30_days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      const userCustomers = this.customers.filter(c => c.user_id === userId);
      const recentServices = this.serviceHistory.filter(s => 
        userCustomers.some(c => c.id === s.customer_id) && 
        new Date(s.service_date) >= cutoffDate
      );

      const analytics = {
        total_customers: userCustomers.length,
        active_customers: userCustomers.filter(c => c.status === 'active').length,
        new_customers: userCustomers.filter(c => 
          new Date(c.created_at) >= cutoffDate
        ).length,
        total_revenue: recentServices.reduce((sum, s) => sum + s.amount, 0),
        average_customer_value: userCustomers.length > 0 ? 
          userCustomers.reduce((sum, c) => sum + c.loyalty_metrics.total_spent, 0) / userCustomers.length : 0,
        customer_retention_rate: this.calculateRetentionRate(userCustomers),
        average_loyalty_score: userCustomers.length > 0 ? 
          userCustomers.reduce((sum, c) => sum + c.loyalty_metrics.loyalty_score, 0) / userCustomers.length : 0,
        top_customers: this.getTopCustomers(userCustomers),
        customer_segments: this.getSegmentBreakdown(userCustomers),
        communication_stats: this.getCommunicationStats(userId, cutoffDate)
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('CustomerManagementService: Error getting customer analytics:', error);
      return { success: false, error: error.message };
    }
  }

  calculateRetentionRate(customers) {
    if (customers.length === 0) return 0;

    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));

    const customersFromSixMonthsAgo = customers.filter(c => 
      new Date(c.created_at) <= sixMonthsAgo
    );

    if (customersFromSixMonthsAgo.length === 0) return 0;

    const stillActive = customersFromSixMonthsAgo.filter(c => 
      c.status === 'active' && 
      c.loyalty_metrics.last_service_date &&
      new Date(c.loyalty_metrics.last_service_date) >= sixMonthsAgo
    );

    return (stillActive.length / customersFromSixMonthsAgo.length) * 100;
  }

  getTopCustomers(customers, limit = 10) {
    return customers
      .sort((a, b) => b.loyalty_metrics.total_spent - a.loyalty_metrics.total_spent)
      .slice(0, limit)
      .map(c => ({
        id: c.id,
        name: c.personal_info.name,
        total_spent: c.loyalty_metrics.total_spent,
        service_count: c.loyalty_metrics.service_count,
        loyalty_score: c.loyalty_metrics.loyalty_score,
        last_service: c.loyalty_metrics.last_service_date
      }));
  }

  getSegmentBreakdown(customers) {
    const breakdown = {};
    
    this.customerSegments.forEach(segment => {
      const segmentCustomers = customers.filter(customer => 
        this.customerMatchesSegment(customer, segment.criteria)
      );
      
      breakdown[segment.id] = {
        name: segment.name,
        count: segmentCustomers.length,
        percentage: customers.length > 0 ? (segmentCustomers.length / customers.length) * 100 : 0
      };
    });

    return breakdown;
  }

  getCommunicationStats(userId, cutoffDate) {
    const userCustomers = this.customers.filter(c => c.user_id === userId);
    const userCustomerIds = userCustomers.map(c => c.id);
    
    const recentCommunications = this.communicationLogs.filter(c => 
      userCustomerIds.includes(c.customer_id) && 
      new Date(c.created_at) >= cutoffDate
    );

    return {
      total_communications: recentCommunications.length,
      inbound_communications: recentCommunications.filter(c => c.direction === 'inbound').length,
      outbound_communications: recentCommunications.filter(c => c.direction === 'outbound').length,
      communication_types: this.groupByType(recentCommunications),
      follow_up_rate: recentCommunications.filter(c => c.follow_up_required).length / Math.max(1, recentCommunications.length) * 100
    };
  }

  groupByType(communications) {
    const grouped = {};
    communications.forEach(c => {
      if (!grouped[c.type]) {
        grouped[c.type] = 0;
      }
      grouped[c.type] += 1;
    });
    return grouped;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  getCustomer(customerId) {
    return this.customers.find(c => c.id === customerId);
  }

  getUserCustomers(userId, status = null) {
    let userCustomers = this.customers.filter(c => c.user_id === userId);
    
    if (status) {
      userCustomers = userCustomers.filter(c => c.status === status);
    }
    
    return userCustomers.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  searchCustomers(userId, searchTerm) {
    const userCustomers = this.customers.filter(c => c.user_id === userId);
    const term = searchTerm.toLowerCase();
    
    return userCustomers.filter(c => 
      c.personal_info.name.toLowerCase().includes(term) ||
      c.personal_info.email.toLowerCase().includes(term) ||
      c.personal_info.phone.includes(term) ||
      c.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }

  clearAllData() {
    this.customers = [];
    this.communicationLogs = [];
    this.followUpReminders = [];
    this.customerSegments = [];
    this.serviceHistory = [];
    return this.saveData();
  }
}

// Export singleton instance
const customerManagementService = new CustomerManagementService();
export default customerManagementService;
