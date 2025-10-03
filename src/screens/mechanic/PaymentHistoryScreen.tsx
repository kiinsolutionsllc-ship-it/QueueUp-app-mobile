import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
import { usePayment } from '../../contexts/PaymentContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';


interface PaymentHistoryScreenProps {
  navigation: any;
}
export default function PaymentHistoryScreen({ navigation }: PaymentHistoryScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { 
    payments, 
    loading, 
    loadPayments, 
    getMechanicEarnings
  } = usePayment();
  const theme = getCurrentTheme();

  const [refreshing, setRefreshing] = useState<any>(false);
  const [selectedTab, setSelectedTab] = useState<any>('payments'); // payments only
  const [selectedPeriod, setSelectedPeriod] = useState<any>('all'); // all, week, month, year
  const [showFilters, setShowFilters] = useState<any>(false);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const mechanicId = getFallbackUserIdWithTypeDetection(user?.id, user?.user_type);
  const mechanicPayments = getMechanicEarnings(mechanicId, selectedPeriod);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: any) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'completed':
        return theme.success;
      case 'escrow':
        return theme.warning;
      case 'disputed':
        return theme.error;
      case 'refunded':
        return theme.textSecondary;
      case 'processing_payout':
        return theme.info;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'escrow':
        return 'schedule';
      case 'disputed':
        return 'error';
      case 'refunded':
        return 'undo';
      case 'processing_payout':
        return 'sync';
      default:
        return 'help';
    }
  };


  const periodOptions = [
    { key: 'all', label: 'All Time' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
  ];

  const renderPaymentCard = (payment: any) => (
    <MaterialCard
      key={payment.id}
      style={[styles.paymentCard, { backgroundColor: theme.cardBackground }]}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={[styles.paymentDescription, { color: theme.text }]}>
            {payment.description}
          </Text>
          <Text style={[styles.paymentDate, { color: theme.textSecondary }]}>
            {formatDate(payment.createdAt)} at {formatTime(payment.createdAt)}
          </Text>
          <Text style={[styles.jobId, { color: theme.textSecondary }]}>
            Job #{payment.jobId}
          </Text>
        </View>
        
        <View style={styles.paymentAmount}>
          <Text style={[styles.amount, { color: theme.text }]}>
            ${(payment.mechanicAmount || 0).toFixed(2)}
          </Text>
          <View style={styles.statusContainer}>
            <IconFallback
              name={getStatusIcon(payment.status)}
              size={16}
              color={getStatusColor(payment.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(payment.status) },
              ]}
            >
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1).replace('_', ' ')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            Total Amount:
          </Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            ${(payment.amount || 0).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            Platform Fee:
          </Text>
          <Text style={[styles.detailValue, { color: theme.textSecondary }]}>
            -${(payment.platformFee || 0).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            Payment Method:
          </Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1)}
          </Text>
        </View>

        {payment.completedAt && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Completed:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formatDate(payment.completedAt)} at {formatTime(payment.completedAt)}
            </Text>
          </View>
        )}

        {payment.transactionId && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Transaction ID:
            </Text>
            <Text style={[styles.detailValue, { color: theme.textSecondary }]}>
              {payment.transactionId}
            </Text>
          </View>
        )}
      </View>
    </MaterialCard>
  );


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Payment History"
        subtitle="View all your payments"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          {
            icon: 'filter-list',
            onPress: () => setShowFilters(!showFilters),
            color: theme.primary,
          },
        ]}
        showNotifications={true}
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile={true}
        profileAvatar={user?.avatar || user?.name || '👨‍🔧'}
        user={user}
        onProfilePress={() => navigation.navigate('MechanicProfile')}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Period Filter */}
        {showFilters && (
          <View style={[styles.filterContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.filterTitle, { color: theme.text }]}>Time Period</Text>
            <View style={styles.periodButtons}>
              {periodOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor: selectedPeriod === option.key ? theme.primary : theme.surface,
                    },
                  ]}
                  onPress={() => setSelectedPeriod(option.key)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      {
                        color: selectedPeriod === option.key ? theme.onPrimary : theme.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Payment History ({mechanicPayments.length})
          </Text>
          
          {mechanicPayments.length === 0 ? (
            <MaterialCard style={[styles.emptyCard, { backgroundColor: theme.cardBackground }]}>
              <IconFallback name="receipt" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No payments found for this period
              </Text>
            </MaterialCard>
          ) : (
            mechanicPayments.map(renderPaymentCard)
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  filterContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 12,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  jobId: {
    fontSize: 12,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  paymentDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});
