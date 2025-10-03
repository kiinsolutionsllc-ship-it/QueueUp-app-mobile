import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
// AsyncStorage removed - using Supabase only
import { useAuth } from './AuthContextSupabase';

// Consolidated settings interface
export interface AppSettings {
  // Feature flags
  featureFlags: {
    homeScreen: boolean;
    createJob: boolean;
    jobsScreen: boolean;
    profileScreen: boolean;
    basicSettings: boolean;
    analytics: boolean;
    dataExport: boolean;
    mileageTracking: boolean;
    recallNotifications: boolean;
    googleCalendar: boolean;
    maintenanceCalendar: boolean;
    vehicleDashboard: boolean;
    exploreScreen: boolean;
    advancedMessaging: boolean;
    paymentMethods: boolean;
    serviceHistory: boolean;
    carInfo: boolean;
    customerService: boolean;
    aiRecommendations: boolean;
    socialFeatures: boolean;
    gamification: boolean;
  };
  
  // Language settings
  language: {
    currentLanguage: string;
    availableLanguages: Array<{
      code: string;
      name: string;
      flag: string;
    }>;
  };
  
  // Theme settings
  theme: {
    isDarkMode: boolean;
    primaryColor: string;
    accentColor: string;
  };
  
  // Notification settings
  notifications: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    jobUpdates: boolean;
    bidUpdates: boolean;
    paymentUpdates: boolean;
    systemUpdates: boolean;
  };
  
  // Privacy settings
  privacy: {
    shareLocation: boolean;
    shareContactInfo: boolean;
    allowAnalytics: boolean;
    allowCrashReporting: boolean;
  };
  
  // Accessibility settings
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
  };
  
  // User preferences
  preferences: {
    completedFeatures: Set<string>;
    dismissedHelp: Set<string>;
    favoriteMechanics: string[];
    savedLocations: any[];
  };
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  featureFlags: {
    homeScreen: true,
    createJob: true,
    jobsScreen: true,
    profileScreen: true,
    basicSettings: true,
    analytics: false,
    dataExport: false,
    mileageTracking: false,
    recallNotifications: false,
    googleCalendar: false,
    maintenanceCalendar: true,
    vehicleDashboard: false,
    exploreScreen: false,
    advancedMessaging: false,
    paymentMethods: false,
    serviceHistory: false,
    carInfo: true,
    customerService: true,
    aiRecommendations: false,
    socialFeatures: false,
    gamification: false,
  },
  language: {
    currentLanguage: 'en',
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      { code: 'pt', name: 'Português', flag: '🇵🇹' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    ],
  },
  theme: {
    isDarkMode: false,
    primaryColor: '#0891B2',
    accentColor: '#DC2626',
  },
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    jobUpdates: true,
    bidUpdates: true,
    paymentUpdates: true,
    systemUpdates: true,
  },
  privacy: {
    shareLocation: true,
    shareContactInfo: true,
    allowAnalytics: true,
    allowCrashReporting: true,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    screenReader: false,
    reducedMotion: false,
  },
  preferences: {
    completedFeatures: new Set(),
    dismissedHelp: new Set(),
    favoriteMechanics: [],
    savedLocations: [],
  },
};

// Context type
export interface ConsolidatedSettingsContextType {
  // State
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  
  // Feature flags
  isFeatureEnabled: (featureName: keyof AppSettings['featureFlags']) => boolean;
  toggleFeature: (featureName: keyof AppSettings['featureFlags']) => Promise<void>;
  enableFeature: (featureName: keyof AppSettings['featureFlags']) => Promise<void>;
  disableFeature: (featureName: keyof AppSettings['featureFlags']) => Promise<void>;
  
  // Language
  changeLanguage: (languageCode: string) => Promise<void>;
  getCurrentLanguage: () => string;
  getAvailableLanguages: () => Array<{ code: string; name: string; flag: string }>;
  
  // Theme
  toggleDarkMode: () => Promise<void>;
  setPrimaryColor: (color: string) => Promise<void>;
  setAccentColor: (color: string) => Promise<void>;
  
  // Notifications
  updateNotificationSettings: (updates: Partial<AppSettings['notifications']>) => Promise<void>;
  
  // Privacy
  updatePrivacySettings: (updates: Partial<AppSettings['privacy']>) => Promise<void>;
  
  // Accessibility
  updateAccessibilitySettings: (updates: Partial<AppSettings['accessibility']>) => Promise<void>;
  
  // Preferences
  markFeatureCompleted: (featureId: string) => Promise<void>;
  isFeatureCompleted: (featureId: string) => boolean;
  dismissHelp: (helpId: string) => Promise<void>;
  isHelpDismissed: (helpId: string) => boolean;
  addFavoriteMechanic: (mechanicId: string) => Promise<void>;
  removeFavoriteMechanic: (mechanicId: string) => Promise<void>;
  addSavedLocation: (location: any) => Promise<void>;
  removeSavedLocation: (locationId: string) => Promise<void>;
  
  // Utilities
  resetSettings: () => Promise<void>;
  exportSettings: () => Promise<string>;
  importSettings: (settingsJson: string) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const ConsolidatedSettingsContext = createContext<ConsolidatedSettingsContextType | undefined>(undefined);

interface ConsolidatedSettingsProviderProps {
  children: ReactNode;
}

export const ConsolidatedSettingsProvider: React.FC<ConsolidatedSettingsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings (now using default settings only)
  const loadSettings = useCallback(async (): Promise<void> => {
    try {
      // Settings are now managed in memory only - use default settings
      setSettings(DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error loading settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Save settings (now managed in memory only)
  const saveSettings = useCallback(async (newSettings: AppSettings): Promise<void> => {
    try {
      // Settings are now managed in memory only
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    }
  }, [user?.id]);

  // Feature flag functions
  const isFeatureEnabled = useCallback((featureName: keyof AppSettings['featureFlags']): boolean => {
    return settings.featureFlags[featureName];
  }, [settings.featureFlags]);

  const toggleFeature = useCallback(async (featureName: keyof AppSettings['featureFlags']): Promise<void> => {
    const newSettings = {
      ...settings,
      featureFlags: {
        ...settings.featureFlags,
        [featureName]: !settings.featureFlags[featureName],
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const enableFeature = useCallback(async (featureName: keyof AppSettings['featureFlags']): Promise<void> => {
    const newSettings = {
      ...settings,
      featureFlags: {
        ...settings.featureFlags,
        [featureName]: true,
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const disableFeature = useCallback(async (featureName: keyof AppSettings['featureFlags']): Promise<void> => {
    const newSettings = {
      ...settings,
      featureFlags: {
        ...settings.featureFlags,
        [featureName]: false,
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Language functions
  const changeLanguage = useCallback(async (languageCode: string): Promise<void> => {
    const newSettings = {
      ...settings,
      language: {
        ...settings.language,
        currentLanguage: languageCode,
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const getCurrentLanguage = useCallback((): string => {
    return settings.language.currentLanguage;
  }, [settings.language.currentLanguage]);

  const getAvailableLanguages = useCallback((): Array<{ code: string; name: string; flag: string }> => {
    return settings.language.availableLanguages;
  }, [settings.language.availableLanguages]);

  // Theme functions
  const toggleDarkMode = useCallback(async (): Promise<void> => {
    const newSettings = {
      ...settings,
      theme: {
        ...settings.theme,
        isDarkMode: !settings.theme.isDarkMode,
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setPrimaryColor = useCallback(async (color: string): Promise<void> => {
    const newSettings = {
      ...settings,
      theme: {
        ...settings.theme,
        primaryColor: color,
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const setAccentColor = useCallback(async (color: string): Promise<void> => {
    const newSettings = {
      ...settings,
      theme: {
        ...settings.theme,
        accentColor: color,
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Notification functions
  const updateNotificationSettings = useCallback(async (updates: Partial<AppSettings['notifications']>): Promise<void> => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        ...updates,
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Privacy functions
  const updatePrivacySettings = useCallback(async (updates: Partial<AppSettings['privacy']>): Promise<void> => {
    const newSettings = {
      ...settings,
      privacy: {
        ...settings.privacy,
        ...updates,
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Accessibility functions
  const updateAccessibilitySettings = useCallback(async (updates: Partial<AppSettings['accessibility']>): Promise<void> => {
    const newSettings = {
      ...settings,
      accessibility: {
        ...settings.accessibility,
        ...updates,
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Preference functions
  const markFeatureCompleted = useCallback(async (featureId: string): Promise<void> => {
    const newCompletedFeatures = new Set(settings.preferences.completedFeatures);
    newCompletedFeatures.add(featureId);
    
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        completedFeatures: newCompletedFeatures,
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const isFeatureCompleted = useCallback((featureId: string): boolean => {
    return settings.preferences.completedFeatures.has(featureId);
  }, [settings.preferences.completedFeatures]);

  const dismissHelp = useCallback(async (helpId: string): Promise<void> => {
    const newDismissedHelp = new Set(settings.preferences.dismissedHelp);
    newDismissedHelp.add(helpId);
    
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        dismissedHelp: newDismissedHelp,
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const isHelpDismissed = useCallback((helpId: string): boolean => {
    return settings.preferences.dismissedHelp.has(helpId);
  }, [settings.preferences.dismissedHelp]);

  const addFavoriteMechanic = useCallback(async (mechanicId: string): Promise<void> => {
    if (!settings.preferences.favoriteMechanics.includes(mechanicId)) {
      const newSettings = {
        ...settings,
        preferences: {
          ...settings.preferences,
          favoriteMechanics: [...settings.preferences.favoriteMechanics, mechanicId],
        },
      };
      await saveSettings(newSettings);
    }
  }, [settings, saveSettings]);

  const removeFavoriteMechanic = useCallback(async (mechanicId: string): Promise<void> => {
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        favoriteMechanics: settings.preferences.favoriteMechanics.filter(id => id !== mechanicId),
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const addSavedLocation = useCallback(async (location: any): Promise<void> => {
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        savedLocations: [...settings.preferences.savedLocations, location],
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  const removeSavedLocation = useCallback(async (locationId: string): Promise<void> => {
    const newSettings = {
      ...settings,
      preferences: {
        ...settings.preferences,
        savedLocations: settings.preferences.savedLocations.filter((loc: any) => loc.id !== locationId),
      },
    };
    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Utility functions
  const resetSettings = useCallback(async (): Promise<void> => {
    await saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  const exportSettings = useCallback(async (): Promise<string> => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback(async (settingsJson: string): Promise<void> => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      await saveSettings({ ...DEFAULT_SETTINGS, ...importedSettings });
    } catch (error) {
      throw new Error('Invalid settings format');
    }
  }, [saveSettings]);

  const refreshSettings = useCallback(async (): Promise<void> => {
    await loadSettings();
  }, [loadSettings]);

  // Initialize settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const value: ConsolidatedSettingsContextType = {
    // State
    settings,
    loading,
    error,
    
    // Feature flags
    isFeatureEnabled,
    toggleFeature,
    enableFeature,
    disableFeature,
    
    // Language
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    
    // Theme
    toggleDarkMode,
    setPrimaryColor,
    setAccentColor,
    
    // Notifications
    updateNotificationSettings,
    
    // Privacy
    updatePrivacySettings,
    
    // Accessibility
    updateAccessibilitySettings,
    
    // Preferences
    markFeatureCompleted,
    isFeatureCompleted,
    dismissHelp,
    isHelpDismissed,
    addFavoriteMechanic,
    removeFavoriteMechanic,
    addSavedLocation,
    removeSavedLocation,
    
    // Utilities
    resetSettings,
    exportSettings,
    importSettings,
    refreshSettings,
  };

  return (
    <ConsolidatedSettingsContext.Provider value={value}>
      {children}
    </ConsolidatedSettingsContext.Provider>
  );
};

export const useConsolidatedSettings = (): ConsolidatedSettingsContextType => {
  const context = useContext(ConsolidatedSettingsContext);
  if (!context) {
    throw new Error('useConsolidatedSettings must be used within a ConsolidatedSettingsProvider');
  }
  return context;
};
