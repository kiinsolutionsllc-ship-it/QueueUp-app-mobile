import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAuth } from '../../contexts/AuthContext';
import ModernHeader from '../../components/shared/ModernHeader';



interface SubscriptionPlanScreenProps {
  navigation: any;
}
export default function SubscriptionPlanScreen({ navigation }: SubscriptionPlanScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { 
    subscriptionPlans, 
    currentPlan, 
    subscribeToPlan
  } = useSubscription();
  const theme = getCurrentTheme();
  const [selectedTier, setSelectedTier] = useState<any>('professional'); // Default to most popular
  const [isLoading, setIsLoading] = useState<any>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Entrance animations
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Use real subscription plans from context, with UI enhancements
  const subscriptionTiers = subscriptionPlans.length > 0 ? subscriptionPlans.map(plan => ({
    ...plan,
    // Add UI-specific properties
    icon: plan.id === 'basic' ? 'work' : plan.id === 'starter' ? 'rocket-launch' : plan.id === 'professional' ? 'star' : 'diamond',
    color: plan.id === 'basic' ? '#6B7280' : plan.id === 'starter' ? '#4CAF50' : plan.id === 'professional' ? '#2196F3' : '#F59E0B',
    popular: plan.id === 'professional', // Professional is most popular
    savings: plan.id === 'basic' ? 0 : plan.id === 'starter' ? 20 : plan.id === 'professional' ? 30 : 0,
    bonus: plan.id === 'basic' ? 'FREE 14-day trial' : plan.id === 'starter' ? 'FREE 14-day trial' : plan.id === 'professional' ? 'FREE 14-day trial' : 'Coming Soon',
    guarantee: plan.id === 'basic' ? '14-day money-back guarantee' : plan.id === 'starter' ? '14-day money-back guarantee' : plan.id === 'professional' ? '14-day money-back guarantee' : 'Coming Soon',
    earnings: plan.id === 'professional' ? 'Average mechanics earn $3,500+/month' : plan.id === 'enterprise' ? 'Top mechanics earn $8,000+/month' : null,
    is_coming_soon: plan.is_coming_soon || false,
    disabled: plan.is_coming_soon || !plan.is_active
  })) : [];

  const handleSelectTier = (tierId) => {
    setSelectedTier(tierId);
    // Add haptic feedback
    if (Platform.OS === 'ios') {
      const { HapticFeedback } = require('expo-haptics');
      HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubscribe = async (tier) => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to subscribe to a plan.');
      return;
    }

    // Check if plan is coming soon
    if (tier.is_coming_soon || tier.disabled) {
      Alert.alert('Coming Soon', `The ${tier.display_name} plan is coming soon! Stay tuned for updates.`);
      return;
    }

    // Check if user already has this plan
    if (currentPlan && currentPlan.id === tier.id) {
      Alert.alert('Already Subscribed', `You're already subscribed to the ${tier.display_name} plan.`);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await subscribeToPlan(tier.id);
      
      if (result.success) {
        Alert.alert(
          'Subscription Successful!', 
          `You've successfully subscribed to the ${tier.display_name} plan. You can now enjoy all the premium features!`,
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        Alert.alert('Subscription Failed', result.error || 'There was an error processing your subscription. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Subscription Failed', error.message || 'There was an error processing your subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTierCard = (tier) => {
    const isComingSoon = tier.is_coming_soon || tier.disabled;
    const isSelected = selectedTier === tier.id;
    
    return (
      <Animated.View
        key={tier.id}
        style={[
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tierCard,
            { 
              backgroundColor: theme.cardBackground,
              borderColor: isSelected ? tier.color : theme.divider,
              borderWidth: isSelected ? 3 : 1,
              shadowColor: isSelected ? tier.color : '#000',
              shadowOpacity: isSelected ? 0.3 : 0.1,
              elevation: isSelected ? 8 : 4,
              opacity: isComingSoon ? 0.7 : 1,
            }
          ]}
          onPress={() => !isComingSoon && handleSelectTier(tier.id)}
          activeOpacity={isComingSoon ? 1 : 0.8}
          disabled={isComingSoon}
        >
        {tier.popular && !isComingSoon && (
          <View style={[styles.popularBadge, { backgroundColor: tier.color }]}>
            <IconFallback name="star" size={12} color="#fff" />
            <Text style={[styles.popularText, { color: '#fff' }]}>MOST POPULAR</Text>
          </View>
        )}

        {isComingSoon && (
          <View style={[styles.comingSoonBadge, { backgroundColor: theme.textSecondary }]}>
            <Text style={[styles.comingSoonText, { color: '#fff' }]}>Coming Soon</Text>
          </View>
        )}

        {tier.savings && (
          <View style={[styles.savingsBadge, { backgroundColor: theme.success }]}>
            <Text style={[styles.savingsText, { color: theme.onSuccess || '#fff' }]}>
              Save {tier.savings}%
            </Text>
          </View>
        )}

        {tier.bonus && (
          <View style={[styles.bonusBadge, { backgroundColor: '#FF6B35' }]}>
            <IconFallback name="gift" size={12} color="#fff" />
            <Text style={[styles.bonusText, { color: '#fff' }]}>{tier.bonus}</Text>
          </View>
        )}
        
        <View style={styles.tierHeader}>
          <View style={[styles.iconContainer, { backgroundColor: tier.color + '20' }]}>
            <IconFallback name={tier.icon} size={32} color={tier.color} />
          </View>
          <Text style={[styles.tierName, { color: theme.text }]}>
            {tier.display_name || tier.name}
          </Text>
          <Text style={[styles.tierDescription, { color: theme.textSecondary }]}>
            {tier.description}
          </Text>
          <View style={styles.priceContainer}>
            {tier.originalPrice && (
              <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
                ${tier.originalPrice}
              </Text>
            )}
            <Text style={[styles.price, { color: tier.color }]}>${tier.price}</Text>
            <Text style={[styles.period, { color: theme.textSecondary }]}>
              /{tier.billing_interval || tier.period}
            </Text>
          </View>

          {tier.earnings && (
            <View style={[styles.earningsBadge, { backgroundColor: tier.color + '15' }]}>
              <IconFallback name="trending-up" size={14} color={tier.color} />
              <Text style={[styles.earningsText, { color: tier.color }]}>{tier.earnings}</Text>
            </View>
          )}

          {tier.guarantee && (
            <View style={[styles.guaranteeBadge, { backgroundColor: theme.success + '15' }]}>
              <IconFallback name="verified" size={12} color={theme.success} />
              <Text style={[styles.guaranteeText, { color: theme.success }]}>{tier.guarantee}</Text>
            </View>
          )}
        </View>

        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, { color: theme.text }]}>What's included:</Text>
          {tier.features.map((feature, featureIndex) => (
            <View key={featureIndex} style={styles.featureItem}>
              <View style={[styles.checkIcon, { backgroundColor: theme.success + '20' }]}>
                <IconFallback name="check" size={12} color={theme.success} />
              </View>
              <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
            </View>
          ))}
        </View>

        {tier.limitations.length > 0 && (
          <View style={styles.limitationsContainer}>
            <Text style={[styles.limitationsTitle, { color: theme.textSecondary }]}>Limitations:</Text>
            {tier.limitations.map((limitation, limitationIndex) => (
              <View key={limitationIndex} style={styles.limitationItem}>
                <View style={[styles.crossIcon, { backgroundColor: theme.error + '20' }]}>
                  <IconFallback name="close" size={12} color={theme.error} />
                </View>
                <Text style={[styles.limitationText, { color: theme.textSecondary }]}>
                  {limitation}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.subscribeButton,
            { 
              backgroundColor: isComingSoon ? theme.textSecondary : (isSelected ? tier.color : theme.divider),
              opacity: isLoading ? 0.7 : (isComingSoon ? 0.7 : 1),
            }
          ]}
          onPress={() => !isComingSoon && handleSubscribe(tier)}
          disabled={isLoading || isComingSoon}
        >
          {isLoading && isSelected ? (
            <View style={styles.loadingContainer}>
              <Animated.View style={[styles.loadingSpinner, { borderTopColor: theme.onPrimary }]} />
              <Text style={[styles.subscribeButtonText, { color: theme.onPrimary }]}>
                Processing...
              </Text>
            </View>
          ) : (
            <Text style={[
              styles.subscribeButtonText,
              { 
                color: isComingSoon ? 'white' : (isSelected ? theme.onPrimary : theme.textSecondary)
              }
            ]}>
              {isComingSoon 
                ? 'Coming Soon' 
                : currentPlan && currentPlan.id === tier.id 
                  ? 'Current Plan' 
                  : isSelected 
                    ? 'Subscribe Now' 
                    : 'Select Plan'
              }
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Choose Your Plan"
        subtitle="Unlock your potential with the right subscription"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showNotifications={true}
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile={true}
        profileAvatar={'👨‍🔧'}
        user={null}
        onProfilePress={() => navigation.navigate('MechanicProfile')}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroTitle, { color: theme.text }]}>
              Start Earning More Today! 💰
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              Join 10,000+ mechanics earning $3,500+ per month. Get your first job within 24 hours or your money back!
            </Text>
            
            <View style={[styles.statsContainer, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>10,000+</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Mechanics</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.success }]}>$3,500+</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avg Monthly Earnings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.warning }]}>24hrs</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>First Job Guarantee</Text>
              </View>
            </View>
          </View>

          {/* Pricing Toggle */}
          <View style={[styles.toggleContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.toggleLabel, { color: theme.text }]}>Monthly</Text>
            <View style={[styles.toggle, { backgroundColor: theme.primary }]}>
              <View style={[styles.toggleButton, { backgroundColor: theme.onPrimary }]} />
            </View>
            <Text style={[styles.toggleLabel, { color: theme.textSecondary }]}>Yearly (Save 20%)</Text>
          </View>

          {/* Subscription Tiers */}
          <View style={styles.tiersContainer}>
            {subscriptionTiers.map((tier) => renderTierCard(tier))}
          </View>

          {/* Trust Indicators */}
          <View style={[styles.trustSection, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.trustItem}>
              <IconFallback name="security" size={20} color={theme.success} />
              <Text style={[styles.trustText, { color: theme.text }]}>Secure Payment</Text>
            </View>
            <View style={styles.trustItem}>
              <IconFallback name="refresh" size={20} color={theme.success} />
              <Text style={[styles.trustText, { color: theme.text }]}>30-Day Guarantee</Text>
            </View>
            <View style={styles.trustItem}>
              <IconFallback name="support" size={20} color={theme.success} />
              <Text style={[styles.trustText, { color: theme.text }]}>24/7 Support</Text>
            </View>
          </View>

          {/* Enhanced Info Card */}
          <View style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}>
            <View style={[styles.infoIcon, { backgroundColor: theme.info + '20' }]}>
              <IconFallback name="lightbulb" size={24} color={theme.info} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                Need Help Choosing?
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                You can upgrade or downgrade your plan at any time. All plans include a 30-day money-back guarantee and no setup fees.
              </Text>
            </View>
          </View>

          {/* Enhanced FAQ Section */}
          <View style={[styles.faqCard, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.faqTitle, { color: theme.text }]}>Frequently Asked Questions</Text>
            
            {[
              {
                question: "How quickly will I get my first job?",
                answer: "Most mechanics get their first job within 24 hours! We guarantee your first job within 24 hours or we'll refund your subscription."
              },
              {
                question: "What's the average monthly earnings?",
                answer: "Our mechanics earn an average of $3,500+ per month. Top performers earn $8,000+ monthly with our Enterprise plan."
              },
              {
                question: "Is there really a free trial?",
                answer: "Yes! Start with a 30-day free trial, no credit card required. Cancel anytime during the trial with no questions asked."
              },
              {
                question: "What if I'm not satisfied?",
                answer: "We offer 30-90 day money-back guarantees depending on your plan. If you're not earning more, we'll refund you completely."
              },
              {
                question: "Do you provide insurance coverage?",
                answer: "Yes! All plans include comprehensive insurance coverage for your work, so you're protected while earning."
              },
              {
                question: "Can I work part-time?",
                answer: "Absolutely! Many of our mechanics work part-time and still earn $1,500+ per month. Work when you want, as much as you want."
              }
            ].map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <Text style={[styles.faqQuestion, { color: theme.text }]}>
                  {faq.question}
                </Text>
                <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                  {faq.answer}
                </Text>
              </View>
            ))}
          </View>

          {/* Contact Support */}
          <View style={[styles.supportCard, { backgroundColor: theme.primary + '10' }]}>
            <IconFallback name="help" size={24} color={theme.primary} />
            <View style={styles.supportContent}>
              <Text style={[styles.supportTitle, { color: theme.text }]}>
                Still have questions?
              </Text>
              <Text style={[styles.supportText, { color: theme.textSecondary }]}>
                Our support team is here to help you choose the right plan.
              </Text>
              <TouchableOpacity 
                style={[styles.supportButton, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate('Support')}
              >
                <Text style={[styles.supportButtonText, { color: theme.onPrimary }]}>
                  Contact Support
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    gap: 16,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tiersContainer: {
    gap: 24,
    marginBottom: 32,
  },
  tierCard: {
    borderRadius: 20,
    padding: 28,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
    minHeight: 500,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 24,
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -12,
    left: 24,
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  savingsBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  bonusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bonusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  earningsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 12,
    gap: 6,
  },
  earningsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  guaranteeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tierHeader: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tierName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tierDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    marginRight: 8,
    opacity: 0.6,
  },
  price: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 18,
    marginLeft: 4,
    opacity: 0.7,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  limitationsContainer: {
    marginBottom: 24,
  },
  limitationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.7,
  },
  limitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  crossIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  limitationText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 18,
    opacity: 0.7,
  },
  subscribeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: '#fff',
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  trustItem: {
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  faqCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  supportCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  supportContent: {
    flex: 1,
    marginLeft: 16,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.8,
  },
  supportButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});