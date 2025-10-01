import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EarningsDisplayContext = createContext();

export const useEarningsDisplay = () => {
  const context = useContext(EarningsDisplayContext);
  if (!context) {
    throw new Error('useEarningsDisplay must be used within an EarningsDisplayProvider');
  }
  return context;
};

export const EarningsDisplayProvider = ({ children }) => {
  const [earningsDisplay, setEarningsDisplay] = useState('detailed');
  const [showEarnings, setShowEarnings] = useState(true);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings to AsyncStorage whenever they change
  useEffect(() => {
    saveSettings();
  }, [earningsDisplay, showEarnings, saveSettings]);

  const loadSettings = async () => {
    try {
      const savedEarningsDisplay = await AsyncStorage.getItem('earningsDisplay');
      const savedShowEarnings = await AsyncStorage.getItem('showEarnings');
      
      if (savedEarningsDisplay) {
        setEarningsDisplay(savedEarningsDisplay);
      }
      if (savedShowEarnings !== null) {
        setShowEarnings(JSON.parse(savedShowEarnings));
      }
    } catch (error) {
      console.error('Error loading earnings display settings:', error);
    }
  };

  const saveSettings = useCallback(async () => {
    try {
      await AsyncStorage.setItem('earningsDisplay', earningsDisplay);
      await AsyncStorage.setItem('showEarnings', JSON.stringify(showEarnings));
    } catch (error) {
      console.error('Error saving earnings display settings:', error);
    }
  }, [earningsDisplay, showEarnings]);

  const updateEarningsDisplay = (display) => {
    setEarningsDisplay(display);
  };

  const updateShowEarnings = (show) => {
    setShowEarnings(show);
  };

  const shouldShowEarnings = () => {
    return showEarnings && earningsDisplay !== 'hidden';
  };

  const getEarningsDisplayLevel = () => {
    return earningsDisplay;
  };

  const isDetailedEarnings = () => {
    return earningsDisplay === 'detailed';
  };

  const isSimpleEarnings = () => {
    return earningsDisplay === 'simple';
  };

  const isHiddenEarnings = () => {
    return earningsDisplay === 'hidden';
  };

  const value = {
    earningsDisplay,
    showEarnings,
    updateEarningsDisplay,
    updateShowEarnings,
    shouldShowEarnings,
    getEarningsDisplayLevel,
    isDetailedEarnings,
    isSimpleEarnings,
    isHiddenEarnings,
  };

  return (
    <EarningsDisplayContext.Provider value={value}>
      {children}
    </EarningsDisplayContext.Provider>
  );
};
