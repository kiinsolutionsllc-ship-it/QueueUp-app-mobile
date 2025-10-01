import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAuth } from '../../contexts/AuthContext';

/**
 * SUBSCRIPTION ANALYTICS COMPONENT
 * 
 * Displays subscription usage, limits, and analytics for mechanics
 */

export default function SubscriptionAnalytics({ navigation }) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { 
    currentSubscription, 
    currentPlan, 
    usage, 
    subscriptionPayments,
    getUsageInfo 
  } = useSubscription();
  const theme = getCurrentTheme();

  if (!currentSubscription || !currentPlan) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.noSubscriptionCard, { backgroundColor: theme.surface }]}>
          <IconFallback name="subscription" size={48} color={theme.textSecondary} />
          <Text style={[styles.noSubscriptionTitle, { color: theme.text }]}>
            No Active Subscription
          </Text>
          <Text style={[styles.noSubscriptionText, { color: theme.textSecondary }]}>
            Subscribe to a plan to view your usage analytics and unlock premium features.
          </Text>
          <TouchableOpacity
            style={[styles.subscribeButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('SubscriptionPlan')}
          >
            <Text style={[styles.subscribeButtonText, { color: theme.onPrimary }]}>
              View Plans
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const usageTypes = [
    { key: 'jobs_created', label: 'Jobs Created', icon: 'work' },
    { key: 'active_jobs', label: 'Active Jobs', icon: 'schedule' },
    { key: 'messages_sent', label: 'Messages Sent', icon: 'message' },
    { key: 'api_calls', label: 'API Calls', icon: 'api' }
  ];

  const renderUsageCard = (usageType) => {
    const usageInfo = getUsageInfo(usageType.key);
    const percentage = usageInfo.percentage;
    const isNearLimit = usageInfo.isNearLimit;

    return (
      <View key={usageType.key} style={[styles.usageCard, { backgroundColor: theme.surface }]}>
        <View style={styles.usageHeader}>
          <View style={[styles.usageIcon, { backgroundColor: theme.primary + '20' }]}>
            <IconFallback name={usageType.icon} size={20} color={theme.primary} />
          </View>
          <Text style={[styles.usageLabel, { color: theme.text }]}>
            {usageType.label}
          </Text>
        </View>
        
        <View style={styles.usageStats}>
          <Text style={[styles.usageCurrent, { color: theme.text }]}>
            {usageInfo.current}
          </Text>
          <Text style={[styles.usageLimit, { color: theme.textSecondary }]}>
            {usageInfo.unlimited ? 'Unlimited' : `of ${usageInfo.limit}`}
          </Text>
        </View>

        {!usageInfo.unlimited && (
          <View style={[styles.progressBar, { backgroundColor: theme.background }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: isNearLimit ? theme.error : theme.primary,
                  width: `${Math.min(percentage, 100)}%`
                }
              ]} 
            />
          </View>
        )}

        {isNearLimit && !usageInfo.unlimited && (
          <Text style={[styles.warningText, { color: theme.error }]}>
            Approaching limit
          </Text>
        )}
      </View>
    );
  };

  const renderPaymentHistory = () => {
    if (subscriptionPayments.length === 0) {
      return (
        <View style={[styles.noPaymentsCard, { backgroundColor: theme.surface }]}>
          <IconFallback name="receipt" size={32} color={theme.textSecondary} />
          <Text style={[styles.noPaymentsText, { color: theme.textSecondary }]}>
            No payment history yet
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.paymentHistoryCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.paymentHistoryTitle, { color: theme.text }]}>
          Recent Payments
        </Text>
        {subscriptionPayments.slice(0, 3).map((payment, index) => (
          <View key={payment.id} style={styles.paymentItem}>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentAmount, { color: theme.text }]}>
                ${payment.amount}
              </Text>
              <Text style={[styles.paymentDate, { color: theme.textSecondary }]}>
                {new Date(payment.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={[
              styles.paymentStatus, 
              { backgroundColor: payment.status === 'succeeded' ? theme.success + '20' : theme.error + '20' }
            ]}>
              <Text style={[
                styles.paymentStatusText, 
                { color: payment.status === 'succeeded' ? theme.success : theme.error }
              ]}>
                {payment.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Current Plan Card */}
      <View style={[styles.planCard, { backgroundColor: theme.surface }]}>
        <View style={styles.planHeader}>
          <View style={[styles.planIcon, { backgroundColor: theme.primary + '20' }]}>
            <IconFallback name="star" size={24} color={theme.primary} />
          </View>
          <View style={styles.planInfo}>
            <Text style={[styles.planName, { color: theme.text }]}>
              {currentPlan.display_name}
            </Text>
            <Text style={[styles.planPrice, { color: theme.primary }]}>
              ${currentPlan.price}/{currentPlan.billing_interval}
            </Text>
          </View>
        </View>
        
        <View style={styles.planStatus}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: currentSubscription.status === 'active' ? theme.success + '20' : theme.warning + '20' }
          ]}>
            <Text style={[
              styles.statusText, 
              { color: currentSubscription.status === 'active' ? theme.success : theme.warning }
            ]}>
              {currentSubscription.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Usage Analytics */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Usage Analytics
        </Text>
        <View style={styles.usageGrid}>
          {usageTypes.map(renderUsageCard)}
        </View>
      </View>

      {/* Payment History */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Payment History
        </Text>
        {renderPaymentHistory()}
      </View>

      {/* Plan Features */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Plan Features
        </Text>
        <View style={[styles.featuresCard, { backgroundColor: theme.surface }]}>
          {currentPlan.features.slice(0, 5).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <IconFallback name="check" size={16} color={theme.success} />
              <Text style={[styles.featureText, { color: theme.text }]}>
                {feature}
              </Text>
            </View>
          ))}
          {currentPlan.features.length > 5 && (
            <Text style={[styles.moreFeaturesText, { color: theme.textSecondary }]}>
              +{currentPlan.features.length - 5} more features
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noSubscriptionCard: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  noSubscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  noSubscriptionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  subscribeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  planCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  planStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  usageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  usageCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  usageLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  usageStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  usageCurrent: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 4,
  },
  usageLimit: {
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paymentHistoryCard: {
    padding: 16,
    borderRadius: 12,
  },
  paymentHistoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
  },
  paymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  noPaymentsCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  noPaymentsText: {
    fontSize: 14,
    marginTop: 8,
  },
  featuresCard: {
    padding: 16,
    borderRadius: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  moreFeaturesText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
