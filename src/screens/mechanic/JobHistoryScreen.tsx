import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { useJob } from '../../contexts/SimplifiedJobContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';

interface JobHistoryScreenProps {
  navigation: any;
}

const JobHistoryScreen: React.FC<JobHistoryScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { getJobsByMechanic } = useJob();
  const theme = getCurrentTheme();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Get mechanic jobs
  const mechanicJobs = getJobsByMechanic(user?.id || '');
  const completedJobs = mechanicJobs.filter((job: any) => job.status === 'completed');
  const cancelledJobs = mechanicJobs.filter((job: any) => job.status === 'cancelled');
  const allHistoryJobs = [...completedJobs, ...cancelledJobs].sort((a: any, b: any) => 
    new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime()
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getFilteredJobs = () => {
    switch (activeFilter) {
      case 'completed':
        return completedJobs;
      case 'cancelled':
        return cancelledJobs;
      default:
        return allHistoryJobs;
    }
  };

  const FilterButton = ({ 
    filter, 
    label, 
    count 
  }: {
    filter: string;
    label: string;
    count: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: activeFilter === filter ? theme.primary : theme.surface,
          borderColor: activeFilter === filter ? theme.primary : theme.border,
        },
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: activeFilter === filter ? theme.onPrimary : theme.text,
          },
        ]}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const JobCard = ({ job }: { job: any }) => (
    <MaterialCard style={styles.jobCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('JobDetails', { jobId: job.id })}
      >
        <View style={styles.jobHeader}>
          <View style={styles.jobInfo}>
            <Text style={[styles.jobTitle, { color: theme.text }]}>{job.title}</Text>
            <Text style={[styles.jobCustomer, { color: theme.textSecondary }]}>
              Customer: {job.customerName || 'Unknown'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
              {job.status?.toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
        </View>

        <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
          {job.description}
        </Text>

        <View style={styles.jobFooter}>
          <View style={styles.jobDetails}>
            <View style={styles.jobDetail}>
              <IconFallback name="attach-money" size={16} color={theme.textSecondary} />
              <Text style={[styles.jobDetailText, { color: theme.text }]}>
                ${job.price || 0}
              </Text>
            </View>
            <View style={styles.jobDetail}>
              <IconFallback name="schedule" size={16} color={theme.textSecondary} />
              <Text style={[styles.jobDetailText, { color: theme.text }]}>
                {job.estimatedDuration || 0} min
              </Text>
            </View>
            <View style={styles.jobDetail}>
              <IconFallback name="location-on" size={16} color={theme.textSecondary} />
              <Text style={[styles.jobDetailText, { color: theme.text }]}>
                {job.location || 'Unknown'}
              </Text>
            </View>
          </View>
          <Text style={[styles.jobDate, { color: theme.textSecondary }]}>
            {new Date(job.createdAt || Date.now()).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </MaterialCard>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.success;
      case 'cancelled':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  const filteredJobs = getFilteredJobs();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Job History"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter Buttons */}
        <View style={styles.filterSection}>
          <FilterButton filter="all" label="All Jobs" count={allHistoryJobs.length} />
          <FilterButton filter="completed" label="Completed" count={completedJobs.length} />
          <FilterButton filter="cancelled" label="Cancelled" count={cancelledJobs.length} />
        </View>

        {/* Job List */}
        <View style={styles.jobsSection}>
          {filteredJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <IconFallback name="work-off" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No {activeFilter === 'all' ? '' : activeFilter} jobs found
              </Text>
              <Text style={[styles.emptyStateDescription, { color: theme.textSecondary }]}>
                {activeFilter === 'all' 
                  ? 'You haven\'t completed any jobs yet'
                  : `You don't have any ${activeFilter} jobs in your history`
                }
              </Text>
            </View>
          ) : (
            <View style={styles.jobsList}>
              {filteredJobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </View>
          )}
        </View>

        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatValue, { color: theme.success }]}>
                {completedJobs.length}
              </Text>
              <Text style={[styles.summaryStatLabel, { color: theme.textSecondary }]}>
                Completed
              </Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatValue, { color: theme.error }]}>
                {cancelledJobs.length}
              </Text>
              <Text style={[styles.summaryStatLabel, { color: theme.textSecondary }]}>
                Cancelled
              </Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryStatValue, { color: theme.primary }]}>
                {allHistoryJobs.length}
              </Text>
              <Text style={[styles.summaryStatLabel, { color: theme.textSecondary }]}>
                Total
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  filterSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  jobsSection: {
    marginBottom: 24,
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobInfo: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  jobCustomer: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobDetailText: {
    fontSize: 12,
  },
  jobDate: {
    fontSize: 12,
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
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
  },
});

export default JobHistoryScreen;
