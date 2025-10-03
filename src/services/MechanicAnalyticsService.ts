// Mechanic Analytics Service
// Handles real analytics data for mechanics

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface AnalyticsData {
  period: string;
  summary: {
    total_jobs: number;
    completed_jobs: number;
    in_progress_jobs: number;
    pending_jobs: number;
    completion_rate: number;
    total_earnings: number;
    average_earning_per_job: number;
    total_reviews: number;
    average_rating: number;
    average_response_time_hours: number;
  };
  breakdown?: {
    by_category: Record<string, { count: number; earnings: number }>;
    monthly_trends?: Record<string, { jobs: number; earnings: number }>;
  };
  period_start: string;
  period_end: string;
}

export interface PerformanceMetrics {
  period: string;
  metrics: {
    total_jobs: number;
    completed_jobs: number;
    completion_rate: number;
    average_completion_time_hours: number;
    on_time_completion_rate: number;
    total_reviews: number;
    average_rating: number;
    satisfaction_rate: number;
  };
  period_start: string;
  period_end: string;
}

class MechanicAnalyticsService {
  private static instance: MechanicAnalyticsService;

  public static getInstance(): MechanicAnalyticsService {
    if (!MechanicAnalyticsService.instance) {
      MechanicAnalyticsService.instance = new MechanicAnalyticsService();
    }
    return MechanicAnalyticsService.instance;
  }

  /**
   * Get analytics dashboard data
   */
  async getAnalytics(
    mechanicId: string, 
    options?: {
      period?: 'week' | 'month' | 'quarter' | 'year';
      include_breakdown?: boolean;
    }
  ): Promise<{ success: boolean; error?: string; data?: AnalyticsData }> {
    try {
      const params = new URLSearchParams();
      if (options?.period) params.append('period', options.period);
      if (options?.include_breakdown !== undefined) params.append('include_breakdown', options.include_breakdown.toString());

      const url = `${API_BASE_URL}/mechanics/${mechanicId}/analytics${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch analytics:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to fetch analytics data'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    mechanicId: string, 
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<{ success: boolean; error?: string; data?: PerformanceMetrics }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/performance?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch performance metrics:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to fetch performance metrics'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${Math.round(value * 100) / 100}%`;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Format rating
   */
  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  /**
   * Get rating color based on value
   */
  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#4CAF50'; // Green
    if (rating >= 4.0) return '#8BC34A'; // Light Green
    if (rating >= 3.5) return '#FFC107'; // Amber
    if (rating >= 3.0) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  /**
   * Get completion rate color
   */
  getCompletionRateColor(rate: number): string {
    if (rate >= 90) return '#4CAF50'; // Green
    if (rate >= 80) return '#8BC34A'; // Light Green
    if (rate >= 70) return '#FFC107'; // Amber
    if (rate >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  /**
   * Get period display name
   */
  getPeriodDisplayName(period: string): string {
    switch (period) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'quarter':
        return 'This Quarter';
      case 'year':
        return 'This Year';
      default:
        return 'This Month';
    }
  }

  /**
   * Calculate trend direction (for future use)
   */
  calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    const difference = current - previous;
    const percentageChange = previous > 0 ? (difference / previous) * 100 : 0;
    
    if (Math.abs(percentageChange) < 5) return 'stable';
    return percentageChange > 0 ? 'up' : 'down';
  }

  /**
   * Get trend color
   */
  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return '#4CAF50'; // Green
      case 'down':
        return '#F44336'; // Red
      case 'stable':
        return '#757575'; // Gray
    }
  }

  /**
   * Get trend icon
   */
  getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      case 'stable':
        return 'trending-flat';
    }
  }

  /**
   * Format time duration
   */
  formatDuration(hours: number): string {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${Math.round(hours * 10) / 10}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round((hours % 24) * 10) / 10;
      return `${days}d ${remainingHours}h`;
    }
  }

  /**
   * Get category color for charts
   */
  getCategoryColor(category: string): string {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];
    
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }
}

export default MechanicAnalyticsService.getInstance();
