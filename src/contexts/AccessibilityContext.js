import React, { createContext, useContext, useState, useEffect } from 'react';
import { accessibilityService } from '../services/AccessibilityService';
// AsyncStorage removed - using Supabase only

const AccessibilityContext = createContext({});

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceResults, setVoiceResults] = useState([]);
  const [settings, setSettings] = useState({
    ttsEnabled: true,
    voiceRecognitionEnabled: true,
    ttsRate: 0.5,
    ttsPitch: 1.0,
    ttsLanguage: 'en-US',
    voiceLanguage: 'en-US',
    announceNavigation: true,
    announceButtons: true,
    announceErrors: true,
  });

  useEffect(() => {
    initializeAccessibility();
    loadSettings();
  }, []);

  const initializeAccessibility = async () => {
    try {
      const result = await accessibilityService.initialize();
      setIsInitialized(result.success);
    } catch (error) {
      console.error('Failed to initialize accessibility:', error);
    }
  };

  const loadSettings = async () => {
    try {
      // Accessibility settings are now managed in memory only
      setSettings({
        highContrast: false,
        largeText: false,
        screenReader: false,
        reducedMotion: false,
        colorBlindSupport: false
      });
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      // Accessibility settings are now managed in memory only
      console.log('AccessibilityContext: Settings managed in memory only');
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
    }
  };

  const speak = async (text, options = {}) => {
    if (!settings.ttsEnabled) return { success: false, error: 'TTS is disabled' };

    const speechOptions = {
      rate: settings.ttsRate,
      pitch: settings.ttsPitch,
      language: settings.ttsLanguage,
      ...options
    };

    const result = await accessibilityService.speak(text, speechOptions);
    setIsSpeaking(result.success);
    return result;
  };

  const stopSpeaking = async () => {
    const result = await accessibilityService.stopSpeaking();
    setIsSpeaking(false);
    return result;
  };

  const startListening = async (options = {}) => {
    if (!settings.voiceRecognitionEnabled) return { success: false, error: 'Voice recognition is disabled' };

    const voiceOptions = {
      language: settings.voiceLanguage,
      ...options
    };

    const result = await accessibilityService.startListening(voiceOptions);
    setIsListening(result.success);
    return result;
  };

  const stopListening = async () => {
    const result = await accessibilityService.stopListening();
    setIsListening(false);
    return result;
  };

  const announceToScreenReader = async (text) => {
    if (!settings.announceNavigation) return { success: false };
    return await accessibilityService.announceToScreenReader(text);
  };

  const announceButton = async (buttonText) => {
    if (!settings.announceButtons) return { success: false };
    return await speak(`Button: ${buttonText}`);
  };

  const announceError = async (errorMessage) => {
    if (!settings.announceErrors) return { success: false };
    return await speak(`Error: ${errorMessage}`);
  };

  const announceSuccess = async (message) => {
    return await speak(`Success: ${message}`);
  };

  const announceNavigation = async (screenName) => {
    if (!settings.announceNavigation) return { success: false };
    return await speak(`Navigated to ${screenName}`);
  };

  const updateSettings = async (newSettings) => {
    await saveSettings(newSettings);
  };

  const toggleTTS = async () => {
    await saveSettings({ ttsEnabled: !settings.ttsEnabled });
  };

  const toggleVoiceRecognition = async () => {
    await saveSettings({ voiceRecognitionEnabled: !settings.voiceRecognitionEnabled });
  };

  const updateTTSRate = async (rate) => {
    await saveSettings({ ttsRate: rate });
  };

  const updateTTSPitch = async (pitch) => {
    await saveSettings({ ttsPitch: pitch });
  };

  const updateTTSLanguage = async (language) => {
    await saveSettings({ ttsLanguage: language });
  };

  const updateVoiceLanguage = async (language) => {
    await saveSettings({ voiceLanguage: language });
  };

  const getVoiceResults = () => {
    return accessibilityService.getVoiceResults();
  };

  const clearVoiceResults = () => {
    accessibilityService.clearVoiceResults();
    setVoiceResults([]);
  };

  const getStatus = () => {
    return accessibilityService.getStatus();
  };

  const value = {
    // State
    isInitialized,
    isSpeaking,
    isListening,
    voiceResults,
    settings,
    
    // Actions
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    announceToScreenReader,
    announceButton,
    announceError,
    announceSuccess,
    announceNavigation,
    
    // Settings
    updateSettings,
    toggleTTS,
    toggleVoiceRecognition,
    updateTTSRate,
    updateTTSPitch,
    updateTTSLanguage,
    updateVoiceLanguage,
    
    // Utilities
    getVoiceResults,
    clearVoiceResults,
    getStatus,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
