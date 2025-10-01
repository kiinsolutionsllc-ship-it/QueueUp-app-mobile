import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import MaterialTextInput from '../../components/shared/MaterialTextInput';
import { useStripeHook, useElementsHook } from '../../providers/StripeProvider';
import { paymentServiceNew as paymentService } from '../../services/PaymentServiceNew';
import { MOCK_MODE } from '../../config/payment';


interface PaymentMethodScreenProps {
  navigation: any;
}
export default function PaymentMethodScreen({ navigation }: PaymentMethodScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  // Stripe hooks
  const stripe = useStripeHook();
  const elements = useElementsHook();
  // Use merged payment service (singleton)

  const [showAddCard, setShowAddCard] = useState<any>(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any>([]);
  const [loading, setLoading] = useState<any>(true);
  const [addingCard, setAddingCard] = useState<any>(false);
  const [newCard, setNewCard] = useState<any>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  // Load payment methods on mount
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      if (MOCK_MODE) {
        // Mock data for development
        setPaymentMethods([
          {
            id: 'card1',
            type: 'card',
            last4: '4242',
            brand: 'Visa',
            expiryMonth: '12',
            expiryYear: '25',
            isDefault: true,
          },
          {
            id: 'card2',
            type: 'card',
            last4: '5555',
            brand: 'Mastercard',
            expiryMonth: '08',
            expiryYear: '26',
            isDefault: false,
          },
        ]);
      } else {
        // Real Stripe integration
        const methods = await paymentService.getPaymentMethods(user?.id || '');
        setPaymentMethods(methods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!newCard.cardNumber || !newCard.expiryDate || !newCard.cvv || !newCard.cardholderName) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }

    try {
      setAddingCard(true);
      
      if (MOCK_MODE) {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 2000));
        Alert.alert('Success', 'Payment method added successfully!');
      } else {
        // Real Stripe integration
        if (!stripe) {
          throw new Error('Stripe is not initialized');
        }

        // Create payment method with Stripe
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          paymentMethodType: 'card',
          card: {
            number: newCard.cardNumber.replace(/\s/g, ''),
            exp_month: parseInt(newCard.expiryDate.split('/')[0]),
            exp_year: parseInt('20' + newCard.expiryDate.split('/')[1]),
            cvc: newCard.cvv,
          },
          billing_details: {
            name: newCard.cardholderName,
          },
        } as any);

        if (error) {
          throw new Error(error.message);
        }

        // Save payment method to backend
        await paymentService.savePaymentMethod(user?.id || '', paymentMethod.id);
        
        Alert.alert('Success', 'Payment method added successfully!');
      }

      setShowAddCard(false);
      setNewCard({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
      });
      
      // Reload payment methods
      await loadPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', (error instanceof Error ? error.message : 'Unknown error') || 'Failed to add payment method');
    } finally {
      setAddingCard(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      if (MOCK_MODE) {
        setSelectedMethod(methodId);
        Alert.alert('Success', 'Default payment method updated!');
      } else {
        // Real Stripe integration
        await paymentService.setDefaultPaymentMethod(user?.id || '', methodId);
        setSelectedMethod(methodId);
        Alert.alert('Success', 'Default payment method updated!');
        await loadPaymentMethods();
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };

  const handleDeleteMethod = (methodId) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            if (MOCK_MODE) {
              Alert.alert('Success', 'Payment method deleted!');
            } else {
              // Real Stripe integration
              await paymentService.deletePaymentMethod(user?.id || '', methodId);
              Alert.alert('Success', 'Payment method deleted!');
              await loadPaymentMethods();
            }
          } catch (error) {
            console.error('Error deleting payment method:', error);
            Alert.alert('Error', 'Failed to delete payment method');
          }
        }},
      ]
    );
  };

  const renderPaymentMethod = (method) => {
    const isSelected = selectedMethod === method.id;
    const isDefault = method.isDefault;

    return (
      <MaterialCard key={method.id} style={styles.paymentMethodCard}>
        <TouchableOpacity
          style={[
            styles.paymentMethodContent,
            isSelected && { borderColor: theme.primary, borderWidth: 2 }
          ]}
          onPress={() => setSelectedMethod(method.id)}
        >
          <View style={styles.paymentMethodLeft}>
            <View style={[styles.paymentIcon, { backgroundColor: theme.primary + '20' }]}>
              {method.type === 'card' ? (
                <IconFallback name="credit-card" size={24} color={theme.primary} />
              ) : (
                <IconFallback name="account-balance-wallet" size={24} color={theme.primary} />
              )}
            </View>
            
            <View style={styles.paymentDetails}>
              {method.type === 'card' ? (
                <>
                  <Text style={[styles.paymentTitle, { color: theme.text }]}>
                    {method.brand} •••• {method.last4}
                  </Text>
                  <Text style={[styles.paymentSubtitle, { color: theme.textSecondary }]}>
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.paymentTitle, { color: theme.text }]}>
                    PayPal
                  </Text>
                  <Text style={[styles.paymentSubtitle, { color: theme.textSecondary }]}>
                    {method.email}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.paymentMethodRight}>
            {isDefault && (
              <View style={[styles.defaultBadge, { backgroundColor: theme.success }]}>
                <Text style={[styles.defaultText, { color: theme.onSuccess }]}>Default</Text>
              </View>
            )}
            
            <View style={styles.paymentActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSetDefault(method.id)}
              >
                <IconFallback name="star" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteMethod(method.id)}
              >
                <IconFallback name="delete" size={20} color={theme.error} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </MaterialCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Payment Methods"
        subtitle="Manage your payment options"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          { 
            icon: 'add', 
            onPress: () => setShowAddCard(true),
            color: theme.primary
          },
        ]}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Methods List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Saved Payment Methods</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading payment methods...
              </Text>
            </View>
          ) : paymentMethods.length > 0 ? (
            paymentMethods.map(renderPaymentMethod)
          ) : (
            <View style={styles.emptyState}>
              <IconFallback name="credit-card" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                No payment methods saved
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
                Add a payment method to get started
              </Text>
            </View>
          )}
        </View>

        {/* Add New Payment Method */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.cardBackground, borderColor: theme.primary }]}
            onPress={() => setShowAddCard(true)}
          >
            <IconFallback name="add" size={24} color={theme.primary} />
            <Text style={[styles.addButtonText, { color: theme.primary }]}>
              Add New Payment Method
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Notice */}
        <View style={styles.section}>
          <View style={[styles.securityNotice, { backgroundColor: theme.info + '20' }]}>
            <IconFallback name="security" size={20} color={theme.info} />
            <Text style={[styles.securityText, { color: theme.text }]}>
              Your payment information is encrypted and secure. We never store your full card details.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        visible={showAddCard}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddCard(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Card</Text>
              <TouchableOpacity onPress={() => setShowAddCard(false)}>
                <IconFallback name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <MaterialTextInput
                label="Card Number"
                value={newCard.cardNumber}
                onChangeText={(text) => setNewCard({...newCard, cardNumber: text})}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
              />
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <MaterialTextInput
                    label="Expiry Date"
                    value={newCard.expiryDate}
                    onChangeText={(text) => setNewCard({...newCard, expiryDate: text})}
                    placeholder="MM/YY"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <MaterialTextInput
                    label="CVV"
                    value={newCard.cvv}
                    onChangeText={(text) => setNewCard({...newCard, cvv: text})}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
              
              <MaterialTextInput
                label="Cardholder Name"
                value={newCard.cardholderName}
                onChangeText={(text) => setNewCard({...newCard, cardholderName: text})}
                placeholder="John Doe"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <MaterialButton
                title="Cancel"
                onPress={() => setShowAddCard(false)}
                variant="outline"
                style={styles.cancelButton}
              />
              <MaterialButton
                title={addingCard ? "Adding..." : "Add Card"}
                onPress={handleAddCard}
                style={styles.addCardButton}
                loading={addingCard}
                disabled={addingCard}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paymentMethodCard: {
    marginBottom: 12,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
  },
  paymentMethodRight: {
    alignItems: 'flex-end',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
  },
  addCardButton: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
});

