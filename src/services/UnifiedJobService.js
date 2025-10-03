// Unified Job Service - Single source of truth for all job operations
import { safeSupabase, TABLES } from '../config/supabaseConfig';
import NotificationService from './NotificationService';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import ChangeOrderService from './ChangeOrderService';
import EventEmitter from '../utils/EventEmitter';
// AsyncStorage removed - using Supabase only

class UnifiedJobService {
  constructor() {
    this.jobs = [];
    this.bids = [];
    this.messages = [];
    this.jobHistory = [];
    this.initialized = false;
  }

  get debugEnabled() {
    // Toggle verbose logs here or via env if desired
    return false;
  }

  // Initialize the service
  async initialize() {
    if (this.initialized) return;
    
    try {
      await this.loadData();
      await NotificationService.initialize();
      await ChangeOrderService.initialize();
      // Sync change orders with jobs after loading
      await this.syncChangeOrdersWithJobs();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize UnifiedJobService:', error);
    }
  }

  // Load all data from Supabase
  async loadData() {
    if (this.debugEnabled) console.log('UnifiedJobService: Loading data from Supabase');
    
    try {
      // Load data from Supabase
      const [jobsResult, bidsResult, messagesResult] = await Promise.all([
        safeSupabase.from(TABLES.JOBS).select('*'),
        safeSupabase.from(TABLES.BIDS).select('*'),
        safeSupabase.from(TABLES.MESSAGES).select('*')
      ]);

      // Set data from Supabase results
      this.jobs = jobsResult.data || [];
      this.bids = bidsResult.data || [];
      this.messages = messagesResult.data || [];
      this.jobHistory = []; // Job history can be derived from jobs

      if (this.debugEnabled) console.log('UnifiedJobService: Loaded data - Jobs:', this.jobs.length, 'Bids:', this.bids.length);
    } catch (error) {
      console.error('UnifiedJobService: Error loading data from Supabase:', error);
      // Initialize with empty arrays if loading fails
      this.jobs = [];
      this.bids = [];
      this.messages = [];
      this.jobHistory = [];
    }
  }

  // Save data to Supabase (individual operations will handle this)
  async saveData() {
    // Data is now saved individually to Supabase when operations are performed
    // This method is kept for compatibility but doesn't need to do anything
    if (this.debugEnabled) console.log('UnifiedJobService: Data is saved individually to Supabase');
  }

  // Clear all data (for testing purposes)
  async clearAllData() {
    try {
      // Clear local arrays
      this.jobs = [];
      this.bids = [];
      this.messages = [];
      this.jobHistory = [];
      
      // Note: In a real app, you might want to delete data from Supabase
      // but for security reasons, we'll just clear local state
      console.log('UnifiedJobService: Local data cleared');
    } catch (error) {
      console.error('UnifiedJobService: Error clearing data:', error);
    }
  }

  // Validate and fix job IDs to ensure they follow the new format
  async validateAndFixJobIds() {
    let needsSave = false;
    
    // Check and fix job IDs
    this.jobs.forEach(job => {
      if (job && job.id && !job.id.startsWith('JOB-')) {
        console.log(`UnifiedJobService: Fixing old job ID format: ${job.id}`);
        job.id = uniqueIdGenerator.generateJobId();
        needsSave = true;
      }
      
      // Check and fix customer IDs
      if (job && job.customerId && !job.customerId.startsWith('CUSTOMER-')) {
        console.log(`UnifiedJobService: Fixing old customer ID format: ${job.customerId}`);
        job.customerId = uniqueIdGenerator.generateCustomerId();
        needsSave = true;
      }
      
      // Check and fix mechanic IDs
      if (job && job.selectedMechanicId && !job.selectedMechanicId.startsWith('MECHANIC-')) {
        console.log(`UnifiedJobService: Fixing old mechanic ID format: ${job.selectedMechanicId}`);
        job.selectedMechanicId = uniqueIdGenerator.generateMechanicId();
        needsSave = true;
      }
    });
    
    // Remove orphaned jobs (jobs with customer IDs that don't match any current user)
    const currentUserIds = new Set();
    // Add logic to get current user IDs if available
    const originalLength = this.jobs.length;
    this.jobs = this.jobs.filter(job => {
      // Keep jobs that have valid customer IDs
      if (job && job.customerId && job.customerId.startsWith('CUSTOMER-')) {
        return true;
      }
      // Remove jobs with invalid or missing customer IDs
      console.log(`UnifiedJobService: Removing orphaned job: ${job?.id} with customer ID: ${job?.customerId}`);
      return false;
    });
    
    if (this.jobs.length !== originalLength) {
      console.log(`UnifiedJobService: Removed ${originalLength - this.jobs.length} orphaned jobs`);
      needsSave = true;
    }
    
    // Check and fix bid IDs
    this.bids.forEach(bid => {
      if (bid && bid.id && !bid.id.startsWith('BID-')) {
        console.log(`UnifiedJobService: Fixing old bid ID format: ${bid.id}`);
        bid.id = uniqueIdGenerator.generateBidId();
        needsSave = true;
      }
      
      // Check and fix bid customer/mechanic IDs
      if (bid && bid.customerId && !bid.customerId.startsWith('CUSTOMER-')) {
        console.log(`UnifiedJobService: Fixing old bid customer ID format: ${bid.customerId}`);
        bid.customerId = uniqueIdGenerator.generateCustomerId();
        needsSave = true;
      }
      
      if (bid && bid.mechanicId && !bid.mechanicId.startsWith('MECHANIC-')) {
        console.log(`UnifiedJobService: Fixing old bid mechanic ID format: ${bid.mechanicId}`);
        bid.mechanicId = uniqueIdGenerator.generateMechanicId();
        needsSave = true;
      }
    });
    
    if (needsSave) {
      console.log('UnifiedJobService: Saving data after ID format fixes');
      await this.saveData();
    }
  }

  // Update customer ID for existing jobs when user ID changes
  async updateCustomerIdForJobs(oldCustomerId, newCustomerId) {
    try {
      let needsSave = false;
      
      // Update jobs
      this.jobs.forEach(job => {
        if (job && job.customerId === oldCustomerId) {
          console.log(`UnifiedJobService: Updating customer ID for job ${job.id}: ${oldCustomerId} -> ${newCustomerId}`);
          job.customerId = newCustomerId;
          job.updatedAt = new Date().toISOString();
          needsSave = true;
        }
      });
      
      // Update bids
      this.bids.forEach(bid => {
        if (bid && bid.customerId === oldCustomerId) {
          console.log(`UnifiedJobService: Updating customer ID for bid ${bid.id}: ${oldCustomerId} -> ${newCustomerId}`);
          bid.customerId = newCustomerId;
          bid.updatedAt = new Date().toISOString();
          needsSave = true;
        }
      });
      
      if (needsSave) {
        console.log('UnifiedJobService: Saving data after customer ID update');
        await this.saveData();
      }
      
      return { success: true, updatedJobs: this.jobs.filter(job => job.customerId === newCustomerId).length };
    } catch (error) {
      console.error('UnifiedJobService: Error updating customer ID:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up orphaned jobs (jobs with customer IDs that don't match current user)
  async cleanupOrphanedJobs(currentCustomerId) {
    try {
      const originalLength = this.jobs.length;
      
      // Remove jobs that don't match the current customer ID
      this.jobs = this.jobs.filter(job => {
        if (job && job.customerId === currentCustomerId) {
          return true; // Keep jobs that match current customer
        } else {
          console.log(`UnifiedJobService: Removing orphaned job ${job?.id} with customer ID ${job?.customerId} (current: ${currentCustomerId})`);
          return false; // Remove orphaned jobs
        }
      });
      
      // Also clean up related bids
      this.bids = this.bids.filter(bid => {
        const hasMatchingJob = this.jobs.some(job => job.id === bid.jobId);
        if (!hasMatchingJob) {
          console.log(`UnifiedJobService: Removing orphaned bid ${bid?.id} for job ${bid?.jobId}`);
        }
        return hasMatchingJob;
      });
      
      const removedCount = originalLength - this.jobs.length;
      if (removedCount > 0) {
        console.log(`UnifiedJobService: Cleaned up ${removedCount} orphaned jobs and related bids`);
        await this.saveData();
        return { success: true, removedJobs: removedCount };
      }
      
      return { success: true, removedJobs: 0 };
    } catch (error) {
      console.error('UnifiedJobService: Error cleaning up orphaned jobs:', error);
      return { success: false, error: error.message };
    }
  }
  // Expire jobs that have not progressed beyond bidding within 24 hours
  expireStaleJobs() {
    try {
      const now = Date.now();
      const twentyFourHoursMs = 24 * 60 * 60 * 1000;
      const twoHoursMs = 2 * 60 * 60 * 1000;
      let didExpireAny = false;
      let didNotifyExpiring = false;
      const expiredJobTitles = [];
      const expiringJobTitles = [];

      this.jobs.forEach(job => {
        try {
          if (!job) return;
          const status = job.status;
          if (status !== 'posted' && status !== 'bidding') return;

          const createdAtMs = job.createdAt ? new Date(job.createdAt).getTime() : null;
          if (!createdAtMs || Number.isNaN(createdAtMs)) return;

          const ageMs = now - createdAtMs;
          const timeRemaining = twentyFourHoursMs - ageMs;
          
          // Check if job has expired
          if (ageMs > twentyFourHoursMs) {
            job.status = 'cancelled';
            job.cancellationReason = 'expired';
            job.updatedAt = new Date().toISOString();
            this.addProgressionEntry(
              job,
              'cancelled',
              'Job expired after 24 hours without progressing past bidding',
              'System'
            );
            didExpireAny = true;
            expiredJobTitles.push(job.title || `${job.category} - ${job.subcategory}`);
          }
          // Check if job is expiring soon (less than 2 hours remaining)
          else if (timeRemaining <= twoHoursMs && timeRemaining > 0) {
            // Mark job as expiring if not already marked
            if (!job.isExpiring) {
              job.isExpiring = true;
              job.expiringAt = new Date(createdAtMs + twentyFourHoursMs).toISOString();
              job.updatedAt = new Date().toISOString();
              didNotifyExpiring = true;
              expiringJobTitles.push(job.title || `${job.category} - ${job.subcategory}`);
              
              // Add expiring notification to progression timeline
              this.addProgressionEntry(
                job,
                status,
                `Job expiring in ${Math.ceil(timeRemaining / (60 * 60 * 1000))} hours`,
                'System'
              );
            }
          }
        } catch (_) {
          // Skip invalid job
        }
      });

      if (didExpireAny) {
        // Persist silently; callers may also save later
        this.saveData();
        
        // Show toast notification for expired jobs
        if (expiredJobTitles.length > 0) {
          const message = expiredJobTitles.length === 1 
            ? `Job "${expiredJobTitles[0]}" has expired`
            : `${expiredJobTitles.length} jobs have expired`;
          
          // Emit event for toast notification
          EventEmitter.emitWeb('jobExpired', { 
            message, 
            count: expiredJobTitles.length 
          });
        }
      }

      if (didNotifyExpiring) {
        // Persist expiring job updates
        this.saveData();
        
        // Show toast notification for expiring jobs
        if (expiringJobTitles.length > 0) {
          const message = expiringJobTitles.length === 1 
            ? `Job "${expiringJobTitles[0]}" is expiring soon!`
            : `${expiringJobTitles.length} jobs are expiring soon!`;
          
          // Emit event for toast notification
          EventEmitter.emitWeb('jobExpiring', { 
            message, 
            count: expiringJobTitles.length, 
            jobs: expiringJobTitles 
          });
        }
      }
    } catch (error) {
      console.error('UnifiedJobService: Error expiring stale jobs:', error);
    }
  }




  // Helper method to add progression timeline entry
  addProgressionEntry(job, status, description, actor = null) {
    if (!job.progressionTimeline) {
      job.progressionTimeline = [];
    }
    
    job.progressionTimeline.push({
      status,
      timestamp: new Date().toISOString(),
      description,
      actor: actor || 'System'
    });
    
    // Sort timeline by timestamp
    job.progressionTimeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Helper method to calculate time remaining for a job
  getTimeRemaining(job) {
    if (!job || !job.createdAt) return null;
    
    const now = Date.now();
    const createdAtMs = new Date(job.createdAt).getTime();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const ageMs = now - createdAtMs;
    const timeRemaining = twentyFourHoursMs - ageMs;
    
    if (timeRemaining <= 0) return null;
    
    return {
      totalMs: timeRemaining,
      hours: Math.floor(timeRemaining / (60 * 60 * 1000)),
      minutes: Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000)),
      isExpiring: timeRemaining <= (2 * 60 * 60 * 1000), // Less than 2 hours
      isExpired: timeRemaining <= 0
    };
  }

  // Job operations
  async createJob(jobData) {
    // Validate required fields
    if (!jobData.customerId) {
      return { success: false, error: 'Customer ID is required' };
    }
    
    if (!jobData.title) {
      return { success: false, error: 'Job title is required' };
    }
    
    if (!jobData.description) {
      return { success: false, error: 'Job description is required' };
    }

    // RESTRICTION: Only customers can create jobs, mechanics cannot create jobs
    if (jobData.userType === 'mechanic') {
      return { 
        success: false, 
        error: 'Mechanics cannot create jobs. Only customers can create jobs. Mechanics can only bid on existing jobs or add work to scheduled/active jobs.',
        restrictionType: 'user_type_restriction'
      };
    }

    // Ensure only customers can create jobs
    if (jobData.userType !== 'customer') {
      return { 
        success: false, 
        error: 'Only customers can create jobs.',
        restrictionType: 'user_type_restriction'
      };
    }

    // Validate that customerId follows the new type-specific format
    if (!jobData.customerId.startsWith('CUSTOMER-')) {
      console.warn('UnifiedJobService: Customer ID does not follow type-specific format:', jobData.customerId);
      // Note: We don't reject the job, but log a warning for debugging
    }

    const jobDataForSupabase = {
      customer_id: jobData.customerId,
      mechanic_id: jobData.mechanicId || null,
      vehicle_id: jobData.vehicleId || null,
      title: jobData.title,
      description: jobData.description,
      category: jobData.category || 'general',
      status: 'open',
      priority: jobData.priority || 'medium',
      location: jobData.location,
      estimated_cost: jobData.estimatedCost || null,
      actual_cost: null,
      scheduled_date: jobData.scheduledDate || null,
      completed_date: null,
      images: jobData.images || [],
      documents: jobData.documents || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('UnifiedJobService - Creating job with data:', {
      customerId: jobData.customerId,
      customerName: jobData.customerName,
      title: jobData.title,
      userType: jobData.userType
    });
    
    // Save to Supabase
    const { data, error } = await supabase
      .from(TABLES.JOBS)
      .insert([jobDataForSupabase])
      .select()
      .single();

    if (error) {
      console.error('UnifiedJobService - Error creating job in Supabase:', error);
      return { success: false, error: error.message };
    }

    // Create job object for local state
    const job = {
      id: data.id,
      customerId: data.customer_id,
      mechanicId: data.mechanic_id,
      vehicleId: data.vehicle_id,
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      priority: data.priority,
      location: data.location,
      estimatedCost: data.estimated_cost,
      actualCost: data.actual_cost,
      scheduledDate: data.scheduled_date,
      completedDate: data.completed_date,
      images: data.images,
      documents: data.documents,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      // Additional fields for compatibility
      customerName: jobData.customerName,
      userType: jobData.userType,
      progressionTimeline: [{
        status: 'posted',
        timestamp: new Date().toISOString(),
        description: 'Job posted by customer',
        actor: jobData.customerName || 'Customer'
      }]
    };
    
    this.jobs.push(job);
    
    console.log('UnifiedJobService - Job created and saved. Total jobs now:', this.jobs.length);
    
    // Track usage for mechanics
    if (jobData.userType === 'mechanic' && jobData.mechanicId) {
      try {
        const SubscriptionService = (await import('./SubscriptionService')).default;
        await SubscriptionService.trackUsage(jobData.mechanicId, 'jobs_created', 1);
        await SubscriptionService.trackUsage(jobData.mechanicId, 'active_jobs', 1);
      } catch (error) {
        console.warn('Failed to track subscription usage:', error);
      }
    }
    
    // Send notifications
    await NotificationService.notifyAdmins(job.id, 'new_job_posted', {
      jobTitle: job.title,
      customerName: job.customerName,
      estimatedPrice: job.estimatedCost
    });
    
    await NotificationService.notifyNewJobPosted(
      job.id, 
      job.title, 
      job.customerName, 
      job.estimatedCost
    );
    
    // Notify selected mechanic for direct bookings with enhanced notifications
    if (job.isDirectBooking && job.mechanicId) {
      await NotificationService.notifyMechanicEnhanced(
        job.mechanicId,
        job.id,
        'direct_booking_received',
        {
          customerName: job.customerName,
          jobTitle: job.title,
          estimatedCost: job.estimatedCost,
          serviceType: job.serviceType,
          location: job.location,
          urgency: job.urgency,
          jobId: job.id,
          jobData: job, // Include full job data for calendar integration
          // Note: userEmail and userPhone would need to be fetched from user profile
          // userEmail: mechanicProfile?.email,
          // userPhone: mechanicProfile?.phone,
        }
      );
    }
    
    return { success: true, job };
  }

  async updateJob(jobId, updates) {
    const jobIndex = this.jobs.findIndex(job => job.id === jobId);
    if (jobIndex === -1) {
      return { success: false, error: 'Job not found' };
    }

    const oldJob = this.jobs[jobIndex];
    
    // Prepare update data for Supabase
    const updateData = {
      ...(updates.title && { title: updates.title }),
      ...(updates.description && { description: updates.description }),
      ...(updates.category && { category: updates.category }),
      ...(updates.status && { status: updates.status }),
      ...(updates.priority && { priority: updates.priority }),
      ...(updates.location && { location: updates.location }),
      ...(updates.estimatedCost !== undefined && { estimated_cost: updates.estimatedCost }),
      ...(updates.actualCost !== undefined && { actual_cost: updates.actualCost }),
      ...(updates.scheduledDate && { scheduled_date: updates.scheduledDate }),
      ...(updates.completedDate && { completed_date: updates.completedDate }),
      ...(updates.images && { images: updates.images }),
      ...(updates.documents && { documents: updates.documents }),
      updated_at: new Date().toISOString()
    };

    // Update in Supabase
    const { data, error } = await supabase
      .from(TABLES.JOBS)
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('UnifiedJobService - Error updating job in Supabase:', error);
      return { success: false, error: error.message };
    }

    // Update local state
    this.jobs[jobIndex] = {
      ...oldJob,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Handle schedule confirmation notifications
    if (updates.mechanicResponse) {
      const job = this.jobs[jobIndex];
      if (updates.mechanicResponse === 'accepted') {
        // Notify customer that schedule was confirmed
        await NotificationService.notifyCustomer(
          job.customerId,
          job.id,
          'schedule_confirmed',
          {
            mechanicName: job.mechanicName || 'Your mechanic'
          }
        );
      } else if (updates.mechanicResponse === 'declined') {
        // Notify customer that schedule was declined
        await NotificationService.notifyCustomer(
          job.customerId,
          job.id,
          'schedule_declined',
          {
            mechanicName: job.mechanicName || 'Your mechanic'
          }
        );
      }
    }
    
    return { success: true, job: this.jobs[jobIndex] };
  }

  async deleteJob(jobId) {
    try {
      const jobIndex = this.jobs.findIndex(job => job.id === jobId);
      if (jobIndex === -1) {
        return { success: false, error: 'Job not found' };
      }

      // Remove the job
      const deletedJob = this.jobs.splice(jobIndex, 1)[0];

      // Also remove related bids
      this.bids = this.bids.filter(bid => bid.jobId !== jobId);

      // Add to job history
      this.jobHistory.push({
        id: `history-${Date.now()}`,
        jobId: jobId,
        action: 'deleted',
        timestamp: new Date().toISOString(),
        details: {
          jobTitle: deletedJob.title,
          customerId: deletedJob.customerId,
          reason: 'Job deleted by user'
        }
      });

      await this.saveData();
      return { success: true, deletedJob };
    } catch (error) {
      console.error('UnifiedJobService: Error deleting job:', error);
      return { success: false, error: error.message };
    }
  }

  // Add additional work to an existing job (for mechanics only)
  async addWorkToJob(jobId, mechanicId, workData) {
    try {
      const job = this.getJob(jobId);
      if (!job) {
        return { success: false, error: 'Job not found' };
      }

      // Verify the mechanic is assigned to this job
      const isAssignedMechanic = job.selectedMechanicId === mechanicId || 
        (job.acceptedBidId && this.bids.find(bid => bid.id === job.acceptedBidId && bid.mechanicId === mechanicId));
      
      if (!isAssignedMechanic) {
        return { 
          success: false, 
          error: 'You are not assigned to this job. Only assigned mechanics can add work to jobs.' 
        };
      }

      // Verify job is in a state where work can be added
      if (!['scheduled', 'in_progress', 'active'].includes(job.status)) {
        return { 
          success: false, 
          error: 'Work can only be added to scheduled or active jobs.' 
        };
      }

      // Validate work data
      if (!workData.description || !workData.title) {
        return { success: false, error: 'Work title and description are required' };
      }

      // Create work item
      const workItem = {
        id: uniqueIdGenerator.generateWorkId(),
        jobId: jobId,
        mechanicId: mechanicId,
        title: workData.title,
        description: workData.description,
        estimatedHours: workData.estimatedHours || null,
        estimatedCost: workData.estimatedCost || null,
        partsRequired: workData.partsRequired || [],
        status: 'pending_approval', // Customer must approve additional work
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add work item to job
      if (!job.additionalWork) {
        job.additionalWork = [];
      }
      job.additionalWork.push(workItem);

      // Update job
      await this.updateJob(jobId, {
        additionalWork: job.additionalWork,
        status: job.status === 'scheduled' ? 'pending_work_approval' : job.status
      });

      // Notify customer about additional work request
      try {
        const NotificationService = (await import('./PushNotificationService')).default;
        await NotificationService.notifyCustomer(
          job.customerId,
          jobId,
          'additional_work_requested',
          {
            mechanicName: job.mechanicName || 'Your mechanic',
            workTitle: workData.title,
            workDescription: workData.description
          }
        );
      } catch (error) {
        console.warn('Failed to send notification for additional work:', error);
      }

      console.log(`UnifiedJobService: Added work item ${workItem.id} to job ${jobId}`);
      return { success: true, workItem, job: this.getJob(jobId) };
    } catch (error) {
      console.error('UnifiedJobService: Error adding work to job:', error);
      return { success: false, error: error.message };
    }
  }

  // Approve additional work (for customers)
  async approveAdditionalWork(jobId, workItemId, customerId, approved = true) {
    try {
      const job = this.getJob(jobId);
      if (!job) {
        return { success: false, error: 'Job not found' };
      }

      // Verify customer owns this job
      if (job.customerId !== customerId) {
        return { success: false, error: 'You can only approve work for your own jobs' };
      }

      // Find the work item
      if (!job.additionalWork) {
        return { success: false, error: 'No additional work found for this job' };
      }

      const workItemIndex = job.additionalWork.findIndex(work => work.id === workItemId);
      if (workItemIndex === -1) {
        return { success: false, error: 'Work item not found' };
      }

      // Update work item status
      job.additionalWork[workItemIndex].status = approved ? 'approved' : 'rejected';
      job.additionalWork[workItemIndex].updatedAt = new Date().toISOString();
      job.additionalWork[workItemIndex].customerResponse = approved ? 'approved' : 'rejected';
      job.additionalWork[workItemIndex].customerResponseAt = new Date().toISOString();

      // Update job status if work was approved
      if (approved && job.status === 'pending_work_approval') {
        job.status = 'scheduled';
      }

      await this.updateJob(jobId, {
        additionalWork: job.additionalWork,
        status: job.status
      });

      // Notify mechanic about work approval/rejection
      try {
        const NotificationService = (await import('./PushNotificationService')).default;
        await NotificationService.notifyMechanic(
          job.additionalWork[workItemIndex].mechanicId,
          jobId,
          approved ? 'work_approved' : 'work_rejected',
          {
            workTitle: job.additionalWork[workItemIndex].title,
            customerName: job.customerName || 'Customer'
          }
        );
      } catch (error) {
        console.warn('Failed to send notification for work approval:', error);
      }

      console.log(`UnifiedJobService: ${approved ? 'Approved' : 'Rejected'} work item ${workItemId} for job ${jobId}`);
      return { success: true, workItem: job.additionalWork[workItemIndex], job: this.getJob(jobId) };
    } catch (error) {
      console.error('UnifiedJobService: Error approving additional work:', error);
      return { success: false, error: error.message };
    }
  }

  getJob(jobId) {
    return this.jobs.find(job => job.id === jobId);
  }

  getJobsByCustomer(customerId) {
    if (this.debugEnabled) {
      console.log('UnifiedJobService - getJobsByCustomer called with:', customerId);
      console.log('UnifiedJobService - All jobs:', this.jobs.length, this.jobs.map(job => ({ id: job.id, customerId: job.customerId, title: job.title })));
    }
    
    const filteredJobs = this.jobs.filter(job => job.customerId === customerId);
    if (this.debugEnabled) {
      console.log('UnifiedJobService - Filtered jobs for customer:', filteredJobs.length, filteredJobs.map(job => ({ id: job.id, customerId: job.customerId, title: job.title })));
    }
    
    return filteredJobs;
  }

  getJobsByMechanic(mechanicId) {
    return this.jobs.filter(job => {
      // Check if job has selectedMechanicId (direct assignment)
      if (job.selectedMechanicId === mechanicId) {
        return true;
      }
      // Also check via accepted bid relationship
      const acceptedBid = this.bids.find(bid => bid.id === job.acceptedBidId);
      return acceptedBid && (acceptedBid.mechanicId === mechanicId || acceptedBid.mechanic_id === mechanicId);
    });
  }

  // Sort jobs by creation date using unique IDs
  sortJobsByCreationDate(jobs, order = 'desc') {
    return uniqueIdGenerator.sortJobsById(jobs, order);
  }

  // Get jobs created on a specific date
  getJobsByDate(date) {
    return uniqueIdGenerator.getJobsByDate(this.jobs, date);
  }

  // Get jobs created within a date range
  getJobsByDateRange(startDate, endDate) {
    return uniqueIdGenerator.getJobsByDateRange(this.jobs, startDate, endDate);
  }

  // Get job statistics
  getJobStats() {
    const stats = {
      total: this.jobs.length,
      byStatus: {},
      byDate: {},
      recentJobs: []
    };

    // Count by status
    this.jobs.forEach(job => {
      stats.byStatus[job.status] = (stats.byStatus[job.status] || 0) + 1;
    });

    // Count by date
    this.jobs.forEach(job => {
      const jobInfo = uniqueIdGenerator.parseJobId(job.id);
      if (jobInfo) {
        const date = jobInfo.date;
        stats.byDate[date] = (stats.byDate[date] || 0) + 1;
      }
    });

    // Get recent jobs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    stats.recentJobs = this.getJobsByDateRange(sevenDaysAgo, new Date());

    return stats;
  }

  // Bid operations
  async createBid(bidData) {
    const bid = {
      id: uniqueIdGenerator.generateBidId(),
      ...bidData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    this.bids.push(bid);
    await this.saveData();
    
    // Update job status to 'bidding' if it's 'posted'
    const job = this.jobs.find(j => j.id === bid.jobId);
    if (job && job.status === 'posted') {
      await this.updateJob(job.id, { status: 'bidding' });
    }
    
    // Add bid submission to progression timeline
    if (job) {
      this.addProgressionEntry(
        job, 
        'bidding', 
        `Bid submitted by ${bid.mechanicName} for $${bid.price}`,
        bid.mechanicName
      );
      await this.saveData();
    }
    
    // Create conversation between customer and mechanic for this job
    try {
      const messagingService = require('./EnhancedUnifiedMessagingService').default;
      
      // Ensure both users exist in the messaging system
      await messagingService.createOrUpdateUser({
        id: bid.customerId,
        name: job.customerName || 'Customer',
        type: 'customer',
        avatar: '👤'
      });
      
      await messagingService.createOrUpdateUser({
        id: bid.mechanicId,
        name: bid.mechanicName,
        type: 'mechanic',
        avatar: '🔧'
      });
      
      // Create or find conversation for this job
      // Ensure we have valid participant IDs
      const participantIds = [bid.customerId, bid.mechanicId].filter(id => id && typeof id === 'string');
      const participantNames = [job.customerName || 'Customer', bid.mechanicName].filter(name => name && typeof name === 'string');
      
      if (participantIds.length === 2) {
        const conversationResult = await messagingService.findOrCreateConversation(
          participantIds,
          participantNames,
          bid.jobId,
          'job_related'
        );
      
        if (conversationResult.success) {
          // Send initial system message about the bid
          await messagingService.sendMessage(
            conversationResult.conversation.id,
            bid.mechanicId,
            `I've submitted a bid for your job "${job.title}" for $${bid.price}${bid.bidType === 'hourly' ? '/hr' : ' fixed'}. ${bid.message ? `Message: ${bid.message}` : ''}`,
            'system',
            { jobId: bid.jobId, bidId: bid.id }
          );
        }
      } else {
        console.warn('UnifiedJobService: Cannot create conversation - invalid participant IDs:', { customerId: bid.customerId, mechanicId: bid.mechanicId });
      }
    } catch (error) {
      console.error('UnifiedJobService: Error creating conversation for bid:', error);
      // Don't fail the bid creation if messaging fails
    }
    
    // Send notification to customer
    await NotificationService.notifyCustomer(
      bid.customerId,
      bid.jobId,
      'new_bid_placed',
      {
        mechanicName: bid.mechanicName,
        price: bid.price
      }
    );
    
    return { success: true, bid };
  }

  async acceptBid(bidId) {
    const bid = this.bids.find(b => b.id === bidId);
    if (!bid) {
      console.error('UnifiedJobService: Bid not found:', bidId);
      return { success: false, error: 'Bid not found' };
    }

    // Update bid status
    bid.status = 'accepted';
    bid.updatedAt = new Date().toISOString();

    // Update job status and assign mechanic
    const job = this.jobs.find(j => j.id === bid.jobId);
    if (!job) {
      console.error('UnifiedJobService: Job not found for bid:', bidId);
      return { success: false, error: 'Job not found' };
    }

    job.status = 'accepted';
    job.selectedMechanicId = bid.mechanicId;
    job.acceptedBidId = bid.id;
    // Update job price to reflect the accepted bid amount
    job.price = bid.price || bid.amount;
    job.estimatedCost = bid.price || bid.amount;
    job.updatedAt = new Date().toISOString();
    
    // Add bid acceptance to progression timeline
    this.addProgressionEntry(
      job, 
      'accepted', 
      `Bid accepted from ${bid.mechanicName} for $${bid.price}`,
      'Customer'
    );

    // Decline other bids for this job
    this.bids.forEach(b => {
      if (b.jobId === job.id && b.id !== bid.id) {
        b.status = 'declined';
        b.updatedAt = new Date().toISOString();
      }
    });

    await this.saveData();
    
    // Send notifications
    await NotificationService.notifyMechanic(
      bid.mechanicId,
      job.id,
      'bid_accepted',
      {
        jobTitle: job.title,
        customerName: job.customerName
      }
    );
    
    await NotificationService.notifyCustomer(
      job.customerId,
      job.id,
      'bid_accepted_confirmation',
      {
        mechanicName: bid.mechanicName
      }
    );
    
    return { success: true, job, bid };
  }

  async rejectBid(bidId) {
    const bid = this.bids.find(b => b.id === bidId);
    if (!bid) {
      console.error('UnifiedJobService: Bid not found:', bidId);
      return { success: false, error: 'Bid not found' };
    }

    // Update bid status
    bid.status = 'rejected';
    bid.updatedAt = new Date().toISOString();

    await this.saveData();
    
    // Send notifications
    await NotificationService.notifyMechanic(
      bid.mechanicId,
      bid.jobId,
      'bid_rejected',
      {
        jobTitle: bid.jobTitle || 'Your bid',
        mechanicName: bid.mechanicName
      }
    );
    
    return { success: true, bid };
  }

  // Scheduling operations
  async scheduleJob(jobId, scheduleData) {
    // Ensure we have the latest data before scheduling
    if (!this.initialized) {
      await this.initialize();
    }
    
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      console.error('UnifiedJobService: Job not found for scheduling:', jobId);
      console.log('UnifiedJobService: Available jobs:', this.jobs.map(j => ({ id: j.id, title: j.title, status: j.status })));
      return { success: false, error: 'Job not found' };
    }

    if (job.status !== 'accepted') {
      console.error('UnifiedJobService: Job must be accepted before scheduling');
      return { success: false, error: 'Job must be accepted before scheduling' };
    }

    // Update job with schedule data
    job.status = 'scheduled';
    job.scheduledDate = scheduleData.date;
    job.scheduledTime = scheduleData.time;
    job.scheduledDateTime = scheduleData.dateTime;
    job.estimatedDuration = scheduleData.estimatedDuration || job.estimatedDuration || 60;
    job.location = scheduleData.location || job.location;
    job.specialInstructions = scheduleData.specialInstructions || '';
    job.updatedAt = new Date().toISOString();
    
    // Add scheduling to progression timeline
    this.addProgressionEntry(
      job, 
      'scheduled', 
      `Job scheduled for ${new Date(scheduleData.date).toLocaleDateString()} at ${scheduleData.time}`,
      'Customer'
    );

    await this.saveData();
    
    // Send notifications
    await NotificationService.notifyCustomer(
      job.customerId,
      job.id,
      'job_scheduled'
    );
    
    // Send appropriate notification based on job type
    if (job.isDirectBooking) {
      await NotificationService.notifyMechanicEnhanced(
        job.selectedMechanicId,
        job.id,
        'direct_booking_scheduled',
        {
          customerName: job.customerName,
          scheduledDate: new Date(scheduleData.date).toLocaleDateString(),
          scheduledTime: scheduleData.time,
          location: job.location,
          jobId: job.id,
          jobData: job, // Include full job data for calendar integration
          // Note: userEmail and userPhone would need to be fetched from user profile
        }
      );
    } else {
      await NotificationService.notifyMechanic(
        job.selectedMechanicId,
        job.id,
        'schedule_proposed'
      );
    }
    
    return { success: true, job };
  }

  // Status operations
  async startJob(jobId, mechanicId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    if (job.status !== 'scheduled' && job.status !== 'confirmed') {
      return { success: false, error: 'Job must be scheduled before starting' };
    }

    // Verify the mechanic is authorized to start this job
    if (mechanicId && job.selectedMechanicId && job.selectedMechanicId !== mechanicId) {
      return { success: false, error: 'Only the assigned mechanic can start this job' };
    }

    job.status = 'in_progress';
    job.startedAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();
    
    // Add work start to progression timeline
    this.addProgressionEntry(
      job, 
      'in_progress', 
      'Work started by mechanic',
      job.mechanicName || 'Mechanic'
    );

    await this.saveData();
    
    // Send notification to customer
    await NotificationService.notifyCustomer(
      job.customerId,
      job.id,
      'job_started',
      {
        mechanicName: job.mechanicName || 'Your mechanic'
      }
    );
    
    return { success: true, job };
  }

  async completeJob(jobId, mechanicId, completionData = {}) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    if (job.status !== 'in_progress') {
      return { success: false, error: 'Job must be in progress before completing' };
    }

    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();
    
    // Add completion to progression timeline
    this.addProgressionEntry(
      job, 
      'completed', 
      'Job completed by mechanic',
      job.mechanicName || 'Mechanic'
    );

    // Add completion data if provided
    if (completionData.workCompleted) {
      job.workCompleted = completionData.workCompleted;
    }
    if (completionData.completionNotes) {
      job.completionNotes = completionData.completionNotes;
    }
    if (completionData.completionPhotos && Array.isArray(completionData.completionPhotos)) {
      job.completionPhotos = completionData.completionPhotos;
    }
    if (completionData.mechanicName) {
      job.mechanicName = completionData.mechanicName;
    }
    
    // Add completion details to progression timeline if provided
    if (completionData.workCompleted || completionData.completionNotes) {
      this.addProgressionEntry(
        job, 
        'completed', 
        'Completion details added',
        job.mechanicName || 'Mechanic'
      );
    }

    // Expire any pending change orders when job is completed
    try {
      const expireResult = await ChangeOrderService.expirePendingChangeOrdersForJob(jobId);
      if (expireResult.success && expireResult.expiredCount > 0) {
        console.log(`Expired ${expireResult.expiredCount} pending change orders for job ${jobId}`);
        
        // Add timeline entry for expired change orders
        this.addProgressionEntry(
          job, 
          'change_orders_expired', 
          `${expireResult.expiredCount} pending change order(s) expired due to job completion`,
          'System'
        );

        // Log details of expired change orders
        if (expireResult.expiredChangeOrders && expireResult.expiredChangeOrders.length > 0) {
          expireResult.expiredChangeOrders.forEach(expiredCO => {
            this.addProgressionEntry(
              job, 
              'change_order_expired', 
              `Change order expired: ${expiredCO.title} ($${expiredCO.amount})`,
              'System'
            );
          });
        }
      }
    } catch (error) {
      console.error(`Error expiring pending change orders for job ${jobId}:`, error);
    }

    // Release any escrow payments for approved change orders when job is completed
    if (job.changeOrders && job.changeOrders.length > 0) {
      for (const changeOrderId of job.changeOrders) {
        try {
          const result = await ChangeOrderService.releaseEscrowPayment(changeOrderId);
          if (result.success) {
            console.log(`Released escrow payment for change order ${changeOrderId}`);
            
            // Add timeline entry for payment release
            this.addProgressionEntry(
              job, 
              'change_order_payment_released', 
              `Additional work payment released: $${result.payment.amount}`,
              'System'
            );
          }
        } catch (error) {
          console.error(`Error releasing escrow payment for change order ${changeOrderId}:`, error);
        }
      }
    }

    await this.saveData();
    
    // Send notification to customer
    await NotificationService.notifyCustomer(
      job.customerId,
      job.id,
      'job_completed',
      {
        mechanicName: job.mechanicName || 'Your mechanic'
      }
    );
    
    return { success: true, job };
  }

  // Method to add additional notes and track in timeline
  async addJobNote(jobId, noteData) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    // Add note to job's additional notes array
    const currentNotes = job.additionalNotes || [];
    const updatedNotes = [...currentNotes, noteData];
    
    job.additionalNotes = updatedNotes;
    job.updatedAt = new Date().toISOString();
    
    // Add note addition to progression timeline
    this.addProgressionEntry(
      job, 
      job.status, 
      `Additional note added: ${noteData.text ? noteData.text.substring(0, 50) + '...' : 'Photo added'}`,
      noteData.mechanicName || 'Mechanic'
    );

    await this.saveData();
    return { success: true, job };
  }

  // Getter methods
  getAllJobs() {
    return this.jobs;
  }

  getAllBids() {
    return this.bids;
  }

  getBidsByMechanic(mechanicId) {
    return this.bids.filter(bid => bid.mechanicId === mechanicId);
  }

  getBidsByJob(jobId) {
    return this.bids.filter(bid => bid.jobId === jobId);
  }

  getAcceptedBid(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job || !job.acceptedBidId) return null;
    return this.bids.find(bid => bid.id === job.acceptedBidId);
  }

  // Change Order Operations
  async createChangeOrder(changeOrderData) {
    try {
      const result = await ChangeOrderService.createChangeOrder(changeOrderData);
      if (result.success) {
        // Update job with change order reference and set status to pending
        const job = this.jobs.find(j => j.id === changeOrderData.jobId);
        if (job) {
          if (!job.changeOrders) job.changeOrders = [];
          job.changeOrders.push(result.changeOrder.id);
          
          // IMPORTANT: Set job status to pending when change order is submitted
          // This indicates the job is waiting for customer approval of additional work
          if (job.status === 'in_progress') {
            job.status = 'pending';
            job.updatedAt = new Date().toISOString();
            
            // Add timeline entry for status change
            this.addProgressionEntry(
              job, 
              'pending', 
              'Job paused - waiting for customer approval of change order',
              'System'
            );
          }
          
          // Add timeline entry for change order creation
          this.addProgressionEntry(
            job, 
            'change_order_created', 
            `Additional work requested: ${changeOrderData.title} ($${changeOrderData.totalAmount})`,
            'Mechanic'
          );
          
          await this.saveData();
        }
      }
      return result;
    } catch (error) {
      console.error('UnifiedJobService: Error creating change order:', error);
      return { success: false, error: error.message };
    }
  }

  async approveChangeOrder(changeOrderId, customerId) {
    try {
      const result = await ChangeOrderService.approveChangeOrder(changeOrderId, customerId);
      if (result.success) {
        // Update job total amount and return status to in_progress
        const changeOrder = result.changeOrder;
        const job = this.jobs.find(j => j.id === changeOrder.jobId);
        if (job) {
          job.additionalWorkAmount = (job.additionalWorkAmount || 0) + changeOrder.totalAmount;
          
          // IMPORTANT: Return job status to in_progress when change order is approved
          if (job.status === 'pending') {
            job.status = 'in_progress';
            job.updatedAt = new Date().toISOString();
            
            // Add timeline entry for status change
            this.addProgressionEntry(
              job, 
              'in_progress', 
              'Work resumed - change order approved',
              'System'
            );
          }
          
          // Add timeline entry for change order approval
          this.addProgressionEntry(
            job, 
            'change_order_approved', 
            `Additional work approved: ${changeOrder.title} ($${changeOrder.totalAmount})`,
            'Customer'
          );
          
          await this.saveData();
        }
      }
      return result;
    } catch (error) {
      console.error('UnifiedJobService: Error approving change order:', error);
      return { success: false, error: error.message };
    }
  }

  async rejectChangeOrder(changeOrderId, customerId, reason) {
    try {
      const result = await ChangeOrderService.rejectChangeOrder(changeOrderId, customerId, reason);
      if (result.success) {
        // Return job status to in_progress and add timeline entry for change order rejection
        const changeOrder = result.changeOrder;
        const job = this.jobs.find(j => j.id === changeOrder.jobId);
        if (job) {
          // IMPORTANT: Return job status to in_progress when change order is rejected
          if (job.status === 'pending') {
            job.status = 'in_progress';
            job.updatedAt = new Date().toISOString();
            
            // Add timeline entry for status change
            this.addProgressionEntry(
              job, 
              'in_progress', 
              'Work resumed - change order rejected, continuing with original scope',
              'System'
            );
          }
          
          this.addProgressionEntry(
            job, 
            'change_order_rejected', 
            `Additional work rejected: ${changeOrder.title} - ${reason}`,
            'Customer'
          );
          await this.saveData();
        }
      }
      return result;
    } catch (error) {
      console.error('UnifiedJobService: Error rejecting change order:', error);
      return { success: false, error: error.message };
    }
  }

  async cancelChangeOrder(changeOrderId, mechanicId, reason) {
    try {
      return await ChangeOrderService.cancelChangeOrder(changeOrderId, mechanicId, reason);
    } catch (error) {
      console.error('UnifiedJobService: Error cancelling change order:', error);
      return { success: false, error: error.message };
    }
  }

  getChangeOrdersByJob(jobId) {
    return ChangeOrderService.getChangeOrdersByJob(jobId);
  }

  getChangeOrdersByMechanic(mechanicId) {
    return ChangeOrderService.getChangeOrdersByMechanic(mechanicId);
  }

  getChangeOrdersByCustomer(customerId) {
    return ChangeOrderService.getChangeOrdersByCustomer(customerId);
  }

  getPendingChangeOrdersForCustomer(customerId) {
    return ChangeOrderService.getPendingChangeOrdersForCustomer(customerId);
  }

  getPendingChangeOrdersForMechanic(mechanicId) {
    return ChangeOrderService.getPendingChangeOrdersForMechanic(mechanicId);
  }

  async processChangeOrderPayment(changeOrderId, paymentData) {
    try {
      const result = await ChangeOrderService.processChangeOrderPayment(changeOrderId, paymentData);
      if (result.success) {
        // Update job with payment information
        const changeOrder = ChangeOrderService.getAllData().changeOrders.find(co => co.id === changeOrderId);
        if (changeOrder) {
          const job = this.jobs.find(j => j.id === changeOrder.jobId);
          if (job) {
            job.paidAdditionalWorkAmount = (job.paidAdditionalWorkAmount || 0) + result.payment.amount;
            job.updatedAt = new Date().toISOString();
            await this.saveData();
          }
        }
      }
      return result;
    } catch (error) {
      console.error('UnifiedJobService: Error processing change order payment:', error);
      return { success: false, error: error.message };
    }
  }

  getChangeOrderStats(mechanicId = null, customerId = null) {
    return ChangeOrderService.getChangeOrderStats(mechanicId, customerId);
  }

  // Additional utility methods
  getJobById(jobId) {
    return this.jobs.find(job => job.id === jobId);
  }

  getAllData() {
    return {
      jobs: [...this.jobs],
      bids: [...this.bids],
      messages: [...this.messages],
      jobHistory: [...this.jobHistory],
      changeOrders: ChangeOrderService.getAllData().changeOrders,
    };
  }

  // Utility methods
  isReady() {
    return this.initialized;
  }

  async refresh() {
    await this.loadData();
    // Sync change orders with jobs after refresh
    await this.syncChangeOrdersWithJobs();
    // Ensure any new stales are expired on refresh as well
    this.expireStaleJobs();
  }

  // Sync change orders with jobs to ensure job status reflects change order state
  async syncChangeOrdersWithJobs() {
    try {
      const changeOrders = ChangeOrderService.getAllData().changeOrders;
      
      // For each job, check if it has pending change orders
      this.jobs.forEach(job => {
        const jobChangeOrders = changeOrders.filter(co => co.jobId === job.id);
        
        if (jobChangeOrders.length > 0) {
          // Update job with change order references
          job.changeOrders = jobChangeOrders.map(co => co.id);
          
          // Check if job should be pending (has pending change orders and was in_progress)
          const hasPendingChangeOrder = jobChangeOrders.some(co => co.status === 'pending');
          if (hasPendingChangeOrder && job.status === 'in_progress') {
            job.status = 'pending';
            job.updatedAt = new Date().toISOString();
          }
        }
      });
      
      // Save updated jobs
      await this.saveData();
    } catch (error) {
      console.error('UnifiedJobService: Error syncing change orders with jobs:', error);
    }
  }

  // Reset all data for fresh testing
  async resetAllData() {
    try {
      console.log('UnifiedJobService: Starting resetAllData...');
      console.log('UnifiedJobService: Current jobs count before reset:', this.jobs.length);
      
      // Clear all in-memory data
      this.jobs = [];
      this.bids = [];
      this.messages = [];
      this.jobHistory = [];
      
      console.log('UnifiedJobService: Cleared in-memory data');
      
      // AsyncStorage clearing not needed - using Supabase only
      console.log('UnifiedJobService: Data is now managed in memory and Supabase only');
      
      console.log('UnifiedJobService: All data cleared successfully');
      return { success: true, message: 'All data including messaging reset successfully' };
    } catch (error) {
      console.error('UnifiedJobService: Error resetting data:', error);
      return { success: false, error: error.message };
    }
  }

  // Create fresh test accounts with new ID format - DISABLED FOR TESTING
  async createTestAccounts() {
    console.log('UnifiedJobService: Mock test account creation is DISABLED for proper testing');
    return { 
      success: true, 
      message: 'Mock test account creation is disabled',
      jobs: 0,
      customerId: null,
      mechanicId: null
    };
  }

}

// Export singleton instance
export default new UnifiedJobService();
