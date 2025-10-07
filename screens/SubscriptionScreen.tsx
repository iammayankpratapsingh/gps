import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';

interface SubscriptionScreenProps {
  onBack: () => void;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

export default function SubscriptionScreen({ onBack }: SubscriptionScreenProps) {
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  const [selectedPlan, setSelectedPlan] = useState<string>('free');
  
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Up to 2 devices',
        'Basic tracking',
        '7-day history',
        'Email support'
      ],
      current: true
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$9.99',
      period: 'per month',
      features: [
        'Up to 10 devices',
        'Advanced tracking',
        '30-day history',
        'Priority support',
        'Route optimization'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19.99',
      period: 'per month',
      features: [
        'Unlimited devices',
        'Real-time tracking',
        'Unlimited history',
        '24/7 support',
        'Advanced analytics',
        'Custom reports',
        'API access'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      features: [
        'Everything in Pro',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'On-premise deployment',
        'Custom branding'
      ]
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (plan && plan.id !== 'free') {
      Alert.alert(
        'Upgrade Subscription',
        `You are about to upgrade to the ${plan.name} plan for ${plan.price} ${plan.period}. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => console.log('Upgrading to:', planId) }
        ]
      );
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => console.log('Cancelling subscription...') }
      ]
    );
  };

  const handleManageBilling = () => {
    Alert.alert(
      'Manage Billing',
      'Redirecting to billing management...',
      [
        { text: 'OK', onPress: () => console.log('Opening billing management...') }
      ]
    );
  };

  const PlanCard = ({ plan }: { plan: SubscriptionPlan }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        {
          backgroundColor: colors.surface,
          borderColor: plan.popular ? colors.primary : plan.current ? colors.success : colors.border,
          borderWidth: plan.popular || plan.current ? 2 : 1,
        }
      ]}
      onPress={() => handlePlanSelect(plan.id)}
      activeOpacity={0.7}
    >
      {plan.popular && (
        <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.popularText, { color: colors.surface }]}>Most Popular</Text>
        </View>
      )}
      
      {plan.current && (
        <View style={[styles.currentBadge, { backgroundColor: colors.success }]}>
          <Text style={[styles.currentText, { color: colors.surface }]}>Current Plan</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
        <View style={styles.planPrice}>
          <Text style={[styles.priceAmount, { color: colors.primary }]}>{plan.price}</Text>
          <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>/{plan.period}</Text>
        </View>
      </View>

      <View style={styles.planFeatures}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={[styles.featureIcon, { color: colors.success }]}>✓</Text>
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.planAction}>
        <Text style={[styles.planButton, { color: colors.primary }]}>
          {plan.current ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Select Plan'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>💎 Choose Your Plan</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Select the plan that best fits your tracking needs
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {subscriptionPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Current Usage</Text>
          
          <View style={[styles.usageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.usageRow}>
              <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>Devices Used:</Text>
              <Text style={[styles.usageValue, { color: colors.text }]}>2 / 2</Text>
            </View>
            <View style={styles.usageRow}>
              <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>Storage Used:</Text>
              <Text style={[styles.usageValue, { color: colors.text }]}>1.2 GB / 2 GB</Text>
            </View>
            <View style={styles.usageRow}>
              <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>History Days:</Text>
              <Text style={[styles.usageValue, { color: colors.text }]}>7 / 7</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚙️ Subscription Management</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleManageBilling}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>💳</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Manage Billing</Text>
                <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  Update payment method and billing information
                </Text>
              </View>
            </View>
            <Text style={[styles.actionArrow, { color: colors.primary }]}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleCancelSubscription}
            activeOpacity={0.7}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionIcon}>❌</Text>
              <View style={styles.actionText}>
                <Text style={[styles.actionTitle, { color: colors.error }]}>Cancel Subscription</Text>
                <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                  Cancel your current subscription
                </Text>
              </View>
            </View>
            <Text style={[styles.actionArrow, { color: colors.primary }]}>→</Text>
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
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pricePeriod: {
    fontSize: 14,
    marginLeft: 4,
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  planAction: {
    alignItems: 'center',
  },
  planButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  usageCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 14,
  },
  usageValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});


