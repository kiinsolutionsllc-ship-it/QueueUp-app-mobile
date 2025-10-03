import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import { MOCK_MODE } from '../config/payment';

/**
 * API ACCESS SERVICE
 * 
 * Enterprise API access and management for Professional and Enterprise tiers
 * Features:
 * - API key management
 * - Rate limiting
 * - Usage tracking
 * - Webhook management
 * - API documentation
 * - Integration management
 */

class APIAccessService {
  constructor() {
    this.apiKeys = [];
    this.apiUsage = [];
    this.webhooks = [];
    this.integrations = [];
    this.rateLimits = [];
    this.initialized = false;
    
    // Storage keys
    this.API_KEYS_KEY = 'api_access_keys';
    this.API_USAGE_KEY = 'api_access_usage';
    this.WEBHOOKS_KEY = 'api_access_webhooks';
    this.INTEGRATIONS_KEY = 'api_access_integrations';
    this.RATE_LIMITS_KEY = 'api_access_rate_limits';
    
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadData();
      await this.initializeDefaultRateLimits();
      this.initialized = true;
      console.log('APIAccessService: Initialized successfully');
    } catch (error) {
      console.error('APIAccessService: Error initializing:', error);
    }
  }

  async loadData() {
    try {
      const [apiKeys, usage, webhooks, integrations, rateLimits] = await Promise.all([
        AsyncStorage.getItem(this.API_KEYS_KEY),
        AsyncStorage.getItem(this.API_USAGE_KEY),
        AsyncStorage.getItem(this.WEBHOOKS_KEY),
        AsyncStorage.getItem(this.INTEGRATIONS_KEY),
        AsyncStorage.getItem(this.RATE_LIMITS_KEY)
      ]);

      this.apiKeys = apiKeys ? JSON.parse(apiKeys) : [];
      this.apiUsage = usage ? JSON.parse(usage) : [];
      this.webhooks = webhooks ? JSON.parse(webhooks) : [];
      this.integrations = integrations ? JSON.parse(integrations) : [];
      this.rateLimits = rateLimits ? JSON.parse(rateLimits) : [];
    } catch (error) {
      console.error('APIAccessService: Error loading data:', error);
    }
  }

  async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.API_KEYS_KEY, JSON.stringify(this.apiKeys)),
        AsyncStorage.setItem(this.API_USAGE_KEY, JSON.stringify(this.apiUsage)),
        AsyncStorage.setItem(this.WEBHOOKS_KEY, JSON.stringify(this.webhooks)),
        AsyncStorage.setItem(this.INTEGRATIONS_KEY, JSON.stringify(this.integrations)),
        AsyncStorage.setItem(this.RATE_LIMITS_KEY, JSON.stringify(this.rateLimits))
      ]);
    } catch (error) {
      console.error('APIAccessService: Error saving data:', error);
    }
  }

  async initializeDefaultRateLimits() {
    if (this.rateLimits.length > 0) return;

    const defaultRateLimits = [
      {
        id: 'professional_tier',
        tier: 'professional',
        requests_per_minute: 100,
        requests_per_hour: 1000,
        requests_per_day: 10000,
        burst_limit: 200,
        description: 'Professional tier rate limits'
      },
      {
        id: 'enterprise_tier',
        tier: 'enterprise',
        requests_per_minute: 500,
        requests_per_hour: 5000,
        requests_per_day: 50000,
        burst_limit: 1000,
        description: 'Enterprise tier rate limits'
      }
    ];

    this.rateLimits = defaultRateLimits;
    await this.saveData();
  }

  // ========================================
  // API KEY MANAGEMENT
  // ========================================

  async generateAPIKey(userId, keyData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const apiKey = {
          id: uniqueIdGenerator.generateId('apikey'),
          user_id: userId,
          key_name: keyData.key_name,
          key_value: this.generateKeyValue(),
          key_secret: this.generateKeySecret(),
          permissions: keyData.permissions || ['read'], // read, write, admin
          scopes: keyData.scopes || ['jobs', 'customers'], // jobs, customers, analytics, payments
          status: 'active', // active, inactive, revoked
          last_used: null,
          usage_count: 0,
          created_at: new Date().toISOString(),
          expires_at: keyData.expires_at || null
        };

        this.apiKeys.push(apiKey);
        await this.saveData();
        return { success: true, apiKey };
      }
    } catch (error) {
      console.error('APIAccessService: Error generating API key:', error);
      return { success: false, error: error.message };
    }
  }

  async revokeAPIKey(keyId) {
    try {
      const apiKey = this.apiKeys.find(k => k.id === keyId);
      if (!apiKey) {
        return { success: false, error: 'API key not found' };
      }

      apiKey.status = 'revoked';
      apiKey.revoked_at = new Date().toISOString();
      await this.saveData();
      return { success: true, apiKey };
    } catch (error) {
      console.error('APIAccessService: Error revoking API key:', error);
      return { success: false, error: error.message };
    }
  }

  validateAPIKey(keyValue) {
    const apiKey = this.apiKeys.find(k => k.key_value === keyValue && k.status === 'active');
    if (!apiKey) {
      return { valid: false, error: 'Invalid or inactive API key' };
    }

    // Check expiration
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return { valid: false, error: 'API key has expired' };
    }

    return { valid: true, apiKey };
  }

  // ========================================
  // RATE LIMITING
  // ========================================

  async checkRateLimit(apiKeyId, endpoint) {
    try {
      const apiKey = this.apiKeys.find(k => k.id === apiKeyId);
      if (!apiKey) {
        return { allowed: false, error: 'API key not found' };
      }

      const now = new Date();
      const userUsage = this.apiUsage.filter(u => 
        u.api_key_id === apiKeyId && 
        new Date(u.timestamp) >= new Date(now.getTime() - 60 * 60 * 1000) // Last hour
      );

      const rateLimit = this.rateLimits.find(r => r.tier === this.getUserTier(apiKey.user_id));
      if (!rateLimit) {
        return { allowed: false, error: 'Rate limit configuration not found' };
      }

      // Check hourly limit
      if (userUsage.length >= rateLimit.requests_per_hour) {
        return { 
          allowed: false, 
          error: 'Hourly rate limit exceeded',
          limit: rateLimit.requests_per_hour,
          current: userUsage.length,
          reset_time: new Date(now.getTime() + 60 * 60 * 1000)
        };
      }

      // Check minute limit
      const lastMinuteUsage = userUsage.filter(u => 
        new Date(u.timestamp) >= new Date(now.getTime() - 60 * 1000)
      );

      if (lastMinuteUsage.length >= rateLimit.requests_per_minute) {
        return { 
          allowed: false, 
          error: 'Minute rate limit exceeded',
          limit: rateLimit.requests_per_minute,
          current: lastMinuteUsage.length,
          reset_time: new Date(now.getTime() + 60 * 1000)
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('APIAccessService: Error checking rate limit:', error);
      return { allowed: false, error: error.message };
    }
  }

  async recordAPIUsage(apiKeyId, endpoint, method, responseTime, statusCode) {
    try {
      const usage = {
        id: uniqueIdGenerator.generateId('usage'),
        api_key_id: apiKeyId,
        endpoint: endpoint,
        method: method,
        response_time_ms: responseTime,
        status_code: statusCode,
        timestamp: new Date().toISOString()
      };

      this.apiUsage.push(usage);

      // Update API key usage count
      const apiKey = this.apiKeys.find(k => k.id === apiKeyId);
      if (apiKey) {
        apiKey.usage_count += 1;
        apiKey.last_used = new Date().toISOString();
      }

      await this.saveData();
      return { success: true, usage };
    } catch (error) {
      console.error('APIAccessService: Error recording API usage:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // WEBHOOK MANAGEMENT
  // ========================================

  async createWebhook(userId, webhookData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const webhook = {
          id: uniqueIdGenerator.generateId('webhook'),
          user_id: userId,
          name: webhookData.name,
          url: webhookData.url,
          events: webhookData.events || [], // job_created, job_completed, payment_received, etc.
          secret: this.generateWebhookSecret(),
          status: 'active', // active, inactive, failed
          retry_count: 0,
          max_retries: webhookData.max_retries || 3,
          timeout_seconds: webhookData.timeout_seconds || 30,
          last_triggered: null,
          success_count: 0,
          failure_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.webhooks.push(webhook);
        await this.saveData();
        return { success: true, webhook };
      }
    } catch (error) {
      console.error('APIAccessService: Error creating webhook:', error);
      return { success: false, error: error.message };
    }
  }

  async triggerWebhook(webhookId, eventData) {
    try {
      const webhook = this.webhooks.find(w => w.id === webhookId);
      if (!webhook) {
        return { success: false, error: 'Webhook not found' };
      }

      if (webhook.status !== 'active') {
        return { success: false, error: 'Webhook is not active' };
      }

      // Simulate webhook delivery
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const success = Math.random() > 0.1; // 90% success rate for demo
        
        webhook.last_triggered = new Date().toISOString();
        
        if (success) {
          webhook.success_count += 1;
          webhook.retry_count = 0;
        } else {
          webhook.failure_count += 1;
          webhook.retry_count += 1;
          
          if (webhook.retry_count >= webhook.max_retries) {
            webhook.status = 'failed';
          }
        }
        
        webhook.updated_at = new Date().toISOString();
        await this.saveData();
        
        return { 
          success, 
          webhook,
          delivery_time: Math.floor(Math.random() * 500) + 100 // 100-600ms
        };
      }
    } catch (error) {
      console.error('APIAccessService: Error triggering webhook:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // INTEGRATION MANAGEMENT
  // ========================================

  async createIntegration(userId, integrationData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const integration = {
          id: uniqueIdGenerator.generateId('integration'),
          user_id: userId,
          name: integrationData.name,
          type: integrationData.type, // crm, accounting, scheduling, marketing
          provider: integrationData.provider, // salesforce, quickbooks, google_calendar, mailchimp
          configuration: integrationData.configuration || {},
          status: 'active', // active, inactive, error
          last_sync: null,
          sync_frequency: integrationData.sync_frequency || 'hourly', // real_time, hourly, daily
          error_count: 0,
          success_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.integrations.push(integration);
        await this.saveData();
        return { success: true, integration };
      }
    } catch (error) {
      console.error('APIAccessService: Error creating integration:', error);
      return { success: false, error: error.message };
    }
  }

  async syncIntegration(integrationId) {
    try {
      const integration = this.integrations.find(i => i.id === integrationId);
      if (!integration) {
        return { success: false, error: 'Integration not found' };
      }

      if (integration.status !== 'active') {
        return { success: false, error: 'Integration is not active' };
      }

      // Simulate integration sync
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const success = Math.random() > 0.05; // 95% success rate for demo
        
        integration.last_sync = new Date().toISOString();
        
        if (success) {
          integration.success_count += 1;
          integration.error_count = 0;
        } else {
          integration.error_count += 1;
          integration.status = 'error';
        }
        
        integration.updated_at = new Date().toISOString();
        await this.saveData();
        
        return { 
          success, 
          integration,
          records_synced: success ? Math.floor(Math.random() * 100) + 10 : 0
        };
      }
    } catch (error) {
      console.error('APIAccessService: Error syncing integration:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // API DOCUMENTATION
  // ========================================

  getAPIDocumentation() {
    return {
      base_url: MOCK_MODE ? 'https://api-mock.queueup.com/v1' : 'https://api.queueup.com/v1',
      authentication: {
        type: 'API Key',
        header: 'X-API-Key',
        description: 'Include your API key in the X-API-Key header'
      },
      rate_limits: {
        professional: {
          requests_per_minute: 100,
          requests_per_hour: 1000,
          requests_per_day: 10000
        },
        enterprise: {
          requests_per_minute: 500,
          requests_per_hour: 5000,
          requests_per_day: 50000
        }
      },
      endpoints: {
        jobs: {
          list: 'GET /jobs',
          create: 'POST /jobs',
          get: 'GET /jobs/{id}',
          update: 'PUT /jobs/{id}',
          delete: 'DELETE /jobs/{id}'
        },
        customers: {
          list: 'GET /customers',
          create: 'POST /customers',
          get: 'GET /customers/{id}',
          update: 'PUT /customers/{id}',
          delete: 'DELETE /customers/{id}'
        },
        analytics: {
          revenue: 'GET /analytics/revenue',
          performance: 'GET /analytics/performance',
          customers: 'GET /analytics/customers'
        },
        payments: {
          list: 'GET /payments',
          create: 'POST /payments',
          get: 'GET /payments/{id}'
        }
      },
      webhooks: {
        events: [
          'job.created',
          'job.updated',
          'job.completed',
          'payment.received',
          'customer.created',
          'customer.updated'
        ],
        payload_format: 'JSON',
        signature_verification: 'HMAC-SHA256'
      },
      examples: {
        create_job: {
          method: 'POST',
          url: '/jobs',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'your_api_key_here'
          },
          body: {
            title: 'Oil Change',
            description: 'Regular oil change service',
            customer_id: 'cust_123',
            estimated_duration: 60,
            price: 49.99
          }
        }
      }
    };
  }

  // ========================================
  // ANALYTICS AND REPORTING
  // ========================================

  getAPIUsageAnalytics(userId, timeframe = '30_days') {
    try {
      const now = new Date();
      const daysBack = timeframe === '7_days' ? 7 : timeframe === '30_days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      const userApiKeys = this.apiKeys.filter(k => k.user_id === userId);
      const userApiKeyIds = userApiKeys.map(k => k.id);
      
      const userUsage = this.apiUsage.filter(u => 
        userApiKeyIds.includes(u.api_key_id) && 
        new Date(u.timestamp) >= cutoffDate
      );

      const analytics = {
        total_requests: userUsage.length,
        successful_requests: userUsage.filter(u => u.status_code >= 200 && u.status_code < 300).length,
        failed_requests: userUsage.filter(u => u.status_code >= 400).length,
        success_rate: userUsage.length > 0 ? 
          (userUsage.filter(u => u.status_code >= 200 && u.status_code < 300).length / userUsage.length) * 100 : 0,
        average_response_time: userUsage.length > 0 ? 
          userUsage.reduce((sum, u) => sum + u.response_time_ms, 0) / userUsage.length : 0,
        requests_by_endpoint: this.groupUsageByEndpoint(userUsage),
        requests_by_method: this.groupUsageByMethod(userUsage),
        daily_usage: this.getDailyUsageBreakdown(userUsage),
        rate_limit_hits: this.getRateLimitHits(userUsage),
        top_api_keys: this.getTopAPIKeys(userApiKeys, userUsage)
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('APIAccessService: Error getting API usage analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  generateKeyValue() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'qk_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  generateKeySecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  generateWebhookSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'whsec_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  getUserTier(userId) {
    // This would typically check the user's subscription tier
    // For demo purposes, we'll return a mock tier
    return Math.random() > 0.5 ? 'professional' : 'enterprise';
  }

  groupUsageByEndpoint(usage) {
    const grouped = {};
    usage.forEach(u => {
      if (!grouped[u.endpoint]) {
        grouped[u.endpoint] = 0;
      }
      grouped[u.endpoint] += 1;
    });
    return grouped;
  }

  groupUsageByMethod(usage) {
    const grouped = {};
    usage.forEach(u => {
      if (!grouped[u.method]) {
        grouped[u.method] = 0;
      }
      grouped[u.method] += 1;
    });
    return grouped;
  }

  getDailyUsageBreakdown(usage) {
    const daily = {};
    usage.forEach(u => {
      const date = u.timestamp.substring(0, 10); // YYYY-MM-DD
      if (!daily[date]) {
        daily[date] = 0;
      }
      daily[date] += 1;
    });
    return daily;
  }

  getRateLimitHits(usage) {
    // This would typically track actual rate limit hits
    // For demo purposes, we'll simulate some hits
    return Math.floor(usage.length * 0.02); // 2% of requests hit rate limits
  }

  getTopAPIKeys(apiKeys, usage) {
    return apiKeys
      .map(key => ({
        id: key.id,
        name: key.key_name,
        usage_count: usage.filter(u => u.api_key_id === key.id).length,
        last_used: key.last_used
      }))
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 5);
  }

  getUserAPIKeys(userId) {
    return this.apiKeys.filter(k => k.user_id === userId);
  }

  getUserWebhooks(userId) {
    return this.webhooks.filter(w => w.user_id === userId);
  }

  getUserIntegrations(userId) {
    return this.integrations.filter(i => i.user_id === userId);
  }

  clearAllData() {
    this.apiKeys = [];
    this.apiUsage = [];
    this.webhooks = [];
    this.integrations = [];
    this.rateLimits = [];
    return this.saveData();
  }
}

// Export singleton instance
const apiAccessService = new APIAccessService();
export default apiAccessService;
