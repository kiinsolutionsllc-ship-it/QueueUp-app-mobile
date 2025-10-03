// AsyncStorage removed - using Supabase only
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import { MOCK_MODE } from '../config/payment';

/**
 * SUBSCRIPTION SERVICE
 * 
 * Complete subscription management system with:
 * - Subscription plan management
 * - User subscription lifecycle
 * - Stripe integration (mock mode)
 * - Usage tracking and enforcement
 * - Billing and payment processing
 * - Feature restrictions based on tier
 */

class SubscriptionService {
  constructor() {
    this.subscriptionPlans = [];
    this.userSubscriptions = [];
    this.subscriptionPayments = [];
    this.subscriptionUsage = [];
    this.trialHistory = [];
    this.abusePrevention = {
      emailTrialCount: {},
      deviceFingerprints: {},
      ipAddresses: {},
      paymentMethods: {},
      cooldownPeriods: {}
    };
    this.initialized = false;
    
    // Storage keys
    this.PLANS_KEY = 'subscription_plans';
    this.SUBSCRIPTIONS_KEY = 'user_subscriptions';
    this.PAYMENTS_KEY = 'subscription_payments';
    this.USAGE_KEY = 'subscription_usage';
    this.TRIAL_HISTORY_KEY = 'trial_history';
    this.ABUSE_PREVENTION_KEY = 'abuse_prevention';
    
    // Subscription statuses
    this.SUBSCRIPTION_STATUS = {
      ACTIVE: 'active',
      TRIALING: 'trialing',
      PAST_DUE: 'past_due',
      CANCELED: 'canceled',
      UNPAID: 'unpaid',
      INCOMPLETE: 'incomplete'
    };
    
    // Payment statuses
    this.PAYMENT_STATUS = {
      PENDING: 'pending',
      SUCCEEDED: 'succeeded',
      FAILED: 'failed',
      REFUNDED: 'refunded'
    };
    
    // Usage types
    this.USAGE_TYPES = {
      JOBS_CREATED: 'jobs_created',
      JOBS_COMPLETED: 'jobs_completed',
      MESSAGES_SENT: 'messages_sent',
      API_CALLS: 'api_calls',
      ACTIVE_JOBS: 'active_jobs'
    };
    
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadData();
      await this.initializeDefaultPlans();
      this.initialized = true;
      console.log('SubscriptionService: Initialized successfully');
    } catch (error) {
      console.error('SubscriptionService: Initialization failed:', error);
    }
  }

  async loadData() {
    try {
      // Subscription data is now managed in memory only
      this.subscriptionPlans = [];
      this.userSubscriptions = [];
      this.subscriptionPayments = [];
      this.subscriptionUsage = [];
      this.trialHistory = [];
      this.abusePrevention = {
        emailTrialCount: {},
        deviceFingerprints: {},
        ipAddresses: {},
        paymentMethods: {},
        cooldownPeriods: {}
      };
    } catch (error) {
      console.error('SubscriptionService: Error loading data:', error);
    }
  }

  async saveData() {
    try {
      // Subscription data is now managed in memory only
      console.log('SubscriptionService: Data is now managed in memory only');
    } catch (error) {
      console.error('SubscriptionService: Error saving data:', error);
    }
  }

  async initializeDefaultPlans() {
    if (this.subscriptionPlans.length > 0) return;

    const defaultPlans = [
      {
        id: 'basic',
        name: 'basic',
        display_name: 'Basic Plan',
        description: 'Ultra-affordable entry point to test the waters',
        price: 4.99,
        currency: 'USD',
        billing_interval: 'month',
        trial_period_days: 14,
        max_jobs_per_month: 5,
        max_active_jobs: 2,
        features: [
          'Up to 5 jobs per month',
          'Up to 2 active jobs',
          'Basic job matching',
          'Mobile app access',
          'Community support',
          'Real-time job notifications',
          'Basic scheduling tools',
          'Customer review system',
          'Secure payment processing',
          'Insurance coverage included'
        ],
        limitations: [
          'Limited job visibility',
          'Standard response time (2-4 hours)',
          'Basic analytics dashboard',
          'No priority support'
        ],
        stripe_price_id: MOCK_MODE ? 'price_basic_mock' : 'price_basic_live',
        stripe_product_id: MOCK_MODE ? 'prod_basic_mock' : 'prod_basic_live',
        is_active: true,
        sort_order: 1
      },
      {
        id: 'starter',
        name: 'starter',
        display_name: 'Starter Plan',
        description: 'Perfect for side hustles transitioning to part-time work',
        price: 12.99,
        currency: 'USD',
        billing_interval: 'month',
        trial_period_days: 14,
        max_jobs_per_month: 30,
        max_active_jobs: 8,
        features: [
          'Up to 30 jobs per month',
          'Up to 8 active jobs',
          'Enhanced job matching',
          'Basic analytics',
          'Email support',
          'Profile boost',
          'Full mobile app access',
          'Real-time job notifications',
          'Advanced scheduling tools',
          'Customer review system',
          'Secure payment processing',
          'Insurance coverage included',
          'Priority listing in search results'
        ],
        limitations: [
          'Limited advanced features',
          'Standard response time (1-2 hours)',
          'No team collaboration tools'
        ],
        stripe_price_id: MOCK_MODE ? 'price_starter_mock' : 'price_starter_live',
        stripe_product_id: MOCK_MODE ? 'prod_starter_mock' : 'prod_starter_live',
        is_active: true,
        sort_order: 2
      },
      {
        id: 'professional',
        name: 'professional',
        display_name: 'Professional Plan',
        description: 'Complete business management solution - MOST POPULAR',
        price: 24.99,
        currency: 'USD',
        billing_interval: 'month',
        trial_period_days: 14,
        max_jobs_per_month: null, // unlimited
        max_active_jobs: 50,
        features: [
          'Unlimited jobs per month',
          'Up to 50 active jobs',
          'AI-powered matching',
          'Advanced analytics',
          'Priority support',
          'Team collaboration',
          'Invoice tools',
          'Customer management',
          'Full mobile app access',
          'Instant job notifications',
          'Advanced scheduling & calendar',
          'Customer reviews & ratings management',
          'Enhanced messaging system',
          'Custom pricing tiers & packages',
          'Priority listing in search results',
          'Advanced marketing tools',
          'Insurance coverage included',
          'Free professional photoshoot',
          'Dedicated account manager'
        ],
        limitations: [],
        stripe_price_id: MOCK_MODE ? 'price_professional_mock' : 'price_professional_live',
        stripe_product_id: MOCK_MODE ? 'prod_professional_mock' : 'prod_professional_live',
        is_active: true,
        sort_order: 3
      },
      {
        id: 'enterprise',
        name: 'enterprise',
        display_name: 'Enterprise Plan',
        description: 'Scale operations with enterprise-grade tools - Coming Soon!',
        price: 49.99,
        currency: 'USD',
        billing_interval: 'month',
        trial_period_days: 7,
        max_jobs_per_month: null, // unlimited
        max_active_jobs: null, // unlimited
        features: [
          'Unlimited jobs per month',
          'Unlimited active jobs',
          'AI-powered matching + recommendations',
          'Advanced analytics & reporting',
          '24/7 premium support (15-min response)',
          'White-label options',
          'API access',
          'Dedicated account manager',
          'Custom integrations',
          'Multi-location management',
          'Advanced reporting & insights',
          'Full mobile app access',
          'Instant job notifications',
          'Advanced scheduling & calendar',
          'Customer reviews & ratings management',
          'Advanced marketing tools & promotion',
          'Custom pricing tiers & packages',
          'Team management tools',
          'Insurance coverage included',
          'Priority listing in search results',
          'Customer loyalty program',
          'Free professional photoshoot',
          'Custom business tools',
          'Bulk job management'
        ],
        limitations: [],
        stripe_price_id: MOCK_MODE ? 'price_enterprise_mock' : 'price_enterprise_live',
        stripe_product_id: MOCK_MODE ? 'prod_enterprise_mock' : 'prod_enterprise_live',
        is_active: false, // Disabled - Coming Soon
        is_coming_soon: true, // New flag for Coming Soon status
        sort_order: 4
      }
    ];

    this.subscriptionPlans = defaultPlans.map(plan => ({
      ...plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    await this.saveData();
    console.log('SubscriptionService: Default plans initialized');
  }

  // ========================================
  // SUBSCRIPTION PLAN MANAGEMENT
  // ========================================

  getAllPlans() {
    return this.subscriptionPlans.filter(plan => plan.is_active);
  }

  getPlanById(planId) {
    return this.subscriptionPlans.find(plan => plan.id === planId);
  }

  getPlanByStripePriceId(stripePriceId) {
    return this.subscriptionPlans.find(plan => plan.stripe_price_id === stripePriceId);
  }

  // ========================================
  // USER SUBSCRIPTION MANAGEMENT
  // ========================================

  getUserSubscription(userId) {
    return this.userSubscriptions.find(sub => 
      sub.user_id === userId && 
      ['active', 'trialing'].includes(sub.status)
    );
  }

  getUserSubscriptionHistory(userId) {
    return this.userSubscriptions.filter(sub => sub.user_id === userId);
  }

  // ========================================
  // TRIAL ABUSE PREVENTION
  // ========================================

  // Generate device fingerprint
  generateDeviceFingerprint() {
    // In a real app, this would use device-specific information
    // For now, we'll use a combination of available data
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `device_${timestamp}_${random}`;
  }

  // Get user's IP address (mock implementation)
  async getUserIPAddress() {
    // In a real app, this would get the actual IP address
    // For now, we'll return a mock IP
    return '192.168.1.100'; // This would be the actual IP in production
  }

  // Check if user has used trial before
  hasUsedTrialBefore(userId, email, deviceFingerprint, ipAddress) {
    // Check trial history for this user
    const userTrialHistory = this.trialHistory.filter(trial => 
      trial.user_id === userId || 
      trial.email === email ||
      trial.device_fingerprint === deviceFingerprint ||
      trial.ip_address === ipAddress
    );

    return userTrialHistory.length > 0;
  }

  // Check if user is in cooldown period
  isInCooldownPeriod(userId, email, deviceFingerprint, ipAddress) {
    const now = new Date();
    const cooldownDays = 30; // 30-day cooldown
    const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;

    // Check cooldown for user ID
    if (this.abusePrevention.cooldownPeriods[userId]) {
      const lastTrial = new Date(this.abusePrevention.cooldownPeriods[userId]);
      if (now.getTime() - lastTrial.getTime() < cooldownMs) {
        return {
          inCooldown: true,
          remainingDays: Math.ceil((cooldownMs - (now.getTime() - lastTrial.getTime())) / (24 * 60 * 60 * 1000))
        };
      }
    }

    // Check cooldown for email
    if (this.abusePrevention.cooldownPeriods[email]) {
      const lastTrial = new Date(this.abusePrevention.cooldownPeriods[email]);
      if (now.getTime() - lastTrial.getTime() < cooldownMs) {
        return {
          inCooldown: true,
          remainingDays: Math.ceil((cooldownMs - (now.getTime() - lastTrial.getTime())) / (24 * 60 * 60 * 1000))
        };
      }
    }

    // Check cooldown for device fingerprint
    if (this.abusePrevention.cooldownPeriods[deviceFingerprint]) {
      const lastTrial = new Date(this.abusePrevention.cooldownPeriods[deviceFingerprint]);
      if (now.getTime() - lastTrial.getTime() < cooldownMs) {
        return {
          inCooldown: true,
          remainingDays: Math.ceil((cooldownMs - (now.getTime() - lastTrial.getTime())) / (24 * 60 * 60 * 1000))
        };
      }
    }

    // Check cooldown for IP address
    if (this.abusePrevention.cooldownPeriods[ipAddress]) {
      const lastTrial = new Date(this.abusePrevention.cooldownPeriods[ipAddress]);
      if (now.getTime() - lastTrial.getTime() < cooldownMs) {
        return {
          inCooldown: true,
          remainingDays: Math.ceil((cooldownMs - (now.getTime() - lastTrial.getTime())) / (24 * 60 * 60 * 1000))
        };
      }
    }

    return { inCooldown: false };
  }

  // Validate trial eligibility
  async validateTrialEligibility(userId, email, paymentMethodId = null) {
    try {
      const deviceFingerprint = this.generateDeviceFingerprint();
      const ipAddress = await this.getUserIPAddress();

      // Check if user has used trial before
      if (this.hasUsedTrialBefore(userId, email, deviceFingerprint, ipAddress)) {
        return {
          eligible: false,
          reason: 'Trial already used',
          message: 'You have already used a free trial. Please subscribe to continue using our services.'
        };
      }

      // Check cooldown period
      const cooldownCheck = this.isInCooldownPeriod(userId, email, deviceFingerprint, ipAddress);
      if (cooldownCheck.inCooldown) {
        return {
          eligible: false,
          reason: 'Cooldown period active',
          message: `You must wait ${cooldownCheck.remainingDays} more days before starting another trial.`,
          remainingDays: cooldownCheck.remainingDays
        };
      }

      // Check email trial count (prevent multiple trials with different emails)
      const emailTrialCount = this.abusePrevention.emailTrialCount[email] || 0;
      if (emailTrialCount >= 1) {
        return {
          eligible: false,
          reason: 'Email trial limit reached',
          message: 'This email address has already been used for a trial.'
        };
      }

      // Check payment method (if provided)
      if (paymentMethodId && this.abusePrevention.paymentMethods[paymentMethodId]) {
        return {
          eligible: false,
          reason: 'Payment method already used',
          message: 'This payment method has already been used for a trial.'
        };
      }

      return {
        eligible: true,
        deviceFingerprint,
        ipAddress
      };
    } catch (error) {
      console.error('SubscriptionService: Error validating trial eligibility:', error);
      return {
        eligible: false,
        reason: 'Validation error',
        message: 'Unable to validate trial eligibility. Please try again.'
      };
    }
  }

  // Record trial usage
  async recordTrialUsage(userId, email, deviceFingerprint, ipAddress, planId, paymentMethodId = null) {
    try {
      const now = new Date();

      // Add to trial history
      const trialRecord = {
        id: uniqueIdGenerator.generateId('trial'),
        user_id: userId,
        email: email,
        device_fingerprint: deviceFingerprint,
        ip_address: ipAddress,
        plan_id: planId,
        payment_method_id: paymentMethodId,
        trial_start: now.toISOString(),
        created_at: now.toISOString()
      };

      this.trialHistory.push(trialRecord);

      // Update abuse prevention tracking
      this.abusePrevention.emailTrialCount[email] = (this.abusePrevention.emailTrialCount[email] || 0) + 1;
      this.abusePrevention.deviceFingerprints[deviceFingerprint] = now.toISOString();
      this.abusePrevention.ipAddresses[ipAddress] = now.toISOString();
      
      if (paymentMethodId) {
        this.abusePrevention.paymentMethods[paymentMethodId] = now.toISOString();
      }

      // Set cooldown periods
      this.abusePrevention.cooldownPeriods[userId] = now.toISOString();
      this.abusePrevention.cooldownPeriods[email] = now.toISOString();
      this.abusePrevention.cooldownPeriods[deviceFingerprint] = now.toISOString();
      this.abusePrevention.cooldownPeriods[ipAddress] = now.toISOString();

      await this.saveData();

      console.log(`SubscriptionService: Recorded trial usage for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('SubscriptionService: Error recording trial usage:', error);
      return { success: false, error: error.message };
    }
  }

  async createSubscription(userId, planId, paymentMethodId = null, userEmail = null) {
    try {
      const plan = this.getPlanById(planId);
      if (!plan) {
        return { success: false, error: 'Plan not found' };
      }

      // Check if user already has an active subscription
      const existingSubscription = this.getUserSubscription(userId);
      if (existingSubscription) {
        return { success: false, error: 'User already has an active subscription' };
      }

      // If this is a trial plan, validate trial eligibility
      if (plan.trial_period_days > 0 && userEmail) {
        const trialValidation = await this.validateTrialEligibility(userId, userEmail, paymentMethodId);
        if (!trialValidation.eligible) {
          return { 
            success: false, 
            error: trialValidation.message,
            reason: trialValidation.reason,
            remainingDays: trialValidation.remainingDays
          };
        }
      }

      const now = new Date();
      const trialEnd = plan.trial_period_days > 0 
        ? new Date(now.getTime() + (plan.trial_period_days * 24 * 60 * 60 * 1000))
        : null;
      
      const periodStart = trialEnd || now;
      const periodEnd = new Date(periodStart.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

      // Validate that userId follows the new type-specific format
      if (!userId.startsWith('CUSTOMER-') && !userId.startsWith('MECHANIC-') && 
          !userId.startsWith('customer_') && !userId.startsWith('mechanic_')) {
        console.warn('SubscriptionService: User ID does not follow expected format:', userId);
      }

      const subscription = {
        id: uniqueIdGenerator.generateId('sub'),
        user_id: userId, // Should be CUSTOMER- or MECHANIC- prefixed ID
        plan_id: planId,
        status: plan.trial_period_days > 0 ? this.SUBSCRIPTION_STATUS.TRIALING : this.SUBSCRIPTION_STATUS.ACTIVE,
        stripe_subscription_id: MOCK_MODE ? `sub_mock_${Date.now()}` : null,
        stripe_customer_id: MOCK_MODE ? `cus_mock_${userId}` : null,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        trial_start: plan.trial_period_days > 0 ? now.toISOString() : null,
        trial_end: trialEnd ? trialEnd.toISOString() : null,
        canceled_at: null,
        cancel_at_period_end: false,
        cancel_reason: null,
        metadata: {
          created_via: 'mobile_app',
          payment_method_id: paymentMethodId
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.userSubscriptions.push(subscription);
      await this.saveData();

      // Initialize usage tracking
      await this.initializeUsageTracking(userId, subscription.id, periodStart, periodEnd);

      // If this is a trial, record trial usage for abuse prevention
      if (plan.trial_period_days > 0 && userEmail) {
        const trialValidation = await this.validateTrialEligibility(userId, userEmail, paymentMethodId);
        if (trialValidation.eligible) {
          await this.recordTrialUsage(
            userId, 
            userEmail, 
            trialValidation.deviceFingerprint, 
            trialValidation.ipAddress, 
            planId, 
            paymentMethodId
          );
        }
      }

      console.log(`SubscriptionService: Created subscription ${subscription.id} for user ${userId}`);
      return { success: true, subscription };
    } catch (error) {
      console.error('SubscriptionService: Error creating subscription:', error);
      return { success: false, error: error.message };
    }
  }

  async updateSubscription(subscriptionId, updates) {
    try {
      const subscriptionIndex = this.userSubscriptions.findIndex(sub => sub.id === subscriptionId);
      if (subscriptionIndex === -1) {
        return { success: false, error: 'Subscription not found' };
      }

      this.userSubscriptions[subscriptionIndex] = {
        ...this.userSubscriptions[subscriptionIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      await this.saveData();
      return { success: true, subscription: this.userSubscriptions[subscriptionIndex] };
    } catch (error) {
      console.error('SubscriptionService: Error updating subscription:', error);
      return { success: false, error: error.message };
    }
  }

  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true, reason = 'user_requested') {
    try {
      const subscription = this.userSubscriptions.find(sub => sub.id === subscriptionId);
      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      const updates = {
        cancel_at_period_end: cancelAtPeriodEnd,
        cancel_reason: reason,
        updated_at: new Date().toISOString()
      };

      if (!cancelAtPeriodEnd) {
        updates.status = this.SUBSCRIPTION_STATUS.CANCELED;
        updates.canceled_at = new Date().toISOString();
      }

      return await this.updateSubscription(subscriptionId, updates);
    } catch (error) {
      console.error('SubscriptionService: Error canceling subscription:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // USAGE TRACKING AND ENFORCEMENT
  // ========================================

  async initializeUsageTracking(userId, subscriptionId, periodStart, periodEnd) {
    const usageTypes = Object.values(this.USAGE_TYPES);
    
    for (const usageType of usageTypes) {
      const existingUsage = this.subscriptionUsage.find(usage => 
        usage.user_id === userId && 
        usage.usage_type === usageType &&
        new Date(usage.billing_period_start) <= periodStart &&
        new Date(usage.billing_period_end) >= periodEnd
      );

      if (!existingUsage) {
        const usage = {
          id: uniqueIdGenerator.generateId('usage'),
          user_id: userId,
          subscription_id: subscriptionId,
          usage_type: usageType,
          usage_count: 0,
          usage_limit: this.getUsageLimit(userId, usageType),
          billing_period_start: periodStart.toISOString(),
          billing_period_end: periodEnd.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.subscriptionUsage.push(usage);
      }
    }

    await this.saveData();
  }

  getUsageLimit(userId, usageType) {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return 0;

    const plan = this.getPlanById(subscription.plan_id);
    if (!plan) return 0;

    switch (usageType) {
      case this.USAGE_TYPES.JOBS_CREATED:
        return plan.max_jobs_per_month;
      case this.USAGE_TYPES.ACTIVE_JOBS:
        return plan.max_active_jobs;
      case this.USAGE_TYPES.MESSAGES_SENT:
        switch (plan.name) {
          case 'basic': return 20; // 20 messages per day for basic
          case 'starter': return 100; // 100 messages per day for starter
          case 'professional': return null; // unlimited for professional
          case 'enterprise': return null; // unlimited for enterprise
          default: return 20;
        }
      case this.USAGE_TYPES.API_CALLS:
        switch (plan.name) {
          case 'basic': return 0; // No API access for basic
          case 'starter': return 0; // No API access for starter
          case 'professional': return 10000; // 10k API calls per month for professional
          case 'enterprise': return 0; // Enterprise disabled - no API access
          default: return 0;
        }
      default:
        return null;
    }
  }

  async trackUsage(userId, usageType, increment = 1) {
    try {
      const subscription = this.getUserSubscription(userId);
      if (!subscription) {
        return { success: false, error: 'No active subscription found' };
      }

      const now = new Date();
      const usage = this.subscriptionUsage.find(u => 
        u.user_id === userId && 
        u.usage_type === usageType &&
        new Date(u.billing_period_start) <= now &&
        new Date(u.billing_period_end) >= now
      );

      if (!usage) {
        return { success: false, error: 'Usage tracking not initialized' };
      }

      // Check if usage limit would be exceeded
      if (usage.usage_limit !== null && (usage.usage_count + increment) > usage.usage_limit) {
        return { 
          success: false, 
          error: 'Usage limit exceeded',
          currentUsage: usage.usage_count,
          limit: usage.usage_limit,
          usageType
        };
      }

      usage.usage_count += increment;
      usage.updated_at = new Date().toISOString();

      await this.saveData();
      return { success: true, usage };
    } catch (error) {
      console.error('SubscriptionService: Error tracking usage:', error);
      return { success: false, error: error.message };
    }
  }

  getCurrentUsage(userId, usageType) {
    const now = new Date();
    const usage = this.subscriptionUsage.find(u => 
      u.user_id === userId && 
      u.usage_type === usageType &&
      new Date(u.billing_period_start) <= now &&
      new Date(u.billing_period_end) >= now
    );

    return usage || { usage_count: 0, usage_limit: 0 };
  }

  // ========================================
  // FEATURE ENFORCEMENT
  // ========================================

  // Check if user is a mechanic (subscription features are mechanic-only)
  async isUserMechanic(userId) {
    try {
      // In a real app, this would check the user's type from the database
      // For now, we'll check if the user has a mechanic profile or subscription
      const subscription = this.getUserSubscription(userId);
      if (!subscription) return false;
      
      // If user has a subscription, they must be a mechanic
      // Customers don't have subscriptions in this system
      return true;
    } catch (error) {
      console.error('SubscriptionService: Error checking user type:', error);
      return false;
    }
  }

  canUserPerformAction(userId, action, userType = null) {
    // RESTRICTION: Subscription features are only available to mechanics
    if (userType && userType !== 'mechanic') {
      return { 
        allowed: false, 
        reason: 'Subscription features are only available to mechanics. Customers cannot use subscription features.',
        restrictionType: 'user_type_restriction'
      };
    }

    const subscription = this.getUserSubscription(userId);
    if (!subscription) return { allowed: false, reason: 'No active subscription' };

    const plan = this.getPlanById(subscription.plan_id);
    if (!plan) return { allowed: false, reason: 'Invalid subscription plan' };

    switch (action) {
      case 'create_job': {
        const jobUsage = this.getCurrentUsage(userId, this.USAGE_TYPES.JOBS_CREATED);
        if (jobUsage.usage_limit !== null && jobUsage.usage_count >= jobUsage.usage_limit) {
          return { 
            allowed: false, 
            reason: 'Monthly job limit reached',
            currentUsage: jobUsage.usage_count,
            limit: jobUsage.usage_limit
          };
        }
        return { allowed: true };
      }

      case 'have_active_job': {
        const activeJobUsage = this.getCurrentUsage(userId, this.USAGE_TYPES.ACTIVE_JOBS);
        if (activeJobUsage.usage_limit !== null && activeJobUsage.usage_count >= activeJobUsage.usage_limit) {
          return { 
            allowed: false, 
            reason: 'Active job limit reached',
            currentUsage: activeJobUsage.usage_count,
            limit: activeJobUsage.usage_limit
          };
        }
        return { allowed: true };
      }

      case 'send_message':
        if (plan.name === 'basic' || plan.name === 'starter') {
          const messageUsage = this.getCurrentUsage(userId, this.USAGE_TYPES.MESSAGES_SENT);
          if (messageUsage.usage_limit !== null && messageUsage.usage_count >= messageUsage.usage_limit) {
            return { 
              allowed: false, 
              reason: 'Daily message limit reached',
              currentUsage: messageUsage.usage_count,
              limit: messageUsage.usage_limit
            };
          }
        }
        return { allowed: true };

      case 'use_advanced_analytics':
        return { 
          allowed: plan.name === 'starter' || plan.name === 'professional' || plan.name === 'enterprise',
          reason: plan.name === 'basic' ? 'Upgrade to Starter or higher for advanced analytics' : null
        };

      case 'use_priority_support':
        return { 
          allowed: plan.name === 'professional' || plan.name === 'enterprise',
          reason: plan.name === 'basic' || plan.name === 'starter' ? 'Upgrade to Professional or higher for priority support' : null
        };

      case 'use_api_access':
        return { 
          allowed: plan.name === 'professional' || plan.name === 'enterprise',
          reason: plan.name === 'basic' || plan.name === 'starter' ? 'Upgrade to Professional or higher for API access' : null
        };

      case 'use_profile_boost':
        return { 
          allowed: plan.name === 'starter' || plan.name === 'professional' || plan.name === 'enterprise',
          reason: plan.name === 'basic' ? 'Upgrade to Starter or higher for profile boost' : null
        };

      case 'use_team_collaboration':
        return { 
          allowed: plan.name === 'professional' || plan.name === 'enterprise',
          reason: plan.name === 'basic' || plan.name === 'starter' ? 'Upgrade to Professional or higher for team collaboration' : null
        };

      case 'use_invoice_tools':
        return { 
          allowed: plan.name === 'professional' || plan.name === 'enterprise',
          reason: plan.name === 'basic' || plan.name === 'starter' ? 'Upgrade to Professional or higher for invoice tools' : null
        };

      case 'use_customer_management':
        return { 
          allowed: plan.name === 'professional' || plan.name === 'enterprise',
          reason: plan.name === 'basic' || plan.name === 'starter' ? 'Upgrade to Professional or higher for customer management' : null
        };

      case 'use_white_label':
        return { 
          allowed: false, // Enterprise features disabled
          reason: 'White-label options are coming soon in our Enterprise plan'
        };

      case 'use_multi_location':
        return { 
          allowed: false, // Enterprise features disabled
          reason: 'Multi-location management is coming soon in our Enterprise plan'
        };

      case 'use_custom_integrations':
        return { 
          allowed: false, // Enterprise features disabled
          reason: 'Custom integrations are coming soon in our Enterprise plan'
        };

      case 'use_ai_matching':
        return { 
          allowed: plan.name === 'professional' || plan.name === 'enterprise',
          reason: plan.name === 'basic' || plan.name === 'starter' ? 'Upgrade to Professional or higher for AI-powered matching' : null
        };

      default:
        return { allowed: true };
    }
  }

  // ========================================
  // BILLING AND PAYMENTS
  // ========================================

  async processSubscriptionPayment(subscriptionId) {
    try {
      const subscription = this.userSubscriptions.find(sub => sub.id === subscriptionId);
      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      const plan = this.getPlanById(subscription.plan_id);
      if (!plan) {
        return { success: false, error: 'Plan not found' };
      }

      // Simulate Stripe payment processing
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const payment = {
          id: uniqueIdGenerator.generateId('payment'),
          subscription_id: subscriptionId,
          user_id: subscription.user_id,
          amount: plan.price,
          currency: plan.currency,
          status: this.PAYMENT_STATUS.SUCCEEDED,
          stripe_payment_intent_id: `pi_mock_${Date.now()}`,
          stripe_invoice_id: `in_mock_${Date.now()}`,
          billing_period_start: subscription.current_period_start,
          billing_period_end: subscription.current_period_end,
          paid_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };

        this.subscriptionPayments.push(payment);

        // Update subscription period
        const newPeriodStart = new Date(subscription.current_period_end);
        const newPeriodEnd = new Date(newPeriodStart.getTime() + (30 * 24 * 60 * 60 * 1000));

        await this.updateSubscription(subscriptionId, {
          current_period_start: newPeriodStart.toISOString(),
          current_period_end: newPeriodEnd.toISOString(),
          status: this.SUBSCRIPTION_STATUS.ACTIVE
        });

        // Initialize new usage tracking period
        await this.initializeUsageTracking(subscription.user_id, subscriptionId, newPeriodStart, newPeriodEnd);

        await this.saveData();
        return { success: true, payment };
      } else {
        // Production Stripe integration would go here
        return { success: false, error: 'Production billing not implemented yet' };
      }
    } catch (error) {
      console.error('SubscriptionService: Error processing payment:', error);
      return { success: false, error: error.message };
    }
  }

  getSubscriptionPayments(userId, limit = 10) {
    return this.subscriptionPayments
      .filter(payment => payment.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }

  // ========================================
  // ANALYTICS AND REPORTING
  // ========================================

  getSubscriptionAnalytics() {
    const totalSubscriptions = this.userSubscriptions.length;
    const activeSubscriptions = this.userSubscriptions.filter(sub => 
      sub.status === this.SUBSCRIPTION_STATUS.ACTIVE
    ).length;
    const trialingSubscriptions = this.userSubscriptions.filter(sub => 
      sub.status === this.SUBSCRIPTION_STATUS.TRIALING
    ).length;

    const planBreakdown = this.subscriptionPlans.map(plan => ({
      planId: plan.id,
      planName: plan.display_name,
      count: this.userSubscriptions.filter(sub => sub.plan_id === plan.id).length
    }));

    const monthlyRevenue = this.subscriptionPayments
      .filter(payment => 
        payment.status === this.PAYMENT_STATUS.SUCCEEDED &&
        new Date(payment.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      )
      .reduce((total, payment) => total + payment.amount, 0);

    return {
      totalSubscriptions,
      activeSubscriptions,
      trialingSubscriptions,
      planBreakdown,
      monthlyRevenue
    };
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  isSubscriptionActive(userId) {
    const subscription = this.getUserSubscription(userId);
    return subscription && ['active', 'trialing'].includes(subscription.status);
  }

  getSubscriptionTier(userId) {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return 'basic';
    
    const plan = this.getPlanById(subscription.plan_id);
    return plan ? plan.name : 'basic';
  }

  getSubscriptionFeatures(userId) {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return [];

    const plan = this.getPlanById(subscription.plan_id);
    return plan ? plan.features : [];
  }

  async refresh() {
    await this.loadData();
  }
}

// Export singleton instance
export default new SubscriptionService();
