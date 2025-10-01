import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FeatureContext = createContext();

export const useFeatureContext = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatureContext must be used within a FeatureProvider');
  }
  return context;
};

export const FeatureProvider = ({ children }) => {
  const [completedFeatures, setCompletedFeatures] = useState(new Set());
  const [dismissedHelp, setDismissedHelp] = useState(new Set());
  const [featureOverlays, setFeatureOverlays] = useState({});
  
  // Feature flags for enabling/disabling complex features
  const [featureFlags, setFeatureFlags] = useState({
    // Core features - always enabled
    homeScreen: true,
    createJob: true,
    jobsScreen: true,
    profileScreen: true,
    basicSettings: true,
    
    // Advanced features - disabled by default for simplicity
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
    
    // Future features
    aiRecommendations: false,
    socialFeatures: false,
    gamification: false,
  });

  // Load completed features and feature flags from storage
  useEffect(() => {
    loadCompletedFeatures();
    loadFeatureFlags();
  }, []);

  const loadCompletedFeatures = async () => {
    try {
      const stored = await AsyncStorage.getItem('completedFeatures');
      if (stored) {
        setCompletedFeatures(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Error loading completed features:', error);
    }
  };

  const saveCompletedFeatures = async (features) => {
    try {
      await AsyncStorage.setItem('completedFeatures', JSON.stringify([...features]));
    } catch (error) {
      console.error('Error saving completed features:', error);
    }
  };

  const loadFeatureFlags = async () => {
    try {
      const stored = await AsyncStorage.getItem('featureFlags');
      if (stored) {
        const parsedFlags = JSON.parse(stored);
        setFeatureFlags(prev => ({ ...prev, ...parsedFlags }));
      }
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
  };

  const saveFeatureFlags = async (flags) => {
    try {
      await AsyncStorage.setItem('featureFlags', JSON.stringify(flags));
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  };

  const markFeatureCompleted = async (featureId) => {
    const newCompleted = new Set([...completedFeatures, featureId]);
    setCompletedFeatures(newCompleted);
    await saveCompletedFeatures(newCompleted);
  };

  const isFeatureCompleted = (featureId) => {
    return completedFeatures.has(featureId);
  };

  const showFeatureIntroduction = (featureId, overlayData) => {
    // Only show if not already completed
    if (!isFeatureCompleted(featureId)) {
      setFeatureOverlays(prev => ({
        ...prev,
        [featureId]: {
          ...overlayData,
          onClose: () => {
            markFeatureCompleted(featureId);
            hideFeatureIntroduction(featureId);
          }
        }
      }));
    }
  };

  const hideFeatureIntroduction = (featureId) => {
    setFeatureOverlays(prev => {
      const newOverlays = { ...prev };
      delete newOverlays[featureId];
      return newOverlays;
    });
  };

  const dismissHelp = (helpId) => {
    setDismissedHelp(prev => new Set([...prev, helpId]));
  };

  const isHelpDismissed = (helpId) => {
    return dismissedHelp.has(helpId);
  };

  const resetFeatureProgress = async () => {
    setCompletedFeatures(new Set());
    setDismissedHelp(new Set());
    setFeatureOverlays({});
    await AsyncStorage.removeItem('completedFeatures');
  };

  const getFeatureProgress = () => {
    return {
      completed: completedFeatures.size,
      total: 10, // Total number of features that can be introduced
      percentage: (completedFeatures.size / 10) * 100
    };
  };

  // Feature flag functions
  const isFeatureEnabled = (featureName) => {
    return featureFlags[featureName] || false;
  };

  const toggleFeature = async (featureName) => {
    const newFlags = {
      ...featureFlags,
      [featureName]: !featureFlags[featureName]
    };
    setFeatureFlags(newFlags);
    await saveFeatureFlags(newFlags);
  };

  const enableFeature = async (featureName) => {
    const newFlags = {
      ...featureFlags,
      [featureName]: true
    };
    setFeatureFlags(newFlags);
    await saveFeatureFlags(newFlags);
  };

  const disableFeature = async (featureName) => {
    const newFlags = {
      ...featureFlags,
      [featureName]: false
    };
    setFeatureFlags(newFlags);
    await saveFeatureFlags(newFlags);
  };

  const getEnabledFeatures = () => {
    return Object.keys(featureFlags).filter(key => featureFlags[key]);
  };

  const getDisabledFeatures = () => {
    return Object.keys(featureFlags).filter(key => !featureFlags[key]);
  };

  const resetFeatureFlags = async () => {
    const defaultFlags = {
      // Core features - always enabled
      homeScreen: true,
      createJob: true,
      jobsScreen: true,
      profileScreen: true,
      basicSettings: true,
      
      // Advanced features - disabled by default for simplicity
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
      
      // Future features
      aiRecommendations: false,
      socialFeatures: false,
      gamification: false,
    };
    setFeatureFlags(defaultFlags);
    await saveFeatureFlags(defaultFlags);
  };

  const value = {
    completedFeatures,
    dismissedHelp,
    featureOverlays,
    featureFlags,
    markFeatureCompleted,
    isFeatureCompleted,
    showFeatureIntroduction,
    hideFeatureIntroduction,
    dismissHelp,
    isHelpDismissed,
    resetFeatureProgress,
    getFeatureProgress,
    isFeatureEnabled,
    toggleFeature,
    enableFeature,
    disableFeature,
    getEnabledFeatures,
    getDisabledFeatures,
    resetFeatureFlags,
  };

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
};
