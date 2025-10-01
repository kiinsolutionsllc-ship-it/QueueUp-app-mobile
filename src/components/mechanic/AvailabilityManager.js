import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import MaterialButton from '../shared/MaterialButton';

const AVAILABILITY_STATUSES = [
  {
    id: 'available',
    name: 'Available',
    description: 'Ready to take on new jobs',
    color: '#10B981',
    icon: 'check-circle',
  },
  {
    id: 'busy',
    name: 'Busy',
    description: 'Currently working, limited availability',
    color: '#F59E0B',
    icon: 'schedule',
  },
  {
    id: 'unavailable',
    name: 'Unavailable',
    description: 'Not accepting new jobs',
    color: '#EF4444',
    icon: 'cancel',
  },
  {
    id: 'break',
    name: 'On Break',
    description: 'Taking a break, back soon',
    color: '#8B5CF6',
    icon: 'pause',
  },
];

const WORKING_HOURS = [
  { day: 'Monday', start: '08:00', end: '17:00', enabled: true },
  { day: 'Tuesday', start: '08:00', end: '17:00', enabled: true },
  { day: 'Wednesday', start: '08:00', end: '17:00', enabled: true },
  { day: 'Thursday', start: '08:00', end: '17:00', enabled: true },
  { day: 'Friday', start: '08:00', end: '17:00', enabled: true },
  { day: 'Saturday', start: '09:00', end: '15:00', enabled: false },
  { day: 'Sunday', start: '09:00', end: '15:00', enabled: false },
];

export default function AvailabilityManager({ 
  currentStatus = 'available', 
  workingHours = WORKING_HOURS,
  onStatusChange,
  onHoursChange 
}) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [hours, setHours] = useState(workingHours);
  const [showHoursSettings, setShowHoursSettings] = useState(false);

  const handleStatusChange = (statusId) => {
    setSelectedStatus(statusId);
    if (onStatusChange) {
      onStatusChange(statusId);
    }
  };

  const handleSaveAvailability = () => {
    Alert.alert(
      'Availability Updated',
      `Your status has been set to ${AVAILABILITY_STATUSES.find(s => s.id === selectedStatus)?.name}`,
      [
        {
          text: 'OK',
          onPress: () => {
            // In real app, save to backend
          }
        }
      ]
    );
  };

  const toggleDayAvailability = (dayIndex) => {
    const newHours = [...hours];
    newHours[dayIndex].enabled = !newHours[dayIndex].enabled;
    setHours(newHours);
    if (onHoursChange) {
      onHoursChange(newHours);
    }
  };

  const updateWorkingHours = (dayIndex, field, value) => {
    const newHours = [...hours];
    newHours[dayIndex][field] = value;
    setHours(newHours);
    if (onHoursChange) {
      onHoursChange(newHours);
    }
  };

  const renderStatusCard = (status) => {
    const isSelected = selectedStatus === status.id;
    
    return (
      <TouchableOpacity
        key={status.id}
        style={[
          styles.statusCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: isSelected ? status.color : theme.divider,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => handleStatusChange(status.id)}
        activeOpacity={0.8}
      >
        <View style={styles.statusHeader}>
          <View style={[styles.statusIcon, { backgroundColor: status.color + '20' }]}>
            <IconFallback name={status.icon} size={24} color={status.color} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusName, { color: theme.text }]}>
              {status.name}
            </Text>
            <Text style={[styles.statusDescription, { color: theme.textSecondary }]}>
              {status.description}
            </Text>
          </View>
          {isSelected && (
            <IconFallback name="radio-button-checked" size={20} color={status.color} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderWorkingHours = () => {
    if (!showHoursSettings) return null;

    return (
      <View style={[styles.hoursContainer, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.hoursTitle, { color: theme.text }]}>Working Hours</Text>
        <Text style={[styles.hoursSubtitle, { color: theme.textSecondary }]}>
          Set your regular working hours for each day
        </Text>
        
        {hours.map((day, index) => (
          <View key={day.day} style={styles.dayRow}>
            <View style={styles.dayInfo}>
              <Text style={[styles.dayName, { color: theme.text }]}>{day.day}</Text>
              <Switch
                value={day.enabled}
                onValueChange={() => toggleDayAvailability(index)}
                trackColor={{ false: theme.divider, true: theme.primary + '40' }}
                thumbColor={day.enabled ? theme.primary : theme.textSecondary}
              />
            </View>
            
            {day.enabled && (
              <View style={styles.timeInputs}>
                <TouchableOpacity
                  style={[styles.timeButton, { 
                    backgroundColor: theme.background,
                    borderColor: theme.divider 
                  }]}
                  onPress={() => {
                    // In real app, show time picker
                    Alert.alert('Time Picker', 'Time picker would open here');
                  }}
                >
                  <Text style={[styles.timeText, { color: theme.text }]}>
                    {day.start}
                  </Text>
                </TouchableOpacity>
                
                <Text style={[styles.timeSeparator, { color: theme.textSecondary }]}>to</Text>
                
                <TouchableOpacity
                  style={[styles.timeButton, { 
                    backgroundColor: theme.background,
                    borderColor: theme.divider 
                  }]}
                  onPress={() => {
                    // In real app, show time picker
                    Alert.alert('Time Picker', 'Time picker would open here');
                  }}
                >
                  <Text style={[styles.timeText, { color: theme.text }]}>
                    {day.end}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Availability Status</Text>
      
      {/* Current Status */}
      <View style={[styles.currentStatusCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.currentStatusHeader}>
          <IconFallback name={AVAILABILITY_STATUSES.find(s => s.id === selectedStatus)?.icon || 'help'} size={24} color={AVAILABILITY_STATUSES.find(s => s.id === selectedStatus)?.color || theme.primary} />
          <View style={styles.currentStatusInfo}>
            <Text style={[styles.currentStatusLabel, { color: theme.textSecondary }]}>
              Current Status
            </Text>
            <Text style={[styles.currentStatusValue, { color: theme.text }]}>
              {AVAILABILITY_STATUSES.find(s => s.id === selectedStatus)?.name || 'Unknown'}
            </Text>
          </View>
        </View>
      </View>

      {/* Status Options */}
      <View style={styles.statusOptions}>
        {AVAILABILITY_STATUSES.map(renderStatusCard)}
      </View>

      {/* Working Hours Toggle */}
      <TouchableOpacity
        style={[styles.hoursToggle, { backgroundColor: theme.cardBackground }]}
        onPress={() => setShowHoursSettings(!showHoursSettings)}
      >
        <View style={styles.hoursToggleContent}>
          <IconFallback name="schedule" size={20} color={theme.primary} />
          <View style={styles.hoursToggleInfo}>
            <Text style={[styles.hoursToggleTitle, { color: theme.text }]}>
              Working Hours
            </Text>
            <Text style={[styles.hoursToggleSubtitle, { color: theme.textSecondary }]}>
              {showHoursSettings ? 'Hide' : 'Show'} working hours settings
            </Text>
          </View>
          <IconFallback name={showHoursSettings ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={24} color={theme.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* Working Hours Settings */}
      {renderWorkingHours()}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <MaterialButton
          title="Set as Available"
          onPress={() => handleStatusChange('available')}
          variant="outlined"
          style={[styles.quickActionButton, { 
            borderColor: theme.success,
            backgroundColor: selectedStatus === 'available' ? theme.success + '20' : 'transparent'
          }]}
          icon="check-circle"
        />
        
        <MaterialButton
          title="Set as Busy"
          onPress={() => handleStatusChange('busy')}
          variant="outlined"
          style={[styles.quickActionButton, { 
            borderColor: theme.warning,
            backgroundColor: selectedStatus === 'busy' ? theme.warning + '20' : 'transparent'
          }]}
          icon="schedule"
        />
        
        <MaterialButton
          title="Set as Unavailable"
          onPress={() => handleStatusChange('unavailable')}
          variant="outlined"
          style={[styles.quickActionButton, { 
            borderColor: theme.error,
            backgroundColor: selectedStatus === 'unavailable' ? theme.error + '20' : 'transparent'
          }]}
          icon="cancel"
        />
      </View>

      {/* Save Button */}
      <MaterialButton
        title="Save Availability"
        onPress={handleSaveAvailability}
        style={styles.saveButton}
        icon="save"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  currentStatusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  currentStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentStatusInfo: {
    flex: 1,
  },
  currentStatusLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  currentStatusValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusOptions: {
    gap: 12,
    marginBottom: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 14,
  },
  hoursToggle: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  hoursToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hoursToggleInfo: {
    flex: 1,
  },
  hoursToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  hoursToggleSubtitle: {
    fontSize: 14,
  },
  hoursContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  hoursTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  hoursSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  dayRow: {
    marginBottom: 12,
  },
  dayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
  },
});
