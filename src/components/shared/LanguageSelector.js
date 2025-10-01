import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LanguageSelector({ style, showLabel = true }) {
  const { getCurrentTheme } = useTheme();
  const { currentLanguage, changeLanguage, getAvailableLanguages, getCurrentLanguageInfo } = useLanguage();
  const theme = getCurrentTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const availableLanguages = getAvailableLanguages();
  const currentLanguageInfo = getCurrentLanguageInfo();

  const handleLanguageSelect = (languageCode) => {
    changeLanguage(languageCode);
    setModalVisible(false);
  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        {
          backgroundColor: item.code === currentLanguage ? theme.primary + '20' : theme.cardBackground,
          borderColor: item.code === currentLanguage ? theme.primary : theme.border,
        },
      ]}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <Text style={styles.languageFlag}>{item.flag}</Text>
      <Text style={[styles.languageName, { color: theme.text }]}>
        {item.name}
      </Text>
      {item.code === currentLanguage && (
        <IconFallback name="check" size={20} color={theme.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={[styles.label, { color: theme.text }]}>Language</Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.currentFlag}>{currentLanguageInfo.flag}</Text>
        <Text style={[styles.currentLanguage, { color: theme.text }]}>
          {currentLanguageInfo.name}
        </Text>
        <IconFallback name="arrow-drop-down" size={24} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select Language
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <IconFallback name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableLanguages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16},
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8},
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12},
  currentFlag: {
    fontSize: 20},
  currentLanguage: {
    flex: 1,
    fontSize: 16},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'},
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%'},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'},
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold'},
  closeButton: {
    padding: 4},
  languageList: {
    paddingHorizontal: 20,
    paddingTop: 16},
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12},
  languageFlag: {
    fontSize: 20},
  languageName: {
    flex: 1,
    fontSize: 16}});
