import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PrivacyPolicyScreenProps {
  colors: any;
  onBack: () => void;
}

export default function PrivacyPolicyScreen({ colors, onBack }: PrivacyPolicyScreenProps) {
  const policySections = [
    {
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.

• Account Information: Name, email address, and profile information
• Device Information: GPS coordinates, device status, and location history
• Usage Information: How you interact with our app and services
• Technical Information: Device type, operating system, and app version`
    },
    {
      title: 'How We Use Your Information',
      content: `We use the information we collect to:

• Provide and maintain our GPS tracking services
• Process transactions and send related information
• Send technical notices, updates, and support messages
• Respond to your comments and questions
• Improve our services and develop new features
• Monitor and analyze usage and trends
• Detect, investigate, and prevent security incidents`
    },
    {
      title: 'Information Sharing',
      content: `We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:

• With service providers who assist us in operating our app
• When required by law or to protect our rights
• In connection with a business transfer or acquisition
• With your explicit consent for specific purposes

We may share aggregated, non-personally identifiable information for research and analytics purposes.`
    },
    {
      title: 'Data Security',
      content: `We implement appropriate security measures to protect your personal information:

• Encryption of data in transit and at rest
• Regular security audits and updates
• Access controls and authentication
• Secure data centers and infrastructure
• Employee training on data protection

However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`
    },
    {
      title: 'Location Data',
      content: `Our app collects and processes location data to provide GPS tracking services:

• Location data is collected only when the app is active
• You can disable location services in your device settings
• Location history is stored securely and encrypted
• You can request deletion of your location data
• Location data is not shared with third parties without consent

We use location data solely for the purpose of providing our tracking services.`
    },
    {
      title: 'Your Rights',
      content: `You have the following rights regarding your personal information:

• Access: Request a copy of your personal data
• Rectification: Correct inaccurate or incomplete data
• Erasure: Request deletion of your personal data
• Portability: Receive your data in a structured format
• Restriction: Limit how we process your data
• Objection: Object to certain types of processing

To exercise these rights, please contact us using the information provided below.`
    },
    {
      title: 'Data Retention',
      content: `We retain your personal information for as long as necessary to:

• Provide our services to you
• Comply with legal obligations
• Resolve disputes and enforce agreements
• Improve our services

Location data is typically retained for 12 months unless you request earlier deletion. Account information is retained until you delete your account.`
    },
    {
      title: 'Children\'s Privacy',
      content: `Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.

If we discover that we have collected personal information from a child under 13, we will delete such information promptly.`
    },
    {
      title: 'Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of any changes by:

• Posting the new Privacy Policy in the app
• Sending you an email notification
• Updating the "Last Updated" date

Your continued use of our services after any changes constitutes acceptance of the updated policy.`
    },
    {
      title: 'Contact Us',
      content: `If you have any questions about this Privacy Policy or our data practices, please contact us:

Email: privacy@gpstracker.com
Address: GPS Tracker Inc., 123 Privacy Street, Data City, DC 12345
Phone: +1 (555) 123-4567

We will respond to your inquiry within 30 days.`
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={[styles.introTitle, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            Last updated: December 2024
          </Text>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            This Privacy Policy describes how GPS Tracker collects, uses, and protects your personal information when you use our mobile application and services.
          </Text>
        </View>

        {policySections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {section.content}
            </Text>
          </View>
        ))}

        <View style={styles.footerSection}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            By using our app, you agree to the collection and use of information in accordance with this Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0097b2',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  footerSection: {
    marginTop: 32,
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
