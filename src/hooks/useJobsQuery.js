import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hapticService } from '../services/HapticService';

// Mock API service - replace with actual API calls
const jobsApi = {
  getJobs: async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockJobs = [
      {
        id: '1',
        title: 'Oil Change Service',
        description: 'Regular oil change and filter replacement',
        customer: {
          id: 'customer1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+1234567890',
        },
        mechanic: {
          id: 'mechanic1',
          name: 'Mike Mechanic',
          rating: 4.9,
        },
        status: 'open',
        price: 75,
        estimatedDuration: 30,
        location: {
          address: '123 Main St, City, State',
          coordinates: { lat: 40.7128, lng: -74.0060 },
        },
        createdAt: '2024-12-01T10:00:00Z',
        updatedAt: '2024-12-01T10:00:00Z',
        scheduledAt: null,
        completedAt: null,
        category: 'maintenance',
        vehicle: {
          make: 'Unknown',
          model: 'Vehicle',
          year: 2020,
          vin: 'UNKNOWN',
        },
      },
      {
        id: '2',
        title: 'Brake Pad Replacement',
        description: 'Replace front and rear brake pads',
        customer: {
          id: 'customer2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '+1234567891',
        },
        mechanic: {
          id: 'mechanic2',
          name: 'Sarah Technician',
          rating: 4.8,
        },
        status: 'in_progress',
        price: 200,
        estimatedDuration: 90,
        location: {
          address: '456 Oak Ave, City, State',
          coordinates: { lat: 40.7589, lng: -73.9851 },
        },
        createdAt: '2024-11-28T14:30:00Z',
        updatedAt: '2024-12-01T09:15:00Z',
        scheduledAt: '2024-12-01T09:00:00Z',
        completedAt: null,
        category: 'brakes',
        vehicle: {
          make: 'Unknown',
          model: 'Vehicle',
          year: 2019,
          vin: 'UNKNOWN',
        },
      },
      {
        id: '3',
        title: 'Tire Rotation',
        description: 'Rotate tires and check alignment',
        customer: {
          id: 'customer3',
          name: 'Mike Davis',
          email: 'mike@example.com',
          phone: '+1234567892',
        },
        mechanic: {
          id: 'mechanic1',
          name: 'Mike Mechanic',
          rating: 4.9,
        },
        status: 'completed',
        price: 50,
        estimatedDuration: 45,
        location: {
          address: '789 Pine St, City, State',
          coordinates: { lat: 40.7505, lng: -73.9934 },
        },
        createdAt: '2024-11-25T11:00:00Z',
        updatedAt: '2024-11-25T15:30:00Z',
        scheduledAt: '2024-11-25T14:00:00Z',
        completedAt: '2024-11-25T15:30:00Z',
        category: 'tires',
        vehicle: {
          make: 'Nissan',
          model: 'Altima',
          year: 2021,
          vin: '1N4AL3AP8JC123789',
        },
      },
    ];
    
    // Apply filters
    let filteredJobs = mockJobs;
    
    if (filters.status) {
      filteredJobs = filteredJobs.filter(job => job.status === filters.status);
    }
    
    if (filters.customerId) {
      filteredJobs = filteredJobs.filter(job => job.customer.id === filters.customerId);
    }
    
    if (filters.mechanicId) {
      filteredJobs = filteredJobs.filter(job => job.mechanic.id === filters.mechanicId);
    }
    
    if (filters.category) {
      filteredJobs = filteredJobs.filter(job => job.category === filters.category);
    }
    
    return filteredJobs;
  },
  
  createJob: async (jobData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newJob = {
      id: `job_${Date.now()}`,
      ...jobData,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newJob;
  },
  
  updateJob: async ({ jobId, updates }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: jobId,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  },
  
  deleteJob: async (jobId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return jobId;
  },
  
  getJob: async (jobId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock single job fetch
    const jobs = await jobsApi.getJobs();
    const job = jobs.find(j => j.id === jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }
    
    return job;
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
