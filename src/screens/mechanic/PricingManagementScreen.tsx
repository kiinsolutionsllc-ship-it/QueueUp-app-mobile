import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';


interface PricingManagementScreenProps {
  navigation: any;
}
export default function PricingManagementScreen({ navigation }: PricingManagementScreenProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  // Debug logging
  
  // Animation states for enhanced UX
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Card animation states
  const [cardAnimations] = useState<any>(() => ({
    marketAdjustment: new Animated.Value(1),
    hourlyRates: new Animated.Value(1),
    serviceFees: new Animated.Value(1),
    jobPricing: new Animated.Value(1),
    additionalSettings: new Animated.Value(1),
  }));
  
  // Button press animations
  const [buttonAnimations] = useState<any>(() => ({
    reset: new Animated.Value(1),
    apply: new Animated.Value(1),
    quickAdjust: new Animated.Value(1),
  }));

  const [pricing, setPricing] = useState<any>({
    hourlyRate: 75,
    emergencyRate: 100,
    weekendRate: 90,
    diagnosticsFee: 120,
    travelFee: 25,
    diagnosticFee: 50,
    minimumCharge: 30,
  });

  const [jobPricing, setJobPricing] = useState<any>({
    oilChange: 45,
    brakeService: 150,
    tireRotation: 25,
    acRepair: 200,
    engineDiagnostic: 100,
    transmissionService: 300,
  });

  const [hourlyRatesExpanded, setHourlyRatesExpanded] = useState<any>(false);
  const [serviceFeesExpanded, setServiceFeesExpanded] = useState<any>(false);
  const [jobPricingExpanded, setJobPricingExpanded] = useState<any>(false);
  const [selectedRate, setSelectedRate] = useState<any>(null);
  const [marketAdjustmentModal, setMarketAdjustmentModal] = useState<any>(false);
  const [marketAdjustment, setMarketAdjustment] = useState<any>(0);
  const [autoMarketAdjustment, setAutoMarketAdjustment] = useState<any>(false);

  // Additional Settings State
  const [additionalSettings, setAdditionalSettings] = useState<any>({
    currency: 'USD',
    showTaxIncluded: false,
    taxRate: 8.5,
    showDiscounts: true,
    autoApplyDiscounts: false,
    discountThreshold: 500,
    discountPercentage: 5,
    showEarnings: true,
    showCompetitorRates: false,
    priceNotifications: true,
    lowRateAlerts: true,
    rateChangeConfirmations: true,
    weekendPricing: true,
    holidayPricing: true,
    emergencyPricing: true,
    travelDistanceLimit: 25,
    freeTravelWithin: 5,
    materialMarkup: 15,
    laborMarkup: 20,
    minimumJobValue: 50,
    maximumJobValue: 5000,
    paymentTerms: 'immediate',
    depositRequired: false,
    depositPercentage: 25,
    cancellationPolicy: '24h',
    refundPolicy: 'partial',
  });

  const [additionalSettingsExpanded, setAdditionalSettingsExpanded] = useState<any>(false);

  // Animation helper functions
  const animateCardPress = (cardKey: string, callback: () => void) => {
    Animated.sequence([
      Animated.timing(cardAnimations[cardKey], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimations[cardKey], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const animateButtonPress = (buttonKey: string, callback: () => void) => {
    Animated.sequence([
      Animated.timing(buttonAnimations[buttonKey], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimations[buttonKey], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  // Initial animations on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const applyMarketAdjustment = (percentage: any) => {
    const adjustment = percentage / 100;
    
    // Apply adjustment to hourly rates
    setPricing((prev: any) => ({
      ...prev,
      hourlyRate: Math.round(prev.hourlyRate * (1 + adjustment)),
      emergencyRate: Math.round(prev.emergencyRate * (1 + adjustment)),
      weekendRate: Math.round(prev.weekendRate * (1 + adjustment)),
      diagnosticsFee: Math.round(prev.diagnosticsFee * (1 + adjustment)),
      travelFee: Math.round(prev.travelFee * (1 + adjustment)),
      diagnosticFee: Math.round(prev.diagnosticFee * (1 + adjustment)),
      minimumCharge: Math.round(prev.minimumCharge * (1 + adjustment)),
    }));

    // Apply adjustment to job pricing
    setJobPricing((prev: any) => ({
      ...prev,
      oilChange: Math.round(prev.oilChange * (1 + adjustment)),
      brakeService: Math.round(prev.brakeService * (1 + adjustment)),
      tireRotation: Math.round(prev.tireRotation * (1 + adjustment)),
      acRepair: Math.round(prev.acRepair * (1 + adjustment)),
      engineDiagnostic: Math.round(prev.engineDiagnostic * (1 + adjustment)),
      transmissionService: Math.round(prev.transmissionService * (1 + adjustment)),
    }));

    setMarketAdjustmentModal(false);
    setMarketAdjustment(0);
    Alert.alert('Success', `Applied ${percentage > 0 ? '+' : ''}${percentage}% market adjustment to all rates`);
  };

  const resetToDefaultRates = () => {
    Alert.alert(
      'Reset to Default Rates',
      'Are you sure you want to reset all rates to their default values? This will remove any market adjustments.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setPricing({
              hourlyRate: 75,
              emergencyRate: 100,
              weekendRate: 90,
              diagnosticsFee: 120,
              travelFee: 25,
              diagnosticFee: 50,
              minimumCharge: 30,
            });
            setJobPricing({
              oilChange: 45,
              brakeService: 150,
              tireRotation: 25,
              acRepair: 200,
              engineDiagnostic: 100,
              transmissionService: 300,
            });
            setAutoMarketAdjustment(false);
            setMarketAdjustmentModal(false);
            setMarketAdjustment(0);
            Alert.alert('Success', 'All rates have been reset to default values');
          },
        },
      ]
    );
  };

  const handleMarketAdjustment = () => {
    setMarketAdjustmentModal(true);
  };

  const resetAdditionalSettings = () => {
    Alert.alert(
      'Reset Additional Settings',
      'Are you sure you want to reset all additional settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setAdditionalSettings({
              currency: 'USD',
              showTaxIncluded: false,
              taxRate: 8.5,
              showDiscounts: true,
              autoApplyDiscounts: false,
              discountThreshold: 500,
              discountPercentage: 5,
              showEarnings: true,
              showCompetitorRates: false,
              priceNotifications: true,
              lowRateAlerts: true,
              rateChangeConfirmations: true,
              weekendPricing: true,
              holidayPricing: true,
              emergencyPricing: true,
              travelDistanceLimit: 25,
              freeTravelWithin: 5,
              materialMarkup: 15,
              laborMarkup: 20,
              minimumJobValue: 50,
              maximumJobValue: 5000,
              paymentTerms: 'immediate',
              depositRequired: false,
              depositPercentage: 25,
              cancellationPolicy: '24h',
              refundPolicy: 'partial',
              dynamicPricing: false,
              peakHoursPricing: false,
              distanceBasedPricing: false,
            });
            Alert.alert('Success', 'Additional settings have been reset to default values');
          },
        },
      ]
    );
  };

  const DropdownRateRow = ({ title, value, icon, rateKey, suffix = '$' }: any) => {
    const isSelected = selectedRate === rateKey;
    
    return (
      <TouchableOpacity
        style={[
          styles.dropdownRow,
          { 
            backgroundColor: isSelected ? theme.primary + '10' : theme.cardBackground,
            borderLeftColor: isSelected ? theme.primary : 'transparent',
          }
        ]}
        onPress={() => {
          setSelectedRate(isSelected ? null : rateKey);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownRowContent}>
          <View style={styles.dropdownRowLeft}>
            <View style={[styles.dropdownRowIcon, { backgroundColor: theme.primary + '15' }]}>
              <IconFallback name={icon} size={18} color={theme.primary} />
            </View>
            <Text style={[styles.dropdownRowTitle, { color: theme.text }]}>{title}</Text>
          </View>
          
          <View style={styles.dropdownRowRight}>
            <Text style={[styles.dropdownRowValue, { color: theme.primary }]}>
              {suffix}{value}
            </Text>
            {isSelected && (
              <IconFallback name="check" size={16} color={theme.primary} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const SettingToggle = ({ title, subtitle, value, onValueChange, icon }: any) => {
    return (
      <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
        <View style={styles.settingRowLeft}>
          <View style={[styles.settingIcon, { backgroundColor: theme.primary + '15' }]}>
            <IconFallback name={icon} size={18} color={theme.primary} />
          </View>
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.toggle,
            { backgroundColor: value ? theme.primary : theme.border }
          ]}
          onPress={() => onValueChange(!value)}
        >
          <View style={[
            styles.toggleThumb,
            { 
              backgroundColor: 'white',
              transform: [{ translateX: value ? 20 : 2 }]
            }
          ]} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Pricing Management"
        subtitle="Set your rates and pricing"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[]}
        showNotifications={true}
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile={true}
        profileAvatar={'👨‍🔧'}
        user={null}
        onProfilePress={() => navigation.navigate('MechanicProfile')}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Market Adjustment Section */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Animated.View style={{ transform: [{ scale: cardAnimations.marketAdjustment }] }}>
            <TouchableOpacity
              style={[styles.marketAdjustmentCard, { backgroundColor: theme.primary + '10' }]}
              onPress={() => animateCardPress('marketAdjustment', handleMarketAdjustment)}
              activeOpacity={0.8}
            >
            <View style={styles.marketAdjustmentHeader}>
              <View style={[styles.marketAdjustmentIcon, { backgroundColor: theme.primary + '20' }]}>
                <IconFallback name="trending-up" size={24} color={theme.primary} />
              </View>
              <View style={styles.marketAdjustmentText}>
                <Text style={[styles.marketAdjustmentTitle, { color: theme.text }]}>Market Adjustment</Text>
                <Text style={[styles.marketAdjustmentSubtitle, { color: theme.textSecondary }]}>
                  Adjust all rates based on current market conditions
                </Text>
              </View>
            </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Hourly Rates Dropdown */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Animated.View style={{ transform: [{ scale: cardAnimations.hourlyRates }] }}>
            <TouchableOpacity
              style={[
                styles.dropdownHeader, 
                { 
                  backgroundColor: theme.cardBackground,
                  borderColor: hourlyRatesExpanded ? theme.primary : theme.border,
                  borderWidth: 2,
                  shadowColor: hourlyRatesExpanded ? theme.primary : 'transparent',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: hourlyRatesExpanded ? 0.15 : 0,
                  shadowRadius: 12,
                  elevation: hourlyRatesExpanded ? 8 : 0,
                }
              ]}
              onPress={() => animateCardPress('hourlyRates', () => setHourlyRatesExpanded(!hourlyRatesExpanded))}
              activeOpacity={0.8}
            >
            <View style={styles.dropdownTitleContainer}>
              <View style={[styles.dropdownHeaderIcon, { backgroundColor: theme.primary + '15' }]}>
                <IconFallback name="schedule" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.dropdownTitle, { color: theme.text }]}>Hourly Rates</Text>
              {hourlyRatesExpanded && (
                <View style={[styles.dropdownBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.dropdownBadgeText, { color: theme.primary }]}>
                    {Object.keys(pricing).length}
                  </Text>
                </View>
              )}
            </View>
            <IconFallback 
              name={hourlyRatesExpanded ? 'expand-less' : 'expand-more'} 
              size={24} 
              color={theme.primary} 
            />
            </TouchableOpacity>
          </Animated.View>
          
          {hourlyRatesExpanded && (
            <Animated.View 
              style={[
                styles.dropdownContent, 
                { 
                  backgroundColor: theme.cardBackground, 
                  borderColor: theme.border,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <DropdownRateRow
                title="Standard Rate"
                value={pricing.hourlyRate}
                icon="schedule"
                rateKey="hourlyRate"
              />
              
              <DropdownRateRow
                title="Emergency Rate"
                value={pricing.emergencyRate}
                icon="emergency"
                rateKey="emergencyRate"
              />
              
              <DropdownRateRow
                title="Weekend Rate"
                value={pricing.weekendRate}
                icon="weekend"
                rateKey="weekendRate"
              />
              
              <DropdownRateRow
                title="Diagnostics Fee"
                value={pricing.diagnosticsFee}
                icon="search"
                rateKey="diagnosticsFee"
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* Service Fees Dropdown */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Animated.View style={{ transform: [{ scale: cardAnimations.serviceFees }] }}>
            <TouchableOpacity
              style={[
                styles.dropdownHeader, 
                { 
                  backgroundColor: theme.cardBackground,
                  borderColor: serviceFeesExpanded ? theme.primary : theme.border,
                  borderWidth: 2,
                  shadowColor: serviceFeesExpanded ? theme.primary : 'transparent',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: serviceFeesExpanded ? 0.15 : 0,
                  shadowRadius: 12,
                  elevation: serviceFeesExpanded ? 8 : 0,
                }
              ]}
              onPress={() => animateCardPress('serviceFees', () => setServiceFeesExpanded(!serviceFeesExpanded))}
              activeOpacity={0.8}
            >
            <View style={styles.dropdownTitleContainer}>
              <View style={[styles.dropdownHeaderIcon, { backgroundColor: theme.primary + '15' }]}>
                <IconFallback name="receipt" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.dropdownTitle, { color: theme.text }]}>Service Fees</Text>
              {serviceFeesExpanded && (
                <View style={[styles.dropdownBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.dropdownBadgeText, { color: theme.primary }]}>
                    3
                  </Text>
                </View>
              )}
            </View>
            <IconFallback 
              name={serviceFeesExpanded ? 'expand-less' : 'expand-more'} 
              size={24} 
              color={theme.primary} 
            />
            </TouchableOpacity>
          </Animated.View>
          
          {serviceFeesExpanded && (
            <Animated.View 
              style={[
                styles.dropdownContent, 
                { 
                  backgroundColor: theme.cardBackground, 
                  borderColor: theme.border,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <DropdownRateRow
                title="Travel Fee"
                value={pricing.travelFee}
                icon="directions-car"
                rateKey="travelFee"
              />
              
              <DropdownRateRow
                title="Diagnostic Fee"
                value={pricing.diagnosticFee}
                icon="search"
                rateKey="diagnosticFee"
              />
              
              <DropdownRateRow
                title="Minimum Charge"
                value={pricing.minimumCharge}
                icon="minimize"
                rateKey="minimumCharge"
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* Job-Specific Pricing Dropdown */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Animated.View style={{ transform: [{ scale: cardAnimations.jobPricing }] }}>
            <TouchableOpacity
              style={[
                styles.dropdownHeader, 
                { 
                  backgroundColor: theme.cardBackground,
                  borderColor: jobPricingExpanded ? theme.primary : theme.border,
                  borderWidth: 2,
                  shadowColor: jobPricingExpanded ? theme.primary : 'transparent',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: jobPricingExpanded ? 0.15 : 0,
                  shadowRadius: 12,
                  elevation: jobPricingExpanded ? 8 : 0,
                }
              ]}
              onPress={() => animateCardPress('jobPricing', () => setJobPricingExpanded(!jobPricingExpanded))}
              activeOpacity={0.8}
            >
            <View style={styles.dropdownTitleContainer}>
              <View style={[styles.dropdownHeaderIcon, { backgroundColor: theme.primary + '15' }]}>
                <IconFallback name="build" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.dropdownTitle, { color: theme.text }]}>Job-Specific Pricing</Text>
              {jobPricingExpanded && (
                <View style={[styles.dropdownBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.dropdownBadgeText, { color: theme.primary }]}>
                    {Object.keys(jobPricing).length}
                  </Text>
                </View>
              )}
            </View>
            <IconFallback 
              name={jobPricingExpanded ? 'expand-less' : 'expand-more'} 
              size={24} 
              color={theme.primary} 
            />
            </TouchableOpacity>
          </Animated.View>
          
          {jobPricingExpanded && (
            <Animated.View 
              style={[
                styles.dropdownContent, 
                { 
                  backgroundColor: theme.cardBackground, 
                  borderColor: theme.border,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <DropdownRateRow
                title="Oil Change"
                value={jobPricing.oilChange}
                icon="oil-barrel"
                rateKey="oilChange"
              />
              
              <DropdownRateRow
                title="Brake Service"
                value={jobPricing.brakeService}
                icon="stop"
                rateKey="brakeService"
              />
              
              <DropdownRateRow
                title="Tire Rotation"
                value={jobPricing.tireRotation}
                icon="rotate-right"
                rateKey="tireRotation"
              />
              
              <DropdownRateRow
                title="AC Repair"
                value={jobPricing.acRepair}
                icon="ac-unit"
                rateKey="acRepair"
              />
              
              <DropdownRateRow
                title="Engine Diagnostic"
                value={jobPricing.engineDiagnostic}
                icon="build"
                rateKey="engineDiagnostic"
              />
              
              <DropdownRateRow
                title="Transmission Service"
                value={jobPricing.transmissionService}
                icon="settings"
                rateKey="transmissionService"
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* Additional Settings Dropdown - Updated */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Animated.View style={{ transform: [{ scale: cardAnimations.additionalSettings }] }}>
            <TouchableOpacity
              style={[
                styles.dropdownHeader, 
                { 
                  backgroundColor: theme.cardBackground,
                  borderColor: additionalSettingsExpanded ? theme.primary : theme.border,
                  borderWidth: 2,
                  shadowColor: additionalSettingsExpanded ? theme.primary : 'transparent',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: additionalSettingsExpanded ? 0.15 : 0,
                  shadowRadius: 12,
                  elevation: additionalSettingsExpanded ? 8 : 0,
                }
              ]}
              onPress={() => animateCardPress('additionalSettings', () => setAdditionalSettingsExpanded(!additionalSettingsExpanded))}
              activeOpacity={0.8}
            >
            <View style={styles.dropdownTitleContainer}>
              <View style={[styles.dropdownHeaderIcon, { backgroundColor: theme.primary + '15' }]}>
                <IconFallback name="settings" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.dropdownTitle, { color: theme.text }]}>Additional Settings</Text>
              {additionalSettingsExpanded && (
                <View style={[styles.dropdownBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.dropdownBadgeText, { color: theme.primary }]}>
                    6
                  </Text>
                </View>
              )}
            </View>
            <IconFallback 
              name={additionalSettingsExpanded ? 'expand-less' : 'expand-more'} 
              size={24} 
              color={theme.primary} 
            />
            </TouchableOpacity>
          </Animated.View>
          
          {additionalSettingsExpanded && (
            <Animated.View 
              style={[
                styles.dropdownContent, 
                { 
                  backgroundColor: theme.cardBackground, 
                  borderColor: theme.border,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Currency & Display Settings */}
              <View style={styles.settingsGroup}>
                <Text style={[styles.settingsGroupTitle, { color: theme.text }]}>Display & Currency</Text>
                
                <SettingToggle
                  title="Show Tax Included"
                  subtitle="Display prices with tax included"
                  value={additionalSettings.showTaxIncluded}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, showTaxIncluded: value})}
                  icon="receipt"
                />
                
                <SettingToggle
                  title="Show Earnings"
                  subtitle="Display estimated earnings on jobs"
                  value={additionalSettings.showEarnings}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, showEarnings: value})}
                  icon="account-balance-wallet"
                />
                
                <SettingToggle
                  title="Show Competitor Rates"
                  subtitle="Display local competitor pricing"
                  value={additionalSettings.showCompetitorRates}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, showCompetitorRates: value})}
                  icon="compare"
                />
              </View>

              {/* Discount Settings */}
              <View style={styles.settingsGroup}>
                <Text style={[styles.settingsGroupTitle, { color: theme.text }]}>Discounts & Offers</Text>
                
                <SettingToggle
                  title="Show Discounts"
                  subtitle="Display available discounts to customers"
                  value={additionalSettings.showDiscounts}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, showDiscounts: value})}
                  icon="local-offer"
                />
                
                <SettingToggle
                  title="Auto Apply Discounts"
                  subtitle="Automatically apply eligible discounts"
                  value={additionalSettings.autoApplyDiscounts}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, autoApplyDiscounts: value})}
                  icon="auto-fix-high"
                />
              </View>

              {/* Notification Settings */}
              <View style={styles.settingsGroup}>
                <Text style={[styles.settingsGroupTitle, { color: theme.text }]}>Notifications</Text>
                
                <SettingToggle
                  title="Price Notifications"
                  subtitle="Get notified about pricing changes"
                  value={additionalSettings.priceNotifications}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, priceNotifications: value})}
                  icon="notifications"
                />
                
                <SettingToggle
                  title="Low Rate Alerts"
                  subtitle="Alert when rates are below market average"
                  value={additionalSettings.lowRateAlerts}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, lowRateAlerts: value})}
                  icon="warning"
                />
                
                <SettingToggle
                  title="Rate Change Confirmations"
                  subtitle="Confirm before applying rate changes"
                  value={additionalSettings.rateChangeConfirmations}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, rateChangeConfirmations: value})}
                  icon="check-circle"
                />
              </View>

              {/* Business Rules */}
              <View style={styles.settingsGroup}>
                <Text style={[styles.settingsGroupTitle, { color: theme.text }]}>Business Rules</Text>
                
                <SettingToggle
                  title="Weekend Pricing"
                  subtitle="Apply weekend rates automatically"
                  value={additionalSettings.weekendPricing}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, weekendPricing: value})}
                  icon="weekend"
                />
                
                <SettingToggle
                  title="Holiday Pricing"
                  subtitle="Apply holiday rates automatically"
                  value={additionalSettings.holidayPricing}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, holidayPricing: value})}
                  icon="celebration"
                />
                
                <SettingToggle
                  title="Emergency Pricing"
                  subtitle="Apply emergency rates for urgent jobs"
                  value={additionalSettings.emergencyPricing}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, emergencyPricing: value})}
                  icon="emergency"
                />
              </View>

              {/* Payment & Policies */}
              <View style={styles.settingsGroup}>
                <Text style={[styles.settingsGroupTitle, { color: theme.text }]}>Payment & Policies</Text>
                
                <SettingToggle
                  title="Deposit Required"
                  subtitle="Require deposit before starting work"
                  value={additionalSettings.depositRequired}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, depositRequired: value})}
                  icon="account-balance"
                />
              </View>

              {/* Advanced Pricing */}
              <View style={styles.settingsGroup}>
                <Text style={[styles.settingsGroupTitle, { color: theme.text }]}>Advanced Pricing</Text>
                
                <SettingToggle
                  title="Dynamic Pricing"
                  subtitle="Adjust rates based on demand and availability"
                  value={additionalSettings.dynamicPricing || false}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, dynamicPricing: value})}
                  icon="trending-up"
                />
                
                <SettingToggle
                  title="Peak Hours Pricing"
                  subtitle="Apply higher rates during peak hours"
                  value={additionalSettings.peakHoursPricing || false}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, peakHoursPricing: value})}
                  icon="schedule"
                />
                
                <SettingToggle
                  title="Distance-Based Pricing"
                  subtitle="Adjust rates based on travel distance"
                  value={additionalSettings.distanceBasedPricing || false}
                  onValueChange={(value: any) => setAdditionalSettings({...additionalSettings, distanceBasedPricing: value})}
                  icon="my-location"
                />
              </View>

              {/* Reset Settings */}
              <View style={styles.settingsGroup}>
                <TouchableOpacity
                  style={[styles.resetButton, { backgroundColor: theme.error + '10', borderColor: theme.error + '30' }]}
                  onPress={resetAdditionalSettings}
                  activeOpacity={0.8}
                >
                  <IconFallback name="refresh" size={20} color={theme.error} />
                  <Text style={[styles.resetButtonText, { color: theme.error }]}>Reset All Settings</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* Pricing Tips */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <MaterialCard style={[styles.tipsCard, { backgroundColor: theme.info + '20' }]}>
            <View style={styles.tipsHeader}>
              <IconFallback name="lightbulb" size={24} color={theme.info} />
              <Text style={[styles.tipsTitle, { color: theme.text }]}>Pricing Tips</Text>
            </View>
            <Text style={[styles.tipsText, { color: theme.textSecondary }]}>
              • Research local market rates to stay competitive{'\n'}
              • Consider your experience level and specialization{'\n'}
              • Factor in travel time and material costs{'\n'}
              • Update pricing regularly based on demand{'\n'}
              • Offer package deals for multiple services{'\n'}
              • Use dynamic pricing for better profitability{'\n'}
              • Enable notifications to stay updated on market changes{'\n'}
              • Set appropriate deposit requirements for large jobs
            </Text>
          </MaterialCard>
        </Animated.View>
      </ScrollView>

      {/* Market Adjustment Modal */}
      {marketAdjustmentModal && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Market Rate Adjustment</Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Apply a percentage adjustment to all rates based on current market conditions
            </Text>

            {/* Quick Adjustment Buttons */}
            <View style={styles.quickAdjustmentContainer}>
              <Text style={[styles.quickAdjustmentLabel, { color: theme.text }]}>Quick Adjustments</Text>
              <View style={styles.quickAdjustmentButtons}>
                <TouchableOpacity
                  style={[styles.quickButton, { backgroundColor: theme.primary + '20' }]}
                  onPress={() => applyMarketAdjustment(5)}
                >
                  <Text style={[styles.quickButtonText, { color: theme.primary }]}>+5%</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.quickButton, { backgroundColor: theme.primary + '20' }]}
                  onPress={() => applyMarketAdjustment(10)}
                >
                  <Text style={[styles.quickButtonText, { color: theme.primary }]}>+10%</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.quickButton, { backgroundColor: theme.primary + '20' }]}
                  onPress={() => applyMarketAdjustment(15)}
                >
                  <Text style={[styles.quickButtonText, { color: theme.primary }]}>+15%</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Adjustment %</Text>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={[styles.adjustmentButton, { backgroundColor: theme.primary + '20' }]}
                  onPress={() => setMarketAdjustment(Math.max(-50, marketAdjustment - 5))}
                >
                  <Text style={[styles.adjustmentButtonText, { color: theme.primary }]}>-5</Text>
                </TouchableOpacity>
                
                <View style={[styles.inputField, { borderColor: theme.border }]}>
                  <Text style={[styles.inputValue, { color: theme.text }]}>
                    {marketAdjustment > 0 ? '+' : ''}{marketAdjustment}%
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.adjustmentButton, { backgroundColor: theme.primary + '20' }]}
                  onPress={() => setMarketAdjustment(Math.min(100, marketAdjustment + 5))}
                >
                  <Text style={[styles.adjustmentButtonText, { color: theme.primary }]}>+5</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Auto Market Adjustment Toggle */}
            <View style={styles.toggleContainer}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleTitle, { color: theme.text }]}>Auto Market Adjustment</Text>
                <Text style={[styles.toggleDescription, { color: theme.textSecondary }]}>
                  Automatically adjust rates based on market trends
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  { backgroundColor: autoMarketAdjustment ? theme.primary : theme.border }
                ]}
                onPress={() => setAutoMarketAdjustment(!autoMarketAdjustment)}
              >
                <View style={[
                  styles.toggleThumb,
                  { 
                    backgroundColor: 'white',
                    transform: [{ translateX: autoMarketAdjustment ? 20 : 2 }]
                  }
                ]} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <Animated.View style={{ transform: [{ scale: buttonAnimations.reset }] }}>
                <TouchableOpacity
                  style={[styles.modalButton, { borderColor: theme.border }]}
                  onPress={() => animateButtonPress('reset', () => setMarketAdjustmentModal(false))}
                >
                  <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View style={{ transform: [{ scale: buttonAnimations.reset }] }}>
                <TouchableOpacity
                  style={[styles.modalButton, { borderColor: theme.error }]}
                  onPress={() => animateButtonPress('reset', resetToDefaultRates)}
                >
                  <Text style={[styles.modalButtonText, { color: theme.error }]}>Reset</Text>
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View style={{ transform: [{ scale: buttonAnimations.apply }] }}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.primary }]}
                  onPress={() => animateButtonPress('apply', () => applyMarketAdjustment(marketAdjustment))}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary, { color: 'white' }]}>
                    Apply
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 24, // 3 * 8px
  },
  section: {
    marginBottom: 24, // 3 * 8px
  },
  sectionTitle: {
    fontSize: 20, // Enhanced typography
    fontWeight: '700', // Bolder weight
    marginBottom: 16, // 2 * 8px
    letterSpacing: 0.5,
  },
  tipsCard: {
    padding: 24, // 3 * 8px
    borderRadius: 16, // 2 * 8px
    // Enhanced shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // 2 * 8px
  },
  tipsTitle: {
    fontSize: 18, // Enhanced typography
    fontWeight: '700', // Bolder weight
    marginLeft: 12, // 1.5 * 8px
    letterSpacing: 0.3,
  },
  tipsText: {
    fontSize: 15, // Enhanced readability
    lineHeight: 24, // Better line spacing
    letterSpacing: 0.2,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20, // 2.5 * 8px
    borderRadius: 16, // 2 * 8px
    marginBottom: 16, // 2 * 8px
    // Enhanced shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  dropdownTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownHeaderIcon: {
    width: 40, // 5 * 8px
    height: 40, // 5 * 8px
    borderRadius: 20, // 2.5 * 8px
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16, // 2 * 8px
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700', // Bolder weight
    flex: 1,
    letterSpacing: 0.3,
  },
  dropdownBadge: {
    paddingHorizontal: 12, // 1.5 * 8px
    paddingVertical: 6, // 0.75 * 8px
    borderRadius: 16, // 2 * 8px
    marginLeft: 12, // 1.5 * 8px
  },
  dropdownBadgeText: {
    fontSize: 12,
    fontWeight: '700', // Bolder weight
    letterSpacing: 0.5,
  },
  dropdownContent: {
    marginTop: 8, // 1 * 8px
    borderRadius: 16, // 2 * 8px
    borderWidth: 2,
    overflow: 'hidden',
    // Enhanced shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  dropdownRow: {
    borderLeftWidth: 4, // Enhanced border
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dropdownRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20, // 2.5 * 8px
  },
  dropdownRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownRowIcon: {
    width: 36, // 4.5 * 8px
    height: 36, // 4.5 * 8px
    borderRadius: 18, // 2.25 * 8px
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16, // 2 * 8px
  },
  dropdownRowTitle: {
    fontSize: 16,
    fontWeight: '600', // Enhanced weight
    flex: 1,
    letterSpacing: 0.2,
  },
  dropdownRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // 1.5 * 8px
  },
  dropdownRowValue: {
    fontSize: 18,
    fontWeight: '700', // Enhanced weight
    letterSpacing: 0.3,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20, // Enhanced border radius
    padding: 32, // 4 * 8px
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22, // Enhanced typography
    fontWeight: '700', // Bolder weight
    textAlign: 'center',
    marginBottom: 12, // 1.5 * 8px
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 15, // Enhanced readability
    textAlign: 'center',
    marginBottom: 32, // 4 * 8px
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  inputContainer: {
    marginBottom: 32, // 4 * 8px
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16, // 2 * 8px
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // 2 * 8px
  },
  adjustmentButton: {
    width: 56, // 7 * 8px
    height: 56, // 7 * 8px
    borderRadius: 28, // 3.5 * 8px
    alignItems: 'center',
    justifyContent: 'center',
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  adjustmentButtonText: {
    fontSize: 18,
    fontWeight: '700', // Enhanced weight
    letterSpacing: 0.5,
  },
  inputField: {
    flex: 1,
    height: 56, // 7 * 8px
    borderWidth: 2,
    borderRadius: 12, // 1.5 * 8px
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputValue: {
    fontSize: 18,
    fontWeight: '700', // Enhanced weight
    letterSpacing: 0.3,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16, // 2 * 8px
  },
  modalButton: {
    flex: 1,
    height: 56, // 7 * 8px
    borderRadius: 16, // 2 * 8px
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700', // Enhanced weight
    letterSpacing: 0.3,
  },
  modalButtonTextPrimary: {
    color: 'white',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32, // 4 * 8px
    paddingVertical: 16, // 2 * 8px
  },
  toggleInfo: {
    flex: 1,
    marginRight: 20, // 2.5 * 8px
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8, // 1 * 8px
    letterSpacing: 0.3,
  },
  toggleDescription: {
    fontSize: 14,
    lineHeight: 20, // Enhanced line height
    letterSpacing: 0.2,
  },
  toggle: {
    width: 56, // 7 * 8px
    height: 32, // 4 * 8px
    borderRadius: 16, // 2 * 8px
    justifyContent: 'center',
    paddingHorizontal: 4, // 0.5 * 8px
  },
  toggleThumb: {
    width: 28, // 3.5 * 8px
    height: 28, // 3.5 * 8px
    borderRadius: 14, // 1.75 * 8px
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  quickAdjustmentContainer: {
    marginBottom: 32, // 4 * 8px
  },
  quickAdjustmentLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16, // 2 * 8px
    letterSpacing: 0.3,
  },
  quickAdjustmentButtons: {
    flexDirection: 'row',
    gap: 16, // 2 * 8px
  },
  quickButton: {
    flex: 1,
    height: 48, // 6 * 8px
    borderRadius: 12, // 1.5 * 8px
    alignItems: 'center',
    justifyContent: 'center',
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickButtonText: {
    fontSize: 16,
    fontWeight: '700', // Enhanced weight
    letterSpacing: 0.3,
  },
  marketAdjustmentCard: {
    padding: 24, // 3 * 8px
    borderRadius: 16, // 2 * 8px
    borderWidth: 2,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    // Enhanced shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  marketAdjustmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, // 2.5 * 8px
  },
  marketAdjustmentIcon: {
    width: 56, // 7 * 8px
    height: 56, // 7 * 8px
    borderRadius: 28, // 3.5 * 8px
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20, // 2.5 * 8px
  },
  marketAdjustmentText: {
    flex: 1,
  },
  marketAdjustmentTitle: {
    fontSize: 20, // Enhanced typography
    fontWeight: '700', // Bolder weight
    marginBottom: 8, // 1 * 8px
    letterSpacing: 0.3,
  },
  marketAdjustmentSubtitle: {
    fontSize: 15, // Enhanced readability
    lineHeight: 22, // Better line spacing
    letterSpacing: 0.2,
  },
  settingsGroup: {
    marginBottom: 24, // 3 * 8px
  },
  settingsGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16, // 2 * 8px
    paddingHorizontal: 20, // 2.5 * 8px
    paddingTop: 12, // 1.5 * 8px
    letterSpacing: 0.3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16, // 2 * 8px
    paddingHorizontal: 20, // 2.5 * 8px
    borderBottomWidth: 1,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36, // 4.5 * 8px
    height: 36, // 4.5 * 8px
    borderRadius: 18, // 2.25 * 8px
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16, // 2 * 8px
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600', // Enhanced weight
    marginBottom: 4, // 0.5 * 8px
    letterSpacing: 0.2,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 20, // Enhanced line height
    letterSpacing: 0.1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16, // 2 * 8px
    paddingHorizontal: 20, // 2.5 * 8px
    borderRadius: 12, // 1.5 * 8px
    borderWidth: 2,
    marginHorizontal: 20, // 2.5 * 8px
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700', // Enhanced weight
    marginLeft: 12, // 1.5 * 8px
    letterSpacing: 0.3,
  },
});
