import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, TextInput } from 'react-native';
import { StepComponentProps, Vehicle } from '../../types/JobTypes';
import { useVehicle } from '../../contexts/VehicleContext';
import { useLocation } from '../../contexts/LocationContext';
import { createJobStyles } from '../../styles/CreateJobScreenStyles';
import { Ionicons } from '@expo/vector-icons';
import IconFallback from '../shared/IconFallback';

// Enhanced styles with yellow theme integration
const additionalStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.4,
  },
  serviceTypeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 4,
  },
  serviceTypeCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceTypeCardSelected: {
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  serviceTypeIcon: {
    marginBottom: 12,
  },
  serviceTypeTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  serviceTypeDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  vehicleCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  vehicleCardSelected: {
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  vehicleIcon: {
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  vehicleDetails: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 4,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicatorSelected: {
    backgroundColor: '#EAB308',
  },
  selectionIndicatorUnselected: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  // Hero section styles - Compact
  heroSection: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: 8,
  },
  heroWave: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 12,
  },
  // Required field validation styles
  requiredFieldIndicator: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  serviceTypeCardRequired: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  vehicleCardRequired: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  addVehicleCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  addVehicleCardPressed: {
    borderColor: '#EAB308',
    backgroundColor: '#EAB308' + '10',
  },
  addVehicleIcon: {
    marginBottom: 8,
  },
  addVehicleText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#6B7280',
  },
  // Location section styles
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputHeaderIcon: {
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textInputFocused: {
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#6B7280',
  },
  requiredStar: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  // Location dropdown styles
  locationDropdown: {
    marginBottom: 16,
  },
  locationDropdownButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  locationDropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDropdownButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  locationDropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  locationDropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  locationDropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDropdownItemText: {
    marginLeft: 12,
    flex: 1,
  },
  locationDropdownItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationDropdownItemAddress: {
    fontSize: 12,
    opacity: 0.7,
  },
});

interface VehicleServiceStepProps extends StepComponentProps {
  onServiceTypeSelect?: (serviceType: 'mobile' | 'shop') => void;
  onVehicleSelect?: (vehicleId: string) => void;
  onAddVehicle?: () => void;
  onLocationSelect?: () => void;
}

const VehicleServiceStep: React.FC<VehicleServiceStepProps> = ({
  formData,
  updateFormData,
  theme,
  onServiceTypeSelect,
  onVehicleSelect,
  onAddVehicle,
  onLocationSelect,
}) => {
  const baseStyles = createJobStyles(theme);
  const styles = { ...baseStyles, ...additionalStyles };
  const { vehicles } = useVehicle();
  const { homeAddress, savedLocations } = useLocation();
  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = React.useState<boolean>(false);
  

  // Animation values for enhanced interactions
  const mobileScale = React.useRef(new Animated.Value(1)).current;
  const shopScale = React.useRef(new Animated.Value(1)).current;
  const heroScale = React.useRef(new Animated.Value(1)).current;
  const heroOpacity = React.useRef(new Animated.Value(0)).current;
  const heroIconPulse = React.useRef(new Animated.Value(1)).current;

  // Hero animation on mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for hero icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(heroIconPulse, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(heroIconPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [heroIconPulse, heroOpacity, heroScale]);

  // Simplified vehicle options
  const vehicleOptions: Vehicle[] = React.useMemo(() => {
    return vehicles.map((vehicle: any) => ({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      type: 'car' as const,
      engineType: 'gas' as const,
    }));
  }, [vehicles]);

  // Handle service type selection with animation
  const handleServiceTypeSelect = React.useCallback((serviceType: 'mobile' | 'shop') => {
    const scaleValue = serviceType === 'mobile' ? mobileScale : shopScale;
    
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    updateFormData('serviceType', serviceType);
    onServiceTypeSelect?.(serviceType);
  }, [updateFormData, onServiceTypeSelect, mobileScale, shopScale]);

  // Handle vehicle selection
  const handleVehicleSelect = React.useCallback((vehicleId: string) => {
    updateFormData('vehicle', vehicleId);
    onVehicleSelect?.(vehicleId);
  }, [updateFormData, onVehicleSelect]);

  // Handle location text change
  const handleLocationTextChange = React.useCallback((value: string) => {
    updateFormData('location', value);
  }, [updateFormData]);

  // Handle location selection
  const handleLocationSelect = React.useCallback(() => {
    onLocationSelect?.();
  }, [onLocationSelect]);

  // Handle saved location selection
  const handleSavedLocationSelect = React.useCallback((location: any) => {
    updateFormData('location', location.address);
    setShowLocationDropdown(false);
  }, [updateFormData]);

  // Get field validation state
  const getFieldValidationState = React.useCallback((field: string) => {
    const value = (formData as any)[field];
    
    if (field === 'location') {
      if (!value || value.trim().length === 0) {
        return { isValid: false, message: 'Service location is required to proceed' };
      }
      if (value.trim().length < 5) {
        return { isValid: false, message: 'Please enter a more specific location (at least 5 characters)' };
      }
      return { isValid: true, message: null };
    }
    
    return { isValid: true, message: null };
  }, [formData]);

  // Render service type card
  const renderServiceTypeCard = (
    type: 'mobile' | 'shop',
    title: string,
    description: string,
    icon: keyof typeof Ionicons.glyphMap,
    scaleValue: Animated.Value
  ) => {
    const isSelected = formData.serviceType === type;
    const isRequired = isServiceTypeRequired;
    
    return (
      <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
        <TouchableOpacity
          style={[
            styles.serviceTypeCard,
            { backgroundColor: theme.surfaceVariant },
            isSelected && styles.serviceTypeCardSelected,
            isSelected && { backgroundColor: theme.primary + '15' },
            isRequired && !isSelected && styles.serviceTypeCardRequired
          ]}
          onPress={() => handleServiceTypeSelect(type)}
          activeOpacity={0.8}
        >
          
          <View style={styles.serviceTypeIcon}>
            <Ionicons 
              name={icon} 
              size={28} 
              color={isSelected ? theme.primary : theme.textSecondary} 
            />
          </View>
          
          <Text style={[
            styles.serviceTypeTitle,
            { color: theme.text }
          ]}>
            {title}
          </Text>
          
          <Text style={[
            styles.serviceTypeDescription,
            { color: theme.textSecondary }
          ]}>
            {description}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render vehicle card
  const renderVehicleCard = (vehicle: Vehicle) => {
    const isSelected = formData.vehicle === vehicle.id;
    const isRequired = isVehicleRequired;
    
    return (
      <TouchableOpacity
        key={vehicle.id}
        style={[
          styles.vehicleCard,
          { backgroundColor: theme.surfaceVariant },
          isSelected && styles.vehicleCardSelected,
          isSelected && { backgroundColor: theme.primary + '15' },
          isRequired && !isSelected && styles.vehicleCardRequired
        ]}
        onPress={() => handleVehicleSelect(vehicle.id)}
        activeOpacity={0.8}
      >
        
        <View style={styles.vehicleIcon}>
          <Ionicons 
            name="car" 
            size={24} 
            color={isSelected ? theme.primary : theme.textSecondary} 
          />
        </View>
        
        <Text style={[
          styles.vehicleName,
          { color: theme.text }
        ]}>
          {vehicle.make} {vehicle.model}
        </Text>
        
        <Text style={[
          styles.vehicleDetails,
          { color: theme.textSecondary }
        ]}>
          {vehicle.year} • {vehicle.type}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render add vehicle card
  const renderAddVehicleCard = () => {
    return (
      <TouchableOpacity
        style={[
          styles.addVehicleCard,
          { borderColor: theme.border }
        ]}
        onPress={onAddVehicle}
        activeOpacity={0.7}
      >
        <View style={styles.addVehicleIcon}>
          <Ionicons 
            name="add-circle-outline" 
            size={32} 
            color={theme.primary} 
          />
        </View>
        
        <Text style={[
          styles.addVehicleText,
          { color: theme.primary }
        ]}>
          Add Vehicle
        </Text>
      </TouchableOpacity>
    );
  };

  // Render location dropdown
  const renderLocationDropdown = () => {
    const allLocations = [
      ...(homeAddress ? [homeAddress] : []),
      ...savedLocations.filter(loc => !loc.isHome)
    ];

    if (allLocations.length === 0) {
      return null;
    }

    return (
      <View style={styles.locationDropdown}>
        <TouchableOpacity
          style={[
            styles.locationDropdownButton,
            { 
              borderColor: theme.border, 
              backgroundColor: theme.surfaceVariant 
            }
          ]}
          onPress={() => setShowLocationDropdown(!showLocationDropdown)}
          activeOpacity={0.7}
        >
          <View style={styles.locationDropdownButtonContent}>
            <Ionicons name="location" size={18} color={theme.primary} />
            <Text style={[styles.locationDropdownButtonText, { color: theme.text }]}>
              Choose from saved locations
            </Text>
            <Ionicons 
              name={showLocationDropdown ? "chevron-up" : "chevron-down"} 
              size={18} 
              color={theme.textSecondary} 
            />
          </View>
        </TouchableOpacity>

        {showLocationDropdown && (
          <View style={[
            styles.locationDropdownList,
            { 
              backgroundColor: theme.surface, 
              borderColor: theme.border,
              shadowColor: theme.text
            }
          ]}>
            {allLocations.map((location, index) => (
              <TouchableOpacity
                key={location.id || index}
                style={[
                  styles.locationDropdownItem,
                  { borderBottomColor: theme.border }
                ]}
                onPress={() => handleSavedLocationSelect(location)}
                activeOpacity={0.7}
              >
                <View style={styles.locationDropdownItemContent}>
                  <Ionicons 
                    name={location.isHome ? "home" : "location"} 
                    size={16} 
                    color={theme.primary} 
                  />
                  <View style={styles.locationDropdownItemText}>
                    <Text style={[styles.locationDropdownItemName, { color: theme.text }]}>
                      {location.nickname || location.name || (location.isHome ? 'Home' : 'Saved Location')}
                    </Text>
                    <Text style={[styles.locationDropdownItemAddress, { color: theme.textSecondary }]}>
                      {location.address}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Render empty state for vehicles
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Ionicons 
          name="car-outline" 
          size={48} 
          color={theme.textSecondary} 
        />
      </View>
      <Text style={[styles.emptyStateText, { color: theme.text }]}>
        No Vehicles Found
      </Text>
      <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
        Add a vehicle to your profile to get started
      </Text>
    </View>
  );

  // Check if required fields are selected
  const isServiceTypeRequired = !formData.serviceType;
  const isVehicleRequired = !formData.vehicle;
  const isLocationRequired = !formData.location;

  // Render hero section
  const renderHeroSection = () => {
    const selectedServiceType = formData.serviceType;
    
    return (
      <Animated.View 
        style={[
          styles.heroSection,
          { 
            backgroundColor: theme.primary + '15',
            borderWidth: 2,
            borderColor: theme.primary + '30',
            opacity: heroOpacity,
            transform: [{ scale: heroScale }]
          }
        ]}
      >
        {/* Background Pattern */}
        <View style={[
          styles.heroBackground,
          { backgroundColor: theme.primary }
        ]} />
        
        <View style={styles.heroContent}>
          {/* Hero Icon */}
          <Animated.View style={[
            styles.heroIcon,
            { 
              backgroundColor: theme.primary,
              transform: [{ scale: heroIconPulse }]
            }
          ]}>
            <Ionicons 
              name={selectedServiceType === 'mobile' ? 'car-sport' : 'business'} 
              size={20} 
              color={theme.onPrimary} 
            />
          </Animated.View>
          
          {/* Hero Title */}
          <Text style={[
            styles.heroTitle,
            { color: theme.text }
          ]}>
            {selectedServiceType === 'mobile' ? 'Mobile Service' : 
             selectedServiceType === 'shop' ? 'Shop Service' : 
             'Choose Your Service'}
          </Text>
          
          {/* Hero Subtitle */}
          <Text style={[
            styles.heroSubtitle,
            { color: theme.textSecondary }
          ]}>
            {selectedServiceType === 'mobile' ? 
              'Professional mechanics come to your location' :
              selectedServiceType === 'shop' ?
              'Visit a fully equipped service center' :
              'Select how you would like to receive service'
            }
          </Text>
          
        </View>
        
        {/* Decorative Wave */}
        <View style={[
          styles.heroWave,
          { backgroundColor: theme.background }
        ]} />
      </Animated.View>
    );
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stepContainer}>
        
        {/* Hero Section */}
        {renderHeroSection()}
        
        {/* Service Type Selection */}
        <View style={styles.sectionContainer}>
          {isServiceTypeRequired && (
            <Text style={styles.requiredFieldIndicator}>
              * Required
            </Text>
          )}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Choose Service Type
          </Text>
          
          <View style={styles.serviceTypeGrid}>
            {renderServiceTypeCard(
              'shop',
              'Shop Service',
              'Visit a location',
              'business-outline',
              shopScale
            )}
            
            {renderServiceTypeCard(
              'mobile',
              'Mobile Service',
              'Mechanic comes to you',
              'car-outline',
              mobileScale
            )}
          </View>
        </View>

        {/* Vehicle Selection */}
        <View style={styles.sectionContainer}>
          {isVehicleRequired && (
            <Text style={styles.requiredFieldIndicator}>
              * Required
            </Text>
          )}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Select Your Vehicle
          </Text>
          
          {vehicleOptions.length > 0 ? (
            <View style={styles.vehicleGrid}>
              {vehicleOptions.map(renderVehicleCard)}
              {renderAddVehicleCard()}
            </View>
          ) : (
            <View>
              {renderEmptyState()}
              <View style={[styles.vehicleGrid, { marginTop: 16 }]}>
                {renderAddVehicleCard()}
              </View>
            </View>
          )}
        </View>

        {/* Location Section */}
        <View style={styles.sectionContainer}>
          {isLocationRequired && (
            <Text style={styles.requiredFieldIndicator}>
              * Required
            </Text>
          )}
          <View style={styles.inputHeader}>
            <View style={styles.inputHeaderLeft}>
              <IconFallback name="location-on" size={20} color={theme.textSecondary} style={styles.inputHeaderIcon} />
              <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18, marginBottom: 0 }]}>
                Service Location
              </Text>
              <Text style={[styles.requiredStar, { color: theme.error, marginLeft: 4 }]}>*</Text>
            </View>
          </View>
          <Text style={[styles.inputLabel, { color: theme.textSecondary, marginBottom: 16 }]}>
            Where should the service be performed?
          </Text>

          {/* Saved Locations Dropdown */}
          {renderLocationDropdown()}

          <TextInput
            style={[
              styles.textInput,
              focusedField === 'location' && styles.textInputFocused,
              !getFieldValidationState('location').isValid && styles.textInputError,
              { color: theme.text, borderColor: focusedField === 'location' ? theme.primary : theme.border }
            ]}
            value={formData.location}
            onChangeText={handleLocationTextChange}
            placeholder="Enter your address or location"
            placeholderTextColor={theme.textSecondary}
            onFocus={() => setFocusedField('location')}
            onBlur={() => setFocusedField(null)}
          />

          {getFieldValidationState('location').message && (
            <View style={styles.errorMessageContainer}>
              <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
              <Text style={[styles.errorText, { color: theme.error }]}>
                {getFieldValidationState('location').message}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.locationButton,
              { borderColor: theme.border, backgroundColor: theme.surfaceVariant }
            ]}
            onPress={handleLocationSelect}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={18} color={theme.primary} />
            <Text style={[styles.locationButtonText, { color: theme.primary }]}>
              Use Current Location
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default VehicleServiceStep;
