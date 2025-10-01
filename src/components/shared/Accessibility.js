import React from 'react';
import { AccessibilityInfo } from 'react-native';

// Accessibility utilities
export const accessibilityUtils = {
  // Screen reader detection
  isScreenReaderEnabled: () => {
    return new Promise((resolve) => {
      AccessibilityInfo.isAccessibilityServiceEnabled().then(resolve);
    });
  },

  // Announce to screen reader
  announce: (message) => {
    AccessibilityInfo.announceForAccessibility(message);
  },

  // Set accessibility focus
  setAccessibilityFocus: (ref) => {
    if (ref && ref.current) {
      AccessibilityInfo.setAccessibilityFocus(ref.current);
    }
  },
};

// Accessible button component
export const AccessibleButton = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'button',
  onPress,
  disabled = false,
  ...props 
}) => {
  const handlePress = () => {
    if (onPress && !disabled) {
      onPress();
    }
  };

  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    accessibilityState: {
      disabled: disabled,
    },
    onPress: handlePress,
    ...props,
  });
};

// Accessible text input
export const AccessibleTextInput = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'text',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible card component
export const AccessibleCard = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'button',
  onPress,
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    onPress: onPress,
    ...props,
  });
};

// Accessible list item
export const AccessibleListItem = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'button',
  onPress,
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    onPress: onPress,
    ...props,
  });
};

// Accessible header
export const AccessibleHeader = ({ 
  children, 
  accessibilityLabel, 
  accessibilityRole = 'header',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible image
export const AccessibleImage = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'image',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible progress bar
export const AccessibleProgressBar = ({ 
  children, 
  accessibilityLabel, 
  accessibilityValue, 
  accessibilityRole = 'progressbar',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityValue: accessibilityValue || children.props.accessibilityValue,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible switch
export const AccessibleSwitch = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'switch',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible tab
export const AccessibleTab = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'tab',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible modal
export const AccessibleModal = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'dialog',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible list
export const AccessibleList = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'list',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible grid
export const AccessibleGrid = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'grid',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible search
export const AccessibleSearch = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'search',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible navigation
export const AccessibleNavigation = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'navigation',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible main content
export const AccessibleMain = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'main',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible sidebar
export const AccessibleSidebar = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'complementary',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible footer
export const AccessibleFooter = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'contentinfo',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible banner
export const AccessibleBanner = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'banner',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible alert
export const AccessibleAlert = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'alert',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible status
export const AccessibleStatus = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'status',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible timer
export const AccessibleTimer = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'timer',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible log
export const AccessibleLog = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'log',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible marquee
export const AccessibleMarquee = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'marquee',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible math
export const AccessibleMath = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'math',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible note
export const AccessibleNote = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'note',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible region
export const AccessibleRegion = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'region',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible section
export const AccessibleSection = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'section',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible separator
export const AccessibleSeparator = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'separator',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible tablist
export const AccessibleTabList = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'tablist',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible tabpanel
export const AccessibleTabPanel = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'tabpanel',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible text
export const AccessibleText = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'text',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible toolbar
export const AccessibleToolbar = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'toolbar',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible tree
export const AccessibleTree = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'tree',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible treeitem
export const AccessibleTreeItem = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'treeitem',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible widget
export const AccessibleWidget = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'widget',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

// Accessible window
export const AccessibleWindow = ({ 
  children, 
  accessibilityLabel, 
  accessibilityHint, 
  accessibilityRole = 'window',
  ...props 
}) => {
  return React.cloneElement(children, {
    accessible: true,
    accessibilityLabel: accessibilityLabel || children.props.accessibilityLabel,
    accessibilityHint: accessibilityHint || children.props.accessibilityHint,
    accessibilityRole: accessibilityRole,
    ...props,
  });
};

export default {
  accessibilityUtils,
  AccessibleButton,
  AccessibleTextInput,
  AccessibleCard,
  AccessibleListItem,
  AccessibleHeader,
  AccessibleImage,
  AccessibleProgressBar,
  AccessibleSwitch,
  AccessibleTab,
  AccessibleModal,
  AccessibleList,
  AccessibleGrid,
  AccessibleSearch,
  AccessibleNavigation,
  AccessibleMain,
  AccessibleSidebar,
  AccessibleFooter,
  AccessibleBanner,
  AccessibleAlert,
  AccessibleStatus,
  AccessibleTimer,
  AccessibleLog,
  AccessibleMarquee,
  AccessibleMath,
  AccessibleNote,
  AccessibleRegion,
  AccessibleSection,
  AccessibleSeparator,
  AccessibleTabList,
  AccessibleTabPanel,
  AccessibleText,
  AccessibleToolbar,
  AccessibleTree,
  AccessibleTreeItem,
  AccessibleWidget,
  AccessibleWindow,
};
