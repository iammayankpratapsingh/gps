import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';

interface SendFeedbackScreenProps {
  onBack: () => void;
}

interface FeedbackCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export default function SendFeedbackScreen({ onBack }: SendFeedbackScreenProps) {
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  const feedbackCategories: FeedbackCategory[] = [
    {
      id: 'bug',
      name: 'Bug Report',
      icon: '🐛',
      description: 'Report a bug or technical issue'
    },
    {
      id: 'feature',
      name: 'Feature Request',
      icon: '💡',
      description: 'Suggest a new feature or improvement'
    },
    {
      id: 'ui',
      name: 'UI/UX Feedback',
      icon: '🎨',
      description: 'Share feedback about the user interface'
    },
    {
      id: 'performance',
      name: 'Performance',
      icon: '⚡',
      description: 'Report performance issues or optimization suggestions'
    },
    {
      id: 'general',
      name: 'General Feedback',
      icon: '💬',
      description: 'Share general thoughts or suggestions'
    }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSubmitFeedback = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a feedback category');
      return;
    }

    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }

    if (!userEmail.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Feedback Submitted',
        'Thank you for your feedback! We appreciate your input and will review it carefully.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedCategory('');
              setFeedbackText('');
              setUserEmail('');
              onBack();
            }
          }
        ]
      );
    }, 2000);
  };

  const handleAttachScreenshot = () => {
    Alert.alert(
      'Attach Screenshot',
      'Screenshot attachment feature will be implemented soon. For now, you can describe the issue in detail.',
      [{ text: 'OK' }]
    );
  };

  const CategoryCard = ({ category }: { category: FeedbackCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        {
          backgroundColor: colors.surface,
          borderColor: selectedCategory === category.id ? colors.primary : colors.border,
          borderWidth: selectedCategory === category.id ? 2 : 1,
        }
      ]}
      onPress={() => handleCategorySelect(category.id)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryContent}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <View style={styles.categoryText}>
          <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
          <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
            {category.description}
          </Text>
        </View>
      </View>
      {selectedCategory === category.id && (
        <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Send Feedback</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>💬 Share Your Feedback</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Help us improve the app by sharing your thoughts, suggestions, or reporting issues
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📋 Select Category</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Choose the type of feedback you'd like to send
          </Text>
        </View>

        <View style={styles.categoriesContainer}>
          {feedbackCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>✉️ Contact Information</Text>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address *</Text>
            <TextInput
              style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="your.email@example.com"
              placeholderTextColor={colors.textSecondary}
              value={userEmail}
              onChangeText={setUserEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📝 Your Feedback</Text>
          
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Message *</Text>
            <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
              placeholder="Please describe your feedback in detail..."
              placeholderTextColor={colors.textSecondary}
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
              {feedbackText.length}/1000 characters
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📎 Additional Options</Text>
          
          <TouchableOpacity
            style={[styles.attachButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleAttachScreenshot}
            activeOpacity={0.7}
          >
            <Text style={styles.attachIcon}>📷</Text>
            <View style={styles.attachText}>
              <Text style={[styles.attachTitle, { color: colors.text }]}>Attach Screenshot</Text>
              <Text style={[styles.attachDescription, { color: colors.textSecondary }]}>
                Help us understand the issue better with a screenshot
              </Text>
            </View>
            <Text style={[styles.attachArrow, { color: colors.primary }]}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>ℹ️ Privacy Notice</Text>
          
          <View style={[styles.privacyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
              • Your feedback is anonymous unless you provide contact information{'\n'}
              • We may use your feedback to improve our app{'\n'}
              • We will not share your personal information with third parties{'\n'}
              • You can request to have your feedback deleted at any time
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: isSubmitting ? colors.textSecondary : colors.primary,
              opacity: isSubmitting ? 0.7 : 1
            }
          ]}
          onPress={handleSubmitFeedback}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={[styles.submitButtonText, { color: colors.surface }]}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Text>
        </TouchableOpacity>
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
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  textArea: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  attachIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  attachText: {
    flex: 1,
  },
  attachTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  attachDescription: {
    fontSize: 14,
  },
  attachArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  privacyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});


