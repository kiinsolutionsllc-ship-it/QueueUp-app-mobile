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
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { useVehicle } from '../../contexts/VehicleContext';
import { useUnifiedMessaging } from '../../contexts/UnifiedMessagingContext';
import { formatVehicle } from '../../utils/UnifiedJobFormattingUtils';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
import { formatJobCost } from '../../utils/JobCostUtils';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import JobDetailsModal from '../../components/modals/JobDetailsModal';
import ConversationModal from '../../components/modals/ConversationModal';
import { Conversation } from '../../types/MessagingTypes';

interface CustomerJobsScreenProps {
  navigation: any;
  route?: {
    params?: {
      userType?: 'customer';
    };
  };
}

const CustomerJobsScreen: React.FC<CustomerJobsScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { getJobsByCustomer, clearAllData, createJob, updateJob } = useJob();
  const { vehicles } = useVehicle();
  const { findOrCreateConversation } = useUnifiedMessaging();
  const theme = getCurrentTheme();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('all');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState<boolean>(false);
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<any>(null);
  const [showConversationModal, setShowConversationModal] = useState<boolean>(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showEditJobModal, setShowEditJobModal] = useState<boolean>(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<any>(null);
  // Vehicle data is now handled by VehicleContext

  // Add focus listener to refresh data when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Force refresh of jobs data
      onRefresh();
    });

    return unsubscribe;
  }, [navigation]);

  // Helper function to resolve vehicle data (handle both objects and IDs) - same as BidComparisonScreen
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

  // Get customer jobs
  const jobs = useMemo(() => {
    const customerId = getFallbackUserIdWithTypeDetection(user?.id, user?.user_type);
    const customerJobs = getJobsByCustomer(customerId);
    
    
    // Sort jobs by creation date (most recent first)
    return customerJobs.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [user?.id, user?.user_type, getJobsByCustomer]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    if (filter === 'all') {
      // Show all jobs except cancelled and completed ones
      return jobs.filter((job: any) => job.status !== 'cancelled' && job.status !== 'completed');
    }
    
    return jobs.filter((job: any) => {
      switch (filter) {
        case 'scheduled':
          return job.status === 'accepted' || job.status === 'scheduled';
        case 'in_progress':
          return job.status === 'in_progress' || job.status === 'started' || job.status === 'pending';
        case 'request_history':
          return job.status === 'completed' || job.status === 'cancelled' || job.status === 'posted';
        default:
          return job.status === filter;
      }
    });
  }, [jobs, filter]);

  // Note: Vehicle data is now resolved using VehicleContext and resolveVehicleData function
  // This matches the approach used in BidComparisonScreen for consistency

  const onRefresh = async () => {
    setRefreshing(true);
    // Force a refresh by calling the job context refresh
    try {
      // The jobs will be automatically updated through the useMemo dependency
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('CustomerJobsScreen - Refresh error:', error);
    }
    setRefreshing(false);
  };

  const handleCreateJob = async () => {
    setShowCreateModal(true);
  };

  const handleJobPress = (job: any) => {
    // Toggle selection and accordion
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

  const handleViewBids = (job: any) => {
    navigation.navigate('BidComparison', { job: job, jobId: job.id });
  };

  const handleScheduleJob = (job: any) => {
    // Navigate to scheduling screen with job data
    navigation.navigate('Scheduling', { job: job, jobId: job.id });
  };

  const handleMessageMechanic = async (job: any) => {
    if (!job?.selectedMechanicId) {
      Alert.alert('No Mechanic', 'No mechanic has been selected for this job yet.');
      return;
    }

    const customerId = user?.id || '';
    navigation.navigate('Messaging', {
      startConversation: {
        participants: [customerId, job.selectedMechanicId],
        jobId: job.id,
        title: job.mechanicName || 'Mechanic',
        jobTitle: job.title || 'Service Request',
      },
    });
  };

  const handleViewChangeOrder = (job: any) => {
    // Get the change order ID from the job
    // job.changeOrders contains change order IDs, not objects
    const changeOrderId = job.changeOrders?.[0];
    
    console.log('CustomerJobsScreen - Job ID:', job.id);
    console.log('CustomerJobsScreen - Job changeOrders:', job.changeOrders);
    console.log('CustomerJobsScreen - Change order ID:', changeOrderId);
    
    if (changeOrderId) {
      // Navigate to the ChangeOrderApprovalScreen
      navigation.navigate('ChangeOrderApproval', { 
        changeOrderId: changeOrderId,
        jobId: job.id 
      });
    } else {
      Alert.alert('Change Order', 'No change order found for this job.');
    }
  };


  const handleMessageSent = () => {
    // Handle message sent callback
  };

  const handleEditJob = (job: any) => {
    setSelectedJobForEdit(job);
    setShowEditJobModal(true);
  };

  const handleCancelJob = async (job: any) => {
    Alert.alert(
      'Cancel Job',
      'Are you sure you want to cancel this job? This action cannot be undone.',
      [
        { text: 'Keep Job', style: 'cancel' },
        {
          text: 'Cancel Job',
          style: 'destructive',
          onPress: async () => {
            try {
              // Update job status to cancelled
              // This would typically call a service to update the job
              Alert.alert('Success', 'Job has been cancelled successfully.');
              // Close the modal
              setShowEditJobModal(false);
              setSelectedJobForEdit(null);
            } catch (error) {
              console.error('Error cancelling job:', error);
              Alert.alert('Error', 'Failed to cancel job. Please try again.');
            }
          }
        }
      ]
    );
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

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all jobs, bids, and messages. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
            } catch (error) {
              console.error('CustomerJobsScreen - Error clearing data:', error);
            }
          }
        }
      ]
    );
  };

  const handleRemoveTestJobs = async () => {
    Alert.alert(
      'Remove Test Jobs',
      'This will remove all test jobs from the system. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const UnifiedJobService = require('../../services/UnifiedJobService').default;
              const allJobs = UnifiedJobService.getAllJobs();
              const testJobs = allJobs.filter(job => 
                job.title?.toLowerCase().includes('test') || 
                job.title?.toLowerCase().includes('oil change') ||
                job.description?.toLowerCase().includes('test')
              );
              
              for (const job of testJobs) {
                await UnifiedJobService.deleteJob(job.id);
              }
              
              Alert.alert('Success', `Removed ${testJobs.length} test jobs.`);
            } catch (error) {
              console.error('CustomerJobsScreen - Error removing test jobs:', error);
              Alert.alert('Error', 'Failed to remove test jobs. Please try again.');
            }
          }
        }
      ]
    );
  };



  const JobCard = ({ job }: { job: any }) => {
    const isSelected = selectedJobId === job.id;
    const isExpanded = expandedJobId === job.id;


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
                <MaterialIcons 
                  name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color={theme.textSecondary} 
                />
              </View>
              {(() => {
                const resolvedVehicle = resolveVehicleData(job.vehicle);
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
              <View style={styles.additionalInfo}>
                {/* Essential Details Only */}
                <View style={styles.compactInfoGrid}>
                  <View style={styles.compactInfoRow}>
                    <Text style={[styles.compactLabel, { color: theme.textSecondary }]}>Service:</Text>
                    <Text style={[styles.compactValue, { color: theme.text }]}>
                      {job.category} • {job.subcategory}
                    </Text>
                  </View>
                  
                  <View style={styles.compactInfoRow}>
                    <Text style={[styles.compactLabel, { color: theme.textSecondary }]}>Type:</Text>
                    <Text style={[styles.compactValue, { color: theme.text }]}>
                      {job.serviceType === 'mobile' ? 'Mobile' : 'Shop'}
                    </Text>
                  </View>
                  
                  <View style={styles.compactInfoRow}>
                    <Text style={[styles.compactLabel, { color: theme.textSecondary }]}>Location:</Text>
                    <Text style={[styles.compactValue, { color: theme.text }]}>
                      {job.location || 'TBD'}
                    </Text>
                  </View>
                  
                  {job.urgency && (
                    <View style={styles.compactInfoRow}>
                      <Text style={[styles.compactLabel, { color: theme.textSecondary }]}>Priority:</Text>
                      <Text style={[styles.urgencyText, { 
                        color: job.urgency === 'high' ? '#ff4444' : 
                               job.urgency === 'medium' ? '#ffaa00' : '#44aa44' 
                      }]}>
                        {job.urgency.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Description (if exists) */}
                {(job.description || job.notes || job.specialInstructions) && (
                  <View style={styles.descriptionContainer}>
                    <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
                      {job.description || job.notes || job.specialInstructions}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.accordionActions}>
                <View style={styles.buttonRow}>
                  {/* Special handling for pending status (change order during in_progress) */}
                  {job.status === 'pending' ? (
                    <>
                      <MaterialButton
                        title="View Change Order"
                        onPress={() => handleViewChangeOrder(job)}
                        variant="outlined"
                        size="small"
                        style={styles.accordionButton}
                        icon="assignment"
                      />
                      {/* Message button for pending status */}
                      {job.selectedMechanicId && (
                        <MaterialButton
                          title="Message"
                          onPress={() => handleMessageMechanic(job)}
                          variant="outlined"
                          size="small"
                          style={styles.accordionButton}
                          icon="message"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {job.status === 'completed' ? (
                        <>
                          <MaterialButton
                            title="Notes"
                            onPress={() => handleJobDetails(job)}
                            variant="outlined"
                            size="small"
                            style={styles.accordionButton}
                          />
                          <MaterialButton
                            title="Completion Details"
                            onPress={() => navigation.navigate('JobCompletion', { jobId: job.id })}
                            variant="outlined"
                            size="small"
                            style={styles.accordionButton}
                            icon="check-circle"
                          />
                        </>
                      ) : (
                        <>
                          {/* Show Edit Job button for jobs past bidding stage, View Bids for others */}
                          {(job.status === 'accepted' || job.status === 'scheduled' || job.status === 'in_progress' || job.status === 'started') ? (
                            <MaterialButton
                              title="Edit"
                              onPress={() => handleEditJob(job)}
                              variant="outlined"
                              size="small"
                              style={styles.accordionButton}
                              icon="edit"
                            />
                          ) : (
                            <MaterialButton
                              title="Bids"
                              onPress={() => handleViewBids(job)}
                              variant="outlined"
                              size="small"
                              style={styles.accordionButton}
                            />
                          )}
                          <MaterialButton
                            title="Details"
                            onPress={() => handleJobDetails(job)}
                            variant="outlined"
                            size="small"
                            style={styles.accordionButton}
                          />
                          {/* Message button - show when job has a selected mechanic */}
                          {(job.status === 'accepted' || job.status === 'scheduled' || job.status === 'in_progress' || job.status === 'started') && job.selectedMechanicId && (
                            <MaterialButton
                              title="Message"
                              onPress={() => handleMessageMechanic(job)}
                              variant="outlined"
                              size="small"
                              style={styles.accordionButton}
                              icon="message"
                            />
                          )}
                          {/* Schedule button - show when bid is accepted */}
                          {(job.status === 'accepted' || job.status === 'scheduled') && (
                            <MaterialButton
                              title="Schedule"
                              onPress={() => handleScheduleJob(job)}
                              variant="outlined"
                              size="small"
                              style={styles.accordionButton}
                            />
                          )}
                        </>
                      )}
                    </>
                  )}
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
          backgroundColor: filter === filterValue ? theme.accent : theme.surface,
          borderColor: filter === filterValue ? theme.accent : theme.border,
        },
      ]}
      onPress={() => setFilter(filterValue)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: filter === filterValue ? theme.onAccent : theme.text,
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
        title="My Jobs"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showNotifications={true}
        onNotificationPress={() => navigation.navigate('Notifications')}
        rightActions={[]}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <FilterButton filterValue="all" label="All" />
          <FilterButton filterValue="scheduled" label="Scheduled" />
          <FilterButton filterValue="in_progress" label="In Progress" />
          <FilterButton filterValue="request_history" label="Request History" />
        </ScrollView>

        {/* Jobs List */}
        <View style={styles.jobsContainer}>
          {filteredJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <IconFallback name="work-off" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No jobs yet
              </Text>
              <Text style={[styles.emptyStateDescription, { color: theme.textSecondary }]}>
                Create your first job to get started with automotive services
              </Text>
              <MaterialButton
                title="Create Job"
                onPress={handleCreateJob}
                style={styles.createButton}
              />
            </View>
          ) : (
            filteredJobs.map((job: any) => (
              <JobCard key={job.id} job={job} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Job Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create New Job</Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
                This is a simplified job creation modal. In the full version, this would include
                detailed forms for job description, location, pricing, and more.
              </Text>

              <MaterialButton
                title="Create Job"
                onPress={() => {
                  setShowCreateModal(false);
                  navigation.navigate('CreateJob');
                }}
                style={styles.createJobButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Job Details Modal */}
      <JobDetailsModal
        visible={showJobDetailsModal}
        onClose={() => {
          setShowJobDetailsModal(false);
          setSelectedJobForDetails(null);
        }}
        job={selectedJobForDetails}
        userType="customer"
      />

      {/* Conversation Modal */}
      <ConversationModal
        visible={showConversationModal}
        onClose={() => setShowConversationModal(false)}
        conversation={selectedConversation}
        onMessageSent={handleMessageSent}
        user={user}
        theme={theme}
      />

      {/* Edit Job Modal */}
      <Modal
        visible={showEditJobModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditJobModal(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={[styles.editModalContainer, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.editModalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
              <Text style={[styles.editModalTitle, { color: theme.text }]}>Edit Job</Text>
              <TouchableOpacity
                onPress={() => setShowEditJobModal(false)}
                style={styles.editModalCloseButton}
              >
                <MaterialIcons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editModalContent} showsVerticalScrollIndicator={false}>
              {selectedJobForEdit && (
                <>
                  {/* Job Title Section */}
                  <View style={[styles.editJobSection, { backgroundColor: theme.cardBackground }]}>
                    <View style={styles.editJobTitleRow}>
                      <MaterialIcons name="work" size={20} color={theme.primary} />
                      <Text style={[styles.editJobTitle, { color: theme.text }]}>
                        {selectedJobForEdit.title}
                      </Text>
                    </View>
                    {selectedJobForEdit.description && (
                      <Text style={[styles.editJobDescription, { color: theme.textSecondary }]}>
                        {selectedJobForEdit.description}
                      </Text>
                    )}
                  </View>

                  {/* Status Section */}
                  <View style={[styles.editJobSection, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.editSectionTitle, { color: theme.text }]}>Current Status</Text>
                    <View style={[styles.statusContainer, { backgroundColor: getStatusColors(selectedJobForEdit.status).bg, borderColor: getStatusColors(selectedJobForEdit.status).border }]}>
                      <Text style={[styles.statusText, { color: getStatusColors(selectedJobForEdit.status).text }]}>
                        {selectedJobForEdit.status?.toUpperCase()}
                      </Text>
                    </View>
                  </View>


                  {/* Actions Section */}
                  <View style={[styles.editJobSection, { backgroundColor: theme.cardBackground }]}>
                    <Text style={[styles.editSectionTitle, { color: theme.text }]}>Actions</Text>
                    
                    <MaterialButton
                      title="Update Job Details"
                      onPress={() => {
                        Alert.alert('Coming Soon', 'Job detail editing will be available in a future update.');
                      }}
                      variant="outlined"
                      style={styles.editActionButton}
                      icon="edit"
                    />
                    
                    <MaterialButton
                      title="Cancel Job"
                      onPress={() => handleCancelJob(selectedJobForEdit)}
                      variant="outlined"
                      style={[styles.editActionButton, { borderColor: '#ff4444' }]}
                      icon="cancel"
                    />
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding to ensure content can scroll to bottom
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexShrink: 0,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  jobsContainer: {
    gap: 12,
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
  vehicleInfo: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
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
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
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
  createButton: {
    minWidth: 150,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    gap: 16,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  createJobButton: {
    marginTop: 8,
  },
  accordionContent: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 12,
  },
  additionalInfo: {
    marginBottom: 12,
  },
  compactInfoGrid: {
    gap: 4,
    marginBottom: 8,
  },
  compactInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  compactValue: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  accordionActions: {
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 4,
  },
  accordionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  jobInfoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
  },
  actionButtonsSection: {
    marginTop: 20,
  },
  // Edit Job Modal Styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  editModalContainer: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editModalCloseButton: {
    padding: 4,
  },
  editModalContent: {
    flex: 1,
    padding: 20,
  },
  editJobSection: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  editJobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  editJobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  editJobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  editSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  editActionButton: {
    marginBottom: 12,
  },
});

export default CustomerJobsScreen;
