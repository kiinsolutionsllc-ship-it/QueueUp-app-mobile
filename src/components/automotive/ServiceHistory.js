import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveText, { Heading5, Body2, Caption } from '../shared/ResponsiveText';
import { FadeIn, SlideInFromBottom } from '../shared/Animations';

const ServiceHistoryItem = ({
  service,
  onPress,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  const {
    id,
    date,
    serviceType,
    description,
    mechanic,
    cost,
    mileage,
    status = 'completed',
    rating,
    notes,
  } = service;

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return theme.success;
      case 'in_progress':
        return theme.warning;
      case 'cancelled':
        return theme.error;
      case 'scheduled':
        return theme.info;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'in_progress':
        return 'build';
      case 'cancelled':
        return 'cancel';
      case 'scheduled':
        return 'schedule';
      default:
        return 'help';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatCost = (cost) => {
    if (!cost) return 'N/A';
    return `$${(cost || 0).toFixed(2)}`;
  };

  const formatMileage = (mileage) => {
    if (!mileage) return 'N/A';
    return `${mileage.toLocaleString()} mi`;
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialIcons
          key={i}
          name={i <= rating ? 'star' : 'star-border'}
          size={responsive.scale(16)}
          color={i <= rating ? theme.accent : theme.textSecondary}
        />
      );
    }
    return stars;
  };

  return (
    <SlideInFromBottom duration={300}>
      <TouchableOpacity
        style={[
          styles.serviceItem,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            shadowColor: theme.cardShadow,
          },
          style,
        ]}
        onPress={onPress}
        accessible={true}
        accessibilityLabel={`${serviceType} service on ${formatDate(date)} by ${mechanic}`}
        accessibilityHint="Tap to view service details"
        accessibilityRole="button"
        {...props}
      >
        {/* Service Header */}
        <View style={styles.serviceHeader}>
          <View style={styles.serviceInfo}>
            <Heading5 style={{ color: theme.text }}>{serviceType}</Heading5>
            <Caption style={{ color: theme.textSecondary }}>
              {formatDate(date)} • {formatMileage(mileage)}
            </Caption>
          </View>
          
          <View style={styles.serviceStatus}>
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
        </View>

        {/* Service Description */}
        <Body2 style={{ color: theme.text, marginBottom: 8 }}>
          {description}
        </Body2>

        {/* Service Details */}
        <View style={styles.serviceDetails}>
          <View style={styles.detailItem}>
            <IconFallback name="person" size={responsive.scale(16)} color={theme.textSecondary} />
            <Caption style={{ color: theme.textSecondary, marginLeft: 4 }}>
              {mechanic}
            </Caption>
          </View>
          
          <View style={styles.detailItem}>
            <IconFallback name="attach-money" size={responsive.scale(16)} color={theme.textSecondary} />
            <Caption style={{ color: theme.textSecondary, marginLeft: 4 }}>
              {formatCost(cost)}
            </Caption>
          </View>
        </View>

        {/* Rating */}
        {rating && (
          <View style={styles.rating}>
            <View style={styles.stars}>
              {renderStars(rating)}
            </View>
            <Caption style={{ color: theme.textSecondary, marginLeft: 8 }}>
              {rating}/5
            </Caption>
          </View>
        )}

        {/* Notes */}
        {notes && (
          <View style={styles.notes}>
            <IconFallback name="note" size={responsive.scale(16)} color={theme.textSecondary} />
            <Caption style={{ color: theme.textSecondary, marginLeft: 4, flex: 1 }}>
              {notes}
            </Caption>
          </View>
        )}
      </TouchableOpacity>
    </SlideInFromBottom>
  );
};

// Service History List Component
export const ServiceHistoryList = ({
  services,
  onServicePress,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  if (services.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <IconFallback name="build" size={responsive.scale(48)} color={theme.textSecondary} />
        <Body2 style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 16 }}>
          No service history yet
        </Body2>
        <Caption style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
          Your service records will appear here
        </Caption>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.listContainer, style]} {...props}>
      {services.map((service, index) => (
        <ServiceHistoryItem
          key={service.id || index}
          service={service}
          onPress={() => onServicePress?.(service)}
          style={{ marginBottom: responsive.getSpacing(16) }}
        />
      ))}
    </ScrollView>
  );
};

// Service History Timeline Component
export const ServiceHistoryTimeline = ({
  services,
  onServicePress,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  if (services.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <IconFallback name="build" size={responsive.scale(48)} color={theme.textSecondary} />
        <Body2 style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 16 }}>
          No service history yet
        </Body2>
        <Caption style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
          Your service records will appear here
        </Caption>
      </View>
    );
  }

  return (
    <View style={[styles.timelineContainer, style]} {...props}>
      {services.map((service, index) => (
        <View key={service.id || index} style={styles.timelineItem}>
          {/* Timeline Line */}
          {index < services.length - 1 && (
            <View
              style={[
                styles.timelineLine,
                { backgroundColor: theme.divider },
              ]}
            />
          )}
          
          {/* Timeline Dot */}
          <View
            style={[
              styles.timelineDot,
              {
                backgroundColor: theme.primary,
                borderColor: theme.background,
              },
            ]}
          />
          
          {/* Service Content */}
          <View style={styles.timelineContent}>
            <ServiceHistoryItem
              service={service}
              onPress={() => onServicePress?.(service)}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

// Service Statistics Component
export const ServiceStatistics = ({
  services,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  const totalServices = services.length;
  const totalCost = services.reduce((sum, service) => sum + (service.cost || 0), 0);
  const averageRating = services.reduce((sum, service) => sum + (service.rating || 0), 0) / totalServices;
  const completedServices = services.filter(service => service.status === 'completed').length;

  const stats = [
    {
      label: 'Total Services',
      value: totalServices.toString(),
      icon: 'build',
      color: theme.primary,
    },
    {
      label: 'Total Cost',
      value: `$${(totalCost || 0).toFixed(2)}`,
      icon: 'attach-money',
      color: theme.success,
    },
    {
      label: 'Average Rating',
      value: averageRating ? (averageRating || 0).toFixed(1) : 'N/A',
      icon: 'star',
      color: theme.accent,
    },
    {
      label: 'Completion Rate',
      value: `${Math.round((completedServices / totalServices) * 100)}%`,
      icon: 'check-circle',
      color: theme.info,
    },
  ];

  return (
    <View style={[styles.statsContainer, style]} {...props}>
      {stats.map((stat, index) => (
        <FadeIn key={index} delay={index * 100} duration={300}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                shadowColor: theme.cardShadow,
              },
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <IconFallback name={stat.icon} size={responsive.scale(24)} color={stat.color} />
            </View>
            <View style={styles.statContent}>
              <Heading5 style={{ color: theme.text }}>{stat.value}</Heading5>
              <Caption style={{ color: theme.textSecondary }}>{stat.label}</Caption>
            </View>
          </View>
        </FadeIn>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  serviceItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceStatus: {
    marginLeft: 8,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  notes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listContainer: {
    flex: 1,
  },
  timelineContainer: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineLine: {
    position: 'absolute',
    left: 12,
    top: 24,
    width: 2,
    height: '100%',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    marginRight: 16,
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});

export default ServiceHistoryItem;
