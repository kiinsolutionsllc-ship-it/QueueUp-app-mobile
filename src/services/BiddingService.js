import { supabase } from '../config/supabase';

class BiddingService {
  // Submit a bid for a job
  async submitBid(jobId, mechanicId, bidData) {
    try {
      const { data, error } = await supabase
        .from('bids')
        .insert([
          {
            job_id: jobId,
            mechanic_id: mechanicId,
            amount: bidData.amount,
            message: bidData.message,
            estimated_duration: bidData.estimatedDuration,
            estimated_start_date: bidData.estimatedStartDate,
            status: 'pending',
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error submitting bid:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all bids for a specific job
  async getJobBids(jobId) {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          mechanic:mechanics(
            id,
            name,
            rating,
            review_count,
            profile_image,
            specialties,
            location,
            years_experience
          )
        `)
        .eq('job_id', jobId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching job bids:', error);
      return { success: false, error: error.message };
    }
  }

  // Get bids submitted by a specific mechanic
  async getMechanicBids(mechanicId) {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          job:jobs(
            id,
            title,
            description,
            category,
            subcategory,
            status,
            customer_id,
            customer_name,
            vehicle_info,
            location,
            estimated_duration,
            created_at
          )
        `)
        .eq('mechanic_id', mechanicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching mechanic bids:', error);
      return { success: false, error: error.message };
    }
  }

  // Update bid status (accept, reject, withdraw)
  async updateBidStatus(bidId, status, reason = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (reason) {
        updateData.reason = reason;
      }

      const { data, error } = await supabase
        .from('bids')
        .update(updateData)
        .eq('id', bidId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating bid status:', error);
      return { success: false, error: error.message };
    }
  }

  // Accept a bid (customer selects a mechanic)
  async acceptBid(bidId, jobId) {
    try {
      // Start a transaction-like operation
      // 1. Update the bid status to accepted
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', bidId)
        .select()
        .single();

      if (bidError) throw bidError;

      // 2. Reject all other bids for this job
      const { error: rejectError } = await supabase
        .from('bids')
        .update({
          status: 'rejected',
          reason: 'Another bid was selected',
          updated_at: new Date().toISOString(),
        })
        .eq('job_id', jobId)
        .neq('id', bidId);

      if (rejectError) throw rejectError;

      // 3. Update job status to accepted
      const { error: jobError } = await supabase
        .from('jobs')
        .update({
          status: 'accepted',
          selected_mechanic_id: bidData.mechanic_id,
          accepted_bid_id: bidId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (jobError) throw jobError;

      return { success: true, data: bidData };
    } catch (error) {
      console.error('Error accepting bid:', error);
      return { success: false, error: error.message };
    }
  }

  // Withdraw a bid (mechanic withdraws their bid)
  async withdrawBid(bidId) {
    try {
      const { data, error } = await supabase
        .from('bids')
        .update({
          status: 'withdrawn',
          withdrawn_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', bidId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error withdrawing bid:', error);
      return { success: false, error: error.message };
    }
  }

  // Get bid statistics for a mechanic
  async getMechanicBidStats(mechanicId) {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('status')
        .eq('mechanic_id', mechanicId);

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(bid => bid.status === 'pending').length,
        accepted: data.filter(bid => bid.status === 'accepted').length,
        rejected: data.filter(bid => bid.status === 'rejected').length,
        withdrawn: data.filter(bid => bid.status === 'withdrawn').length,
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching bid stats:', error);
      return { success: false, error: error.message };
    }
  }

}

export default new BiddingService();

