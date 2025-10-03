import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { StepComponentProps, ServiceCategory } from '../../types/JobTypes';
import { createJobStyles } from '../../styles/CreateJobScreenStyles';
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  categoryCard: {
    width: '47%',
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
    marginBottom: 16,
    minHeight: 110,
  },
  categoryCardSelected: {
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  categoryIcon: {
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  categoryPrice: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.8,
    fontWeight: '500',
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
  categoryCardRequired: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
});

interface ServiceTypeStepProps extends StepComponentProps {
  onCategorySelect: (category: string) => void;
  onSubcategorySelect: (subcategory: any) => void;
  onShowSubcategoryModal: () => void;
}

const ServiceTypeStep: React.FC<ServiceTypeStepProps> = ({
  formData,
  updateFormData,
  theme,
  onCategorySelect,
  onShowSubcategoryModal,
}) => {
  const baseStyles = createJobStyles(theme);
  const styles = { ...baseStyles, ...additionalStyles };
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  // Animation values for enhanced interactions
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

  // Check if required fields are selected
  const isCategoryRequired = !formData.category;

  // Service categories
  const serviceCategories: ServiceCategory[] = useMemo(() => [
    {
      id: 'maintenance',
      name: 'Maintenance',
      icon: 'build',
      subcategories: [
        { id: 'oil-change', name: 'Oil Change', price: 50, estimatedTime: '30 min', description: 'Engine oil and filter replacement' },
        { id: 'tire-rotation', name: 'Tire Rotation', price: 25, estimatedTime: '15 min', description: 'Rotate tires for even wear' },
        { id: 'brake-check', name: 'Brake Check', price: 75, estimatedTime: '45 min', description: 'Inspect and test brake system' },
        { id: 'battery-check', name: 'Battery Check', price: 30, estimatedTime: '20 min', description: 'Test battery and charging system' },
      ],
      basePrice: 50,
      priceRange: [25, 100],
    },
    {
      id: 'repair',
      name: 'Repair',
      icon: 'construct',
      subcategories: [
        { id: 'engine-repair', name: 'Engine Repair', price: 200, estimatedTime: '2-4 hours', description: 'Engine diagnostics and repair' },
        { id: 'transmission', name: 'Transmission', price: 300, estimatedTime: '3-6 hours', description: 'Transmission service and repair' },
        { id: 'electrical', name: 'Electrical', price: 150, estimatedTime: '1-3 hours', description: 'Electrical system repair' },
        { id: 'ac-repair', name: 'A/C Repair', price: 120, estimatedTime: '1-2 hours', description: 'Air conditioning system repair' },
      ],
      basePrice: 200,
      priceRange: [100, 500],
    },
    {
      id: 'diagnostic',
      name: 'Diagnostic',
      icon: 'search',
      subcategories: [
        { id: 'check-engine', name: 'Check Engine Light', price: 80, estimatedTime: '30 min', description: 'Diagnose check engine light' },
        { id: 'full-diagnostic', name: 'Full Diagnostic', price: 120, estimatedTime: '1 hour', description: 'Comprehensive vehicle inspection' },
        { id: 'emissions', name: 'Emissions Test', price: 60, estimatedTime: '20 min', description: 'Emissions system testing' },
        { id: 'computer-scan', name: 'Computer Scan', price: 90, estimatedTime: '45 min', description: 'Advanced computer diagnostics' },
      ],
      basePrice: 80,
      priceRange: [60, 150],
    },
    {
      id: 'emergency',
      name: 'Emergency',
      icon: 'warning',
      subcategories: [
        { id: 'jump-start', name: 'Jump Start', price: 40, estimatedTime: '15 min', description: 'Jump start dead battery' },
        { id: 'tire-change', name: 'Tire Change', price: 60, estimatedTime: '30 min', description: 'Change flat tire' },
        { id: 'lockout', name: 'Lockout Service', price: 50, estimatedTime: '20 min', description: 'Unlock vehicle' },
        { id: 'towing', name: 'Towing', price: 100, estimatedTime: '30-60 min', description: 'Tow vehicle to shop' },
      ],
      basePrice: 50,
      priceRange: [40, 150],
    },
  ], []);

  // Handle category selection
  const handleCategorySelect = useCallback(async (categoryId: string) => {
    setIsLoadingPrices(true);
    
    try {
      // Simulate price calculation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateFormData('category', categoryId);
      onCategorySelect(categoryId);
      
      // Reset subcategory when category changes
      updateFormData('subcategory', null);
      updateFormData('estimatedCost', null);
    } catch (error) {
      console.error('Error selecting category:', error);
    } finally {
      setIsLoadingPrices(false);
    }
  }, [updateFormData, onCategorySelect]);

  // Get selected category
  const selectedCategory = useMemo(() => {
    return serviceCategories.find(cat => cat.id === formData.category);
  }, [serviceCategories, formData.category]);

  // Get selected subcategory
  const selectedSubcategory = useMemo(() => {
    if (!selectedCategory) return null;
    const subcategory = selectedCategory.subcategories.find(sub => sub.id === formData.subcategory);
    console.log('ServiceTypeStep - selectedSubcategory:', {
      formDataSubcategory: formData.subcategory,
      selectedSubcategory: subcategory,
      price: subcategory?.price
    });
    return subcategory;
  }, [selectedCategory, formData.subcategory]);



  // Format price range
  const formatPriceRange = useCallback((priceRange: [number, number]) => {
    return `$${priceRange[0]} - $${priceRange[1]}`;
  }, []);

  // Render hero section
  const renderHeroSection = () => {
    const selectedCategory = serviceCategories.find(cat => cat.id === formData.category);
    
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
              name={selectedCategory ? 'construct' : 'build'} 
              size={20} 
              color={theme.onPrimary} 
            />
          </Animated.View>
          
          {/* Hero Title */}
          <Text style={[
            styles.heroTitle,
            { color: theme.text }
          ]}>
            {selectedCategory ? selectedCategory.name : 'Choose Your Service'}
          </Text>
          
          {/* Hero Subtitle */}
          <Text style={[
            styles.heroSubtitle,
            { color: theme.textSecondary }
          ]}>
            {selectedSubcategory ? 
              `Price: $${selectedSubcategory.price}` :
              selectedCategory ? 
                `Starting from $${selectedCategory.basePrice}` :
                'Select a service category to continue'
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

  // Render category card
  const renderCategoryCard = (category: ServiceCategory) => {
    const isSelected = formData.category === category.id;
    const isRequired = isCategoryRequired;
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryCard,
          { backgroundColor: theme.surfaceVariant },
          isSelected && styles.categoryCardSelected,
          isSelected && { backgroundColor: theme.primary + '15' },
          isRequired && !isSelected && styles.categoryCardRequired
        ]}
        onPress={() => handleCategorySelect(category.id)}
        activeOpacity={0.8}
      >
        <View style={styles.selectionIndicator}>
          <View style={[
            styles.selectionIndicatorUnselected,
            isSelected && styles.selectionIndicatorSelected
          ]}>
            {isSelected && (
              <Ionicons 
                name="checkmark" 
                size={12} 
                color={theme.onPrimary} 
              />
            )}
          </View>
        </View>
        
        <View style={styles.categoryIcon}>
          <Ionicons 
            name={category.icon as keyof typeof Ionicons.glyphMap} 
            size={28} 
            color={isSelected ? theme.primary : theme.textSecondary} 
          />
        </View>
        
        <Text style={[
          styles.categoryName,
          { color: theme.text }
        ]}>
          {category.name}
        </Text>
        
        <Text style={[
          styles.categoryPrice,
          { color: theme.textSecondary }
        ]}>
          {formatPriceRange(category.priceRange)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.stepContainer}>
        
        {/* Hero Section */}
        {renderHeroSection()}
        
        {/* Service Categories */}
        <View style={styles.sectionContainer}>
          {isCategoryRequired && (
            <Text style={styles.requiredFieldIndicator}>
              * Required
            </Text>
          )}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Service Categories
          </Text>
          
          <View style={styles.categoryGrid}>
            {serviceCategories.map(renderCategoryCard)}
          </View>
        </View>

        {/* Selected Category Details */}
        {selectedCategory && (
          <View style={styles.sectionContainer}>
            <View style={[
              styles.categoryCard,
              styles.categoryCardSelected,
              { 
                backgroundColor: theme.primary + '10',
                borderColor: theme.primary + '40',
                width: '100%',
                marginBottom: 0
              }
            ]}>
              <View style={styles.categoryIcon}>
                <Ionicons 
                  name={selectedCategory.icon as keyof typeof Ionicons.glyphMap} 
                  size={32} 
                  color={theme.primary} 
                />
              </View>
              
              <Text style={[
                styles.categoryName,
                { color: theme.text, fontSize: 18, marginBottom: 8 }
              ]}>
                {selectedCategory.name + ' Services'}
              </Text>
              
              <Text style={[
                styles.categoryPrice,
                { color: theme.textSecondary, fontSize: 13, marginBottom: 16 }
              ]}>
                Choose a specific service or let us recommend the best option
              </Text>
              
              <View style={{
                width: '100%',
                marginTop: 8
              }}>
                <TouchableOpacity
                  style={[
                    {
                      backgroundColor: selectedSubcategory ? '#F0FDF4' : theme.primary,
                      borderWidth: 2,
                      borderColor: selectedSubcategory ? '#10B981' : theme.primary,
                      borderRadius: 16,
                      padding: selectedSubcategory ? 16 : 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: selectedSubcategory ? 'space-between' : 'center',
                      shadowColor: selectedSubcategory ? '#10B981' : theme.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: selectedSubcategory ? 0.2 : 0.3,
                      shadowRadius: 8,
                      elevation: 6
                    }
                  ]}
                  onPress={onShowSubcategoryModal}
                  activeOpacity={0.8}
                >
                  {selectedSubcategory ? (
                    <>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 16,
                          fontWeight: '700',
                          color: '#10B981',
                          marginBottom: 4
                        }}>
                          {selectedSubcategory.name}
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          color: theme.textSecondary,
                          fontWeight: '500'
                        }}>
                          {`$${selectedSubcategory.price} • ${selectedSubcategory.estimatedTime}`}
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: '#10B981',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 6
                      }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: '600'
                        }}>
                          Change
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Ionicons 
                        name="add-circle" 
                        size={24} 
                        color={theme.onPrimary}
                        style={{ marginRight: 12 }}
                      />
                      <Text style={{
                        color: theme.onPrimary,
                        fontSize: 16,
                        fontWeight: '700',
                        textAlign: 'center'
                      }}>
                        Choose Your Service
                      </Text>
                      <Ionicons 
                        name="chevron-forward" 
                        size={20} 
                        color={theme.onPrimary}
                        style={{ marginLeft: 12 }}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Validation Message */}
              {!formData.subcategory && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: '#FEF2F2',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#FECACA'
                }}>
                  <Ionicons name="warning" size={16} color="#EF4444" />
                  <Text style={{
                    color: '#EF4444',
                    fontSize: 12,
                    fontWeight: '500',
                    marginLeft: 8
                  }}>
                    Please select a specific service to continue
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Loading State */}
        {isLoadingPrices && (
          <View style={styles.sectionContainer}>
            <View style={[
              styles.categoryCard,
              { 
                backgroundColor: theme.surfaceVariant,
                borderColor: theme.primary + '30',
                width: '100%',
                marginBottom: 0
              }
            ]}>
              <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: 16 }} />
              <Text style={[
                styles.categoryName,
                { color: theme.text, fontSize: 16, marginBottom: 8 }
              ]}>
                Calculating prices...
              </Text>
              <Text style={[
                styles.categoryPrice,
                { color: theme.textSecondary, fontSize: 13 }
              ]}>
                Finding the best rates for you
              </Text>
            </View>
          </View>
        )}

        {/* Price Information */}
        {selectedSubcategory && !isLoadingPrices && (
          <View style={styles.sectionContainer}>
            <View style={[
              styles.categoryCard,
              { 
                backgroundColor: '#F0FDF4',
                borderColor: '#10B981',
                borderWidth: 2,
                width: '100%',
                marginBottom: 0
              }
            ]}>
              <View style={styles.categoryIcon}>
                <Ionicons 
                  name="cash" 
                  size={32} 
                  color="#10B981" 
                />
              </View>
              
              <Text style={[
                styles.categoryName,
                { color: theme.text, fontSize: 18, marginBottom: 8 }
              ]}>
                Estimated Cost
              </Text>
              
              <Text style={[
                styles.categoryName,
                { 
                  color: '#10B981',
                  fontSize: 28,
                  fontWeight: '800',
                  marginBottom: 16
                }
              ]}>
                {`$${selectedSubcategory.price}`}
              </Text>
              
              {selectedSubcategory && (
                <View style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}>
                  <Text style={[
                    styles.categoryPrice,
                    { 
                      color: theme.text,
                      fontSize: 14,
                      fontWeight: '600',
                      marginBottom: 8,
                      textAlign: 'left'
                    }
                  ]}>
                    {selectedSubcategory.description}
                  </Text>
                  
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                    <Text style={[
                      styles.categoryPrice,
                      { 
                        color: theme.textSecondary,
                        fontSize: 13,
                        marginLeft: 6
                      }
                    ]}>
                      {`Estimated time: ${selectedSubcategory.estimatedTime}`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ServiceTypeStep;