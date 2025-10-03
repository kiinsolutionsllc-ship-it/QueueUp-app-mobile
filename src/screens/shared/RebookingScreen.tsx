import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextSupabase';
import ValidatedForm from '../../components/shared/ValidatedForm';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialButton from '../../components/shared/MaterialButton';
import MaterialCard from '../../components/shared/MaterialCard';


interface RebookingScreenProps {
  navigation: any;
  route: {
    params?: any;
  };
}
export default function RebookingScreen({ navigation, route }: RebookingScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();
  const [isLoading, setIsLoading] = useState<any>(false);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<any>(null);
  const [serviceNotes, setServiceNotes] = useState<any>('');

  const { originalJob, mechanic } = route.params || {};

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const validationRules = {
    serviceNotes: [{ validator: 'maxLength', message: 'Notes must be less than 500 characters' }],
  };

  const handleRebook = async (values: any) => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Selection Required', 'Please select both date and time for your service');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const rebookData = {
        originalJobId: originalJob?.id,
        customerId: user?.id,
        mechanicId: mechanic?.id || originalJob?.mechanic?.id,
        serviceType: originalJob?.title,
        description: originalJob?.description,
        price: originalJob?.price,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        serviceNotes: values.serviceNotes || '',
        location: originalJob?.location,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // In a real app, you would save this to your API
      
      Alert.alert(
        'Rebooking Successful!',
        `Your service has been rebooked for ${selectedDate} at ${selectedTime}. The mechanic will be notified.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to rebook service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isDateAvailable = (date: any) => {
    // In a real app, you would check mechanic availability
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Rebook Service"
        onBackPress={() => navigation.goBack()}
        showBack
      />
      
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Original Job Info */}
          {originalJob && (
            <MaterialCard style={[styles.jobCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Original Service</Text>
              <Text style={[styles.jobTitle, { color: theme.text }]}>{originalJob.title}</Text>
              <Text style={[styles.jobDescription, { color: theme.textSecondary }]}>
                {originalJob.description}
              </Text>
              <View style={styles.jobDetails}>
                <View style={styles.jobDetail}>
                  <IconFallback name="person" size={16} color={theme.textSecondary} />
                  <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                    {mechanic?.name || originalJob.mechanic?.name || 'Mechanic'}
                  </Text>
                </View>
                <View style={styles.jobDetail}>
                  <IconFallback name="attach-money" size={16} color={theme.textSecondary} />
                  <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                    ${originalJob.price}
                  </Text>
                </View>
                <View style={styles.jobDetail}>
                  <IconFallback name="location-on" size={16} color={theme.textSecondary} />
                  <Text style={[styles.jobDetailText, { color: theme.textSecondary }]}>
                    {originalJob.location}
                  </Text>
                </View>
              </View>
            </MaterialCard>
          )}

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Select Date
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Choose when you'd like to rebook this service
            </Text>
            
            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
              Calendar integration removed - Date selection functionality will be restored in a future update
            </Text>
            
            {selectedDate && (
              <View style={[styles.selectedDateContainer, { backgroundColor: theme.primary + '20' }]}>
                <IconFallback name="event" size={20} color={theme.primary} />
                <Text style={[styles.selectedDateText, { color: theme.primary }]}>
                  Selected: {formatDate(selectedDate)}
                </Text>
              </View>
            )}
          </View>

          {/* Time Selection */}
          {selectedDate && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Select Time
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Choose your preferred time slot
              </Text>
              
              <View style={styles.timeSlotsContainer}>
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      {
                        backgroundColor: selectedTime === time ? theme.primary : theme.surface,
                        borderColor: selectedTime === time ? theme.primary : theme.divider,
                      },
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        {
                          color: selectedTime === time ? 'white' : theme.text,
                        },
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Service Notes */}
          <ValidatedForm
            initialValues={{ serviceNotes: '' }}
            validationRules={validationRules}
            onSubmit={handleRebook}
            submitButtonText="Rebook Service"
            submitButtonVariant="filled"
          >
            {({ MaterialTextInput }: any) => (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Additional Notes
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Add any specific requirements or notes for this service
                </Text>
                
                <MaterialTextInput
                  name="serviceNotes"
                  label="Service Notes"
                  placeholder="Any special requirements or notes..."
                  multiline
                  numberOfLines={3}
                  leftIcon="note"
                />
              </View>
            )}
          </ValidatedForm>

          {/* Rebooking Info */}
          <MaterialCard style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <View style={styles.infoHeader}>
              <IconFallback name="info" size={20} color={theme.primary} />
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                Rebooking Information
              </Text>
            </View>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • The mechanic will be notified of your rebooking request
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • You'll receive a confirmation once the mechanic accepts
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • The same pricing and service terms apply
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • You can cancel or reschedule up to 24 hours before the service
            </Text>
          </MaterialCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  jobCard: {
    padding: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  jobDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobDetailText: {
    fontSize: 14,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  calendar: {
    marginBottom: 16,
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  placeholderText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
});
