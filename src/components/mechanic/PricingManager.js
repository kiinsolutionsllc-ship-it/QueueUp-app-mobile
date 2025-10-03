import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import MaterialTextInput from '../shared/MaterialTextInput';
import MaterialButton from '../shared/MaterialButton';

export default function PricingManager({ mechanicData, onSave }) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const [hourlyRate, setHourlyRate] = useState(mechanicData?.hourlyRate?.toString() || '');
  const [jobPricing, setJobPricing] = useState(mechanicData?.jobPricing || {});
  const [useHourlyRate, setUseHourlyRate] = useState(mechanicData?.useHourlyRate !== false);
  const [useJobPricing, setUseJobPricing] = useState(mechanicData?.useJobPricing || false);

  const serviceCategories = [
    { id: 'oil_change', name: 'Oil Change', defaultPrice: 50 },
    { id: 'brake_service', name: 'Brake Service', defaultPrice: 120 },
    { id: 'ac_repair', name: 'AC Repair', defaultPrice: 200 },
    { id: 'engine_repair', name: 'Engine Repair', defaultPrice: 300 },
    { id: 'tire_service', name: 'Tire Service', defaultPrice: 80 },
    { id: 'battery_service', name: 'Battery Service', defaultPrice: 100 },
    { id: 'transmission', name: 'Transmission', defaultPrice: 400 },
    { id: 'electrical', name: 'Electrical', defaultPrice: 150 },
  ];

  const handleSave = () => {
    if (!useHourlyRate && !useJobPricing) {
      Alert.alert('Error', 'Please select at least one pricing method');
      return;
    }

    if (useHourlyRate && (!hourlyRate || isNaN(parseFloat(hourlyRate)))) {
      Alert.alert('Error', 'Please enter a valid hourly rate');
      return;
    }

    const pricingData = {
      useHourlyRate,
      useJobPricing,
      hourlyRate: useHourlyRate ? parseFloat(hourlyRate) : null,
      jobPricing: useJobPricing ? jobPricing : {},
    };

    onSave(pricingData);
    Alert.alert('Success', 'Pricing updated successfully!');
  };

  const updateJobPrice = (categoryId, price) => {
    setJobPricing(prev => ({
      ...prev,
      [categoryId]: parseFloat(price) || 0
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Pricing Management</Text>
      
      {/* Hourly Rate Section */}
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <IconFallback name="access-time" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Hourly Rate</Text>
          </View>
          <Switch
            value={useHourlyRate}
            onValueChange={setUseHourlyRate}
            trackColor={{ false: theme.divider, true: theme.primary + '40' }}
            thumbColor={useHourlyRate ? theme.primary : theme.textSecondary}
          />
        </View>
        
        {useHourlyRate && (
          <View style={styles.inputContainer}>
            <MaterialTextInput
              label="Hourly Rate ($)"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              keyboardType="numeric"
              leftIcon="attach-money"
              placeholder="75"
            />
            <Text style={[styles.helpText, { color: theme.textSecondary }]}>
              Customers will be charged based on estimated job duration
            </Text>
          </View>
        )}
      </View>

      {/* Job-Specific Pricing Section */}
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <IconFallback name="work" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Job-Specific Pricing</Text>
          </View>
          <Switch
            value={useJobPricing}
            onValueChange={setUseJobPricing}
            trackColor={{ false: theme.divider, true: theme.primary + '40' }}
            thumbColor={useJobPricing ? theme.primary : theme.textSecondary}
          />
        </View>
        
        {useJobPricing && (
          <View style={styles.jobPricingContainer}>
            <Text style={[styles.subtitle, { color: theme.text }]}>
              Set fixed prices for specific services
            </Text>
            
            {serviceCategories.map((category) => (
              <View key={category.id} style={styles.priceRow}>
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryName, { color: theme.text }]}>
                    {category.name}
                  </Text>
                  <Text style={[styles.defaultPrice, { color: theme.textSecondary }]}>
                    Default: ${category.defaultPrice}
                  </Text>
                </View>
                <View style={styles.priceInputContainer}>
                  <Text style={[styles.dollarSign, { color: theme.text }]}>$</Text>
                  <TextInput
                    style={[styles.priceInput, { 
                      color: theme.text, 
                      borderColor: theme.divider,
                      backgroundColor: theme.background 
                    }]}
                    value={jobPricing[category.id]?.toString() || ''}
                    onChangeText={(text) => updateJobPrice(category.id, text)}
                    keyboardType="numeric"
                    placeholder={category.defaultPrice.toString()}
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Pricing Strategy Info */}
      <View style={[styles.infoCard, { backgroundColor: theme.info + '20' }]}>
        <IconFallback name="info" size={20} color={theme.info} />
        <View style={styles.infoContent}>
          <Text style={[styles.infoTitle, { color: theme.info }]}>Pricing Strategy</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>
            • Hourly Rate: Charged based on actual time spent{'\n'}
            • Job-Specific: Fixed price regardless of time{'\n'}
            • You can use both methods for different services
          </Text>
        </View>
      </View>

      {/* Save Button */}
      <MaterialButton
        title="Save Pricing"
        onPress={handleSave}
        style={styles.saveButton}
        icon="save"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  inputContainer: {
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  jobPricingContainer: {
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  defaultPrice: {
    fontSize: 12,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dollarSign: {
    fontSize: 16,
    fontWeight: '500',
  },
  priceInput: {
    width: 80,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 8,
  },
});
