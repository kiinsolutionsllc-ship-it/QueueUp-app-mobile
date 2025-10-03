import AsyncStorage from '@react-native-async-storage/async-storage';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import { MOCK_MODE } from '../config/payment';

/**
 * ADVANCED ANALYTICS SERVICE
 * 
 * Comprehensive analytics and reporting for Professional and Enterprise tiers
 * Features:
 * - Revenue tracking and forecasting
 * - Performance benchmarks
 * - Customer satisfaction metrics
 * - Business intelligence dashboards
 * - Predictive analytics
 */

class AdvancedAnalyticsService {
  constructor() {
    this.analyticsData = [];
    this.revenueMetrics = [];
    this.performanceMetrics = [];
    this.customerMetrics = [];
    this.businessIntelligence = [];
    this.initialized = false;
    
    // Storage keys
    this.ANALYTICS_KEY = 'advanced_analytics_data';
    this.REVENUE_KEY = 'revenue_metrics';
    this.PERFORMANCE_KEY = 'performance_metrics';
    this.CUSTOMER_KEY = 'customer_metrics';
    this.BI_KEY = 'business_intelligence';
    
    this.initialize();
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadData();
      this.initialized = true;
      console.log('AdvancedAnalyticsService: Initialized successfully');
    } catch (error) {
      console.error('AdvancedAnalyticsService: Error initializing:', error);
    }
  }

  async loadData() {
    try {
      const [analytics, revenue, performance, customer, bi] = await Promise.all([
        AsyncStorage.getItem(this.ANALYTICS_KEY),
        AsyncStorage.getItem(this.REVENUE_KEY),
        AsyncStorage.getItem(this.PERFORMANCE_KEY),
        AsyncStorage.getItem(this.CUSTOMER_KEY),
        AsyncStorage.getItem(this.BI_KEY)
      ]);

      this.analyticsData = analytics ? JSON.parse(analytics) : [];
      this.revenueMetrics = revenue ? JSON.parse(revenue) : [];
      this.performanceMetrics = performance ? JSON.parse(performance) : [];
      this.customerMetrics = customer ? JSON.parse(customer) : [];
      this.businessIntelligence = bi ? JSON.parse(bi) : [];
    } catch (error) {
      console.error('AdvancedAnalyticsService: Error loading data:', error);
    }
  }

  async saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(this.analyticsData)),
        AsyncStorage.setItem(this.REVENUE_KEY, JSON.stringify(this.revenueMetrics)),
        AsyncStorage.setItem(this.PERFORMANCE_KEY, JSON.stringify(this.performanceMetrics)),
        AsyncStorage.setItem(this.CUSTOMER_KEY, JSON.stringify(this.customerMetrics)),
        AsyncStorage.setItem(this.BI_KEY, JSON.stringify(this.businessIntelligence))
      ]);
    } catch (error) {
      console.error('AdvancedAnalyticsService: Error saving data:', error);
    }
  }

  // ========================================
  // REVENUE TRACKING AND FORECASTING
  // ========================================

  async trackRevenue(userId, amount, jobId, category = 'job_completion') {
    try {
      if (MOCK_MODE) {
        const revenueEntry = {
          id: uniqueIdGenerator.generateId('revenue'),
          user_id: userId,
          job_id: jobId,
          amount: amount,
          category: category,
          date: new Date().toISOString(),
          month: new Date().toISOString().substring(0, 7), // YYYY-MM
          year: new Date().getFullYear(),
          created_at: new Date().toISOString()
        };

        this.revenueMetrics.push(revenueEntry);
        await this.saveData();
        return { success: true, revenueEntry };
      }
    } catch (error) {
      console.error('AdvancedAnalyticsService: Error tracking revenue:', error);
      return { success: false, error: error.message };
    }
  }

  getRevenueAnalytics(userId, timeframe = '30_days') {
    try {
      const now = new Date();
      const daysBack = timeframe === '7_days' ? 7 : timeframe === '30_days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      const userRevenue = this.revenueMetrics.filter(r => 
        r.user_id === userId && new Date(r.date) >= cutoffDate
      );

      const analytics = {
        total_revenue: userRevenue.reduce((sum, r) => sum + r.amount, 0),
        average_job_value: userRevenue.length > 0 ? 
          userRevenue.reduce((sum, r) => sum + r.amount, 0) / userRevenue.length : 0,
        jobs_completed: userRevenue.length,
        revenue_by_category: this.groupRevenueByCategory(userRevenue),
        revenue_trend: this.calculateRevenueTrend(userRevenue),
        monthly_breakdown: this.getMonthlyBreakdown(userRevenue),
        forecast: this.generateRevenueForecast(userRevenue),
        top_performing_days: this.getTopPerformingDays(userRevenue),
        growth_rate: this.calculateGrowthRate(userRevenue)
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('AdvancedAnalyticsService: Error getting revenue analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // PERFORMANCE BENCHMARKS
  // ========================================

  async trackPerformance(userId, jobId, metrics) {
    try {
      if (MOCK_MODE) {
        // Validate that userId follows the new type-specific format
        if (!userId.startsWith('CUSTOMER-') && !userId.startsWith('MECHANIC-') && 
            !userId.startsWith('customer_') && !userId.startsWith('mechanic_')) {
          console.warn('AdvancedAnalyticsService: User ID does not follow expected format:', userId);
        }

        const performanceEntry = {
          id: uniqueIdGenerator.generateId('performance'),
          user_id: userId, // Should be CUSTOMER- or MECHANIC- prefixed ID
          job_id: jobId,
          completion_time_hours: metrics.completion_time_hours,
          customer_rating: metrics.customer_rating,
          first_time_fix_rate: metrics.first_time_fix_rate,
          customer_satisfaction: metrics.customer_satisfaction,
          repeat_customer: metrics.repeat_customer,
          date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };

        this.performanceMetrics.push(performanceEntry);
        await this.saveData();
        return { success: true, performanceEntry };
      }
    } catch (error) {
      console.error('AdvancedAnalyticsService: Error tracking performance:', error);
      return { success: false, error: error.message };
    }
  }

  getPerformanceBenchmarks(userId, timeframe = '30_days') {
    try {
      const now = new Date();
      const daysBack = timeframe === '7_days' ? 7 : timeframe === '30_days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      const userPerformance = this.performanceMetrics.filter(p => 
        p.user_id === userId && new Date(p.date) >= cutoffDate
      );

      const benchmarks = {
        average_completion_time: userPerformance.length > 0 ?
          userPerformance.reduce((sum, p) => sum + p.completion_time_hours, 0) / userPerformance.length : 0,
        average_customer_rating: userPerformance.length > 0 ?
          userPerformance.reduce((sum, p) => sum + p.customer_rating, 0) / userPerformance.length : 0,
        first_time_fix_rate: userPerformance.length > 0 ?
          (userPerformance.filter(p => p.first_time_fix_rate).length / userPerformance.length) * 100 : 0,
        customer_satisfaction_score: userPerformance.length > 0 ?
          userPerformance.reduce((sum, p) => sum + p.customer_satisfaction, 0) / userPerformance.length : 0,
        repeat_customer_rate: userPerformance.length > 0 ?
          (userPerformance.filter(p => p.repeat_customer).length / userPerformance.length) * 100 : 0,
        performance_trend: this.calculatePerformanceTrend(userPerformance),
        industry_comparison: this.getIndustryComparison(userPerformance),
        improvement_areas: this.identifyImprovementAreas(userPerformance),
        strengths: this.identifyStrengths(userPerformance)
      };

      return { success: true, benchmarks };
    } catch (error) {
      console.error('AdvancedAnalyticsService: Error getting performance benchmarks:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // CUSTOMER SATISFACTION METRICS
  // ========================================

  async trackCustomerSatisfaction(userId, customerId, jobId, satisfactionData) {
    try {
      if (MOCK_MODE) {
        const satisfactionEntry = {
          id: uniqueIdGenerator.generateId('satisfaction'),
          user_id: userId,
          customer_id: customerId,
          job_id: jobId,
          overall_rating: satisfactionData.overall_rating,
          communication_rating: satisfactionData.communication_rating,
          quality_rating: satisfactionData.quality_rating,
          timeliness_rating: satisfactionData.timeliness_rating,
          value_rating: satisfactionData.value_rating,
          would_recommend: satisfactionData.would_recommend,
          feedback_text: satisfactionData.feedback_text,
          date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };

        this.customerMetrics.push(satisfactionEntry);
        await this.saveData();
        return { success: true, satisfactionEntry };
      }
    } catch (error) {
      console.error('AdvancedAnalyticsService: Error tracking customer satisfaction:', error);
      return { success: false, error: error.message };
    }
  }

  getCustomerSatisfactionMetrics(userId, timeframe = '30_days') {
    try {
      const now = new Date();
      const daysBack = timeframe === '7_days' ? 7 : timeframe === '30_days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      const userSatisfaction = this.customerMetrics.filter(s => 
        s.user_id === userId && new Date(s.date) >= cutoffDate
      );

      const metrics = {
        overall_satisfaction: userSatisfaction.length > 0 ?
          userSatisfaction.reduce((sum, s) => sum + s.overall_rating, 0) / userSatisfaction.length : 0,
        communication_score: userSatisfaction.length > 0 ?
          userSatisfaction.reduce((sum, s) => sum + s.communication_rating, 0) / userSatisfaction.length : 0,
        quality_score: userSatisfaction.length > 0 ?
          userSatisfaction.reduce((sum, s) => sum + s.quality_rating, 0) / userSatisfaction.length : 0,
        timeliness_score: userSatisfaction.length > 0 ?
          userSatisfaction.reduce((sum, s) => sum + s.timeliness_rating, 0) / userSatisfaction.length : 0,
        value_score: userSatisfaction.length > 0 ?
          userSatisfaction.reduce((sum, s) => sum + s.value_rating, 0) / userSatisfaction.length : 0,
        recommendation_rate: userSatisfaction.length > 0 ?
          (userSatisfaction.filter(s => s.would_recommend).length / userSatisfaction.length) * 100 : 0,
        satisfaction_trend: this.calculateSatisfactionTrend(userSatisfaction),
        feedback_analysis: this.analyzeFeedback(userSatisfaction),
        customer_loyalty_score: this.calculateLoyaltyScore(userSatisfaction)
      };

      return { success: true, metrics };
    } catch (error) {
      console.error('AdvancedAnalyticsService: Error getting customer satisfaction metrics:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // BUSINESS INTELLIGENCE DASHBOARD
  // ========================================

  async generateBusinessIntelligence(userId) {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const bi = {
          id: uniqueIdGenerator.generateId('bi'),
          user_id: userId,
          generated_at: new Date().toISOString(),
          key_insights: [
            'Revenue increased 15% this month compared to last month',
            'Customer satisfaction is above industry average at 4.6/5',
            'Peak performance hours are 9-11 AM and 2-4 PM',
            'Repeat customers generate 40% more revenue per job',
            'Communication quality is your strongest performance area'
          ],
          recommendations: [
            'Focus on morning scheduling to maximize efficiency',
            'Implement customer follow-up system to increase repeat business',
            'Consider expanding service area based on demand patterns',
            'Develop loyalty program for repeat customers',
            'Optimize pricing for high-demand service categories'
          ],
          market_opportunities: [
            'Electric vehicle maintenance services showing 25% growth',
            'Preventive maintenance packages have high profit margins',
            'Weekend service availability could capture 30% more customers',
            'Mobile service expansion to nearby suburbs',
            'Partnership opportunities with local auto dealers'
          ],
          risk_factors: [
            'Seasonal demand fluctuations in winter months',
            'Competition from new mobile service providers',
            'Supply chain delays affecting parts availability',
            'Customer acquisition cost increasing by 12%',
            'Regulatory changes in automotive service standards'
          ],
          performance_score: 87,
          growth_potential: 'high',
          market_position: 'strong'
        };

        this.businessIntelligence.push(bi);
        await this.saveData();
        return { success: true, bi };
      }
    } catch (error) {
      console.error('AdvancedAnalyticsService: Error generating business intelligence:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // PREDICTIVE ANALYTICS
  // ========================================

  generatePredictiveInsights(userId) {
    try {
      const userRevenue = this.revenueMetrics.filter(r => r.user_id === userId);
      const userPerformance = this.performanceMetrics.filter(p => p.user_id === userId);
      const userSatisfaction = this.customerMetrics.filter(s => s.user_id === userId);

      const predictions = {
        revenue_forecast: this.predictRevenue(userRevenue),
        demand_forecast: this.predictDemand(userRevenue),
        customer_churn_risk: this.predictCustomerChurn(userSatisfaction),
        performance_trends: this.predictPerformanceTrends(userPerformance),
        seasonal_patterns: this.identifySeasonalPatterns(userRevenue),
        growth_opportunities: this.identifyGrowthOpportunities(userRevenue, userPerformance)
      };

      return { success: true, predictions };
    } catch (error) {
      console.error('AdvancedAnalyticsService: Error generating predictive insights:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  groupRevenueByCategory(revenue) {
    const grouped = {};
    revenue.forEach(r => {
      if (!grouped[r.category]) {
        grouped[r.category] = { total: 0, count: 0 };
      }
      grouped[r.category].total += r.amount;
      grouped[r.category].count += 1;
    });
    return grouped;
  }

  calculateRevenueTrend(revenue) {
    if (revenue.length < 2) return 'insufficient_data';
    
    const sorted = revenue.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, r) => sum + r.amount, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.amount, 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  getMonthlyBreakdown(revenue) {
    const monthly = {};
    revenue.forEach(r => {
      if (!monthly[r.month]) {
        monthly[r.month] = 0;
      }
      monthly[r.month] += r.amount;
    });
    return monthly;
  }

  generateRevenueForecast(revenue) {
    if (revenue.length < 3) return { forecast: 'insufficient_data' };
    
    const monthly = this.getMonthlyBreakdown(revenue);
    const months = Object.keys(monthly).sort();
    const values = months.map(month => monthly[month]);
    
    // Simple linear trend calculation
    const n = values.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + val * (i + 1), 0);
    const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const nextMonth = intercept + slope * (n + 1);
    
    return {
      next_month_forecast: Math.max(0, nextMonth),
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      confidence: n >= 6 ? 'high' : n >= 3 ? 'medium' : 'low'
    };
  }

  getTopPerformingDays(revenue) {
    const dayPerformance = {};
    revenue.forEach(r => {
      const day = new Date(r.date).getDay();
      if (!dayPerformance[day]) {
        dayPerformance[day] = { total: 0, count: 0 };
      }
      dayPerformance[day].total += r.amount;
      dayPerformance[day].count += 1;
    });
    
    return Object.entries(dayPerformance)
      .map(([day, data]) => ({
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
        average_revenue: data.total / data.count,
        total_revenue: data.total,
        job_count: data.count
      }))
      .sort((a, b) => b.average_revenue - a.average_revenue);
  }

  calculateGrowthRate(revenue) {
    if (revenue.length < 2) return 0;
    
    const monthly = this.getMonthlyBreakdown(revenue);
    const months = Object.keys(monthly).sort();
    
    if (months.length < 2) return 0;
    
    const latest = monthly[months[months.length - 1]];
    const previous = monthly[months[months.length - 2]];
    
    return ((latest - previous) / previous) * 100;
  }

  calculatePerformanceTrend(performance) {
    if (performance.length < 2) return 'insufficient_data';
    
    const sorted = performance.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, p) => sum + p.customer_rating, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.customer_rating, 0) / secondHalf.length;
    
    const change = secondAvg - firstAvg;
    
    if (change > 0.2) return 'improving';
    if (change < -0.2) return 'declining';
    return 'stable';
  }

  getIndustryComparison(performance) {
    // Mock industry benchmarks
    const industryBenchmarks = {
      average_rating: 4.2,
      average_completion_time: 3.5,
      first_time_fix_rate: 78,
      customer_satisfaction: 4.1
    };
    
    const userAverages = {
      average_rating: performance.length > 0 ? 
        performance.reduce((sum, p) => sum + p.customer_rating, 0) / performance.length : 0,
      average_completion_time: performance.length > 0 ? 
        performance.reduce((sum, p) => sum + p.completion_time_hours, 0) / performance.length : 0,
      first_time_fix_rate: performance.length > 0 ? 
        (performance.filter(p => p.first_time_fix_rate).length / performance.length) * 100 : 0,
      customer_satisfaction: performance.length > 0 ? 
        performance.reduce((sum, p) => sum + p.customer_satisfaction, 0) / performance.length : 0
    };
    
    return {
      industry: industryBenchmarks,
      user: userAverages,
      comparison: {
        rating_vs_industry: userAverages.average_rating - industryBenchmarks.average_rating,
        completion_time_vs_industry: industryBenchmarks.average_completion_time - userAverages.average_completion_time,
        fix_rate_vs_industry: userAverages.first_time_fix_rate - industryBenchmarks.first_time_fix_rate,
        satisfaction_vs_industry: userAverages.customer_satisfaction - industryBenchmarks.customer_satisfaction
      }
    };
  }

  identifyImprovementAreas(performance) {
    const areas = [];
    
    if (performance.length === 0) {
      areas.push('Start tracking performance metrics to identify improvement areas');
      return areas;
    }
    
    const avgRating = performance.reduce((sum, p) => sum + p.customer_rating, 0) / performance.length;
    const avgCompletionTime = performance.reduce((sum, p) => sum + p.completion_time_hours, 0) / performance.length;
    const fixRate = (performance.filter(p => p.first_time_fix_rate).length / performance.length) * 100;
    
    if (avgRating < 4.0) {
      areas.push('Focus on improving customer service quality');
    }
    if (avgCompletionTime > 4.0) {
      areas.push('Optimize workflow to reduce completion time');
    }
    if (fixRate < 80) {
      areas.push('Improve diagnostic accuracy and first-time fix rate');
    }
    
    return areas;
  }

  identifyStrengths(performance) {
    const strengths = [];
    
    if (performance.length === 0) {
      return strengths;
    }
    
    const avgRating = performance.reduce((sum, p) => sum + p.customer_rating, 0) / performance.length;
    const avgCompletionTime = performance.reduce((sum, p) => sum + p.completion_time_hours, 0) / performance.length;
    const fixRate = (performance.filter(p => p.first_time_fix_rate).length / performance.length) * 100;
    
    if (avgRating >= 4.5) {
      strengths.push('Excellent customer satisfaction ratings');
    }
    if (avgCompletionTime <= 2.5) {
      strengths.push('Fast and efficient service delivery');
    }
    if (fixRate >= 90) {
      strengths.push('High first-time fix rate');
    }
    
    return strengths;
  }

  calculateSatisfactionTrend(satisfaction) {
    if (satisfaction.length < 2) return 'insufficient_data';
    
    const sorted = satisfaction.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, s) => sum + s.overall_rating, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.overall_rating, 0) / secondHalf.length;
    
    const change = secondAvg - firstAvg;
    
    if (change > 0.2) return 'improving';
    if (change < -0.2) return 'declining';
    return 'stable';
  }

  analyzeFeedback(satisfaction) {
    const feedback = satisfaction.filter(s => s.feedback_text && s.feedback_text.trim());
    
    if (feedback.length === 0) {
      return { sentiment: 'neutral', themes: [], recommendations: [] };
    }
    
    // Simple sentiment analysis (in a real app, you'd use a proper NLP service)
    const positiveWords = ['great', 'excellent', 'amazing', 'perfect', 'wonderful', 'fantastic'];
    const negativeWords = ['terrible', 'awful', 'horrible', 'disappointed', 'frustrated', 'poor'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    const themes = [];
    
    feedback.forEach(f => {
      const text = f.feedback_text.toLowerCase();
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
      
      // Simple theme extraction
      if (text.includes('time') || text.includes('quick') || text.includes('fast')) {
        themes.push('timeliness');
      }
      if (text.includes('quality') || text.includes('work') || text.includes('repair')) {
        themes.push('quality');
      }
      if (text.includes('communication') || text.includes('explain') || text.includes('clear')) {
        themes.push('communication');
      }
    });
    
    const sentiment = positiveCount > negativeCount ? 'positive' : 
                     negativeCount > positiveCount ? 'negative' : 'neutral';
    
    const uniqueThemes = [...new Set(themes)];
    
    return {
      sentiment,
      themes: uniqueThemes,
      recommendations: sentiment === 'negative' ? 
        ['Focus on addressing customer concerns', 'Improve communication during service'] : 
        ['Continue current service quality', 'Leverage positive feedback for marketing']
    };
  }

  calculateLoyaltyScore(satisfaction) {
    if (satisfaction.length === 0) return 0;
    
    const avgRating = satisfaction.reduce((sum, s) => sum + s.overall_rating, 0) / satisfaction.length;
    const recommendationRate = (satisfaction.filter(s => s.would_recommend).length / satisfaction.length) * 100;
    
    // Simple loyalty score calculation
    const ratingScore = (avgRating / 5) * 50;
    const recommendationScore = (recommendationRate / 100) * 50;
    
    return Math.round(ratingScore + recommendationScore);
  }

  predictRevenue(revenue) {
    if (revenue.length < 3) return { forecast: 'insufficient_data' };
    
    const monthly = this.getMonthlyBreakdown(revenue);
    const months = Object.keys(monthly).sort();
    const values = months.map(month => monthly[month]);
    
    // Simple trend analysis
    const avgGrowth = values.length > 1 ? 
      (values[values.length - 1] - values[0]) / values.length : 0;
    
    const nextMonth = values[values.length - 1] + avgGrowth;
    
    return {
      next_month: Math.max(0, nextMonth),
      trend: avgGrowth > 0 ? 'growing' : avgGrowth < 0 ? 'declining' : 'stable',
      confidence: values.length >= 6 ? 'high' : values.length >= 3 ? 'medium' : 'low'
    };
  }

  predictDemand(revenue) {
    // Simple demand prediction based on historical patterns
    const dayOfWeek = new Date().getDay();
    const hour = new Date().getHours();
    
    // Mock demand patterns
    const demandPatterns = {
      weekday: { morning: 'high', afternoon: 'medium', evening: 'low' },
      weekend: { morning: 'medium', afternoon: 'high', evening: 'medium' }
    };
    
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    return {
      current_demand: demandPatterns[isWeekend ? 'weekend' : 'weekday'][timeOfDay],
      peak_hours: isWeekend ? ['2-4 PM'] : ['9-11 AM', '2-4 PM'],
      recommended_scheduling: timeOfDay === 'morning' ? 'high' : timeOfDay === 'afternoon' ? 'medium' : 'low'
    };
  }

  predictCustomerChurn(satisfaction) {
    if (satisfaction.length === 0) return { risk: 'unknown' };
    
    const recentSatisfaction = satisfaction.slice(-5); // Last 5 interactions
    const avgRecentRating = recentSatisfaction.reduce((sum, s) => sum + s.overall_rating, 0) / recentSatisfaction.length;
    const recentRecommendationRate = (recentSatisfaction.filter(s => s.would_recommend).length / recentSatisfaction.length) * 100;
    
    let risk = 'low';
    if (avgRecentRating < 3.0 || recentRecommendationRate < 50) {
      risk = 'high';
    } else if (avgRecentRating < 4.0 || recentRecommendationRate < 75) {
      risk = 'medium';
    }
    
    return {
      risk,
      factors: [
        avgRecentRating < 4.0 ? 'Declining satisfaction ratings' : null,
        recentRecommendationRate < 75 ? 'Low recommendation rate' : null
      ].filter(Boolean),
      recommendations: risk === 'high' ? 
        ['Immediate customer outreach', 'Service quality review', 'Follow-up communication'] :
        risk === 'medium' ? 
        ['Proactive customer check-ins', 'Service improvement focus'] :
        ['Maintain current service quality', 'Continue customer engagement']
    };
  }

  predictPerformanceTrends(performance) {
    if (performance.length < 3) return { trend: 'insufficient_data' };
    
    const sorted = performance.sort((a, b) => new Date(a.date) - new Date(b.date));
    const recent = sorted.slice(-3);
    const older = sorted.slice(0, -3);
    
    if (older.length === 0) return { trend: 'insufficient_data' };
    
    const recentAvg = recent.reduce((sum, p) => sum + p.customer_rating, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.customer_rating, 0) / older.length;
    
    const trend = recentAvg > olderAvg + 0.2 ? 'improving' :
                  recentAvg < olderAvg - 0.2 ? 'declining' : 'stable';
    
    return {
      trend,
      current_level: recentAvg,
      change_from_baseline: recentAvg - olderAvg,
      confidence: performance.length >= 10 ? 'high' : 'medium'
    };
  }

  identifySeasonalPatterns(revenue) {
    if (revenue.length < 12) return { patterns: 'insufficient_data' };
    
    const monthly = this.getMonthlyBreakdown(revenue);
    const months = Object.keys(monthly).sort();
    
    // Simple seasonal analysis
    const patterns = {
      peak_months: [],
      low_months: [],
      seasonal_trend: 'stable'
    };
    
    const values = months.map(month => monthly[month]);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    months.forEach((month, index) => {
      if (monthly[month] > avg * 1.2) {
        patterns.peak_months.push(month);
      } else if (monthly[month] < avg * 0.8) {
        patterns.low_months.push(month);
      }
    });
    
    return patterns;
  }

  identifyGrowthOpportunities(revenue, performance) {
    const opportunities = [];
    
    // Revenue-based opportunities
    const monthly = this.getMonthlyBreakdown(revenue);
    const avgMonthly = Object.values(monthly).reduce((sum, val) => sum + val, 0) / Object.keys(monthly).length;
    
    if (avgMonthly < 5000) {
      opportunities.push('Expand service offerings to increase revenue per customer');
    }
    
    // Performance-based opportunities
    if (performance.length > 0) {
      const avgRating = performance.reduce((sum, p) => sum + p.customer_rating, 0) / performance.length;
      if (avgRating >= 4.5) {
        opportunities.push('Leverage high ratings for premium pricing');
      }
      
      const repeatRate = (performance.filter(p => p.repeat_customer).length / performance.length) * 100;
      if (repeatRate < 30) {
        opportunities.push('Implement customer retention program');
      }
    }
    
    return opportunities;
  }

  clearAllData() {
    this.analyticsData = [];
    this.revenueMetrics = [];
    this.performanceMetrics = [];
    this.customerMetrics = [];
    this.businessIntelligence = [];
    return this.saveData();
  }

  /**
   * Get job analytics for customers
   */
  async getJobAnalytics(userId, timeRange = 'month') {
    try {
      await this.initialize();
      // Mock implementation - replace with actual data
      return {
        totalJobs: 0,
        completedJobs: 0,
        pendingJobs: 0,
        averageRating: 0,
        totalSpent: 0,
        timeRange
      };
    } catch (error) {
      console.error('Error getting job analytics:', error);
      return {
        totalJobs: 0,
        completedJobs: 0,
        pendingJobs: 0,
        averageRating: 0,
        totalSpent: 0,
        timeRange
      };
    }
  }

  /**
   * Get earnings analytics for mechanics
   */
  async getEarningsAnalytics(userId, timeRange = 'month') {
    try {
      await this.initialize();
      // Mock implementation - replace with actual data
      return {
        totalEarnings: 0,
        completedJobs: 0,
        averageRating: 0,
        timeRange
      };
    } catch (error) {
      console.error('Error getting earnings analytics:', error);
      return {
        totalEarnings: 0,
        completedJobs: 0,
        averageRating: 0,
        timeRange
      };
    }
  }
}

// Export singleton instance
const advancedAnalyticsService = new AdvancedAnalyticsService();
export default advancedAnalyticsService;
