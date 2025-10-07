import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import themeService, { ThemeColors } from '../services/themeService';
import { useStatusBar } from '../hooks/useStatusBar';

interface BillingPaymentsScreenProps {
  onBack: () => void;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple' | 'google';
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

export default function BillingPaymentsScreen({ onBack }: BillingPaymentsScreenProps) {
  const [colors, setColors] = React.useState<ThemeColors>(themeService.getColors());
  
  useStatusBar({ colors, animated: true });

  React.useEffect(() => {
    const unsubscribe = themeService.subscribe(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: '12',
      expiryYear: '2025',
      isDefault: true
    },
    {
      id: '2',
      type: 'paypal',
      last4: 'user@email.com',
      brand: 'PayPal',
      expiryMonth: '',
      expiryYear: '',
      isDefault: false
    }
  ];

  const billingHistory: BillingHistory[] = [
    {
      id: '1',
      date: '2024-12-15',
      description: 'Pro Plan - Monthly',
      amount: '$19.99',
      status: 'paid',
      invoiceUrl: 'https://example.com/invoice/1'
    },
    {
      id: '2',
      date: '2024-11-15',
      description: 'Pro Plan - Monthly',
      amount: '$19.99',
      status: 'paid',
      invoiceUrl: 'https://example.com/invoice/2'
    },
    {
      id: '3',
      date: '2024-10-15',
      description: 'Pro Plan - Monthly',
      amount: '$19.99',
      status: 'paid',
      invoiceUrl: 'https://example.com/invoice/3'
    },
    {
      id: '4',
      date: '2024-09-15',
      description: 'Basic Plan - Monthly',
      amount: '$9.99',
      status: 'paid',
      invoiceUrl: 'https://example.com/invoice/4'
    }
  ];

  const handleAddPaymentMethod = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose how you would like to add a new payment method:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Credit/Debit Card', onPress: () => console.log('Adding card...') },
        { text: 'PayPal', onPress: () => console.log('Adding PayPal...') },
        { text: 'Apple Pay', onPress: () => console.log('Adding Apple Pay...') }
      ]
    );
  };

  const handleSetDefault = (methodId: string) => {
    Alert.alert(
      'Set Default Payment',
      'Set this as your default payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set Default', onPress: () => console.log('Setting default:', methodId) }
      ]
    );
  };

  const handleRemovePaymentMethod = (methodId: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => console.log('Removing:', methodId) }
      ]
    );
  };

  const handleDownloadInvoice = (invoiceUrl: string) => {
    Alert.alert(
      'Download Invoice',
      'Invoice will be downloaded to your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => console.log('Downloading:', invoiceUrl) }
      ]
    );
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return '💳';
      case 'paypal': return '🅿️';
      case 'apple': return '🍎';
      case 'google': return 'G';
      default: return '💳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'pending': return colors.warning;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const PaymentMethodCard = ({ method }: { method: PaymentMethod }) => (
    <View style={[styles.paymentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentIcon}>{getPaymentMethodIcon(method.type)}</Text>
          <View style={styles.paymentDetails}>
            <Text style={[styles.paymentBrand, { color: colors.text }]}>{method.brand}</Text>
            <Text style={[styles.paymentNumber, { color: colors.textSecondary }]}>
              {method.type === 'card' ? `**** **** **** ${method.last4}` : method.last4}
            </Text>
            {method.type === 'card' && (
              <Text style={[styles.paymentExpiry, { color: colors.textSecondary }]}>
                Expires {method.expiryMonth}/{method.expiryYear}
              </Text>
            )}
          </View>
        </View>
        {method.isDefault && (
          <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.defaultText, { color: colors.surface }]}>Default</Text>
          </View>
        )}
      </View>
      
      <View style={styles.paymentActions}>
        {!method.isDefault && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            onPress={() => handleSetDefault(method.id)}
          >
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.border }]}
          onPress={() => handleRemovePaymentMethod(method.id)}
        >
          <Text style={[styles.actionButtonText, { color: colors.error }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const BillingHistoryItem = ({ item }: { item: BillingHistory }) => (
    <View style={[styles.billingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.billingHeader}>
        <View style={styles.billingInfo}>
          <Text style={[styles.billingDescription, { color: colors.text }]}>{item.description}</Text>
          <Text style={[styles.billingDate, { color: colors.textSecondary }]}>
            {new Date(item.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        <View style={styles.billingAmount}>
          <Text style={[styles.amount, { color: colors.text }]}>{item.amount}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={[styles.statusText, { color: colors.surface }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      
      {item.invoiceUrl && (
        <TouchableOpacity
          style={styles.invoiceButton}
          onPress={() => handleDownloadInvoice(item.invoiceUrl!)}
        >
          <Text style={[styles.invoiceButtonText, { color: colors.primary }]}>
            Download Invoice →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Billing & Payments</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>💳 Payment Methods</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Manage your payment methods and billing information
          </Text>
        </View>

        <View style={styles.paymentMethodsContainer}>
          {paymentMethods.map((method) => (
            <PaymentMethodCard key={method.id} method={method} />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addPaymentButton, { backgroundColor: colors.primary }]}
          onPress={handleAddPaymentMethod}
          activeOpacity={0.8}
        >
          <Text style={[styles.addPaymentText, { color: colors.surface }]}>
            + Add Payment Method
          </Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Billing History</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            View your past invoices and payment history
          </Text>
        </View>

        <View style={styles.billingHistoryContainer}>
          {billingHistory.map((item) => (
            <BillingHistoryItem key={item.id} item={item} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>ℹ️ Billing Information</Text>
          
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Next Billing Date</Text>
            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
              January 15, 2025
            </Text>
          </View>
          
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Billing Address</Text>
            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
              123 Main Street{'\n'}
              New York, NY 10001{'\n'}
              United States
            </Text>
          </View>
          
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Tax ID</Text>
            <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
              Not provided
            </Text>
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
  paymentMethodsContainer: {
    marginBottom: 16,
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentBrand: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  paymentNumber: {
    fontSize: 14,
    marginBottom: 2,
  },
  paymentExpiry: {
    fontSize: 12,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addPaymentButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  addPaymentText: {
    fontSize: 16,
    fontWeight: '600',
  },
  billingHistoryContainer: {
    marginBottom: 24,
  },
  billingItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  billingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  billingInfo: {
    flex: 1,
  },
  billingDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  billingDate: {
    fontSize: 14,
  },
  billingAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceButton: {
    alignSelf: 'flex-start',
  },
  invoiceButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 14,
    lineHeight: 20,
  },
});


