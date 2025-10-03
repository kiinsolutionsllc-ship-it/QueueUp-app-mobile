import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { useJob } from '../../contexts/SimplifiedJobContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';

const { width } = Dimensions.get('window');

interface MechanicAnalyticsScreenProps {
  navigation: any;
}

const MechanicAnalyticsScreen: React.FC<MechanicAnalyticsScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { getJobsByMechanic } = useJob();
  const theme = getCurrentTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');

  // Get mechanic jobs
  const mechanicJobs = getJobsByMechanic(user?.id || '');
  const completedJobs = mechanicJobs.filter((job: any) => job.status === 'completed');
  const activeJobs = mechanicJobs.filter((job: any) => job.status === 'in_progress');
  const pendingJobs = mechanicJobs.filter((job: any) => job.status === 'pending');

  // Calculate analytics
  const totalEarnings = completedJobs.reduce((sum: number, job: any) => sum + ((job.price || 0) * 0.9), 0);
  const averageRating = 4.8; // Mock data
  const completionRate = completedJobs.length > 0 ? Math.round((completedJobs.length / (completedJobs.length + pendingJobs.length)) * 100) : 0;

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color, 
    trend 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
    trend?: string;
  }) => (
    <MaterialCard style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <IconFallback name={icon} size={24} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.trendText, { color: color }]}>{trend}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
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
        title="Analytics"
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

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <StatCard
              title="Total Earnings"
              value={`$${totalEarnings.toFixed(0)}`}
              subtitle="All time"
              icon="attach-money"
              color={theme.success}
              trend="+12%"
            />
            <StatCard
              title="Jobs Completed"
              value={completedJobs.length}
              subtitle="Successfully finished"
              icon="check-circle"
              color={theme.primary}
              trend="+8%"
            />
            <StatCard
              title="Average Rating"
              value={`${averageRating}★`}
              subtitle="Customer satisfaction"
              icon="star"
              color={theme.warning}
              trend="+0.2"
            />
            <StatCard
              title="Completion Rate"
              value={`${completionRate}%`}
              subtitle="Job success rate"
              icon="trending-up"
              color={theme.accent}
              trend="+5%"
            />
          </View>
        </View>

        {/* Job Status Overview */}
        <ChartCard title="Job Status Overview">
          <View style={styles.statusOverview}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: theme.primary }]} />
              <Text style={[styles.statusLabel, { color: theme.text }]}>Completed</Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>{completedJobs.length}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: theme.warning }]} />
              <Text style={[styles.statusLabel, { color: theme.text }]}>In Progress</Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>{activeJobs.length}</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, { backgroundColor: theme.textSecondary }]} />
              <Text style={[styles.statusLabel, { color: theme.text }]}>Pending</Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>{pendingJobs.length}</Text>
            </View>
          </View>
        </ChartCard>

        {/* Performance Trends */}
        <ChartCard title="Performance Trends">
          <View style={styles.trendsContainer}>
            <View style={styles.trendItem}>
              <IconFallback name="trending-up" size={20} color={theme.success} />
              <Text style={[styles.trendLabel, { color: theme.text }]}>Earnings Growth</Text>
              <Text style={[styles.trendValue, { color: theme.success }]}>+15%</Text>
            </View>
            <View style={styles.trendItem}>
              <IconFallback name="schedule" size={20} color={theme.primary} />
              <Text style={[styles.trendLabel, { color: theme.text }]}>Response Time</Text>
              <Text style={[styles.trendValue, { color: theme.primary }]}>2.5 hrs</Text>
            </View>
            <View style={styles.trendItem}>
              <IconFallback name="people" size={20} color={theme.accent} />
              <Text style={[styles.trendLabel, { color: theme.text }]}>Repeat Customers</Text>
              <Text style={[styles.trendValue, { color: theme.accent }]}>68%</Text>
            </View>
          </View>
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard title="Recent Activity">
          <View style={styles.activityList}>
            {completedJobs.slice(0, 3).map((job: any, index: number) => (
              <View key={job.id} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: theme.success + '20' }]}>
                  <IconFallback name="check-circle" size={16} color={theme.success} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: theme.text }]}>{job.title}</Text>
                  <Text style={[styles.activitySubtitle, { color: theme.textSecondary }]}>
                    Completed • ${job.price || 0}
                  </Text>
                </View>
                <Text style={[styles.activityDate, { color: theme.textSecondary }]}>
                  {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </ChartCard>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('UnifiedJobs', { userType: 'mechanic' })}
            >
              <IconFallback name="work" size={20} color={theme.onPrimary} />
              <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>View Jobs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.success }]}
              onPress={() => navigation.navigate('MechanicEarnings')}
            >
              <IconFallback name="attach-money" size={20} color={theme.onPrimary} />
              <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.warning }]}
              onPress={() => navigation.navigate('UnifiedMessaging')}
            >
              <IconFallback name="message" size={20} color={theme.onPrimary} />
              <Text style={[styles.actionButtonText, { color: theme.onPrimary }]}>Messages</Text>
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
  metricsSection: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
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
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
    gap: 16,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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

export default MechanicAnalyticsScreen;
