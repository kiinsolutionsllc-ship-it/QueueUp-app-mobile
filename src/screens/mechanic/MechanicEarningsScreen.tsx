import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useJob } from '../../contexts/SimplifiedJobContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';

const { width } = Dimensions.get('window');

interface MechanicEarningsScreenProps {
  navigation: any;
}

const MechanicEarningsScreen: React.FC<MechanicEarningsScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { getJobsByMechanic } = useJob();
  const theme = getCurrentTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  // Get mechanic jobs
  const mechanicJobs = getJobsByMechanic(user?.id || '');
  const completedJobs = mechanicJobs.filter((job: any) => job.status === 'completed');
  
  // Calculate earnings
  const totalEarnings = completedJobs.reduce((sum: number, job: any) => sum + ((job.price || 0) * 0.9), 0);
  const thisMonthEarnings = completedJobs
    .filter((job: any) => {
      const jobDate = new Date(job.createdAt || Date.now());
      const now = new Date();
      return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, job: any) => sum + ((job.price || 0) * 0.9), 0);

  const EarningsCard = ({ 
    title, 
    amount, 
    subtitle, 
    icon, 
    color, 
    trend 
  }: {
    title: string;
    amount: string;
    subtitle?: string;
    icon: string;
    color: string;
    trend?: string;
  }) => (
    <MaterialCard style={styles.earningsCard}>
      <View style={styles.earningsHeader}>
        <View style={[styles.earningsIcon, { backgroundColor: color + '20' }]}>
          <IconFallback name={icon} size={24} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.trendText, { color: color }]}>{trend}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.earningsAmount, { color: theme.text }]}>{amount}</Text>
      <Text style={[styles.earningsTitle, { color: theme.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.earningsSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      )}
    </MaterialCard>
  );

  const PeriodButton = ({ 
    period, 
    label 
  }: {
    period: string;
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        {
          backgroundColor: selectedPeriod === period ? theme.primary : theme.surface,
          borderColor: selectedPeriod === period ? theme.primary : theme.border,
        },
      ]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text
        style={[
          styles.periodButtonText,
          {
            color: selectedPeriod === period ? theme.onPrimary : theme.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const TransactionItem = ({ 
    job, 
    amount 
  }: {
    job: any;
    amount: number;
  }) => (
    <View style={[styles.transactionItem, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionTitle, { color: theme.text }]}>{job.title}</Text>
        <Text style={[styles.transactionCustomer, { color: theme.textSecondary }]}>
          {job.customerName || 'Unknown Customer'}
        </Text>
        <Text style={[styles.transactionDate, { color: theme.textSecondary }]}>
          {new Date(job.createdAt || Date.now()).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[styles.amountText, { color: theme.success }]}>+${amount.toFixed(2)}</Text>
        <Text style={[styles.feeText, { color: theme.textSecondary }]}>
          Fee: ${(job.price * 0.1).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Earnings"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selection */}
        <View style={styles.periodSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Time Period</Text>
          <View style={styles.periodButtons}>
            <PeriodButton period="week" label="This Week" />
            <PeriodButton period="month" label="This Month" />
            <PeriodButton period="year" label="This Year" />
            <PeriodButton period="all" label="All Time" />
          </View>
        </View>

        {/* Earnings Overview */}
        <View style={styles.earningsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Earnings Overview</Text>
          <View style={styles.earningsGrid}>
            <EarningsCard
              title="Total Earnings"
              amount={`$${totalEarnings.toFixed(2)}`}
              subtitle="All time"
              icon="attach-money"
              color={theme.success}
              trend="+12%"
            />
            <EarningsCard
              title="This Month"
              amount={`$${thisMonthEarnings.toFixed(2)}`}
              subtitle="Current month"
              icon="trending-up"
              color={theme.primary}
              trend="+8%"
            />
            <EarningsCard
              title="Jobs Completed"
              amount={completedJobs.length.toString()}
              subtitle="Total jobs"
              icon="check-circle"
              color={theme.accent}
              trend="+5%"
            />
            <EarningsCard
              title="Average per Job"
              amount={`$${completedJobs.length > 0 ? (totalEarnings / completedJobs.length).toFixed(2) : '0.00'}`}
              subtitle="Per completed job"
              icon="analytics"
              color={theme.warning}
              trend="+3%"
            />
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>
          {completedJobs.length === 0 ? (
            <View style={styles.emptyState}>
              <IconFallback name="receipt" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No earnings yet
              </Text>
              <Text style={[styles.emptyStateDescription, { color: theme.textSecondary }]}>
                Complete jobs to start earning money
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {completedJobs.slice(0, 10).map((job: any) => (
                <TransactionItem
                  key={job.id}
                  job={job}
                  amount={(job.price || 0) * 0.9}
                />
              ))}
            </View>
          )}
        </View>

        {/* Payment Information */}
        <View style={styles.paymentSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Information</Text>
          <MaterialCard style={styles.paymentCard}>
            <View style={styles.paymentInfo}>
              <IconFallback name="account-balance-wallet" size={24} color={theme.primary} />
              <View style={styles.paymentDetails}>
                <Text style={[styles.paymentTitle, { color: theme.text }]}>
                  Payment Method
                </Text>
                <Text style={[styles.paymentSubtitle, { color: theme.textSecondary }]}>
                  Bank Account ending in ****1234
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.primary + '20' }]}
              onPress={() => Alert.alert('Edit Payment', 'Payment method editing would be implemented here')}
            >
              <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit</Text>
            </TouchableOpacity>
          </MaterialCard>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => Alert.alert('Withdraw', 'Withdrawal functionality would be implemented here')}
            >
              <IconFallback name="account-balance" size={20} color={theme.onPrimary} />
              <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Withdraw</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.success }]}
              onPress={() => Alert.alert('Export', 'Export functionality would be implemented here')}
            >
              <IconFallback name="file-download" size={20} color={theme.onPrimary} />
              <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.warning }]}
              onPress={() => navigation.navigate('UnifiedJobs', { userType: 'mechanic' })}
            >
              <IconFallback name="work" size={20} color={theme.onPrimary} />
              <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Find Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.accent }]}
              onPress={() => navigation.navigate('UnifiedProfile')}
            >
              <IconFallback name="person" size={20} color={theme.onPrimary} />
              <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  periodSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  earningsSection: {
    marginBottom: 24,
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  earningsCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  earningsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  earningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  earningsSubtitle: {
    fontSize: 12,
  },
  transactionsSection: {
    marginBottom: 24,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionCustomer: {
    fontSize: 14,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  feeText: {
    fontSize: 12,
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
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  paymentSection: {
    marginBottom: 24,
  },
  paymentCard: {
    padding: 16,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});

export default MechanicEarningsScreen;
