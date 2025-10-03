import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticService } from '../../services/HapticService';

const { width: screenWidth } = Dimensions.get('window');

export default function CustomerServiceRequestDemo({ onComplete, onSkip }) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const demoSteps = [
    {
      id: 1,
      title: 'Choose Service Type',
      subtitle: 'What does your vehicle need?',
      content: 'service_selection'
    },
    {
      id: 2,
      title: 'Describe the Problem',
      subtitle: 'Tell us what\'s wrong',
      content: 'problem_description'
    },
    {
      id: 3,
      title: 'Choose Location',
      subtitle: 'Where do you need service?',
      content: 'location_selection'
    },
    {
      id: 4,
      title: 'Get Quotes',
      subtitle: 'Mechanics will bid on your job',
      content: 'quotes_received'
    },
    {
      id: 5,
      title: 'Choose & Book',
      subtitle: 'Select the best option',
      content: 'booking_complete'
    }
  ];

  const services = [
    { id: 'oil_change', name: 'Oil Change', icon: 'oil-barrel', price: '$25-45' },
    { id: 'brake_repair', name: 'Brake Repair', icon: 'build', price: '$150-300' },
    { id: 'engine_diagnostic', name: 'Engine Diagnostic', icon: 'search', price: '$50-100' },
    { id: 'tire_repair', name: 'Tire Repair', icon: 'tire-repair', price: '$20-50' }
  ];

  const locations = [
    { id: 'home', name: 'At Home', icon: 'home', description: 'Mobile service comes to you' },
    { id: 'shop', name: 'At Shop', icon: 'store', description: 'Drop off at mechanic\'s shop' },
    { id: 'roadside', name: 'Roadside', icon: 'location-on', description: 'Emergency roadside service' }
  ];

  const sampleQuotes = [
    { mechanic: 'Mike\'s Auto', rating: 4.9, price: 85, time: '2 hours', message: 'I can fix this today!' },
    { mechanic: 'Quick Fix Garage', rating: 4.7, price: 95, time: '1.5 hours', message: 'Expert brake specialist' },
    { mechanic: 'Auto Pro', rating: 4.8, price: 90, time: '2.5 hours', message: 'Quality work guaranteed' }
  ];

  useEffect(() => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.9);

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();

    // Auto-advance typing animation for description step
    if (currentStep === 1) {
      setShowTyping(true);
      const typingTimer = setTimeout(() => {
        setDescription('My car is making a squealing noise when I brake, especially in the morning. The brake pedal also feels spongy.');
        setShowTyping(false);
      }, 2000);
      return () => clearTimeout(typingTimer);
    }
  }, [currentStep]);

  const handleNext = async () => {
    await hapticService.buttonPress();
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await hapticService.success();
      onComplete?.();
    }
  };

  const handleServiceSelect = async (service) => {
    await hapticService.selection();
    setSelectedService(service);
    setTimeout(() => handleNext(), 1000);
  };

  const handleLocationSelect = async (location) => {
    await hapticService.selection();
    setSelectedLocation(location);
    setTimeout(() => handleNext(), 1000);
  };

  const renderServiceSelection = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Choose Service Type</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>What does your vehicle need?</Text>
      
      <View style={styles.servicesGrid}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceCard,
              { 
                backgroundColor: theme.cardBackground,
                borderColor: selectedService?.id === service.id ? theme.primary : theme.border
              }
            ]}
            onPress={() => handleServiceSelect(service)}
            activeOpacity={0.7}
          >
            <IconFallback name={service.icon} size={32} color={theme.primary} />
            <Text style={[styles.serviceName, { color: theme.text }]}>{service.name}</Text>
            <Text style={[styles.servicePrice, { color: theme.accent }]}>{service.price}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderProblemDescription = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Describe the Problem</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Tell us what's wrong</Text>
      
      <View style={[styles.descriptionBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.descriptionText, { color: theme.text }]}>
          {showTyping ? 'Typing...' : description}
        </Text>
        {showTyping && (
          <View style={[styles.typingIndicator, { backgroundColor: theme.primary }]} />
        )}
      </View>
      
      <View style={styles.tipBox}>
        <IconFallback name="lightbulb" size={16} color={theme.warning} />
        <Text style={[styles.tipText, { color: theme.textSecondary }]}>
          Be specific about symptoms, sounds, and when they occur
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: theme.primary }]}
        onPress={handleNext}
        disabled={showTyping}
      >
        <Text style={[styles.nextButtonText, { color: theme.onPrimary }]}>Continue</Text>
        <IconFallback name="arrow-forward" size={20} color={theme.onPrimary} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderLocationSelection = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Choose Location</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Where do you need service?</Text>
      
      <View style={styles.locationsList}>
        {locations.map((location) => (
          <TouchableOpacity
            key={location.id}
            style={[
              styles.locationCard,
              { 
                backgroundColor: theme.cardBackground,
                borderColor: selectedLocation?.id === location.id ? theme.primary : theme.border
              }
            ]}
            onPress={() => handleLocationSelect(location)}
            activeOpacity={0.7}
          >
            <IconFallback name={location.icon} size={24} color={theme.primary} />
            <View style={styles.locationInfo}>
              <Text style={[styles.locationName, { color: theme.text }]}>{location.name}</Text>
              <Text style={[styles.locationDescription, { color: theme.textSecondary }]}>
                {location.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderQuotesReceived = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Quotes Received!</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>3 mechanics have bid on your job</Text>
      
      <View style={styles.quotesList}>
        {sampleQuotes.map((quote, index) => (
          <View key={index} style={[styles.quoteCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.quoteHeader}>
              <Text style={[styles.mechanicName, { color: theme.text }]}>{quote.mechanic}</Text>
              <View style={styles.ratingContainer}>
                <IconFallback name="star" size={16} color={theme.warning} />
                <Text style={[styles.rating, { color: theme.text }]}>{quote.rating}</Text>
              </View>
            </View>
            <Text style={[styles.quoteMessage, { color: theme.textSecondary }]}>{quote.message}</Text>
            <View style={styles.quoteDetails}>
              <View style={styles.quoteDetail}>
                <IconFallback name="attach-money" size={16} color={theme.accent} />
                <Text style={[styles.quotePrice, { color: theme.accent }]}>${quote.price}</Text>
              </View>
              <View style={styles.quoteDetail}>
                <IconFallback name="schedule" size={16} color={theme.textSecondary} />
                <Text style={[styles.quoteTime, { color: theme.textSecondary }]}>{quote.time}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: theme.primary }]}
        onPress={handleNext}
      >
        <Text style={[styles.nextButtonText, { color: theme.onPrimary }]}>Choose Best Quote</Text>
        <IconFallback name="arrow-forward" size={20} color={theme.onPrimary} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderBookingComplete = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.successIcon, { backgroundColor: theme.success + '20' }]}>
        <IconFallback name="check-circle" size={48} color={theme.success} />
      </View>
      
      <Text style={[styles.stepTitle, { color: theme.text }]}>Booking Complete!</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
        You've successfully booked with Mike's Auto
      </Text>
      
      <View style={[styles.bookingSummary, { backgroundColor: theme.surface }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Service:</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{selectedService?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Location:</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{selectedLocation?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Price:</Text>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>$85</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Scheduled:</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>Today at 2:00 PM</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.completeButton, { backgroundColor: theme.success }]}
        onPress={onComplete}
      >
        <Text style={[styles.completeButtonText, { color: 'white' }]}>Got It!</Text>
        <IconFallback name="check" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderServiceSelection();
      case 1: return renderProblemDescription();
      case 2: return renderLocationSelection();
      case 3: return renderQuotesReceived();
      case 4: return renderBookingComplete();
      default: return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.textSecondary + '20' }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: theme.primary,
                width: `${((currentStep + 1) / demoSteps.length) * 100}%`
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
          Step {currentStep + 1} of {demoSteps.length}
        </Text>
      </View>

      {/* Demo Content */}
      {renderCurrentStep()}

      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip Demo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  serviceCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  servicePrice: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  descriptionBox: {
    width: '100%',
    minHeight: 120,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  typingIndicator: {
    width: 4,
    height: 20,
    marginTop: 4,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  tipText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  locationsList: {
    width: '100%',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: 14,
  },
  quotesList: {
    width: '100%',
    marginBottom: 20,
  },
  quoteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
  },
  quoteMessage: {
    fontSize: 14,
    marginBottom: 12,
  },
  quoteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quoteDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quotePrice: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  quoteTime: {
    fontSize: 14,
    marginLeft: 4,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  bookingSummary: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
