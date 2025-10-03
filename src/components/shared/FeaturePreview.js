import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import UpgradePrompt from './UpgradePrompt';

/**
 * FEATURE PREVIEW COMPONENT
 * 
 * Shows locked features with upgrade prompts
 * Features:
 * - Grayed out locked features
 * - Hover/touch preview
 * - Upgrade call-to-action
 * - Feature descriptions
 */

export default function FeaturePreview({
  feature,
  requiredTier,
  children,
  description,
  onUpgrade = null,
  style = {},
  disabled = false
}) {
  const { getCurrentTheme } = useTheme();
  const { getSubscriptionTier, subscriptionPlans } = useSubscription();
  const theme = getCurrentTheme();
  
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const currentTier = getSubscriptionTier();
  const hasAccess = checkFeatureAccess(currentTier, requiredTier);
  const targetPlan = subscriptionPlans.find(plan => plan.name === requiredTier);
  const isComingSoon = targetPlan?.is_coming_soon || targetPlan?.disabled;

  const handlePress = () => {
    if (hasAccess || disabled) return;
    
    // Animate press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setShowUpgradePrompt(true);
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

  if (hasAccess) {
    return <View style={style}>{children}</View>;
  }

  return (
    <>
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <TouchableOpacity
          style={[
            styles.container,
            { 
              backgroundColor: theme.surface,
              borderColor: theme.border,
              opacity: 0.6
            }
          ]}
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.7}
        >
          {/* Lock Overlay */}
          <View style={[styles.lockOverlay, { backgroundColor: theme.background + 'CC' }]}>
            <View style={[styles.lockIcon, { backgroundColor: theme.primary + '20' }]}>
              <IconFallback name="lock" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.lockText, { color: theme.primary }]}>
              {isComingSoon ? 'Coming Soon' : `${targetPlan?.display_name || requiredTier} Required`}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>

          {/* Feature Info */}
          <View style={styles.featureInfo}>
            <View style={styles.featureHeader}>
              <IconFallback 
                name={getFeatureIcon(feature)} 
                size={16} 
                color={theme.textSecondary} 
              />
              <Text style={[styles.featureName, { color: theme.textSecondary }]}>
                {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
            {description && (
              <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                {description}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      <UpgradePrompt
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature={feature}
        currentTier={currentTier}
        requiredTier={requiredTier}
        onUpgrade={onUpgrade}
      />
    </>
  );
}

// Helper function to check feature access
function checkFeatureAccess(currentTier, requiredTier) {
  const tierHierarchy = ['basic', 'starter', 'professional', 'enterprise'];
  const currentIndex = tierHierarchy.indexOf(currentTier);
  const requiredIndex = tierHierarchy.indexOf(requiredTier);
  
  return currentIndex >= requiredIndex;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    gap: 8,
  },
  lockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    opacity: 0.3,
  },
  featureInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  featureName: {
    fontSize: 12,
    fontWeight: '600',
  },
  featureDescription: {
    fontSize: 10,
    lineHeight: 14,
  },
});
