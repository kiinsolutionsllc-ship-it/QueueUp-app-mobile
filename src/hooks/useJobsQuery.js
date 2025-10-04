import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hapticService } from '../services/HapticService';
import { safeSupabase, TABLES } from '../config/supabase';

// Supabase API service
const jobsApi = {
  getJobs: async (filters = {}) => {
    try {
      if (!safeSupabase) {
        console.warn('useJobsQuery: Supabase not configured, returning empty array');
        return [];
      }

      let query = safeSupabase
        .from(TABLES.JOBS)
        .select(`
          *,
          customer:customers(*),
          mechanic:mechanics(*),
          bids(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      
      if (filters.mechanicId) {
        query = query.eq('mechanic_id', filters.mechanicId);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('useJobsQuery: Error fetching jobs from Supabase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('useJobsQuery: Error in getJobs:', error);
      return [];
    }
  },
  
  createJob: async (jobData) => {
    try {
      if (!safeSupabase) {
        console.warn('useJobsQuery: Supabase not configured, cannot create job');
        throw new Error('Supabase not configured');
      }

      const newJob = {
        ...jobData,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await safeSupabase
        .from(TABLES.JOBS)
        .insert([newJob])
        .select(`
          *,
          customer:customers(*),
          mechanic:mechanics(*),
          bids(*)
        `)
        .single();

      if (error) {
        console.error('useJobsQuery: Error creating job in Supabase:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('useJobsQuery: Error in createJob:', error);
      throw error;
    }
  },
  
  updateJob: async ({ jobId, updates }) => {
    try {
      if (!safeSupabase) {
        console.warn('useJobsQuery: Supabase not configured, cannot update job');
        throw new Error('Supabase not configured');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await safeSupabase
        .from(TABLES.JOBS)
        .update(updateData)
        .eq('id', jobId)
        .select(`
          *,
          customer:customers(*),
          mechanic:mechanics(*),
          bids(*)
        `)
        .single();

      if (error) {
        console.error('useJobsQuery: Error updating job in Supabase:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('useJobsQuery: Error in updateJob:', error);
      throw error;
    }
  },
  
  deleteJob: async (jobId) => {
    try {
      if (!safeSupabase) {
        console.warn('useJobsQuery: Supabase not configured, cannot delete job');
        throw new Error('Supabase not configured');
      }

      const { error } = await safeSupabase
        .from(TABLES.JOBS)
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('useJobsQuery: Error deleting job from Supabase:', error);
        throw new Error(error.message);
      }

      return jobId;
    } catch (error) {
      console.error('useJobsQuery: Error in deleteJob:', error);
      throw error;
    }
  },
  
  getJob: async (jobId) => {
    try {
      if (!safeSupabase) {
        console.warn('useJobsQuery: Supabase not configured, cannot fetch job');
        throw new Error('Supabase not configured');
      }

      const { data, error } = await safeSupabase
        .from(TABLES.JOBS)
        .select(`
          *,
          customer:customers(*),
          mechanic:mechanics(*),
          bids(*)
        `)
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('useJobsQuery: Error fetching job from Supabase:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Job not found');
      }

      return data;
    } catch (error) {
      console.error('useJobsQuery: Error in getJob:', error);
      throw error;
    }
  },
};

// Query keys
export const jobKeys = {
  all: ['jobs'],
  lists: () => [...jobKeys.all, 'list'],
  list: (filters) => [...jobKeys.lists(), filters],
  details: () => [...jobKeys.all, 'detail'],
  detail: (id) => [...jobKeys.details(), id],
};

// Hooks
export const useJobs = (filters = {}) => {
  return useQuery({
    queryKey: jobKeys.list(filters),
    queryFn: () => jobsApi.getJobs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useJob = (jobId) => {
  return useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => jobsApi.getJob(jobId),
    enabled: !!jobId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobsApi.createJob,
    onSuccess: async (newJob) => {
      await hapticService.jobCreated();
      
      // Invalidate and refetch jobs list
      await queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      
      // Add the new job to the cache
      queryClient.setQueryData(jobKeys.detail(newJob.id), newJob);
    },
    onError: async (error) => {
      await hapticService.error();
      console.error('Failed to create job:', error);
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobsApi.updateJob,
    onSuccess: async (updatedJob) => {
      await hapticService.light();
      
      // Update the specific job in cache
      queryClient.setQueryData(jobKeys.detail(updatedJob.id), updatedJob);
      
      // Invalidate jobs list to refetch
      await queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
    onError: async (error) => {
      await hapticService.error();
      console.error('Failed to update job:', error);
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobsApi.deleteJob,
    onSuccess: async (deletedJobId) => {
      await hapticService.light();
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: jobKeys.detail(deletedJobId) });
      
      // Invalidate jobs list
      await queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
    onError: async (error) => {
      await hapticService.error();
      console.error('Failed to delete job:', error);
    },
  });
};

// Computed hooks
export const useJobsByStatus = (status) => {
  const { data: jobs = [], ...rest } = useJobs();
  
  const filteredJobs = jobs.filter(job => job.status === status);
  
  return {
    data: filteredJobs,
    ...rest,
  };
};

export const useJobsByCustomer = (customerId) => {
  const { data: jobs = [], ...rest } = useJobs();
  
  const filteredJobs = jobs.filter(job => job.customer.id === customerId);
  
  return {
    data: filteredJobs,
    ...rest,
  };
};

export const useJobsByMechanic = (mechanicId) => {
  const { data: jobs = [], ...rest } = useJobs();
  
  const filteredJobs = jobs.filter(job => job.mechanic.id === mechanicId);
  
  return {
    data: filteredJobs,
    ...rest,
  };
};

export const useActiveJobs = () => {
  const { data: jobs = [], ...rest } = useJobs();
  
  const activeJobs = jobs.filter(job => 
    ['open', 'scheduled', 'in_progress'].includes(job.status)
  );
  
  return {
    data: activeJobs,
    ...rest,
  };
};

export const useCompletedJobs = () => {
  const { data: jobs = [], ...rest } = useJobs();
  
  const completedJobs = jobs.filter(job => job.status === 'completed');
  
  return {
    data: completedJobs,
    ...rest,
  };
};

export const useJobStats = () => {
  const { data: jobs = [], isLoading, error } = useJobs();
  
  const stats = {
    total: jobs.length,
    completed: jobs.filter(job => job.status === 'completed').length,
    active: jobs.filter(job => ['open', 'scheduled', 'in_progress'].includes(job.status)).length,
    totalEarnings: jobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => sum + job.price, 0),
  };
  
  stats.completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  
  return {
    data: stats,
    isLoading,
    error,
  };
};
