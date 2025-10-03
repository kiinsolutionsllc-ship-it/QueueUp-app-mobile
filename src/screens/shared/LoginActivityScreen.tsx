import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';


interface LoginActivityScreenProps {
  navigation: any;
}
export default function LoginActivityScreen({ navigation }: LoginActivityScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();
  const [refreshing, setRefreshing] = useState<any>(false);
  const [loginHistory, setLoginHistory] = useState<any>([]);

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const loadLoginHistory = async () => {
    // Simulate API call to fetch login history
    const mockHistory = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        device: 'iPhone 14 Pro',
        location: 'New York, NY',
        ipAddress: '192.168.1.100',
        status: 'success',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        device: 'Samsung Galaxy S23',
        location: 'New York, NY',
        ipAddress: '192.168.1.101',
        status: 'success',
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B)',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        device: 'MacBook Pro',
        location: 'San Francisco, CA',
        ipAddress: '203.0.113.1',
        status: 'success',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        device: 'iPhone 13',
        location: 'Los Angeles, CA',
        ipAddress: '198.51.100.1',
        status: 'failed',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X)',
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        device: 'Windows PC',
        location: 'Chicago, IL',
        ipAddress: '203.0.113.2',
        status: 'success',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    ];
    
    setLoginHistory(mockHistory);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoginHistory();
    setRefreshing(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? 'check-circle' : 'error';
  };

  const getStatusColor = (status) => {
    return status === 'success' ? theme.success : theme.error;
  };

  const renderLoginActivity = ({ item }) => (
    <MaterialCard style={[styles.activityCard, { backgroundColor: theme.surface }]}>
      <View style={styles.activityHeader}>
        <View style={styles.statusContainer}>
          <IconFallback name={getStatusIcon(item.status)} size={20} color={getStatusColor(item.status)} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status === 'success' ? 'Successful' : 'Failed'}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: theme.textSecondary }]}>
          {formatDate(item.timestamp)}
        </Text>
      </View>

      <View style={styles.activityDetails}>
        <View style={styles.detailRow}>
          <IconFallback name="smartphone" size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.text }]}>{item.device}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <IconFallback name="location-on" size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.text }]}>{item.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <IconFallback name="wifi" size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.text }]}>{item.ipAddress}</Text>
        </View>
      </View>

      {item.status === 'failed' && (
        <View style={[styles.failedReason, { backgroundColor: theme.error + '10' }]}>
          <Text style={[styles.failedText, { color: theme.error }]}>
            Failed login attempt - incorrect password
          </Text>
        </View>
      )}
    </MaterialCard>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconFallback name="history" size={48} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No Login History</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Your login activity will appear here
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Login Activity"
        onBackPress={() => navigation.goBack()}
        showBack
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Recent Login Activity
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Monitor your account security by reviewing recent login attempts
          </Text>
        </View>

        <FlatList
          data={loginHistory}
          renderItem={renderLoginActivity}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  activityCard: {
    marginBottom: 12,
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  activityDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  failedReason: {
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  failedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
