import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hapticService } from '../../services/HapticService';

// Mock jobs service - DISABLED FOR TESTING
const jobsService = {
  getJobs: async (filters = {}) => {
    console.log('jobsSlice: Mock jobs service is DISABLED for proper testing');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return empty array instead of mock jobs
    const mockJobs = []; // DISABLED FOR TESTING - No mock jobs
    
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
  
  updateJob: async (jobId, updates) => {
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
  
  bidOnJob: async (jobId, bidData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      jobId,
      bid: {
        id: `bid_${Date.now()}`,
        ...bidData,
        createdAt: new Date().toISOString(),
      },
    };
  },
};

// Async thunks
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (filters, { rejectWithValue }) => {
    try {
      const jobs = await jobsService.getJobs(filters);
      return jobs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const newJob = await jobsService.createJob(jobData);
      await hapticService.jobCreated();
      return newJob;
    } catch (error) {
      await hapticService.error();
      return rejectWithValue(error.message);
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ jobId, updates }, { rejectWithValue }) => {
    try {
      const updatedJob = await jobsService.updateJob(jobId, updates);
      await hapticService.light();
      return updatedJob;
    } catch (error) {
      await hapticService.error();
      return rejectWithValue(error.message);
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await jobsService.deleteJob(jobId);
      await hapticService.light();
      return jobId;
    } catch (error) {
      await hapticService.error();
      return rejectWithValue(error.message);
    }
  }
);

export const bidOnJob = createAsyncThunk(
  'jobs/bidOnJob',
  async ({ jobId, bidData }, { rejectWithValue }) => {
    try {
      const result = await jobsService.bidOnJob(jobId, bidData);
      await hapticService.light();
      return result;
    } catch (error) {
      await hapticService.error();
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  jobs: [],
  loading: false,
  error: null,
  lastFetched: null,
  filters: {
    status: null,
    customerId: null,
    mechanicId: null,
    category: null,
  },
  selectedJob: null,
  bids: {},
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        status: null,
        customerId: null,
        mechanicId: null,
        category: null,
      };
    },
    
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },
    
    clearSelectedJob: (state) => {
      state.selectedJob = null;
    },
    
    updateJobStatus: (state, action) => {
      const { jobId, status } = action.payload;
      const job = state.jobs.find(j => j.id === jobId);
      if (job) {
        job.status = status;
        job.updatedAt = new Date().toISOString();
        
        if (status === 'completed') {
          job.completedAt = new Date().toISOString();
        }
      }
    },
    
    addBid: (state, action) => {
      const { jobId, bid } = action.payload;
      if (!state.bids[jobId]) {
        state.bids[jobId] = [];
      }
      state.bids[jobId].push(bid);
    },
    
    removeBid: (state, action) => {
      const { jobId, bidId } = action.payload;
      if (state.bids[jobId]) {
        state.bids[jobId] = state.bids[jobId].filter(bid => bid.id !== bidId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create job
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs.unshift(action.payload);
        state.error = null;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update job
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete job
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = state.jobs.filter(job => job.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Bid on job
      .addCase(bidOnJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bidOnJob.fulfilled, (state, action) => {
        state.loading = false;
        const { jobId, bid } = action.payload;
        if (!state.bids[jobId]) {
          state.bids[jobId] = [];
        }
        state.bids[jobId].push(bid);
        state.error = null;
      })
      .addCase(bidOnJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setSelectedJob,
  clearSelectedJob,
  updateJobStatus,
  addBid,
  removeBid,
} = jobsSlice.actions;

export default jobsSlice.reducer;
