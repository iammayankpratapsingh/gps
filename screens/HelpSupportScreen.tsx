import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';

interface HelpSupportScreenProps {
  onBack: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export default function HelpSupportScreen({ onBack }: HelpSupportScreenProps) {
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I add a new device?',
      answer: 'To add a new device, go to the Devices tab and tap the + button. Enter your device ID and follow the setup instructions.',
      category: 'Getting Started'
    },
    {
      id: '2',
      question: 'Why is my device showing as offline?',
      answer: 'A device may show as offline if it hasn\'t sent location data recently, has low battery, or is in an area with poor GPS signal.',
      category: 'Troubleshooting'
    },
    {
      id: '3',
      question: 'How do I change my subscription plan?',
      answer: 'Go to Account > Subscription and select the plan you want. Changes will take effect on your next billing cycle.',
      category: 'Billing'
    },
    {
      id: '4',
      question: 'Can I track multiple devices?',
      answer: 'Yes! The number of devices you can track depends on your subscription plan. Free users can track up to 2 devices.',
      category: 'Features'
    },
    {
      id: '5',
      question: 'How accurate is the GPS tracking?',
      answer: 'GPS accuracy typically ranges from 3-5 meters in good conditions. Accuracy may vary based on weather, terrain, and device quality.',
      category: 'Technical'
    },
    {
      id: '6',
      question: 'How do I export my location data?',
      answer: 'Go to Reports > Location Reports and use the export feature to download your data in various formats.',
      category: 'Data'
    }
  ];

  const supportOptions: SupportOption[] = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: '📧',
      action: () => {
        Linking.openURL('mailto:support@gpstracker.com?subject=Support Request').catch(() => {
          Alert.alert('Error', 'Could not open email client');
        });
      }
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: '💬',
      action: () => {
        Alert.alert(
          'Live Chat',
          'Live chat is available Monday-Friday, 9 AM - 6 PM EST.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Start Chat', onPress: () => console.log('Starting live chat...') }
          ]
        );
      }
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      icon: '📞',
      action: () => {
        Alert.alert(
          'Phone Support',
          'Call us at +1 (555) 123-4567\nAvailable Monday-Friday, 9 AM - 6 PM EST',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call Now', onPress: () => Linking.openURL('tel:+15551234567') }
          ]
        );
      }
    },
    {
      id: 'community',
      title: 'Community Forum',
      description: 'Get help from other users and experts',
      icon: '👥',
      action: () => {
        Linking.openURL('https://community.gpstracker.com').catch(() => {
          Alert.alert('Error', 'Could not open community forum');
        });
      }
    }
  ];

  const handleFAQToggle = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const handleSearchHelp = () => {
    Alert.alert(
      'Search Help',
      'Search functionality will be implemented soon. For now, browse the FAQ below.',
      [{ text: 'OK' }]
    );
  };

  const FAQItem = ({ item }: { item: FAQItem }) => (
    <TouchableOpacity
      style={[styles.faqItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleFAQToggle(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <View style={styles.faqQuestion}>
          <Text style={[styles.faqQuestionText, { color: colors.text }]}>{item.question}</Text>
          <Text style={[styles.faqCategory, { color: colors.textSecondary }]}>{item.category}</Text>
        </View>
        <Text style={[styles.faqArrow, { color: colors.primary }]}>
          {expandedFAQ === item.id ? '▲' : '▼'}
        </Text>
      </View>
      
      {expandedFAQ === item.id && (
        <View style={styles.faqAnswer}>
          <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>
            {item.answer}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const SupportOptionCard = ({ option }: { option: SupportOption }) => (
    <TouchableOpacity
      style={[styles.supportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={option.action}
      activeOpacity={0.7}
    >
      <View style={styles.supportContent}>
        <Text style={styles.supportIcon}>{option.icon}</Text>
        <View style={styles.supportText}>
          <Text style={[styles.supportTitle, { color: colors.text }]}>{option.title}</Text>
          <Text style={[styles.supportDescription, { color: colors.textSecondary }]}>
            {option.description}
          </Text>
        </View>
      </View>
      <Text style={[styles.supportArrow, { color: colors.primary }]}>→</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🔍 Quick Help</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Find answers to common questions and get support
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleSearchHelp}
          activeOpacity={0.7}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={[styles.searchText, { color: colors.textSecondary }]}>
            Search help articles...
          </Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📞 Contact Support</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Choose how you'd like to get help
          </Text>
        </View>

        <View style={styles.supportOptionsContainer}>
          {supportOptions.map((option) => (
            <SupportOptionCard key={option.id} option={option} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>❓ Frequently Asked Questions</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Find quick answers to common questions
          </Text>
        </View>

        <View style={styles.faqContainer}>
          {faqItems.map((item) => (
            <FAQItem key={item.id} item={item} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📚 Additional Resources</Text>
          
          <View style={[styles.resourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.resourceTitle, { color: colors.text }]}>📖 User Guide</Text>
            <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
              Comprehensive guide covering all app features and functionality
            </Text>
            <TouchableOpacity
              style={[styles.resourceButton, { backgroundColor: colors.primary }]}
              onPress={() => Linking.openURL('https://help.gpstracker.com/guide')}
            >
              <Text style={[styles.resourceButtonText, { color: colors.surface }]}>
                View Guide
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.resourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.resourceTitle, { color: colors.text }]}>🎥 Video Tutorials</Text>
            <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
              Step-by-step video tutorials for common tasks
            </Text>
            <TouchableOpacity
              style={[styles.resourceButton, { backgroundColor: colors.primary }]}
              onPress={() => Linking.openURL('https://help.gpstracker.com/videos')}
            >
              <Text style={[styles.resourceButtonText, { color: colors.surface }]}>
                Watch Videos
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.resourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.resourceTitle, { color: colors.text }]}>🐛 Report a Bug</Text>
            <Text style={[styles.resourceDescription, { color: colors.textSecondary }]}>
              Found a bug? Help us improve by reporting it
            </Text>
            <TouchableOpacity
              style={[styles.resourceButton, { backgroundColor: colors.primary }]}
              onPress={() => Linking.openURL('mailto:bugs@gpstracker.com')}
            >
              <Text style={[styles.resourceButtonText, { color: colors.surface }]}>
                Report Bug
              </Text>
            </TouchableOpacity>
          </View>
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
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 100, // Add bottom padding to prevent bottom navigation overlap
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchText: {
    fontSize: 16,
    flex: 1,
  },
  supportOptionsContainer: {
    marginBottom: 24,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  supportText: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  supportArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  faqContainer: {
    marginBottom: 24,
  },
  faqItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    marginRight: 12,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  faqCategory: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  faqArrow: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resourceCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  resourceButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resourceButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});


