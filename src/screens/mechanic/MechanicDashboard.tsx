import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { useJob } from '../../contexts/SimplifiedJobContext';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
import { formatJobCost, calculateTotalJobCost } from '../../utils/JobCostUtils';
import { designTokens } from '../../design-system/DesignSystem';
import { hapticService } from '../../services/HapticService';
import ModernHeader from '../../components/shared/ModernHeader';
import FeaturePreview from '../../components/shared/FeaturePreview';
import DateJobsModal from '../../components/modals/DateJobsModal';

const { width: screenWidth } = Dimensions.get('window');

interface MechanicDashboardProps {
  navigation: any;
}

const MechanicDashboard: React.FC<MechanicDashboardProps> = ({ navigation }) => {
  const { getCurrentTheme, getStatusColor: getThemeStatusColor } = useTheme();
  const { user } = useAuth();
  const { getJobsByMechanic } = useJob();
  const theme = getCurrentTheme();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showFeaturePreview, setShowFeaturePreview] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [modalSelectedDate, setModalSelectedDate] = useState<Date | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Get mechanic data
  const mechanicData = {
    id: getFallbackUserIdWithTypeDetection(user?.id, user?.user_type),
    name: user?.name || 'John Mechanic',
    rating: 4.8,
    completedJobs: 0,
    totalEarnings: 0,
    responseTime: '15 min',
    specialties: ['Engine Repair', 'Brake Service', 'Oil Change'],
    location: user?.location || 'New York, NY',
    isOnline: true,
    nextAvailable: 'Available now',
  };

  // Get jobs for this mechanic
  const mechanicJobs = getJobsByMechanic(mechanicData.id);
  console.log('All mechanic jobs:', mechanicJobs);
  console.log('Mechanic ID:', mechanicData.id);
  
  // Add a test job for the 2nd if no jobs exist
  if (mechanicJobs.length === 0) {
    console.log('No jobs found, creating test job for 2nd...');
    // Use the currently displayed month instead of current month
    const displayedYear = selectedDate.getFullYear();
    const displayedMonth = selectedDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const testDate = `${displayedYear}-${displayedMonth.toString().padStart(2, '0')}-02`; // 2nd of displayed month
    
    const testJob = {
      id: 'test-job-2nd',
      title: 'Test Job for 2nd',
      description: 'Test job scheduled for the 2nd',
      status: 'scheduled',
      scheduledDate: testDate, // 2nd of displayed month
      scheduledTime: '10:00 AM',
      price: 150,
      location: 'Test Location',
      customerName: 'Test Customer',
      urgency: 'medium' as const,
      serviceType: 'mobile',
      mechanicId: mechanicData.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerId: 'test-customer-id'
    };
    mechanicJobs.push(testJob);
    console.log('Added test job for displayed month date:', testDate, testJob);
  }
  
  const activeJobs = mechanicJobs.filter((job: any) => job.status === 'in_progress');
  const scheduledJobs = mechanicJobs.filter((job: any) => job.status === 'scheduled');
  const completedJobs = mechanicJobs.filter((job: any) => job.status === 'completed');
  const cancelledJobs = mechanicJobs.filter((job: any) => job.status === 'cancelled');
  
  // Calculate total earnings including change orders
  const totalEarnings = completedJobs.reduce((total, job) => {
    return total + calculateTotalJobCost(job);
  }, 0);
  
  console.log('Scheduled jobs:', scheduledJobs);

  // Stat cards data
  const statCards = [
    {
      id: 'active-jobs',
      title: 'Active',
      value: activeJobs.length,
      icon: 'build',
      color: '#10B981'
    },
    {
      id: 'scheduled-jobs',
      title: 'Scheduled',
      value: scheduledJobs.length,
      icon: 'schedule',
      color: '#3B82F6'
    },
    {
      id: 'completed-jobs',
      title: 'Done',
      value: completedJobs.length,
      icon: 'check-circle',
      color: '#8B5CF6'
    },
    {
      id: 'total-earnings',
      title: 'Earnings',
      value: `$${totalEarnings.toFixed(0)}`,
      icon: 'attach-money',
      color: '#F59E0B'
    },
    {
      id: 'rating',
      title: 'Rating',
      value: mechanicData.rating.toFixed(1),
      icon: 'star',
      color: '#EF4444'
    }
  ];


  // Calendar utility functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getJobsForDate = (date: Date) => {
    console.log('getJobsForDate called for:', date.toDateString());
    
    const filteredJobs = mechanicJobs.filter((job: any) => {
      if (!job.scheduledDate) {
        return false;
      }
      
      // Handle different date formats
      let jobDate;
      if (typeof job.scheduledDate === 'string') {
        // Handle YYYY-MM-DD format
        if (job.scheduledDate.includes('-')) {
          jobDate = new Date(job.scheduledDate);
        } else {
          jobDate = new Date(job.scheduledDate);
        }
      } else {
        jobDate = new Date(job.scheduledDate);
      }
      
      const matches = jobDate.toDateString() === date.toDateString();
      if (matches) {
        console.log(`Found job for ${date.toDateString()}:`, job);
      }
      return matches;
    });
    
    console.log('Filtered jobs for date:', filteredJobs);
    return filteredJobs;
  };


  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    console.log('Modal state changed:', { showDateModal, modalSelectedDate: modalSelectedDate?.toDateString() });
  }, [showDateModal, modalSelectedDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleFeaturePress = (feature: string) => {
    setSelectedFeature(feature);
    setShowFeaturePreview(true);
    hapticService.medium();
  };


  const handleDatePress = (date: Date) => {
    console.log('Date pressed:', date.toDateString());
    setModalSelectedDate(date);
    setShowDateModal(true);
    hapticService.light();
  };

  const closeDateModal = () => {
    setShowDateModal(false);
    setModalSelectedDate(null);
  };


  // Stat Card Component
  const StatCard = ({ 
    card, 
    theme 
  }: {
    card: any;
    theme: any;
  }) => {
    return (
      <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
        <View style={[styles.statIconContainer, { backgroundColor: card.color + '20' }]}>
          <MaterialIcons name={card.icon} size={16} color={card.color} />
        </View>
        <Text style={[styles.statValue, { color: theme.text }]}>{card.value}</Text>
        <Text style={[styles.statTitle, { color: theme.textSecondary }]}>{card.title}</Text>
      </View>
    );
  };

  // Calendar Day Component
  const CalendarDay = ({ 
    day, 
    selectedDate, 
    onDateSelect, 
    jobs, 
    theme 
  }: {
    day: Date | null;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    jobs: any[];
    theme: any;
  }) => {
    if (!day) {
      return <View style={styles.calendarDay} />;
    }

    const isSelected = day.toDateString() === selectedDate.toDateString();
    const isToday = day.toDateString() === new Date().toDateString();
    const hasJobs = jobs.length > 0;
    const hasUrgentJobs = jobs.some((job: any) => job.urgency === 'high');

    return (
      <TouchableOpacity
        style={[
          styles.calendarDay,
          isSelected && { backgroundColor: theme.primary },
          isToday && !isSelected && { backgroundColor: theme.primary + '20' }
        ]}
        onPress={() => handleDatePress(day)}
      >
        <Text style={[
          styles.dayNumber,
          { 
            color: isSelected ? theme.onPrimary : 
                   isToday ? theme.primary : theme.text 
          }
        ]}>
          {day.getDate()}
        </Text>
        {hasJobs && (
          <View style={styles.jobIndicators}>
            {hasUrgentJobs && (
              <View style={[styles.urgentIndicator, { backgroundColor: theme.error }]} />
            )}
            <View style={[
              styles.jobIndicator, 
              { backgroundColor: isSelected ? theme.onPrimary : theme.primary }
            ]} />
          </View>
        )}
      </TouchableOpacity>
    );
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name || 'Mechanic'}`}
        user={user}
        onProfilePress={() => navigation.navigate('UnifiedProfile')}
        onNotificationPress={() => navigation.navigate('Notifications')}
        showNotifications={true}
        showStatusBar={false}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards Horizontal Scroll */}
        <View style={styles.statsSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContent}
            style={styles.statsScrollView}
          >
            {statCards.map((card) => (
              <StatCard key={card.id} card={card} theme={theme} />
            ))}
          </ScrollView>
        </View>

        {/* Calendar Header */}
        <View style={styles.calendarHeader}>
          <View style={styles.calendarTitleRow}>
            <Text style={[styles.calendarTitle, { color: theme.text }]}>
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <View style={styles.calendarControls}>
              <TouchableOpacity
                style={[styles.calendarButton, { backgroundColor: theme.surface }]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
              >
                <MaterialIcons name="chevron-left" size={20} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.calendarButton, { backgroundColor: theme.surface }]}
                onPress={() => setSelectedDate(new Date())}
              >
                <Text style={[styles.todayButton, { color: theme.primary }]}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.calendarButton, { backgroundColor: theme.surface }]}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
              >
                <MaterialIcons name="chevron-right" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Interactive Calendar */}
        <View style={[styles.calendarContainer, { backgroundColor: theme.cardBackground }]}>
          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={[styles.dayHeader, { color: theme.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {getDaysInMonth(selectedDate).map((day, index) => (
              <CalendarDay
                key={index}
                day={day}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                jobs={day ? getJobsForDate(day) : []}
                theme={theme}
              />
            ))}
          </View>
        </View>


      </ScrollView>

      {/* Feature Preview Modal */}
      <Modal
        visible={showFeaturePreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFeaturePreview(false)}
      >
        <View style={styles.modalOverlay}>
          <FeaturePreview
            feature={selectedFeature}
            requiredTier="premium"
            description={`This feature is available in the ${selectedFeature} plan.`}
            onUpgrade={undefined}
          >
            <Text style={{ color: theme.text }}>Feature Preview</Text>
          </FeaturePreview>
        </View>
      </Modal>

      {/* Date Jobs Modal */}
      <DateJobsModal
        visible={showDateModal}
        selectedDate={modalSelectedDate}
        jobs={mechanicJobs}
        onClose={closeDateModal}
        onJobPress={(jobId: string) => {
          // Navigate to Jobs tab and pass jobId to auto-select the job
          navigation.navigate('Jobs', { jobId });
        }}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40, // Extra padding to ensure full scroll
  },
  // Stats Section
  statsSection: {
    marginBottom: 16,
  },
  statsScrollView: {
    marginTop: 0,
  },
  statsScrollContent: {
    paddingHorizontal: 0,
    paddingRight: 12,
  },
  statCard: {
    width: 80,
    padding: 8,
    borderRadius: 8,
    marginRight: 6,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: '500',
  },
  // Calendar Header
  calendarHeader: {
    marginBottom: 20,
  },
  calendarTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  calendarControls: {
    flexDirection: 'row',
    gap: 8,
  },
  calendarButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  todayButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Calendar
  calendarContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 2, // Small padding to match calendar day spacing
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 0,
  },
  calendarDay: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1, // Make it square
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
    marginHorizontal: 0, // No horizontal margin to maintain alignment
    position: 'relative',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  jobIndicators: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    transform: [{ translateX: -4 }], // Center the indicators (adjusted for smaller width)
    flexDirection: 'row',
    gap: 2,
  },
  jobIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  urgentIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MechanicDashboard;
