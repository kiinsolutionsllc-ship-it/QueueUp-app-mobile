import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveText, { Heading4, Heading5, Body1, Body2, Caption } from '../shared/ResponsiveText';
import { FadeIn, ScaleIn, SlideInFromBottom } from '../shared/Animations';
import MaterialButton from '../shared/MaterialButton';

const MechanicProfile = ({
  mechanic,
  onContact,
  onViewReviews,
  onBookService,
  onViewProfile,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  const {
    id,
    name,
    avatar,
    rating,
    reviewCount,
    specialties,
    experience,
    location,
    hourlyRate,
    availability,
    bio,
    certifications,
    completedJobs,
    responseTime,
    verified = false,
  } = mechanic;

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

  const getAvailabilityColor = () => {
    switch (availability) {
      case 'available':
        return theme.success;
      case 'busy':
        return theme.warning;
      case 'offline':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  const getAvailabilityText = () => {
    switch (availability) {
      case 'available':
        return 'Available Now';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <FadeIn duration={500}>
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            shadowColor: theme.cardShadow,
          },
          style,
        ]}
        {...props}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.placeholderAvatar, { backgroundColor: theme.divider }]}>
                <IconFallback name="person" size={responsive.scale(40)} color={theme.textSecondary} />
              </View>
            )}
            
            {/* Verification Badge */}
            {verified && (
              <View
                style={[
                  styles.verificationBadge,
                  { backgroundColor: theme.success },
                ]}
              >
                <IconFallback name="verified" size={responsive.scale(12)} color={theme.onPrimary} />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Heading4 style={{ color: theme.text }}>{name}</Heading4>
              <View
                style={[
                  styles.availabilityBadge,
                  { backgroundColor: getAvailabilityColor() + '20' },
                ]}
              >
                <Caption style={{ color: getAvailabilityColor() }}>
                  {getAvailabilityText()}
                </Caption>
              </View>
            </View>

            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {renderStars(rating)}
              </View>
              <Caption style={{ color: theme.textSecondary, marginLeft: 8 }}>
                {rating?.toFixed(1)} ({reviewCount} reviews)
              </Caption>
            </View>

            <View style={styles.locationRow}>
              <IconFallback name="location-on" size={responsive.scale(16)} color={theme.textSecondary} />
              <Caption style={{ color: theme.textSecondary, marginLeft: 4 }}>
                {location}
              </Caption>
            </View>
          </View>
        </View>

        {/* Bio */}
        {bio && (
          <View style={styles.bio}>
            <Body2 style={{ color: theme.text }}>{bio}</Body2>
          </View>
        )}

        {/* Specialties */}
        {specialties && specialties.length > 0 && (
          <View style={styles.specialties}>
            <Heading5 style={{ color: theme.text, marginBottom: 8 }}>Specialties</Heading5>
            <View style={styles.specialtyTags}>
              {(specialties || []).map((specialty, index) => (
                <View
                  key={index}
                  style={[
                    styles.specialtyTag,
                    { backgroundColor: theme.primary + '20' },
                  ]}
                >
                  <Caption style={{ color: theme.primary }}>{specialty}</Caption>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <IconFallback name="work" size={responsive.scale(20)} color={theme.primary} />
            <View style={styles.statContent}>
              <Body1 style={{ color: theme.text }}>{completedJobs}</Body1>
              <Caption style={{ color: theme.textSecondary }}>Jobs Completed</Caption>
            </View>
          </View>

          <View style={styles.statItem}>
            <IconFallback name="schedule" size={responsive.scale(20)} color={theme.primary} />
            <View style={styles.statContent}>
              <Body1 style={{ color: theme.text }}>{experience} years</Body1>
              <Caption style={{ color: theme.textSecondary }}>Experience</Caption>
            </View>
          </View>

          <View style={styles.statItem}>
            <IconFallback name="attach-money" size={responsive.scale(20)} color={theme.primary} />
            <View style={styles.statContent}>
              <Body1 style={{ color: theme.text }}>${hourlyRate}/hr</Body1>
              <Caption style={{ color: theme.textSecondary }}>Hourly Rate</Caption>
            </View>
          </View>

          <View style={styles.statItem}>
            <IconFallback name="timer" size={responsive.scale(20)} color={theme.primary} />
            <View style={styles.statContent}>
              <Body1 style={{ color: theme.text }}>{responseTime}</Body1>
              <Caption style={{ color: theme.textSecondary }}>Response Time</Caption>
            </View>
          </View>
        </View>

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <View style={styles.certifications}>
            <Heading5 style={{ color: theme.text, marginBottom: 8 }}>Certifications</Heading5>
            <View style={styles.certificationList}>
              {(certifications || []).map((cert, index) => (
                <View key={index} style={styles.certificationItem}>
                  <IconFallback name="verified" size={responsive.scale(16)} color={theme.success} />
                  <Caption style={{ color: theme.textSecondary, marginLeft: 8 }}>
                    {cert}
                  </Caption>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <MaterialButton
            title="Contact"
            variant="outlined"
            onPress={onContact}
            style={styles.actionButton}
            accessible={true}
            accessibilityLabel="Contact mechanic"
            accessibilityRole="button"
          />
          <MaterialButton
            title="Book Service"
            variant="filled"
            onPress={onBookService}
            style={styles.actionButton}
            accessible={true}
            accessibilityLabel="Book service with this mechanic"
            accessibilityRole="button"
          />
        </View>
      </View>
    </FadeIn>
  );
};

// Mechanic List Component
export const MechanicList = ({
  mechanics,
  onMechanicPress,
  onContactMechanic,
  onBookService,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  if (mechanics.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <IconFallback name="build" size={responsive.scale(48)} color={theme.textSecondary} />
        <Body2 style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 16 }}>
          No mechanics found
        </Body2>
        <Caption style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
          Try adjusting your search criteria
        </Caption>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.listContainer, style]} {...props}>
      {(mechanics || []).map((mechanic, index) => (
        <MechanicProfile
          key={mechanic.id || index}
          mechanic={mechanic}
          onContact={() => onContactMechanic?.(mechanic)}
          onBookService={() => onBookService?.(mechanic)}
          onViewProfile={() => onMechanicPress?.(mechanic)}
          style={{ marginBottom: responsive.getSpacing(16) }}
        />
      ))}
    </ScrollView>
  );
};

// Mechanic Grid Component
export const MechanicGrid = ({
  mechanics,
  onMechanicPress,
  onContactMechanic,
  onBookService,
  columns = 2,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const responsive = useResponsive();

  if (!mechanics || mechanics.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <IconFallback name="build" size={responsive.scale(48)} color={theme.textSecondary} />
        <Body2 style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 16 }}>
          No mechanics found
        </Body2>
        <Caption style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 8 }}>
          Try adjusting your search criteria
        </Caption>
      </View>
    );
  }

  return (
    <View style={[styles.gridContainer, { flexDirection: 'row', flexWrap: 'wrap' }, style]} {...props}>
      {mechanics.map((mechanic, index) => (
        <View
          key={mechanic.id || index}
          style={{
            width: `${100 / columns}%`,
            paddingHorizontal: responsive.getSpacing(8),
            marginBottom: responsive.getSpacing(16),
          }}
        >
          <MechanicProfile
            mechanic={mechanic}
            onContact={() => onContactMechanic?.(mechanic)}
            onBookService={() => onBookService?.(mechanic)}
            onViewProfile={() => onMechanicPress?.(mechanic)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bio: {
    marginBottom: 16,
  },
  specialties: {
    marginBottom: 16,
  },
  specialtyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    marginTop: 4,
  },
  certifications: {
    marginBottom: 16,
  },
  certificationList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
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

export default MechanicProfile;
