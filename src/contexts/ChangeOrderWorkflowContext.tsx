import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ChangeOrderService from '../services/ChangeOrderService';
import UnifiedJobService from '../services/UnifiedJobService';

// Types for Change Order Workflow
export interface ChangeOrder {
  id: string;
  jobId: string;
  mechanicId: string;
  customerId: string;
  title: string;
  description: string;
  totalAmount: number;
  requiresImmediateApproval: boolean;
  reason: string;
  mechanicName: string;
  customerName: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  lineItems?: LineItem[];
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  totalPrice: number;
  category?: string;
  notes?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  status: string;
  createdAt: string;
  [key: string]: any;
}

export interface ChangeOrderWorkflowContextType {
  // State
  changeOrders: ChangeOrder[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createChangeOrder: (changeOrderData: Omit<ChangeOrder, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'expiresAt'>) => Promise<{ success: boolean; changeOrder?: ChangeOrder; error?: string }>;
  addLineItems: (changeOrderId: string, lineItems: LineItem[]) => Promise<{ success: boolean; error?: string }>;
  approveChangeOrder: (changeOrderId: string, customerId: string) => Promise<{ success: boolean; error?: string }>;
  rejectChangeOrder: (changeOrderId: string, customerId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  getJobForChangeOrder: (jobId: string) => Job | null;
  refreshChangeOrders: () => Promise<void>;
  
  // Getters
  getChangeOrdersByJob: (jobId: string) => ChangeOrder[];
  getChangeOrdersByCustomer: (customerId: string) => ChangeOrder[];
  getChangeOrdersByMechanic: (mechanicId: string) => ChangeOrder[];
  getChangeOrder: (changeOrderId: string) => ChangeOrder | undefined;
}

interface ChangeOrderWorkflowProviderProps {
  children: ReactNode;
}

const ChangeOrderWorkflowContext = createContext<ChangeOrderWorkflowContextType | undefined>(undefined);

export const useChangeOrderWorkflow = (): ChangeOrderWorkflowContextType => {
  const context = useContext(ChangeOrderWorkflowContext);
  if (!context) {
    throw new Error('useChangeOrderWorkflow must be used within a ChangeOrderWorkflowProvider');
  }
  return context;
};

export const ChangeOrderWorkflowProvider: React.FC<ChangeOrderWorkflowProviderProps> = ({ children }) => {
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the service
  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async (): Promise<void> => {
    try {
      setLoading(true);
      await ChangeOrderService.initialize();
      await loadChangeOrders();
    } catch (err) {
      console.error('ChangeOrderWorkflowContext: Error initializing service:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const loadChangeOrders = async (): Promise<void> => {
    try {
      const data = await ChangeOrderService.getAllData();
      setChangeOrders(data.changeOrders || []);
    } catch (err) {
      console.error('ChangeOrderWorkflowContext: Error loading change orders:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Get change orders for a specific job
  const getChangeOrdersByJob = (jobId: string): ChangeOrder[] => {
    return changeOrders.filter(co => co.jobId === jobId);
  };

  // Get change orders for a specific customer
  const getChangeOrdersByCustomer = (customerId: string): ChangeOrder[] => {
    return changeOrders.filter(co => co.customerId === customerId);
  };

  // Get change orders for a specific mechanic
  const getChangeOrdersByMechanic = (mechanicId: string): ChangeOrder[] => {
    return changeOrders.filter(co => co.mechanicId === mechanicId);
  };

  // Get a specific change order
  const getChangeOrder = (changeOrderId: string): ChangeOrder | undefined => {
    return changeOrders.find(co => co.id === changeOrderId);
  };

  // Create a new change order
  const createChangeOrder = async (
    changeOrderData: Omit<ChangeOrder, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'expiresAt'>
  ): Promise<{ success: boolean; changeOrder?: ChangeOrder; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      // Create the change order through UnifiedJobService to ensure proper integration
      const result = await UnifiedJobService.createChangeOrder(changeOrderData);
      
      if (result.success) {
        // Reload change orders to get the latest data
        await loadChangeOrders();
        return result;
      } else {
        throw new Error(result.error || 'Failed to create change order');
      }
    } catch (err) {
      console.error('ChangeOrderWorkflowContext: Error creating change order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Add line items to a change order
  const addLineItems = async (
    changeOrderId: string, 
    lineItems: LineItem[]
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ChangeOrderService.addLineItems(changeOrderId, lineItems);
      
      if (result.success) {
        // Reload change orders to get the latest data
        await loadChangeOrders();
        return result;
      } else {
        throw new Error(result.error || 'Failed to add line items');
      }
    } catch (err) {
      console.error('ChangeOrderWorkflowContext: Error adding line items:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Approve a change order
  const approveChangeOrder = async (
    changeOrderId: string, 
    customerId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await UnifiedJobService.approveChangeOrder(changeOrderId, customerId);
      
      if (result.success) {
        // Reload change orders to get the latest data
        await loadChangeOrders();
        return result;
      } else {
        throw new Error(result.error || 'Failed to approve change order');
      }
    } catch (err) {
      console.error('ChangeOrderWorkflowContext: Error approving change order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Reject a change order
  const rejectChangeOrder = async (
    changeOrderId: string, 
    customerId: string, 
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await UnifiedJobService.rejectChangeOrder(changeOrderId, customerId, reason);
      
      if (result.success) {
        // Reload change orders to get the latest data
        await loadChangeOrders();
        return result;
      } else {
        throw new Error(result.error || 'Failed to reject change order');
      }
    } catch (err) {
      console.error('ChangeOrderWorkflowContext: Error rejecting change order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get job data for change order context (separate from job creation)
  const getJobForChangeOrder = (jobId: string): Job | null => {
    // Use UnifiedJobService to get job data, but this is separate from job creation workflow
    return UnifiedJobService.getJob(jobId);
  };

  // Refresh change orders data
  const refreshChangeOrders = async (): Promise<void> => {
    await loadChangeOrders();
  };

  const value: ChangeOrderWorkflowContextType = {
    // State
    changeOrders,
    loading,
    error,
    
    // Actions
    createChangeOrder,
    addLineItems,
    approveChangeOrder,
    rejectChangeOrder,
    getJobForChangeOrder,
    refreshChangeOrders,
    
    // Getters
    getChangeOrdersByJob,
    getChangeOrdersByCustomer,
    getChangeOrdersByMechanic,
    getChangeOrder,
  };

  return (
    <ChangeOrderWorkflowContext.Provider value={value}>
      {children}
    </ChangeOrderWorkflowContext.Provider>
  );
};

export default ChangeOrderWorkflowContext;



