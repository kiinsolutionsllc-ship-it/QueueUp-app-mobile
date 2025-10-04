import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import ValidatedForm from '../../components/shared/ValidatedForm';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialButton from '../../components/shared/MaterialButton';
import MaterialCard from '../../components/shared/MaterialCard';


interface ProfileManagementScreenProps {
  navigation: any;
}
export default function ProfileManagementScreen({ navigation }: ProfileManagementScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user, updateProfile } = useAuth();
  const theme = getCurrentTheme();
  const [isLoading, setIsLoading] = useState<any>(false);
  const [profileImage, setProfileImage] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    specialties: user?.specialties || [],
    experience: user?.experience || '',
    certifications: user?.certifications || [],
  });

  useEffect(() => {
    // Load user profile data
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    // Simulate loading profile data
    // In a real app, this would fetch from your API
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleUpdateProfile = async (values: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update profile with new values
      const updatedProfile = {
        ...userProfile,
        ...values,
        profileImage: profileImage,
      };
      
      setUserProfile(updatedProfile);
      
      Alert.alert(
        'Success',
        'Profile updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validationRules = {
    name: ['required', { validator: 'minLength', message: 'Name must be at least 2 characters' }],
    email: ['required', 'email'],
    phone: ['phone'],
    bio: [{ validator: 'maxLength', message: 'Bio must be less than 500 characters' }],
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Profile Management"
        onBackPress={() => navigation.goBack()}
        showBack
      />
      
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              style={[styles.imageContainer, { borderColor: theme.primary }]}
              onPress={showImageOptions}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={[styles.placeholderImage, { backgroundColor: theme.divider }]}>
                  <IconFallback name="person" size={40} color={theme.textSecondary} />
                </View>
              )}
              <View style={[styles.editIcon, { backgroundColor: theme.primary }]}>
                <MaterialIcons name="edit" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={[styles.imageText, { color: theme.textSecondary }]}>
              Tap to change profile picture
            </Text>
          </View>

          {/* Profile Form */}
          <ValidatedForm
            initialValues={userProfile}
            validationRules={validationRules}
            onSubmit={handleUpdateProfile}
            submitButtonText="Update Profile"
            submitButtonVariant="filled"
          >
            {({ MaterialTextInput, values, errors, touched }: any) => (
              <View style={styles.form}>
                <MaterialTextInput
                  name="name"
                  label="Full Name *"
                  placeholder="Enter your full name"
                  leftIcon="person"
                />
                
                <MaterialTextInput
                  name="email"
                  label="Email Address *"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="email"
                />
                
                <MaterialTextInput
                  name="phone"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  leftIcon="phone"
                />
                
                <MaterialTextInput
                  name="bio"
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  multiline
                  numberOfLines={3}
                  leftIcon="info"
                />

                <MaterialTextInput
                  name="location"
                  label="Location"
                  placeholder="Enter your location"
                  leftIcon="location-on"
                />

                {user?.user_type === 'mechanic' && (
                  <>
                    <MaterialTextInput
                      name="experience"
                      label="Years of Experience"
                      placeholder="e.g., 5 years"
                      keyboardType="numeric"
                      leftIcon="work"
                    />
                    
                    <MaterialTextInput
                      name="hourlyRate"
                      label="Hourly Rate"
                      placeholder="e.g., $75"
                      keyboardType="numeric"
                      leftIcon="attach-money"
                    />
                    
                    <MaterialTextInput
                      name="shopName"
                      label="Shop Name"
                      placeholder="e.g., Mike's Auto Repair"
                      leftIcon="business"
                    />
                    
                    <MaterialTextInput
                      name="licenseNumber"
                      label="Mechanic License Number"
                      placeholder="e.g., MECH-12345"
                      leftIcon="badge"
                    />
                    
                    <MaterialTextInput
                      name="insuranceProvider"
                      label="Insurance Provider"
                      placeholder="e.g., State Farm"
                      leftIcon="security"
                    />
                    
                    <MaterialTextInput
                      name="emergencyContact"
                      label="Emergency Contact"
                      placeholder="e.g., +1-555-0123"
                      keyboardType="phone-pad"
                      leftIcon="phone"
                    />
                  </>
                )}
              </View>
            )}
          </ValidatedForm>

          {/* Additional Profile Sections */}
          {user?.user_type === 'mechanic' && (
            <View style={styles.additionalSections}>
              <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Specialties</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Add your areas of expertise
                </Text>
                <MaterialButton
                  title="Manage Specialties"
                  onPress={() => Alert.alert('Specialties', 'Specialty management coming soon!')}
                  variant="outlined"
                  style={styles.sectionButton}
                />
              </MaterialCard>

              <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Certifications</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Upload your professional certifications
                </Text>
                <MaterialButton
                  title="Manage Certifications"
                  onPress={() => Alert.alert('Certifications', 'Certification management coming soon!')}
                  variant="outlined"
                  style={styles.sectionButton}
                />
              </MaterialCard>

              <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Service Areas</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Define your service coverage areas
                </Text>
                <MaterialButton
                  title="Manage Service Areas"
                  onPress={() => Alert.alert('Service Areas', 'Service area management coming soon!')}
                  variant="outlined"
                  style={styles.sectionButton}
                />
              </MaterialCard>

              <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Equipment & Tools</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  List your available equipment and tools
                </Text>
                <MaterialButton
                  title="Manage Equipment"
                  onPress={() => Alert.alert('Equipment', 'Equipment management coming soon!')}
                  variant="outlined"
                  style={styles.sectionButton}
                />
              </MaterialCard>

              <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Availability Schedule</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Set your working hours and availability
                </Text>
                <MaterialButton
                  title="Manage Schedule"
                  onPress={() => Alert.alert('Schedule', 'Schedule management coming soon!')}
                  variant="outlined"
                  style={styles.sectionButton}
                />
              </MaterialCard>

              <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Insurance & Bonding</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Upload insurance and bonding documents
                </Text>
                <MaterialButton
                  title="Manage Insurance"
                  onPress={() => Alert.alert('Insurance', 'Insurance management coming soon!')}
                  variant="outlined"
                  style={styles.sectionButton}
                />
              </MaterialCard>

              {/* Business Section */}
              <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Business Hours</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Set your working hours and availability
                </Text>
                <MaterialButton
                  title="Manage Business Hours"
                  onPress={() => Alert.alert('Business Hours', 'Business hours management coming soon!')}
                  variant="outlined"
                  style={styles.sectionButton}
                />
              </MaterialCard>

              <MaterialCard style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Tax Information</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Manage your tax settings and information
                </Text>
                <MaterialButton
                  title="Manage Tax Info"
                  onPress={() => Alert.alert('Tax Information', 'Tax management coming soon!')}
                  variant="outlined"
                  style={styles.sectionButton}
                />
              </MaterialCard>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  profileImage: {
    width: 114,
    height: 114,
    borderRadius: 57,
  },
  placeholderImage: {
    width: 114,
    height: 114,
    borderRadius: 57,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  additionalSections: {
    marginBottom: 20,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  sectionButton: {
    alignSelf: 'flex-start',
  },
});
