import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import IconFallback from './IconFallback';
import { FadeIn } from './Animations';

const ChangeOrderCard = ({ 
  changeOrder, 
  onPress, 
  showStatus = true,
  compact = false 
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const getStatusColor = (status) => {
    const colors = {
      pending: theme.warning,
      approved: theme.success,
      rejected: theme.error,
      cancelled: theme.textSecondary,
      escrow: theme.accent,
      paid: theme.success,
      expired: theme.textSecondary
    };
    return colors[status] || theme.textSecondary;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'schedule',
      approved: 'check-circle',
      rejected: 'cancel',
      cancelled: 'close',
      escrow: 'account-balance-wallet',
      paid: 'payment',
      expired: 'schedule'
    };
    return icons[status] || 'info';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: theme.success,
      normal: theme.info,
      high: theme.warning,
      urgent: theme.error
    };
    return colors[urgency] || theme.info;
  };

  const getUrgencyIcon = (urgency) => {
    const icons = {
      low: 'schedule',
      normal: 'info',
      high: 'warning',
      urgent: 'error'
    };
    return icons[urgency] || 'info';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = () => {
    if (!changeOrder.expiresAt) return false;
    return new Date(changeOrder.expiresAt) < new Date();
  };

  return (
    <FadeIn>
      <TouchableOpacity
        style={[
          styles.container,
          { 
            backgroundColor: theme.cardBackground,
            borderColor: isExpired() ? theme.error : getStatusColor(changeOrder.status)
          }
        ]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {changeOrder.title}
            </Text>
            {changeOrder.requiresImmediateApproval && (
              <View style={[styles.urgentBadge, { backgroundColor: theme.warning }]}>
                <IconFallback name="warning" size={10} color={theme.white} />
              </View>
            )}
          </View>
          
          {showStatus && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(changeOrder.status) + '20' }
            ]}>
              <IconFallback 
                name={getStatusIcon(changeOrder.status)} 
                size={12} 
                color={getStatusColor(changeOrder.status)} 
              />
              <Text style={[
                styles.statusText,
                { color: getStatusColor(changeOrder.status) }
              ]}>
                {changeOrder.status ? changeOrder.status.toUpperCase() : 'UNKNOWN'}
              </Text>
            </View>
          )}
        </View>

        {!compact && (
          <>
            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
              {changeOrder.description}
            </Text>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Amount:</Text>
                <Text style={[styles.detailValue, { color: theme.accent, fontWeight: 'bold' }]}>
                  ${(changeOrder.totalAmount || 0).toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Priority:</Text>
                <View style={styles.priorityRow}>
                  <IconFallback 
                    name={getUrgencyIcon(changeOrder.urgency)} 
                    size={10} 
                    color={getUrgencyColor(changeOrder.urgency)} 
                  />
                  <Text style={[
                    styles.priorityText,
                    { color: getUrgencyColor(changeOrder.urgency) }
                  ]}>
                    {changeOrder.urgency ? changeOrder.urgency.toUpperCase() : 'UNKNOWN'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                {formatDate(changeOrder.createdAt)}
              </Text>
              
              {changeOrder.expiresAt && (
                <Text style={[
                  styles.expiryText,
                  { 
                    color: isExpired() ? theme.error : theme.textSecondary 
                  }
                ]}>
                  Expires: {formatDate(changeOrder.expiresAt)}
                </Text>
              )}
            </View>
          </>
        )}

        {compact && (
          <View style={styles.compactFooter}>
            <Text style={[styles.compactAmount, { color: theme.accent }]}>
              ${(changeOrder.totalAmount || 0).toFixed(2)}
            </Text>
            <Text style={[styles.compactDate, { color: theme.textSecondary }]}>
              {formatDate(changeOrder.createdAt)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </FadeIn>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  urgentBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10,
  },
  expiryText: {
    fontSize: 10,
    fontWeight: '500',
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  compactAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactDate: {
    fontSize: 10,
  },
});

export default ChangeOrderCard;

