import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import IconFallback from '../shared/IconFallback';

export default function ServiceReminders({ reminders, onReminderPress, theme }) {

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.info;
      default: return theme.textSecondary;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'schedule';
      case 'low': return 'info';
      default: return 'schedule';
    }
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'maintenance': return 'build';
      case 'diagnostic': return 'search';
      case 'inspection': return 'visibility';
      default: return 'build';
    }
  };

  const renderReminder = ({ item }) => (
    <TouchableOpacity
      style={[styles.reminderCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => onReminderPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.reminderHeader}>
        <View style={styles.serviceInfo}>
          <View style={[styles.serviceIcon, { backgroundColor: getPriorityColor(item.priority) }]}>
            <IconFallback name={getServiceIcon(item.type)} size={20} color="white" />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={[styles.serviceName, { color: theme.text }]}>
              {item.service}
            </Text>
            <Text style={[styles.vehicleInfo, { color: theme.textSecondary }]}>
              Due: {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.priorityIndicator}>
          <IconFallback
            name={getPriorityIcon(item.priority)}
            size={16}
            color={getPriorityColor(item.priority)}
          />
        </View>
      </View>

      <View style={styles.reminderFooter}>
        <View style={styles.mechanicInfo}>
          <Text style={[styles.mechanicName, { color: theme.textSecondary }]}>
            {item.mechanic}
          </Text>
          <Text style={[styles.estimatedCost, { color: theme.text }]}>
            Est. ${item.estimatedCost}
          </Text>
        </View>
        <View style={styles.mileageInfo}>
          <Text style={[styles.mileageText, { color: theme.textSecondary }]}>
            {item.mileage.toLocaleString()} mi
          </Text>
        </View>
      </View>

      <View style={[styles.urgencyBar, { backgroundColor: getPriorityColor(item.priority) }]} />
    </TouchableOpacity>
  );

  if (reminders.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
        <IconFallback name="schedule" size={48} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          No Upcoming Services
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Your vehicles are all up to date with maintenance
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reminders.slice(0, 3)}
      renderItem={renderReminder}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  reminderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleInfo: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityIndicator: {
    padding: 4,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mechanicInfo: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  estimatedCost: {
    fontSize: 16,
    fontWeight: '600',
  },
  mileageInfo: {
    alignItems: 'flex-end',
  },
  mileageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  urgencyBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  emptyState: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
});
