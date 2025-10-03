import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import MaterialButton from './MaterialButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Simple Tooltip Component
export function Tooltip({ 
  children, 
  content, 
  position = 'top', 
  maxWidth = 200,
  showArrow = true,
  style 
}) {
  const { getCurrentTheme } = useTheme();
  const responsive = useResponsive();
  const theme = getCurrentTheme();
  const [visible, setVisible] = useState(false);
  const [tooltipLayout, setTooltipLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [childLayout, setChildLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const getTooltipPosition = () => {
    const spacing = 8;
    let x = childLayout.x + (childLayout.width / 2) - (maxWidth / 2);
    let y = childLayout.y;

    switch (position) {
      case 'top':
        y = childLayout.y - 50 - spacing;
        break;
      case 'bottom':
        y = childLayout.y + childLayout.height + spacing;
        break;
      case 'left':
        x = childLayout.x - maxWidth - spacing;
        y = childLayout.y + (childLayout.height / 2) - 20;
        break;
      case 'right':
        x = childLayout.x + childLayout.width + spacing;
        y = childLayout.y + (childLayout.height / 2) - 20;
        break;
    }

    // Keep tooltip within screen bounds
    x = Math.max(10, Math.min(x, screenWidth - maxWidth - 10));
    y = Math.max(10, Math.min(y, screenHeight - 100));

    return { x, y };
  };

  const getArrowStyle = () => {
    const arrowSize = 6;
    const { x, y } = getTooltipPosition();
    const centerX = x + (maxWidth / 2);
    const centerY = y + 25;

    const arrowStyle = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid'};

    switch (position) {
      case 'top':
        return {
          ...arrowStyle,
          top: y + 50,
          left: centerX - arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: theme.surface};
      case 'bottom':
        return {
          ...arrowStyle,
          top: y - arrowSize,
          left: centerX - arrowSize,
          borderLeftWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: theme.surface};
      case 'left':
        return {
          ...arrowStyle,
          top: centerY - arrowSize,
          left: x + maxWidth,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderRightWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: theme.surface};
      case 'right':
        return {
          ...arrowStyle,
          top: centerY - arrowSize,
          left: x - arrowSize,
          borderTopWidth: arrowSize,
          borderBottomWidth: arrowSize,
          borderLeftWidth: arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: theme.surface};
      default:
        return {};
    }
  };

  const handleChildLayout = (event) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setChildLayout({ x, y, width, height });
  };

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={() => setVisible(!visible)}
        onLayout={handleChildLayout}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
      
      {visible && (
        <Modal
          transparent
          visible={visible}
          animationType="fade"
          onRequestClose={() => setVisible(false)}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setVisible(false)}
          >
            <View
              style={[
                styles.tooltip,
                {
                  backgroundColor: theme.surface,
                  left: getTooltipPosition().x,
                  top: getTooltipPosition().y,
                  maxWidth,
                  shadowColor: theme.cardShadow},
              ]}
            >
              <Text style={[styles.tooltipText, { color: theme.text }]}>
                {content}
              </Text>
              {showArrow && <View style={getArrowStyle()} />}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

// Feature Discovery Overlay
export function FeatureOverlay({ 
  visible, 
  onClose, 
  title, 
  description, 
  actionText, 
  onActionPress,
  position = { x: screenWidth / 2 - 150, y: screenHeight / 2 - 100 },
  style 
}) {
  const { getCurrentTheme } = useTheme();
  const responsive = useResponsive();
  const theme = getCurrentTheme();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true}).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { 
            opacity: fadeAnim,
            backgroundColor: 'rgba(0,0,0,0.6)'
          }
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={[
          styles.featureCard,
          {
            backgroundColor: theme.surface,
            left: position.x,
            top: position.y,
            shadowColor: theme.cardShadow},
          style,
        ]}>
          <View style={styles.featureHeader}>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconFallback name="close" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
            {description}
          </Text>
          
          {actionText && onActionPress && (
            <MaterialButton
              title={actionText}
              onPress={onActionPress}
              variant="filled"
              size="sm"
              style={styles.featureAction}
            />
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

// Help Button Component
export function HelpButton({ 
  onPress, 
  size = 20, 
  color, 
  style,
}) {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <TouchableOpacity style={[styles.helpButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <IconFallback 
        name="help-outline" 
        size={size} 
        color={color || theme.textSecondary} 
      />
    </TouchableOpacity>
  );
}

// Inline Help Text Component
export function InlineHelp({ 
  text, 
  icon = 'info-outline', 
  style 
}) {
  const { getCurrentTheme } = useTheme();
  const responsive = useResponsive();
  const theme = getCurrentTheme();

  return (
    <View style={[styles.inlineHelp, style]}>
      <IconFallback 
        name={icon} 
        size={responsive.scale(14)} 
        color={theme.info} 
      />
      <Text style={[styles.inlineHelpText, { color: theme.textSecondary }]}>
        {text}
      </Text>
    </View>
  );
}

// Feature Introduction Manager
export function FeatureIntroductionManager({ children }) {
  const [featureOverlays, setFeatureOverlays] = useState({});
  const [completedFeatures, setCompletedFeatures] = useState(new Set());

  const showFeature = (featureId, overlayData) => {
    setFeatureOverlays(prev => ({
      ...prev,
      [featureId]: overlayData
    }));
  };

  const hideFeature = (featureId) => {
    setFeatureOverlays(prev => {
      const newOverlays = { ...prev };
      delete newOverlays[featureId];
      return newOverlays;
    });
    setCompletedFeatures(prev => new Set([...prev, featureId]));
  };

  const isFeatureCompleted = (featureId) => {
    return completedFeatures.has(featureId);
  };

  return (
    <View style={styles.managerContainer}>
      {children}
      {Object.entries(featureOverlays).map(([featureId, overlayData]) => (
        <FeatureOverlay
          key={featureId}
          visible={true}
          onClose={() => hideFeature(featureId)}
          {...overlayData}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'},
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0},
  tooltip: {
    position: 'absolute',
    padding: 12,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000},
  tooltipText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center'},
  featureCard: {
    position: 'absolute',
    padding: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 300,
    zIndex: 1001},
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12},
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1},
  closeButton: {
    padding: 4},
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16},
  featureAction: {
    alignSelf: 'flex-start'},
  helpButton: {
    padding: 4,
    borderRadius: 12},
  inlineHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8},
  inlineHelpText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1},
  managerContainer: {
    flex: 1}});
