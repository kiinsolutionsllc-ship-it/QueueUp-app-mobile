import React from 'react';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import WheelIcon from './WheelIcon';

// VS Code style icon mapping using vector icons
const iconMap = {
  // Navigation & UI
  'home': { type: 'MaterialIcons', name: 'home' },
  'work': { type: 'MaterialIcons', name: 'work' },
  'chat': { type: 'MaterialIcons', name: 'chat' },
  'person': { type: 'MaterialIcons', name: 'person' },
  'settings': { type: 'MaterialIcons', name: 'settings' },
  'notifications': { type: 'MaterialIcons', name: 'notifications' },
  'menu': { type: 'MaterialIcons', name: 'menu' },
  'more-vert': { type: 'MaterialIcons', name: 'more-vert' },
  'close': { type: 'MaterialIcons', name: 'close' },
  'check': { type: 'MaterialIcons', name: 'check' },
  'check-black': { type: 'MaterialIcons', name: 'check' },
  'add': { type: 'MaterialIcons', name: 'add' },
  'edit': { type: 'MaterialIcons', name: 'edit' },
  'delete': { type: 'MaterialIcons', name: 'delete' },
  'search': { type: 'MaterialIcons', name: 'search' },
  'arrow-back': { type: 'MaterialIcons', name: 'arrow-back' },
  'arrow-forward': { type: 'MaterialIcons', name: 'arrow-forward' },
  'arrow-upward': { type: 'MaterialIcons', name: 'arrow-upward' },
  'arrow-downward': { type: 'MaterialIcons', name: 'arrow-downward' },
  'expand-more': { type: 'MaterialIcons', name: 'expand-more' },
  'expand-less': { type: 'MaterialIcons', name: 'expand-less' },
  
  // Messaging
  'chat-bubble-outline': { type: 'MaterialIcons', name: 'chat-bubble-outline' },
  'content-copy': { type: 'MaterialIcons', name: 'content-copy' },
  'reply': { type: 'MaterialIcons', name: 'reply' },
  'format-quote': { type: 'MaterialIcons', name: 'format-quote' },
  'attach-file': { type: 'MaterialIcons', name: 'attach-file' },
  'send': { type: 'MaterialIcons', name: 'send' },
  'schedule': { type: 'MaterialIcons', name: 'schedule' },
  'emergency': { type: 'MaterialIcons', name: 'emergency' },
  'weekend': { type: 'MaterialIcons', name: 'weekend' },
  'celebration': { type: 'MaterialIcons', name: 'celebration' },
  'oil-barrel': { type: 'MaterialIcons', name: 'local-gas-station' },
  'stop': { type: 'MaterialIcons', name: 'stop' },
  'rotate-right': { type: 'MaterialIcons', name: 'rotate-right' },
  'ac-unit': { type: 'MaterialIcons', name: 'ac-unit' },
  'minimize': { type: 'MaterialIcons', name: 'minimize' },
  'done': { type: 'MaterialIcons', name: 'done' },
  'done-all': { type: 'MaterialIcons', name: 'done-all' },
  'lock': { type: 'MaterialIcons', name: 'lock' },
  
  // Actions
  'favorite': { type: 'MaterialIcons', name: 'favorite' },
  'favorite-border': { type: 'MaterialIcons', name: 'favorite-border' },
  'star': { type: 'MaterialIcons', name: 'star' },
  'star-border': { type: 'MaterialIcons', name: 'star-border' },
  'share': { type: 'MaterialIcons', name: 'share' },
  'download': { type: 'MaterialIcons', name: 'download' },
  'upload': { type: 'MaterialIcons', name: 'upload' },
  'refresh': { type: 'MaterialIcons', name: 'refresh' },
  'save': { type: 'MaterialIcons', name: 'save' },
  'print': { type: 'MaterialIcons', name: 'print' },
  
  // Communication
  'phone': { type: 'MaterialIcons', name: 'phone' },
  'email': { type: 'MaterialIcons', name: 'email' },
  'message': { type: 'MaterialIcons', name: 'message' },
  'call': { type: 'MaterialIcons', name: 'call' },
  'videocam': { type: 'MaterialIcons', name: 'videocam' },
  'mic': { type: 'MaterialIcons', name: 'mic' },
  'mic-off': { type: 'MaterialIcons', name: 'mic-off' },
  
  // Location & Time
  'location-on': { type: 'MaterialIcons', name: 'location-on' },
  'place': { type: 'MaterialIcons', name: 'place' },
  'time': { type: 'MaterialIcons', name: 'access-time' },
  'date-range': { type: 'MaterialIcons', name: 'date-range' },
  'event': { type: 'MaterialIcons', name: 'event' },
  'access-time': { type: 'MaterialIcons', name: 'access-time' },
  
  // Status & Info
  'info': { type: 'MaterialIcons', name: 'info' },
  'warning': { type: 'MaterialIcons', name: 'warning' },
  'error': { type: 'MaterialIcons', name: 'error' },
  'help': { type: 'MaterialIcons', name: 'help' },
  'help-outline': { type: 'MaterialIcons', name: 'help-outline' },
  'info-outline': { type: 'MaterialIcons', name: 'info-outline' },
  'warning-outline': { type: 'MaterialIcons', name: 'warning-outline' },
  
  // Build & Tools
  'build': { type: 'MaterialIcons', name: 'build' },
  'construction': { type: 'MaterialIcons', name: 'construction' },
  'handyman': { type: 'MaterialIcons', name: 'handyman' },
  'engineering': { type: 'MaterialIcons', name: 'engineering' },
  'precision': { type: 'MaterialIcons', name: 'gps-fixed' },
  'tune': { type: 'MaterialIcons', name: 'tune' },
  
  // Transportation
  'directions-car': { type: 'MaterialIcons', name: 'directions-car' },
  'local-car-wash': { type: 'MaterialIcons', name: 'local-car-wash' },
  'tire-repair': { type: 'MaterialIcons', name: 'tire-repair' },
  'wheel': { type: 'WheelIcon', name: 'wheel' }, // Using custom WheelIcon component
  'electrical-services': { type: 'MaterialIcons', name: 'electrical-services' },
  'motorcycle': { type: 'MaterialIcons', name: 'motorcycle' },
  'directions-bike': { type: 'MaterialIcons', name: 'directions-bike' },
  'directions-bus': { type: 'MaterialIcons', name: 'directions-bus' },
  'train': { type: 'MaterialIcons', name: 'train' },
  'flight': { type: 'MaterialIcons', name: 'flight' },
  
  // Payment & Money
  'payment': { type: 'MaterialIcons', name: 'payment' },
  'credit-card': { type: 'MaterialIcons', name: 'credit-card' },
  'account-balance-wallet': { type: 'MaterialIcons', name: 'account-balance-wallet' },
  'attach-money': { type: 'MaterialIcons', name: 'attach-money' },
  'monetization-on': { type: 'MaterialIcons', name: 'monetization-on' },
  
  // Security
  'security': { type: 'MaterialIcons', name: 'security' },
  'lock-open': { type: 'MaterialIcons', name: 'lock-open' },
  'visibility': { type: 'MaterialIcons', name: 'visibility' },
  'visibility-off': { type: 'MaterialIcons', name: 'visibility-off' },
  
  // Media
  'photo-camera': { type: 'MaterialIcons', name: 'photo-camera' },
  'image': { type: 'MaterialIcons', name: 'image' },
  'movie': { type: 'MaterialIcons', name: 'movie' },
  'music-note': { type: 'MaterialIcons', name: 'music-note' },
  
  // Weather & Environment
  'wb-sunny': { type: 'MaterialIcons', name: 'wb-sunny' },
  'cloud': { type: 'MaterialIcons', name: 'cloud' },
  'rain': { type: 'MaterialIcons', name: 'grain' },
  'snow': { type: 'MaterialIcons', name: 'ac-unit' },
  'thermostat': { type: 'MaterialIcons', name: 'thermostat' },
  
  // Health & Medical
  'local-hospital': { type: 'MaterialIcons', name: 'local-hospital' },
  'medical-services': { type: 'MaterialIcons', name: 'medical-services' },
  'health-and-safety': { type: 'MaterialIcons', name: 'health-and-safety' },
  'fitness-center': { type: 'MaterialIcons', name: 'fitness-center' },
  
  // Shopping & Commerce
  'shopping-cart': { type: 'MaterialIcons', name: 'shopping-cart' },
  'store': { type: 'MaterialIcons', name: 'store' },
  'local-grocery-store': { type: 'MaterialIcons', name: 'local-grocery-store' },
  'receipt': { type: 'MaterialIcons', name: 'receipt' },
  
  // Social & People
  'group': { type: 'MaterialIcons', name: 'group' },
  'person-add': { type: 'MaterialIcons', name: 'person-add' },
  'people': { type: 'MaterialIcons', name: 'people' },
  'supervisor-account': { type: 'MaterialIcons', name: 'supervisor-account' },
  
  // Technology
  'computer': { type: 'MaterialIcons', name: 'computer' },
  'phone-android': { type: 'MaterialIcons', name: 'phone-android' },
  'tablet': { type: 'MaterialIcons', name: 'tablet' },
  'laptop': { type: 'MaterialIcons', name: 'laptop' },
  'router': { type: 'MaterialIcons', name: 'router' },
  'wifi': { type: 'MaterialIcons', name: 'wifi' },
  'bluetooth': { type: 'MaterialIcons', name: 'bluetooth' },
  
  // Files & Documents
  'folder': { type: 'MaterialIcons', name: 'folder' },
  'folder-open': { type: 'MaterialIcons', name: 'folder-open' },
  'description': { type: 'MaterialIcons', name: 'description' },
  'article': { type: 'MaterialIcons', name: 'article' },
  'assignment': { type: 'MaterialIcons', name: 'assignment' },
  'note': { type: 'MaterialIcons', name: 'note' },
  
  // Additional missing icons from the app
  'chevron-left': { type: 'MaterialIcons', name: 'chevron-left' },
  'chevron-right': { type: 'MaterialIcons', name: 'chevron-right' },
  'error-outline': { type: 'MaterialIcons', name: 'error-outline' },
  'wifi-off': { type: 'MaterialIcons', name: 'wifi-off' },
  'cloud-off': { type: 'MaterialIcons', name: 'cloud-off' },
  'work-outline': { type: 'MaterialIcons', name: 'work-outline' },
  'gavel': { type: 'MaterialIcons', name: 'gavel' },
  'star-outline': { type: 'MaterialIcons', name: 'star-outline' },
  'search-off': { type: 'MaterialIcons', name: 'search-off' },
  'check-circle': { type: 'MaterialIcons', name: 'check-circle' },
  'arrow-drop-down': { type: 'MaterialIcons', name: 'arrow-drop-down' },
  'signal-cellular-4-bar': { type: 'MaterialIcons', name: 'signal-cellular-4-bar' },
  'battery-full': { type: 'MaterialIcons', name: 'battery-full' },
  'smartphone': { type: 'MaterialIcons', name: 'smartphone' },
  'verificationCode': { type: 'MaterialIcons', name: 'verified-user' },
  
  // Navigation icons
  'explore': { type: 'MaterialIcons', name: 'explore' },
  'dashboard': { type: 'MaterialIcons', name: 'dashboard' },
  'speed': { type: 'MaterialIcons', name: 'speed' },
  
  // Common missing icons
  'lightbulb': { type: 'MaterialIcons', name: 'lightbulb' },
  'name': { type: 'MaterialIcons', name: 'person' },
  'bio': { type: 'MaterialIcons', name: 'description' },
  'location': { type: 'MaterialIcons', name: 'location-on' },
  'emergencyContact': { type: 'MaterialIcons', name: 'emergency' },
  'shopName': { type: 'MaterialIcons', name: 'store' },
  'hourlyRate': { type: 'MaterialIcons', name: 'attach-money' },
  'experience': { type: 'MaterialIcons', name: 'star' },
  'licenseNumber': { type: 'MaterialIcons', name: 'description' },
  'insuranceProvider': { type: 'MaterialIcons', name: 'security' },
  
  // Settings screen missing icons
  'trending-up': { type: 'MaterialIcons', name: 'trending-up' },
  'history': { type: 'MaterialIcons', name: 'history' },
  'accessibility': { type: 'MaterialIcons', name: 'accessibility' },
  'privacy-tip': { type: 'MaterialIcons', name: 'privacy-tip' },
  'delete-forever': { type: 'MaterialIcons', name: 'delete-forever' },
  'logout': { type: 'MaterialIcons', name: 'logout' },
  'palette': { type: 'MaterialIcons', name: 'palette' },
  
  // More missing icons
  'analytics': { type: 'MaterialIcons', name: 'analytics' },
  'filter-list': { type: 'MaterialIcons', name: 'filter-list' },
  
  // Status icons
  'cancel': { type: 'MaterialIcons', name: 'cancel' },
  'pending': { type: 'MaterialIcons', name: 'pending' },
  'calendar-event': { type: 'MaterialIcons', name: 'event' },
  
  // Default fallback
  'default': { type: 'MaterialIcons', name: 'help' }
};

// Icon component renderer
const renderIcon = (iconConfig, size, color, style) => {
  const { type, name } = iconConfig;
  
  const iconProps = {
    name,
    size,
    color,
    style
  };

  switch (type) {
    case 'MaterialIcons':
      return <MaterialIcons {...iconProps} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons {...iconProps} />;
    case 'Ionicons':
      return <Ionicons {...iconProps} />;
    case 'WheelIcon':
      return <WheelIcon size={size} color={color} style={style} />;
    default:
      return <MaterialIcons name="help" size={size} color={color} style={style} />;
  }
};

export default function IconFallback({ name, size = 24, color = '#000', style = {} }) {
  const iconConfig = iconMap[name] || iconMap['default'];
  
  return renderIcon(iconConfig, size, color, style);
}
