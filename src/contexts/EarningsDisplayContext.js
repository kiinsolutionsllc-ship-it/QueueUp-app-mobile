import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// AsyncStorage removed - using Supabase only

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

  // Load settings (now managed in memory only)
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings (now managed in memory only)
  useEffect(() => {
    saveSettings();
  }, [earningsDisplay, showEarnings, saveSettings]);

  const loadSettings = async () => {
    try {
      // Earnings display settings are now managed in memory only
      setEarningsDisplay('detailed');
      setShowEarnings(true);
    } catch (error) {
      console.error('Error loading earnings display settings:', error);
    }
  };

  const saveSettings = useCallback(async () => {
    try {
      // Earnings display settings are now managed in memory only
      console.log('EarningsDisplayContext: Settings managed in memory only');
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
