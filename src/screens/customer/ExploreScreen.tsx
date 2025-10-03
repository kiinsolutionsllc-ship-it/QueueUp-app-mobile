import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  StatusBar,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import IconFallback from '../../components/shared/IconFallback';
import * as Location from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import { useLanguage } from '../../contexts/LanguageContext';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
// MockDataService removed - no mock data
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialButton from '../../components/shared/MaterialButton';
import FavoritesService from '../../services/FavoritesService';

// Screen dimensions available if needed
// const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Reusable Dropdown Component
const FilterDropdown = ({ 
  title, 
  value, 
  options, 
  onSelect, 
  isOpen, 
  onToggle, 
  theme,
  icon = null,
  multiSelect = false,
  searchable = false
}: { title: any, value: any, options: any, onSelect: any, isOpen: any, onToggle: any, theme: any, icon?: any, multiSelect?: any, searchable?: any }) => {
  const [searchText, setSearchText] = useState<any>('');
  const selectedOption = options.find(opt => opt.id === value) || options[0] || { label: 'Select...', name: 'Select...' };
  
  const filteredOptions = searchable && searchText 
    ? options.filter((option: any) => 
        (option.label || option.name).toLowerCase().includes(searchText.toLowerCase())
      )
    : options;
  
  return (
    <View style={styles.dropdownContainer}>
      <Text style={[styles.dropdownTitle, { color: theme.text }]}>{title}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, { 
          backgroundColor: theme.surface,
          borderColor: isOpen ? theme.primary : theme.border 
        }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onToggle();
        }}
      >
        <View style={styles.dropdownButtonContent}>
          {icon && <IconFallback name={icon} size={18} color={theme.text} />}
          <Text style={[styles.dropdownButtonText, { color: theme.text }]}>
            {selectedOption.label || selectedOption.name}
          </Text>
        </View>
      </TouchableOpacity>
      
      {isOpen && (
        <View style={[styles.dropdownMenu, { 
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          shadowColor: theme.shadow 
        }]}>
          {searchable && (
            <View style={[styles.searchContainer, { 
              backgroundColor: theme.surface,
              borderColor: theme.border,
              margin: 8,
              marginBottom: 4
            }]}>
              <IconFallback name="search" size={16} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text, fontSize: 14 }]}
                placeholder="Search..."
                placeholderTextColor={theme.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          )}
          <ScrollView 
            style={styles.dropdownScroll} 
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            {(filteredOptions || []).map((option: any) => {
              if (!option) return null;
              return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.dropdownOption,
                  {
                    backgroundColor: value === option.id ? theme.primary + '20' : 'transparent',
                    borderBottomColor: theme.border
                  }
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onSelect(option.id);
                  if (!multiSelect) onToggle();
                }}
              >
                <View style={styles.dropdownOptionContent}>
                  {option.icon && (
                    <Text style={styles.dropdownOptionIcon}>{option.icon}</Text>
                  )}
                  <Text style={[
                    styles.dropdownOptionText,
                    { 
                      color: value === option.id ? theme.primary : theme.text,
                      fontWeight: value === option.id ? '600' : '400'
                    }
                  ]}>
                    {option.label || option.name}
                  </Text>
                  {value === option.id && (
                    <IconFallback name="check" size={16} color={theme.primary} />
                  )}
                </View>
              </TouchableOpacity>
            );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

interface ExploreScreenProps {
  navigation: any;
}

export default function ExploreScreen({ navigation }: ExploreScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const theme = getCurrentTheme();
  
  // State
  const [searchQuery, setSearchQuery] = useState<any>('');
  const [selectedCategory, setSelectedCategory] = useState<any>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<any>('all');
  const [userLocation, setUserLocation] = useState<any>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<any>(false);
  const [useLocationSearch, setUseLocationSearch] = useState<any>(false);
  const [maxDistance, setMaxDistance] = useState<any>(50);
  const [showFilters, setShowFilters] = useState<any>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<any>(false);
  const [showFilterModal, setShowFilterModal] = useState<any>(false);
  const [priceRange, setPriceRange] = useState<any>({ min: 0, max: 500 });
  const [ratingRange, setRatingRange] = useState<any>({ min: 0, max: 5 });
  const [openDropdown, setOpenDropdown] = useState<any>(null);
  const [mechanicType, setMechanicType] = useState<any>('shops'); // 'shops', 'freelance'
  const [favorites, setFavorites] = useState<any>([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;

  // Get mechanics from empty array (no mock data)
  const mockMechanics = ([] as any[]).map((mechanic: any) => ({
    ...mechanic,
    mechanicType: 'freelance', // Default existing mechanics to freelance
    languages: (mechanic as any).languages || [
      ['English', 'Spanish'],
      ['English', 'French'],
      ['English', 'German'],
      ['English', 'Spanish', 'French'],
      ['English', 'Spanish', 'German'],
      ['English', 'French', 'German'],
      ['English', 'Spanish', 'French', 'German']
    ][Math.floor(Math.random() * 7)]
  }));

  // Sample mechanic shops
  const mechanicShops = [
    {
      id: 'shop_1',
      name: "AutoCare Pro Shop",
      mechanicType: "shops",
      rating: 4.8,
      reviews: 124,
      distance: 2.3,
      specialties: ["Engine Repair", "Brake Service", "AC Repair", "Transmission"],
      address: "123 Main St, Downtown",
      phone: "(555) 123-4567",
      hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM",
      services: ["Full Service", "Diagnostics", "Parts & Accessories", "Warranty Work"],
      image: "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=400",
      priceRange: { min: 50, max: 150 },
      availability: "Available Now",
      languages: ["English", "Spanish"],
      experience: "15+ years",
      isOpen: true,
      isFavorite: false,
      latitude: 40.7128,
      longitude: -74.0060,
      description: "Full-service automotive repair shop specializing in all makes and models",
      certifications: ["ASE Certified", "AAA Approved"],
      amenities: ["Waiting Area", "Free WiFi", "Coffee", "Shuttle Service"]
    },
    {
      id: 'shop_2',
      name: "Elite Auto Service",
      mechanicType: "shops",
      rating: 4.9,
      reviews: 89,
      distance: 3.1,
      specialties: ["Luxury Cars", "European Models", "Performance Tuning", "Transmission"],
      address: "456 Oak Ave, Midtown",
      phone: "(555) 987-6543",
      hours: "Mon-Sat: 7AM-7PM, Sun: 10AM-4PM",
      services: ["Premium Service", "Custom Work", "Warranty Service", "Performance Tuning"],
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400",
      priceRange: { min: 75, max: 200 },
      availability: "Available Now",
      languages: ["English", "French"],
      experience: "20+ years",
      isOpen: true,
      isFavorite: true,
      latitude: 40.7589,
      longitude: -73.9851,
      description: "Premium automotive service for luxury and performance vehicles",
      certifications: ["ASE Master Certified", "BMW Certified", "Mercedes Certified"],
      amenities: ["Luxury Waiting Area", "Concierge Service", "Valet Parking", "Refreshments"]
    },
    {
      id: 'shop_3',
      name: "Quick Fix Garage",
      mechanicType: "shops",
      rating: 4.5,
      reviews: 67,
      distance: 1.8,
      specialties: ["Quick Repairs", "Oil Changes", "Tire Service", "Battery"],
      address: "789 Pine St, Uptown",
      phone: "(555) 456-7890",
      hours: "Mon-Fri: 6AM-8PM, Sat: 7AM-6PM",
      services: ["Express Service", "Mobile Service", "Emergency Repairs", "Oil Changes"],
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      priceRange: { min: 40, max: 120 },
      availability: "Busy - 2 hour wait",
      languages: ["English"],
      experience: "10+ years",
      isOpen: true,
      isFavorite: false,
      latitude: 40.7505,
      longitude: -73.9934,
      description: "Fast and reliable automotive service with no appointment necessary",
      certifications: ["ASE Certified"],
      amenities: ["Drive-Through Service", "Free Coffee", "Magazines"]
    },
    {
      id: 'shop_4',
      name: "Family Auto Center",
      mechanicType: "shops",
      rating: 4.7,
      reviews: 156,
      distance: 2.8,
      specialties: ["General Repair", "Brake Service", "Suspension", "Exhaust"],
      address: "321 Elm Street, Suburbs",
      phone: "(555) 234-5678",
      hours: "Mon-Fri: 8AM-6PM, Sat: 8AM-5PM",
      services: ["Complete Auto Care", "Brake Service", "Suspension Work", "Exhaust Repair"],
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      priceRange: { min: 40, max: 180 },
      availability: "Available Now",
      languages: ["English", "Spanish", "Portuguese"],
      experience: "12+ years",
      isOpen: true,
      isFavorite: false,
      latitude: 40.7282,
      longitude: -73.7949,
      description: "Family-owned shop providing honest, reliable service for over a decade",
      certifications: ["ASE Certified", "Better Business Bureau A+"],
      amenities: ["Family Waiting Area", "Kids Play Area", "Free WiFi", "Coffee & Snacks"]
    },
    {
      id: 'shop_5',
      name: "Express Lube & Tune",
      mechanicType: "shops",
      rating: 4.4,
      reviews: 67,
      distance: 1.2,
      specialties: ["Oil Change", "Filter Service", "Fluid Check", "Basic Maintenance"],
      address: "654 Pine St, Near Mall",
      phone: "(555) 345-6789",
      hours: "Mon-Sat: 8AM-8PM, Sun: 10AM-6PM",
      services: ["Express Oil Change", "Filter Replacement", "Fluid Services", "Tire Rotation"],
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400",
      priceRange: { min: 25, max: 80 },
      availability: "Available Now",
      languages: ["English"],
      experience: "5+ years",
      isOpen: true,
      isFavorite: false,
      latitude: 40.7614,
      longitude: -73.9776,
      description: "Quick and affordable oil changes and basic maintenance services",
      certifications: ["ASE Certified"],
      amenities: ["Express Service", "Free WiFi", "TV", "Coffee"]
    },
    {
      id: 'shop_6',
      name: "Precision Auto Works",
      mechanicType: "shops",
      rating: 4.9,
      reviews: 189,
      distance: 4.2,
      specialties: ["Engine Rebuild", "Transmission", "Diagnostics", "Custom Work"],
      address: "987 Industrial Blvd, Industrial District",
      phone: "(555) 456-7890",
      hours: "Mon-Fri: 7AM-5PM",
      services: ["Engine Rebuilds", "Transmission Service", "Advanced Diagnostics", "Custom Modifications"],
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400",
      priceRange: { min: 80, max: 400 },
      availability: "Available Now",
      languages: ["English", "German"],
      experience: "25+ years",
      isOpen: true,
      isFavorite: false,
      latitude: 40.6892,
      longitude: -74.0445,
      description: "Specialized in complex engine and transmission work with precision craftsmanship",
      certifications: ["ASE Master Certified", "Factory Trained"],
      amenities: ["Professional Waiting Area", "Free WiFi", "Coffee", "Work Updates"]
    },
    {
      id: 'shop_7',
      name: "Green Auto Solutions",
      mechanicType: "shops",
      rating: 4.5,
      reviews: 98,
      distance: 3.5,
      specialties: ["Hybrid Service", "Electric Vehicles", "Eco-Friendly", "Battery Service"],
      address: "147 Green Way, Eco District",
      phone: "(555) 567-8901",
      hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
      services: ["Hybrid Service", "EV Maintenance", "Battery Service", "Eco Repairs"],
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      priceRange: { min: 60, max: 200 },
      availability: "Available Now",
      languages: ["English", "Spanish"],
      experience: "10+ years",
      isOpen: true,
      isFavorite: false,
      latitude: 40.7505,
      longitude: -73.9934,
      description: "Eco-friendly automotive service specializing in hybrid and electric vehicles",
      certifications: ["ASE Certified", "Hybrid Certified", "EV Certified"],
      amenities: ["Eco-Friendly Waiting Area", "Free WiFi", "Organic Coffee", "Recycling Center"]
    },
    {
      id: 'shop_8',
      name: "24/7 Emergency Auto",
      mechanicType: "shops",
      rating: 4.3,
      reviews: 145,
      distance: 2.1,
      specialties: ["Emergency Repair", "Towing", "Roadside", "After Hours"],
      address: "258 Emergency Lane, Downtown",
      phone: "(555) 678-9012",
      hours: "24/7 Emergency Service",
      services: ["Emergency Repairs", "Towing Service", "Roadside Assistance", "After Hours Service"],
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
      priceRange: { min: 75, max: 250 },
      availability: "Available Now",
      languages: ["English", "Spanish", "French"],
      experience: "15+ years",
      isOpen: true,
      isFavorite: false,
      latitude: 40.7128,
      longitude: -74.0060,
      description: "Round-the-clock emergency automotive service and towing",
      certifications: ["ASE Certified", "AAA Approved", "Emergency Response Certified"],
      amenities: ["24/7 Service", "Towing Available", "Emergency Waiting Area", "Coffee & Snacks"]
    }
  ];

  // Sample freelance mechanics
  const freelanceMechanics = [
    {
      id: 'freelance_1',
      name: "Mike Rodriguez",
      mechanicType: "freelance",
      rating: 4.9,
      reviews: 156,
      distance: 1.2,
      specialties: ["Engine Diagnostics", "Transmission", "Electrical", "Mobile Service"],
      address: "Mobile Service Available",
      phone: "(555) 234-5678",
      hours: "24/7 Emergency Service",
      services: ["Mobile Repair", "Home Visits", "Emergency Service", "Diagnostics"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      priceRange: { min: 60, max: 100 },
      availability: "Available Now",
      languages: ["English", "Spanish"],
      experience: "12+ years",
      isOpen: true,
      isFavorite: true,
      isMobile: true,
      latitude: 40.7614,
      longitude: -73.9776,
      description: "Experienced mobile mechanic specializing in engine and transmission diagnostics",
      certifications: ["ASE Certified", "Mobile Service Certified"],
      responseTime: "15-30 minutes"
    },
    {
      id: 'freelance_2',
      name: "Sarah Johnson",
      mechanicType: "freelance",
      rating: 4.7,
      reviews: 98,
      distance: 2.5,
      specialties: ["Hybrid/Electric", "Brake Systems", "Suspension", "EV Service"],
      address: "Mobile Service Available",
      phone: "(555) 345-6789",
      hours: "Mon-Sun: 7AM-9PM",
      services: ["Mobile Repair", "Specialized Diagnostics", "Preventive Maintenance", "EV Service"],
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
      priceRange: { min: 55, max: 95 },
      availability: "Available in 1 hour",
      languages: ["English", "French"],
      experience: "8+ years",
      isOpen: true,
      isFavorite: false,
      isMobile: true,
      latitude: 40.7505,
      longitude: -73.9934,
      description: "Specialized in hybrid and electric vehicle maintenance and repair",
      certifications: ["ASE Certified", "Hybrid Certified", "EV Certified"],
      responseTime: "45-60 minutes"
    },
    {
      id: 'freelance_3',
      name: "David Chen",
      mechanicType: "freelance",
      rating: 4.8,
      reviews: 203,
      distance: 3.2,
      specialties: ["Classic Cars", "Restoration", "Custom Work", "Vintage Repairs"],
      address: "Mobile Service Available",
      phone: "(555) 456-7890",
      hours: "By Appointment",
      services: ["Restoration", "Custom Modifications", "Vintage Repairs", "Classic Car Service"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      priceRange: { min: 80, max: 150 },
      availability: "Available Tomorrow",
      languages: ["English", "Mandarin"],
      experience: "18+ years",
      isOpen: false,
      isFavorite: false,
      isMobile: true,
      latitude: 40.7282,
      longitude: -73.7949,
      description: "Master craftsman specializing in classic car restoration and custom work",
      certifications: ["ASE Master Certified", "Classic Car Specialist"],
      responseTime: "24-48 hours"
    },
    {
      id: 'freelance_4',
      name: "Alex Thompson",
      mechanicType: "freelance",
      rating: 4.6,
      reviews: 87,
      distance: 1.8,
      specialties: ["Quick Repairs", "Oil Changes", "Tire Service", "Basic Maintenance"],
      address: "Mobile Service Available",
      phone: "(555) 567-8901",
      hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM",
      services: ["Quick Repairs", "Oil Changes", "Tire Service", "Basic Maintenance"],
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      priceRange: { min: 40, max: 80 },
      availability: "Available Now",
      languages: ["English"],
      experience: "6+ years",
      isOpen: true,
      isFavorite: false,
      isMobile: true,
      latitude: 40.7589,
      longitude: -73.9851,
      description: "Fast and reliable mobile service for quick repairs and maintenance",
      certifications: ["ASE Certified"],
      responseTime: "20-40 minutes"
    },
    {
      id: 'freelance_5',
      name: "Maria Garcia",
      mechanicType: "freelance",
      rating: 4.9,
      reviews: 134,
      distance: 2.9,
      specialties: ["AC Repair", "Heating", "Electrical", "Mobile Service"],
      address: "Mobile Service Available",
      phone: "(555) 678-9012",
      hours: "Mon-Sun: 8AM-8PM",
      services: ["AC Repair", "Heating Service", "Electrical Work", "Mobile Service"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      priceRange: { min: 50, max: 120 },
      availability: "Available in 30 minutes",
      languages: ["English", "Spanish", "Portuguese"],
      experience: "10+ years",
      isOpen: true,
      isFavorite: false,
      isMobile: true,
      latitude: 40.7128,
      longitude: -74.0060,
      description: "Expert in AC and heating systems with mobile service available",
      certifications: ["ASE Certified", "HVAC Certified"],
      responseTime: "30-45 minutes"
    },
    {
      id: 'freelance_6',
      name: "James Wilson",
      mechanicType: "freelance",
      rating: 4.5,
      reviews: 76,
      distance: 3.8,
      specialties: ["Diesel Service", "Heavy Equipment", "Fleet Maintenance", "Mobile Service"],
      address: "Mobile Service Available",
      phone: "(555) 789-0123",
      hours: "Mon-Fri: 7AM-5PM",
      services: ["Diesel Service", "Heavy Equipment", "Fleet Maintenance", "Mobile Service"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      priceRange: { min: 70, max: 130 },
      availability: "Available Tomorrow",
      languages: ["English"],
      experience: "15+ years",
      isOpen: true,
      isFavorite: false,
      isMobile: true,
      latitude: 40.6892,
      longitude: -74.0445,
      description: "Specialized in diesel engines and heavy equipment maintenance",
      certifications: ["ASE Certified", "Diesel Specialist"],
      responseTime: "2-4 hours"
    }
  ];

  // Combine all mechanics
  const allMechanics = [...mockMechanics, ...mechanicShops, ...freelanceMechanics];

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Clear all filters function
  const clearAllFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLanguage('all');
    setMaxDistance(50);
    setUseLocationSearch(false);
    setUserLocation(null);
    setShowFilters(false);
    setShowFilterModal(false);
    setPriceRange({ min: 0, max: 1000 });
    setRatingRange({ min: 0, max: 5 });
    setOpenDropdown(null);
    setMechanicType('shops');
  };

  // Apply filters and close modal
  const applyFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowFilterModal(false);
  };

  // Dropdown handlers
  const handleDropdownToggle = (dropdownId: any) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const handlePriceSelect = (priceId: any) => {
    const option = priceOptions.find(opt => opt.id === priceId);
    if (option) {
      setPriceRange({ min: option.min, max: option.max });
    }
  };

  const handleRatingSelect = (ratingId: any) => {
    const option = ratingOptions.find(opt => opt.id === ratingId);
    if (option) {
      setRatingRange({ min: option.min, max: option.max });
    }
  };

  // Handle direct booking with mechanic
  const handleBookService = (mechanic: any) => {
    try {
      // Navigate to CreateJobScreen with pre-filled mechanic data
      navigation.navigate('CreateJob', {
        // Pre-fill mechanic information
        selectedMechanic: {
          id: mechanic.id,
          name: mechanic.name,
          type: mechanic.mechanicType, // 'shops' or 'freelance'
          specialties: mechanic.specialties,
          rating: mechanic.rating,
          priceRange: mechanic.priceRange,
          isMobile: mechanic.isMobile,
          address: mechanic.address,
          phone: mechanic.phone,
          languages: mechanic.languages,
          experience: mechanic.experience,
          certifications: mechanic.certifications,
          amenities: mechanic.amenities,
          responseTime: mechanic.responseTime,
          availability: mechanic.availability,
          isOpen: mechanic.isOpen,
          latitude: mechanic.latitude,
          longitude: mechanic.longitude,
          reviews: mechanic.reviews
        },
        // Pre-fill service type based on mechanic type
        serviceType: mechanic.mechanicType === 'freelance' ? 'mobile' : 'shop',
        // Pre-fill location if it's a shop
        location: mechanic.mechanicType === 'shops' ? mechanic.address : '',
        // Set booking source
        bookingSource: 'explore_screen',
        // Pre-fill estimated cost range
        estimatedCost: mechanic.priceRange ? {
          min: mechanic.priceRange.min,
          max: mechanic.priceRange.max
        } : null
      });
    } catch (error) {
      console.error('Error navigating to booking:', error);
      Alert.alert(
        'Booking Error',
        'Unable to start booking process. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };


  // Get current selected values for display
  const getCurrentPriceLabel = () => {
    const option = priceOptions.find(opt => 
      opt.min === priceRange.min && opt.max === priceRange.max
    );
    return option ? option.label : `$${priceRange.min} - $${priceRange.max}`;
  };

  const getCurrentRatingLabel = () => {
    const option = ratingOptions.find(opt => 
      opt.min === ratingRange.min && opt.max === ratingRange.max
    );
    return option ? option.label : `${ratingRange.min}+ Stars`;
  };


  // Request location permission and get user location
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to find mechanics near you.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission.');
      return false;
    }
  };

  const getUserLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadFavorites = async () => {
    try {
      await FavoritesService.initialize();
      const customerFavorites = FavoritesService.getCustomerFavorites(getFallbackUserIdWithTypeDetection(user?.id, user?.user_type));
      setFavorites(customerFavorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Animation effects
  useEffect(() => {
    // Reset animation values first
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const isFavorited = (mechanicId: any) => {
    return favorites.some(fav => fav.mechanicId === mechanicId);
  };

  const handleToggleFavorite = async (mechanic: any) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const result = await FavoritesService.toggleFavorite(
        getFallbackUserIdWithTypeDetection(user?.id, user?.user_type),
        mechanic
      );

      if (result.success) {
        await loadFavorites(); // Refresh favorites list
        Alert.alert(
          isFavorited(mechanic.id) ? 'Removed from Favorites' : 'Added to Favorites',
          isFavorited(mechanic.id) 
            ? 'This mechanic has been removed from your favorites.'
            : 'This mechanic has been added to your favorites!'
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  // Search focus animation
  useEffect(() => {
    Animated.timing(searchAnim, {
      toValue: isSearchFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSearchFocused, searchAnim]);

  // Filter animation
  useEffect(() => {
    Animated.timing(filterAnim, {
      toValue: showFilters ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFilters, filterAnim]);

  // Filter and sort mechanics based on search, category, language, and optionally distance
  const filteredMechanics = (allMechanics || [])
    .map(mechanic => {
      let distance = null;
      if (useLocationSearch && userLocation && (mechanic.location || (mechanic.latitude && mechanic.longitude))) {
        const lat = mechanic.location?.latitude || mechanic.latitude;
        const lon = mechanic.location?.longitude || mechanic.longitude;
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          lat,
          lon
        );
      } else if (mechanic.distance) {
        distance = mechanic.distance;
      }
      return { ...mechanic, distance };
    })
    .filter(mechanic => {
      const matchesSearch = mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           mechanic.specialties.some((specialty: any) => 
                             specialty.toLowerCase().includes(searchQuery.toLowerCase())
                           );
      const matchesCategory = selectedCategory === 'all' || 
                             mechanic.specialties.some((specialty: any) => {
                               const specialtyLower = specialty.toLowerCase();
                               switch(selectedCategory) {
                                 case 'maintenance':
                                   return specialtyLower.includes('maintenance') || 
                                          specialtyLower.includes('oil') || 
                                          specialtyLower.includes('lube') || 
                                          specialtyLower.includes('tire') || 
                                          specialtyLower.includes('brake') || 
                                          specialtyLower.includes('battery') ||
                                          specialtyLower.includes('filter') ||
                                          specialtyLower.includes('fluid');
                                 case 'repair':
                                   return specialtyLower.includes('repair') || 
                                          specialtyLower.includes('engine') || 
                                          specialtyLower.includes('transmission') || 
                                          specialtyLower.includes('electrical') || 
                                          specialtyLower.includes('ac') || 
                                          specialtyLower.includes('heating') ||
                                          specialtyLower.includes('suspension') ||
                                          specialtyLower.includes('exhaust') ||
                                          specialtyLower.includes('general');
                                 case 'diagnostic':
                                   return specialtyLower.includes('diagnostic') || 
                                          specialtyLower.includes('check engine') || 
                                          specialtyLower.includes('inspection') || 
                                          specialtyLower.includes('emissions') ||
                                          specialtyLower.includes('scan') ||
                                          specialtyLower.includes('code');
                                 case 'emergency':
                                   return specialtyLower.includes('emergency') || 
                                          specialtyLower.includes('roadside') || 
                                          specialtyLower.includes('jump start') || 
                                          specialtyLower.includes('tire change') || 
                                          specialtyLower.includes('lockout') || 
                                          specialtyLower.includes('towing') ||
                                          specialtyLower.includes('flat tire') ||
                                          specialtyLower.includes('fuel delivery');
                                 default:
                                   return specialtyLower.includes(selectedCategory.toLowerCase());
                               }
                             });
      const matchesLanguage = selectedLanguage === 'all' || 
                             (mechanic.languages && mechanic.languages.includes(selectedLanguage));
      const matchesDistance = !useLocationSearch || !userLocation || !mechanic.distance || mechanic.distance <= maxDistance;
      const mechanicMinPrice = mechanic.priceRange?.min || 0;
      const mechanicMaxPrice = mechanic.priceRange?.max || 1000;
      const matchesPrice = mechanicMinPrice <= priceRange.max && mechanicMaxPrice >= priceRange.min;
      const matchesRating = mechanic.rating >= ratingRange.min && mechanic.rating <= ratingRange.max;
      const matchesMechanicType = mechanic.mechanicType === mechanicType;
      return matchesSearch && matchesCategory && matchesLanguage && matchesDistance && 
             matchesPrice && matchesRating && matchesMechanicType;
    })
    .sort((a, b) => {
      // Sort by rating (highest first) as default
        return b.rating - a.rating;
    });

  const categories = [
    { id: 'all', name: 'All Services', label: 'All Services', icon: '🔧' },
    { id: 'maintenance', name: 'Maintenance', label: 'Maintenance', icon: '🔧' },
    { id: 'repair', name: 'Repair', label: 'Repair', icon: '🔨' },
    { id: 'diagnostic', name: 'Diagnostic', label: 'Diagnostic', icon: '🔍' },
    { id: 'emergency', name: 'Emergency', label: 'Emergency', icon: '🚨' },
  ];


  const priceOptions = [
    { id: 'any', label: 'Any Price', min: 0, max: 1000 },
    { id: 'budget', label: 'Budget ($25-$75)', min: 25, max: 75 },
    { id: 'standard', label: 'Standard ($75-$150)', min: 75, max: 150 },
    { id: 'premium', label: 'Premium ($150+)', min: 150, max: 1000 }
  ];

  const ratingOptions = [
    { id: '0', label: 'Any Rating', min: 0, max: 5 },
    { id: '4', label: '4+ Stars', min: 4, max: 5 },
    { id: '4.5', label: '4.5+ Stars', min: 4.5, max: 5 },
    { id: '5', label: '5 Stars Only', min: 5, max: 5 }
  ];




  // Get unique languages from all mechanics and add common languages
  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian',
    'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish',
    'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Croatian', 'Serbian',
    'Greek', 'Turkish', 'Hebrew', 'Thai', 'Vietnamese', 'Indonesian',
    'Malay', 'Tagalog', 'Swahili', 'Amharic', 'Yoruba', 'Igbo',
    'Hausa', 'Zulu', 'Xhosa', 'Afrikaans', 'Bengali', 'Tamil',
    'Telugu', 'Marathi', 'Gujarati', 'Punjabi', 'Urdu', 'Farsi'
  ];
  
  const availableLanguages = ['all', ...new Set([
    ...(allMechanics || []).flatMap(mechanic => mechanic.languages || []),
    ...commonLanguages
  ])];

  // Prepare dropdown options
  const languageOptions = (availableLanguages || []).length > 0 
    ? (availableLanguages || []).map(lang => ({
        id: lang,
        label: lang === 'all' ? 'All Languages' : lang,
        icon: lang === 'all' ? null : '🌐'
      }))
    : [{ id: 'all', label: 'All Languages', icon: null }];

  const renderStars = (rating: any) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconFallback
            key={star}
            name={star <= Math.floor(rating) ? 'star' : 'star-border'}
            size={16}
            color={theme.accentLight}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      
      <ModernHeader
        title="Find Mechanics"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showNotifications={true}
        onNotificationPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate('Notifications');
        }}
        showProfile={false}
        user={user}
        rightActions={[
          { 
            icon: 'menu', 
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowFilterModal(true);
            },
            color: theme.text
          },
        ]}
      />

      {/* Mechanic Type Tabs - Moved to top */}
      <View style={[styles.mechanicTypeContainer, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[
            styles.mechanicTypeTab,
            mechanicType === 'shops' && { backgroundColor: theme.accent }
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setMechanicType('shops');
          }}
        >
          <IconFallback 
            name="store" 
            size={24} 
            color={mechanicType === 'shops' ? theme.onAccent : theme.textSecondary} 
          />
          <Text style={[
            styles.mechanicTypeText,
            { color: mechanicType === 'shops' ? theme.onAccent : theme.textSecondary }
          ]}>
            Mechanic Shops
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.mechanicTypeTab,
            mechanicType === 'freelance' && { backgroundColor: theme.accent }
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setMechanicType('freelance');
          }}
        >
          <IconFallback 
            name="person" 
            size={24} 
            color={mechanicType === 'freelance' ? theme.onAccent : theme.textSecondary} 
          />
          <Text style={[
            styles.mechanicTypeText,
            { color: mechanicType === 'freelance' ? theme.onAccent : theme.textSecondary }
          ]}>
            Freelance Mechanics
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          nestedScrollEnabled={false}
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustContentInsets={true}
        >
          {/* Distance Filter - Only show when location search is enabled */}
          {useLocationSearch && userLocation && (
            <View style={styles.distanceSection}>
              <View style={styles.distanceHeader}>
                <Text style={[styles.distanceTitle, { color: theme.text }]}>
                  Within {maxDistance} miles
                </Text>
              </View>
              <View style={styles.distanceSlider}>
                {[10, 25, 50, 100].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceButton, 
                      { 
                        backgroundColor: maxDistance === distance ? theme.accentLight : theme.surface,
                        borderColor: maxDistance === distance ? theme.accentLight : theme.border,
                      }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setMaxDistance(distance);
                    }}
                  >
                    <Text style={[
                      styles.distanceButtonText, 
                      { 
                        color: maxDistance === distance ? theme.onPrimary : theme.text 
                      }
                    ]}>
                      {distance} mi
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Results Header */}
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsTitle, { color: theme.text }]}>
              {mechanicType === 'shops' ? 'Available Mechanic Shops' : 'Available Freelance Mechanics'}
            </Text>
            <View style={styles.resultsSecondRow}>
              <View style={[styles.resultsBadge, { backgroundColor: theme.surface }]}>
                <IconFallback 
                  name={mechanicType === 'shops' ? "store" : "person"} 
                  size={16} 
                  color={theme.accentLight} 
                />
                <Text style={[styles.resultsCount, { color: theme.accentLight }]}>
                  {filteredMechanics.length} {mechanicType === 'shops' 
                    ? (filteredMechanics.length === 1 ? 'shop' : 'shops') 
                    : (filteredMechanics.length === 1 ? 'mechanic' : 'mechanics')
                  } found
                </Text>
              </View>
            </View>
            <Text style={[styles.resultsUpdateText, { color: theme.accentLight }]}>
              UPDATED: {categories.length - 1} service categories available
            </Text>
          </View>

          {/* Mechanics List */}
          {filteredMechanics.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface }]}>
                <IconFallback name="search-off" size={48} color={theme.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No mechanics found
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {searchQuery ? 
                  `No mechanics match "${searchQuery}"` : 
                  'Try adjusting your search or filters to find mechanics'
                }
              </Text>
              <View style={styles.emptyStateActions}>
                <MaterialButton
                  title="Clear All Filters"
                  onPress={clearAllFilters}
                  variant="outlined"
                  style={styles.emptyStateButton}
                />
                {!useLocationSearch && (
                  <MaterialButton
                    title="Find Nearby Mechanics"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      getUserLocation().then(() => {
                        setUseLocationSearch(true);
                      });
                    }}
                    style={styles.emptyStateButton}
                  />
                )}
                {searchQuery && (
                  <MaterialButton
                    title="Clear Search"
                    onPress={() => setSearchQuery('')}
                    variant="outlined"
                    style={styles.emptyStateButton}
                  />
                )}
              </View>
            </View>
          ) : (
            (filteredMechanics || []).map((mechanic, index) => {
              const isLastCard = index === filteredMechanics.length - 1;
              return (
              <TouchableOpacity
                key={mechanic.id}
                style={[
                  styles.newMechanicCard,
                  isLastCard && styles.lastMechanicCard, // Add extra margin to last card
                  { 
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                    transform: [{
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20 * (index + 1), 0]
                      })
                    }]
                  }
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigation.navigate('MechanicProfile', { 
                    mechanic: mechanic,
                    mechanicId: mechanic.id 
                  });
                }}
                activeOpacity={0.7}
              >
                {/* Top Row - Name, Rating, Distance */}
                <View style={styles.cardTopRow}>
                  <View style={styles.mechanicNameSection}>
                    <Text style={[styles.newMechanicName, { color: theme.text }]}>
                      {mechanic.name}
                    </Text>
                    <View style={styles.ratingSection}>
                      {renderStars(mechanic.rating)}
                      <Text style={[styles.newRatingText, { color: theme.accentLight }]}>
                        {mechanic.rating}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.topRightSection}>
                    {useLocationSearch && typeof mechanic.distance === 'number' && (
                      <View style={[styles.newDistanceBadge, { backgroundColor: theme.surface }]}>
                        <IconFallback name="location-on" size={14} color={theme.textSecondary} />
                        <Text style={[styles.newDistanceText, { color: theme.textSecondary }]}>
                          {(mechanic.distance || 0).toFixed(1)} mi
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity 
                      style={[styles.newFavoriteButton, { 
                        backgroundColor: isFavorited(mechanic.id) ? theme.error + '20' : theme.surface 
                      }]}
                      onPress={() => handleToggleFavorite(mechanic)}
                    >
                      <IconFallback 
                        name={isFavorited(mechanic.id) ? "favorite" : "favorite-border"} 
                        size={18} 
                        color={isFavorited(mechanic.id) ? theme.error : theme.textSecondary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Mechanic Type Indicator */}
                {mechanic.mechanicType && (
                  <View style={styles.typeIndicatorRow}>
                    <View style={[
                      styles.typeBadge, 
                      { 
                        backgroundColor: mechanic.mechanicType === 'shops' ? theme.accentLight + '20' : theme.accent + '20',
                        borderColor: mechanic.mechanicType === 'shops' ? theme.accentLight : theme.accent
                      }
                    ]}>
                      <IconFallback 
                        name={mechanic.mechanicType === 'shops' ? "store" : "person"} 
                        size={14} 
                        color={mechanic.mechanicType === 'shops' ? theme.accentLight : theme.accent} 
                      />
                      <Text style={[
                        styles.typeText, 
                        { color: mechanic.mechanicType === 'shops' ? theme.accentLight : theme.accent }
                      ]}>
                        {mechanic.mechanicType === 'shops' ? 'Mechanic Shop' : 'Freelance Mechanic'}
                      </Text>
                    </View>
                    {mechanic.isMobile && (
                      <View style={[styles.mobileBadge, { backgroundColor: theme.success + '20' }]}>
                        <IconFallback name="directions-car" size={12} color={theme.success} />
                        <Text style={[styles.mobileText, { color: theme.success }]}>Mobile</Text>
                      </View>
                    )}
                    {/* Direct Booking Available Badge */}
                    <View style={[styles.bookingBadge, { backgroundColor: theme.primary + '20' }]}>
                      <IconFallback name="schedule" size={12} color={theme.primary} />
                      <Text style={[styles.bookingText, { color: theme.primary }]}>Direct Booking</Text>
                    </View>
                  </View>
                )}

                {/* Availability & Experience Row */}
                <View style={styles.cardInfoRow}>
                  <View style={styles.infoChips}>
                    {mechanic.isAvailable ? (
                      <View style={[styles.newAvailabilityBadge, { backgroundColor: theme.success + '20' }]}>
                        <View style={[styles.availabilityDot, { backgroundColor: theme.success }]} />
                        <Text style={[styles.newAvailabilityText, { color: theme.success }]}>
                          Available
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.newAvailabilityBadge, { backgroundColor: theme.warning + '20' }]}>
                        <View style={[styles.availabilityDot, { backgroundColor: theme.warning }]} />
                        <Text style={[styles.newAvailabilityText, { color: theme.warning }]}>
                          Busy
                        </Text>
                      </View>
                    )}
                    
                    <View style={[styles.experienceBadge, { backgroundColor: theme.surface }]}>
                      <IconFallback name="work" size={14} color={theme.textSecondary} />
                      <Text style={[styles.experienceText, { color: theme.textSecondary }]}>
                        {mechanic.yearsExperience} years
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.priceSection}>
                    <Text style={[styles.newPriceValue, { color: theme.accentLight }]}>
                      ${mechanic.priceRange?.min || 0}-${mechanic.priceRange?.max || 100}/hr
                    </Text>
                    <Text style={[styles.newPriceLabel, { color: theme.textSecondary }]}>
                      starting rate
                    </Text>
                  </View>
                </View>

                {/* Specialties Row */}
                <View style={styles.specialtiesRow}>
                  {(mechanic.specialties || []).slice(0, 4).map((specialty: any, idx: any) => (
                    <View key={idx} style={[styles.newSpecialtyTag, { backgroundColor: theme.surface }]}>
                      <Text style={[styles.newSpecialtyText, { color: theme.textSecondary }]}>
                        {specialty}
                      </Text>
                    </View>
                  ))}
                  {(mechanic.specialties || []).length > 4 && (
                    <View style={[styles.newSpecialtyTag, { backgroundColor: theme.surface }]}>
                      <Text style={[styles.newSpecialtyText, { color: theme.textSecondary }]}>
                        +{(mechanic.specialties || []).length - 4}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Languages Row */}
                {mechanic.languages && (mechanic.languages || []).length > 0 && (
                  <View style={styles.languagesRow}>
                    <Text style={[styles.newLanguagesText, { color: theme.textSecondary }]}>
                      {(mechanic.languages || []).join(' • ')}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.newActionButtons}>
                  <TouchableOpacity
                    style={[styles.newSecondaryButton, { 
                      backgroundColor: theme.surface,
                      borderColor: theme.border
                    }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      handleBookService(mechanic);
                    }}
                  >
                    <IconFallback name="schedule" size={16} color={theme.textSecondary} />
                    <Text style={[styles.newSecondaryButtonText, { color: theme.textSecondary }]}>
                      Book Service
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.newPrimaryButton, { backgroundColor: theme.accentLight }]}
                    onPress={async (e) => {
                      e.stopPropagation();
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      // Navigate to messaging screen with mechanic context
                      navigation.navigate('Messaging', { 
                        mechanicId: mechanic.id || getFallbackUserIdWithTypeDetection(user?.id, user?.user_type),
                        mechanicName: mechanic.name || 'Mechanic'
                      });
                    }}
                  >
                    <IconFallback name="message" size={16} color="white" />
                    <Text style={[styles.newPrimaryButtonText, { color: 'white' }]}>
                      Message
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              );
            })
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Filters</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowFilterModal(false);
                }}
                style={styles.closeButton}
              >
                <IconFallback name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView 
              style={styles.modalContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {/* Category Filter */}
              <FilterDropdown
                title="Service Category"
                value={selectedCategory}
                options={categories}
                onSelect={setSelectedCategory}
                isOpen={openDropdown === 'category'}
                onToggle={() => handleDropdownToggle('category')}
                theme={theme}
                searchable={true}
              />

              {/* Language Filter */}
              <FilterDropdown
                title="Language"
                value={selectedLanguage === 'all' ? 'All Languages' : selectedLanguage}
                options={languageOptions}
                onSelect={setSelectedLanguage}
                isOpen={openDropdown === 'language'}
                onToggle={() => handleDropdownToggle('language')}
                theme={theme}
                searchable={true}
              />

              {/* Price Range Filter */}
              <FilterDropdown
                title="Price Range"
                value={getCurrentPriceLabel()}
                options={priceOptions}
                onSelect={handlePriceSelect}
                isOpen={openDropdown === 'price'}
                onToggle={() => handleDropdownToggle('price')}
                theme={theme}
                icon="attach-money"
              />

              {/* Rating Filter */}
              <FilterDropdown
                title="Minimum Rating"
                value={getCurrentRatingLabel()}
                options={ratingOptions}
                onSelect={handleRatingSelect}
                isOpen={openDropdown === 'rating'}
                onToggle={() => handleDropdownToggle('rating')}
                theme={theme}
                icon="star"
              />

            </ScrollView>

            {/* Modal Footer */}
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <MaterialButton
                title="Clear All"
                onPress={clearAllFilters}
                variant="outlined"
                style={styles.modalButton}
              />
              <MaterialButton
                title="Apply Filters"
                onPress={applyFilters}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 6, // Further reduced padding for wider cards
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  quickFiltersScroll: {
    marginTop: 0,
  },
  quickFiltersContainer: {
    paddingRight: 20,
  },
  quickFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mechanicCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  mechanicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mechanicInfo: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
  },
  mechanicAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  mechanicSpecialties: {
    fontSize: 14,
    marginBottom: 4,
  },
  mechanicLanguages: {
    fontSize: 12,
    marginBottom: 4,
  },
  mechanicStatement: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  mechanicFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mechanicRate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emptyStateButton: {
    minWidth: 140,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  filterActions: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  clearFiltersButton: {
    minWidth: 160,
  },
  bottomSpacing: {
    height: 50, // Increased bottom spacing
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  distanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  distanceSlider: {
    flexDirection: 'row',
    gap: 8,
  },
  distanceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  distanceButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enableLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  enableLocationButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // New Modern Styles
  animatedContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 6, // Further reduced padding for wider cards
    paddingBottom: 150, // Increased to ensure bottom content is fully visible
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterScroll: {
    marginTop: 8,
  },
  modernChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  distanceSection: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  distanceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsSecondRow: {
    marginTop: 4,
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsUpdateText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
    textAlign: 'center',
  },
  modernMechanicCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // New Card Design Styles
  newMechanicCard: {
    marginBottom: 12,
    marginHorizontal: 4, // Further reduced horizontal margin for wider cards
    borderRadius: 12,
    padding: 20, // Increased padding for better spacing
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  // Last card gets extra bottom margin
  lastMechanicCard: {
    marginBottom: 80, // Extra margin for the last card
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mechanicNameSection: {
    flex: 1,
  },
  newMechanicName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newRatingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  topRightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  newDistanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  newDistanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  newFavoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoChips: {
    flexDirection: 'row',
    gap: 8,
  },
  newAvailabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  newAvailabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  experienceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  experienceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  newPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  newPriceLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  newSpecialtyTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newSpecialtyText: {
    fontSize: 11,
    fontWeight: '500',
  },
  languagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  newLanguagesText: {
    fontSize: 12,
    flex: 1,
  },
  newActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  newSecondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  newSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  newPrimaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  newPrimaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  mechanicProfile: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mechanicBasicInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  specialtyTag: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 11,
    fontWeight: '500',
  },
  languagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  languagesText: {
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceContainer: {
    flex: 1,
    marginRight: 12,
  },
  priceLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceNote: {
    fontSize: 11,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyActionButton: {
    paddingHorizontal: 24,
  },
  clearButton: {
    padding: 2,
  },
  mechanicTypeContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  mechanicTypeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  mechanicTypeText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  typeIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  mobileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mobileText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  bookingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  bookingText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  bottomSearchSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 12, // Minimal padding for safe area
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end', // Align to bottom for full screen
    alignItems: 'stretch', // Stretch to full width
  },
  modalContainer: {
    width: '100%',
    maxWidth: '100%', // Full width
    height: '100%', // Full height
    borderRadius: 0, // Remove border radius for full screen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    flex: 1, // Ensure proper flex layout
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1, // Allow content to take available space
    paddingHorizontal: 20,
    paddingVertical: 20, // Increased padding
  },
  modalFilterSection: {
    marginVertical: 24, // Increased spacing
  },
  modalFilterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  modalChipIcon: {
    fontSize: 14,
  },
  modalChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20, // Increased padding
    paddingBottom: 30, // Extra bottom padding for safe area
    borderTopWidth: 1,
    gap: 12,
    backgroundColor: 'transparent', // Ensure footer is visible
  },
  modalButton: {
    flex: 1,
  },
  
  // New Filter Styles
  rangeContainer: {
    marginBottom: 8,
  },
  rangeLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  rangeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  rangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  rangeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  ratingButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  experienceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  experienceButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  experienceButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  availabilityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  availabilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  availabilityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Dropdown Styles
  dropdownContainer: {
    marginBottom: 24, // Increased spacing
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dropdownButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownOptionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dropdownOptionText: {
    fontSize: 16,
    flex: 1,
  },
});
