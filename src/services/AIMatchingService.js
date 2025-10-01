import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import { MOCK_MODE } from '../config/payment';

/**
 * AI MATCHING SERVICE
 * 
 * Advanced job matching algorithm for Professional and Enterprise tiers
 * Features:
 * - Machine learning job recommendations
 * - Customer behavior analysis
 * - Skill-based matching
 * - Location optimization
 * - Performance tracking
 */

class AIMatchingService {
  constructor() {
    this.jobRecommendations = [];
    this.customerProfiles = [];
    this.mechanicProfiles = [];
    this.matchingHistory = [];
    this.initialized = false;
    
    // Storage keys
    this.RECOMMENDATIONS_KEY = 'ai_job_recommendations';
    this.CUSTOMER_PROFILES_KEY = 'ai_customer_profiles';
    this.MECHANIC_PROFILES_KEY = 'ai_mechanic_profiles';
    this.MATCHING_HISTORY_KEY = 'ai_matching_history';
    
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadData();
      this.initialized = true;
      console.log('AIMatchingService: Initialized successfully');
    } catch (error) {
      console.error('AIMatchingService: Error initializing:', error);
    }
  }

  async loadData() {
    try {
      const [recommendations, customerProfiles, mechanicProfiles, matchingHistory] = await Promise.all([
        AsyncStorage.getItem(this.RECOMMENDATIONS_KEY),
        AsyncStorage.getItem(this.CUSTOMER_PROFILES_KEY),
        AsyncStorage.getItem(this.MECHANIC_PROFILES_KEY),
        AsyncStorage.getItem(this.MATCHING_HISTORY_KEY)
      ]);

      this.jobRecommendations = recommendations ? JSON.parse(recommendations) : [];
      this.customerProfiles = customerProfiles ? JSON.parse(customerProfiles) : [];
      this.mechanicProfiles = mechanicProfiles ? JSON.parse(mechanicProfiles) : [];
      this.matchingHistory = matchingHistory ? JSON.parse(matchingHistory) : [];
    } catch (error) {
      console.error('AIMatchingService: Error loading data:', error);
    }
  }

  async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.RECOMMENDATIONS_KEY, JSON.stringify(this.jobRecommendations)),
        AsyncStorage.setItem(this.CUSTOMER_PROFILES_KEY, JSON.stringify(this.customerProfiles)),
        AsyncStorage.setItem(this.MECHANIC_PROFILES_KEY, JSON.stringify(this.mechanicProfiles)),
        AsyncStorage.setItem(this.MATCHING_HISTORY_KEY, JSON.stringify(this.matchingHistory))
      ]);
    } catch (error) {
      console.error('AIMatchingService: Error saving data:', error);
    }
  }

  // ========================================
  // CUSTOMER BEHAVIOR ANALYSIS
  // ========================================

  async analyzeCustomerBehavior(customerId) {
    try {
      // Simulate AI analysis of customer behavior
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const analysis = {
          id: uniqueIdGenerator.generateId('analysis'),
          customer_id: customerId,
          preferred_service_times: ['morning', 'afternoon'],
          average_job_value: 150.00,
          preferred_mechanics: ['certified', 'experienced'],
          location_preferences: ['within_10_miles'],
          communication_style: 'direct',
          payment_preferences: ['credit_card', 'digital_wallet'],
          satisfaction_trend: 'increasing',
          loyalty_score: 0.85,
          risk_of_churn: 0.15,
          recommended_upsells: ['preventive_maintenance', 'warranty_extensions'],
          created_at: new Date().toISOString()
        };

        // Update or create customer profile
        const existingProfile = this.customerProfiles.find(p => p.customer_id === customerId);
        if (existingProfile) {
          Object.assign(existingProfile, analysis);
          existingProfile.updated_at = new Date().toISOString();
        } else {
          this.customerProfiles.push(analysis);
        }

        await this.saveData();
        return { success: true, analysis };
      }
    } catch (error) {
      console.error('AIMatchingService: Error analyzing customer behavior:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // MECHANIC PROFILING
  // ========================================

  async buildMechanicProfile(mechanicId) {
    try {
      // Simulate AI profiling of mechanic capabilities
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const profile = {
          id: uniqueIdGenerator.generateId('profile'),
          mechanic_id: mechanicId,
          skill_areas: ['engine_repair', 'brake_system', 'electrical'],
          expertise_level: 'advanced',
          average_rating: 4.7,
          completion_rate: 0.95,
          response_time_minutes: 45,
          customer_satisfaction: 0.92,
          preferred_job_types: ['diagnostic', 'repair', 'maintenance'],
          availability_patterns: ['weekday_mornings', 'weekend_afternoons'],
          location_coverage: 15, // miles
          pricing_tier: 'competitive',
          reliability_score: 0.88,
          communication_style: 'professional',
          specializations: ['luxury_vehicles', 'hybrid_cars'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Update or create mechanic profile
        const existingProfile = this.mechanicProfiles.find(p => p.mechanic_id === mechanicId);
        if (existingProfile) {
          Object.assign(existingProfile, profile);
          existingProfile.updated_at = new Date().toISOString();
        } else {
          this.mechanicProfiles.push(profile);
        }

        await this.saveData();
        return { success: true, profile };
      }
    } catch (error) {
      console.error('AIMatchingService: Error building mechanic profile:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // INTELLIGENT JOB MATCHING
  // ========================================

  async generateJobRecommendations(jobId, customerId) {
    try {
      // Simulate AI-powered job matching
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const recommendations = {
          id: uniqueIdGenerator.generateId('recommendation'),
          job_id: jobId,
          customer_id: customerId,
          recommended_mechanics: [
            {
              mechanic_id: 'mech_001',
              match_score: 0.95,
              reasons: ['expertise_match', 'location_optimal', 'availability_good', 'rating_excellent'],
              estimated_completion_time: '2-3 hours',
              confidence_level: 'high'
            },
            {
              mechanic_id: 'mech_002',
              match_score: 0.87,
              reasons: ['skill_match', 'price_competitive', 'response_fast'],
              estimated_completion_time: '3-4 hours',
              confidence_level: 'medium'
            },
            {
              mechanic_id: 'mech_003',
              match_score: 0.82,
              reasons: ['specialization_match', 'customer_satisfaction_high'],
              estimated_completion_time: '2-3 hours',
              confidence_level: 'medium'
            }
          ],
          alternative_solutions: [
            {
              type: 'preventive_maintenance',
              description: 'Consider comprehensive brake inspection',
              value_proposition: 'Prevent future issues and extend brake life',
              estimated_cost: 89.99
            },
            {
              type: 'warranty_extension',
              description: 'Extended warranty for peace of mind',
              value_proposition: 'Cover unexpected repairs for 12 months',
              estimated_cost: 199.99
            }
          ],
          market_insights: {
            average_job_duration: '2.5 hours',
            typical_pricing_range: '$120-$180',
            demand_level: 'high',
            seasonal_factors: ['winter_preparation', 'holiday_travel']
          },
          created_at: new Date().toISOString()
        };

        this.jobRecommendations.push(recommendations);
        await this.saveData();
        return { success: true, recommendations };
      }
    } catch (error) {
      console.error('AIMatchingService: Error generating job recommendations:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // PERFORMANCE TRACKING
  // ========================================

  async trackMatchingPerformance(jobId, mechanicId, outcome) {
    try {
      const performance = {
        id: uniqueIdGenerator.generateId('performance'),
        job_id: jobId,
        mechanic_id: mechanicId,
        outcome: outcome, // 'successful', 'cancelled', 'rescheduled', 'disputed'
        customer_satisfaction: outcome === 'successful' ? 4.8 : 3.2,
        completion_time: outcome === 'successful' ? 2.5 : null,
        accuracy_score: outcome === 'successful' ? 0.92 : 0.65,
        created_at: new Date().toISOString()
      };

      this.matchingHistory.push(performance);
      await this.saveData();
      return { success: true, performance };
    } catch (error) {
      console.error('AIMatchingService: Error tracking matching performance:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // ANALYTICS AND INSIGHTS
  // ========================================

  getMatchingAnalytics(timeframe = '30_days') {
    try {
      const now = new Date();
      const daysBack = timeframe === '7_days' ? 7 : timeframe === '30_days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      const recentHistory = this.matchingHistory.filter(h => 
        new Date(h.created_at) >= cutoffDate
      );

      const analytics = {
        total_matches: recentHistory.length,
        successful_matches: recentHistory.filter(h => h.outcome === 'successful').length,
        success_rate: recentHistory.length > 0 ? 
          (recentHistory.filter(h => h.outcome === 'successful').length / recentHistory.length) * 100 : 0,
        average_satisfaction: recentHistory.length > 0 ?
          recentHistory.reduce((sum, h) => sum + h.customer_satisfaction, 0) / recentHistory.length : 0,
        average_completion_time: recentHistory.filter(h => h.completion_time).length > 0 ?
          recentHistory.filter(h => h.completion_time)
            .reduce((sum, h) => sum + h.completion_time, 0) / 
          recentHistory.filter(h => h.completion_time).length : 0,
        accuracy_trend: recentHistory.length > 0 ?
          recentHistory.reduce((sum, h) => sum + h.accuracy_score, 0) / recentHistory.length : 0,
        top_performing_mechanics: this.getTopPerformingMechanics(recentHistory),
        improvement_suggestions: this.generateImprovementSuggestions(recentHistory)
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('AIMatchingService: Error getting matching analytics:', error);
      return { success: false, error: error.message };
    }
  }

  getTopPerformingMechanics(history) {
    const mechanicPerformance = {};
    
    history.forEach(h => {
      if (!mechanicPerformance[h.mechanic_id]) {
        mechanicPerformance[h.mechanic_id] = {
          mechanic_id: h.mechanic_id,
          total_jobs: 0,
          successful_jobs: 0,
          total_satisfaction: 0,
          total_accuracy: 0
        };
      }
      
      mechanicPerformance[h.mechanic_id].total_jobs++;
      if (h.outcome === 'successful') {
        mechanicPerformance[h.mechanic_id].successful_jobs++;
      }
      mechanicPerformance[h.mechanic_id].total_satisfaction += h.customer_satisfaction;
      mechanicPerformance[h.mechanic_id].total_accuracy += h.accuracy_score;
    });

    return Object.values(mechanicPerformance)
      .map(m => ({
        ...m,
        success_rate: (m.successful_jobs / m.total_jobs) * 100,
        average_satisfaction: m.total_satisfaction / m.total_jobs,
        average_accuracy: m.total_accuracy / m.total_jobs
      }))
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, 5);
  }

  generateImprovementSuggestions(history) {
    const suggestions = [];
    
    if (history.length === 0) {
      suggestions.push('Start tracking job outcomes to improve matching accuracy');
      return suggestions;
    }

    const successRate = (history.filter(h => h.outcome === 'successful').length / history.length) * 100;
    
    if (successRate < 80) {
      suggestions.push('Consider improving mechanic vetting process');
    }
    
    const avgSatisfaction = history.reduce((sum, h) => sum + h.customer_satisfaction, 0) / history.length;
    if (avgSatisfaction < 4.0) {
      suggestions.push('Focus on customer communication and service quality');
    }
    
    const avgAccuracy = history.reduce((sum, h) => sum + h.accuracy_score, 0) / history.length;
    if (avgAccuracy < 0.8) {
      suggestions.push('Enhance job description matching algorithms');
    }

    return suggestions;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  getCustomerProfile(customerId) {
    return this.customerProfiles.find(p => p.customer_id === customerId);
  }

  getMechanicProfile(mechanicId) {
    return this.mechanicProfiles.find(p => p.mechanic_id === mechanicId);
  }

  getJobRecommendations(jobId) {
    return this.jobRecommendations.find(r => r.job_id === jobId);
  }

  clearAllData() {
    this.jobRecommendations = [];
    this.customerProfiles = [];
    this.mechanicProfiles = [];
    this.matchingHistory = [];
    return this.saveData();
  }
}

// Export singleton instance
const aiMatchingService = new AIMatchingService();
export default aiMatchingService;
