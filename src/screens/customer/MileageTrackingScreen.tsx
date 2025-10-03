import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import { useVehicle } from '../../contexts/VehicleContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../../hooks/useResponsive';
import { Heading3, Heading4 } from '../../components/shared/ResponsiveText';
import { ResponsiveContainer } from '../../components/shared/ResponsiveSpacing';
import { hapticService } from '../../services/HapticService';


interface MileageTrackingScreenProps {
  navigation: any;
}
export default function MileageTrackingScreen({ navigation }: MileageTrackingScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const theme = getCurrentTheme();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const [isRefreshing, setIsRefreshing] = useState<any>(false);
  const [loading, setLoading] = useState<any>(false);
  const [showMileageModal, setShowMileageModal] = useState<any>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [newMileage, setNewMileage] = useState<any>('');

  // Use VehicleContext for vehicles
  const { vehicles, updateVehicle } = useVehicle();

  // Mock mileage history
  const [mileageHistory] = useState<any>([
    {
      id: '1',
      vehicleId: '1',
      date: '2024-01-15',
      mileage: 45000,
      type: 'service',
      description: 'Oil change service',
    },
    {
      id: '2',
      vehicleId: '1',
      date: '2024-01-10',
      mileage: 44500,
      type: 'manual',
      description: 'Manual entry',
    },
    {
      id: '3',
      vehicleId: '2',
      date: '2024-01-08',
      mileage: 62000,
      type: 'service',
      description: 'Tire rotation service',
    },
    {
      id: '4',
      vehicleId: '1',
      date: '2023-12-20',
      mileage: 43000,
      type: 'manual',
      description: 'Manual entry',
    },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleMileageUpdate = async (vehicle) => {
    try {
      await hapticService.buttonPress();
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
    setSelectedVehicle(vehicle);
    setNewMileage(vehicle.mileage.toString());
    setShowMileageModal(true);
  };

  const handleSaveMileage = async () => {
    if (!newMileage || isNaN(newMileage)) {
      Alert.alert('Invalid Input', 'Please enter a valid mileage number');
      return;
    }

    const mileage = parseInt(newMileage);
    if (mileage < selectedVehicle.mileage) {
      Alert.alert('Invalid Mileage', 'New mileage cannot be less than current mileage');
      return;
    }

    // Update vehicle mileage
    await updateVehicle(selectedVehicle.id, { mileage: mileage });

    setShowMileageModal(false);
    setSelectedVehicle(null);
    setNewMileage('');
    
    try {
      await hapticService.success();
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
    Alert.alert('Success', 'Mileage updated successfully');
  };

  const getMileageStatus = (vehicle) => {
    const lastServiceMileage = vehicle.mileage - 5000; // Assuming 5000 miles since last service
    const milesSinceService = vehicle.mileage - lastServiceMileage;
    
    if (milesSinceService >= 5000) {
      return { status: 'overdue', color: theme.error, text: 'Service Due' };
    } else if (milesSinceService >= 4000) {
      return { status: 'due-soon', color: theme.warning, text: 'Service Soon' };
    } else {
      return { status: 'good', color: theme.success, text: 'Up to Date' };
    }
  };

  const getVehicleHistory = (vehicleId) => {
    return mileageHistory.filter(entry => entry.vehicleId === vehicleId);
  };

  const renderVehicleCard = (vehicle) => {
    const mileageStatus = getMileageStatus(vehicle);
    const history = getVehicleHistory(vehicle.id);
    
    return (
      <View key={vehicle.id} style={[styles.vehicleCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleInfo}>
            <View style={[styles.vehicleIcon, { backgroundColor: vehicle.color }]}>
              <IconFallback name="directions-car" size={20} color="white" />
            </View>
            <View style={styles.vehicleDetails}>
              <Text style={[styles.vehicleName, { color: theme.text }]}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Text>
              <Text style={[styles.licensePlate, { color: theme.textSecondary }]}>
                {vehicle.licensePlate}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: theme.primary }]}
            onPress={() => handleMileageUpdate(vehicle)}
          >
            <IconFallback name="edit" size={16} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.mileageSection}>
          <View style={styles.currentMileage}>
            <Text style={[styles.mileageLabel, { color: theme.textSecondary }]}>
              Current Mileage
            </Text>
            <Text style={[styles.mileageValue, { color: theme.text }]}>
              {vehicle.mileage.toLocaleString()} miles
            </Text>
          </View>
          <View style={styles.mileageStatus}>
            <View style={[styles.statusIndicator, { backgroundColor: mileageStatus.color }]} />
            <Text style={[styles.statusText, { color: mileageStatus.color }]}>
              {mileageStatus.text}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
              Miles since last service
            </Text>
            <Text style={[styles.progressValue, { color: theme.text }]}>
              {(vehicle.mileage - (vehicle.mileage - 5000)).toLocaleString()} / 5,000
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.divider }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: '60%', // This would be calculated based on actual service intervals
                  backgroundColor: mileageStatus.color,
                },
              ]}
            />
          </View>
        </View>

        {/* Recent History */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.historyTitle, { color: theme.text }]}>
              Recent History
            </Text>
            {history.slice(0, 2).map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Text style={[styles.historyDateText, { color: theme.textSecondary }]}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.historyDetails}>
                  <Text style={[styles.historyMileage, { color: theme.text }]}>
                    {entry.mileage.toLocaleString()} mi
                  </Text>
                  <Text style={[styles.historyDescription, { color: theme.textSecondary }]}>
                    {entry.description}
                  </Text>
                </View>
                <View style={[
                  styles.historyType,
                  { backgroundColor: entry.type === 'service' ? theme.success : theme.info }
                ]}>
                  <Text style={styles.historyTypeText}>
                    {entry.type === 'service' ? 'S' : 'M'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

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
              Mileage Tracking
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              Alert.alert(
                'Mileage Tracking',
                'Track your vehicle mileage and service intervals to stay on top of maintenance.',
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
        bounces={true}
        nestedScrollEnabled={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustContentInsets={true}
      >
        {/* Summary Stats */}
        <ResponsiveContainer>
          <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.primary }]}>
                {vehicles.length}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Vehicles Tracked
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.success }]}>
                {vehicles.reduce((sum, vehicle) => sum + vehicle.mileage, 0).toLocaleString()}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Total Miles
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.warning }]}>
                {vehicles.filter(v => getMileageStatus(v).status === 'overdue').length}
              </Text>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Service Due
              </Text>
            </View>
          </View>
        </ResponsiveContainer>

        {/* Vehicle Cards */}
        <ResponsiveContainer>
          {vehicles.map(renderVehicleCard)}
        </ResponsiveContainer>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Mileage Update Modal */}
      <Modal
        visible={showMileageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMileageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Update Mileage
              </Text>
              <TouchableOpacity
                onPress={() => setShowMileageModal(false)}
                style={styles.closeButton}
              >
                <IconFallback name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedVehicle && (
              <View style={styles.vehicleInfo}>
                <View style={[styles.vehicleIcon, { backgroundColor: selectedVehicle.color }]}>
                  <IconFallback name="directions-car" size={24} color="white" />
                </View>
                <Text style={[styles.vehicleName, { color: theme.text }]}>
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </Text>
              </View>
            )}

            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Current Mileage
              </Text>
              <TextInput
                style={[styles.mileageInput, { 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.divider
                }]}
                value={newMileage}
                onChangeText={setNewMileage}
                placeholder="Enter mileage"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                maxLength={8}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.divider }]}
                onPress={() => setShowMileageModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveMileage}
              >
                <Text style={[styles.saveButtonText, { color: 'white' }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  vehicleCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  licensePlate: {
    fontSize: 14,
    fontWeight: '500',
  },
  updateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mileageSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentMileage: {
    flex: 1,
  },
  mileageLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  mileageValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mileageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  historySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    width: 60,
  },
  historyDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  historyDetails: {
    flex: 1,
    marginLeft: 12,
  },
  historyMileage: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyDescription: {
    fontSize: 12,
    fontWeight: '500',
  },
  historyType: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalVehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  mileageInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100, // Increased to ensure bottom content is fully visible
  },
});
