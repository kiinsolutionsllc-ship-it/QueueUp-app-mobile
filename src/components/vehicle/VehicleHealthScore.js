import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../shared/IconFallback';

export default function VehicleHealthScore({ vehicle, onPress, theme }) {

  const getHealthColor = (score) => {
    if (score >= 80) return theme.success;
    if (score >= 60) return theme.warning;
    return theme.error;
  };

  const getHealthStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  const getHealthIcon = (score) => {
    if (score >= 80) return 'check-circle';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.vehicleInfo}>
          <View style={[styles.vehicleIcon, { backgroundColor: vehicle.color }]}>
            <IconFallback name="directions-car" size={24} color="white" />
          </View>
          <View style={styles.vehicleDetails}>
            <Text style={[styles.vehicleName, { color: theme.text }]}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text style={[styles.licensePlate, { color: theme.textSecondary }]}>
              {vehicle.licensePlate}
            </Text>
          </View>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={theme.textSecondary}
        />
      </View>

      <View style={styles.healthSection}>
        <View style={styles.healthScore}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreText, { color: getHealthColor(vehicle.healthScore) }]}>
              {vehicle.healthScore}
            </Text>
            <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>/100</Text>
          </View>
          <View style={styles.healthInfo}>
            <View style={styles.healthStatus}>
              <IconFallback
                name={getHealthIcon(vehicle.healthScore)}
                size={16}
                color={getHealthColor(vehicle.healthScore)}
              />
              <Text style={[styles.statusText, { color: getHealthColor(vehicle.healthScore) }]}>
                {getHealthStatus(vehicle.healthScore)}
              </Text>
            </View>
            <Text style={[styles.mileageText, { color: theme.textSecondary }]}>
              {vehicle.mileage.toLocaleString()} miles
            </Text>
          </View>
        </View>

        <View style={styles.nextService}>
          <Text style={[styles.nextServiceLabel, { color: theme.textSecondary }]}>
            Next Service
          </Text>
          <Text style={[styles.nextServiceDate, { color: theme.text }]}>
            {new Date(vehicle.nextService).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={[styles.progressBar, { backgroundColor: theme.divider }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${vehicle.healthScore}%`,
              backgroundColor: getHealthColor(vehicle.healthScore),
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  licensePlate: {
    fontSize: 14,
    fontWeight: '500',
  },
  healthSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 12,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 2,
  },
  healthInfo: {
    alignItems: 'flex-start',
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  mileageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  nextService: {
    alignItems: 'flex-end',
  },
  nextServiceLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  nextServiceDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
