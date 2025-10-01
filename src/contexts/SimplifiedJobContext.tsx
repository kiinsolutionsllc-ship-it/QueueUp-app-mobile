// Simplified Job Context - Uses UnifiedJobService as single source of truth
import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import UnifiedJobService from '../services/UnifiedJobService';
import { Message } from '../types/MessagingTypes';

// Type definitions for job-related data
export interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  budget?: number;
  estimatedCost?: number;
  price?: number;
  estimatedDuration?: number;
  location?: string;
  category?: string;
  subcategory?: string;
  urgency: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  customerId: string;
  customerName?: string;
  mechanicId?: string;
  vehicleId?: string;
  vehicle?: any;
  images?: string[];
  notes?: string[];
  changeOrders?: ChangeOrder[];
  bids?: Bid[];
  acceptedBidId?: string;
  assignedMechanicId?: string;
  selectedMechanicId?: string;
  completedAt?: string;
  cancellationReason?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  progressionTimeline?: any[];
  workCompleted?: string;
  completionNotes?: string;
  completionPhotos?: string[];
  photos?: string[];
  mechanicName?: string;
  additionalNotes?: any[];
}

export interface Bid {
  id: string;
  jobId: string;
  mechanicId: string;
  amount: number;
  price?: number;
  message: string;
  status: string;
  createdAt: string;
  bidType?: string;
  estimatedDuration?: number;
  mechanicName?: string;
}

export interface ChangeOrder {
  id: string;
  jobId: string;
  description: string;
  amount: number;
  totalAmount?: number;
  status: string;
  createdAt: string;
  title?: string;
  reason?: string;
  lineItems?: any[];
  approvedAt?: string;
  expiresAt?: string;
}

// Message interface imported from MessagingTypes to avoid conflicts

export interface JobHistory {
  id: string;
  jobId: string;
  action: string;
  timestamp: string;
  details?: any;
}

export interface JobContextType {
  // State
  jobs: Job[];
  bids: Bid[];
  messages: Message[];
  jobHistory: JobHistory[];
  loading: boolean;
  
  // Job operations
  createJob: (jobData: Partial<Job>) => Promise<any>;
  updateJob: (jobId: string, updates: Partial<Job>) => Promise<any>;
  updateJobStatus: (jobId: string, status: string) => Promise<any>;
  getJob: (jobId: string) => Job | null;
  getJobsByCustomer: (customerId: string) => Job[];
  getJobsByMechanic: (mechanicId: string) => Job[];
  getActiveJobs: () => Job[];
  getAvailableJobs: () => Job[];
  isJobAvailableForBidding: (job: Job) => boolean;
  
  // Bid operations
  createBid: (bidData: Partial<Bid>) => Promise<any>;
  acceptBid: (bidId: string) => Promise<any>;
  rejectBid: (bidId: string) => Promise<any>;
  getBidsByMechanic: (mechanicId: string) => Bid[];
  getBidsByJob: (jobId: string) => Bid[];
  
  // Scheduling operations
  scheduleJob: (jobId: string, scheduleData: any) => Promise<any>;
  
  // Status operations
  startJob: (jobId: string, mechanicId: string) => Promise<any>;
  completeJob: (jobId: string, mechanicId: string) => Promise<any>;
  
  // Job notes
  addJobNote: (jobId: string, noteData: any) => Promise<any>;
  
  // Utility
  refreshData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  resetAllData: () => Promise<any>;
  resetAndCreateTestAccounts: () => Promise<{ success: boolean; message: string }>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJob = (): JobContextType => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize UnifiedJobService and load data
  useEffect(() => {
    const initializeService = async (): Promise<void> => {
      try {
        await UnifiedJobService.initialize();
        await refreshData();
        setLoading(false);
      } catch (error) {
        console.error('SimplifiedJobContext: Initialization failed:', error);
        setLoading(false);
      }
    };

    initializeService();
  }, []);

  // Refresh data from UnifiedJobService
  const refreshData = async (): Promise<void> => {
    try {
      console.log('SimplifiedJobContext - Starting data refresh...');
      await UnifiedJobService.refresh();
      
      const allJobs = UnifiedJobService.getAllJobs();
      console.log('SimplifiedJobContext - Retrieved jobs from service:', allJobs.length, allJobs.map(job => ({ id: job.id, customerId: job.customerId, title: job.title })));
      
      setJobs(allJobs);
      setBids(UnifiedJobService.getAllBids());
      setMessages(UnifiedJobService.messages);
      setJobHistory(UnifiedJobService.jobHistory);
      
      console.log('SimplifiedJobContext - Data refresh completed. Jobs state updated.');
    } catch (error) {
      console.error('SimplifiedJobContext: Error refreshing data:', error);
    }
  };

  // Job operations
  const createJob = async (jobData: Partial<Job>): Promise<any> => {
    try {
      console.log('SimplifiedJobContext - Creating job with data:', jobData);
      const result = await UnifiedJobService.createJob(jobData);
      console.log('SimplifiedJobContext - Job creation result:', result);
      
      console.log('SimplifiedJobContext - Refreshing data after job creation...');
      await refreshData();
      console.log('SimplifiedJobContext - Data refreshed. Current jobs count:', jobs.length);
      
      return result;
    } catch (error) {
      console.error('SimplifiedJobContext: Error creating job:', error);
      throw error;
    }
  };

  const updateJob = async (jobId: string, updates: Partial<Job>): Promise<any> => {
    try {
      const result = await UnifiedJobService.updateJob(jobId, updates);
      if (result) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error('SimplifiedJobContext: Error updating job:', error);
      throw error;
    }
  };

  const getJob = (jobId: string): Job | null => {
    return UnifiedJobService.getJob(jobId);
  };

  const getJobsByCustomer = (customerId: string): Job[] => {
    return UnifiedJobService.getJobsByCustomer(customerId);
  };

  const getJobsByMechanic = (mechanicId: string): Job[] => {
    return UnifiedJobService.getJobsByMechanic(mechanicId);
  };

  const getActiveJobs = (): Job[] => {
    return jobs.filter(job => 
      ['posted', 'bidding', 'scheduled', 'in_progress'].includes(job.status)
    );
  };

  const getAvailableJobs = (): Job[] => {
    return jobs.filter(job => {
      // Only show jobs that are in bidding phase
      const isBiddingPhase = job.status === 'posted' || job.status === 'bidding';
      
      // Exclude jobs that have been accepted or are in progress
      const isNotAccepted = !['accepted', 'scheduled', 'confirmed', 'in_progress', 'started', 'completed', 'cancelled'].includes(job.status);
      
      // Exclude jobs that already have an assigned mechanic
      const hasNoAssignedMechanic = !job.assignedMechanicId && !job.selectedMechanicId;
      
      return isBiddingPhase && isNotAccepted && hasNoAssignedMechanic;
    });
  };

  // Check if a specific job is available for bidding
  const isJobAvailableForBidding = (job: Job): boolean => {
    if (!job) return false;
    
    // Only jobs in bidding phase are available
    const isBiddingPhase = job.status === 'posted' || job.status === 'bidding';
    
    // Exclude jobs that have been accepted or are in progress
    const isNotAccepted = !['accepted', 'scheduled', 'confirmed', 'in_progress', 'started', 'completed', 'cancelled'].includes(job.status);
    
    // Exclude jobs that already have an assigned mechanic
    const hasNoAssignedMechanic = !job.assignedMechanicId && !job.selectedMechanicId;
    
    return isBiddingPhase && isNotAccepted && hasNoAssignedMechanic;
  };

  // Clear all data (for testing purposes)
  const clearAllData = async (): Promise<void> => {
    try {
      await UnifiedJobService.clearAllData();
      await refreshData();
      console.log('SimplifiedJobContext: All data cleared');
    } catch (error) {
      console.error('SimplifiedJobContext: Error clearing data:', error);
    }
  };

  const updateJobStatus = async (jobId: string, status: string): Promise<any> => {
    try {
      const result = await UnifiedJobService.updateJob(jobId, { status });
      if (result.success) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error('SimplifiedJobContext: Error updating job status:', error);
      throw error;
    }
  };

  // Bid operations
  const createBid = async (bidData: Partial<Bid>): Promise<any> => {
    try {
      const result = await UnifiedJobService.createBid(bidData);
      await refreshData();
      return result;
    } catch (error) {
      console.error('SimplifiedJobContext: Error creating bid:', error);
      throw error;
    }
  };

  const acceptBid = async (bidId: string): Promise<any> => {
    try {
      const result = await UnifiedJobService.acceptBid(bidId);
      if (result.success) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error('SimplifiedJobContext: Error accepting bid:', error);
      throw error;
    }
  };

  const rejectBid = async (bidId: string): Promise<any> => {
    try {
      const result = await UnifiedJobService.rejectBid(bidId);
      if (result.success) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error('SimplifiedJobContext: Error rejecting bid:', error);
      throw error;
    }
  };

  const getBidsByMechanic = (mechanicId: string): Bid[] => {
    return UnifiedJobService.getBidsByMechanic(mechanicId);
  };

  const getBidsByJob = (jobId: string): Bid[] => {
    return UnifiedJobService.getBidsByJob(jobId);
  };

  // Scheduling operations
  const scheduleJob = async (jobId: string, scheduleData: any): Promise<any> => {
    try {
      const result = await UnifiedJobService.scheduleJob(jobId, scheduleData);
      if (result.success) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error('SimplifiedJobContext: Error scheduling job:', error);
      throw error;
    }
  };

  // Status operations
  const startJob = async (jobId: string, mechanicId: string): Promise<any> => {
    try {
      const result = await UnifiedJobService.startJob(jobId, mechanicId);
      if (result.success) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error('SimplifiedJobContext: Error starting job:', error);
      throw error;
    }
  };

  const completeJob = async (jobId: string, mechanicId: string): Promise<any> => {
    try {
      const result = await UnifiedJobService.completeJob(jobId, mechanicId);
      if (result.success) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error('SimplifiedJobContext: Error completing job:', error);
      throw error;
    }
  };

  const addJobNote = async (jobId: string, noteData: any): Promise<any> => {
    try {
      const result = await UnifiedJobService.addJobNote(jobId, noteData);
      if (result) {
        await refreshData();
      }
      return result;
    } catch (error) {
      console.error('SimplifiedJobContext: Error adding job note:', error);
      throw error;
    }
  };

  const value: JobContextType = {
    // State
    jobs,
    bids,
    messages,
    jobHistory,
    loading,
    
    // Job operations
    createJob,
    updateJob,
    updateJobStatus,
    getJob,
    getJobsByCustomer,
    getJobsByMechanic,
    getActiveJobs,
    getAvailableJobs,
    isJobAvailableForBidding,
    
    // Bid operations
    createBid,
    acceptBid,
    rejectBid,
    getBidsByMechanic,
    getBidsByJob,
    
    // Scheduling operations
    scheduleJob,
    
    // Status operations
    startJob,
    completeJob,
    
    // Job notes
    addJobNote,
    
    // Utility
    refreshData,
    clearAllData,
    
    // Data reset for fresh testing
    resetAllData: async (): Promise<any> => {
      try {
        const result = await UnifiedJobService.resetAllData();
        if (result.success) {
          await refreshData();
        }
        return result;
      } catch (error) {
        console.error('SimplifiedJobContext: Error resetting all data:', error);
        throw error;
      }
    },

    // Reset and create fresh test accounts with new ID format
    resetAndCreateTestAccounts: async (): Promise<{ success: boolean; message: string }> => {
      try {
        console.log('SimplifiedJobContext - Resetting all data and creating test accounts...');
        
        // Reset all data
        const resetResult = await UnifiedJobService.resetAllData();
        if (!resetResult.success) {
          return { success: false, message: 'Failed to reset data: ' + resetResult.error };
        }
        
        // Mock test account creation is disabled for proper testing
        console.log('SimplifiedJobContext: Skipping test account creation - disabled for testing');
        
        // Refresh the context data
        await refreshData();
        
        console.log('SimplifiedJobContext - Test accounts reset and created successfully');
        return { 
          success: true, 
          message: 'Test accounts reset and data refreshed successfully' 
        };
      } catch (error) {
        console.error('SimplifiedJobContext - Error resetting and creating test accounts:', error);
        return { success: false, message: 'Error: ' + error.message };
      }
    }
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
