import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
import ModernHeader from '../../components/shared/ModernHeader';
import { hapticService } from '../../services/HapticService';


interface ActiveJobsScreenProps {
  navigation: any;
}
export default function ActiveJobsScreen({ navigation }: ActiveJobsScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { getJobsByMechanic } = useJob();
  const theme = getCurrentTheme();

  const [refreshing, setRefreshing] = useState<any>(false);
  const [activeFilter, setActiveFilter] = useState<any>('all');

  const mechanicJobs = getJobsByMechanic(getFallbackUserIdWithTypeDetection(user?.id, user?.user_type));
  const activeJobs = mechanicJobs.filter(job => job.status === 'in_progress');
  const scheduledJobs = mechanicJobs.filter(job => job.status === 'scheduled');
  const completedJobs = mechanicJobs.filter(job => job.status === 'completed');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getFilteredJobs = () => {
    switch (activeFilter) {
      case 'active':
        return activeJobs;
      case 'scheduled':
        return scheduledJobs;
      case 'completed':
        return completedJobs;
      default:
        return [...activeJobs, ...scheduledJobs, ...completedJobs];
    }
  };

  const handleJobPress = (job) => {
    // Navigate to job details
    Alert.alert('Job Details', `Viewing details for: ${job.title}`);
  };

  const handleUpdateStatus = (job, newStatus) => {
    Alert.alert('Update Status', `Update job status to: ${newStatus}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return theme.primary;
      case 'scheduled': return theme.warning;
      case 'completed': return theme.success;
      default: return theme.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_progress': return 'build';
      case 'scheduled': return 'schedule';
      case 'completed': return 'check-circle';
      default: return 'help';
    }
  };

  const filteredJobs = getFilteredJobs();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="My Jobs"
        subtitle="Manage your active jobs"
        rightActions={[
          { icon: 'search', onPress: () => Alert.alert('Search Jobs', 'Search functionality coming soon!') },
          { icon: 'filter-list', onPress: () => Alert.alert('Filter Jobs', 'Filter functionality coming soon!') },
        ]}
        showNotifications={true}
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile={true}
        profileAvatar={user?.avatar || user?.name || '👨‍🔧'}
        user={user}
        onProfilePress={() => navigation.navigate('MechanicProfile')}
      />

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: activeFilter === 'all' ? theme.primary : 'transparent' }
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              { color: activeFilter === 'all' ? theme.onPrimary : theme.textSecondary }
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: activeFilter === 'active' ? theme.primary : 'transparent' }
          ]}
          onPress={() => setActiveFilter('active')}
        >
          <Text
            style={[
              styles.filterText,
              { color: activeFilter === 'active' ? theme.onPrimary : theme.textSecondary }
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: activeFilter === 'scheduled' ? theme.primary : 'transparent' }
          ]}
          onPress={() => setActiveFilter('scheduled')}
        >
          <Text
            style={[
              styles.filterText,
              { color: activeFilter === 'scheduled' ? theme.onPrimary : theme.textSecondary }
            ]}
          >
            Scheduled
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            { backgroundColor: activeFilter === 'completed' ? theme.primary : 'transparent' }
          ]}
          onPress={() => setActiveFilter('completed')}
        >
          <Text
            style={[
              styles.filterText,
              { color: activeFilter === 'completed' ? theme.onPrimary : theme.textSecondary }
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <View key={job.id} style={[styles.jobCard, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.jobHeader}>
                <View style={styles.jobInfo}>
                  <Text style={[styles.jobTitle, { color: theme.text }]}>
                    {job.title}
                  </Text>
                  <Text style={[styles.jobCategory, { color: theme.textSecondary }]}>
                    {job.category} • {job.customerName}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                  <IconFallback name={getStatusIcon(job.status)} size={16} color={getStatusColor(job.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                    {job.status ? job.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
                {job.description}
              </Text>

              <View style={styles.jobDetails}>
                <View style={styles.jobDetailItem}>
                  <IconFallback name="schedule" size={16} color={theme.textSecondary} />
                  <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                    {job.estimatedDuration} min
                  </Text>
                </View>
                <View style={styles.jobDetailItem}>
                  <IconFallback name="attach-money" size={16} color={theme.textSecondary} />
                  <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                    ${job.price}
                  </Text>
                </View>
                <View style={styles.jobDetailItem}>
                  <IconFallback name="location-on" size={16} color={theme.textSecondary} />
                  <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                    {job.location}
                  </Text>
                </View>
              </View>

              <View style={styles.jobActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
                  onPress={() => handleJobPress(job)}
                >
                  <IconFallback name="visibility" size={16} color={theme.primary} />
                  <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                    View Details
                  </Text>
                </TouchableOpacity>

                {job.status === 'in_progress' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.success + '20' }]}
                    onPress={() => handleUpdateStatus(job, 'completed')}
                  >
                    <IconFallback name="check" size={16} color={theme.success} />
                    <Text style={[styles.actionButtonText, { color: theme.success }]}>
                      Complete
                    </Text>
                  </TouchableOpacity>
                )}

                {job.status === 'scheduled' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.warning + '20' }]}
                    onPress={() => handleUpdateStatus(job, 'in_progress')}
                  >
                    <IconFallback name="play-arrow" size={16} color={theme.warning} />
                    <Text style={[styles.actionButtonText, { color: theme.warning }]}>
                      Start
                    </Text>
                  </TouchableOpacity>
                )}

                  <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.info + '20' }]}
                  onPress={async () => {
                    // Navigate to messaging screen with customer context
                    navigation.navigate('Messaging', { 
                      customerId: job.customerId || getFallbackUserIdWithTypeDetection(user?.id, user?.user_type),
                      customerName: job.customerName || 'Customer',
                      jobId: job.id
                    });
                  }}
                >
                  <IconFallback name="chat" size={16} color={theme.info} />
                  <Text style={[styles.actionButtonText, { color: theme.info }]}>
                    Message
                  </Text>
                </TouchableOpacity>

                {(job.status === 'in_progress' || job.status === 'scheduled') && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.warning + '20' }]}
                    onPress={async () => {
                      await hapticService.buttonPress();
                      navigation.navigate('ChangeOrderRequest', { jobId: job.id });
                    }}
                  >
                    <IconFallback name="add" size={16} color={theme.warning} />
                    <Text style={[styles.actionButtonText, { color: theme.warning }]}>
                      Add Work
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.cardBackground }]}>
            <IconFallback name="work" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No jobs found
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {activeFilter === 'all' 
                ? 'You don\'t have any jobs yet' 
                : `No ${activeFilter} jobs found`
              }
            </Text>
            <TouchableOpacity
              style={[styles.findJobsButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Jobs')}
            >
              <Text style={[styles.findJobsButtonText, { color: theme.onPrimary }]}>
                Find Jobs
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  jobCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jobCategory: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  jobDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
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
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  findJobsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  findJobsButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});
