import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import IconFallback from '../shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useJobs } from '../../hooks/useJobsQuery';
import { useAuth } from '../../contexts/AuthContext';
import { FadeIn, SlideInFromBottom } from '../shared/Animations';
import { hapticService } from '../../services/HapticService';

// Chart components
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
// Victory charts removed - unused

const screenWidth = Dimensions.get('window').width;

const AnalyticsDashboard = () => {
  const { getCurrentTheme } = useTheme();
  const { data: jobs = [], isLoading } = useJobs();
  const theme = getCurrentTheme();
  
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedChart, setSelectedChart] = useState('revenue');

  // Process data for charts
  const chartData = useMemo(() => {
    const now = new Date();
    const periods = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
    };
    
    const days = periods[selectedPeriod];
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    // Filter jobs by period
    const filteredJobs = jobs.filter(job => 
      new Date(job.createdAt) >= startDate
    );
    
    // Revenue data
    const revenueData = filteredJobs
      .filter(job => job.status === 'completed')
      .reduce((acc, job) => {
        const date = new Date(job.completedAt || job.createdAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + job.price;
        return acc;
      }, {});
    
    // Jobs count data
    const jobsData = filteredJobs.reduce((acc, job) => {
      const date = new Date(job.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Status distribution
    const statusData = filteredJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
    
    // Category distribution
    const categoryData = filteredJobs.reduce((acc, job) => {
      acc[job.category] = (acc[job.category] || 0) + 1;
      return acc;
    }, {});
    
    return {
      revenue: Object.entries(revenueData).map(([date, value]) => ({ date, value })),
      jobs: Object.entries(jobsData).map(([date, value]) => ({ date, value })),
      status: Object.entries(statusData).map(([status, value]) => ({ status, value })),
      categories: Object.entries(categoryData).map(([category, value]) => ({ category, value })),
    };
  }, [jobs, selectedPeriod]);

  // Chart configurations
  const chartConfig = {
    backgroundColor: theme.surface,
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${hexToRgb(theme.primary)}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${hexToRgb(theme.text)}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.primary,
    },
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '0, 0, 0';
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const totalRevenue = completedJobs.reduce((sum, job) => sum + job.price, 0);
    const averageJobValue = completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0;
    const completionRate = jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0;
    
    return {
      totalJobs: jobs.length,
      completedJobs: completedJobs.length,
      totalRevenue,
      averageJobValue,
      completionRate,
    };
  }, [jobs]);

  const handlePeriodChange = async (period) => {
    await hapticService.selection();
    setSelectedPeriod(period);
  };

  const handleChartChange = async (chart) => {
    await hapticService.selection();
    setSelectedChart(chart);
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['week', 'month', 'quarter', 'year'].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            {
              backgroundColor: selectedPeriod === period ? theme.primary : theme.surface,
              borderColor: selectedPeriod === period ? theme.primary : theme.divider,
            },
          ]}
          onPress={() => handlePeriodChange(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              {
                color: selectedPeriod === period ? theme.onPrimary : theme.text,
              },
            ]}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <FadeIn delay={100}>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: theme.primary + '20' }]}>
            <IconFallback name="work" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {stats.totalJobs}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Total Jobs
          </Text>
        </View>
      </FadeIn>

      <FadeIn delay={200}>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: theme.success + '20' }]}>
            <IconFallback name="check-circle" size={24} color={theme.success} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {stats.completedJobs}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Completed
          </Text>
        </View>
      </FadeIn>

      <FadeIn delay={300}>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: theme.warning + '20' }]}>
            <IconFallback name="attach-money" size={24} color={theme.warning} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            ${(stats.totalRevenue || 0).toFixed(0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Revenue
          </Text>
        </View>
      </FadeIn>

      <FadeIn delay={400}>
        <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
          <View style={[styles.statIcon, { backgroundColor: theme.info + '20' }]}>
            <IconFallback name="trending-up" size={24} color={theme.info} />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {(stats.completionRate || 0).toFixed(1)}%
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Success Rate
          </Text>
        </View>
      </FadeIn>
    </View>
  );

  const renderChartSelector = () => (
    <View style={styles.chartSelector}>
      {[
        { key: 'revenue', label: 'Revenue', icon: 'trending-up' },
        { key: 'jobs', label: 'Jobs', icon: 'work' },
        { key: 'status', label: 'Status', icon: 'pie-chart' },
        { key: 'categories', label: 'Categories', icon: 'category' },
      ].map((chart) => (
        <TouchableOpacity
          key={chart.key}
          style={[
            styles.chartButton,
            {
              backgroundColor: selectedChart === chart.key ? theme.primary : theme.surface,
              borderColor: selectedChart === chart.key ? theme.primary : theme.divider,
            },
          ]}
          onPress={() => handleChartChange(chart.key)}
        >
          <IconFallback name={chart.icon} size={20} color={selectedChart === chart.key ? theme.onPrimary : theme.text} />
          <Text
            style={[
              styles.chartButtonText,
              {
                color: selectedChart === chart.key ? theme.onPrimary : theme.text,
              },
            ]}
          >
            {chart.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChart = () => {
    if (isLoading) {
      return (
        <View style={[styles.chartContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading chart data...
          </Text>
        </View>
      );
    }

    switch (selectedChart) {
      case 'revenue':
        return (
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Revenue Trend
            </Text>
            <LineChart
              data={{
                labels: chartData.revenue.map(item => 
                  new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                ),
                datasets: [{
                  data: chartData.revenue.map(item => item.value),
                }],
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        );

      case 'jobs':
        return (
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Jobs Created
            </Text>
            <BarChart
              data={{
                labels: chartData.jobs.map(item => 
                  new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                ),
                datasets: [{
                  data: chartData.jobs.map(item => item.value),
                }],
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </View>
        );

      case 'status':
        return (
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Job Status Distribution
            </Text>
            <PieChart
              data={chartData.status.map((item, index) => ({
                name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
                population: item.value,
                color: [theme.primary, theme.success, theme.warning, theme.error][index % 4],
                legendFontColor: theme.text,
                legendFontSize: 12,
              }))}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        );

      case 'categories':
        return (
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Service Categories
            </Text>
            <PieChart
              data={chartData.categories.map((item, index) => ({
                name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
                population: item.value,
                color: [theme.primary, theme.success, theme.warning, theme.info][index % 4],
                legendFontColor: theme.text,
                legendFontSize: 12,
              }))}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <SlideInFromBottom delay={0}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Analytics Dashboard
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Track your performance and insights
            </Text>
          </View>
        </SlideInFromBottom>

        {/* Period Selector */}
        <SlideInFromBottom delay={100}>
          {renderPeriodSelector()}
        </SlideInFromBottom>

        {/* Stats Cards */}
        <SlideInFromBottom delay={200}>
          {renderStatsCards()}
        </SlideInFromBottom>

        {/* Chart Selector */}
        <SlideInFromBottom delay={300}>
          {renderChartSelector()}
        </SlideInFromBottom>

        {/* Chart */}
        <SlideInFromBottom delay={400}>
          {renderChart()}
        </SlideInFromBottom>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 24,
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
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  chartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  chartButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 40,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AnalyticsDashboard;
