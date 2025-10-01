import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';


interface LanguageSelectionScreenProps {
  navigation: any;
}
export default function LanguageSelectionScreen({ navigation }: LanguageSelectionScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const theme = getCurrentTheme();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  ];

  const handleLanguageSelect = async (languageCode) => {
    try {
      await changeLanguage(languageCode);
      Alert.alert(
        'Language Changed',
        'Your language preference has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change language. Please try again.');
    }
  };

  const renderLanguageItem = ({ item }) => {
    const isSelected = currentLanguage === item.code;
    
    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          {
            backgroundColor: isSelected ? theme.primary + '20' : theme.surface,
            borderColor: isSelected ? theme.primary : theme.divider,
          },
        ]}
        onPress={() => handleLanguageSelect(item.code)}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.flag}>{item.flag}</Text>
          <View style={styles.languageText}>
            <Text style={[styles.languageName, { color: theme.text }]}>
              {item.nativeName}
            </Text>
            <Text style={[styles.languageEnglish, { color: theme.textSecondary }]}>
              {item.name}
            </Text>
          </View>
        </View>
        
        {isSelected && (
          <IconFallback name="check-circle" size={24} color={theme.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Language Selection"
        onBackPress={() => navigation.goBack()}
        showBack
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Choose Your Language
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Select your preferred language for the app interface
          </Text>
        </View>

        <FlatList
          data={languages}
          renderItem={renderLanguageItem}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <MaterialCard style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <View style={styles.infoHeader}>
            <IconFallback name="info" size={20} color={theme.primary} />
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              Language Information
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Changing the language will update the entire app interface
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Some content may not be available in all languages
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • Your preference will be saved automatically
          </Text>
        </MaterialCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  listContent: {
    paddingBottom: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageEnglish: {
    fontSize: 14,
  },
  infoCard: {
    padding: 16,
    marginTop: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});
