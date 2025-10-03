import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useJob } from '../../contexts/SimplifiedJobContext';
// JobAssignmentService removed - using UnifiedJobService through SimplifiedJobContext

const ScheduleConfirmationCard = ({ job, onResponse }) => {
  const { getCurrentTheme } = useTheme();
  const { updateJob } = useJob();
  const theme = getCurrentTheme();
  const [isResponding, setIsResponding] = useState(false);

  const handleAcceptSchedule = async () => {
    setIsResponding(true);
    try {
      const result = await updateJob(job.id, { 
        status: 'confirmed',
        mechanicResponse: 'accepted',
        respondedAt: new Date().toISOString()
      });
      
      if (result) {
        Alert.alert(
          'Schedule Accepted!',
          'You have accepted the proposed schedule. The customer has been notified.',
          [{ text: 'OK', onPress: () => onResponse && onResponse('accepted') }]
        );
      } else {
        throw new Error('Failed to accept schedule');
      }
    } catch (error) {
      console.error('Error accepting schedule:', error);
      Alert.alert('Error', 'Failed to accept schedule. Please try again.');
    } finally {
      setIsResponding(false);
    }
  };

  const handleDeclineSchedule = () => {
    Alert.alert(
      'Decline Schedule',
      'Would you like to suggest an alternative time?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Suggest Alternative', 
          onPress: () => {
            // For now, just decline without alternative
            // In a real app, this would open a time picker
            Alert.alert(
              'Alternative Time',
              'Please contact the customer directly to suggest an alternative time.',
              [{ text: 'OK' }]
            );
          }
        },
        { 
          text: 'Just Decline', 
          style: 'destructive',
          onPress: async () => {
            setIsResponding(true);
            try {
              const result = await updateJob(job.id, { 
                status: 'scheduled',
                mechanicResponse: 'declined',
                respondedAt: new Date().toISOString()
              });
              
              if (result) {
                Alert.alert(
                  'Schedule Declined',
                  'You have declined the proposed schedule. The customer has been notified.',
                  [{ text: 'OK', onPress: () => onResponse && onResponse('declined') }]
                );
              } else {
                throw new Error('Failed to decline schedule');
              }
            } catch (error) {
              console.error('Error declining schedule:', error);
              Alert.alert('Error', 'Failed to decline schedule. Please try again.');
            } finally {
              setIsResponding(false);
            }
          }
        }
      ]
    );
  };

  if (job.status !== 'scheduled') {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.header}>
        <IconFallback name="schedule" size={24} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>
          Schedule Confirmation Required
        </Text>
      </View>
      
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        A schedule has been proposed for this job. Please confirm or suggest an alternative.
      </Text>
      
      <View style={[styles.scheduleInfo, { backgroundColor: theme.surface }]}>
        <View style={styles.scheduleRow}>
          <IconFallback name="event" size={16} color={theme.textSecondary} />
          <Text style={[styles.scheduleText, { color: theme.text }]}>
            {job.scheduledDate}
          </Text>
        </View>
        <View style={styles.scheduleRow}>
          <IconFallback name="access-time" size={16} color={theme.textSecondary} />
          <Text style={[styles.scheduleText, { color: theme.text }]}>
            {job.scheduledTime}
          </Text>
        </View>
        {job.location && (
          <View style={styles.scheduleRow}>
            <IconFallback name="location-on" size={16} color={theme.textSecondary} />
            <Text style={[styles.scheduleText, { color: theme.text }]}>
              {job.location}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.declineButton, { backgroundColor: theme.error + '20' }]}
          onPress={handleDeclineSchedule}
          disabled={isResponding}
        >
          <IconFallback name="close" size={16} color={theme.error} />
          <Text style={[styles.buttonText, { color: theme.error }]}>
            Decline
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.acceptButton, { backgroundColor: theme.success + '20' }]}
          onPress={handleAcceptSchedule}
          disabled={isResponding}
        >
          <IconFallback name="check" size={16} color={theme.success} />
          <Text style={[styles.buttonText, { color: theme.success }]}>
            Accept
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  scheduleInfo: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  scheduleText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    // Styling handled by backgroundColor
  },
  declineButton: {
    // Styling handled by backgroundColor
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ScheduleConfirmationCard;
