/* eslint-disable no-undef */
import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import { MOCK_MODE } from '../config/payment';

/**
 * WHITE-LABEL SERVICE
 * 
 * White-label customization and branding for Enterprise tier
 * Features:
 * - Custom branding and theming
 * - Logo and color customization
 * - Domain mapping
 * - Branded mobile app
 * - Custom email templates
 * - Branded documentation
 */

class WhiteLabelService {
  constructor() {
    this.brandingConfigs = [];
    this.customDomains = [];
    this.emailTemplates = [];
    this.brandedAssets = [];
    this.initialized = false;
    
    // Storage keys
    this.BRANDING_KEY = 'white_label_branding';
    this.DOMAINS_KEY = 'white_label_domains';
    this.EMAIL_TEMPLATES_KEY = 'white_label_email_templates';
    this.ASSETS_KEY = 'white_label_assets';
    
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadData();
      await this.initializeDefaultTemplates();
      this.initialized = true;
      console.log('WhiteLabelService: Initialized successfully');
    } catch (error) {
      console.error('WhiteLabelService: Error initializing:', error);
    }
  }

  async loadData() {
    try {
      const [branding, domains, templates, assets] = await Promise.all([
        AsyncStorage.getItem(this.BRANDING_KEY),
        AsyncStorage.getItem(this.DOMAINS_KEY),
        AsyncStorage.getItem(this.EMAIL_TEMPLATES_KEY),
        AsyncStorage.getItem(this.ASSETS_KEY)
      ]);

      this.brandingConfigs = branding ? JSON.parse(branding) : [];
      this.customDomains = domains ? JSON.parse(domains) : [];
      this.emailTemplates = templates ? JSON.parse(templates) : [];
      this.brandedAssets = assets ? JSON.parse(assets) : [];
    } catch (error) {
      console.error('WhiteLabelService: Error loading data:', error);
    }
  }

  async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.BRANDING_KEY, JSON.stringify(this.brandingConfigs)),
        AsyncStorage.setItem(this.DOMAINS_KEY, JSON.stringify(this.customDomains)),
        AsyncStorage.setItem(this.EMAIL_TEMPLATES_KEY, JSON.stringify(this.emailTemplates)),
        AsyncStorage.setItem(this.ASSETS_KEY, JSON.stringify(this.brandedAssets))
      ]);
    } catch (error) {
      console.error('WhiteLabelService: Error saving data:', error);
    }
  }

  async initializeDefaultTemplates() {
    if (this.emailTemplates.length > 0) return;

    const defaultTemplates = [
      {
        id: 'welcome_email',
        name: 'Welcome Email',
        subject: 'Welcome to {{business_name}}!',
        html_content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: {{primary_color}}; padding: 20px; text-align: center;">
              <img src="{{logo_url}}" alt="{{business_name}}" style="max-height: 60px;">
            </div>
            <div style="padding: 30px;">
              <h1 style="color: {{primary_color}};">Welcome to {{business_name}}!</h1>
              <p>Thank you for choosing {{business_name}} for your automotive service needs.</p>
              <p>We're committed to providing you with exceptional service and support.</p>
              <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3>What's Next?</h3>
                <ul>
                  <li>Download our mobile app</li>
                  <li>Schedule your first service</li>
                  <li>Explore our service offerings</li>
                </ul>
              </div>
              <p>If you have any questions, please don't hesitate to contact us.</p>
              <p>Best regards,<br>The {{business_name}} Team</p>
            </div>
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <p>{{business_name}} | {{business_address}} | {{business_phone}}</p>
            </div>
          </div>
        `,
        text_content: `
          Welcome to {{business_name}}!
          
          Thank you for choosing {{business_name}} for your automotive service needs.
          We're committed to providing you with exceptional service and support.
          
          What's Next?
          - Download our mobile app
          - Schedule your first service
          - Explore our service offerings
          
          If you have any questions, please don't hesitate to contact us.
          
          Best regards,
          The {{business_name}} Team
          
          {{business_name}} | {{business_address}} | {{business_phone}}
        `,
        variables: ['business_name', 'primary_color', 'logo_url', 'business_address', 'business_phone'],
        created_at: new Date().toISOString()
      },
      {
        id: 'service_reminder',
        name: 'Service Reminder',
        subject: 'Service Reminder from {{business_name}}',
        html_content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: {{primary_color}}; padding: 20px; text-align: center;">
              <img src="{{logo_url}}" alt="{{business_name}}" style="max-height: 60px;">
            </div>
            <div style="padding: 30px;">
              <h1 style="color: {{primary_color}};">Service Reminder</h1>
              <p>Hello {{customer_name}},</p>
              <p>It's time for your {{service_type}} service for your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}.</p>
              <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3>Service Details:</h3>
                <p><strong>Service Type:</strong> {{service_type}}</p>
                <p><strong>Vehicle:</strong> {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}</p>
                <p><strong>Recommended Date:</strong> {{recommended_date}}</p>
                <p><strong>Estimated Duration:</strong> {{estimated_duration}}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{booking_url}}" style="background-color: {{primary_color}}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Schedule Service</a>
              </div>
              <p>If you have any questions, please contact us at {{business_phone}}.</p>
              <p>Best regards,<br>The {{business_name}} Team</p>
            </div>
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <p>{{business_name}} | {{business_address}} | {{business_phone}}</p>
            </div>
          </div>
        `,
        text_content: `
          Service Reminder from {{business_name}}
          
          Hello {{customer_name}},
          
          It's time for your {{service_type}} service for your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}.
          
          Service Details:
          - Service Type: {{service_type}}
          - Vehicle: {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}
          - Recommended Date: {{recommended_date}}
          - Estimated Duration: {{estimated_duration}}
          
          Schedule your service: {{booking_url}}
          
          If you have any questions, please contact us at {{business_phone}}.
          
          Best regards,
          The {{business_name}} Team
          
          {{business_name}} | {{business_address}} | {{business_phone}}
        `,
        variables: ['business_name', 'customer_name', 'service_type', 'vehicle_year', 'vehicle_make', 'vehicle_model', 'recommended_date', 'estimated_duration', 'booking_url', 'primary_color', 'logo_url', 'business_address', 'business_phone'],
        created_at: new Date().toISOString()
      },
      {
        id: 'invoice_notification',
        name: 'Invoice Notification',
        subject: 'Invoice #{{invoice_number}} from {{business_name}}',
        html_content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: {{primary_color}}; padding: 20px; text-align: center;">
              <img src="{{logo_url}}" alt="{{business_name}}" style="max-height: 60px;">
            </div>
            <div style="padding: 30px;">
              <h1 style="color: {{primary_color}};">Invoice #{{invoice_number}}</h1>
              <p>Hello {{customer_name}},</p>
              <p>Thank you for your business! Please find your invoice details below.</p>
              <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3>Invoice Details:</h3>
                <p><strong>Invoice Number:</strong> {{invoice_number}}</p>
                <p><strong>Date:</strong> {{invoice_date}}</p>
                <p><strong>Due Date:</strong> {{due_date}}</p>
                <p><strong>Amount:</strong> ${{total_amount}}</p> {/* eslint-disable-line no-undef */}
                <p><strong>Services:</strong> {{service_description}}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{payment_url}}" style="background-color: {{primary_color}}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Pay Now</a>
              </div>
              <p>If you have any questions about this invoice, please contact us at {{business_phone}}.</p>
              <p>Best regards,<br>The {{business_name}} Team</p>
            </div>
            <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
              <p>{{business_name}} | {{business_address}} | {{business_phone}}</p>
            </div>
          </div>
        `,
        text_content: `
          Invoice #{{invoice_number}} from {{business_name}}
          
          Hello {{customer_name}},
          
          Thank you for your business! Please find your invoice details below.
          
          Invoice Details:
          - Invoice Number: {{invoice_number}}
          - Date: {{invoice_date}}
          - Due Date: {{due_date}}
          - Amount: ${{total_amount}} {/* eslint-disable-line no-undef */}
          - Services: {{service_description}}
          
          Pay now: {{payment_url}}
          
          If you have any questions about this invoice, please contact us at {{business_phone}}.
          
          Best regards,
          The {{business_name}} Team
          
          {{business_name}} | {{business_address}} | {{business_phone}}
        `,
        variables: ['business_name', 'customer_name', 'invoice_number', 'invoice_date', 'due_date', 'total_amount', 'service_description', 'payment_url', 'primary_color', 'logo_url', 'business_address', 'business_phone'],
        created_at: new Date().toISOString()
      }
    ];

    this.emailTemplates = defaultTemplates;
    await this.saveData();
  }

  // ========================================
  // BRANDING CONFIGURATION
  // ========================================

  async createBrandingConfig(userId, brandingData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const branding = {
          id: uniqueIdGenerator.generateId('branding'),
          user_id: userId,
          business_name: brandingData.business_name,
          business_tagline: brandingData.business_tagline || '',
          colors: {
            primary: brandingData.primary_color || '#2196F3',
            secondary: brandingData.secondary_color || '#FFC107',
            accent: brandingData.accent_color || '#4CAF50',
            background: brandingData.background_color || '#FFFFFF',
            text: brandingData.text_color || '#333333',
            text_secondary: brandingData.text_secondary_color || '#666666'
          },
          logo: {
            url: brandingData.logo_url || null,
            alt_text: brandingData.logo_alt_text || brandingData.business_name,
            width: brandingData.logo_width || 200,
            height: brandingData.logo_height || 60
          },
          typography: {
            primary_font: brandingData.primary_font || 'Arial, sans-serif',
            secondary_font: brandingData.secondary_font || 'Georgia, serif',
            heading_font: brandingData.heading_font || 'Arial, sans-serif'
          },
          contact_info: {
            address: brandingData.business_address || '',
            phone: brandingData.business_phone || '',
            email: brandingData.business_email || '',
            website: brandingData.business_website || ''
          },
          social_media: {
            facebook: brandingData.facebook_url || '',
            twitter: brandingData.twitter_url || '',
            instagram: brandingData.instagram_url || '',
            linkedin: brandingData.linkedin_url || ''
          },
          status: 'active', // active, inactive, pending_approval
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.brandingConfigs.push(branding);
        await this.saveData();
        return { success: true, branding };
      }
    } catch (error) {
      console.error('WhiteLabelService: Error creating branding config:', error);
      return { success: false, error: error.message };
    }
  }

  async updateBrandingConfig(brandingId, updateData) {
    try {
      const branding = this.brandingConfigs.find(b => b.id === brandingId);
      if (!branding) {
        return { success: false, error: 'Branding configuration not found' };
      }

      // Update branding data
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          if (typeof updateData[key] === 'object' && !Array.isArray(updateData[key])) {
            branding[key] = { ...branding[key], ...updateData[key] };
          } else {
            branding[key] = updateData[key];
          }
        }
      });

      branding.updated_at = new Date().toISOString();
      await this.saveData();
      return { success: true, branding };
    } catch (error) {
      console.error('WhiteLabelService: Error updating branding config:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // CUSTOM DOMAIN MANAGEMENT
  // ========================================

  async addCustomDomain(userId, domainData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const domain = {
          id: uniqueIdGenerator.generateId('domain'),
          user_id: userId,
          domain_name: domainData.domain_name,
          subdomain: domainData.subdomain || 'app',
          ssl_enabled: domainData.ssl_enabled || true,
          status: 'pending', // pending, active, failed, suspended
          verification_token: this.generateVerificationToken(),
          dns_records: this.generateDNSRecords(domainData.domain_name, domainData.subdomain),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.customDomains.push(domain);
        await this.saveData();
        return { success: true, domain };
      }
    } catch (error) {
      console.error('WhiteLabelService: Error adding custom domain:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyDomain(domainId) {
    try {
      const domain = this.customDomains.find(d => d.id === domainId);
      if (!domain) {
        return { success: false, error: 'Domain not found' };
      }

      // Simulate domain verification
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const verified = Math.random() > 0.1; // 90% success rate for demo
        
        domain.status = verified ? 'active' : 'failed';
        domain.verified_at = verified ? new Date().toISOString() : null;
        domain.updated_at = new Date().toISOString();
        
        await this.saveData();
        return { 
          success: verified, 
          domain,
          message: verified ? 'Domain verified successfully' : 'Domain verification failed'
        };
      }
    } catch (error) {
      console.error('WhiteLabelService: Error verifying domain:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // EMAIL TEMPLATE MANAGEMENT
  // ========================================

  async createEmailTemplate(userId, templateData) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const template = {
          id: uniqueIdGenerator.generateId('template'),
          user_id: userId,
          name: templateData.name,
          subject: templateData.subject,
          html_content: templateData.html_content,
          text_content: templateData.text_content,
          variables: templateData.variables || [],
          category: templateData.category || 'general', // general, marketing, transactional, notification
          status: 'active', // active, inactive, draft
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.emailTemplates.push(template);
        await this.saveData();
        return { success: true, template };
      }
    } catch (error) {
      console.error('WhiteLabelService: Error creating email template:', error);
      return { success: false, error: error.message };
    }
  }

  async renderEmailTemplate(templateId, variables) {
    try {
      const template = this.emailTemplates.find(t => t.id === templateId);
      if (!template) {
        return { success: false, error: 'Email template not found' };
      }

      let renderedSubject = template.subject;
      let renderedHtml = template.html_content;
      let renderedText = template.text_content;

      // Replace variables in template
      Object.keys(variables).forEach(key => {
        const placeholder = `{{${key}}}`;
        renderedSubject = renderedSubject.replace(new RegExp(placeholder, 'g'), variables[key] || '');
        renderedHtml = renderedHtml.replace(new RegExp(placeholder, 'g'), variables[key] || '');
        renderedText = renderedText.replace(new RegExp(placeholder, 'g'), variables[key] || '');
      });

      return {
        success: true,
        rendered: {
          subject: renderedSubject,
          html_content: renderedHtml,
          text_content: renderedText
        }
      };
    } catch (error) {
      console.error('WhiteLabelService: Error rendering email template:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // BRANDED ASSET GENERATION
  // ========================================

  async generateBrandedAssets(userId, assetTypes) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const branding = this.brandingConfigs.find(b => b.user_id === userId);
        if (!branding) {
          return { success: false, error: 'Branding configuration not found' };
        }

        const assets = [];
        
        if (assetTypes.includes('mobile_app_icons')) {
          assets.push({
            type: 'mobile_app_icons',
            files: [
              { name: 'icon-1024.png', url: `https://assets.queueup.com/icons/${userId}/icon-1024.png` },
              { name: 'icon-512.png', url: `https://assets.queueup.com/icons/${userId}/icon-512.png` },
              { name: 'icon-256.png', url: `https://assets.queueup.com/icons/${userId}/icon-256.png` },
              { name: 'icon-128.png', url: `https://assets.queueup.com/icons/${userId}/icon-128.png` }
            ]
          });
        }

        if (assetTypes.includes('splash_screens')) {
          assets.push({
            type: 'splash_screens',
            files: [
              { name: 'splash-ios.png', url: `https://assets.queueup.com/splash/${userId}/splash-ios.png` },
              { name: 'splash-android.png', url: `https://assets.queueup.com/splash/${userId}/splash-android.png` }
            ]
          });
        }

        if (assetTypes.includes('business_cards')) {
          assets.push({
            type: 'business_cards',
            files: [
              { name: 'business-card-front.pdf', url: `https://assets.queueup.com/cards/${userId}/front.pdf` },
              { name: 'business-card-back.pdf', url: `https://assets.queueup.com/cards/${userId}/back.pdf` }
            ]
          });
        }

        if (assetTypes.includes('social_media_graphics')) {
          assets.push({
            type: 'social_media_graphics',
            files: [
              { name: 'facebook-cover.png', url: `https://assets.queueup.com/social/${userId}/facebook-cover.png` },
              { name: 'twitter-header.png', url: `https://assets.queueup.com/social/${userId}/twitter-header.png` },
              { name: 'instagram-story.png', url: `https://assets.queueup.com/social/${userId}/instagram-story.png` }
            ]
          });
        }

        const brandedAsset = {
          id: uniqueIdGenerator.generateId('asset'),
          user_id: userId,
          branding_id: branding.id,
          asset_types: assetTypes,
          assets: assets,
          status: 'generated', // generating, generated, failed
          generated_at: new Date().toISOString(),
          download_url: `https://assets.queueup.com/download/${userId}/branded-assets.zip`
        };

        this.brandedAssets.push(brandedAsset);
        await this.saveData();
        return { success: true, brandedAsset };
      }
    } catch (error) {
      console.error('WhiteLabelService: Error generating branded assets:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // BRANDED MOBILE APP CONFIGURATION
  // ========================================

  async generateMobileAppConfig(userId) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const branding = this.brandingConfigs.find(b => b.user_id === userId);
        if (!branding) {
          return { success: false, error: 'Branding configuration not found' };
        }

        const appConfig = {
          id: uniqueIdGenerator.generateId('appconfig'),
          user_id: userId,
          app_name: branding.business_name,
          package_name: `com.${branding.business_name.toLowerCase().replace(/\s+/g, '')}.queueup`,
          bundle_id: `com.${branding.business_name.toLowerCase().replace(/\s+/g, '')}.queueup`,
          version: '1.0.0',
          colors: branding.colors,
          logo: branding.logo,
          typography: branding.typography,
          contact_info: branding.contact_info,
          social_media: branding.social_media,
          features: {
            customer_portal: true,
            service_scheduling: true,
            payment_processing: true,
            notifications: true,
            analytics: true
          },
          app_store_listing: {
            title: branding.business_name,
            subtitle: branding.business_tagline,
            description: `Official mobile app for ${branding.business_name}. Schedule services, track appointments, and manage your automotive needs.`,
            keywords: ['automotive', 'service', 'repair', 'maintenance', branding.business_name.toLowerCase()],
            category: 'Business',
            age_rating: '4+'
          },
          status: 'ready_for_build', // ready_for_build, building, built, published
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await this.saveData();
        return { success: true, appConfig };
      }
    } catch (error) {
      console.error('WhiteLabelService: Error generating mobile app config:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // ANALYTICS AND REPORTING
  // ========================================

  getWhiteLabelAnalytics(userId) {
    try {
      const userBranding = this.brandingConfigs.filter(b => b.user_id === userId);
      const userDomains = this.customDomains.filter(d => d.user_id === userId);
      const userTemplates = this.emailTemplates.filter(t => t.user_id === userId);
      const userAssets = this.brandedAssets.filter(a => a.user_id === userId);

      const analytics = {
        branding_configs: userBranding.length,
        active_domains: userDomains.filter(d => d.status === 'active').length,
        email_templates: userTemplates.length,
        generated_assets: userAssets.length,
        asset_types_used: this.getAssetTypesUsed(userAssets),
        domain_status_breakdown: this.getDomainStatusBreakdown(userDomains),
        template_categories: this.getTemplateCategories(userTemplates),
        branding_usage: this.getBrandingUsage(userBranding)
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('WhiteLabelService: Error getting white-label analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  generateVerificationToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  generateDNSRecords(domainName, subdomain) {
    return [
      {
        type: 'CNAME',
        name: subdomain,
        value: 'app.queueup.com',
        ttl: 3600
      },
      {
        type: 'TXT',
        name: `_verification.${subdomain}`,
        value: this.generateVerificationToken(),
        ttl: 3600
      }
    ];
  }

  getAssetTypesUsed(assets) {
    const types = {};
    assets.forEach(asset => {
      asset.asset_types.forEach(type => {
        types[type] = (types[type] || 0) + 1;
      });
    });
    return types;
  }

  getDomainStatusBreakdown(domains) {
    const breakdown = {};
    domains.forEach(domain => {
      breakdown[domain.status] = (breakdown[domain.status] || 0) + 1;
    });
    return breakdown;
  }

  getTemplateCategories(templates) {
    const categories = {};
    templates.forEach(template => {
      categories[template.category] = (categories[template.category] || 0) + 1;
    });
    return categories;
  }

  getBrandingUsage(brandingConfigs) {
    return {
      total_configs: brandingConfigs.length,
      active_configs: brandingConfigs.filter(b => b.status === 'active').length,
      pending_configs: brandingConfigs.filter(b => b.status === 'pending_approval').length
    };
  }

  getUserBranding(userId) {
    return this.brandingConfigs.find(b => b.user_id === userId);
  }

  getUserDomains(userId) {
    return this.customDomains.filter(d => d.user_id === userId);
  }

  getUserEmailTemplates(userId) {
    return this.emailTemplates.filter(t => t.user_id === userId);
  }

  getUserBrandedAssets(userId) {
    return this.brandedAssets.filter(a => a.user_id === userId);
  }

  getDefaultEmailTemplates() {
    return this.emailTemplates.filter(t => !t.user_id);
  }

  clearAllData() {
    this.brandingConfigs = [];
    this.customDomains = [];
    this.emailTemplates = [];
    this.brandedAssets = [];
    return this.saveData();
  }
}

// Export singleton instance
const whiteLabelService = new WhiteLabelService();
export default whiteLabelService;
