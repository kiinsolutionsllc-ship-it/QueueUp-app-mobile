/**
 * Reusable job action buttons component
 * Eliminates duplicate action button patterns across screens
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import IconFallback from './IconFallback';
import { canPerformAction } from '../../utils/StatusUtils';

export const JobActionButtons = ({ 
  job, 
  onView, 
  onSchedule, 
  onRate, 
  onMessage, 
  onCancel,
  onRebook,
  theme,
  style 
}) => {
  const handleAction = (action, callback) => {
    if (canPerformAction(job.status, action) && callback) {
      callback(job);
    }
  };

  return (
    <View style={[styles.jobActions, style]}>
      {/* View Details - Always available */}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
        onPress={() => handleAction('view', onView)}
      >
        <IconFallback name="visibility" size={16} color={theme.primary} />
        <Text style={[styles.actionButtonText, { color: theme.primary }]}>
          View
        </Text>
      </TouchableOpacity>

      {/* Schedule - Only for open jobs */}
      {canPerformAction(job.status, 'schedule') && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.warning + '20' }]}
          onPress={() => handleAction('schedule', onSchedule)}
        >
          <IconFallback name="schedule" size={16} color={theme.warning} />
          <Text style={[styles.actionButtonText, { color: theme.warning }]}>
            Schedule
          </Text>
        </TouchableOpacity>
      )}

      {/* Rate - Only for completed jobs */}
      {canPerformAction(job.status, 'rate') && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.success + '20' }]}
          onPress={() => handleAction('rate', onRate)}
        >
          <IconFallback name="star" size={16} color={theme.success} />
          <Text style={[styles.actionButtonText, { color: theme.success }]}>
            Rate
          </Text>
        </TouchableOpacity>
      )}

      {/* Cancel - For open/scheduled jobs */}
      {canPerformAction(job.status, 'cancel') && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
          onPress={() => handleAction('cancel', onCancel)}
        >
          <IconFallback name="cancel" size={16} color={theme.error} />
          <Text style={[styles.actionButtonText, { color: theme.error }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      )}

      {/* Rebook - Only for completed jobs */}
      {canPerformAction(job.status, 'rebook') && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.accent + '20' }]}
          onPress={() => handleAction('rebook', onRebook)}
        >
          <IconFallback name="refresh" size={16} color={theme.accent} />
          <Text style={[styles.actionButtonText, { color: theme.accent }]}>
            Rebook
          </Text>
        </TouchableOpacity>
      )}

      {/* Message - Always available */}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: theme.info + '20' }]}
        onPress={() => handleAction('message', onMessage)}
      >
        <IconFallback name="chat" size={16} color={theme.info} />
        <Text style={[styles.actionButtonText, { color: theme.info }]}>
          Message
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default JobActionButtons;
