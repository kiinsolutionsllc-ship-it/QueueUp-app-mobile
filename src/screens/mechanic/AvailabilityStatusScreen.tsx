import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';


interface AvailabilityStatusScreenProps {
  navigation: any;
}
export default function AvailabilityStatusScreen({ navigation }: AvailabilityStatusScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { 
    availabilityStatus, 
    workingHours, 
    updateAvailabilityStatus, 
    updateWorkingHours 
  } = useAuth();
  const theme = getCurrentTheme();

  const [currentStatus, setCurrentStatus] = useState<any>(availabilityStatus);
  const [hours, setHours] = useState<any>(workingHours);
  const [isEditing, setIsEditing] = useState<any>(false);

  const statusOptions = [
    { key: 'available', label: 'Available', icon: 'check-circle', color: theme.success },
    { key: 'busy', label: 'Busy', icon: 'schedule', color: theme.warning },
    { key: 'offline', label: 'Offline', icon: 'pause-circle', color: theme.error },
    { key: 'break', label: 'On Break', icon: 'coffee', color: theme.info },
  ];

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleStatusChange = async (newStatus: any) => {
    try {
      setCurrentStatus(newStatus);
      await updateAvailabilityStatus(newStatus);
      Alert.alert('Success', 'Availability status updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update availability status');
      setCurrentStatus(availabilityStatus);
    }
  };

  const handleHoursChange = async (day: any, field: any, value: any) => {
    try {
      const newHours = {
        ...hours,
        [day]: {
          ...hours[day],
          [field]: value,
        },
      };
      setHours(newHours);
      
      await updateWorkingHours(newHours);
    } catch (error) {
      Alert.alert('Error', 'Failed to update working hours');
      setHours(workingHours);
    }
  };

  const handleSaveChanges = () => {
    Alert.alert('Success', 'All changes have been saved!');
    setIsEditing(false);
  };

  const handleResetHours = () => {
    Alert.alert(
      'Reset Hours',
      'Are you sure you want to reset all working hours to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultHours = {
              monday: { start: '09:00', end: '17:00', enabled: true },
              tuesday: { start: '09:00', end: '17:00', enabled: true },
              wednesday: { start: '09:00', end: '17:00', enabled: true },
              thursday: { start: '09:00', end: '17:00', enabled: true },
              friday: { start: '09:00', end: '17:00', enabled: true },
              saturday: { start: '10:00', end: '16:00', enabled: false },
              sunday: { start: '10:00', end: '16:00', enabled: false },
            };
            setHours(defaultHours);
          },
        },
      ]
    );
  };

  const StatusCard = ({ status }: any) => (
    <TouchableOpacity
      style={[
        styles.statusCard,
        { 
          backgroundColor: theme.cardBackground,
          borderColor: currentStatus === status.key ? status.color : 'transparent',
          borderWidth: currentStatus === status.key ? 2 : 1,
        }
      ]}
      onPress={() => handleStatusChange(status.key)}
    >
      <View style={styles.statusContent}>
        <View style={[styles.statusIcon, { backgroundColor: status.color + '20' }]}>
          <IconFallback name={status.icon} size={24} color={status.color} />
        </View>
        <View style={styles.statusText}>
          <Text style={[styles.statusLabel, { color: theme.text }]}>{status.label}</Text>
          <Text style={[styles.statusDescription, { color: theme.textSecondary }]}>
            {status.key === 'available' && 'Ready to accept new jobs'}
            {status.key === 'busy' && 'Currently working on jobs'}
            {status.key === 'offline' && 'Not available for jobs'}
            {status.key === 'break' && 'Taking a break, back soon'}
          </Text>
        </View>
        {currentStatus === status.key && (
          <IconFallback name="check" size={24} color={status.color} />
        )}
      </View>
    </TouchableOpacity>
  );

  const DaySchedule = ({ day, dayName }: any) => (
    <MaterialCard style={[styles.dayCard, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.dayHeader}>
        <Text style={[styles.dayName, { color: theme.text }]}>{dayName}</Text>
        <Switch
          value={hours[day]?.enabled || false}
          onValueChange={(value) => handleHoursChange(day, 'enabled', value)}
          trackColor={{ false: theme.divider, true: theme.primary }}
          thumbColor={hours[day]?.enabled ? theme.onPrimary : theme.textLight}
        />
      </View>
      
      {hours[day]?.enabled && (
        <View style={styles.timeRow}>
          <View style={styles.timeInput}>
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Start</Text>
            <TouchableOpacity
              style={[styles.timeButton, { backgroundColor: theme.surface }]}
              onPress={() => {
                // In a real app, this would open a time picker
                Alert.alert('Time Picker', 'Time picker would open here');
              }}
            >
              <Text style={[styles.timeText, { color: theme.text }]}>
                {hours[day]?.start || '09:00'}
              </Text>
              <IconFallback name="access-time" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeInput}>
            <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>End</Text>
            <TouchableOpacity
              style={[styles.timeButton, { backgroundColor: theme.surface }]}
              onPress={() => {
                // In a real app, this would open a time picker
                Alert.alert('Time Picker', 'Time picker would open here');
              }}
            >
              <Text style={[styles.timeText, { color: theme.text }]}>
                {hours[day]?.end || '17:00'}
              </Text>
              <IconFallback name="access-time" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </MaterialCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Availability Status"
        subtitle="Manage your availability and working hours"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          {
            icon: isEditing ? 'save' : 'edit',
            onPress: isEditing ? handleSaveChanges : () => setIsEditing(true),
            color: theme.primary,
          },
        ]}
        showNotifications={true}
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile={true}
        profileAvatar={user?.avatar || user?.name || '👨‍🔧'}
        user={user}
        onProfilePress={() => navigation.navigate('MechanicProfile')}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Status</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Choose your current availability status
          </Text>
          
          {statusOptions.map((status) => (
            <StatusCard key={status.key} status={status} />
          ))}
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Working Hours</Text>
            {isEditing && (
              <MaterialButton
                title="Reset"
                onPress={handleResetHours}
                variant="outlined"
                size="small"
                textColor={theme.error}
                style={styles.resetButton}
              />
            )}
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Set your available hours for each day
          </Text>
          
          {dayNames.map((dayName, index) => {
            const day = dayName.toLowerCase();
            return <DaySchedule key={day} day={day} dayName={dayName} />;
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <MaterialButton
              title="Set Available"
              onPress={() => handleStatusChange('available')}
              variant="outlined"
              style={styles.quickActionButton}
              icon="check-circle"
            />
            
            <MaterialButton
              title="Go Offline"
              onPress={() => handleStatusChange('offline')}
              variant="outlined"
              style={styles.quickActionButton}
              icon="pause-circle"
            />
            
            <MaterialButton
              title="Take Break"
              onPress={() => handleStatusChange('break')}
              variant="outlined"
              style={styles.quickActionButton}
              icon="coffee"
            />
          </View>
        </View>

        {/* Availability Tips */}
        <View style={styles.section}>
          <MaterialCard style={[styles.tipsCard, { backgroundColor: theme.info + '20' }]}>
            <View style={styles.tipsHeader}>
              <IconFallback name="lightbulb" size={24} color={theme.info} />
              <Text style={[styles.tipsTitle, { color: theme.text }]}>Availability Tips</Text>
            </View>
            <Text style={[styles.tipsText, { color: theme.textSecondary }]}>
              • Keep your status updated to get more relevant job matches{'\n'}
              • Set realistic working hours to avoid overbooking{'\n'}
              • Use "On Break" status for short breaks{'\n'}
              • Go offline when you're not available for extended periods{'\n'}
              • Update your hours based on seasonal demand
            </Text>
          </MaterialCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  statusCard: {
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusText: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
  },
  dayCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
  },
  resetButton: {
    borderColor: '#FF6B6B',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
