import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  PanGestureHandler,
  TapGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  State,
  Animated,
} from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
import { hapticService } from '../../services/HapticService';
import IconFallback from './IconFallback';

const GestureHandler = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  onPinch,
  onRotation,
  swipeThreshold = 50,
  longPressDuration = 500,
  haptic = true,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const { width: screenWidth } = Dimensions.get('window');
  
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const opacityAnimation = useRef(new Animated.Value(1)).current;

  const handleGestureEvent = (event) => {
    const { translationX, translationY, velocityX, velocityY } = event.nativeEvent;

    // Swipe detection
    if (Math.abs(translationX) > swipeThreshold) {
      if (translationX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    if (Math.abs(translationY) > swipeThreshold) {
      if (translationY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }
  };

  const handleTap = () => {
    if (haptic) {
      hapticService.buttonPress();
    }
    onTap?.();
  };

  const handleDoubleTap = () => {
    if (haptic) {
      hapticService.buttonPress();
    }
    onDoubleTap?.();
  };

  const handleLongPress = () => {
    if (haptic) {
      hapticService.buttonPress();
    }
    onLongPress?.();
  };

  const handlePinch = (event) => {
    const { scale } = event.nativeEvent;
    onPinch?.(scale);
  };

  const handleRotation = (event) => {
    const { rotation } = event.nativeEvent;
    onRotation?.(rotation);
  };

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 0.8,
        useNativeDriver: true,
        duration: 100,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        useNativeDriver: true,
        duration: 100,
      }),
    ]).start();
  };

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={(event) => {
        if (event.nativeEvent.state === State.END) {
          handleGestureEvent(event);
        }
      }}
    >
      <TapGestureHandler
        onActivated={handleTap}
        onHandlerStateChange={(event) => {
          if (event.nativeEvent.state === State.BEGAN) {
            handlePressIn();
          } else if (event.nativeEvent.state === State.END) {
            handlePressOut();
          }
        }}
      >
        <TapGestureHandler
          numberOfTaps={2}
          onActivated={handleDoubleTap}
        >
          <TapGestureHandler
            minDurationMs={longPressDuration}
            onActivated={handleLongPress}
          >
            <PinchGestureHandler
              onGestureEvent={handlePinch}
            >
              <RotationGestureHandler
                onGestureEvent={handleRotation}
              >
                <Animated.View
                  style={[
                    {
                      transform: [{ scale: scaleAnimation }],
                      opacity: opacityAnimation,
                    },
                    style,
                  ]}
                  {...props}
                >
                  {children}
                </Animated.View>
              </RotationGestureHandler>
            </PinchGestureHandler>
          </TapGestureHandler>
        </TapGestureHandler>
      </TapGestureHandler>
    </PanGestureHandler>
  );
};

// Swipeable Card Component
export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  const { width: screenWidth } = Dimensions.get('window');
  
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handleSwipeLeft = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSwipeLeft?.();
    });
  };

  const handleSwipeRight = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSwipeRight?.();
    });
  };

  return (
    <GestureHandler
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      style={style}
      {...props}
    >
      <Animated.View
        style={[
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
      >
        {children}
      </Animated.View>
    </GestureHandler>
  );
};

// Pull to Refresh Component
export const PullToRefresh = ({
  children,
  onRefresh,
  refreshing = false,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const handleGestureEvent = (event) => {
    const { translationY: ty } = event.nativeEvent;
    
    if (ty > 0) {
      translateY.setValue(ty);
      opacity.setValue(Math.min(ty / 100, 1));
    }
  };

  const handleStateChange = (event) => {
    const { translationY: ty, state } = event.nativeEvent;
    
    if (state === State.END) {
      if (ty > 100) {
        onRefresh?.();
      }
      
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          useNativeDriver: true,
          duration: 200,
        }),
      ]).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleStateChange}
    >
      <Animated.View style={[{ flex: 1 }, style]} {...props}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <View
            style={[
              {
                backgroundColor: theme.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}
          >
            <IconFallback
              name="refresh"
              size={16}
              color={theme.onPrimary}
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: theme.onPrimary, fontWeight: '600' }}>
              {refreshing ? 'Refreshing...' : 'Pull to refresh'}
            </Text>
          </View>
        </Animated.View>
        
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

// Swipeable List Item
export const SwipeableListItem = ({
  children,
  leftAction,
  rightAction,
  onSwipeLeft,
  onSwipeRight,
  style,
  ...props
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();
  
  const translateX = useRef(new Animated.Value(0)).current;
  const leftActionOpacity = useRef(new Animated.Value(0)).current;
  const rightActionOpacity = useRef(new Animated.Value(0)).current;

  const handleGestureEvent = (event) => {
    const { translationX: tx } = event.nativeEvent;
    
    translateX.setValue(tx);
    
    if (tx > 0) {
      leftActionOpacity.setValue(Math.min(tx / 100, 1));
    } else if (tx < 0) {
      rightActionOpacity.setValue(Math.min(Math.abs(tx) / 100, 1));
    }
  };

  const handleStateChange = (event) => {
    const { translationX: tx, state } = event.nativeEvent;
    
    if (state === State.END) {
      if (tx > 100) {
        onSwipeRight?.();
      } else if (tx < -100) {
        onSwipeLeft?.();
      }
      
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(leftActionOpacity, {
          toValue: 0,
          useNativeDriver: true,
          duration: 200,
        }),
        Animated.timing(rightActionOpacity, {
          toValue: 0,
          useNativeDriver: true,
          duration: 200,
        }),
      ]).start();
    }
  };

  return (
    <View style={[{ overflow: 'hidden' }, style]} {...props}>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
      >
        <Animated.View
          style={[
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
      
      {leftAction && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: leftActionOpacity,
            },
          ]}
        >
          {leftAction}
        </Animated.View>
      )}
      
      {rightAction && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              opacity: rightActionOpacity,
            },
          ]}
        >
          {rightAction}
        </Animated.View>
      )}
    </View>
  );
};

export default GestureHandler;

