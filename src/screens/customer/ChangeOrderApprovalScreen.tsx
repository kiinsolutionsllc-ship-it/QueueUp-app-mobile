import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import { useJob } from '../../contexts/SimplifiedJobContext';
import IconFallback from '../../components/shared/IconFallback';
import MaterialButton from '../../components/shared/MaterialButton';
import { FadeIn } from '../../components/shared/Animations';
import ChangeOrderService from '../../services/ChangeOrderService';
import UnifiedJobService from '../../services/UnifiedJobService';
import { hapticService } from '../../services/HapticService';

const ChangeOrderApprovalScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { getJob } = useJob();
  const theme = getCurrentTheme();

  const { changeOrderId } = route.params;
  const [modalVisible, setModalVisible] = useState<any>(true);
  const [changeOrder, setChangeOrder] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState<any>(true);
  const [refreshing, setRefreshing] = useState<any>(false);
  const [processing, setProcessing] = useState<any>(false);
  const [rejectionReason, setRejectionReason] = useState<any>('');

  const loadChangeOrderData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get change order details from UnifiedJobService to ensure we have the latest data
      const allData = UnifiedJobService.getAllData();
      const order = allData.changeOrders?.find(co => co.id === changeOrderId);
      
      console.log('ChangeOrderApprovalScreen - Looking for change order:', changeOrderId);
      console.log('ChangeOrderApprovalScreen - Available change orders:', allData.changeOrders?.length || 0);
      console.log('ChangeOrderApprovalScreen - Change order IDs:', allData.changeOrders?.map(co => co.id) || []);
      console.log('ChangeOrderApprovalScreen - Found order:', order ? 'Yes' : 'No');
      
      if (order) {
        setChangeOrder(order);
        
        // Get job details
        const jobData = getJob(order.jobId);
        setJob(jobData);
      } else {
        Alert.alert('Error', 'Change order not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading change order data:', error);
      Alert.alert('Error', 'Failed to load change order information');
    } finally {
      setLoading(false);
    }
  }, [changeOrderId]);

  useEffect(() => {
    loadChangeOrderData();
  }, [changeOrderId, loadChangeOrderData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChangeOrderData();
    setRefreshing(false);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  const handleApprove = () => {
    Alert.alert(
      'Approve Change Order',
      `Are you sure you want to approve this change order for $${(changeOrder.totalAmount || 0).toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: processApproval
        }
      ]
    );
  };

  const processApproval = async () => {
    await hapticService.buttonPress();
    setProcessing(true);

    try {
      // Use UnifiedJobService to approve change order - this will automatically update job status
      const result = await UnifiedJobService.approveChangeOrder(
        changeOrderId, 
        user?.id || 'customer1'
      );

      if (result.success) {
        Alert.alert(
          'Change Order Approved',
          'The mechanic has been notified and can proceed with the additional work.',
          [
            {
              text: 'OK',
              onPress: () => handleCloseModal()
            }
          ]
        );
      } else {
        throw new Error(result.error || 'Failed to approve change order');
      }
    } catch (error) {
      console.error('Error approving change order:', error);
      Alert.alert('Error', 'Failed to approve change order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Change Order',
      'Please provide a reason for rejecting this change order:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => showRejectionReasonModal()
        }
      ]
    );
  };

  const showRejectionReasonModal = () => {
    Alert.prompt(
      'Rejection Reason',
      'Please explain why you are rejecting this change order:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: (reason: any) => processRejection(reason || 'No reason provided')
        }
      ],
      'plain-text',
      rejectionReason
    );
  };

  const processRejection = async (reason: any) => {
    await hapticService.buttonPress();
    setProcessing(true);

    try {
      // Use UnifiedJobService to reject change order - this will automatically update job status
      const result = await UnifiedJobService.rejectChangeOrder(
        changeOrderId,
        user?.id || 'customer1',
        reason
      );

      if (result.success) {
        Alert.alert(
          'Change Order Rejected',
          'The mechanic has been notified of your decision.',
          [
            {
              text: 'OK',
              onPress: () => handleCloseModal()
            }
          ]
        );
      } else {
        throw new Error(result.error || 'Failed to reject change order');
      }
    } catch (error) {
      console.error('Error rejecting change order:', error);
      Alert.alert('Error', 'Failed to reject change order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };


  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = () => {
    if (!changeOrder?.expiresAt) return false;
    return new Date(changeOrder.expiresAt) < new Date();
  };

  if (loading) {
    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.loadingContainer}>
            <IconFallback name="build" size={48} color={theme.accent} />
            <Text style={[styles.loadingText, { color: theme.text }]}>
              Loading change order...
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  if (!changeOrder || !job) {
    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.errorContainer}>
            <IconFallback name="error" size={48} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.text }]}>
              Change order not found
            </Text>
            <MaterialButton
              title="Go Back"
              onPress={handleCloseModal}
              style={styles.errorButton}
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCloseModal}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.statusBarStyle as any} backgroundColor={theme.background} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Compact Header */}
        <FadeIn>
          <View style={styles.compactHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCloseModal}
            >
              <IconFallback name="arrow-back" size={20} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Change Order
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                {job.title}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: isExpired() 
                  ? theme.error + '20' 
                  : changeOrder.requiresImmediateApproval 
                    ? theme.warning + '20'
                    : theme.info + '20'
              }
            ]}>
              <IconFallback 
                name={isExpired() ? 'schedule' : changeOrder.requiresImmediateApproval ? 'warning' : 'info'} 
                size={12} 
                color={isExpired() ? theme.error : changeOrder.requiresImmediateApproval ? theme.warning : theme.info} 
              />
              <Text style={[
                styles.statusBadgeText,
                { 
                  color: isExpired() 
                    ? theme.error 
                    : changeOrder.requiresImmediateApproval 
                      ? theme.warning
                      : theme.info
                }
              ]}>
                {isExpired() 
                  ? 'Expired' 
                  : changeOrder.requiresImmediateApproval 
                    ? 'Urgent'
                    : 'Pending'
                }
              </Text>
            </View>
          </View>
        </FadeIn>

        {/* Change Order Details */}
        <FadeIn delay={100}>
          <View style={[styles.detailsCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.detailsHeader}>
              <Text style={[styles.detailsTitle, { color: theme.text }]}>
                {changeOrder.title}
              </Text>
            </View>

            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {changeOrder.description}
            </Text>

            <View style={styles.reasonSection}>
              <Text style={[styles.reasonLabel, { color: theme.text }]}>
                Reason for Additional Work:
              </Text>
              <Text style={[styles.reasonText, { color: theme.textSecondary }]}>
                {changeOrder.reason}
              </Text>
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Requested by:</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {changeOrder.mechanicName || 'Mechanic'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Requested on:</Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {formatDate(changeOrder.createdAt)}
                </Text>
              </View>
            </View>

            {changeOrder.expiresAt && (
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Expires:</Text>
                <Text style={[
                  styles.detailValue,
                  { 
                    color: isExpired() ? theme.error : theme.textSecondary 
                  }
                ]}>
                  {formatDate(changeOrder.expiresAt)}
                </Text>
              </View>
            )}
          </View>
        </FadeIn>


        {/* Summary Card - Shows cost breakdown */}
        <FadeIn delay={300}>
          <View style={[styles.summaryCard, { 
            backgroundColor: theme.success + '15', 
            borderColor: theme.success + '40',
            borderWidth: 2
          }]}>
            <View style={styles.summaryHeader}>
              <IconFallback name="check-circle" size={20} color={theme.success} />
              <Text style={[styles.summaryTitle, { color: theme.success }]}>
                Cost Summary
              </Text>
            </View>
            
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Additional Work:
                </Text>
                <Text style={[styles.summaryValue, { color: theme.text }]} numberOfLines={2}>
                  {changeOrder.description}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Original Job Cost:
                </Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  ${(job.estimatedCost || 0).toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Additional Cost:
                </Text>
                <Text style={[styles.summaryValue, { color: theme.warning, fontWeight: '600' }]}>
                  ${(changeOrder.totalAmount || 0).toFixed(2)}
                </Text>
              </View>
              
              <View style={[styles.summaryRow, { borderTopColor: theme.border, borderTopWidth: 1, paddingTop: 8, marginTop: 4 }]}>
                <Text style={[styles.summaryLabel, { color: theme.text, fontWeight: '600' }]}>
                  Total Cost:
                </Text>
                <Text style={[styles.summaryValue, { color: theme.success, fontWeight: 'bold', fontSize: 18 }]}>
                  ${((job.estimatedCost || 0) + (changeOrder.totalAmount || 0)).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </FadeIn>
      </ScrollView>

      {/* Action Buttons */}
      {changeOrder.status === 'pending' && !isExpired() && (
        <View style={[styles.actionButtons, { backgroundColor: theme.background }]}>
          <MaterialButton
            title="Reject"
            onPress={handleReject}
            variant="outline"
            loading={processing}
            disabled={processing}
            style={[styles.actionButton, { borderColor: theme.error }]}
            textStyle={{ color: theme.error }}
          />
          <MaterialButton
            title="Approve"
            onPress={handleApprove}
            loading={processing}
            disabled={processing}
            style={[styles.actionButton, styles.approveButton]}
          />
        </View>
      )}

      {changeOrder.status !== 'pending' && (
        <View style={[styles.statusButtons, { backgroundColor: theme.background }]}>
          <View style={[
            styles.statusIndicator,
            { 
              backgroundColor: changeOrder.status === 'approved' 
                ? theme.success + '20' 
                : theme.error + '20'
            }
          ]}>
            <IconFallback 
              name={changeOrder.status === 'approved' ? 'check-circle' : 'cancel'} 
              size={16} 
              color={changeOrder.status === 'approved' ? theme.success : theme.error} 
            />
            <Text style={[
              styles.statusIndicatorText,
              { 
                color: changeOrder.status === 'approved' 
                  ? theme.success 
                  : theme.error
              }
            ]}>
              {changeOrder.status === 'approved' ? 'Approved' : 'Rejected'}
            </Text>
          </View>
        </View>
      )}

      {isExpired() && (
        <View style={[styles.statusButtons, { backgroundColor: theme.background }]}>
          <View style={[styles.statusIndicator, { backgroundColor: theme.error + '20' }]}>
            <IconFallback name="schedule" size={16} color={theme.error} />
            <Text style={[styles.statusIndicatorText, { color: theme.error }]}>
              Expired
            </Text>
          </View>
        </View>
      )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 120, // Extra space for modal buttons
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 24,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '600',
  },
  detailsCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  reasonSection: {
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 12,
    lineHeight: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    marginBottom: 1,
  },
  detailValue: {
    fontSize: 10,
    fontWeight: '500',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryContent: {
    marginTop: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flex: 1,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  statusButtons: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
  },
  statusIndicatorText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChangeOrderApprovalScreen;

