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
import { useAuth } from '../../contexts/AuthContextAWS';
import { useJob } from '../../contexts/SimplifiedJobContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';

const { width } = Dimensions.get('window');

interface CustomerAnalyticsScreenProps {
  navigation: any;
}

const CustomerAnalyticsScreen: React.FC<CustomerAnalyticsScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { getJobsByCustomer } = useJob();
  const theme = getCurrentTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  // Get customer jobs
  const customerJobs = getJobsByCustomer(user?.id || '');
  const completedJobs = customerJobs.filter((job: any) => job.status === 'completed');
  const activeJobs = customerJobs.filter((job: any) => job.status === 'in_progress');
  const pendingJobs = customerJobs.filter((job: any) => job.status === 'pending');

  // Calculate customer-focused analytics
  const totalSpent = completedJobs.reduce((sum: number, job: any) => sum + (job.price || 0), 0);
  const averageJobCost = completedJobs.length > 0 ? totalSpent / completedJobs.length : 0;
  const satisfactionRate = 4.8; // Mock data
  const moneySaved = 1250; // Mock data - money saved through competitive pricing
  const timeSaved = 8.5; // Mock data - hours saved through efficient service
  const preferredMechanics = 3; // Mock data - number of trusted mechanics
  const maintenanceReminders = 2; // Mock data - upcoming maintenance needs


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

  const ChartCard = ({ 
    title, 
    children 
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <MaterialCard style={styles.chartCard}>
      <Text style={[styles.chartTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </MaterialCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="My Service History"
        subtitle="Track your automotive service journey"
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

        {/* Your Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Benefits</Text>
          
          {/* First Row */}
          <View style={styles.benefitsRow}>
            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: theme.success + '20' }]}>
                <IconFallback name="savings" size={24} color={theme.success} />
              </View>
              <Text style={[styles.benefitValue, { color: theme.text }]}>${moneySaved}</Text>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>Money Saved</Text>
            </View>
            
            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: theme.primary + '20' }]}>
                <IconFallback name="schedule" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.benefitValue, { color: theme.text }]}>{timeSaved}h</Text>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>Time Saved</Text>
            </View>
          </View>
          
          {/* Second Row */}
          <View style={styles.benefitsRow}>
            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: theme.accent + '20' }]}>
                <IconFallback name="people" size={24} color={theme.accent} />
              </View>
              <Text style={[styles.benefitValue, { color: theme.text }]}>{preferredMechanics}</Text>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>Trusted Mechanics</Text>
            </View>
            
            <View style={styles.benefitCard}>
              <View style={[styles.benefitIcon, { backgroundColor: theme.warning + '20' }]}>
                <IconFallback name="star" size={24} color={theme.warning} />
              </View>
              <Text style={[styles.benefitValue, { color: theme.text }]}>{satisfactionRate}★</Text>
              <Text style={[styles.benefitTitle, { color: theme.text }]}>Service Rating</Text>
            </View>
          </View>
        </View>

        {/* Service Status */}
        <ChartCard title="Your Service Status">
          <View style={styles.statusOverview}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: theme.success }]} />
              <Text style={[styles.statusLabel, { color: theme.text }]}>Completed Services</Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>{completedJobs.length}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: theme.primary }]} />
              <Text style={[styles.statusLabel, { color: theme.text }]}>Currently Being Serviced</Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>{activeJobs.length}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: theme.warning }]} />
              <Text style={[styles.statusLabel, { color: theme.text }]}>Awaiting Quotes</Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>{pendingJobs.length}</Text>
            </View>
          </View>
        </ChartCard>

        {/* Service Insights */}
        <ChartCard title="Service Insights">
          <View style={styles.trendsContainer}>
            <View style={styles.trendItem}>
              <IconFallback name="trending-down" size={20} color={theme.success} />
              <Text style={[styles.trendLabel, { color: theme.text }]}>Cost Savings This Month</Text>
              <Text style={[styles.trendValue, { color: theme.success }]}>-$180</Text>
            </View>
            <View style={styles.trendItem}>
              <IconFallback name="schedule" size={20} color={theme.primary} />
              <Text style={[styles.trendLabel, { color: theme.text }]}>Average Service Time</Text>
              <Text style={[styles.trendValue, { color: theme.primary }]}>2.3 hrs</Text>
            </View>
            <View style={styles.trendItem}>
              <IconFallback name="favorite" size={20} color={theme.accent} />
              <Text style={[styles.trendLabel, { color: theme.text }]}>Trusted Mechanics</Text>
              <Text style={[styles.trendValue, { color: theme.accent }]}>3</Text>
            </View>
          </View>
        </ChartCard>

        {/* Recent Services */}
        <ChartCard title="Recent Services">
          <View style={styles.activityList}>
            {completedJobs.slice(0, 3).map((job: any, index: number) => (
              <View key={job.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: theme.success + '20' }]}>
                  <IconFallback name="check-circle" size={16} color={theme.success} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: theme.text }]}>{job.title}</Text>
                  <Text style={[styles.activitySubtitle, { color: theme.textSecondary }]}>
                    Service completed • ${job.price || 0}
                  </Text>
                </View>
                <Text style={[styles.activityDate, { color: theme.textSecondary }]}>
                  {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                </Text>
              </View>
            ))}
            {completedJobs.length === 0 && (
              <View style={styles.emptyState}>
                <IconFallback name="directions-car" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No services yet</Text>
                <Text style={[styles.emptyStateDescription, { color: theme.textSecondary }]}>
                  Your completed services will appear here
                </Text>
              </View>
            )}
          </View>
        </ChartCard>

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
    marginHorizontal: -4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginHorizontal: -6,
  },
  benefitCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  benefitValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  chartCard: {
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusOverview: {
    // gap: 12, // Removed for compatibility
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusLabel: {
    flex: 1,
    fontSize: 16,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendsContainer: {
    // gap: 16, // Removed for compatibility
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  trendLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityList: {
    // gap: 12, // Removed for compatibility
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 14,
  },
  activityDate: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
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
    color: '#666',
  },
});

export default CustomerAnalyticsScreen;
