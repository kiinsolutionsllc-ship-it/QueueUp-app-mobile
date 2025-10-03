import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import IconFallback from '../shared/IconFallback';

export default function VehicleHistoryCard({ service, vehicle, onPress, theme }) {

  const getServiceIcon = (type) => {
    switch (type) {
      case 'maintenance': return 'build';
      case 'diagnostic': return 'search';
      case 'inspection': return 'visibility';
      case 'repair': return 'handyman';
      default: return 'build';
    }
  };

  const getServiceColor = (type) => {
    switch (type) {
      case 'maintenance': return theme.info;
      case 'diagnostic': return theme.warning;
      case 'inspection': return theme.primary;
      case 'repair': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.success;
      case 'in-progress': return theme.warning;
      case 'cancelled': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'in-progress': return 'schedule';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.serviceInfo}>
          <View style={[
            styles.serviceIcon,
            { backgroundColor: getServiceColor(service.type) }
          ]}>
            <IconFallback
              name={getServiceIcon(service.type)}
              size={20}
              color="white"
            />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={[styles.serviceName, { color: theme.text }]}>
              {service.service}
            </Text>
            <Text style={[styles.vehicleInfo, { color: theme.textSecondary }]}>
              {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <IconFallback
            name={getStatusIcon(service.status)}
            size={16}
            color={getStatusColor(service.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <IconFallback name="schedule" size={14} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {new Date(service.date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <IconFallback name="speed" size={14} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {service.mileage.toLocaleString()} mi
          </Text>
        </View>
        <View style={styles.detailItem}>
          <IconFallback name="person" size={14} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {service.mechanic}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.costContainer}>
          <Text style={[styles.costLabel, { color: theme.textSecondary }]}>
            Total Cost
          </Text>
          <Text style={[styles.costValue, { color: theme.text }]}>
            ${service.cost}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <IconFallback name="star" size={14} color={theme.warning} />
          <Text style={[styles.ratingText, { color: theme.text }]}>
            4.8
          </Text>
        </View>
      </View>

      {/* Service type indicator bar */}
      <View style={[
        styles.typeBar,
        { backgroundColor: getServiceColor(service.type) }
      ]} />
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
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costContainer: {
    flex: 1,
  },
  costLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  costValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  typeBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
