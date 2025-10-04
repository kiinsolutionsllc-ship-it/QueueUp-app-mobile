import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { useVehicle } from '../../contexts/VehicleContext';
import { useUnifiedMessaging } from '../../contexts/UnifiedMessagingContext';
import { formatVehicle } from '../../utils/UnifiedJobFormattingUtils';
// Removed UserIdUtils import - now using real user IDs from Supabase
import { formatJobCost } from '../../utils/JobCostUtils';
import NotificationService from '../../services/NotificationService';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import MaterialTextInput from '../../components/shared/MaterialTextInput';
import ConversationModal from '../../components/modals/ConversationModal';
import BidModal from '../../components/modals/BidModal';
import JobDetailsModal from '../../components/modals/JobDetailsModal';
import { Conversation } from '../../types/MessagingTypes';

interface MechanicJobsScreenProps {
  navigation: any;
  route?: any;
}

// Suggest Schedule Modal Component
const SuggestScheduleModal = ({ visible, onClose, job, onSubmit, theme }: any) => {
  const [selectedDate, setSelectedDate] = useState<any>('');
  const [selectedTime, setSelectedTime] = useState<any>('');
  const [specialInstructions, setSpecialInstructions] = useState<any>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Generate available dates (next 14 days for more flexibility)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return dates;
  };

  // Generate available time slots (more flexible hours)
  const generateTimeSlots = () => {
    const slots: any[] = [];
    const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    
    times.forEach(time => {
      const hour = parseInt(time.split(':')[0]);
      const displayTime = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      slots.push({
        value: time,
        label: displayTime
      });
    });
    
    return slots;
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time for your suggestion.');
      return;
    }

    setIsSubmitting(true);
    try {
      const suggestionData = {
        date: selectedDate,
        time: selectedTime,
        dateTime: `${selectedDate}T${selectedTime}:00.000Z`,
        specialInstructions: specialInstructions.trim(),
      };

      await onSubmit(suggestionData);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible || !job) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconFallback name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Suggest Schedule
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Job Info */}
          <View style={[styles.modalJobInfo, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.modalJobTitle, { color: theme.text }]}>
              {job.title || job.subcategory || job.category || 'Service Request'}
            </Text>
            <Text style={[styles.modalJobDescription, { color: theme.textSecondary }]}>
              Current schedule: {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Not set'} at {job.scheduledTime || 'Not set'}
            </Text>
          </View>

          {/* Date Selection */}
          <View style={[styles.modalSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
              Suggest Date
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScrollView}>
              {availableDates.map((date) => (
                <TouchableOpacity
                  key={date.value}
                  style={[
                    styles.dateOption,
                    { 
                      backgroundColor: selectedDate === date.value ? theme.primary : theme.surface,
                      borderColor: selectedDate === date.value ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => setSelectedDate(date.value)}
                >
                  <Text
                    style={[
                      styles.dateOptionText,
                      { 
                        color: selectedDate === date.value ? theme.onPrimary : theme.text 
                      }
                    ]}
                  >
                    {date.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Selection */}
          <View style={[styles.modalSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
              Suggest Time
            </Text>
            <View style={styles.timeGrid}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time.value}
                  style={[
                    styles.timeOption,
                    { 
                      backgroundColor: selectedTime === time.value ? theme.primary : theme.surface,
                      borderColor: selectedTime === time.value ? theme.primary : theme.border,
                    }
                  ]}
                  onPress={() => setSelectedTime(time.value)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      { 
                        color: selectedTime === time.value ? theme.onPrimary : theme.text 
                      }
                    ]}
                  >
                    {time.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={[styles.modalSection, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
              Additional Notes (Optional)
            </Text>
            <TextInput
              style={[styles.modalTextInput, { borderColor: theme.border, color: theme.text }]}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder="Explain why this time works better for you..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActionButtons}>
            <TouchableOpacity
              style={[styles.scheduleButton, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <IconFallback name="send" size={20} color={theme.onPrimary} />
              <Text style={[styles.modalScheduleButtonText, { color: theme.onPrimary }]}>
                {isSubmitting ? 'Sending...' : 'Send Suggestion'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const MechanicJobsScreen: React.FC<MechanicJobsScreenProps> = ({ navigation, route }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { getJobsByMechanic, getAvailableJobs, refreshData, getBidsByMechanic, updateJob, isJobAvailableForBidding } = useJob();
  const { vehicles } = useVehicle();
  const { findOrCreateConversation } = useUnifiedMessaging();
  const theme = getCurrentTheme();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'available' | 'my_jobs'>('available');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [showConversationModal, setShowConversationModal] = useState<boolean>(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [showBidModal, setShowBidModal] = useState<boolean>(false);
  const [selectedJobForBidding, setSelectedJobForBidding] = useState<any>(null);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState<boolean>(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null);
  const [showSuggestModal, setShowSuggestModal] = useState<boolean>(false);
  const [selectedJobForSuggestion, setSelectedJobForSuggestion] = useState<any>(null);

  // Handle route parameters for auto-selecting a specific job
  useEffect(() => {
    if (route?.params?.jobId) {
      const jobId = route.params.jobId;
      // Set the job as selected and expanded
      setSelectedJobId(jobId);
      setExpandedJobId(jobId);
      
      // Determine which tab the job should be on
      const allJobs = [...(getAvailableJobs ? getAvailableJobs() : []), ...(user?.id ? getJobsByMechanic(user.id) : [])];
      const targetJob = allJobs.find(job => job.id === jobId);
      
      if (targetJob) {
        // Check if it's in available jobs or my jobs
        const availableJobs = getAvailableJobs ? getAvailableJobs() : [];
        const isInAvailableJobs = availableJobs.some(job => job.id === jobId);
        
        if (isInAvailableJobs) {
          setActiveTab('available');
        } else {
          setActiveTab('my_jobs');
        }
      }
      
      // Clear the route params to prevent re-triggering on subsequent renders
      navigation.setParams({ jobId: undefined });
    }
  }, [route?.params?.jobId, getAvailableJobs, getJobsByMechanic, user?.id, user?.user_type, navigation]);


  // Helper function to resolve vehicle data (handle both objects and IDs) - same as CustomerJobsScreen
  const resolveVehicleData = (vehicle: any) => {
    if (!vehicle) return null;
    
    // If it's already an object with make/model/year, return it
    if (typeof vehicle === 'object' && vehicle.make && vehicle.model) {
      return vehicle;
    }
    
    // If it's a string that looks like a vehicle ID, try to find the full vehicle object
    if (typeof vehicle === 'string' && /^\d{13,}$/.test(vehicle)) {
      const fullVehicle = vehicles.find(v => v.id === vehicle);
      if (fullVehicle) {
        return fullVehicle;
      }
    }
    
    // Return the original vehicle data
    return vehicle;
  };

  // Helper function to check if current mechanic has bid on a job
  const hasMechanicBidOnJob = (jobId: string): boolean => {
    const mechanicId = user?.id;
    const mechanicBids = mechanicId ? getBidsByMechanic(mechanicId) : [];
    return mechanicBids.some(bid => bid.jobId === jobId);
  };

  // Helper function to get status colors
  const getStatusColors = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case 'posted':
        return { bg: '#E3F2FD', text: '#1976D2', border: '#1976D2' }; // Light blue
      case 'pending':
        return { bg: '#FFF3E0', text: '#F57C00', border: '#F57C00' }; // Orange
      case 'bidding':
        return { bg: '#F3E5F5', text: '#7B1FA2', border: '#7B1FA2' }; // Purple
      case 'accepted':
        return { bg: '#E8F5E8', text: '#2E7D32', border: '#2E7D32' }; // Green
      case 'scheduled':
        return { bg: '#E1F5FE', text: '#0277BD', border: '#0277BD' }; // Cyan
      case 'confirmed':
        return { bg: '#E8F5E8', text: '#1B5E20', border: '#1B5E20' }; // Dark green
      case 'in_progress':
      case 'started':
        return { bg: '#FFF8E1', text: '#F9A825', border: '#F9A825' }; // Amber
      case 'completed':
        return { bg: '#E0F2F1', text: '#00695C', border: '#00695C' }; // Teal
      case 'cancelled':
        return { bg: '#FFEBEE', text: '#C62828', border: '#C62828' }; // Red
      case 'schedule_rejected':
        return { bg: '#FCE4EC', text: '#AD1457', border: '#AD1457' }; // Pink
      default:
        return { bg: theme.surface, text: theme.text, border: theme.border };
    }
  };

  // Get mechanic jobs and available jobs
  const myJobs = useMemo(() => {
    return user?.id ? getJobsByMechanic(user.id) : [];
  }, [user?.id, user?.user_type, getJobsByMechanic]);

  const availableJobs = useMemo(() => {
    const jobs = getAvailableJobs ? getAvailableJobs() : [];
    console.log('🔧 MechanicJobsScreen: Available jobs count:', jobs.length);
    console.log('🔧 MechanicJobsScreen: Available jobs:', jobs.map(j => ({ id: j.id, status: j.status, title: j.title })));
    return jobs;
  }, [getAvailableJobs]);

  // Filter jobs based on active tab and search query
  const jobs = useMemo(() => {
    let filteredJobs = [];
    
    if (activeTab === 'available') {
      // Filter available jobs based on status
      switch (filter) {
        case 'all':
          filteredJobs = availableJobs;
          break;
        case 'new':
          filteredJobs = availableJobs.filter((job: any) => job.status === 'posted' || job.status === 'pending');
          break;
        case 'bidding':
          filteredJobs = availableJobs.filter((job: any) => job.status === 'bidding' || job.hasBids);
          break;
        case 'pending':
          filteredJobs = availableJobs.filter((job: any) => job.status === 'pending');
          break;
        default:
          filteredJobs = availableJobs;
      }
    } else {
      // Filter my jobs
      if (filter === 'all') {
        filteredJobs = myJobs;
      } else if (filter === 'accepted') {
        // Include 'accepted', 'scheduled', and 'confirmed' jobs in the accepted filter
        filteredJobs = myJobs.filter((job: any) => 
          job.status === 'accepted' || 
          job.status === 'scheduled' || 
          job.status === 'confirmed'
        );
      } else {
        filteredJobs = myJobs.filter((job: any) => job.status === filter);
      }
    }

    // Apply search filter if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredJobs = filteredJobs.filter((job: any) => 
        job.title?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.category?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.customerName?.toLowerCase().includes(query)
      );
    }

    return filteredJobs;
  }, [activeTab, availableJobs, myJobs, filter, searchQuery]);

  // Note: Vehicle data is now resolved using VehicleContext and resolveVehicleData function
  // This matches the approach used in CustomerJobsScreen for consistency

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  };

  const handleJobPress = (job: any) => {
    // Toggle selection
    if (selectedJobId === job.id) {
      setSelectedJobId(null);
      setExpandedJobId(null);
    } else {
      setSelectedJobId(job.id);
      setExpandedJobId(job.id);
    }
  };

  const handleJobDetails = (job: any) => {
    setSelectedJobForDetails(job);
    setShowJobDetailsModal(true);
  };

  const handleBidJob = (job: any) => {
    // Check if job is available for bidding
    if (!isJobAvailableForBidding(job)) {
      Alert.alert(
        'Job Not Available',
        'This job is no longer available for bidding. It may have been accepted by another mechanic or is in progress.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedJobForBidding(job);
    setShowBidModal(true);
  };

  const handleMessageCustomer = async (job: any) => {
    const mechanicId = user?.id;
    navigation.navigate('Messaging', {
      startConversation: {
        participants: [mechanicId, job.customerId],
        jobId: job.id,
        title: job.customerName || 'Customer',
        jobTitle: job.title || 'Service Request',
      },
    });
  };


  const handleMessageSent = () => {
    // Handle message sent callback
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleProfile = () => {
    navigation.navigate('UnifiedProfile');
  };

  const handleChangeOrder = (job: any) => {
    // Navigate to the change order request screen
    navigation.navigate('ChangeOrderRequest', { jobId: job.id });
  };

  const handleBidSubmitted = (bid: any) => {
    // Handle bid submitted callback
    // Refresh the jobs list to show updated status
    onRefresh();
  };

  const handleAcceptSchedule = async (job: any) => {
    try {
      // Update job status to confirmed schedule
      const result = await updateJob(job.id, { 
        status: 'Confirmed'
      });
      
      if (result.success) {
        // Send notification to customer
        await NotificationService.notifyCustomer(job.customerId, job.id, 'schedule_confirmed', {
          mechanicName: user?.name || 'Your mechanic',
          jobTitle: job.title,
          scheduledDate: job.scheduledDate,
          scheduledTime: job.scheduledTime
        });
        
        Alert.alert(
          'Schedule Confirmed!',
          'You have confirmed the scheduled date. The customer will be notified.',
          [{ text: 'OK' }]
        );
        onRefresh();
      } else {
        throw new Error(result.error || 'Failed to confirm schedule');
      }
    } catch (error) {
      console.error('Error confirming schedule:', error);
      Alert.alert('Error', 'Failed to confirm schedule. Please try again.');
    }
  };

  const handleSuggestSchedule = (job: any) => {
    setSelectedJobForSuggestion(job);
    setShowSuggestModal(true);
  };

  const handleSuggestionSubmitted = async (suggestionData: any) => {
    try {
      // Update job with mechanic's suggested schedule
      const result = await updateJob(selectedJobForSuggestion.id, { 
        status: 'accepted' // Back to accepted so customer can see the suggestion
      });
      
      if (result.success) {
        // Send notification to customer about the suggestion
        await NotificationService.notifyCustomer(selectedJobForSuggestion.customerId, selectedJobForSuggestion.id, 'schedule_suggestion', {
          mechanicName: user?.name || 'Your mechanic',
          jobTitle: selectedJobForSuggestion.title,
          suggestedDate: suggestionData.date,
          suggestedTime: suggestionData.time,
          notes: suggestionData.specialInstructions
        });
        
        Alert.alert(
          'Suggestion Sent!',
          'Your suggested date and time has been sent to the customer. They will be notified and can accept or propose a different time.',
          [{ text: 'OK' }]
        );
        setShowSuggestModal(false);
        setSelectedJobForSuggestion(null);
        onRefresh();
      } else {
        throw new Error(result.error || 'Failed to send suggestion');
      }
    } catch (error) {
      console.error('Error sending suggestion:', error);
      Alert.alert('Error', 'Failed to send suggestion. Please try again.');
    }
  };

  const handleStartJob = async (job: any) => {
    try {
      // Update job status to in progress
      const result = await updateJob(job.id, { 
        status: 'in_progress'
      });
      
      if (result.success) {
        // Send notification to customer
        await NotificationService.notifyCustomer(job.customerId, job.id, 'job_started', {
          mechanicName: user?.name || 'Your mechanic',
          jobTitle: job.title,
          startedAt: new Date().toISOString()
        });
        
        Alert.alert(
          'Job Started!',
          'You have started working on this job. The customer will be notified that work has begun.',
          [{ text: 'OK' }]
        );
        onRefresh();
      } else {
        throw new Error(result.error || 'Failed to start job');
      }
    } catch (error) {
      console.error('Error starting job:', error);
      Alert.alert('Error', 'Failed to start job. Please try again.');
    }
  };

  const handleCompleteJob = async (job: any) => {
    try {
      // Update job status to completed
      const result = await updateJob(job.id, { 
        status: 'completed'
      });
      
      if (result.success) {
        // Send notification to customer
        await NotificationService.notifyCustomer(job.customerId, job.id, 'job_completed', {
          mechanicName: user?.name || 'Your mechanic',
          jobTitle: job.title,
          completedAt: new Date().toISOString()
        });
        
        Alert.alert(
          'Job Completed!',
          'You have marked this job as completed. The customer will be notified and can provide feedback.\n\nNext Steps:\n• Add detailed notes about the work performed\n• Upload photos of the completed work\n• Go to the Details tab to add this information',
          [
            { text: 'OK' },
            { 
              text: 'View Details', 
              onPress: () => {
                setSelectedJobForDetails(job);
                setShowJobDetailsModal(true);
              }
            }
          ]
        );
        onRefresh();
      } else {
        throw new Error(result.error || 'Failed to complete job');
      }
    } catch (error) {
      console.error('Error completing job:', error);
      Alert.alert('Error', 'Failed to complete job. Please try again.');
    }
  };

  const JobCard = ({ job }: { job: any }) => {
    const isSelected = selectedJobId === job.id;
    const isExpanded = expandedJobId === job.id;
    
    // Debug logging for confirmed jobs
    if (job.status?.toLowerCase() === 'confirmed') {
      console.log('Confirmed job found:', {
        id: job.id,
        status: job.status,
        activeTab,
        isExpanded,
        shouldShowStartButton: activeTab === 'my_jobs' && job.status?.toLowerCase() === 'confirmed' && isExpanded
      });
    }

    return (
      <MaterialCard style={[
        styles.jobCard,
        isSelected && {
          borderColor: theme.primary,
          borderWidth: 2,
          backgroundColor: theme.primary + '05',
        }
      ]}>
        <TouchableOpacity onPress={() => handleJobPress(job)} activeOpacity={0.7}>
          <View style={styles.jobHeader}>
            <View style={styles.jobInfo}>
              <View style={styles.jobTitleRow}>
                <Text style={[styles.jobTitle, { color: theme.text }]}>{job.title}</Text>
                <IconFallback 
                  name={isExpanded ? "expand-less" : "expand-more"} 
                  size={24} 
                  color={theme.textSecondary} 
                />
              </View>
              {(() => {
                const resolvedVehicle = resolveVehicleData(job.vehicleId);
                const formatted = formatVehicle(resolvedVehicle);
                return formatted ? (
                  <Text style={[styles.vehicleInfo, { color: theme.textSecondary }]}>
                    {formatted}
                  </Text>
                ) : null;
              })()}
            </View>
            <View style={[
              styles.statusBadge, 
              { 
                backgroundColor: getStatusColors(job.status).bg,
                borderColor: getStatusColors(job.status).border,
                borderWidth: 1,
              }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: getStatusColors(job.status).text }
              ]}>
                {job.status?.toUpperCase() || 'UNKNOWN'}
              </Text>
            </View>
          </View>

          <View style={styles.jobDetails}>
            <View style={styles.jobDetailItem}>
              <IconFallback name="attach-money" size={16} color={theme.textSecondary} />
              <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                {formatJobCost(job)}
              </Text>
            </View>
            <View style={styles.jobDetailItem}>
              <IconFallback name="schedule" size={16} color={theme.textSecondary} />
              <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                {job.estimatedTime || job.estimatedDuration || 'TBD'}
              </Text>
            </View>
            <View style={styles.jobDetailItem}>
              <IconFallback name="access-time" size={16} color={theme.textSecondary} />
              <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                {new Date(job.createdAt || Date.now()).toLocaleDateString()}
              </Text>
            </View>
            {job.serviceType && (
              <View style={styles.jobDetailItem}>
                <IconFallback name="build" size={16} color={theme.textSecondary} />
                <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                  {job.serviceType === 'mobile' ? 'Mobile' : 'Shop'}
                </Text>
              </View>
            )}
          </View>

          {/* Accordion Dropdown */}
          {isExpanded && (
            <View style={[styles.accordionContent, { borderTopColor: theme.border }]}>
              {/* Compact Job Information */}
              <View style={styles.compactInfo}>
                {/* Key Details Row */}
                <View style={styles.keyDetailsRow}>
                  <View style={styles.detailChip}>
                    <IconFallback name="build" size={12} color={theme.textSecondary} />
                    <Text style={[styles.detailChipText, { color: theme.textSecondary }]}>
                      {job.category} • {job.subcategory}
                    </Text>
                  </View>
                  <View style={styles.detailChip}>
                    <IconFallback name="location-on" size={12} color={theme.textSecondary} />
                    <Text style={[styles.detailChipText, { color: theme.textSecondary }]}>
                      {job.serviceType === 'mobile' ? 'Mobile' : 'Shop'}
                    </Text>
                  </View>
                  {activeTab === 'available' && job.urgency && (
                    <View style={[styles.detailChip, { 
                      backgroundColor: job.urgency === 'high' ? theme.error + '20' : 
                                     job.urgency === 'medium' ? theme.warning + '20' : theme.success + '20' 
                    }]}>
                      <Text style={[styles.detailChipText, { 
                        color: job.urgency === 'high' ? theme.error : 
                               job.urgency === 'medium' ? theme.warning : theme.success 
                      }]}>
                        {job.urgency.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Vehicle and Location */}
                <View style={styles.vehicleLocationRow}>
                  <View style={styles.vehicleInfoContainer}>
                    <IconFallback name="directions-car" size={14} color={theme.textSecondary} />
                    <Text style={[styles.vehicleText, { color: theme.text }]}>
                      {(() => {
                        const resolvedVehicle = resolveVehicleData(job.vehicleId);
                        if (resolvedVehicle && typeof resolvedVehicle === 'object' && resolvedVehicle.make) {
                          return `${resolvedVehicle.make} ${resolvedVehicle.model} (${resolvedVehicle.year})`;
                        } else {
                          const formatted = formatVehicle(resolvedVehicle);
                          return formatted || 'Vehicle info not available';
                        }
                      })()}
                    </Text>
                  </View>
                  <View style={styles.locationInfo}>
                    <IconFallback name="place" size={14} color={theme.textSecondary} />
                    <Text style={[styles.locationText, { color: theme.text }]}>
                      {job.location || 'TBD'}
                    </Text>
                  </View>
                </View>

                {/* Customer (for available jobs) */}
                {activeTab === 'available' && (
                  <View style={styles.customerRow}>
                    <IconFallback name="person" size={14} color={theme.textSecondary} />
                    <Text style={[styles.customerText, { color: theme.text }]}>
                      {job.customerName || 'Anonymous'}
                    </Text>
                  </View>
                )}

                {/* Description (if available) */}
                {(job.description || job.notes || job.specialInstructions) && (
                  <View style={styles.descriptionRow}>
                    <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
                      {job.description || job.notes || job.specialInstructions}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.accordionActions}>
                {/* Schedule Actions - Show when job is scheduled and waiting for mechanic confirmation */}
                {activeTab === 'my_jobs' && job.status === 'scheduled' && (
                  <View style={styles.scheduleActionsContainer}>
                    <Text style={[styles.schedulePrompt, { color: theme.text }]}>
                      Customer has scheduled this job. Do you accept this time?
                    </Text>
                    {job.scheduledDate && job.scheduledTime && (
                      <Text style={[styles.scheduleDetails, { color: theme.textSecondary }]}>
                        {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                      </Text>
                    )}
                    <View style={styles.scheduleButtonRow}>
                      <MaterialButton
                        title="Accept"
                        onPress={() => handleAcceptSchedule(job)}
                        variant="filled"
                        size="small"
                        style={[styles.scheduleButton, styles.smallButton, { backgroundColor: theme.success }]}
                      />
                      <MaterialButton
                        title="Suggest"
                        onPress={() => handleSuggestSchedule(job)}
                        variant="outlined"
                        size="small"
                        style={[styles.scheduleButton, styles.smallButton, { borderColor: theme.warning }]}
                      />
                    </View>
                  </View>
                )}


                <View style={styles.buttonRow}>
                  {activeTab === 'available' && (
                    hasMechanicBidOnJob(job.id) ? (
                      <View style={styles.bidPlacedContainer}>
                        <IconFallback name="check" size={16} color={theme.success} />
                        <Text style={[styles.bidPlacedText, { color: theme.success }]}>
                          Bid Placed
                        </Text>
                      </View>
                    ) : !isJobAvailableForBidding(job) ? (
                      <View style={styles.bidPlacedContainer}>
                        <IconFallback name="block" size={16} color={theme.textSecondary} />
                        <Text style={[styles.bidPlacedText, { color: theme.textSecondary }]}>
                          Not Available
                        </Text>
                      </View>
                    ) : (
                      <MaterialButton
                        title="Place Bid"
                        onPress={() => {
                          handleBidJob(job);
                        }}
                        variant="outlined"
                        size="small"
                        style={[styles.accordionButton, styles.smallButton]}
                      />
                    )
                  )}
                  
                  {/* Show Start Job button for confirmed jobs */}
                  {activeTab === 'my_jobs' && job.status?.toLowerCase() === 'confirmed' && (
                    <MaterialButton
                      title="Start Job"
                      onPress={() => handleStartJob(job)}
                      variant="filled"
                      size="small"
                      style={[styles.accordionButton, styles.smallButton, { backgroundColor: theme.success }]}
                    />
                  )}
                  
                  {/* Show Complete Job button for in_progress jobs */}
                  {activeTab === 'my_jobs' && job.status?.toLowerCase() === 'in_progress' && (
                    <MaterialButton
                      title="Complete Job"
                      onPress={() => handleCompleteJob(job)}
                      variant="filled"
                      size="small"
                      style={[styles.accordionButton, styles.smallButton, { backgroundColor: theme.primary }]}
                    />
                  )}
                  
                  {/* Show Change Order button for in_progress jobs */}
                  {activeTab === 'my_jobs' && job.status?.toLowerCase() === 'in_progress' && (
                    <MaterialButton
                      title="Change Order"
                      onPress={() => handleChangeOrder(job)}
                      variant="outlined"
                      size="small"
                      style={[styles.accordionButton, styles.smallButton]}
                      icon="add"
                    />
                  )}
                  
                  <MaterialButton
                    title="View Details"
                    onPress={() => handleJobDetails(job)}
                    variant="outlined"
                    size="small"
                    style={[styles.accordionButton, styles.smallButton]}
                  />
                  <MaterialButton
                    title="Message"
                    onPress={() => handleMessageCustomer(job)}
                    variant="outlined"
                    size="small"
                    style={[styles.accordionButton, styles.smallButton]}
                  />
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </MaterialCard>
    );
  };

  const FilterButton = ({ filterValue, label }: { filterValue: string; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: filter === filterValue ? theme.primary : theme.surface,
          borderColor: filter === filterValue ? theme.primary : theme.border,
        },
      ]}
      onPress={() => setFilter(filterValue)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: filter === filterValue ? theme.onPrimary : theme.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const TabButton = ({ tabValue, label }: { tabValue: 'available' | 'my_jobs'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: activeTab === tabValue ? theme.primary : theme.surface,
          borderColor: activeTab === tabValue ? theme.primary : theme.border,
        },
      ]}
      onPress={() => setActiveTab(tabValue)}
    >
      <Text
        style={[
          styles.tabButtonText,
          {
            color: activeTab === tabValue ? theme.onPrimary : theme.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title={activeTab === 'available' ? 'Available Jobs' : 'My Jobs'}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        onNotificationPress={handleNotifications}
        onProfilePress={handleProfile}
      />

      {/* Search Input */}
      {showSearchInput && (
        <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground }]}>
          <MaterialTextInput
            label="Search Jobs"
            placeholder="Search jobs by title, description, location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search"
            rightIcon={searchQuery ? "clear" : undefined}
            onRightIconPress={() => setSearchQuery('')}
            style={styles.searchInput}
            autoFocus={true}
          />
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TabButton tabValue="available" label="Available Jobs" />
          <TabButton tabValue="my_jobs" label="My Jobs" />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {activeTab === 'available' ? (
            <>
              <FilterButton filterValue="all" label="All" />
              <FilterButton filterValue="new" label="New Jobs" />
              <FilterButton filterValue="bidding" label="Bidding" />
              <FilterButton filterValue="pending" label="Pending" />
            </>
          ) : (
            <>
              <FilterButton filterValue="all" label="All Jobs" />
              <FilterButton filterValue="accepted" label="Accepted" />
              <FilterButton filterValue="in_progress" label="In Progress" />
              <FilterButton filterValue="completed" label="Completed" />
            </>
          )}
        </View>

        {/* Jobs List */}
        <View style={styles.jobsContainer}>
          {jobs.length === 0 ? (
            <View style={styles.emptyState}>
              <IconFallback 
                name={activeTab === 'available' ? 'work-off' : 'assignment'} 
                size={48} 
                color={theme.textSecondary} 
              />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                {activeTab === 'available' ? 'No available jobs' : 'No jobs yet'}
              </Text>
              <Text style={[styles.emptyStateDescription, { color: theme.textSecondary }]}>
                {activeTab === 'available' 
                  ? 'Check back later for new job opportunities in your area' 
                  : 'Start bidding on available jobs to build your portfolio and earn money'
                }
              </Text>
              {activeTab === 'my_jobs' && (
                <MaterialButton
                  title="Browse Available Jobs"
                  onPress={() => setActiveTab('available')}
                  style={styles.browseButton}
                />
              )}
            </View>
          ) : (
            jobs.map((job: any) => (
              <JobCard key={job.id} job={job} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Conversation Modal */}
      <ConversationModal
        visible={showConversationModal}
        onClose={() => setShowConversationModal(false)}
        conversation={selectedConversation}
        onMessageSent={handleMessageSent}
        user={user || undefined}
        theme={theme}
      />

      {/* Bid Modal */}
      <BidModal
        visible={showBidModal}
        onClose={() => {
          setShowBidModal(false);
          setSelectedJobForBidding(null);
        }}
        selectedJob={selectedJobForBidding}
        onBidSubmitted={handleBidSubmitted}
      />

      {/* Job Details Modal */}
      <JobDetailsModal
        visible={showJobDetailsModal}
        onClose={() => {
          setShowJobDetailsModal(false);
          setSelectedJobForDetails(null);
        }}
        job={selectedJobForDetails}
        userType="mechanic"
      />

      {/* Suggest Schedule Modal */}
      <SuggestScheduleModal
        visible={showSuggestModal}
        onClose={() => {
          setShowSuggestModal(false);
          setSelectedJobForSuggestion(null);
        }}
        job={selectedJobForSuggestion}
        onSubmit={handleSuggestionSubmitted}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 100, // Extra bottom padding to ensure expanded cards are fully visible
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchInput: {
    marginBottom: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  jobsContainer: {
    gap: 12,
    paddingBottom: 20, // Additional bottom padding for the jobs container
  },
  jobCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
    marginRight: 12,
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  jobCategory: {
    fontSize: 14,
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  customerInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  customerInfo: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  urgencyBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  jobDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  jobDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobDetailText: {
    fontSize: 12,
  },
  jobActions: {
    marginTop: 8,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    minWidth: 200,
  },
  accordionContent: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 16,
  },
  compactInfo: {
    marginBottom: 16,
    gap: 12,
  },
  keyDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  detailChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  vehicleLocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  vehicleInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  descriptionRow: {
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  accordionActions: {
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accordionButton: {
    flex: 1,
    minWidth: 100,
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    minHeight: 32,
  },
  bidPlacedContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  bidPlacedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleActionsContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  schedulePrompt: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduleDetails: {
    fontSize: 13,
    marginBottom: 12,
  },
  scheduleButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleButton: {
    flex: 1,
  },
  startJobContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  startJobPrompt: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  startJobButtonContainer: {
    marginTop: 12,
  },
  startJobButton: {
    width: '100%',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalJobInfo: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalJobTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalJobDescription: {
    fontSize: 14,
  },
  modalSection: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  dateScrollView: {
    flexDirection: 'row',
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  dateOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalTextInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 80,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  modalActionButtons: {
    paddingTop: 16,
  },
  modalScheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MechanicJobsScreen;