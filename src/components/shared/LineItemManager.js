import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Modal,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import IconFallback from './IconFallback';
import MaterialTextInput from './MaterialTextInput';
import MaterialButton from './MaterialButton';
import { FadeIn } from './Animations';

const LineItemManager = ({ 
  lineItems = [], 
  onLineItemsChange, 
  readOnly = false,
  showTotal = true 
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  const [items, setItems] = useState(lineItems);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    serviceName: '',
    description: '',
    quantity: 1,
    unitPrice: '',
    category: 'labor',
    isRequired: false
  });

  const [errors, setErrors] = useState({});
  const [animationValue] = useState(new Animated.Value(0));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const categories = [
    { id: 'labor', name: 'Labor', icon: 'build' },
    { id: 'parts', name: 'Parts', icon: 'settings' },
    { id: 'materials', name: 'Materials', icon: 'inventory' },
    { id: 'other', name: 'Other', icon: 'more-horiz' }
  ];

  useEffect(() => {
    setItems(lineItems);
  }, [lineItems]);

  useEffect(() => {
    onLineItemsChange(items);
  }, [items, onLineItemsChange]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const validateItem = (item) => {
    const newErrors = {};

    if (!item.serviceName.trim()) {
      newErrors.serviceName = 'Service name is required';
    }

    if (!item.unitPrice || isNaN(parseFloat(item.unitPrice)) || parseFloat(item.unitPrice) <= 0) {
      newErrors.unitPrice = 'Valid unit price is required';
    }

    if (!item.quantity || isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (!validateItem(newItem)) return;

    const item = {
      id: editingItem?.id || `item-${Date.now()}`,
      ...newItem,
      unitPrice: parseFloat(newItem.unitPrice),
      quantity: parseInt(newItem.quantity),
      totalPrice: parseFloat(newItem.unitPrice) * parseInt(newItem.quantity)
    };

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? item : i));
      setEditingItem(null);
    } else {
      setItems(prev => [...prev, item]);
    }

    setNewItem({
      serviceName: '',
      description: '',
      quantity: 1,
      unitPrice: '',
      category: 'labor',
      isRequired: false
    });
    setShowAddForm(false);
    setErrors({});

    // Animate the addition
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      serviceName: item.serviceName,
      description: item.description || '',
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      category: item.category,
      isRequired: item.isRequired || false
    });
    setShowAddForm(true);
  };

  const handleDeleteItem = (itemId) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this line item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setItems(prev => prev.filter(item => item.id !== itemId));
          }
        }
      ]
    );
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewItem({
      serviceName: '',
      description: '',
      quantity: 1,
      unitPrice: '',
      category: 'labor',
      isRequired: false
    });
    setShowAddForm(false);
    setErrors({});
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || 'more-horiz';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Other';
  };

  const renderLineItem = (item, index) => (
    <FadeIn key={item.id} delay={index * 100}>
      <View style={[styles.lineItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleRow}>
            <IconFallback 
              name={getCategoryIcon(item.category)} 
              size={16} 
              color={theme.accent} 
            />
            <Text style={[styles.itemTitle, { color: theme.text }]}>
              {item.serviceName}
            </Text>
            {item.isRequired && (
              <View style={[styles.requiredBadge, { backgroundColor: theme.warning }]}>
                <Text style={[styles.requiredText, { color: theme.white }]}>Required</Text>
              </View>
            )}
          </View>
          {!readOnly && (
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.accent + '20' }]}
                onPress={() => handleEditItem(item)}
              >
                <IconFallback name="edit" size={14} color={theme.accent} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
                onPress={() => handleDeleteItem(item.id)}
              >
                <IconFallback name="delete" size={14} color={theme.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {item.description && (
          <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>
            {item.description}
          </Text>
        )}

        <View style={styles.itemDetails}>
          <View style={styles.itemDetail}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Category:</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {getCategoryName(item.category)}
            </Text>
          </View>
          <View style={styles.itemDetail}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Quantity:</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {item.quantity}
            </Text>
          </View>
          <View style={styles.itemDetail}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Unit Price:</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              ${(item.unitPrice || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.itemDetail}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Total:</Text>
            <Text style={[styles.detailValue, { color: theme.success, fontWeight: 'bold' }]}>
              ${(item.totalPrice || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </FadeIn>
  );

  const renderAddFormModal = () => (
    <Modal
      visible={showAddForm}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancelEdit}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
        
        <View style={styles.modalWrapper}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleCancelEdit}
            >
              <IconFallback name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.modalHeaderContent}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingItem ? 'Edit Line Item' : 'Add Line Item'}
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                {editingItem ? 'Update the line item details' : 'Add a new service, part, or material'}
              </Text>
            </View>
          </View>

          {/* Modal Content */}
          <KeyboardAvoidingView 
            style={styles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView 
              style={styles.modalContent} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
            <FadeIn>
              <View style={styles.formSection}>
                <MaterialTextInput
                  label="Service Name *"
                  value={newItem.serviceName}
                  onChangeText={(text) => setNewItem(prev => ({ ...prev, serviceName: text }))}
                  placeholder="e.g., Brake Pad Replacement"
                  error={errors.serviceName}
                />

                <MaterialTextInput
                  label="Description"
                  value={newItem.description}
                  onChangeText={(text) => setNewItem(prev => ({ ...prev, description: text }))}
                  placeholder="Additional details about this service"
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <MaterialTextInput
                      label="Quantity *"
                      value={newItem.quantity.toString()}
                      onChangeText={(text) => setNewItem(prev => ({ ...prev, quantity: text }))}
                      keyboardType="numeric"
                      placeholder="1"
                      error={errors.quantity}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <MaterialTextInput
                      label="Unit Price ($) *"
                      value={newItem.unitPrice}
                      onChangeText={(text) => setNewItem(prev => ({ ...prev, unitPrice: text }))}
                      keyboardType="numeric"
                      placeholder="0.00"
                      error={errors.unitPrice}
                    />
                  </View>
                </View>

                <View style={styles.categorySection}>
                  <Text style={[styles.sectionLabel, { color: theme.text }]}>Category</Text>
                  <View style={styles.categoryGrid}>
                    {categories.map(category => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryOption,
                          { 
                            backgroundColor: newItem.category === category.id 
                              ? theme.accent + '15' 
                              : theme.cardBackground,
                            borderColor: newItem.category === category.id 
                              ? theme.accent 
                              : theme.border,
                            borderWidth: newItem.category === category.id ? 2 : 1
                          }
                        ]}
                        onPress={() => setNewItem(prev => ({ ...prev, category: category.id }))}
                      >
                        <IconFallback 
                          name={category.icon} 
                          size={16} 
                          color={newItem.category === category.id ? theme.accent : theme.textSecondary} 
                        />
                        <Text style={[
                          styles.categoryText,
                          { 
                            color: newItem.category === category.id 
                              ? theme.accent 
                              : theme.textSecondary 
                          }
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.requiredSection}>
                  <TouchableOpacity
                    style={[
                      styles.requiredToggle,
                      {
                        backgroundColor: newItem.isRequired 
                          ? theme.accent + '10' 
                          : theme.cardBackground,
                        borderColor: newItem.isRequired 
                          ? theme.accent 
                          : theme.border,
                        borderWidth: 1,
                        padding: 12,
                        borderRadius: 8
                      }
                    ]}
                    onPress={() => setNewItem(prev => ({ ...prev, isRequired: !prev.isRequired }))}
                  >
                    <View style={[
                      styles.checkboxContainer,
                      {
                        backgroundColor: newItem.isRequired 
                          ? theme.accent 
                          : 'transparent',
                        borderColor: newItem.isRequired 
                          ? theme.accent 
                          : theme.border
                      }
                    ]}>
                      {newItem.isRequired && (
                        <IconFallback name="check" size={14} color="white" />
                      )}
                    </View>
                    <View style={styles.requiredContent}>
                      <Text style={[
                        styles.requiredLabel, 
                        { 
                          color: newItem.isRequired 
                            ? theme.accent 
                            : theme.text 
                        }
                      ]}>
                        This item is required to complete the work
                      </Text>
                      <Text style={[styles.requiredDescription, { color: theme.textSecondary }]}>
                        Mark as required if this work cannot be skipped
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </FadeIn>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Modal Actions - Always visible at bottom */}
          <View style={[
            styles.modalActions, 
            { 
              backgroundColor: theme.background, 
              borderTopColor: theme.border,
              paddingBottom: keyboardVisible ? 16 : (Platform.OS === 'ios' ? 34 : 16)
            }
          ]}>
            <MaterialButton
              title="Cancel"
              onPress={handleCancelEdit}
              variant="outline"
              style={styles.modalCancelButton}
            />
            <MaterialButton
              title={editingItem ? "Update Item" : "Add Item"}
              onPress={handleAddItem}
              style={[styles.modalAddButton, { backgroundColor: theme.accent }]}
              icon={editingItem ? "save" : "add"}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Line Items</Text>
        {!readOnly && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.accent }]}
            onPress={() => {
              console.log('Add Item button pressed');
              setShowAddForm(true);
            }}
          >
            <IconFallback name="add" size={16} color={theme.white} />
            <Text style={[styles.addButtonText, { color: theme.white }]}>Add Item</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.cardBackground }]}>
          <IconFallback name="inventory" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No line items added yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            {readOnly ? 'No additional work items' : 'Add services, parts, or materials'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
          {items.map((item, index) => renderLineItem(item, index))}
        </ScrollView>
      )}

      {renderAddFormModal()}

      {showTotal && items.length > 0 && (
        <View style={[styles.totalSection, { backgroundColor: theme.accent + '10' }]}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Amount:</Text>
            <Text style={[styles.totalAmount, { color: theme.accent }]}>
              ${getTotalAmount().toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 40,
  },
  addButtonText: {
    marginLeft: 4,
    fontWeight: '500',
  },
  itemsList: {
    flex: 1,
  },
  lineItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  requiredBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 6,
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  itemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalWrapper: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    padding: 8,
    marginRight: 8,
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  modalContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  formSection: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  categorySection: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
  },
  requiredSection: {
    marginTop: 16,
  },
  requiredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requiredContent: {
    flex: 1,
  },
  requiredLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  requiredDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    minHeight: 80, // Ensure minimum height for buttons
    position: 'relative', // Ensure it stays in place
    zIndex: 1000, // Ensure it's above other content
  },
  modalCancelButton: {
    flex: 1,
  },
  modalAddButton: {
    flex: 1,
  },
  totalSection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default LineItemManager;

