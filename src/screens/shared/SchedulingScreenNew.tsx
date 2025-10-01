import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useJob } from '../../contexts/SimplifiedJobContext';
import IconFallback from '../../components/shared/IconFallback';
// JobAssignmentService removed - using UnifiedJobService through SimplifiedJobContext
import { hapticService } from '../../services/HapticService';

const SchedulingScreenNew = ({ navigation, route }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { updateJob, scheduleJob, getJob } = useJob();
  const theme = getCurrentTheme();

  // Get job and bid from route params
  const { job: routeJob, bid } = route.params || {};
  
  // Debug: Log route params
  console.log('SchedulingScreenNew - Route params:', route.params);
  
  // Get full job object if we have a job ID but incomplete job data
  const job = routeJob && routeJob.id ? routeJob : (routeJob?.id ? getJob(routeJob.id) : routeJob);
  
  // State management
  const [selectedDate, setSelectedDate] = useState<any>('');
  const [selectedTime, setSelectedTime] = useState<any>('');
  const [estimatedDuration, setEstimatedDuration] = useState<any>(60);
  const [specialInstructions, setSpecialInstructions] = useState<any>('');
  const [isScheduling, setIsScheduling] = useState<any>(false);

  // Initialize component
  useEffect(() => {
    // Debug: Log job and bid data
    console.log('SchedulingScreenNew - Job data:', job);
    console.log('SchedulingScreenNew - Bid data:', bid);
    
    // Initialize with job/bid data if available
    if (job) {
      setEstimatedDuration(bid?.estimatedDuration || bid?.estimated_duration || 60);
    }
  }, [route.params, job, bid]);

  // Generate available dates (next 7 days for simplicity)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
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

  // Generate available time slots (simplified)
  const generateTimeSlots = () => {
    const slots = [];
    const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
    
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

  const handleScheduleJob = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time for the service.');
      return;
    }

    if (!job) {
      Alert.alert('Error', 'No job data available. Please try again.');
      return;
    }

    setIsScheduling(true);
    try {
      await hapticService.medium();

      const scheduleData = {
        date: selectedDate,
        time: selectedTime,
        dateTime: `${selectedDate}T${selectedTime}:00.000Z`,
        estimatedDuration: parseInt(estimatedDuration),
        specialInstructions: specialInstructions.trim(),
      };


      // Ensure the job has the correct mechanic ID before scheduling
      const jobWithMechanicId = {
        ...job,
        selectedMechanicId: job.selectedMechanicId || bid?.mechanicId || bid?.mechanic_id
      };
      

      const result = await scheduleJob(job.id, scheduleData);
      
      if (result.success) {
        await hapticService.success();
        
        Alert.alert(
          'Schedule Proposed!',
          `Your service has been scheduled for ${selectedDate} at ${selectedTime}. The mechanic will be notified and can confirm or suggest a different time.`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        // Provide more specific error messages
        const errorMessage = result.error === 'Job not found' 
          ? 'Job data is not available. Please go back and try again, or refresh the job list.'
          : result.error || 'Failed to schedule job';
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error scheduling job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule job. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsScheduling(false);
    }
  };

  // Show error if no job data
  if (!job) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.statusBarStyle as any} backgroundColor={theme.background} />
        <View style={styles.errorContainer}>
          <IconFallback name="error" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            No job data available. Please try again.
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.retryButtonText, { color: theme.onPrimary }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle as any} backgroundColor={theme.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <IconFallback name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Schedule Service
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Job Info */}
        <View style={[styles.jobInfo, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.jobTitle, { color: theme.text }]}>
            {job.title || job.subcategory || job.category || 'Service Request'}
          </Text>
          <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
            {job.description || job.notes || 'No description available'}
          </Text>
          <View style={styles.jobDetails}>
            <View style={styles.detailRow}>
              <IconFallback name="person" size={16} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {bid?.mechanicName || bid?.mechanic?.name || job.mechanicName || job.assignedMechanicId || 'Mechanic'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <IconFallback name="attach-money" size={16} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                ${bid?.price || job.estimatedCost || job.price || 'TBD'}
              </Text>
            </View>
            {job.urgency && (
              <View style={styles.detailRow}>
                <IconFallback name="warning" size={16} color={theme.textSecondary} />
                <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                  {job.urgency.toUpperCase()}
                </Text>
              </View>
            )}
            {job.status && (
              <View style={styles.detailRow}>
                <IconFallback name="info" size={16} color={theme.textSecondary} />
                <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                  {job.status.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Date Selection */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Select Date
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
                onPress={() => {
                  setSelectedDate(date.value);
                  hapticService.light();
                }}
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
        <View style={[styles.section, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Select Time
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
                onPress={() => {
                  setSelectedTime(time.value);
                  hapticService.light();
                }}
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


        {/* Action Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.scheduleButton, { backgroundColor: theme.primary }]}
            onPress={handleScheduleJob}
            disabled={isScheduling}
          >
            <IconFallback name="schedule" size={20} color={theme.onPrimary} />
            <Text style={[styles.scheduleButtonText, { color: theme.onPrimary }]}>
              {isScheduling ? 'Scheduling...' : 'Schedule Job'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  jobInfo: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
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
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 44,
    fontSize: 16,
  },
  actionButtons: {
    padding: 16,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SchedulingScreenNew;
