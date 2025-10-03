import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import IconFallback from '../shared/IconFallback';

export default function QuickActions({ onActionPress, theme }) {

  const actions = [
    {
      id: 'service_history',
      title: 'Service History',
      icon: 'history',
      color: theme.info,
    },
    {
      id: 'maintenance_calendar',
      title: 'Calendar',
      icon: 'event',
      color: theme.primary,
    },
    {
      id: 'mileage_tracking',
      title: 'Mileage',
      icon: 'speed',
      color: theme.warning,
    },
    {
      id: 'recall_notifications',
      title: 'Recalls',
      icon: 'warning',
      color: theme.error,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Quick Actions</Text>
      
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, { backgroundColor: theme.cardBackground }]}
            onPress={() => onActionPress(action.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
              <IconFallback name={action.icon} size={20} color="white" />
            </View>
            <Text style={[styles.actionTitle, { color: theme.text }]}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
