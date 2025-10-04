import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator } from 'react-native';
import { StepComponentProps, Vehicle } from '../../types/JobTypes';
import { useVehicle } from '../../contexts/VehicleContext';
import { useLocation } from '../../contexts/LocationContext';
import { createJobStyles } from '../../styles/CreateJobScreenStyles';
import { Ionicons } from '@expo/vector-icons';
import IconFallback from '../shared/IconFallback';
import locationService from '../../services/LocationService';

// Enhanced styles with yellow theme integration
const additionalStyles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Extra padding for keyboard and suggestions
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
  // Custom location input styles (avoiding FlatList nesting)
  locationInputContainer: {
    marginBottom: 16,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationInputIcon: {
    marginRight: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  locationInputFocused: {
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  locationInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  searchIndicator: {
    marginLeft: 8,
  },
  // Address suggestions using View instead of FlatList
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 150, // Reduced height to prevent clipping
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20, // Add margin to prevent clipping
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  currentLocationIcon: {
    marginRight: 8,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentLocationButtonDisabled: {
    opacity: 0.6,
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
  
  // Location input states
  const [addressSuggestions, setAddressSuggestions] = React.useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState<boolean>(false);
  const [isSearching, setIsSearching] = React.useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = React.useState<boolean>(false);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);

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

  // Handle location text change with address search
  const handleLocationTextChange = React.useCallback((text: string) => {
    updateFormData('location', text);
    
    if (text.length > 2) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set new timeout for search
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const result = await locationService.searchAddresses(text);
          if (result.success && result.results.length > 0) {
            setAddressSuggestions(result.results);
            setShowSuggestions(true);
            console.log(`📍 Found ${result.results.length} address suggestions using ${(result as any).fallback ? 'Expo Location' : 'Google Places'}`);
          } else if ((result as any).fallback) {
            console.log('Location service unavailable, allowing manual input');
            setAddressSuggestions([]);
            setShowSuggestions(false);
          } else {
            setAddressSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Address search error:', error);
          setAddressSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsSearching(false);
        }
      }, 500); // 500ms delay
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  }, [updateFormData]);

  // Handle location input focus with scroll
  const handleLocationFocus = React.useCallback(() => {
    setFocusedField('location');
    // Scroll to location section when keyboard opens
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Handle location input blur
  const handleLocationBlur = React.useCallback(() => {
    setFocusedField(null);
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = React.useCallback((suggestion: any) => {
    updateFormData('location', suggestion.address);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  }, [updateFormData]);

  // Handle current location
  const handleUseCurrentLocation = React.useCallback(async () => {
    if (onLocationSelect) {
      onLocationSelect();
    } else {
      setIsLoadingLocation(true);
      try {
        const result = await locationService.getCurrentLocationWithAddress();
        if (result.success) {
          updateFormData('location', result.address || '');
          setShowSuggestions(false);
          setAddressSuggestions([]);
        }
      } catch (error) {
        console.error('Location error:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    }
  }, [onLocationSelect, updateFormData]);

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

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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

  // Render custom location input (avoiding FlatList nesting)
  const renderLocationInput = () => {
    const isFocused = focusedField === 'location';
    const validationState = getFieldValidationState('location');
    
    return (
      <View style={styles.locationInputContainer}>
        <View style={[
          styles.locationInputWrapper,
          { 
            borderColor: isFocused ? theme.primary : validationState.isValid ? theme.border : theme.error,
            backgroundColor: theme.surface || '#FFFFFF'
          },
          isFocused && styles.locationInputFocused,
          !validationState.isValid && styles.locationInputError
        ]}>
          <IconFallback
            name="location-on"
            size={20}
            color={isFocused ? theme.primary : theme.textSecondary}
            style={styles.locationInputIcon}
          />
          <TextInput
            style={[
              styles.locationInput,
              { color: theme.text }
            ]}
            value={formData.location}
            onChangeText={handleLocationTextChange}
            placeholder="Enter your address or location"
            placeholderTextColor={theme.textSecondary}
            onFocus={handleLocationFocus}
            onBlur={handleLocationBlur}
            accessible={true}
            accessibilityLabel="Service location"
            accessibilityHint="Enter your address or location"
          />
          
          {/* Search indicator */}
          {isSearching && (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={styles.searchIndicator}
            />
          )}
        </View>

        {/* Address Suggestions using View instead of FlatList */}
        {showSuggestions && addressSuggestions.length > 0 && (
          <View style={[
            styles.suggestionsContainer, 
            { 
              borderColor: theme.border,
              backgroundColor: theme.surface || '#FFFFFF'
            }
          ]}>
            {addressSuggestions.slice(0, 3).map((item, index) => ( // Limit to 3 suggestions to prevent clipping
              <TouchableOpacity
                key={`suggestion-${index}`}
                style={[
                  styles.suggestionItem,
                  { borderBottomColor: theme.border }
                ]}
                onPress={() => handleSuggestionSelect(item)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Select address: ${item.address}`}
              >
                <IconFallback
                  name="location-on"
                  size={16}
                  color={theme.textSecondary}
                  style={styles.suggestionIcon}
                />
                <Text style={[styles.suggestionText, { color: theme.text }]}>
                  {item.address}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Current Location Button */}
        <TouchableOpacity
          style={[
            styles.currentLocationButton,
            isLoadingLocation && styles.currentLocationButtonDisabled
          ]}
          onPress={handleUseCurrentLocation}
          disabled={isLoadingLocation}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Use current location"
          accessibilityHint="Gets your current location and fills the address"
        >
          {isLoadingLocation ? (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={styles.currentLocationIcon}
            />
          ) : (
            <IconFallback
              name="my-location"
              size={16}
              color={theme.primary}
              style={styles.currentLocationIcon}
            />
          )}
          <Text style={[styles.currentLocationText, { color: theme.primary }]}>
            {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>

        {/* Error Message */}
        {validationState.message && (
          <View style={styles.errorMessageContainer}>
            <Ionicons name="alert-circle-outline" size={16} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>
              {validationState.message}
            </Text>
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
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        keyboardDismissMode="interactive"
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

          {/* Custom Location Input with Google Maps Autocomplete */}
          {renderLocationInput()}
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VehicleServiceStep;
