import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';


interface HelpSupportScreenProps {
  navigation: any;
}
export default function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const [expandedFAQ, setExpandedFAQ] = useState<any>(null);

  const faqItems = [
    {
      id: 1,
      question: 'How do I create a service request?',
      answer: 'To create a service request, go to the Home screen and tap "Create Job". Fill in the details about your vehicle and the service needed, then submit your request. Mechanics in your area will be able to see and bid on your job.',
    },
    {
      id: 2,
      question: 'How do I find a mechanic?',
      answer: 'You can find mechanics by going to the Explore screen. You can search by specialty, location, or rating. Each mechanic profile shows their experience, ratings, and availability.',
    },
    {
      id: 3,
      question: 'How does payment work?',
      answer: 'Payments are processed securely through Stripe. You can add multiple payment methods in your settings. Payment is held in escrow until the service is completed and you confirm satisfaction.',
    },
    {
      id: 4,
      question: 'Can I cancel a service request?',
      answer: 'Yes, you can cancel a service request up to 24 hours before the scheduled service time. Go to your bookings and select the job you want to cancel.',
    },
    {
      id: 5,
      question: 'How do I rate a mechanic?',
      answer: 'After a service is completed, you can rate the mechanic by going to your bookings and selecting the completed job. You can rate different aspects of the service and leave a review.',
    },
    {
      id: 6,
      question: 'What if I have a problem with a service?',
      answer: 'If you have any issues with a service, you can contact our support team through the Help & Support section. We will work with you and the mechanic to resolve any problems.',
    },
  ];

  const supportOptions = [
    {
      title: 'Contact Support',
      subtitle: 'Get help from our support team',
      icon: 'support-agent',
      action: () => {
        Alert.alert(
          'Contact Support',
          'Choose how you\'d like to contact us',
          [
            { text: 'Email', onPress: () => Linking.openURL('mailto:support@queued.app') },
            { text: 'Phone', onPress: () => Linking.openURL('tel:+1800QUEUED1') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      },
    },
    {
      title: 'Live Chat',
      subtitle: 'Chat with a support agent',
      icon: 'chat',
      action: () => Alert.alert('Live Chat', 'Live chat feature coming soon!'),
    },
    {
      title: 'Report a Bug',
      subtitle: 'Report technical issues',
      icon: 'bug-report',
      action: () => Alert.alert('Report Bug', 'Bug reporting feature coming soon!'),
    },
    {
      title: 'Feature Request',
      subtitle: 'Suggest new features',
      icon: 'lightbulb',
      action: () => Alert.alert('Feature Request', 'Feature request form coming soon!'),
    },
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const renderFAQItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.faqItem, { backgroundColor: theme.surface }]}
      onPress={() => toggleFAQ(item.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: theme.text }]}>
          {item.question}
        </Text>
        <IconFallback name={expandedFAQ === item.id ? 'expand-less' : 'expand-more'} size={24} color={theme.textSecondary} />
      </View>
      {expandedFAQ === item.id && (
        <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
          {item.answer}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderSupportOption = (option) => (
    <TouchableOpacity
      key={option.title}
      style={[styles.supportOption, { backgroundColor: theme.surface }]}
      onPress={option.action}
    >
      <View style={styles.supportInfo}>
        <IconFallback name={option.icon} size={24} color={theme.primary} />
        <View style={styles.supportText}>
          <Text style={[styles.supportTitle, { color: theme.text }]}>
            {option.title}
          </Text>
          <Text style={[styles.supportSubtitle, { color: theme.textSecondary }]}>
            {option.subtitle}
          </Text>
        </View>
      </View>
      <IconFallback name="chevron-right" size={24} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Help & Support"
        onBackPress={() => navigation.goBack()}
        showBack
      />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            How can we help you?
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Find answers to common questions or get in touch with our support team
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
          
          <View style={styles.supportGrid}>
            {supportOptions.map(renderSupportOption)}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Frequently Asked Questions
          </Text>
          
          <View style={styles.faqContainer}>
            {faqItems.map(renderFAQItem)}
          </View>
        </View>

        {/* Contact Information */}
        <MaterialCard style={[styles.contactCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.contactTitle, { color: theme.text }]}>
            Contact Information
          </Text>
          
          <View style={styles.contactItem}>
            <IconFallback name="email" size={20} color={theme.primary} />
            <Text style={[styles.contactText, { color: theme.textSecondary }]}>
              support@queued.app
            </Text>
          </View>
          
          <View style={styles.contactItem}>
            <IconFallback name="phone" size={20} color={theme.primary} />
            <Text style={[styles.contactText, { color: theme.textSecondary }]}>
              1-800-QUEUED-1
            </Text>
          </View>
          
          <View style={styles.contactItem}>
            <IconFallback name="schedule" size={20} color={theme.primary} />
            <Text style={[styles.contactText, { color: theme.textSecondary }]}>
              Mon-Fri 9AM-6PM EST
            </Text>
          </View>
        </MaterialCard>

        {/* App Information */}
        <MaterialCard style={[styles.appInfoCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.appInfoTitle, { color: theme.text }]}>
            App Information
          </Text>
          
          <View style={styles.appInfoItem}>
            <Text style={[styles.appInfoLabel, { color: theme.textSecondary }]}>
              Version:
            </Text>
            <Text style={[styles.appInfoValue, { color: theme.text }]}>
              5.0.0
            </Text>
          </View>
          
          <View style={styles.appInfoItem}>
            <Text style={[styles.appInfoLabel, { color: theme.textSecondary }]}>
              Build:
            </Text>
            <Text style={[styles.appInfoValue, { color: theme.text }]}>
              2024.12.01
            </Text>
          </View>
          
          <View style={styles.appInfoItem}>
            <Text style={[styles.appInfoLabel, { color: theme.textSecondary }]}>
              Platform:
            </Text>
            <Text style={[styles.appInfoValue, { color: theme.text }]}>
              React Native
            </Text>
          </View>
        </MaterialCard>

        {/* Feedback */}
        <MaterialButton
          title="Send Feedback"
          onPress={() => Alert.alert('Feedback', 'Feedback form coming soon!')}
          variant="outlined"
          style={styles.feedbackButton}
        />
      </ScrollView>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  supportGrid: {
    gap: 12,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  supportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportText: {
    marginLeft: 12,
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  faqContainer: {
    gap: 12,
  },
  faqItem: {
    padding: 16,
    borderRadius: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  contactCard: {
    padding: 16,
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    marginLeft: 8,
  },
  appInfoCard: {
    padding: 16,
    marginBottom: 24,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  appInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  appInfoLabel: {
    fontSize: 14,
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackButton: {
    marginTop: 16,
  },
});
