import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import IconFallback from '../shared/IconFallback';

export default function RecentActivity({ 
  recentActivity, 
  upcomingServices, 
  recallAlerts, 
  vehicles, 
  onViewAll, 
  theme 
}) {

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.info;
      default: return theme.textSecondary;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.info;
      default: return theme.textSecondary;
    }
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
  };

  const renderActivityItem = ({ item, index }) => {
    const isLast = index === recentActivity.length - 1;
    
    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityDot, { backgroundColor: theme.success }]} />
        <View style={[styles.activityContent, { borderBottomColor: isLast ? 'transparent' : theme.divider }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: theme.text }]}>
              {item.service}
            </Text>
            <Text style={[styles.activityDate, { color: theme.textSecondary }]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <Text style={[styles.activityVehicle, { color: theme.textSecondary }]}>
            {getVehicleName(item.vehicleId)}
          </Text>
          <Text style={[styles.activityCost, { color: theme.text }]}>
            ${item.cost}
          </Text>
        </View>
      </View>
    );
  };

  const renderUpcomingItem = ({ item, index }) => {
    const isLast = index === upcomingServices.length - 1;
    
    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
        <View style={[styles.activityContent, { borderBottomColor: isLast ? 'transparent' : theme.divider }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: theme.text }]}>
              {item.service}
            </Text>
            <Text style={[styles.activityDate, { color: theme.textSecondary }]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <Text style={[styles.activityVehicle, { color: theme.textSecondary }]}>
            {getVehicleName(item.vehicleId)}
          </Text>
        </View>
      </View>
    );
  };

  const renderRecallItem = ({ item, index }) => {
    const isLast = index === recallAlerts.length - 1;
    
    return (
      <View style={styles.activityItem}>
        <View style={[styles.activityDot, { backgroundColor: getSeverityColor(item.severity) }]} />
        <View style={[styles.activityContent, { borderBottomColor: isLast ? 'transparent' : theme.divider }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <View style={[
              styles.urgentBadge, 
              { backgroundColor: item.actionRequired ? theme.error : theme.success }
            ]}>
              <Text style={styles.urgentText}>
                {item.actionRequired ? 'Action Required' : 'Info Only'}
              </Text>
            </View>
          </View>
          <Text style={[styles.activityVehicle, { color: theme.textSecondary }]}>
            {getVehicleName(item.vehicleId)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Recent Service History */}
      {recentActivity.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recent Services
            </Text>
            <TouchableOpacity onPress={() => onViewAll('ServiceHistory')}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.activityList, { backgroundColor: theme.cardBackground }]}>
            <FlatList
              data={recentActivity.slice(0, 2)}
              renderItem={renderActivityItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>
      )}

      {/* Upcoming Services */}
      {upcomingServices.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Upcoming Services
            </Text>
            <TouchableOpacity onPress={() => onViewAll('MaintenanceCalendar')}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.activityList, { backgroundColor: theme.cardBackground }]}>
            <FlatList
              data={upcomingServices.slice(0, 2)}
              renderItem={renderUpcomingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>
      )}

      {/* Recall Alerts */}
      {recallAlerts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recall Alerts
            </Text>
            <TouchableOpacity onPress={() => onViewAll('RecallNotifications')}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.activityList, { backgroundColor: theme.cardBackground }]}>
            <FlatList
              data={recallAlerts.slice(0, 2)}
              renderItem={renderRecallItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        </View>
      )}

      {/* Empty State */}
      {recentActivity.length === 0 && upcomingServices.length === 0 && recallAlerts.length === 0 && (
        <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
          <IconFallback name="schedule" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No Recent Activity
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Your vehicle maintenance activity will appear here
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityList: {
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  activityDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  activityVehicle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityCost: {
    fontSize: 14,
    fontWeight: '600',
  },
  urgentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 16,
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
