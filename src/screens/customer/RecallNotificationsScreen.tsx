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
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../../hooks/useResponsive';
import { Heading3, Heading4 } from '../../components/shared/ResponsiveText';
import { ResponsiveContainer } from '../../components/shared/ResponsiveSpacing';
import { hapticService } from '../../services/HapticService';


interface RecallNotificationsScreenProps {
  navigation: any;
}
export default function RecallNotificationsScreen({ navigation }: RecallNotificationsScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const theme = getCurrentTheme();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const [isRefreshing, setIsRefreshing] = useState<any>(false);
  const [loading, setLoading] = useState<any>(false);

  // Mock recall data for user's vehicles
  const [recalls] = useState<any>([
    {
      id: '1',
      vehicleId: '1',
      vehicleInfo: '2020 Vehicle',
      title: 'Airbag Inflator Recall',
      description: 'Honda has issued a recall for airbag inflators that may rupture during deployment, increasing the risk of injury.',
      severity: 'high',
      date: '2024-01-20',
      actionRequired: true,
      recallNumber: 'NHTSA-24-001',
      manufacturer: 'Manufacturer',
      affectedVehicles: '2019-2021 Honda Civic',
      remedy: 'Free replacement of airbag inflators at authorized Honda dealers',
      estimatedRepairTime: '2-3 hours',
      contactInfo: '1-800-999-1009',
    },
    {
      id: '2',
      vehicleId: '2',
      vehicleInfo: '2019 Vehicle',
      title: 'Software Update Available',
      description: 'Toyota has released a software update for the infotainment system to improve performance and fix minor bugs.',
      severity: 'low',
      date: '2024-01-18',
      actionRequired: false,
      recallNumber: 'NHTSA-24-002',
      manufacturer: 'Manufacturer',
      affectedVehicles: '2018-2020 Toyota Camry',
      remedy: 'Free software update at authorized Toyota dealers',
      estimatedRepairTime: '30 minutes',
      contactInfo: '1-800-331-4331',
    },
    {
      id: '3',
      vehicleId: '1',
      vehicleInfo: '2020 Vehicle',
      title: 'Brake Booster Recall',
      description: 'Potential issue with brake booster that may reduce braking effectiveness in certain conditions.',
      severity: 'medium',
      date: '2024-01-15',
      actionRequired: true,
      recallNumber: 'NHTSA-24-003',
      manufacturer: 'Manufacturer',
      affectedVehicles: '2020 Honda Civic',
      remedy: 'Free inspection and replacement if necessary',
      estimatedRepairTime: '1-2 hours',
      contactInfo: '1-800-999-1009',
    },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleRecallPress = (recall) => {
    Alert.alert(
      recall.title,
      `${recall.description}\n\nRecall Number: ${recall.recallNumber}\nContact: ${recall.contactInfo}`,
      [
        { text: 'Dismiss', style: 'cancel' },
        { text: 'Schedule Repair', onPress: () => handleScheduleRepair(recall) },
        { text: 'Learn More', onPress: () => handleLearnMore(recall) }
      ]
    );
  };

  const handleScheduleRepair = (recall) => {
    // Navigate to booking screen with recall info
    navigation.navigate('CreateJob', { 
      recallId: recall.id,
      serviceType: 'recall_repair',
      description: `Recall Repair: ${recall.title}`,
      priority: 'high'
    });
  };

  const handleLearnMore = (recall) => {
    // In a real app, this would open a web view or external link
    Alert.alert(
      'Recall Details',
      `Manufacturer: ${recall.manufacturer}\nAffected Vehicles: ${recall.affectedVehicles}\nRemedy: ${recall.remedy}\nEstimated Time: ${recall.estimatedRepairTime}`,
      [{ text: 'OK' }]
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return theme.error;
      case 'medium': return theme.warning;
      case 'low': return theme.info;
      default: return theme.textSecondary;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'notifications';
      default: return 'info';
    }
  };

  const getActionRequiredColor = (actionRequired) => {
    return actionRequired ? theme.error : theme.success;
  };

  const renderRecallCard = (recall) => (
    <TouchableOpacity
      key={recall.id}
      style={[styles.recallCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => handleRecallPress(recall)}
      activeOpacity={0.8}
    >
      <View style={styles.recallHeader}>
        <View style={styles.recallInfo}>
          <View style={[
            styles.severityIndicator,
            { backgroundColor: getSeverityColor(recall.severity) }
          ]}>
            <IconFallback
              name={getSeverityIcon(recall.severity)}
              size={20}
              color="white"
            />
          </View>
          <View style={styles.recallDetails}>
            <Text style={[styles.recallTitle, { color: theme.text }]}>
              {recall.title}
            </Text>
            <Text style={[styles.vehicleInfo, { color: theme.textSecondary }]}>
              {recall.vehicleInfo}
            </Text>
          </View>
        </View>
        <View style={styles.actionIndicator}>
          <View style={[
            styles.actionBadge,
            { backgroundColor: getActionRequiredColor(recall.actionRequired) }
          ]}>
            <Text style={styles.actionText}>
              {recall.actionRequired ? 'Action Required' : 'Info Only'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.recallDescription, { color: theme.textSecondary }]} numberOfLines={2}>
        {recall.description}
      </Text>

      <View style={styles.recallFooter}>
        <View style={styles.recallMeta}>
          <Text style={[styles.recallDate, { color: theme.textSecondary }]}>
            {new Date(recall.date).toLocaleDateString()}
          </Text>
          <Text style={[styles.recallNumber, { color: theme.textSecondary }]}>
            {recall.recallNumber}
          </Text>
        </View>
        <View style={styles.recallActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => handleScheduleRepair(recall)}
          >
            <Text style={styles.actionButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Priority indicator bar */}
      <View style={[
        styles.priorityBar,
        { backgroundColor: getSeverityColor(recall.severity) }
      ]} />
    </TouchableOpacity>
  );

  const urgentRecalls = recalls.filter(recall => recall.actionRequired);
  const infoRecalls = recalls.filter(recall => !recall.actionRequired);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      {/* Custom Navigation Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.background,
        paddingTop: insets.top + 10,
        paddingBottom: 10,
      }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <IconFallback name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={[styles.headerTitleText, { color: theme.text }]}>
              Recall Notifications
            </Text>
            {urgentRecalls.length > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: theme.error }]}>
                <Text style={styles.notificationBadgeText}>
                  {urgentRecalls.length}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(
                'Recall Notifications',
                'This screen shows manufacturer recalls and safety notices for your vehicles.',
                [{ text: 'OK' }]
              );
            }}
            activeOpacity={0.7}
          >
            <IconFallback name="more-vert" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
      >
          {/* Summary Stats */}
          <ResponsiveContainer>
            <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground }]}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.error }]}>
                  {urgentRecalls.length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Urgent Recalls
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.info }]}>
                  {infoRecalls.length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Info Updates
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: theme.text }]}>
                  {recalls.length}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Total Alerts
                </Text>
              </View>
            </View>
          </ResponsiveContainer>

          {/* Urgent Recalls */}
          {urgentRecalls.length > 0 && (
            <ResponsiveContainer>
              <View style={styles.sectionHeader}>
                <Heading3 style={{ color: theme.text }}>Action Required</Heading3>
                <View style={[styles.urgentBadge, { backgroundColor: theme.error }]}>
                  <Text style={styles.urgentText}>{urgentRecalls.length}</Text>
                </View>
              </View>
              
              {urgentRecalls.map(renderRecallCard)}
            </ResponsiveContainer>
          )}

          {/* Information Updates */}
          {infoRecalls.length > 0 && (
            <ResponsiveContainer>
              <View style={styles.sectionHeader}>
                <Heading3 style={{ color: theme.text }}>Information Updates</Heading3>
              </View>
              
              {infoRecalls.map(renderRecallCard)}
            </ResponsiveContainer>
          )}

          {/* Empty State */}
          {recalls.length === 0 && (
            <ResponsiveContainer>
              <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
                <IconFallback name="check-circle" size={64} color={theme.success} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No Recall Notifications
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Your vehicles are not affected by any current recalls or safety notices
                </Text>
              </View>
            </ResponsiveContainer>
          )}

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
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  urgentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recallCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  recallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recallInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  severityIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recallDetails: {
    flex: 1,
  },
  recallTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  vehicleInfo: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionIndicator: {
    alignItems: 'flex-end',
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  recallDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 16,
  },
  recallFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recallMeta: {
    flex: 1,
  },
  recallDate: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  recallNumber: {
    fontSize: 12,
    fontWeight: '500',
  },
  recallActions: {
    flex: 1,
    alignItems: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  priorityBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 40,
  },
});
