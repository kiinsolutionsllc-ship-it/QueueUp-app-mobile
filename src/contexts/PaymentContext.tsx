import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PaymentService from '../services/PaymentService';
import CommissionService from '../services/CommissionService';

// Type definitions
export interface Payment {
  id: string;
  jobId: string;
  customerId: string;
  mechanicId: string;
  amount: number;
  status: 'escrow' | 'completed' | 'refunded' | 'disputed';
  paymentMethod: string;
  createdAt: string;
  completedAt?: string | null;
  serviceCategory?: string | null;
  platformFee: number;
  mechanicAmount: number;
  description: string;
  transactionId: string;
  processor: string;
  refundedAt?: string;
  refundId?: string;
}

export interface EscrowAccount {
  id: string;
  jobId: string;
  customerId: string;
  mechanicId: string;
  amount: number;
  status: 'held' | 'released' | 'refunded';
  createdAt: string;
  releaseConditions: string[];
}

export interface PaymentResult {
  success: boolean;
  payment?: Payment;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refund?: any;
  error?: string;
}

export interface MechanicEarningsSummary {
  totalEarnings: number;
  pendingEarnings: number;
  disputedAmount: number;
  refundedAmount: number;
  platformFees: number;
  completedCount: number;
  pendingCount: number;
  disputedCount: number;
  refundedCount: number;
}

export interface PaymentContextType {
  payments: Payment[];
  escrowAccounts: EscrowAccount[];
  loading: boolean;
  loadPayments: () => Promise<void>;
  createPayment: (jobIdOrPaymentData: string | any, customerId?: string, mechanicId?: string, amount?: number, paymentMethod?: string) => Promise<PaymentResult>;
  releasePayment: (paymentId: string) => Promise<PaymentResult>;
  refundPayment: (paymentId: string, reason: string) => Promise<RefundResult>;
  getPaymentsByUser: (userId: string) => Payment[];
  getPaymentsByJob: (jobId: string) => Payment[];
  getEscrowAccountByJob: (jobId: string) => EscrowAccount | undefined;
  getTotalEarnings: (mechanicId: string) => number;
  getPlatformRevenue: () => number;
  getMechanicEarnings: (mechanicId: string, period?: 'week' | 'month' | 'year' | 'all') => Payment[];
  getMechanicEarningsSummary: (mechanicId: string) => MechanicEarningsSummary;
}

interface PaymentProviderProps {
  children: ReactNode;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [escrowAccounts, setEscrowAccounts] = useState<EscrowAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async (): Promise<void> => {
    try {
      const storedPayments = await AsyncStorage.getItem('payments');
      const storedEscrowAccounts = await AsyncStorage.getItem('escrowAccounts');
      
      if (storedPayments) {
        setPayments(JSON.parse(storedPayments));
      } else {
        setPayments([]);
      }

      if (storedEscrowAccounts) {
        setEscrowAccounts(JSON.parse(storedEscrowAccounts));
      } else {
        setEscrowAccounts([]);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (
    jobIdOrPaymentData: string | any, 
    customerId?: string, 
    mechanicId?: string, 
    amount?: number, 
    paymentMethod: string = 'card'
  ): Promise<PaymentResult> => {
    try {
      // Handle both calling patterns: object or individual parameters
      let paymentData: any;
      if (typeof jobIdOrPaymentData === 'object') {
        // Called with object: { amount, currency, type, etc. }
        paymentData = jobIdOrPaymentData;
        amount = paymentData.amount;
        paymentMethod = paymentData.paymentMethod || 'card';
        jobIdOrPaymentData = paymentData.jobId || 'temp-job-id';
        customerId = paymentData.customerId || customerId;
        mechanicId = paymentData.mechanicId || mechanicId;
      } else {
        // Called with individual parameters
        paymentData = {
          amount,
          currency: 'USD',
          type: 'escrow_deposit',
          jobId: jobIdOrPaymentData,
          customerId,
          mechanicId,
          paymentMethod
        };
      }

      // For mock environment, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful payment processing
      const paymentResult = {
        success: true,
        paymentId: `payment_${Date.now()}`,
        transactionId: `txn_${Date.now()}`,
        paymentMethod: paymentMethod
      };

      if (!paymentResult.success) {
        return { success: false, error: 'Payment failed' };
      }

      // Get service category from payment data or default to null
      const serviceCategory = paymentData.serviceCategory || null;
      
      // Calculate dynamic commission and payout
      const platformFee = CommissionService.calculateCommission(amount, serviceCategory);
      const mechanicAmount = CommissionService.calculateMechanicPayout(amount, serviceCategory);

      const newPayment: Payment = {
        id: paymentResult.paymentId,
        jobId: jobIdOrPaymentData,
        customerId: customerId!,
        mechanicId: mechanicId!,
        amount: amount!,
        status: 'escrow',
        paymentMethod,
        createdAt: new Date().toISOString(),
        completedAt: null,
        serviceCategory, // Add service category for dynamic commission tracking
        platformFee,
        mechanicAmount,
        description: `Payment for Job #${jobIdOrPaymentData}`,
        transactionId: paymentResult.transactionId,
        processor: paymentResult.paymentMethod,
      };
      
      const updatedPayments = [...payments, newPayment];
      setPayments(updatedPayments);
      await AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));

      // Create escrow account
      const newEscrowAccount: EscrowAccount = {
        id: Date.now().toString(),
        jobId: jobIdOrPaymentData,
        customerId: customerId!,
        mechanicId: mechanicId!,
        amount: amount!,
        status: 'held',
        createdAt: new Date().toISOString(),
        releaseConditions: ['job_completed', 'customer_approval'],
      };
      
      const updatedEscrowAccounts = [...escrowAccounts, newEscrowAccount];
      setEscrowAccounts(updatedEscrowAccounts);
      await AsyncStorage.setItem('escrowAccounts', JSON.stringify(updatedEscrowAccounts));
      
      return { success: true, payment: newPayment };
    } catch (error: any) {
      console.error('Error creating payment:', error);
      return { success: false, error: error.message };
    }
  };

  const releasePayment = async (paymentId: string): Promise<PaymentResult> => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return { success: false, error: 'Payment not found' };

      // In a real app, this would transfer the payment directly to the mechanic's bank account
      // For now, we'll just update the local status
      
      // Update payment status to completed (money goes directly to mechanic)
      const updatedPayments = payments.map(p => 
        p.id === paymentId 
          ? { ...p, status: 'completed' as const, completedAt: new Date().toISOString() }
          : p
      );
      setPayments(updatedPayments);
      await AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));

      // Update escrow account
      const updatedEscrowAccounts = escrowAccounts.map(escrow => 
        escrow.jobId === payment.jobId 
          ? { ...escrow, status: 'released' as const }
          : escrow
      );
      setEscrowAccounts(updatedEscrowAccounts);
      await AsyncStorage.setItem('escrowAccounts', JSON.stringify(updatedEscrowAccounts));
      
      return { success: true };
    } catch (error: any) {
      console.error('Error releasing payment:', error);
      return { success: false, error: error.message };
    }
  };

  const refundPayment = async (paymentId: string, reason: string): Promise<RefundResult> => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return { success: false, error: 'Payment not found' };

      // Process refund with real payment processor
      const refundResult = await PaymentService.refundPayment(paymentId, reason as any);
      
      if (!refundResult.success) {
        return { success: false, error: refundResult.error };
      }

      // Update payment status
      const updatedPayments = payments.map(p => 
        p.id === paymentId 
          ? { 
              ...p, 
              status: 'refunded' as const, 
              refundedAt: new Date().toISOString(),
              refundId: refundResult.refund.id,
            }
          : p
      );
      setPayments(updatedPayments);
      await AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));

      // Update escrow account
      const updatedEscrowAccounts = escrowAccounts.map(escrow => 
        escrow.jobId === payment.jobId 
          ? { ...escrow, status: 'refunded' as const }
          : escrow
      );
      setEscrowAccounts(updatedEscrowAccounts);
      await AsyncStorage.setItem('escrowAccounts', JSON.stringify(updatedEscrowAccounts));
      
      return { success: true, refund: refundResult.refund };
    } catch (error: any) {
      console.error('Error refunding payment:', error);
      return { success: false, error: error.message };
    }
  };

  const getPaymentsByUser = (userId: string): Payment[] => {
    return payments.filter(payment => 
      payment.customerId === userId || payment.mechanicId === userId
    );
  };

  const getPaymentsByJob = (jobId: string): Payment[] => {
    return payments.filter(payment => payment.jobId === jobId);
  };

  const getEscrowAccountByJob = (jobId: string): EscrowAccount | undefined => {
    return escrowAccounts.find(escrow => escrow.jobId === jobId);
  };

  const getTotalEarnings = (mechanicId: string): number => {
    return payments
      .filter(payment => payment.mechanicId === mechanicId && payment.status === 'completed')
      .reduce((total, payment) => total + payment.mechanicAmount, 0);
  };

  const getPlatformRevenue = (): number => {
    return payments
      .filter(payment => payment.status === 'completed')
      .reduce((total, payment) => total + payment.platformFee, 0);
  };

  // Mechanic-specific functions
  const getMechanicEarnings = (mechanicId: string, period: 'week' | 'month' | 'year' | 'all' = 'all'): Payment[] => {
    const now = new Date();
    const filterDate = new Date();

    switch (period) {
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return payments.filter(payment => payment.mechanicId === mechanicId);
    }

    return payments.filter(payment => 
      payment.mechanicId === mechanicId && 
      new Date(payment.createdAt) >= filterDate
    );
  };

  const getMechanicEarningsSummary = (mechanicId: string): MechanicEarningsSummary => {
    const mechanicPayments = payments.filter(payment => payment.mechanicId === mechanicId);
    
    const completed = mechanicPayments.filter(p => p.status === 'completed');
    const pending = mechanicPayments.filter(p => p.status === 'escrow');
    const disputed = mechanicPayments.filter(p => p.status === 'disputed');
    const refunded = mechanicPayments.filter(p => p.status === 'refunded');

    return {
      totalEarnings: completed.reduce((sum, p) => sum + p.mechanicAmount, 0),
      pendingEarnings: pending.reduce((sum, p) => sum + p.mechanicAmount, 0),
      disputedAmount: disputed.reduce((sum, p) => sum + p.mechanicAmount, 0),
      refundedAmount: refunded.reduce((sum, p) => sum + p.mechanicAmount, 0),
      platformFees: completed.reduce((sum, p) => sum + p.platformFee, 0),
      completedCount: completed.length,
      pendingCount: pending.length,
      disputedCount: disputed.length,
      refundedCount: refunded.length,
    };
  };

  const value: PaymentContextType = {
    payments,
    escrowAccounts,
    loading,
    loadPayments,
    createPayment,
    releasePayment,
    refundPayment,
    getPaymentsByUser,
    getPaymentsByJob,
    getEscrowAccountByJob,
    getTotalEarnings,
    getPlatformRevenue,
    // Mechanic-specific functions
    getMechanicEarnings,
    getMechanicEarningsSummary,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
