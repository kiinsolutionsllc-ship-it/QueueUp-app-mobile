import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import MaterialButton from './MaterialButton';

/**
 * UPGRADE PROMPT COMPONENT
 * 
 * Contextual upgrade prompts and feature previews for subscription tiers
 * Features:
 * - Feature preview with upgrade call-to-action
 * - Usage limit warnings
 * - Tier comparison
 * - Direct upgrade navigation
 */

export default function UpgradePrompt({
  visible,
  onClose,
  feature,
  currentTier,
  requiredTier,
  usageInfo = null,
  onUpgrade = null,
  showComparison = true
}) {
  const { getCurrentTheme } = useTheme();
  const { subscriptionPlans } = useSubscription();
  const theme = getCurrentTheme();

  const currentPlan = subscriptionPlans.find(plan => plan.name === currentTier);
  const targetPlan = subscriptionPlans.find(plan => plan.name === requiredTier);
  const isComingSoon = targetPlan?.is_coming_soon || targetPlan?.disabled;

  const handleUpgrade = () => {
    if (isComingSoon) {
      Alert.alert(
        'Coming Soon',
        `This feature is coming soon in our ${targetPlan?.display_name || requiredTier} plan. Stay tuned for updates!`,
        [{ text: 'OK' }]
      );
      onClose();
      return;
    }

    if (onUpgrade) {
      onUpgrade(targetPlan);
    } else {
      // Default upgrade action
      Alert.alert(
        'Upgrade Required',
        `This feature requires ${targetPlan?.display_name || requiredTier} plan. Would you like to upgrade?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Upgrade', 
            onPress: () => {
              // Navigate to subscription screen
              console.log('Navigate to subscription screen');
            }
          }
        ]
      );
    }
    onClose();
  };

  const getFeatureIcon = (featureName) => {
    const iconMap = {
      'ai_matching': 'psychology',
      'advanced_analytics': 'analytics',
      'invoice_tools': 'receipt',
      'customer_management': 'people',
      'api_access': 'api',
      'white_label': 'palette',
      'multi_location': 'location-on',
      'team_collaboration': 'group',
      'priority_support': 'support-agent',
      'profile_boost': 'trending-up'
    };
    return iconMap[featureName] || 'lock';
  };

  const getFeatureDescription = (featureName) => {
    const descriptions = {
      'ai_matching': 'AI-powered job matching and recommendations',
      'advanced_analytics': 'Comprehensive business analytics and insights',
      'invoice_tools': 'Professional invoice generation and management',
      'customer_management': 'Complete customer relationship management',
      'api_access': 'API access for custom integrations',
      'white_label': 'Custom branding and white-label options',
      'multi_location': 'Multi-location management and routing',
      'team_collaboration': 'Team collaboration and management tools',
      'priority_support': 'Priority customer support',
      'profile_boost': 'Enhanced profile visibility and promotion'
    };
    return descriptions[featureName] || 'Premium feature';
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <IconFallback 
                name={getFeatureIcon(feature)} 
                size={24} 
                color={theme.primary} 
              />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: theme.text }]}>
                {getFeatureDescription(feature)}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Available in {targetPlan?.display_name || requiredTier} plan
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconFallback name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Usage Info */}
          {usageInfo && (
            <View style={[styles.usageContainer, { backgroundColor: theme.background }]}>
              <Text style={[styles.usageTitle, { color: theme.text }]}>Current Usage</Text>
              <View style={styles.usageBar}>
                <View 
                  style={[
                    styles.usageProgress, 
                    { 
                      backgroundColor: theme.primary,
                      width: `${Math.min(100, (usageInfo.current / usageInfo.limit) * 100)}%`
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.usageText, { color: theme.textSecondary }]}>
                {usageInfo.current} of {usageInfo.limit} used this month
              </Text>
            </View>
          )}

          {/* Feature Preview */}
          <View style={styles.previewContainer}>
            <Text style={[styles.previewTitle, { color: theme.text }]}>
              What you'll get:
            </Text>
            <View style={styles.previewFeatures}>
              {targetPlan?.features?.slice(0, 5).map((feature, index) => (
                <View key={index} style={styles.previewFeature}>
                  <IconFallback name="check" size={16} color={theme.success} />
                  <Text style={[styles.previewFeatureText, { color: theme.text }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tier Comparison */}
          {showComparison && currentPlan && targetPlan && (
            <View style={styles.comparisonContainer}>
              <Text style={[styles.comparisonTitle, { color: theme.text }]}>
                Plan Comparison
              </Text>
              <View style={styles.comparisonTable}>
                <View style={styles.comparisonRow}>
                  <Text style={[styles.comparisonLabel, { color: theme.textSecondary }]}>
                    Monthly Price
                  </Text>
                  <Text style={[styles.comparisonValue, { color: theme.text }]}>
                    ${currentPlan.price} → ${targetPlan.price}
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={[styles.comparisonLabel, { color: theme.textSecondary }]}>
                    Jobs per Month
                  </Text>
                  <Text style={[styles.comparisonValue, { color: theme.text }]}>
                    {currentPlan.max_jobs_per_month || 'Unlimited'} → {targetPlan.max_jobs_per_month || 'Unlimited'}
                  </Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={[styles.comparisonLabel, { color: theme.textSecondary }]}>
                    Active Jobs
                  </Text>
                  <Text style={[styles.comparisonValue, { color: theme.text }]}>
                    {currentPlan.max_active_jobs || 'Unlimited'} → {targetPlan.max_active_jobs || 'Unlimited'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Trial Information */}
          {targetPlan?.trial_period_days > 0 && (
            <View style={[styles.trialContainer, { backgroundColor: theme.primary + '10' }]}>
              <IconFallback name="star" size={20} color={theme.primary} />
              <Text style={[styles.trialText, { color: theme.primary }]}>
                {targetPlan.trial_period_days} days free trial - No commitment required
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <MaterialButton
              title={isComingSoon ? "Coming Soon" : "Upgrade Now"}
              onPress={handleUpgrade}
              style={[
                styles.upgradeButton, 
                { 
                  backgroundColor: isComingSoon ? theme.textSecondary : theme.primary,
                  opacity: isComingSoon ? 0.7 : 1
                }
              ]}
              textStyle={{ color: isComingSoon ? 'white' : theme.onPrimary }}
              disabled={isComingSoon}
            />
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
                {isComingSoon ? "Close" : "Maybe Later"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
  usageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  usageBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  usageProgress: {
    height: '100%',
    borderRadius: 4,
  },
  usageText: {
    fontSize: 12,
  },
  previewContainer: {
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewFeatures: {
    gap: 8,
  },
  previewFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewFeatureText: {
    fontSize: 14,
    flex: 1,
  },
  comparisonContainer: {
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  comparisonTable: {
    gap: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  comparisonLabel: {
    fontSize: 14,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  trialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  trialText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
  },
  upgradeButton: {
    marginBottom: 8,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
  },
});
