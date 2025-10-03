import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import { useVehicle } from '../../contexts/VehicleContext';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { useLocation } from '../../contexts/LocationContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';

interface UnifiedProfileScreenProps {
  navigation: any;
}

const UnifiedProfileScreen: React.FC<UnifiedProfileScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const { user, updateProfile } = useAuth();
  const { getVehiclesByCustomer } = useVehicle();
  const { getJobsByCustomer, getJobsByMechanic } = useJob();
  const { homeAddress, savedLocations } = useLocation();
  const theme = getCurrentTheme();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editedProfile, setEditedProfile] = useState<any>({});

  const isCustomer = user?.role === 'customer';
  const isMechanic = user?.role === 'mechanic';

  // Get user-specific data
  const userVehicles = isCustomer ? getVehiclesByCustomer() : [];
  const userJobs = isCustomer 
    ? getJobsByCustomer(user?.id || '') 
    : getJobsByMechanic(user?.id || '');

  useEffect(() => {
    if (user) {
      setEditedProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        specialties: user.specialties || [],
        experience: user.experience || 0,
        hourlyRate: (user as any).hourlyRate || 0,
        shopName: (user as any).shopName || '',
        licenseNumber: (user as any).licenseNumber || '',
      });
    }
  }, [user]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile(editedProfile);
      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        setShowEditModal(false);
        setIsEditing(false);
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const ProfileSection = ({ 
    title, 
    children 
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.profileSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </View>
  );

  const InfoRow = ({ 
    label, 
    value, 
    icon 
  }: {
    label: string;
    value: string | number;
    icon: string;
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <IconFallback name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color 
  }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <IconFallback name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.textSecondary }]}>{title}</Text>
    </View>
  );

  const QuickActionCard = ({ 
    title, 
    icon, 
    color, 
    onPress 
  }: {
    title: string;
    icon: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <IconFallback name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickActionTitle, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Profile"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          {
            icon: 'edit',
            onPress: handleEditProfile,
          },
        ]}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <MaterialCard style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
              <IconFallback name="person" size={40} color={theme.primary} />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileNameContainer}>
                <Text style={[styles.profileName, { color: theme.text }]}>
                  {user?.name || 'User'}
                </Text>
                {isMechanic && (
                  <View style={[styles.statusBadge, { backgroundColor: theme.success + '20' }]}>
                    <Text style={[styles.statusText, { color: theme.success }]}>Active</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.profileRole, { color: theme.textSecondary }]}>
                {isCustomer ? 'Customer' : isMechanic ? 'Professional Mechanic' : 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
                {user?.email || ''}
              </Text>
              {isCustomer && (
                <Text style={[styles.welcomeMessage, { color: theme.primary }]}>
                  Manage your profile and service preferences
                </Text>
              )}
              {isMechanic && (
                <Text style={[styles.welcomeMessage, { color: theme.primary }]}>
                  {userJobs.filter((job: any) => job.status === 'pending').length} new jobs available
                </Text>
              )}
            </View>
          </View>
        </MaterialCard>

        {/* Stats Overview - Mechanics Only */}
        {isMechanic && (
          <ProfileSection title="Overview">
            <View style={styles.statsGrid}>
              <StatCard
                title="Jobs Done"
                value={userJobs.filter((job: any) => job.status === 'completed').length}
                icon="work"
                color={theme.primary}
              />
              <StatCard
                title="Rating"
                value={(user as any)?.rating || '4.8'}
                icon="star"
                color={theme.warning}
              />
              <StatCard
                title="Experience"
                value={`${user?.experience || 0} years`}
                icon="schedule"
                color={theme.success}
              />
              <StatCard
                title="Hourly Rate"
                value={`$${(user as any)?.hourlyRate || 0}`}
                icon="attach-money"
                color={theme.accent}
              />
            </View>
          </ProfileSection>
        )}

        {/* Quick Actions - Mechanics Only */}
        {isMechanic && (
          <ProfileSection title="Quick Actions">
            <View style={styles.quickActionsGrid}>
              <QuickActionCard
                title="Available Jobs"
                icon="work"
                color={theme.primary}
                onPress={() => navigation.navigate('MechanicJobs')}
              />
              <QuickActionCard
                title="My Earnings"
                icon="attach-money"
                color={theme.success}
                onPress={() => navigation.navigate('MechanicEarnings')}
              />
              <QuickActionCard
                title="Schedule"
                icon="schedule"
                color={theme.warning}
                onPress={() => navigation.navigate('MechanicSchedule')}
              />
              <QuickActionCard
                title="Reviews"
                icon="star"
                color={theme.accent}
                onPress={() => navigation.navigate('MechanicReviews')}
              />
            </View>
          </ProfileSection>
        )}

        {/* Personal Information */}
        <ProfileSection title="Personal Information">
          <MaterialCard style={styles.infoCard}>
            <InfoRow
              label="Name"
              value={user?.name || 'Not set'}
              icon="person"
            />
            <InfoRow
              label="Email"
              value={user?.email || 'Not set'}
              icon="email"
            />
            <InfoRow
              label="Phone"
              value={user?.phone || 'Not set'}
              icon="phone"
            />
            {isMechanic && (
              <>
                <InfoRow
                  label="Shop Name"
                  value={(user as any)?.shopName || 'Not set'}
                  icon="business"
                />
                <InfoRow
                  label="License Number"
                  value={(user as any)?.licenseNumber || 'Not set'}
                  icon="badge"
                />
              </>
            )}
          </MaterialCard>
        </ProfileSection>

        {/* Location Settings */}
        <ProfileSection title="Location Settings">
          <MaterialCard style={styles.infoCard}>
            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => navigation.navigate('HomeAddressSettings')}
              activeOpacity={0.7}
            >
              <View style={styles.locationRowContent}>
                <IconFallback name="home" size={24} color={theme.primary} />
                <View style={styles.locationRowText}>
                  <Text style={[styles.locationRowTitle, { color: theme.text }]}>
                    Home Address
                  </Text>
                  <Text style={[styles.locationRowSubtitle, { color: theme.textSecondary }]}>
                    {homeAddress ? homeAddress.address : "Not set"}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => navigation.navigate('SavedLocationsSettings')}
              activeOpacity={0.7}
            >
              <View style={styles.locationRowContent}>
                <IconFallback name="location-on" size={24} color={theme.primary} />
                <View style={styles.locationRowText}>
                  <Text style={[styles.locationRowTitle, { color: theme.text }]}>
                    Saved Locations
                  </Text>
                  <Text style={[styles.locationRowSubtitle, { color: theme.textSecondary }]}>
                    {savedLocations.length} location{savedLocations.length !== 1 ? 's' : ''} saved
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>
          </MaterialCard>
        </ProfileSection>

        {/* Mechanic-specific Information */}
        {isMechanic && (
          <ProfileSection title="Professional Information">
            <MaterialCard style={styles.infoCard}>
              <InfoRow
                label="Bio"
                value={user?.bio || 'No bio available'}
                icon="description"
              />
              <InfoRow
                label="Specialties"
                value={user?.specialties?.join(', ') || 'None specified'}
                icon="build"
              />
              <InfoRow
                label="Experience"
                value={`${user?.experience || 0} years`}
                icon="schedule"
              />
              <InfoRow
                label="Hourly Rate"
                value={`$${(user as any)?.hourlyRate || 0}/hour`}
                icon="attach-money"
              />
            </MaterialCard>
          </ProfileSection>
        )}

        {/* Customer-specific Information */}
        {isCustomer && (
          <>
            {userVehicles.length > 0 && (
              <ProfileSection title="My Vehicles">
                <MaterialCard style={styles.infoCard}>
                  {userVehicles.slice(0, 3).map((vehicle: any, index: number) => (
                    <InfoRow
                      key={vehicle.id}
                      label={`Vehicle ${index + 1}`}
                      value={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
                      icon="directions-car"
                    />
                  ))}
                  {userVehicles.length > 3 && (
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => navigation.navigate('VehicleDashboard')}
                    >
                      <Text style={[styles.viewAllText, { color: theme.primary }]}>
                        View All Vehicles ({userVehicles.length})
                      </Text>
                      <MaterialIcons name="chevron-right" size={20} color={theme.primary} />
                    </TouchableOpacity>
                  )}
                </MaterialCard>
              </ProfileSection>
            )}

            {/* Customer Service Preferences */}
            <ProfileSection title="Service Preferences">
              <MaterialCard style={styles.infoCard}>
                <InfoRow
                  label="Preferred Service Type"
                  value="Mobile Service"
                  icon="home"
                />
                <InfoRow
                  label="Notification Preferences"
                  value="Push & Email"
                  icon="notifications"
                />
                <InfoRow
                  label="Payment Method"
                  value="Credit Card ending in 1234"
                  icon="payment"
                />
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('UnifiedSettings')}
                >
                  <Text style={[styles.viewAllText, { color: theme.primary }]}>
                    Manage Preferences
                  </Text>
                  <MaterialIcons name="chevron-right" size={20} color={theme.primary} />
                </TouchableOpacity>
              </MaterialCard>
            </ProfileSection>
          </>
        )}

        {/* Mechanic-specific Business Information */}
        {isMechanic && (
          <ProfileSection title="Business Information">
            <MaterialCard style={styles.infoCard}>
              <InfoRow
                label="Business Status"
                value="Active"
                icon="business"
              />
              <InfoRow
                label="Service Area"
                value="Within 25 miles"
                icon="location-on"
              />
              <InfoRow
                label="Response Time"
                value="< 2 hours"
                icon="schedule"
              />
              <InfoRow
                label="Insurance"
                value="Active"
                icon="verified"
              />
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('MechanicBusinessSettings')}
              >
                <Text style={[styles.viewAllText, { color: theme.primary }]}>
                  Manage Business Settings
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={theme.primary} />
              </TouchableOpacity>
            </MaterialCard>
          </ProfileSection>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Name</Text>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: theme.surface, 
                    color: theme.text,
                    borderColor: theme.border 
                  }]}
                  value={editedProfile.name}
                  onChangeText={(text) => setEditedProfile({...editedProfile, name: text})}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Phone</Text>
                <TextInput
                  style={[styles.textInput, { 
                    backgroundColor: theme.surface, 
                    color: theme.text,
                    borderColor: theme.border 
                  }]}
                  value={editedProfile.phone}
                  onChangeText={(text) => setEditedProfile({...editedProfile, phone: text})}
                  placeholder="Enter your phone number"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              {isMechanic && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Bio</Text>
                    <TextInput
                      style={[styles.textInput, styles.textArea, { 
                        backgroundColor: theme.surface, 
                        color: theme.text,
                        borderColor: theme.border 
                      }]}
                      value={editedProfile.bio}
                      onChangeText={(text) => setEditedProfile({...editedProfile, bio: text})}
                      placeholder="Tell us about yourself"
                      placeholderTextColor={theme.textSecondary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: theme.text }]}>Hourly Rate</Text>
                    <TextInput
                      style={[styles.textInput, { 
                        backgroundColor: theme.surface, 
                        color: theme.text,
                        borderColor: theme.border 
                      }]}
                      value={editedProfile.hourlyRate?.toString() || ''}
                      onChangeText={(text) => setEditedProfile({...editedProfile, hourlyRate: parseInt(text) || 0})}
                      placeholder="Enter your hourly rate"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}

              <View style={styles.modalActions}>
                <MaterialButton
                  title="Cancel"
                  onPress={() => setShowEditModal(false)}
                  variant="outlined"
                  style={styles.cancelButton}
                />
                <MaterialButton
                  title="Save Changes"
                  onPress={handleSaveProfile}
                  style={styles.saveButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    padding: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  profileRole: {
    fontSize: 16,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  welcomeMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    fontStyle: 'italic',
  },
  profileSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  // Location row styles
  locationRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationRowText: {
    flex: 1,
    marginLeft: 12,
  },
  locationRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationRowSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default UnifiedProfileScreen;
