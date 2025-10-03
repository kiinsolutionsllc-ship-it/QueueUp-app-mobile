/**
 * Public Data Service
 * 
 * This service handles loading of public/configuration data that can be accessed
 * before user authentication. This includes:
 * - Subscription plans (for pricing display)
 * - Service types and categories
 * - App configuration
 * - Public business information
 */

import { safeSupabase, TABLES } from '../config/supabaseConfig';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  is_popular?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceType {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppConfig {
  id: string;
  key: string;
  value: any;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

class PublicDataService {
  private subscriptionPlans: SubscriptionPlan[] = [];
  private serviceTypes: ServiceType[] = [];
  private appConfig: Map<string, any> = new Map();
  private isInitialized = false;

  /**
   * Initialize the service and load public data
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('PublicDataService: Initializing...');
      await this.loadPublicData();
      this.isInitialized = true;
      console.log('PublicDataService: Initialized successfully');
    } catch (error) {
      console.error('PublicDataService: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load all public data that can be accessed without authentication
   */
  private async loadPublicData(): Promise<void> {
    try {
      if (!safeSupabase) {
        console.warn('PublicDataService: Supabase not configured, using default data');
        this.loadDefaultData();
        return;
      }

      // Load subscription plans (public pricing information)
      await this.loadSubscriptionPlans();
      
      // Load service types (public service categories)
      await this.loadServiceTypes();
      
      // Load public app configuration
      await this.loadAppConfig();

    } catch (error) {
      console.error('PublicDataService: Error loading public data:', error);
      // Fallback to default data
      this.loadDefaultData();
    }
  }

  /**
   * Load subscription plans (public pricing information)
   */
  private async loadSubscriptionPlans(): Promise<void> {
    try {
      const { data, error } = await safeSupabase
        .from(TABLES.SUBSCRIPTIONS)
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('PublicDataService: Error loading subscription plans:', error);
        this.subscriptionPlans = [];
      } else {
        this.subscriptionPlans = data || [];
        console.log(`PublicDataService: Loaded ${this.subscriptionPlans.length} subscription plans`);
      }
    } catch (error) {
      console.error('PublicDataService: Error loading subscription plans:', error);
      this.subscriptionPlans = [];
    }
  }

  /**
   * Load service types (public service categories)
   */
  private async loadServiceTypes(): Promise<void> {
    try {
      const { data, error } = await safeSupabase
        .from('service_types')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('PublicDataService: Error loading service types:', error);
        this.serviceTypes = [];
      } else {
        this.serviceTypes = data || [];
        console.log(`PublicDataService: Loaded ${this.serviceTypes.length} service types`);
      }
    } catch (error) {
      console.error('PublicDataService: Error loading service types:', error);
      this.serviceTypes = [];
    }
  }

  /**
   * Load public app configuration
   */
  private async loadAppConfig(): Promise<void> {
    try {
      const { data, error } = await safeSupabase
        .from('app_config')
        .select('*')
        .eq('is_public', true);

      if (error) {
        console.error('PublicDataService: Error loading app config:', error);
        this.appConfig = new Map();
      } else {
        this.appConfig = new Map();
        if (data) {
          data.forEach(config => {
            this.appConfig.set(config.key, config.value);
          });
        }
        console.log(`PublicDataService: Loaded ${this.appConfig.size} app config entries`);
      }
    } catch (error) {
      console.error('PublicDataService: Error loading app config:', error);
      this.appConfig = new Map();
    }
  }

  /**
   * Load default data when Supabase is not available
   */
  private loadDefaultData(): void {
    // Default subscription plans
    this.subscriptionPlans = [
      {
        id: 'free',
        name: 'Free',
        description: 'Basic features for getting started',
        price: 0,
        currency: 'USD',
        billing_cycle: 'monthly',
        features: ['Basic job posting', 'Limited messaging', 'Basic support'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'Advanced features for professionals',
        price: 29.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        features: ['Unlimited job posting', 'Priority support', 'Advanced analytics', 'Custom branding'],
        is_popular: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Full-featured solution for businesses',
        price: 99.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        features: ['Everything in Professional', 'API access', 'White-label options', 'Dedicated support'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Default service types
    this.serviceTypes = [
      {
        id: 'oil-change',
        name: 'Oil Change',
        category: 'Maintenance',
        description: 'Regular oil and filter change service',
        icon: '🛢️',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'brake-service',
        name: 'Brake Service',
        category: 'Safety',
        description: 'Brake inspection and repair service',
        icon: '🛑',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'tire-service',
        name: 'Tire Service',
        category: 'Maintenance',
        description: 'Tire rotation, balancing, and replacement',
        icon: '🛞',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'engine-diagnostic',
        name: 'Engine Diagnostic',
        category: 'Diagnostic',
        description: 'Engine diagnostic and troubleshooting',
        icon: '🔧',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Default app config
    this.appConfig = new Map([
      ['app_name', 'QueueUp'],
      ['app_version', '1.0.0'],
      ['support_email', 'support@queueup.com'],
      ['max_file_size', 10485760], // 10MB
      ['allowed_file_types', ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']]
    ]);

    console.log('PublicDataService: Loaded default data');
  }

  /**
   * Get all subscription plans
   */
  getSubscriptionPlans(): SubscriptionPlan[] {
    return [...this.subscriptionPlans];
  }

  /**
   * Get a specific subscription plan by ID
   */
  getSubscriptionPlan(planId: string): SubscriptionPlan | null {
    return this.subscriptionPlans.find(plan => plan.id === planId) || null;
  }

  /**
   * Get all service types
   */
  getServiceTypes(): ServiceType[] {
    return [...this.serviceTypes];
  }

  /**
   * Get service types by category
   */
  getServiceTypesByCategory(category: string): ServiceType[] {
    return this.serviceTypes.filter(service => service.category === category);
  }

  /**
   * Get a specific service type by ID
   */
  getServiceType(serviceId: string): ServiceType | null {
    return this.serviceTypes.find(service => service.id === serviceId) || null;
  }

  /**
   * Get app configuration value
   */
  getAppConfig(key: string): any {
    return this.appConfig.get(key);
  }

  /**
   * Get all app configuration
   */
  getAllAppConfig(): Map<string, any> {
    return new Map(this.appConfig);
  }

  /**
   * Refresh public data (useful for updates)
   */
  async refresh(): Promise<void> {
    console.log('PublicDataService: Refreshing public data...');
    await this.loadPublicData();
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      subscriptionPlans: this.subscriptionPlans.length,
      serviceTypes: this.serviceTypes.length,
      appConfig: this.appConfig.size
    };
  }
}

// Export singleton instance
export default new PublicDataService();
