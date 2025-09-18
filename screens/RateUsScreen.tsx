import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RateUsScreenProps {
  colors: any;
  onBack: () => void;
}

export default function RateUsScreen({ colors, onBack }: RateUsScreenProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmitRating = () => {
    if (selectedRating === 0) {
      Alert.alert('Select Rating', 'Please select a rating before submitting.');
      return;
    }
    
    // TODO: Implement rating submission to app store
    Alert.alert(
      'Thank You!', 
      `Thank you for rating us ${selectedRating} stars! Your feedback helps us improve.`,
      [
        { text: 'OK', onPress: () => onBack() }
      ]
    );
  };

  const handleSkipRating = () => {
    Alert.alert(
      'Skip Rating',
      'Are you sure you want to skip rating? You can always rate us later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => onBack() }
      ]
    );
  };

  const stars = [1, 2, 3, 4, 5];
  const ratingTexts = [
    'Poor',
    'Fair', 
    'Good',
    'Very Good',
    'Excellent'
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Rate Us</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introSection}>
          <Text style={[styles.introTitle, { color: colors.text }]}>How was your experience?</Text>
          <Text style={[styles.introDescription, { color: colors.textSecondary }]}>
            We'd love to hear your feedback about GPS Tracker. Your rating helps us improve our app.
          </Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rate our app</Text>
          <View style={styles.starsContainer}>
            {stars.map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => handleRatingSelect(star)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.star,
                  { 
                    color: star <= selectedRating ? '#FFD700' : colors.border,
                    fontSize: 40
                  }
                ]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedRating > 0 && (
            <Text style={[styles.ratingText, { color: colors.primary }]}>
              {ratingTexts[selectedRating - 1]}
            </Text>
          )}
        </View>

        <View style={styles.feedbackSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tell us more (Optional)</Text>
          <View style={[styles.feedbackContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.feedbackPlaceholder, { color: colors.textSecondary }]}>
              Share your thoughts about the app, what you like, or what we could improve...
            </Text>
          </View>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Why rate us?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🚀</Text>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Help us improve the app with your feedback
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>⭐</Text>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Support our development team
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>👥</Text>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Help other users discover our app
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              { 
                backgroundColor: selectedRating > 0 ? colors.primary : colors.border,
                opacity: selectedRating > 0 ? 1 : 0.5
              }
            ]}
            onPress={handleSubmitRating}
            disabled={selectedRating === 0}
          >
            <Text style={[styles.submitButtonText, { color: colors.surface }]}>
              Submit Rating
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.skipButton, { borderColor: colors.border }]}
            onPress={handleSkipRating}
          >
            <Text style={[styles.skipButtonText, { color: colors.text }]}>
              Maybe Later
            </Text>
          </TouchableOpacity>
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
    marginTop: 32,
    marginBottom: 32,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  introDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 40,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  feedbackSection: {
    marginBottom: 32,
  },
  feedbackContainer: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
  },
  feedbackPlaceholder: {
    fontSize: 14,
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefitsList: {
    marginTop: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionsSection: {
    marginBottom: 32,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
