import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { UseNetworkStatusReturn } from '../types/JobTypes';

interface UseNetworkStatusProps {
  onConnectionChange?: (isConnected: boolean) => void;
  onConnectionTypeChange?: (connectionType: string | null) => void;
}

export const useNetworkStatus = ({
  onConnectionChange,
  onConnectionTypeChange,
}: UseNetworkStatusProps = {}): UseNetworkStatusReturn => {
  
  const [isOnline, setIsOnline] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  // Handle network state changes
  const handleNetworkStateChange = useCallback((state: any) => {
    const wasConnected = isConnected;
    const wasOnline = isOnline;
    
    const newIsConnected = state.isConnected ?? false;
    const newIsOnline = state.isInternetReachable ?? false;
    const newConnectionType = state.type;
    
    setIsConnected(newIsConnected);
    setIsOnline(newIsOnline);
    setConnectionType(newConnectionType);
    setIsInternetReachable(state.isInternetReachable);
    
    // Notify listeners of changes
    if (wasConnected !== newIsConnected) {
      onConnectionChange?.(newIsConnected);
    }
    
    if (wasOnline !== newIsOnline) {
      onConnectionChange?.(newIsOnline);
    }
    
    if (connectionType !== newConnectionType) {
      onConnectionTypeChange?.(newConnectionType);
    }
  }, [isConnected, isOnline, connectionType, onConnectionChange, onConnectionTypeChange]);

  // Set up network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleNetworkStateChange);
    
    // Get initial network state
    NetInfo.fetch().then(handleNetworkStateChange);
    
    return unsubscribe;
  }, [handleNetworkStateChange]);

  // Check if connection is good quality
  const isGoodConnection = useCallback(() => {
    if (!isConnected || !isOnline) {
      return false;
    }
    
    // Consider WiFi and cellular as good connections
    return connectionType === 'wifi' || connectionType === 'cellular';
  }, [isConnected, isOnline, connectionType]);

  // Check if connection is slow
  const isSlowConnection = useCallback(() => {
    if (!isConnected || !isOnline) {
      return false;
    }
    
    // Consider bluetooth and ethernet as potentially slow
    return connectionType === 'bluetooth' || connectionType === 'ethernet';
  }, [isConnected, isOnline, connectionType]);

  // Get connection quality
  const getConnectionQuality = useCallback(() => {
    if (!isConnected || !isOnline) {
      return 'offline';
    }
    
    if (isGoodConnection()) {
      return 'good';
    }
    
    if (isSlowConnection()) {
      return 'slow';
    }
    
    return 'unknown';
  }, [isConnected, isOnline, isGoodConnection, isSlowConnection]);

  // Get connection status text
  const getConnectionStatusText = useCallback(() => {
    if (!isConnected) {
      return 'No Connection';
    }
    
    if (!isOnline) {
      return 'No Internet';
    }
    
    switch (connectionType) {
      case 'wifi':
        return 'WiFi Connected';
      case 'cellular':
        return 'Mobile Data';
      case 'bluetooth':
        return 'Bluetooth';
      case 'ethernet':
        return 'Ethernet';
      default:
        return 'Connected';
    }
  }, [isConnected, isOnline, connectionType]);

  // Check if should show offline warning
  const shouldShowOfflineWarning = useCallback(() => {
    return !isConnected || !isOnline;
  }, [isConnected, isOnline]);

  // Check if can perform network operations
  const canPerformNetworkOperations = useCallback(() => {
    return isConnected && isOnline;
  }, [isConnected, isOnline]);

  // Get network info summary
  const getNetworkInfo = useCallback(() => {
    return {
      isConnected,
      isOnline,
      connectionType,
      isInternetReachable,
      quality: getConnectionQuality(),
      statusText: getConnectionStatusText(),
      shouldShowWarning: shouldShowOfflineWarning(),
      canPerformOperations: canPerformNetworkOperations(),
    };
  }, [
    isConnected,
    isOnline,
    connectionType,
    isInternetReachable,
    getConnectionQuality,
    getConnectionStatusText,
    shouldShowOfflineWarning,
    canPerformNetworkOperations,
  ]);

  return {
    isOnline,
    isConnected,
    connectionType,
    isInternetReachable,
    isGoodConnection: isGoodConnection(),
    isSlowConnection: isSlowConnection(),
    getConnectionQuality,
    getConnectionStatusText,
    shouldShowOfflineWarning,
    canPerformNetworkOperations,
    getNetworkInfo,
  };
};

export default useNetworkStatus;
