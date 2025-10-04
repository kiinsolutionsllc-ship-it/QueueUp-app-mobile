import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hapticService } from '../../services/HapticService';
import { safeSupabase, TABLES } from '../../config/supabase';

// Supabase jobs service
const jobsService = {
  getJobs: async (filters = {}) => {
    try {
      if (!safeSupabase) {
        console.warn('jobsSlice: Supabase not configured, returning empty array');
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
        console.error('jobsSlice: Error fetching jobs from Supabase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('jobsSlice: Error in getJobs:', error);
      return [];
    }
  },
  
  createJob: async (jobData) => {
    try {
      if (!safeSupabase) {
        console.warn('jobsSlice: Supabase not configured, cannot create job');
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
        console.error('jobsSlice: Error creating job in Supabase:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('jobsSlice: Error in createJob:', error);
      throw error;
    }
  },
  
  updateJob: async (jobId, updates) => {
    try {
      if (!safeSupabase) {
        console.warn('jobsSlice: Supabase not configured, cannot update job');
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
        console.error('jobsSlice: Error updating job in Supabase:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('jobsSlice: Error in updateJob:', error);
      throw error;
    }
  },
  
  deleteJob: async (jobId) => {
    try {
      if (!safeSupabase) {
        console.warn('jobsSlice: Supabase not configured, cannot delete job');
        throw new Error('Supabase not configured');
      }

      const { error } = await safeSupabase
        .from(TABLES.JOBS)
        .delete()
        .eq('id', jobId);

      if (error) {
        console.error('jobsSlice: Error deleting job from Supabase:', error);
        throw new Error(error.message);
      }

      return jobId;
    } catch (error) {
      console.error('jobsSlice: Error in deleteJob:', error);
      throw error;
    }
  },
  
  bidOnJob: async (jobId, bidData) => {
    try {
      if (!safeSupabase) {
        console.warn('jobsSlice: Supabase not configured, cannot create bid');
        throw new Error('Supabase not configured');
      }

      const newBid = {
        ...bidData,
        job_id: jobId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await safeSupabase
        .from(TABLES.BIDS)
        .insert([newBid])
        .select()
        .single();

      if (error) {
        console.error('jobsSlice: Error creating bid in Supabase:', error);
        throw new Error(error.message);
      }

      return {
        jobId,
        bid: data,
      };
    } catch (error) {
      console.error('jobsSlice: Error in bidOnJob:', error);
      throw error;
    }
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
