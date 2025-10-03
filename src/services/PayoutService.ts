// Payout Service
// Handles payout requests and earnings management for mechanics

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface PayoutRequest {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description: string;
  requested_at: string;
  processed_at?: string;
  bank_account_id: string;
  bank_accounts: {
    account_holder_name: string;
    account_number: string;
    bank_name: string;
  };
}

export interface EarningsSummary {
  period: string;
  summary: {
    total_earnings: number;
    completed_jobs: number;
    average_earning_per_job: number;
    available_balance: number;
    pending_payouts: number;
  };
  recent_earnings: Array<{
    id: string;
    title: string;
    category: string;
    amount: number;
    completed_at: string;
  }>;
  period_start: string;
  period_end: string;
}

export interface PayoutRequestData {
  amount: number;
  bank_account_id: string;
  description?: string;
}

class PayoutService {
  private static instance: PayoutService;

  public static getInstance(): PayoutService {
    if (!PayoutService.instance) {
      PayoutService.instance = new PayoutService();
    }
    return PayoutService.instance;
  }

  /**
   * Request a payout
   */
  async requestPayout(
    mechanicId: string, 
    payoutData: PayoutRequestData
  ): Promise<{ success: boolean; error?: string; data?: PayoutRequest }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/payouts/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payoutData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to request payout:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to request payout'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Error requesting payout:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Get payout history
   */
  async getPayoutHistory(
    mechanicId: string, 
    options?: {
      status?: 'pending' | 'processing' | 'completed' | 'failed';
      limit?: number;
      offset?: number;
    }
  ): Promise<{ 
    success: boolean; 
    error?: string; 
    data?: PayoutRequest[]; 
    pagination?: {
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
    }
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const url = `${API_BASE_URL}/mechanics/${mechanicId}/payouts${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch payout history:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to fetch payout history'
        };
      }

      return {
        success: true,
        data: result.data,
        pagination: result.pagination
      };

    } catch (error) {
      console.error('Error fetching payout history:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Get earnings summary
   */
  async getEarningsSummary(
    mechanicId: string, 
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<{ success: boolean; error?: string; data?: EarningsSummary }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/earnings?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch earnings summary:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to fetch earnings summary'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Error fetching earnings summary:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Get payout details
   */
  async getPayoutDetails(
    mechanicId: string, 
    payoutId: string
  ): Promise<{ success: boolean; error?: string; data?: PayoutRequest }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/payouts/${payoutId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch payout details:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to fetch payout details'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Error fetching payout details:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get status color for payout status
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return '#FFA500'; // Orange
      case 'processing':
        return '#2196F3'; // Blue
      case 'completed':
        return '#4CAF50'; // Green
      case 'failed':
        return '#F44336'; // Red
      default:
        return '#757575'; // Gray
    }
  }

  /**
   * Get status text for payout status
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  }

  /**
   * Calculate estimated processing time
   */
  getEstimatedProcessingTime(status: string): string {
    switch (status) {
      case 'pending':
        return '2-3 business days';
      case 'processing':
        return '1-2 business days';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Contact support';
      default:
        return 'Unknown';
    }
  }
}

export default PayoutService.getInstance();
