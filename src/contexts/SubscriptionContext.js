import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContextAWS';
import SubscriptionService from '../services/SubscriptionService';

/**
 * SUBSCRIPTION CONTEXT
 * 
 * Provides subscription state management and business logic:
 * - Current subscription status and plan
 * - Usage tracking and limits
 * - Feature access control
 * - Subscription management actions
 * - Real-time updates
 */

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Subscription state
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [usage, setUsage] = useState({});
  const [subscriptionPayments, setSubscriptionPayments] = useState([]);
  
  // Feature access state
  const [featureAccess, setFeatureAccess] = useState({});
  
  // Initialize subscription data
  const initializeSubscription = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load subscription plans
      const plans = SubscriptionService.getAllPlans();
      setSubscriptionPlans(plans);

      // Load user's current subscription
      const subscription = SubscriptionService.getUserSubscription(user.id);
      setCurrentSubscription(subscription);

      if (subscription) {
        // Load current plan details
        const plan = SubscriptionService.getPlanById(subscription.plan_id);
        setCurrentPlan(plan);

        // Load usage data
        const usageData = {};
        const usageTypes = ['jobs_created', 'active_jobs', 'messages_sent', 'api_calls'];
        
        for (const usageType of usageTypes) {
          usageData[usageType] = SubscriptionService.getCurrentUsage(user.id, usageType);
        }
        setUsage(usageData);

        // Load payment history
        const payments = SubscriptionService.getSubscriptionPayments(user.id, 10);
        setSubscriptionPayments(payments);

        // Calculate feature access
        const access = {};
        const features = [
          'create_job',
          'have_active_job', 
          'send_message',
          'use_advanced_analytics',
          'use_priority_support',
          'use_api_access'
        ];

        for (const feature of features) {
          access[feature] = SubscriptionService.canUserPerformAction(user.id, feature);
        }
        setFeatureAccess(access);
      } else {
        // No subscription - set defaults
        setCurrentPlan(null);
        setUsage({});
        setSubscriptionPayments([]);
        setFeatureAccess({});
      }

    } catch (err) {
      console.error('SubscriptionContext: Error initializing subscription:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Subscribe to a plan
  const subscribeToPlan = useCallback(async (planId, paymentMethodId = null) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      const result = await SubscriptionService.createSubscription(user.id, planId, paymentMethodId, user.email);
      
      if (result.success) {
        // Refresh subscription data
        await initializeSubscription();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('SubscriptionContext: Error subscribing to plan:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, initializeSubscription, user?.email]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (subscriptionId, cancelAtPeriodEnd = true, reason = 'user_requested') => {
    try {
      setLoading(true);
      setError(null);

      const result = await SubscriptionService.cancelSubscription(subscriptionId, cancelAtPeriodEnd, reason);
      
      if (result.success) {
        // Refresh subscription data
        await initializeSubscription();
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('SubscriptionContext: Error canceling subscription:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initializeSubscription]);

  // Track usage
  const trackUsage = useCallback(async (usageType, increment = 1) => {
    if (!user?.id) return { success: false, error: 'User not authenticated' };

    try {
      const result = await SubscriptionService.trackUsage(user.id, usageType, increment);
      
      if (result.success) {
        // Update local usage state
        setUsage(prev => ({
          ...prev,
          [usageType]: result.usage
        }));

        // Update feature access if needed
        if (usageType === 'jobs_created' || usageType === 'active_jobs') {
          const access = SubscriptionService.canUserPerformAction(user.id, 'create_job');
          setFeatureAccess(prev => ({
            ...prev,
            create_job: access
          }));
        }
      }
      
      return result;
    } catch (err) {
      console.error('SubscriptionContext: Error tracking usage:', err);
      return { success: false, error: err.message };
    }
  }, [user?.id]);

  // Check feature access
  const checkFeatureAccess = useCallback((action) => {
    if (!user?.id) return { allowed: false, reason: 'User not authenticated' };
    return SubscriptionService.canUserPerformAction(user.id, action, user.type);
  }, [user?.id, user?.type]);

  // Get subscription tier
  const getSubscriptionTier = useCallback(() => {
    if (!user?.id) return 'basic';
    return SubscriptionService.getSubscriptionTier(user.id);
  }, [user?.id]);

  // Get subscription features
  const getSubscriptionFeatures = useCallback(() => {
    if (!user?.id) return [];
    return SubscriptionService.getSubscriptionFeatures(user.id);
  }, [user?.id]);

  // Check if subscription is active
  const isSubscriptionActive = useCallback(() => {
    if (!user?.id) return false;
    return SubscriptionService.isSubscriptionActive(user.id);
  }, [user?.id]);

  // Refresh subscription data
  const refreshSubscription = useCallback(async () => {
    await initializeSubscription();
  }, [initializeSubscription]);

  // Get usage for a specific type
  const getUsage = useCallback((usageType) => {
    if (!user?.id) return { usage_count: 0, usage_limit: 0 };
    return SubscriptionService.getCurrentUsage(user.id, usageType);
  }, [user?.id]);

  // Get subscription analytics (admin only)
  const getSubscriptionAnalytics = useCallback(() => {
    return SubscriptionService.getSubscriptionAnalytics();
  }, []);

  // Initialize on mount and when user changes
  useEffect(() => {
    initializeSubscription();
  }, [initializeSubscription]);

  // Auto-refresh subscription data every 5 minutes
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      initializeSubscription();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.id, initializeSubscription]);

  const value = {
    // State
    loading,
    error,
    currentSubscription,
    currentPlan,
    subscriptionPlans,
    usage,
    subscriptionPayments,
    featureAccess,
    
    // Actions
    subscribeToPlan,
    cancelSubscription,
    trackUsage,
    checkFeatureAccess,
    refreshSubscription,
    
    // Getters
    getSubscriptionTier,
    getSubscriptionFeatures,
    isSubscriptionActive,
    getUsage,
    getSubscriptionAnalytics,
    
    // Utility
    setError
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
