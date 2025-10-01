import React, { ReactNode } from 'react';
import { User } from '../../types/UserTypes';

export interface ModernHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightActions?: any[];
  showNotifications?: boolean;
  onNotificationPress?: () => void;
  showProfile?: boolean;
  profileAvatar?: string;
  onProfilePress?: () => void;
  notificationCount?: number;
  showStatusBar?: boolean;
  user?: User | null;
  showGreeting?: boolean;
  showThemeToggle?: boolean;
  showQuickStats?: boolean;
  availabilityStatus?: any;
  onAvailabilityPress?: () => void;
  showAvailability?: boolean;
  onWeatherPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

declare const ModernHeader: React.FC<ModernHeaderProps>;
export default ModernHeader;
