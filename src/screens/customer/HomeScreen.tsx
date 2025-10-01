import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialButton from '../../components/shared/MaterialButton';
import MaterialCard from '../../components/shared/MaterialCard';

interface HomeScreenProps {
  navigation: any;
}


const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [greeting, setGreeting] = useState<string>('');



  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleCreateJob = () => {
    navigation.navigate('CreateJob');
  };

  const handleViewJobs = () => {
    navigation.navigate('Jobs');
  };

  const handleViewMessages = () => {
    navigation.navigate('Messaging');
  };


  const QuickActionCard = ({ 
    title, 
    icon, 
    color, 
    onPress 
  }: {
    title: string;
    icon: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.quickActionCard, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <IconFallback name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.quickActionTitle, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title={`${greeting}, ${user?.name || 'Customer'}!`}
        user={user}
        onProfilePress={() => navigation.navigate('Profile')}
        onNotificationPress={() => navigation.navigate('Notifications')}
        showNotifications={true}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Need Car Service CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: theme.primary }]}
            onPress={handleCreateJob}
            activeOpacity={0.8}
          >
            <View style={styles.ctaContent}>
              <View style={styles.ctaIcon}>
                <IconFallback name="directions-car" size={32} color="white" />
              </View>
              <View style={styles.ctaText}>
                <Text style={styles.ctaTitle}>Need Car Service?</Text>
                <Text style={styles.ctaSubtitle}>Get quotes from trusted mechanics near you</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="My Garage"
              icon="directions-car"
              color={theme.primary}
              onPress={() => navigation.navigate('VehicleDashboard')}
            />
            <QuickActionCard
              title="My Records"
              icon="history"
              color={theme.success}
              onPress={() => navigation.navigate('CustomerAnalytics')}
            />
            <QuickActionCard
              title="Find Mechanics"
              icon="search"
              color={theme.warning}
              onPress={() => navigation.navigate('Explore')}
            />
            <QuickActionCard
              title="My Requests"
              icon="work"
              color={theme.accent}
              onPress={handleViewJobs}
            />
            <QuickActionCard
              title="My Favorites"
              icon="favorite"
              color="#DC2626"
              onPress={() => navigation.navigate('Favorites')}
            />
            <QuickActionCard
              title="Compare Bids"
              icon="compare"
              color="#7C3AED"
              onPress={() => navigation.navigate('BidComparison')}
            />
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
    paddingBottom: 120,
  },
  ctaSection: {
    marginBottom: 24,
  },
  ctaButton: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickActionCard: {
    width: '48%',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
});

export default HomeScreen;
