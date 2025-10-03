import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import ModernHeader from '../../components/shared/ModernHeader';


interface TermsOfServiceScreenProps {
  navigation: any;
}
export default function TermsOfServiceScreen({ navigation }: TermsOfServiceScreenProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Terms of Service"
        onBackPress={() => navigation.goBack()}
        showBack
      />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>
          Last updated: December 2024
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            By accessing and using the QueueUp mobile application and services, you accept and 
            agree to be bound by the terms and provision of this agreement. If you do not agree 
            to abide by the above, please do not use this service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            2. Description of Service
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            QueueUp is a mobile application that connects customers with automotive mechanics 
            for service requests. Our platform facilitates:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Service request creation and management
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Mechanic discovery and matching
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Bidding and pricing systems
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Payment processing and escrow services
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Communication and scheduling tools
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            3. User Accounts
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            To use our services, you must create an account and provide accurate, complete, 
            and current information. You are responsible for:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Maintaining the confidentiality of your account credentials
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • All activities that occur under your account
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Notifying us immediately of any unauthorized use
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Providing accurate and up-to-date information
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            4. Service Requests and Bookings
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            When creating service requests, you agree to:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Provide accurate descriptions of the required service
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Include all necessary vehicle information
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Be available for scheduled service appointments
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Pay for services as agreed upon
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Provide honest feedback and reviews
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            5. Mechanic Responsibilities
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            Mechanics using our platform must:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Possess valid licenses and certifications
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Provide accurate pricing and availability
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Complete services as described and agreed upon
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Maintain professional conduct and quality standards
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Comply with all applicable laws and regulations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            6. Payment Terms
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            Payment processing is handled securely through Stripe. You agree to:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Pay all fees and charges as agreed upon
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Provide accurate payment information
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Understand that payments may be held in escrow until service completion
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Accept our refund and cancellation policies
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            7. Prohibited Activities
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            You may not use our service to:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Violate any applicable laws or regulations
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Infringe on intellectual property rights
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Transmit harmful or malicious code
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Engage in fraudulent or deceptive practices
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Harass or abuse other users
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Attempt to gain unauthorized access to our systems
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            8. Limitation of Liability
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            QueueUp acts as a platform connecting customers and mechanics. We are not 
            responsible for the quality of services provided by mechanics or any damages 
            that may result from their work. Users interact with each other at their own risk.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            9. Dispute Resolution
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            Any disputes arising from the use of our service will be resolved through 
            binding arbitration in accordance with the rules of the American Arbitration 
            Association. This includes disputes between customers and mechanics.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            10. Termination
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We may terminate or suspend your account at any time for violation of these 
            terms or for any other reason at our sole discretion. You may also terminate 
            your account at any time by contacting us.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            11. Changes to Terms
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We reserve the right to modify these terms at any time. We will notify users 
            of significant changes through the app or via email. Continued use of the 
            service constitutes acceptance of the modified terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            12. Contact Information
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            If you have any questions about these Terms of Service, please contact us at:
          </Text>
          <Text style={[styles.contactInfo, { color: theme.textSecondary }]}>
            Email: legal@queueup.app
          </Text>
          <Text style={[styles.contactInfo, { color: theme.textSecondary }]}>
            Phone: 1-800-QUEUEUP-1
          </Text>
          <Text style={[styles.contactInfo, { color: theme.textSecondary }]}>
            Address: 123 Automotive Lane, Service City, SC 12345
          </Text>
        </View>
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
  lastUpdated: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
    marginLeft: 16,
  },
  contactInfo: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
    marginLeft: 16,
    fontWeight: '500',
  },
});
