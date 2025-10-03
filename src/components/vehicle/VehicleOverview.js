import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import IconFallback from '../shared/IconFallback';

export default function VehicleOverview({ vehicles, onVehiclePress, onAddVehicle, theme }) {

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>My Vehicles</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={onAddVehicle}
        >
          <IconFallback name="add" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {vehicles.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
          <IconFallback name="directions-car" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No Vehicles Added
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Add your first vehicle to start tracking maintenance
          </Text>
          <TouchableOpacity 
            style={[styles.emptyButton, { backgroundColor: theme.primary }]}
            onPress={onAddVehicle}
          >
            <Text style={styles.emptyButtonText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.vehiclesContainer}
        >
          {vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={[styles.vehicleCard, { backgroundColor: theme.cardBackground }]}
              onPress={() => onVehiclePress(vehicle)}
              activeOpacity={0.8}
            >
              <View style={styles.vehicleHeader}>
              <View style={[styles.vehicleIcon, { backgroundColor: vehicle.color }]}>
                <IconFallback name="directions-car" size={18} color="white" />
              </View>
                <View style={styles.healthIndicator}>
                  <View style={[
                    styles.healthDot,
                    { backgroundColor: getHealthColor(vehicle.healthScore) }
                  ]} />
                </View>
              </View>

              <View style={styles.vehicleInfo}>
                <Text style={[styles.vehicleName, { color: theme.text }]} numberOfLines={1}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
                <Text style={[styles.licensePlate, { color: theme.textSecondary }]}>
                  {vehicle.licensePlate}
                </Text>
                <Text style={[styles.mileage, { color: theme.textSecondary }]}>
                  {vehicle.mileage.toLocaleString()} mi
                </Text>
              </View>

              <View style={styles.healthScore}>
                <Text style={[styles.scoreText, { color: getHealthColor(vehicle.healthScore) }]}>
                  {vehicle.healthScore}
                </Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
                  {getHealthStatus(vehicle.healthScore)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehiclesContainer: {
    paddingRight: 20,
  },
  vehicleCard: {
    width: 140,
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthIndicator: {
    alignItems: 'center',
  },
  healthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vehicleInfo: {
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  licensePlate: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  mileage: {
    fontSize: 10,
    fontWeight: '500',
  },
  healthScore: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
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
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
