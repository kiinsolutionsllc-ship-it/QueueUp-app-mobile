import React, { useRef, useEffect } from 'react';
import { Animated, Easing, View } from 'react-native';

// Fade in animation
export const FadeIn = ({ 
  children, 
  duration = 300, 
  delay = 0, 
  style = {},
  ...props 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
        },
        style = {},
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// Slide in from bottom
export const SlideInFromBottom = ({ 
  children, 
  duration = 300, 
  delay = 0, 
  style = {},
  ...props 
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY: slideAnim }],
        },
        style = {},
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// Slide in from left
export const SlideInFromLeft = ({ 
  children, 
  duration = 300, 
  delay = 0, 
  style = {},
  ...props 
}) => {
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [slideAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateX: slideAnim }],
        },
        style = {},
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// Scale in animation
export const ScaleIn = ({ 
  children, 
  duration = 300, 
  delay = 0, 
  scale = 0.8,
  style = {},
  ...props 
}) => {
  const scaleAnim = useRef(new Animated.Value(scale)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, duration, delay, scale]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style = {},
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// Bounce animation
export const BounceIn = ({ 
  children, 
  duration = 600, 
  delay = 0, 
  style = {},
  ...props 
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.2,
        duration: duration * 0.6,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: duration * 0.4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bounceAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: bounceAnim }],
        },
        style = {},
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// Pulse animation
export const Pulse = ({ 
  children, 
  duration = 1000, 
  delay = 0, 
  style = {},
  ...props 
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );
    
    const timer = setTimeout(() => {
      pulse.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, [pulseAnim, duration, delay]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: pulseAnim }],
        },
        style = {},
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// Shake animation
export const Shake = ({ 
  children, 
  duration = 500, 
  delay = 0, 
  intensity = 10,
  style = {},
  ...props 
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shake = Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -intensity,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]);
    
    const timer = setTimeout(() => {
      shake.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      shake.stop();
    };
  }, [shakeAnim, duration, delay, intensity]);

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateX: shakeAnim }],
        },
        style = {},
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// Rotate animation
export const Rotate = ({ 
  children, 
  duration = 1000, 
  delay = 0, 
  style = {},
  ...props 
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    const timer = setTimeout(() => {
      rotate.start();
    }, delay);

    return () => {
      clearTimeout(timer);
      rotate.stop();
    };
  }, [rotateAnim, duration, delay]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ rotate: rotateInterpolate }],
        },
        style = {},
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// Stagger animation for lists
export const StaggeredList = ({ 
  children, 
  staggerDelay = 100, 
  animation = 'fadeIn',
  style = {},
  ...props 
}) => {
  const AnimationComponent = {
    fadeIn: FadeIn,
    slideInFromBottom: SlideInFromBottom,
    slideInFromLeft: SlideInFromLeft,
    scaleIn: ScaleIn,
    bounceIn: BounceIn,
  }[animation] || FadeIn;

  return (
    <View style={style} {...props}>
      {React.Children.map(children, (child, index) => (
        <AnimationComponent
          key={index}
          delay={index * staggerDelay}
        >
          {child}
        </AnimationComponent>
      ))}
    </View>
  );
};

// Animated button press
export const AnimatedButton = ({ 
  children, 
  onPress, 
  style = {},
  pressScale = 0.95,
  ...props 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: pressScale,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        style = {},
      ]}
    >
      {React.cloneElement(children, {
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        onPress,
        ...props,
      })}
    </Animated.View>
  );
};

// Loading animation
export const LoadingAnimation = ({ 
  children, 
  loading = false, 
  style = {},
  ...props 
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim, loading]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
        },
        style = {},
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// Alias for compatibility
export const PulseAnimation = Pulse;

export default {
  FadeIn,
  SlideInFromBottom,
  SlideInFromLeft,
  ScaleIn,
  BounceIn,
  Pulse,
  PulseAnimation,
  Shake,
  Rotate,
  StaggeredList,
  AnimatedButton,
  LoadingAnimation,
};
