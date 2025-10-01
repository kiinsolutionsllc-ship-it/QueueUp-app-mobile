import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import IconFallback from '../../components/shared/IconFallback';
import { FadeIn } from '../../components/shared/Animations';
import PaymentService from '../../services/PaymentService';

const CommissionManagementScreen = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  const [payouts, setPayouts] = useState<any>([]);
  const [loading, setLoading] = useState<any>(true);
  const [refreshing, setRefreshing] = useState<any>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<any>('all'); // 'all', 'week', 'month', 'year'

  useEffect(() => {
    fetchPayouts();
  }, [selectedPeriod]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      // For development, use mock data
      const mockPayouts = (PaymentService as any).getMockPayouts(user?.id || 'MECHANIC-20241201-143000-0001');
      setPayouts(mockPayouts);
      
      // In production, use real API:
      // const result = await PaymentService.getMechanicPayouts(user.id);
      // if (result.success) {
      //   setPayouts(result.data);
      // }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPayouts();
    setRefreshing(false);
  };

  const getTotalEarnings = () => {
    return payouts
      .filter(payout => payout.status === 'completed')
      .reduce((total, payout) => total + payout.amount, 0);
  };

  const getPendingEarnings = () => {
    return payouts
      .filter(payout => payout.status === 'pending')
      .reduce((total, payout) => total + payout.amount, 0);
  };

  const getCommissionRate = () => {
    return 10; // 10% commission rate
  };

  const formatCurrency = (amount) => {
    const safeAmount = amount ?? 0;
    return `$${safeAmount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return theme.success;
      case 'pending':
        return theme.warning;
      case 'failed':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'hourglass-empty';
      case 'failed':
        return 'error';
      default:
        return 'help';
    }
  };

  const renderPayoutCard = (payout) => (
    <FadeIn key={payout.id} delay={100}>
      <View style={[styles.payoutCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
        <View style={styles.payoutHeader}>
          <View style={styles.payoutInfo}>
            <Text style={[styles.jobTitle, { color: theme.text }]}>
              {payout.job.title}
            </Text>
            <Text style={[styles.jobCategory, { color: theme.textSecondary }]}>
              {payout.job.category} • {payout.job.subcategory?.name || payout.job.subcategory || 'General'}
            </Text>
            <Text style={[styles.payoutDate, { color: theme.textSecondary }]}>
              {formatDate(payout.created_at)}
            </Text>
          </View>
          <View style={styles.payoutAmount}>
            <Text style={[styles.amount, { color: theme.primary }]}>
              {formatCurrency(payout.amount)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payout.status) + '20' }]}>
              <IconFallback name={getStatusIcon(payout.status)} size={12} color={getStatusColor(payout.status)} />
              <Text style={[styles.statusText, { color: getStatusColor(payout.status) }]}>
                {payout.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.payoutDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Description:</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{payout.description}</Text>
          </View>
        </View>
      </View>
    </FadeIn>
  );

  const periodOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBarStyle as any} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <IconFallback name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Earnings & Payouts
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Track your earnings and commission
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Earnings Summary */}
        <FadeIn delay={100}>
          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>Earnings Summary</Text>
            
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.success }]}>
                  {formatCurrency(getTotalEarnings())}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Total Earned
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.warning }]}>
                  {formatCurrency(getPendingEarnings())}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Pending
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {getCommissionRate()}%
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Commission Rate
                </Text>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Period Filter */}
        <FadeIn delay={200}>
          <View style={styles.periodFilter}>
            <Text style={[styles.filterTitle, { color: theme.text }]}>Time Period</Text>
            <View style={styles.periodButtons}>
              {periodOptions.map((period) => (
                <TouchableOpacity
                  key={period.id}
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor: selectedPeriod === period.id ? theme.primary : theme.surface,
                      borderColor: selectedPeriod === period.id ? theme.primary : theme.divider,
                    }
                  ]}
                  onPress={() => setSelectedPeriod(period.id)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      {
                        color: selectedPeriod === period.id ? theme.onPrimary : theme.text,
                      }
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FadeIn>

        {/* Payouts List */}
        <FadeIn delay={300}>
          <View style={styles.payoutsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Payout History
            </Text>
            
            {payouts.length === 0 ? (
              <View style={styles.emptyState}>
                <IconFallback name="attach-money" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                  No Payouts Yet
                </Text>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  Complete jobs to start earning payouts
                </Text>
              </View>
            ) : (
              <View style={styles.payoutsList}>
                {payouts.map((payout) => renderPayoutCard(payout))}
              </View>
            )}
          </View>
        </FadeIn>

        {/* Commission Info */}
        <FadeIn delay={400}>
          <View style={[styles.infoCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
            <IconFallback name="info" size={20} color={theme.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                How Commission Works
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                • You receive {100 - getCommissionRate()}% of the job amount{'\n'}
                • Platform commission is {getCommissionRate()}%{'\n'}
                • Payouts are processed within 2-3 business days{'\n'}
                • You can track all earnings in this section
              </Text>
            </View>
          </View>
        </FadeIn>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  periodFilter: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  payoutsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  payoutsList: {
    gap: 12,
  },
  payoutCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  payoutInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  jobCategory: {
    fontSize: 13,
    marginBottom: 4,
  },
  payoutDate: {
    fontSize: 12,
  },
  payoutAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  payoutDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    flex: 2,
    textAlign: 'right',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CommissionManagementScreen;

