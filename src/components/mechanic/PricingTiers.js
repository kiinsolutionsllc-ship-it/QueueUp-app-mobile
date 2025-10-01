import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import MaterialButton from '../shared/MaterialButton';

const PRICING_TIERS = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 4.99,
    trial_days: 14,
    features: [
      'Up to 5 jobs per month',
      'Up to 2 active jobs',
      'Basic job matching',
      'Mobile app access',
      'Community support',
      'Real-time notifications',
      'Basic scheduling tools',
      'Customer review system',
      'Secure payment processing',
      'Insurance coverage included'
    ],
    limitations: [
      'Limited job visibility',
      'Standard response time (2-4 hours)',
      'Basic analytics dashboard',
      'No priority support'
    ],
    color: '#6B7280',
    icon: 'work',
    description: 'Ultra-affordable entry point to test the waters'
  },
  {
    id: 'starter',
    name: 'Starter Plan',
    price: 12.99,
    trial_days: 14,
    features: [
      'Up to 30 jobs per month',
      'Up to 8 active jobs',
      'Enhanced job matching',
      'Basic analytics',
      'Email support',
      'Profile boost',
      'Full mobile app access',
      'Real-time notifications',
      'Advanced scheduling tools',
      'Customer review system',
      'Secure payment processing',
      'Insurance coverage included',
      'Priority listing in search results'
    ],
    limitations: [
      'Limited advanced features',
      'Standard response time (1-2 hours)',
      'No team collaboration tools'
    ],
    color: '#2196F3',
    icon: 'rocket-launch',
    description: 'Perfect for side hustles transitioning to part-time work'
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 24.99,
    trial_days: 14,
    features: [
      'Unlimited jobs per month',
      'Up to 50 active jobs',
      'AI-powered matching',
      'Advanced analytics',
      'Priority support',
      'Team collaboration',
      'Invoice tools',
      'Customer management',
      'Full mobile app access',
      'Instant notifications',
      'Advanced scheduling & calendar',
      'Customer reviews & ratings management',
      'Enhanced messaging system',
      'Custom pricing tiers & packages',
      'Priority listing in search results',
      'Advanced marketing tools',
      'Insurance coverage included',
      'Free professional photoshoot',
      'Dedicated account manager'
    ],
    limitations: [],
    color: '#14B8A6',
    icon: 'star',
    popular: true,
    description: 'Complete business management solution - MOST POPULAR'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 49.99,
    trial_days: 7,
    features: [
      'Unlimited jobs per month',
      'Unlimited active jobs',
      'AI-powered matching + recommendations',
      'Advanced analytics & reporting',
      '24/7 premium support (15-min response)',
      'White-label options',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Multi-location management',
      'Advanced reporting & insights',
      'Full mobile app access',
      'Instant notifications',
      'Advanced scheduling & calendar',
      'Customer reviews & ratings management',
      'Advanced marketing tools & promotion',
      'Custom pricing tiers & packages',
      'Team management tools',
      'Insurance coverage included',
      'Priority listing in search results',
      'Customer loyalty program',
      'Free professional photoshoot',
      'Custom business tools',
      'Bulk job management'
    ],
    limitations: [],
    color: '#F59E0B',
    icon: 'diamond',
    description: 'Scale operations with enterprise-grade tools',
    is_coming_soon: true,
    disabled: true
  },
];

export default function PricingTiers({ currentTier = 'basic', onSelectTier }) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [loading, setLoading] = useState(false);

  const handleSelectTier = (tierId) => {
    setSelectedTier(tierId);
  };

  const handleUpgrade = async () => {
    if (selectedTier === currentTier) {
      Alert.alert('Already Active', 'This tier is already your current plan');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSelectTier) {
        onSelectTier(selectedTier);
      }
      
      Alert.alert(
        'Upgrade Successful!', 
        `You have successfully upgraded to ${PRICING_TIERS.find(t => t.id === selectedTier)?.name} tier`
      );
    } catch (error) {
      Alert.alert('Upgrade Failed', 'There was an error processing your upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTierCard = (tier) => {
    const isSelected = selectedTier === tier.id;
    const isCurrent = currentTier === tier.id;
    const isUpgrade = PRICING_TIERS.findIndex(t => t.id === selectedTier) > PRICING_TIERS.findIndex(t => t.id === currentTier);
    const isComingSoon = tier.is_coming_soon || tier.disabled;

    return (
      <TouchableOpacity
        key={tier.id}
        style={[
          styles.tierCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: isSelected ? tier.color : theme.divider,
            borderWidth: isSelected ? 2 : 1,
            transform: tier.popular ? [{ scale: 1.05 }] : [{ scale: 1 }],
            opacity: isComingSoon ? 0.7 : 1,
          }
        ]}
        onPress={() => !isComingSoon && handleSelectTier(tier.id)}
        activeOpacity={isComingSoon ? 1 : 0.8}
        disabled={isComingSoon}
      >
        {tier.popular && (
          <View style={[styles.popularBadge, { backgroundColor: tier.color }]}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        {isComingSoon && (
          <View style={[styles.comingSoonBadge, { backgroundColor: theme.textSecondary }]}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        )}

        <View style={styles.tierHeader}>
          <View style={[styles.tierIcon, { backgroundColor: tier.color + '20' }]}>
            <IconFallback name={tier.icon} size={24} color={tier.color} />
          </View>
          <View style={styles.tierInfo}>
            <Text style={[styles.tierName, { color: theme.text }]}>{tier.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: theme.text }]}>
                ${tier.price}
              </Text>
              <Text style={[styles.pricePeriod, { color: theme.textSecondary }]}>
                {tier.price > 0 ? '/month' : 'Free'}
              </Text>
            </View>
            {tier.trial_days > 0 && (
              <View style={[styles.trialBadge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.trialText, { color: theme.primary }]}>
                  {tier.trial_days} days free trial
                </Text>
              </View>
            )}
          </View>
        </View>

        {isCurrent && (
          <View style={[styles.currentBadge, { backgroundColor: theme.success + '20' }]}>
            <IconFallback name="check-circle" size={16} color={theme.success} />
            <Text style={[styles.currentText, { color: theme.success }]}>Current Plan</Text>
          </View>
        )}

        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, { color: theme.text }]}>Features:</Text>
          {tier.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <IconFallback name="check" size={16} color={theme.success} />
              <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
            </View>
          ))}
        </View>

        {tier.limitations.length > 0 && (
          <View style={styles.limitationsContainer}>
            <Text style={[styles.limitationsTitle, { color: theme.textSecondary }]}>Limitations:</Text>
            {tier.limitations.map((limitation, index) => (
              <View key={index} style={styles.limitationItem}>
                <IconFallback name="info" size={14} color={theme.textSecondary} />
                <Text style={[styles.limitationText, { color: theme.textSecondary }]}>{limitation}</Text>
              </View>
            ))}
          </View>
        )}

        {isSelected && !isCurrent && (
          <View style={styles.selectionIndicator}>
            <IconFallback name="radio-button-checked" size={20} color={tier.color} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Choose Your Plan</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Select the pricing tier that best fits your business needs
      </Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tiersContainer}
      >
        {PRICING_TIERS.map(renderTierCard)}
      </ScrollView>

      <View style={styles.actionContainer}>
        <View style={styles.selectedTierInfo}>
          <Text style={[styles.selectedTierText, { color: theme.text }]}>
            Selected: {PRICING_TIERS.find(t => t.id === selectedTier)?.name}
          </Text>
          <Text style={[styles.selectedTierPrice, { color: theme.primary }]}>
            ${PRICING_TIERS.find(t => t.id === selectedTier)?.price}
            {PRICING_TIERS.find(t => t.id === selectedTier)?.price > 0 ? '/month' : ''}
          </Text>
        </View>

        <MaterialButton
          title={currentTier === selectedTier ? 'Current Plan' : 'Upgrade Plan'}
          onPress={handleUpgrade}
          disabled={currentTier === selectedTier || loading}
          loading={loading}
          style={[
            styles.upgradeButton,
            { 
              backgroundColor: currentTier === selectedTier ? theme.textSecondary : theme.primary,
              opacity: currentTier === selectedTier ? 0.5 : 1
            }
          ]}
          icon="upgrade"
        />
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.info + '20' }]}>
        <IconFallback name="info" size={20} color={theme.info} />
        <View style={styles.infoContent}>
          <Text style={[styles.infoTitle, { color: theme.info }]}>Billing Information</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>
            • Billing occurs monthly on the same date{'\n'}
            • You can upgrade or downgrade at any time{'\n'}
            • All plans include a 7-day free trial{'\n'}
            • Cancel anytime with no cancellation fees
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  tiersContainer: {
    paddingHorizontal: 10,
    gap: 16,
  },
  tierCard: {
    width: 280,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  tierIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  pricePeriod: {
    fontSize: 14,
    marginLeft: 4,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 4,
  },
  currentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  limitationsContainer: {
    marginBottom: 16,
  },
  limitationsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  limitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  limitationText: {
    fontSize: 12,
    flex: 1,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  actionContainer: {
    marginTop: 24,
    paddingHorizontal: 10,
  },
  selectedTierInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  selectedTierText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedTierPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  upgradeButton: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  trialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  trialText: {
    fontSize: 12,
    fontWeight: '600',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    zIndex: 10,
  },
  comingSoonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
