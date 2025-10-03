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
import { useAuth } from '../../contexts/AuthContextAWS';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../../hooks/useResponsive';
import { Heading3, Heading4 } from '../../components/shared/ResponsiveText';
import { ResponsiveContainer } from '../../components/shared/ResponsiveSpacing';
import { hapticService } from '../../services/HapticService';


interface ServiceHistoryScreenProps {
  navigation: any;
}
export default function ServiceHistoryScreen({ navigation }: ServiceHistoryScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const theme = getCurrentTheme();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const [isRefreshing, setIsRefreshing] = useState<any>(false);
  const [loading, setLoading] = useState<any>(false);
  const [selectedFilter, setSelectedFilter] = useState<any>('all');

  // Mock service history data
  const [serviceHistory] = useState<any>([
    {
      id: '1',
      vehicleId: '1',
      vehicleInfo: '2020 Vehicle',
      service: 'Oil Change',
      date: '2024-01-15',
      mileage: 44500,
      cost: 45,
      mechanic: 'Mike Johnson',
      status: 'completed',
      type: 'maintenance',
      description: 'Regular oil change service with filter replacement',
      rating: 5,
    },
    {
      id: '2',
      vehicleId: '1',
      service: 'Brake Inspection',
      date: '2024-01-10',
      mileage: 44000,
      cost: 120,
      mechanic: 'Sarah Williams',
      status: 'completed',
      type: 'inspection',
      description: 'Complete brake system inspection and pad replacement',
      rating: 4,
    },
    {
      id: '3',
      vehicleId: '2',
      service: 'Tire Rotation',
      date: '2024-01-08',
      mileage: 61500,
      cost: 60,
      mechanic: 'David Brown',
      status: 'completed',
      type: 'maintenance',
      description: 'Tire rotation and balance check',
      rating: 5,
    },
    {
      id: '4',
      vehicleId: '1',
      service: 'Engine Diagnostic',
      date: '2023-12-20',
      mileage: 43000,
      cost: 150,
      mechanic: 'Mike Johnson',
      status: 'completed',
      type: 'diagnostic',
      description: 'Check engine light diagnostic and repair',
      rating: 4,
    },
    {
      id: '5',
      vehicleId: '2',
      service: 'AC System Service',
      date: '2023-12-15',
      mileage: 60000,
      cost: 200,
      mechanic: 'Lisa Chen',
      status: 'completed',
      type: 'repair',
      description: 'Air conditioning system maintenance and recharge',
      rating: 5,
    },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleServicePress = (service) => {
    Alert.alert(
      service.service,
      `${service.description}\n\nMechanic: ${service.mechanic}\nCost: $${service.cost}\nDate: ${new Date(service.date).toLocaleDateString()}`,
      [
        { text: 'Dismiss', style: 'cancel' },
        { text: 'Rate Service', onPress: () => handleRateService(service) },
        { text: 'Book Again', onPress: () => handleBookAgain(service) }
      ]
    );
  };

  const handleRateService = (service) => {
    Alert.alert(
      'Rate Service',
      `How would you rate ${service.service} by ${service.mechanic}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '1 Star', onPress: () => {} },
        { text: '2 Stars', onPress: () => {} },
        { text: '3 Stars', onPress: () => {} },
        { text: '4 Stars', onPress: () => {} },
        { text: '5 Stars', onPress: () => {} },
      ]
    );
  };

  const handleBookAgain = (service) => {
    navigation.navigate('CreateJob', {
      serviceType: service.type,
      description: `Repeat: ${service.service}`,
      mechanic: service.mechanic
    });
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'maintenance': return 'build';
      case 'diagnostic': return 'search';
      case 'inspection': return 'visibility';
      case 'repair': return 'handyman';
      default: return 'build';
    }
  };

  const getServiceColor = (type) => {
    switch (type) {
      case 'maintenance': return theme.info;
      case 'diagnostic': return theme.warning;
      case 'inspection': return theme.primary;
      case 'repair': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.success;
      case 'in-progress': return theme.warning;
      case 'cancelled': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'in-progress': return 'schedule';
      case 'cancelled': return 'cancel';
      default: return 'help';
    }
  };

  const filteredServices = selectedFilter === 'all' 
    ? serviceHistory 
    : serviceHistory.filter(service => service.type === selectedFilter);

  const totalSpent = serviceHistory.reduce((sum, service) => sum + (service.cost || 0), 0);
  const averageRating = serviceHistory.length > 0 
    ? serviceHistory.reduce((sum, service) => sum + (service.rating || 0), 0) / serviceHistory.length 
    : 0;

  const renderServiceCard = (service) => (
    <TouchableOpacity
      key={service.id}
      style={[styles.serviceCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => handleServicePress(service)}
      activeOpacity={0.8}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <View style={[
            styles.serviceIcon,
            { backgroundColor: getServiceColor(service.type) }
          ]}>
            <IconFallback
              name={getServiceIcon(service.type)}
              size={20}
              color="white"
            />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={[styles.serviceName, { color: theme.text }]}>
              {service.service}
            </Text>
            <Text style={[styles.vehicleInfo, { color: theme.textSecondary }]}>
              {service.vehicleInfo}
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <IconFallback
            name={getStatusIcon(service.status)}
            size={16}
            color={getStatusColor(service.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={[styles.serviceDescription, { color: theme.textSecondary }]} numberOfLines={2}>
        {service.description}
      </Text>

      <View style={styles.serviceFooter}>
        <View style={styles.serviceMeta}>
          <View style={styles.metaItem}>
            <IconFallback name="schedule" size={14} color={theme.textSecondary} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {new Date(service.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <IconFallback name="speed" size={14} color={theme.textSecondary} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {service.mileage.toLocaleString()} mi
            </Text>
          </View>
          <View style={styles.metaItem}>
            <IconFallback name="person" size={14} color={theme.textSecondary} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {service.mechanic}
            </Text>
          </View>
        </View>
        <View style={styles.serviceCost}>
          <Text style={[styles.costLabel, { color: theme.textSecondary }]}>
            Total
          </Text>
          <Text style={[styles.costValue, { color: theme.text }]}>
            ${service.cost}
          </Text>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <IconFallback
              key={star}
              name="star"
              size={14}
              color={star <= service.rating ? theme.warning : theme.divider}
            />
          ))}
        </View>
        <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
          {service.rating}.0
        </Text>
      </View>

      {/* Service type indicator bar */}
      <View style={[
        styles.typeBar,
        { backgroundColor: getServiceColor(service.type) }
      ]} />
    </TouchableOpacity>
  );

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
              Service History
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(
                'Service History',
                'View all your vehicle maintenance and repair history.',
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
              <Text style={[styles.summaryNumber, { color: theme.primary }]}>
                {serviceHistory.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Total Services
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.success }]}>
                ${totalSpent}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Total Spent
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.warning }]}>
                {(averageRating || 0).toFixed(1)}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Avg Rating
              </Text>
            </View>
          </View>
        </ResponsiveContainer>

        {/* Filter Buttons */}
        <ResponsiveContainer>
          <View style={styles.filterContainer}>
            {['all', 'maintenance', 'repair', 'inspection', 'diagnostic'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  { 
                    backgroundColor: selectedFilter === filter ? theme.primary : theme.cardBackground,
                    borderColor: theme.divider
                  }
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  { 
                    color: selectedFilter === filter ? 'white' : theme.text,
                    fontWeight: selectedFilter === filter ? '600' : '500'
                  }
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ResponsiveContainer>

        {/* Service History List */}
        <ResponsiveContainer>
          {filteredServices.length > 0 ? (
            filteredServices.map(renderServiceCard)
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
              <IconFallback name="history" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Services Found
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                No services match the selected filter
              </Text>
            </View>
          )}
        </ResponsiveContainer>

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
    marginTop: 20,
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
  },
  serviceCard: {
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  serviceDescription: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceMeta: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  serviceCost: {
    alignItems: 'flex-end',
  },
  costLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  costValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeBar: {
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
