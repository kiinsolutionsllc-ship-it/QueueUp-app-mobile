import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import IconFallback from '../shared/IconFallback';

export default function RecallNotifications({ recalls, onRecallPress, theme }) {

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.info;
      default: return theme.textSecondary;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'notifications';
      default: return 'info';
    }
  };

  const getActionRequiredColor = (actionRequired) => {
    return actionRequired ? theme.error : theme.success;
  };

  const renderRecallItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.recallCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => onRecallPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.recallHeader}>
        <View style={styles.recallInfo}>
          <View style={[
            styles.severityIndicator,
            { backgroundColor: getSeverityColor(item.severity) }
          ]}>
            <IconFallback
              name={getSeverityIcon(item.severity)}
              size={16}
              color="white"
            />
          </View>
          <View style={styles.recallDetails}>
            <Text style={[styles.recallTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.recallDate, { color: theme.textSecondary }]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.actionIndicator}>
          <View style={[
            styles.actionDot,
            { backgroundColor: getActionRequiredColor(item.actionRequired) }
          ]} />
          <Text style={[
            styles.actionText,
            { color: getActionRequiredColor(item.actionRequired) }
          ]}>
            {item.actionRequired ? 'Action Required' : 'Info Only'}
          </Text>
        </View>
      </View>

      <Text style={[styles.recallDescription, { color: theme.textSecondary }]}>
        {item.description}
      </Text>

      <View style={styles.recallFooter}>
        <View style={styles.recallActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => onRecallPress(item)}
          >
            <Text style={[styles.actionButtonText, { color: 'white' }]}>
              Learn More
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recallStatus}>
          <IconFallback
            name="schedule"
            size={14}
            color={theme.textSecondary}
          />
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>
            {item.actionRequired ? 'Urgent' : 'Informational'}
          </Text>
        </View>
      </View>

      {/* Priority indicator bar */}
      <View style={[
        styles.priorityBar,
        { backgroundColor: getSeverityColor(item.severity) }
      ]} />
    </TouchableOpacity>
  );

  if (recalls.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
        <IconFallback name="check-circle" size={48} color={theme.success} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          No Recall Notifications
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Your vehicles are not affected by any current recalls
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recalls}
      renderItem={renderRecallItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  recallCard: {
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
  recallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recallInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  severityIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recallDetails: {
    flex: 1,
  },
  recallTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  recallDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionIndicator: {
    alignItems: 'flex-end',
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recallDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 16,
  },
  recallFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recallActions: {
    flex: 1,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recallStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  priorityBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
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
