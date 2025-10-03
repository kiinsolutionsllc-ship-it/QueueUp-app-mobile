import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import { useJob } from '../../contexts/SimplifiedJobContext';
import MaterialButton from '../shared/MaterialButton';
import MaterialCard from '../shared/MaterialCard';
import IconFallback from '../shared/IconFallback';

interface BidComparisonModalProps {
  visible: boolean;
  onClose: () => void;
  selectedJob: any;
  bids: any[];
}

export default function BidComparisonModal({ 
  visible, 
  onClose, 
  selectedJob, 
  bids = [] 
}: BidComparisonModalProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const { user } = useAuth();
  const { acceptBid, rejectBid } = useJob();
  
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Reset selected bid when modal opens/closes
  useEffect(() => {
    if (visible) {
      setSelectedBid(null);
    }
  }, [visible]);

  const handleAcceptBid = async (bid: any) => {
    if (!bid) return;

    Alert.alert(
      'Accept Bid',
      `Are you sure you want to accept this bid of $${bid.price}${bid.bidType === 'hourly' ? '/hour' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await acceptBid(bid.id);
              if (result.success) {
                Alert.alert('Success', 'Bid accepted successfully!');
                onClose();
              } else {
                Alert.alert('Error', result.error || 'Failed to accept bid');
              }
            } catch (error) {
              console.error('Error accepting bid:', error);
              Alert.alert('Error', 'Network error. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRejectBid = async (bid: any) => {
    if (!bid) return;

    Alert.alert(
      'Reject Bid',
      'Are you sure you want to reject this bid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await rejectBid(bid.id);
              if (result.success) {
                Alert.alert('Success', 'Bid rejected');
                onClose();
              } else {
                Alert.alert('Error', result.error || 'Failed to reject bid');
              }
            } catch (error) {
              console.error('Error rejecting bid:', error);
              Alert.alert('Error', 'Network error. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Add refresh logic here if needed
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateTotalCost = (bid: any) => {
    if (bid.bidType === 'hourly' && bid.estimatedDuration) {
      return (bid.price * bid.estimatedDuration / 60).toFixed(2);
    }
    return bid.price.toFixed(2);
  };

  if (!visible || !selectedJob) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={theme.statusBarStyle as any}
          backgroundColor={theme.background}
          translucent={false}
        />
        
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.divider }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconFallback name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Compare Bids</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Job Info */}
        <View style={[styles.jobInfo, { backgroundColor: theme.surface }]}>
          <Text style={[styles.jobTitle, { color: theme.text }]} numberOfLines={2}>
            {selectedJob.title}
          </Text>
          <Text style={[styles.jobCategory, { color: theme.textSecondary }]}>
            {selectedJob.category}
          </Text>
        </View>

        {/* Bids List */}
        <ScrollView
          style={styles.bidsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Processing...
              </Text>
            </View>
          ) : bids.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconFallback name="inbox" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No bids received yet
              </Text>
            </View>
          ) : (
            bids.map((bid, index) => (
              <MaterialCard key={bid.id || index} style={styles.bidCard}>
                <View style={styles.bidHeader}>
                  <View style={styles.bidInfo}>
                    <Text style={[styles.mechanicName, { color: theme.text }]}>
                      {bid.mechanicName || 'Unknown Mechanic'}
                    </Text>
                    <Text style={[styles.bidDate, { color: theme.textSecondary }]}>
                      {formatDate(bid.createdAt || new Date().toISOString())}
                    </Text>
                  </View>
                  <View style={styles.bidStatus}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: bid.status === 'accepted' ? theme.success : theme.warning }
                    ]}>
                      <Text style={[styles.statusText, { color: 'white' }]}>
                        {bid.status || 'pending'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.bidDetails}>
                  <View style={styles.priceSection}>
                    <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>
                      {bid.bidType === 'hourly' ? 'Hourly Rate' : 'Total Price'}
                    </Text>
                    <Text style={[styles.priceValue, { color: theme.primary }]}>
                      ${bid.price}{bid.bidType === 'hourly' ? '/hr' : ''}
                    </Text>
                  </View>

                  {bid.bidType === 'hourly' && bid.estimatedDuration && (
                    <View style={styles.durationSection}>
                      <Text style={[styles.durationLabel, { color: theme.textSecondary }]}>
                        Estimated Duration
                      </Text>
                      <Text style={[styles.durationValue, { color: theme.text }]}>
                        {bid.estimatedDuration} minutes
                      </Text>
                    </View>
                  )}

                  <View style={styles.totalSection}>
                    <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                      Total Cost
                    </Text>
                    <Text style={[styles.totalValue, { color: theme.success }]}>
                      ${calculateTotalCost(bid)}
                    </Text>
                  </View>
                </View>

                {bid.message && (
                  <View style={styles.messageSection}>
                    <Text style={[styles.messageLabel, { color: theme.textSecondary }]}>
                      Message
                    </Text>
                    <Text style={[styles.messageText, { color: theme.text }]}>
                      {bid.message}
                    </Text>
                  </View>
                )}

                {bid.status !== 'accepted' && bid.status !== 'rejected' && (
                  <View style={styles.bidActions}>
                    <MaterialButton
                      title="Reject"
                      onPress={() => handleRejectBid(bid)}
                      style={[styles.rejectButton, { borderColor: theme.error }]}
                      textStyle={{ color: theme.error }}
                      disabled={isLoading}
                    />
                    <MaterialButton
                      title="Accept"
                      onPress={() => handleAcceptBid(bid)}
                      style={[styles.acceptButton, { backgroundColor: theme.primary }]}
                      textStyle={{ color: 'white' }}
                      disabled={isLoading}
                    />
                  </View>
                )}
              </MaterialCard>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  placeholder: {
    width: 40,
  },
  jobInfo: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  jobCategory: {
    fontSize: 14,
  },
  bidsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bidCard: {
    marginBottom: 16,
    padding: 16,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bidInfo: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bidDate: {
    fontSize: 12,
  },
  bidStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bidDetails: {
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  durationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationLabel: {
    fontSize: 14,
  },
  durationValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  messageSection: {
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bidActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  acceptButton: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});
