import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  scheduledDate?: string;
  scheduledTime?: string;
  price?: number;
  location?: string;
  customerName?: string;
  urgency: 'low' | 'medium' | 'high';
  serviceType?: string;
  [key: string]: any;
}

interface DateJobsModalProps {
  visible: boolean;
  selectedDate: Date | null;
  jobs: Job[];
  onClose: () => void;
  onJobPress: (jobId: string) => void;
}

const DateJobsModal: React.FC<DateJobsModalProps> = ({
  visible,
  selectedDate,
  jobs,
  onClose,
  onJobPress,
}) => {
  const { getCurrentTheme, getStatusColor } = useTheme();
  const theme = getCurrentTheme();

  // Filter jobs for the selected date
  const getJobsForDate = (date: Date) => {
    const filteredJobs = jobs.filter((job) => {
      if (!job.scheduledDate) {
        return false;
      }
      
      // Handle different date formats
      let jobDate;
      if (typeof job.scheduledDate === 'string') {
        jobDate = new Date(job.scheduledDate);
      } else {
        jobDate = new Date(job.scheduledDate);
      }
      
      const matches = jobDate.toDateString() === date.toDateString();
      return matches;
    });
    
    return filteredJobs;
  };

  const jobsForDate = selectedDate ? getJobsForDate(selectedDate) : [];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollableContent}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Jobs List */}
            {jobsForDate.length === 0 ? (
              <View style={styles.emptyState}>
                <IconFallback name="event-available" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No jobs scheduled</Text>
                <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
                  No jobs are assigned to you for this date
                </Text>
              </View>
            ) : (
              <View style={styles.jobsContainer}>
                {jobsForDate.map((job) => (
                    <TouchableOpacity
                      key={job.id}
                      style={[styles.jobCard, { backgroundColor: theme.background }]}
                      onPress={() => {
                        onClose();
                        onJobPress(job.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.timeBadge, { backgroundColor: theme.primary + '20' }]}>
                        <Text style={[styles.timeText, { color: theme.primary }]}>
                          {job.scheduledTime || 'TBD'}
                        </Text>
                      </View>
                      <View style={styles.jobInfo}>
                        <Text style={[styles.jobTitle, { color: theme.text }]}>{job.title}</Text>
                        <Text style={[styles.jobDetails, { color: theme.textSecondary }]}>
                          {job.serviceType === 'mobile' ? '🚗 Mobile' : '🏪 Shop'} • ${job.price || 'TBD'}
                        </Text>
                        <Text style={[styles.jobLocation, { color: theme.textSecondary }]}>
                          📍 {job.location || 'Location TBD'}
                        </Text>
                        <Text style={[styles.jobCustomer, { color: theme.textSecondary }]}>
                          👤 {job.customerName || 'Customer TBD'}
                        </Text>
                      </View>
                      <View style={styles.jobStatus}>
                        <View style={[
                          styles.statusDot, 
                          { backgroundColor: getStatusColor(job.status) }
                        ]} />
                        {job.urgency === 'high' && (
                          <Text style={[styles.urgentText, { color: theme.error }]}>URGENT</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 16,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollableContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  jobsContainer: {
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  jobDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  jobLocation: {
    fontSize: 12,
    marginBottom: 2,
  },
  jobCustomer: {
    fontSize: 12,
  },
  jobStatus: {
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgentText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default DateJobsModal;
