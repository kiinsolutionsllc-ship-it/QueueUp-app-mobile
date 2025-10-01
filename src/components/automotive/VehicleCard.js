import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveText, { Heading5, Body2, Caption } from '../shared/ResponsiveText';
import { FadeIn, ScaleIn } from '../shared/Animations';

const VehicleCard = ({
  vehicle,
  onPress,
  onEdit,
  onDelete,
  style,
  showActions = true,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  const {
    id,
    make,
    model,
    year,
    color,
    licensePlate,
    mileage,
    lastServiceDate,
    nextServiceDate,
    image,
    status = 'active',
  } = vehicle;

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return theme.success;
      case 'maintenance':
        return theme.warning;
      case 'repair':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return 'check-circle';
      case 'maintenance':
        return 'build';
      case 'repair':
        return 'warning';
      default:
        return 'help';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatMileage = (miles) => {
    if (!miles) return 'N/A';
    return `${miles.toLocaleString()} mi`;
  };

  return (
    <ScaleIn duration={300}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            shadowColor: theme.cardShadow,
          },
          style,
        ]}
        onPress={onPress}
        accessible={true}
        accessibilityLabel={`${year} ${make} ${model}, ${color}, License: ${licensePlate}`}
        accessibilityHint="Tap to view vehicle details"
        accessibilityRole="button"
        {...props}
      >
        {/* Vehicle Image */}
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.vehicleImage} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: theme.divider }]}>
              <IconFallback name="directions-car" size={responsive.scale(40)} color={theme.textSecondary} />
            </View>
          )}
          
          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor() + '20',
                borderColor: getStatusColor(),
              },
            ]}
          >
            <IconFallback name={getStatusIcon()} size={responsive.scale(12)} color={getStatusColor()} />
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Heading5 style={{ color: theme.text }}>
              {year} {make} {model}
            </Heading5>
            <Caption style={{ color: theme.textSecondary }}>
              {color} • {licensePlate}
            </Caption>
          </View>

          {/* Vehicle Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <IconFallback name="speed" size={responsive.scale(16)} color={theme.textSecondary} />
              <Caption style={{ color: theme.textSecondary, marginLeft: 4 }}>
                {formatMileage(mileage)}
              </Caption>
            </View>
            
            <View style={styles.statItem}>
              <IconFallback name="schedule" size={responsive.scale(16)} color={theme.textSecondary} />
              <Caption style={{ color: theme.textSecondary, marginLeft: 4 }}>
                Last: {formatDate(lastServiceDate)}
              </Caption>
            </View>
          </View>

          {/* Next Service */}
          {nextServiceDate && (
            <View style={styles.nextService}>
              <IconFallback name="event" size={responsive.scale(16)} color={theme.primary} />
              <Caption style={{ color: theme.primary, marginLeft: 4 }}>
                Next service: {formatDate(nextServiceDate)}
              </Caption>
            </View>
          )}
        </View>

        {/* Actions */}
        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
              onPress={onEdit}
              accessible={true}
              accessibilityLabel="Edit vehicle"
              accessibilityRole="button"
            >
              <IconFallback name="edit" size={responsive.scale(18)} color={theme.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
              onPress={onDelete}
              accessible={true}
              accessibilityLabel="Delete vehicle"
              accessibilityRole="button"
            >
              <IconFallback name="delete" size={responsive.scale(18)} color={theme.error} />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </ScaleIn>
  );
};

// Vehicle List Component
export const VehicleList = ({
  vehicles,
  onVehiclePress,
  onEditVehicle,
  onDeleteVehicle,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  if (vehicles.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <IconFallback name="directions-car" size={responsive.scale(48)} color={theme.textSecondary} />
        <Body2 style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 16 }}>
          No vehicles added yet
        </Body2>
        <Caption style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
          Add your first vehicle to get started
        </Caption>
      </View>
    );
  }

  return (
    <View style={[styles.listContainer, style]} {...props}>
      {(vehicles || []).map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id || index}
          vehicle={vehicle}
          onPress={() => onVehiclePress?.(vehicle)}
          onEdit={() => onEditVehicle?.(vehicle)}
          onDelete={() => onDeleteVehicle?.(vehicle)}
          style={{ marginBottom: responsive.getSpacing(16) }}
        />
      ))}
    </View>
  );
};

// Vehicle Grid Component
export const VehicleGrid = ({
  vehicles,
  onVehiclePress,
  onEditVehicle,
  onDeleteVehicle,
  columns = 2,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  if (!vehicles || vehicles.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <IconFallback name="directions-car" size={responsive.scale(48)} color={theme.textSecondary} />
        <Body2 style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 16 }}>
          No vehicles added yet
        </Body2>
        <Caption style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
          Add your first vehicle to get started
        </Caption>
      </View>
    );
  }

  return (
    <View style={[styles.gridContainer, { flexDirection: 'row', flexWrap: 'wrap' }, style]} {...props}>
      {vehicles.map((vehicle, index) => (
        <View
          key={vehicle.id || index}
          style={{
            width: `${100 / columns}%`,
            paddingHorizontal: responsive.getSpacing(8),
            marginBottom: responsive.getSpacing(16),
          }}
        >
          <VehicleCard
            vehicle={vehicle}
            onPress={() => onVehiclePress?.(vehicle)}
            onEdit={() => onEditVehicle?.(vehicle)}
            onDelete={() => onDeleteVehicle?.(vehicle)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextService: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flex: 1,
  },
  gridContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});

export default VehicleCard;
