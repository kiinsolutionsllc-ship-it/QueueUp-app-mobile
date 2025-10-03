import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { useVehicle } from '../../contexts/VehicleContext';
import { useUnifiedMessaging } from '../../contexts/UnifiedMessagingContext';
import { formatVehicle } from '../../utils/UnifiedJobFormattingUtils';
import { formatJobCost } from '../../utils/JobCostUtils';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import ConversationModal from '../../components/modals/ConversationModal';
import { Conversation } from '../../types/MessagingTypes';

interface JobDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      jobId: string;
    };
  };
}

const JobDetailsScreen: React.FC<JobDetailsScreenProps> = ({ navigation, route }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { getJobsByCustomer, updateJobStatus } = useJob();
  const { vehicles } = useVehicle();
  const { findOrCreateConversation } = useUnifiedMessaging();
  const theme = getCurrentTheme();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showConversationModal, setShowConversationModal] = useState<boolean>(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Helper function to resolve vehicle data
  const resolveVehicleData = (vehicle: any) => {
    if (!vehicle) return null;
    
    if (typeof vehicle === 'object' && vehicle.make && vehicle.model) {
      return vehicle;
    }
    
    if (typeof vehicle === 'string' && /^\d{13,}$/.test(vehicle)) {
      const fullVehicle = vehicles.find(v => v.id === vehicle);
      if (fullVehicle) {
        return fullVehicle;
      }
    }
    
    return vehicle;
  };

  useEffect(() => {
    const loadJob = () => {
      try {
        const customerJobs = getJobsByCustomer(user?.id || '');
        const foundJob = customerJobs.find((j: any) => j.id === route.params.jobId);
        setJob(foundJob || null);
      } catch (error) {
        console.error('Error loading job:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [route.params.jobId, user?.id, getJobsByCustomer]);

  const handleMessageMechanic = async () => {
    if (!job?.selectedMechanicId) {
      Alert.alert('No Mechanic', 'No mechanic has been selected for this job yet.');
      return;
    }

    try {
      const customerId = user?.id || '';
      const participantIds = [customerId, job.selectedMechanicId];
      const participantNames = [user?.name || 'Customer', job.mechanicName || 'Mechanic'];
      
      // Find or create conversation using the messaging context
      const result = await findOrCreateConversation(participantIds, job.id, participantNames);
      
      if (result.success && result.conversation) {
        // Use the conversation from the messaging service
        setSelectedConversation(result.conversation);
        setShowConversationModal(true);
      } else {
        // Fallback: Create a local conversation object if the service fails
        const fallbackConversation: Conversation = {
          id: `conv-${job.id}-${job.selectedMechanicId}`,
          participants: participantIds,
          jobId: job.id,
          type: 'job_related',
          title: job.mechanicName || 'Mechanic',
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCounts: {},
          isPinned: false,
          isArchived: false,
          isMuted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {
            jobTitle: job.title,
            mechanicName: job.mechanicName,
            customerName: user?.name || 'Customer',
            vehicleInfo: job.vehicle ? formatVehicle(resolveVehicleData(job.vehicle)) : 'Unknown Vehicle',
            priority: job.urgency || 'medium',
          },
        };
        
        setSelectedConversation(fallbackConversation);
        setShowConversationModal(true);
      }
    } catch (error) {
      console.error('Error creating/finding conversation:', error);
      // Show error and fallback to local conversation
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    }
  };

  const handleEditJob = () => {
    Alert.alert(
      'Edit Job',
      'This would open the job editing screen. Feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleCancelJob = async () => {
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
              console.log('Cancelling job:', job.id);
              
              // Update job status to cancelled
              const result = await updateJobStatus(job.id, 'cancelled');
              
              if (result.success) {
                Alert.alert(
                  'Job Cancelled', 
                  'Your job has been cancelled successfully.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                Alert.alert(
                  'Error', 
                  result.error || 'Failed to cancel job. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              console.error('Error cancelling job:', error);
              Alert.alert(
                'Error', 
                'An error occurred while cancelling the job. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const handleMessageSent = () => {
    console.log('Message sent in conversation modal');
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ModernHeader
          title="Job Details"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading job details...</Text>
        </View>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ModernHeader
          title="Job Details"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <IconFallback name="error" size={48} color={theme.textSecondary} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Job Not Found</Text>
          <Text style={[styles.errorDescription, { color: theme.textSecondary }]}>
            The job you're looking for could not be found.
          </Text>
        </View>
      </View>
    );
  }

  const resolvedVehicle = resolveVehicleData(job.vehicle);
  const formattedVehicle = formatVehicle(resolvedVehicle);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Job Details"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Job Header */}
        <MaterialCard style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <View style={styles.jobInfo}>
              <Text style={[styles.jobTitle, { color: theme.text }]}>{job.title}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: theme.primary + '20' }
              ]}>
                <Text style={[styles.statusText, { color: theme.primary }]}>
                  {job.status?.toUpperCase() || 'UNKNOWN'}
                </Text>
              </View>
            </View>
          </View>

          {formattedVehicle && (
            <View style={styles.vehicleInfo}>
              <IconFallback name="directions-car" size={16} color={theme.textSecondary} />
              <Text style={[styles.vehicleText, { color: theme.textSecondary }]}>
                {formattedVehicle}
              </Text>
            </View>
          )}
        </MaterialCard>

        {/* Job Details */}
        <MaterialCard style={styles.detailsCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Job Information</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Service:</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {job.category} • {job.subcategory}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Type:</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {job.serviceType === 'mobile' ? 'Mobile Service' : 'Shop Service'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Location:</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {job.location || 'TBD'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Total Cost:</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatJobCost(job)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Duration:</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {job.estimatedTime || job.estimatedDuration || 'TBD'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Created:</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {new Date(job.createdAt || Date.now()).toLocaleDateString()}
              </Text>
            </View>
            
            {job.urgency && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Priority:</Text>
                <Text style={[
                  styles.urgencyText,
                  { 
                    color: job.urgency === 'high' ? '#ff4444' : 
                           job.urgency === 'medium' ? '#ffaa00' : '#44aa44' 
                  }
                ]}>
                  {job.urgency.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </MaterialCard>

        {/* Description */}
        {(job.description || job.notes || job.specialInstructions) && (
          <MaterialCard style={styles.descriptionCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
            <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
              {job.description || job.notes || job.specialInstructions}
            </Text>
          </MaterialCard>
        )}

        {/* Action Buttons */}
        <MaterialCard style={styles.actionsCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Actions</Text>
          
          <View style={styles.actionButtons}>
            {job.status === 'accepted' && job.selectedMechanicId && (
              <MaterialButton
                title="Message Mechanic"
                onPress={handleMessageMechanic}
                variant="contained"
                style={styles.actionButton}
                icon="message"
              />
            )}
            
            <MaterialButton
              title="Edit Job"
              onPress={handleEditJob}
              variant="outlined"
              style={styles.actionButton}
              icon="edit"
            />
            
            {(job.status === 'posted' || job.status === 'pending' || job.status === 'bidding') && (
              <MaterialButton
                title="Cancel Job"
                onPress={handleCancelJob}
                variant="outlined"
                style={[styles.actionButton, { borderColor: '#ff4444' }]}
                icon="cancel"
              />
            )}
          </View>
        </MaterialCard>
      </ScrollView>

      {/* Conversation Modal */}
      <ConversationModal
        visible={showConversationModal}
        onClose={() => setShowConversationModal(false)}
        conversation={selectedConversation}
        onMessageSent={handleMessageSent}
        user={user}
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
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  jobCard: {
    marginBottom: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsCard: {
    marginBottom: 16,
  },
  descriptionCard: {
    marginBottom: 16,
  },
  actionsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailsGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default JobDetailsScreen;
