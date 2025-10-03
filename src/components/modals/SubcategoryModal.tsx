import React, { useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Modal,
  Pressable
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ModalComponentProps, ServiceSubcategory } from '../../types/JobTypes';
import { useTheme } from '../../contexts/ThemeContext';
import { createJobStyles } from '../../styles/CreateJobScreenStyles';
import IconFallback from '../shared/IconFallback';

interface SubcategoryModalProps extends ModalComponentProps {
  category: string;
  subcategories: ServiceSubcategory[];
  onSubcategorySelect: (subcategory: ServiceSubcategory) => void;
  selectedSubcategory?: string;
}

const SubcategoryModal: React.FC<SubcategoryModalProps> = ({
  visible,
  onClose,
  theme,
  category,
  subcategories,
  onSubcategorySelect,
  selectedSubcategory,
}) => {
  const baseStyles = createJobStyles(theme);
  const styles = { ...baseStyles, ...additionalStyles };


  // Handle subcategory selection
  const handleSubcategorySelect = useCallback((subcategory: ServiceSubcategory) => {
    onSubcategorySelect(subcategory);
    onClose();
  }, [onSubcategorySelect, onClose]);

  // Format price
  const formatPrice = useCallback((price: number) => {
    return `$${price}`;
  }, []);

  // Get category display name
  const getCategoryDisplayName = useCallback(() => {
    const categoryMap: Record<string, string> = {
      'maintenance': 'Maintenance Services',
      'repair': 'Repair Services',
      'diagnostic': 'Diagnostic Services',
      'emergency': 'Emergency Services',
    };
    return categoryMap[category] || category;
  }, [category]);

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <Pressable 
        style={[styles.modalOverlay, { backgroundColor: theme.background }]}
        onPress={onClose}
      >
        <Pressable 
          style={[styles.modalContainer, { backgroundColor: theme.background, flex: 1 }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {getCategoryDisplayName()}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: (theme as any).surfaceVariant || theme.surface || '#F1F5F9' }]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <MaterialIcons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalContent}>
            <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
              Select a specific service or choose "General {category}" for a custom quote
            </Text>

            {/* Subcategories */}
            <View style={styles.subcategoryList}>
              {subcategories && subcategories.length > 0 ? subcategories.map((subcategory) => (
                <TouchableOpacity
                  key={subcategory.id}
                  style={[
                    styles.subcategoryCard,
                    { 
                      borderColor: theme.border,
                      backgroundColor: theme.surface,
                    },
                    selectedSubcategory === subcategory.id && {
                      borderColor: theme.primary,
                      backgroundColor: theme.primary + '10',
                    },
                  ]}
                  onPress={() => handleSubcategorySelect(subcategory)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${subcategory.name}`}
                  accessibilityHint={`Price: ${formatPrice(subcategory.price)}, Time: ${subcategory.estimatedTime}`}
                  accessibilityState={{ selected: selectedSubcategory === subcategory.id }}
                >
                  <View style={styles.subcategoryContent}>
                    <View style={styles.subcategoryInfo}>
                      <Text
                        style={[
                          styles.subcategoryName,
                          { color: selectedSubcategory === subcategory.id ? theme.primary : theme.text }
                        ]}
                      >
                        {subcategory.name}
                      </Text>
                      <Text
                        style={[
                          styles.subcategoryDescription,
                          { color: selectedSubcategory === subcategory.id ? theme.primary : theme.textSecondary }
                        ]}
                      >
                        {subcategory.description}
                      </Text>
                      <View style={styles.subcategoryDetails}>
                        <Text
                          style={[
                            styles.subcategoryPrice,
                            { color: selectedSubcategory === subcategory.id ? theme.primary : theme.text }
                          ]}
                        >
                          {formatPrice(subcategory.price)}
                        </Text>
                        <Text
                          style={[
                            styles.subcategoryTime,
                            { color: selectedSubcategory === subcategory.id ? theme.primary : theme.textSecondary }
                          ]}
                        >
                          {subcategory.estimatedTime}
                        </Text>
                      </View>
                    </View>
                    <MaterialIcons
                      name={selectedSubcategory === subcategory.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                      size={18}
                      color={selectedSubcategory === subcategory.id ? theme.primary : theme.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              )) : (
                <View style={styles.noSubcategoriesContainer}>
                  <Text style={[styles.noSubcategoriesText, { color: theme.textSecondary }]}>
                    No specific services available for {category}. Please select "General {category}" below.
                  </Text>
                </View>
              )}
            </View>

            {/* General Option */}
            <TouchableOpacity
              style={[
                styles.generalOptionCard,
                { 
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                },
                selectedSubcategory === 'general' && {
                  borderColor: theme.primary,
                  backgroundColor: theme.primary + '10',
                },
              ]}
              onPress={() => handleSubcategorySelect({
                id: 'general',
                name: `General ${category}`,
                price: 0,
                estimatedTime: 'To be determined',
                description: 'Custom service - price will be determined after inspection',
              })}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Select general ${category} service`}
              accessibilityHint="Custom service with price to be determined"
              accessibilityState={{ selected: selectedSubcategory === 'general' }}
            >
              <View style={styles.generalOptionContent}>
                <IconFallback
                  name="help-outline"
                  size={20}
                  color={selectedSubcategory === 'general' ? theme.primary : theme.textSecondary}
                  style={styles.generalOptionIcon}
                />
                <View style={styles.generalOptionInfo}>
                  <Text
                    style={[
                      styles.generalOptionName,
                      { color: selectedSubcategory === 'general' ? theme.primary : theme.text }
                    ]}
                  >
                    General {category}
                  </Text>
                  <Text
                    style={[
                      styles.generalOptionDescription,
                      { color: selectedSubcategory === 'general' ? theme.primary : theme.textSecondary }
                    ]}
                  >
                    Custom service - price will be determined after inspection
                  </Text>
                </View>
                <MaterialIcons
                  name={selectedSubcategory === 'general' ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={18}
                  color={selectedSubcategory === 'general' ? theme.primary : theme.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={onClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel selection"
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Additional styles for this component
const additionalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 50, // Account for status bar
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 16,
  },
  subcategoryList: {
    marginBottom: 16,
  },
  subcategoryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  subcategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryInfo: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  subcategoryDescription: {
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 4,
  },
  subcategoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subcategoryPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  subcategoryTime: {
    fontSize: 11,
  },
  generalOptionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  generalOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generalOptionIcon: {
    marginRight: 10,
  },
  generalOptionInfo: {
    flex: 1,
  },
  generalOptionName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  generalOptionDescription: {
    fontSize: 13,
    lineHeight: 16,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  noSubcategoriesContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noSubcategoriesText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SubcategoryModal;
