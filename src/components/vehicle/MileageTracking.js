import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import IconFallback from '../shared/IconFallback';
import { hapticService } from '../../services/HapticService';

export default function MileageTracking({ vehicles, onVehiclePress, theme }) {
  const [showMileageModal, setShowMileageModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [newMileage, setNewMileage] = useState('');

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

    // Here you would typically update the vehicle mileage in your state management
    // For now, we'll just close the modal
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

  return (
    <View style={styles.container}>
      {vehicles.map((vehicle) => {
        const mileageStatus = getMileageStatus(vehicle);
        
        return (
          <TouchableOpacity
            key={vehicle.id}
            style={[styles.vehicleCard, { backgroundColor: theme.cardBackground }]}
            onPress={() => onVehiclePress(vehicle)}
            activeOpacity={0.8}
          >
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
          </TouchableOpacity>
        );
      })}

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
  vehicleCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
});
