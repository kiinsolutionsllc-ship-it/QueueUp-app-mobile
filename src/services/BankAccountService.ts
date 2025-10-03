// Bank Account Service
// Handles bank account management for mechanics

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface BankAccount {
  id: string;
  account_holder_name: string;
  account_number: string; // Last 4 digits only
  account_type: 'checking' | 'savings';
  bank_name: string;
  is_primary: boolean;
  status: 'active' | 'inactive' | 'deleted';
  created_at: string;
}

export interface BankAccountCreateData {
  account_holder_name: string;
  account_number: string;
  routing_number: string;
  account_type: 'checking' | 'savings';
  bank_name: string;
  is_primary?: boolean;
}

export interface BankAccountUpdateData {
  account_holder_name?: string;
  routing_number?: string;
  account_type?: 'checking' | 'savings';
  bank_name?: string;
  is_primary?: boolean;
}

class BankAccountService {
  private static instance: BankAccountService;

  public static getInstance(): BankAccountService {
    if (!BankAccountService.instance) {
      BankAccountService.instance = new BankAccountService();
    }
    return BankAccountService.instance;
  }

  /**
   * Create a new bank account
   */
  async createBankAccount(
    mechanicId: string, 
    accountData: BankAccountCreateData
  ): Promise<{ success: boolean; error?: string; data?: BankAccount }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/bank-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to create bank account:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to create bank account'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Error creating bank account:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Get all bank accounts for a mechanic
   */
  async getBankAccounts(mechanicId: string): Promise<{ success: boolean; error?: string; data?: BankAccount[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/bank-accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch bank accounts:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to fetch bank accounts'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Update a bank account
   */
  async updateBankAccount(
    mechanicId: string, 
    accountId: string, 
    updateData: BankAccountUpdateData
  ): Promise<{ success: boolean; error?: string; data?: BankAccount }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/bank-accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to update bank account:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to update bank account'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Error updating bank account:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Delete a bank account
   */
  async deleteBankAccount(
    mechanicId: string, 
    accountId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/bank-accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to delete bank account:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to delete bank account'
        };
      }

      return {
        success: true
      };

    } catch (error) {
      console.error('Error deleting bank account:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Validate bank account information
   */
  async validateBankAccount(
    mechanicId: string, 
    routingNumber: string, 
    accountNumber: string
  ): Promise<{ success: boolean; error?: string; data?: { valid: boolean; message: string; verification_required: boolean } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/mechanics/${mechanicId}/bank-accounts/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routing_number: routingNumber,
          account_number: accountNumber
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to validate bank account:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to validate bank account'
        };
      }

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('Error validating bank account:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and try again.'
      };
    }
  }

  /**
   * Format account number for display (show only last 4 digits)
   */
  formatAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) {
      return accountNumber;
    }
    return `****${accountNumber.slice(-4)}`;
  }

  /**
   * Validate routing number format
   */
  validateRoutingNumber(routingNumber: string): boolean {
    return /^\d{9}$/.test(routingNumber);
  }

  /**
   * Validate account number format
   */
  validateAccountNumber(accountNumber: string): boolean {
    return /^\d{4,17}$/.test(accountNumber);
  }

  /**
   * Get primary bank account
   */
  async getPrimaryBankAccount(mechanicId: string): Promise<{ success: boolean; error?: string; data?: BankAccount | null }> {
    try {
      const result = await this.getBankAccounts(mechanicId);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error
        };
      }

      const primaryAccount = result.data?.find(account => account.is_primary && account.status === 'active') || null;

      return {
        success: true,
        data: primaryAccount || undefined
      };

    } catch (error) {
      console.error('Error getting primary bank account:', error);
      return {
        success: false,
        error: 'Failed to get primary bank account'
      };
    }
  }
}

export default BankAccountService.getInstance();
