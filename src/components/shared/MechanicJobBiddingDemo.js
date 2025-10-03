import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticService } from '../../services/HapticService';

const { width: screenWidth } = Dimensions.get('window');

export default function MechanicJobBiddingDemo({ onComplete, onSkip }) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [bidSubmitted, setBidSubmitted] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const demoSteps = [
    {
      id: 1,
      title: 'Browse Available Jobs',
      subtitle: 'Find jobs that match your skills',
      content: 'job_browsing'
    },
    {
      id: 2,
      title: 'Select a Job',
      subtitle: 'Choose a job to bid on',
      content: 'job_selection'
    },
    {
      id: 3,
      title: 'Place Your Bid',
      subtitle: 'Set your price and message',
      content: 'bid_placement'
    },
    {
      id: 4,
      title: 'Bid Submitted',
      subtitle: 'Wait for customer response',
      content: 'bid_submitted'
    },
    {
      id: 5,
      title: 'Job Won!',
      subtitle: 'Customer accepted your bid',
      content: 'job_won'
    }
  ];

  const availableJobs = [
    {
      id: 1,
      title: 'Brake Pad Replacement',
      description: 'Need brake pads replaced on 2018 Honda Civic. Squealing noise when braking.',
      location: 'Downtown',
      budget: '$150-200',
      urgency: 'medium',
      customer: 'Sarah M.',
      rating: 4.8,
      distance: '2.3 miles',
      posted: '2 hours ago'
    },
    {
      id: 2,
      title: 'Oil Change & Filter',
      description: 'Regular oil change needed for 2020 Toyota Camry. About 5,000 miles since last change.',
      location: 'Midtown',
      budget: '$30-50',
      urgency: 'low',
      customer: 'John D.',
      rating: 4.9,
      distance: '1.8 miles',
      posted: '1 hour ago'
    },
    {
      id: 3,
      title: 'Engine Diagnostic',
      description: 'Check engine light is on. Car running rough and poor fuel economy.',
      location: 'Uptown',
      budget: '$80-120',
      urgency: 'high',
      customer: 'Mike R.',
      rating: 4.7,
      distance: '3.1 miles',
      posted: '30 min ago'
    }
  ];

  const bidAmounts = ['$45', '$50', '$55', '$60', '$65', '$70'];

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

    // Auto-advance typing animation for bid message
    if (currentStep === 2) {
      setShowTyping(true);
      const typingTimer = setTimeout(() => {
        setBidMessage('I can complete this oil change today. I have 15+ years experience and use only premium oil and filters. Available this afternoon!');
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

  const handleJobSelect = async (job) => {
    await hapticService.selection();
    setSelectedJob(job);
    setTimeout(() => handleNext(), 1000);
  };

  const handleBidAmountSelect = async (amount) => {
    await hapticService.selection();
    setBidAmount(amount);
  };

  const handleSubmitBid = async () => {
    await hapticService.buttonPress();
    setBidSubmitted(true);
    setTimeout(() => handleNext(), 2000);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return theme.textSecondary;
    }
  };

  const renderJobBrowsing = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Browse Available Jobs</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Find jobs that match your skills</Text>
      
      <View style={styles.jobsList}>
        {availableJobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            style={[styles.jobCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => handleJobSelect(job)}
            activeOpacity={0.7}
          >
            <View style={styles.jobHeader}>
              <Text style={[styles.jobTitle, { color: theme.text }]}>{job.title}</Text>
              <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(job.urgency) + '20' }]}>
                <Text style={[styles.urgencyText, { color: getUrgencyColor(job.urgency) }]}>
                  {job.urgency.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>{job.description}</Text>
            
            <View style={styles.jobDetails}>
              <View style={styles.jobDetail}>
                <IconFallback name="location-on" size={14} color={theme.textSecondary} />
                <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>{job.location}</Text>
              </View>
              <View style={styles.jobDetail}>
                <IconFallback name="attach-money" size={14} color={theme.accent} />
                <Text style={[styles.jobDetailText, { color: theme.accent }]}>{job.budget}</Text>
              </View>
              <View style={styles.jobDetail}>
                <IconFallback name="schedule" size={14} color={theme.textSecondary} />
                <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>{job.posted}</Text>
              </View>
            </View>
            
            <View style={styles.jobFooter}>
              <View style={styles.customerInfo}>
                <Text style={[styles.customerName, { color: theme.text }]}>{job.customer}</Text>
                <View style={styles.ratingContainer}>
                  <IconFallback name="star" size={12} color={theme.warning} />
                  <Text style={[styles.rating, { color: theme.text }]}>{job.rating}</Text>
                </View>
              </View>
              <Text style={[styles.distance, { color: theme.textSecondary }]}>{job.distance}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderJobSelection = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Job Selected!</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Ready to place your bid</Text>
      
      <View style={[styles.selectedJobCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.jobHeader}>
          <Text style={[styles.jobTitle, { color: theme.text }]}>{selectedJob?.title}</Text>
          <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(selectedJob?.urgency) + '20' }]}>
            <Text style={[styles.urgencyText, { color: getUrgencyColor(selectedJob?.urgency) }]}>
              {selectedJob?.urgency.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>{selectedJob?.description}</Text>
        
        <View style={styles.jobDetails}>
          <View style={styles.jobDetail}>
            <IconFallback name="location-on" size={14} color={theme.textSecondary} />
            <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>{selectedJob?.location}</Text>
          </View>
          <View style={styles.jobDetail}>
            <IconFallback name="attach-money" size={14} color={theme.accent} />
            <Text style={[styles.jobDetailText, { color: theme.accent }]}>{selectedJob?.budget}</Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: theme.primary }]}
        onPress={handleNext}
      >
        <Text style={[styles.nextButtonText, { color: theme.onPrimary }]}>Place Bid</Text>
        <IconFallback name="arrow-forward" size={20} color={theme.onPrimary} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderBidPlacement = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={[styles.stepTitle, { color: theme.text }]}>Place Your Bid</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>Set your price and message</Text>
      
      <View style={styles.bidForm}>
        <Text style={[styles.formLabel, { color: theme.text }]}>Bid Amount</Text>
        <View style={styles.bidAmountsGrid}>
          {bidAmounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.bidAmountButton,
                { 
                  backgroundColor: bidAmount === amount ? theme.primary : theme.surface,
                  borderColor: bidAmount === amount ? theme.primary : theme.border
                }
              ]}
              onPress={() => handleBidAmountSelect(amount)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.bidAmountText, 
                { color: bidAmount === amount ? theme.onPrimary : theme.text }
              ]}>
                {amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={[styles.formLabel, { color: theme.text }]}>Message to Customer</Text>
        <View style={[styles.messageBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.messageText, { color: theme.text }]}>
            {showTyping ? 'Typing...' : bidMessage}
          </Text>
          {showTyping && (
            <View style={[styles.typingIndicator, { backgroundColor: theme.primary }]} />
          )}
        </View>
        
        <View style={styles.tipBox}>
          <IconFallback name="lightbulb" size={16} color={theme.warning} />
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            A good message increases your chances of winning the job
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.submitButton, 
          { 
            backgroundColor: bidAmount && !showTyping ? theme.primary : theme.textSecondary,
            opacity: bidAmount && !showTyping ? 1 : 0.5
          }
        ]}
        onPress={handleSubmitBid}
        disabled={!bidAmount || showTyping}
      >
        <Text style={[styles.submitButtonText, { color: 'white' }]}>Submit Bid</Text>
        <IconFallback name="send" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderBidSubmitted = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.successIcon, { backgroundColor: theme.primary + '20' }]}>
        <IconFallback name="check-circle" size={48} color={theme.primary} />
      </View>
      
      <Text style={[styles.stepTitle, { color: theme.text }]}>Bid Submitted!</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
        Your bid has been sent to the customer
      </Text>
      
      <View style={[styles.bidSummary, { backgroundColor: theme.surface }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Job:</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{selectedJob?.title}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Your Bid:</Text>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>{bidAmount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Status:</Text>
          <Text style={[styles.summaryValue, { color: theme.warning }]}>Pending Review</Text>
        </View>
      </View>
      
      <View style={styles.waitingInfo}>
        <IconFallback name="schedule" size={20} color={theme.textSecondary} />
        <Text style={[styles.waitingText, { color: theme.textSecondary }]}>
          Customer will review your bid and respond within 24 hours
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: theme.primary }]}
        onPress={handleNext}
      >
        <Text style={[styles.nextButtonText, { color: theme.onPrimary }]}>Continue</Text>
        <IconFallback name="arrow-forward" size={20} color={theme.onPrimary} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderJobWon = () => (
    <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.successIcon, { backgroundColor: theme.success + '20' }]}>
        <IconFallback name="celebration" size={48} color={theme.success} />
      </View>
      
      <Text style={[styles.stepTitle, { color: theme.text }]}>Congratulations!</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
        Customer accepted your bid
      </Text>
      
      <View style={[styles.winSummary, { backgroundColor: theme.surface }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Job:</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{selectedJob?.title}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Your Bid:</Text>
          <Text style={[styles.summaryValue, { color: theme.accent }]}>{bidAmount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Customer:</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>{selectedJob?.customer}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Scheduled:</Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>Today at 2:00 PM</Text>
        </View>
      </View>
      
      <View style={styles.earningsInfo}>
        <IconFallback name="trending-up" size={20} color={theme.success} />
        <Text style={[styles.earningsText, { color: theme.success }]}>
          You'll earn {bidAmount} when the job is completed
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.completeButton, { backgroundColor: theme.success }]}
        onPress={onComplete}
      >
        <Text style={[styles.completeButtonText, { color: 'white' }]}>Start Earning!</Text>
        <IconFallback name="rocket-launch" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderJobBrowsing();
      case 1: return renderJobSelection();
      case 2: return renderBidPlacement();
      case 3: return renderBidSubmitted();
      case 4: return renderJobWon();
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

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
    marginBottom: 20,
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
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 20,
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
  jobsList: {
    width: '100%',
  },
  jobCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedJobCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jobDetailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 2,
  },
  distance: {
    fontSize: 12,
  },
  bidForm: {
    width: '100%',
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  bidAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bidAmountButton: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 8,
  },
  bidAmountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  messageBox: {
    minHeight: 100,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
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
  },
  tipText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  bidSummary: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  winSummary: {
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
  waitingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  waitingText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  earningsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  earningsText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
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
