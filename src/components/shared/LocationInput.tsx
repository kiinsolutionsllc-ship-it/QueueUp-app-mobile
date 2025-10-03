import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../types/JobTypes';
import IconFallback from './IconFallback';
import locationService from '../../services/LocationService';

interface LocationInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  theme: Theme;
  style?: any;
  onUseCurrentLocation?: () => void;
  showCurrentLocationButton?: boolean;
  enableAddressAutofill?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChangeText,
  placeholder = "Enter your address or location",
  label = "Service Location",
  required = false,
  error,
  theme,
  style,
  onUseCurrentLocation,
  showCurrentLocationButton = true,
  enableAddressAutofill = true,
  onFocus,
  onBlur,
}) => {
  const [focused, setFocused] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle text input changes with address search
  const handleTextChange = useCallback((text: string) => {
    onChangeText(text);
    
    if (enableAddressAutofill && text.length > 2) {
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
            setAddressSuggestions(result.results as any);
            setShowSuggestions(true);
            console.log(`📍 Found ${result.results.length} address suggestions using ${(result as any).fallback ? 'Expo Location' : 'Google Places'}`);
          } else if ((result as any).fallback) {
            // Location service failed, but we can still allow manual input
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
  }, [onChangeText, enableAddressAutofill]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: any) => {
    onChangeText(suggestion.address);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  }, [onChangeText]);

  // Handle current location with proper implementation
  const handleUseCurrentLocation = useCallback(async () => {
    if (onUseCurrentLocation) {
      onUseCurrentLocation();
    } else {
      setIsLoadingLocation(true);
      try {
        const result = await locationService.getCurrentLocationWithAddress();
        if (result.success) {
          onChangeText(result.address || '');
          setShowSuggestions(false);
          setAddressSuggestions([]);
        } else {
          Alert.alert(
            'Location Error',
            locationService.getErrorMessage(new Error(result.error)),
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Location error:', error);
        Alert.alert(
          'Location Error',
          locationService.getErrorMessage(error),
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoadingLocation(false);
      }
    }
  }, [onUseCurrentLocation, onChangeText]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    setFocused(true);
    if (enableAddressAutofill && value.length > 2) {
      setShowSuggestions(true);
    }
    // Call parent onFocus if provided
    if (onFocus) {
      onFocus();
    }
  }, [enableAddressAutofill, value, onFocus]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    setFocused(false);
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
    // Call parent onBlur if provided
    if (onBlur) {
      onBlur();
    }
  }, [onBlur]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>
          {label} {required && <Text style={{ color: theme.error }}>*</Text>}
        </Text>
      )}
      
      {/* Manual Location Input */}
      <View style={[
        styles.inputContainer,
        { 
          borderColor: focused ? theme.primary : error ? theme.error : theme.border,
          backgroundColor: theme.surface || '#FFFFFF'
        }
      ]}>
        <IconFallback
          name="location-on"
          size={20}
          color={focused ? theme.primary : theme.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[
            styles.textInput,
            { color: theme.text }
          ]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessible={true}
          accessibilityLabel={label}
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

      {/* Address Suggestions Dropdown */}
      {showSuggestions && addressSuggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { borderColor: theme.border }]}>
          <FlatList
            data={addressSuggestions}
            keyExtractor={(item, index) => `suggestion-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Select address: ${(item as any).address}`}
              >
                <IconFallback
                  name="location-on"
                  size={16}
                  color={theme.textSecondary}
                  style={styles.suggestionIcon}
                />
                <Text style={[styles.suggestionText, { color: theme.text }]}>
                  {(item as any).address}
                </Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Optional: Use Current Location Button */}
      {showCurrentLocationButton && (
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
      )}
      
      {error && (
        <Text style={[styles.errorText, { color: theme.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  inputContainer: {
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
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    borderWidth: 0,
    backgroundColor: 'transparent',
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
  searchIndicator: {
    marginLeft: 8,
  },
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
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default LocationInput;
