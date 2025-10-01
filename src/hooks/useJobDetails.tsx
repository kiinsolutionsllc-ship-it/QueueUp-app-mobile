import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Alert, Share, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Job,
  JobStatus,
  JobUrgency,
  Vehicle,
  Address,
  JobAction,
  StatusConfig,
  JobTimelineEvent,
  JobNote,
  LoadingState,
  UseJobDetailsReturn,
} from '../types/JobDetailsTypes';

// Status configurations
const STATUS_CONFIGS: Record<JobStatus, StatusConfig> = {
  pending: {
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    icon: 'schedule',
    label: 'Pending',
    description: 'Waiting for mechanic assignment',
  },
  in_progress: {
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
    icon: 'build',
    label: 'In Progress',
    description: 'Work is currently being performed',
  },
  completed: {
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    icon: 'check-circle',
    label: 'Completed',
    description: 'Job has been finished successfully',
  },
  cancelled: {
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    icon: 'cancel',
    label: 'Cancelled',
    description: 'Job has been cancelled',
  },
  on_hold: {
    color: '#8B5CF6',
    backgroundColor: '#EDE9FE',
    icon: 'pause-circle',
    label: 'On Hold',
    description: 'Job is temporarily paused',
  },
};

// Urgency configurations
const URGENCY_CONFIGS: Record<JobUrgency, StatusConfig> = {
  low: {
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    icon: 'low-priority',
    label: 'Low',
    description: 'Can be scheduled flexibly',
  },
  medium: {
    color: '#F59E0B',
    backgroundColor: '#FEF3C7',
    icon: 'priority-high',
    label: 'Medium',
    description: 'Should be addressed soon',
  },
  high: {
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    icon: 'warning',
    label: 'High',
    description: 'Requires immediate attention',
  },
  urgent: {
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    icon: 'emergency',
    label: 'Urgent',
    description: 'Critical - needs immediate service',
  },
};

interface UseJobDetailsProps {
  job: Job | null;
  onStatusChange?: (jobId: string, newStatus: JobStatus) => Promise<void>;
  onAcceptJob?: (jobId: string) => Promise<void>;
  onDeclineJob?: (jobId: string, reason?: string) => Promise<void>;
  onRescheduleJob?: (jobId: string, newDate: string, newTime: string) => Promise<void>;
  onCallCustomer?: (phoneNumber: string) => void;
  onNavigateToLocation?: (address: Address) => void;
  onShareJob?: (job: Job) => void;
  onAddNote?: (jobId: string, note: string) => Promise<void>;
  onRateJob?: (jobId: string, rating: number, review?: string) => Promise<void>;
  userRole?: 'customer' | 'mechanic' | 'admin';
  theme: any;
}

export const useJobDetails = ({
  job,
  onStatusChange,
  onAcceptJob,
  onDeclineJob,
  onRescheduleJob,
  onCallCustomer,
  onNavigateToLocation,
  onShareJob,
  onAddNote,
  onRateJob,
  userRole = 'customer',
  theme,
}: UseJobDetailsProps): UseJobDetailsReturn => {
  // State management
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false });
  const [error, setError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<JobTimelineEvent[]>([]);
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Refs for performance optimization
  const lastJobId = useRef<string | null>(null);
  const cachedTimeline = useRef<Map<string, JobTimelineEvent[]>>(new Map());
  const cachedNotes = useRef<Map<string, JobNote[]>>(new Map());

  // Data loading functions
  const loadJobDetails = useCallback(async () => {
    if (!job) return;

    try {
      setLoading({ isLoading: true, loadingMessage: 'Loading job details...' });
      setError(null);

      // Check cache first
      const cachedTimelineData = cachedTimeline.current.get(job.id);
      const cachedNotesData = cachedNotes.current.get(job.id);

      if (cachedTimelineData && cachedNotesData) {
        setTimeline(cachedTimelineData);
        setNotes(cachedNotesData);
        setLoading({ isLoading: false });
        return;
      }

      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock timeline data
      const mockTimeline: JobTimelineEvent[] = [
        {
          id: '1',
          type: 'created',
          title: 'Job Created',
          description: 'Customer created a new service request',
          timestamp: job.createdAt,
          user: {
            name: job.customer?.name || 'Customer',
            role: 'customer',
          },
        },
        {
          id: '2',
          type: 'status_change',
          title: 'Status Updated',
          description: `Job status changed to ${job.status}`,
          timestamp: job.updatedAt,
          user: {
            name: 'System',
            role: 'system',
          },
        },
      ];

      // Mock notes data
      const mockNotes: JobNote[] = [
        {
          id: '1',
          content: 'Customer mentioned unusual noise from the engine',
          createdAt: job.createdAt,
          createdBy: {
            id: '1',
            name: job.customer?.name || 'Customer',
            role: 'customer',
          },
          isPrivate: false,
        },
      ];

      // Cache the data
      cachedTimeline.current.set(job.id, mockTimeline);
      cachedNotes.current.set(job.id, mockNotes);

      setTimeline(mockTimeline);
      setNotes(mockNotes);
      setLoading({ isLoading: false });
    } catch (err) {
      setError('Failed to load job details');
      setLoading({ isLoading: false });
    }
  }, [job]);

  // Load job details when job changes
  useEffect(() => {
    if (job && job.id !== lastJobId.current) {
      loadJobDetails();
      lastJobId.current = job.id;
    }
  }, [job, loadJobDetails]);

  const refreshJob = useCallback(async () => {
    setRefreshing(true);
    // Clear cache for this job
    if (job) {
      cachedTimeline.current.delete(job.id);
      cachedNotes.current.delete(job.id);
    }
    await loadJobDetails();
    setRefreshing(false);
  }, [job, loadJobDetails]);

  // Utility functions
  const formatJobTitle = useCallback((title: string): string => {
    if (!title) return '';
    return title
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  const formatJobType = useCallback((type: string): string => {
    if (!type) return 'N/A';
    return type
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  const formatVehicle = useCallback((vehicle: Vehicle | string): string => {
    if (!vehicle) return 'N/A';
    if (typeof vehicle === 'string') return vehicle;
    if (vehicle.year && vehicle.make && vehicle.model) {
      return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    }
    return 'N/A';
  }, []);

  const formatDate = useCallback((date: string): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const formatTime = useCallback((time: string): string => {
    if (!time) return 'N/A';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }, []);

  const getStatusConfig = useCallback((status: JobStatus): StatusConfig => {
    return STATUS_CONFIGS[status] || STATUS_CONFIGS.pending;
  }, []);

  const getUrgencyConfig = useCallback((urgency: JobUrgency): StatusConfig => {
    return URGENCY_CONFIGS[urgency] || URGENCY_CONFIGS.low;
  }, []);

  const getStatusColor = useCallback((status: JobStatus): string => {
    return getStatusConfig(status).color;
  }, [getStatusConfig]);

  const getUrgencyColor = useCallback((urgency: JobUrgency): string => {
    return getUrgencyConfig(urgency).color;
  }, [getUrgencyConfig]);

  // Action handlers
  const handleStatusChange = useCallback(async (newStatus: JobStatus) => {
    if (!job || !onStatusChange) return;

    try {
      setLoading({ isLoading: true, loadingMessage: 'Updating status...' });
      await onStatusChange(job.id, newStatus);
      
      // Add to timeline
      const newTimelineEvent: JobTimelineEvent = {
        id: Date.now().toString(),
        type: 'status_change',
        title: 'Status Updated',
        description: `Job status changed to ${newStatus}`,
        timestamp: new Date().toISOString(),
        user: {
          name: 'Current User',
          role: userRole,
        },
      };

      setTimeline(prev => [...prev, newTimelineEvent]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError('Failed to update job status');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading({ isLoading: false });
    }
  }, [job, onStatusChange, userRole]);

  const handleAcceptJob = useCallback(async () => {
    if (!job || !onAcceptJob) return;

    try {
      setLoading({ isLoading: true, loadingMessage: 'Accepting job...' });
      await onAcceptJob(job.id);
      
      // Add to timeline
      const newTimelineEvent: JobTimelineEvent = {
        id: Date.now().toString(),
        type: 'accepted',
        title: 'Job Accepted',
        description: 'Mechanic accepted the job',
        timestamp: new Date().toISOString(),
        user: {
          name: 'Current User',
          role: userRole,
        },
      };

      setTimeline(prev => [...prev, newTimelineEvent]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError('Failed to accept job');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading({ isLoading: false });
    }
  }, [job, onAcceptJob, userRole]);

  const handleDeclineJob = useCallback(async (reason?: string) => {
    if (!job || !onDeclineJob) return;

    Alert.alert(
      'Decline Job',
      'Are you sure you want to decline this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading({ isLoading: true, loadingMessage: 'Declining job...' });
              await onDeclineJob(job.id, reason);
              
              // Add to timeline
              const newTimelineEvent: JobTimelineEvent = {
                id: Date.now().toString(),
                type: 'cancelled',
                title: 'Job Declined',
                description: reason ? `Job declined: ${reason}` : 'Job declined by mechanic',
                timestamp: new Date().toISOString(),
                user: {
                  name: 'Current User',
                  role: userRole,
                },
              };

              setTimeline(prev => [...prev, newTimelineEvent]);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err) {
              setError('Failed to decline job');
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setLoading({ isLoading: false });
            }
          },
        },
      ]
    );
  }, [job, onDeclineJob, userRole]);

  const handleRescheduleJob = useCallback(async (newDate: string, newTime: string) => {
    if (!job || !onRescheduleJob) return;

    try {
      setLoading({ isLoading: true, loadingMessage: 'Rescheduling job...' });
      await onRescheduleJob(job.id, newDate, newTime);
      
      // Add to timeline
      const newTimelineEvent: JobTimelineEvent = {
        id: Date.now().toString(),
        type: 'status_change',
        title: 'Job Rescheduled',
        description: `Job rescheduled to ${newDate} at ${newTime}`,
        timestamp: new Date().toISOString(),
        user: {
          name: 'Current User',
          role: userRole,
        },
      };

      setTimeline(prev => [...prev, newTimelineEvent]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError('Failed to reschedule job');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading({ isLoading: false });
    }
  }, [job, onRescheduleJob, userRole]);

  const handleCallCustomer = useCallback(() => {
    if (!job?.customer?.phone || !onCallCustomer) return;

    Alert.alert(
      'Call Customer',
      `Call ${job.customer.name} at ${job.customer.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            onCallCustomer(job.customer!.phone!);
            Linking.openURL(`tel:${job.customer!.phone}`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  }, [job, onCallCustomer]);

  const handleNavigateToLocation = useCallback(() => {
    if (!job?.location || !onNavigateToLocation) return;

    Alert.alert(
      'Navigate to Location',
      `Navigate to ${job.location}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Navigate',
          onPress: () => {
            // In a real app, you'd have the full address object
            const mockAddress: Address = {
              street: job.location!,
              city: 'City',
              state: 'State',
              zipCode: '12345',
              country: 'USA',
            };
            onNavigateToLocation(mockAddress);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  }, [job, onNavigateToLocation]);

  const handleShareJob = useCallback(async () => {
    if (!job || !onShareJob) return;

    try {
      const shareContent = {
        title: `Job: ${job.title}`,
        message: `Check out this job: ${job.title}\nStatus: ${job.status}\nLocation: ${job.location}`,
        url: `https://yourapp.com/jobs/${job.id}`,
      };

      await Share.share(shareContent);
      onShareJob(job);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err) {
      setError('Failed to share job');
    }
  }, [job, onShareJob]);

  const handleAddNote = useCallback(async (note: string) => {
    if (!job || !onAddNote || !note.trim()) return;

    try {
      setLoading({ isLoading: true, loadingMessage: 'Adding note...' });
      await onAddNote(job.id, note.trim());
      
      // Add to timeline and notes
      const newNote: JobNote = {
        id: Date.now().toString(),
        content: note.trim(),
        createdAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          role: userRole,
        },
        isPrivate: false,
      };

      const newTimelineEvent: JobTimelineEvent = {
        id: Date.now().toString(),
        type: 'note',
        title: 'Note Added',
        description: note.trim(),
        timestamp: new Date().toISOString(),
        user: {
          name: 'Current User',
          role: userRole,
        },
      };

      setNotes(prev => [...prev, newNote]);
      setTimeline(prev => [...prev, newTimelineEvent]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError('Failed to add note');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading({ isLoading: false });
    }
  }, [job, onAddNote, userRole]);

  const handleRateJob = useCallback(async (rating: number, review?: string) => {
    if (!job || !onRateJob) return;

    try {
      setLoading({ isLoading: true, loadingMessage: 'Submitting rating...' });
      await onRateJob(job.id, rating, review);
      
      // Add to timeline
      const newTimelineEvent: JobTimelineEvent = {
        id: Date.now().toString(),
        type: 'completed',
        title: 'Job Rated',
        description: `Job rated ${rating}/5 stars${review ? `: ${review}` : ''}`,
        timestamp: new Date().toISOString(),
        user: {
          name: 'Current User',
          role: userRole,
        },
      };

      setTimeline(prev => [...prev, newTimelineEvent]);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError('Failed to submit rating');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading({ isLoading: false });
    }
  }, [job, onRateJob, userRole]);

  // Memoized actions
  const actions = useMemo((): JobAction[] => {
    if (!job) return [];

    const baseActions: JobAction[] = [
      {
        id: 'share',
        label: 'Share',
        icon: 'share',
        color: theme.primary,
        onPress: handleShareJob,
        variant: 'secondary',
      },
    ];

    if (job.customer?.phone) {
      baseActions.push({
        id: 'call',
        label: 'Call',
        icon: 'phone',
        color: theme.success,
        onPress: handleCallCustomer,
        variant: 'success',
      });
    }

    if (job.location) {
      baseActions.push({
        id: 'navigate',
        label: 'Navigate',
        icon: 'navigation',
        color: theme.info,
        onPress: handleNavigateToLocation,
        variant: 'secondary',
      });
    }

    // Role-specific actions
    if (userRole === 'mechanic') {
      if (job.status === 'pending') {
        baseActions.push(
          {
            id: 'accept',
            label: 'Accept',
            icon: 'check',
            color: theme.success,
            onPress: handleAcceptJob,
            variant: 'primary',
            loading: loading.isLoading && loading.loadingMessage === 'Accepting job...',
          },
          {
            id: 'decline',
            label: 'Decline',
            icon: 'close',
            color: theme.error,
            onPress: () => handleDeclineJob(),
            variant: 'danger',
          }
        );
      }

      if (job.status === 'in_progress') {
        baseActions.push({
          id: 'complete',
          label: 'Complete',
          icon: 'check-circle',
          color: theme.success,
          onPress: () => handleStatusChange('completed'),
          variant: 'primary',
          loading: loading.isLoading && loading.loadingMessage === 'Updating status...',
        });
      }
    }

    return baseActions;
  }, [
    job,
    userRole,
    theme,
    loading,
    handleShareJob,
    handleCallCustomer,
    handleNavigateToLocation,
    handleAcceptJob,
    handleDeclineJob,
    handleStatusChange,
  ]);

  return {
    job,
    loading,
    error,
    actions,
    statusConfig: job ? getStatusConfig(job.status) : STATUS_CONFIGS.pending,
    formatJobTitle,
    formatJobType,
    formatVehicle,
    formatDate,
    formatTime,
    formatPrice,
    getStatusColor,
    getUrgencyColor,
    handleStatusChange,
    handleAcceptJob,
    handleDeclineJob,
    handleRescheduleJob,
    handleCallCustomer,
    handleNavigateToLocation,
    handleShareJob,
    handleAddNote,
    handleRateJob,
    refreshJob,
  };
};
