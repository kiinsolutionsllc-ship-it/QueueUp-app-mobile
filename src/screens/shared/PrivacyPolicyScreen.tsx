import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import ModernHeader from '../../components/shared/ModernHeader';


interface PrivacyPolicyScreenProps {
  navigation: any;
}
export default function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Privacy Policy"
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
            1. Information We Collect
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We collect information you provide directly to us, such as when you create an account, 
            use our services, or contact us for support. This may include:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Personal information (name, email, phone number)
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Vehicle information and service history
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Location data for service matching
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Payment information (processed securely through Stripe)
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Communication records and service reviews
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We use the information we collect to:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Provide, maintain, and improve our services
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Match you with qualified mechanics
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Process payments and send receipts
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Send you technical notices and support messages
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Respond to your comments and questions
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Monitor and analyze usage patterns
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            3. Information Sharing
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            except in the following circumstances:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • With mechanics you choose to work with
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • With service providers who assist us in operating our platform
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • When required by law or to protect our rights
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • With your explicit consent
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            4. Data Security
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. This includes:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Encryption of data in transit and at rest
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Regular security assessments and updates
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Access controls and authentication measures
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Secure payment processing through Stripe
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            5. Your Rights
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            You have the right to:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Access and update your personal information
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Delete your account and associated data
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Opt out of marketing communications
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Request a copy of your data
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.textSecondary }]}>
            • Withdraw consent for data processing
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            6. Cookies and Tracking
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We use cookies and similar technologies to enhance your experience, analyze usage, 
            and provide personalized content. You can control cookie preferences through your 
            device settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            7. Children's Privacy
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            Our services are not intended for children under 13 years of age. We do not 
            knowingly collect personal information from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            8. Changes to This Policy
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            We may update this Privacy Policy from time to time. We will notify you of any 
            changes by posting the new Privacy Policy on this page and updating the "Last updated" 
            date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            9. Contact Us
          </Text>
          <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={[styles.contactInfo, { color: theme.textSecondary }]}>
            Email: privacy@queued.app
          </Text>
          <Text style={[styles.contactInfo, { color: theme.textSecondary }]}>
            Phone: 1-800-QUEUED-1
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
