import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';

interface LoadingScreenProps {
  onComplete: (completed: boolean) => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  // New animation values for enhanced loading indicators
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const progressGlowAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Show loading screen for 7 seconds
    const timer = setTimeout(() => {
      onComplete(true);
    }, 7000);

    // Update progress percentage every 100ms
    const progressInterval = setInterval(() => {
      setProgressPercentage(prev => {
        const newProgress = Math.min(prev + (100 / 70), 100); // 100% over 7 seconds (70 * 100ms)
        return newProgress;
      });
    }, 100);

    // Reset animation values first
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    pulseAnim.setValue(1);
    rotateAnim.setValue(0);
    shimmerAnim.setValue(0);
    bounceAnim.setValue(0);
    waveAnim.setValue(0);
    glowAnim.setValue(0);
    sparkleAnim.setValue(0);
    rippleAnim.setValue(0);
    progressGlowAnim.setValue(0);
    dotsAnim.setValue(0);

    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start continuous animations
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );

    const shimmerAnimation = Animated.timing(shimmerAnim, {
      toValue: 1,
      duration: 7000,
      useNativeDriver: true, // Use native driver for better performance
    });

    // Enhanced loading animations
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    const waveAnimation = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true, // Use native driver for translateX
      })
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true, // Use native driver for opacity
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    const sparkleAnimation = Animated.loop(
      Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    const rippleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true, // Use native driver for opacity
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const progressGlowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(progressGlowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true, // Use native driver for opacity
        }),
        Animated.timing(progressGlowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    const dotsAnimation = Animated.loop(
      Animated.timing(dotsAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    rotateAnimation.start();
    shimmerAnimation.start();
    bounceAnimation.start();
    waveAnimation.start();
    glowAnimation.start();
    sparkleAnimation.start();
    rippleAnimation.start();
    progressGlowAnimation.start();
    dotsAnimation.start();

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      
      // Stop animations safely
      try {
        pulseAnimation.stop();
        rotateAnimation.stop();
        shimmerAnimation.stop();
        bounceAnimation.stop();
        waveAnimation.stop();
        glowAnimation.stop();
        sparkleAnimation.stop();
        rippleAnimation.stop();
        progressGlowAnimation.stop();
        dotsAnimation.stop();
        fadeAnim.stopAnimation();
        slideAnim.stopAnimation();
        scaleAnim.stopAnimation();
        pulseAnim.stopAnimation();
        rotateAnim.stopAnimation();
        shimmerAnim.stopAnimation();
        bounceAnim.stopAnimation();
        waveAnim.stopAnimation();
        glowAnim.stopAnimation();
        sparkleAnim.stopAnimation();
        rippleAnim.stopAnimation();
        progressGlowAnim.stopAnimation();
        dotsAnim.stopAnimation();
      } catch (error) {
        console.warn('Error stopping animations:', error);
      }
    };
  }, []);


  return (
    <View style={[styles.container, { backgroundColor: '#F8F8F8' }]}>

      {/* App Name */}
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Animated.Text 
          style={[
            styles.appName, 
            { 
              color: '#333333',
              opacity: fadeAnim
            }
          ]}
        >
          QueueUp
        </Animated.Text>
      </Animated.View>

      {/* Progress Indicators */}
      <Animated.View 
        style={[
          styles.progressContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Enhanced Circular Progress with Multiple Animations */}
        <View style={styles.circularProgressContainer}>
          {/* Ripple Effect */}
          <Animated.View 
            style={[
              styles.rippleEffect,
              {
                opacity: rippleAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 0.6, 0],
                }),
                transform: [
                  {
                    scale: rippleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.4],
                    })
                  }
                ]
              }
            ]} 
          />
          
          {/* Glow Effect */}
          <Animated.View 
            style={[
              styles.glowEffect,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.2, 0.5, 0.2],
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    })
                  }
                ]
              }
            ]} 
          />
          
          <View style={styles.circularProgress}>
            {/* Primary Progress Ring */}
            <Animated.View 
              style={[
                styles.progressSegment,
                { 
                  borderTopColor: '#DC2626',
                  borderRightColor: '#DC2626',
                  transform: [
                    { 
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '270deg'],
                      })
                    },
                    {
                      scale: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.05],
                      })
                    }
                  ]
                }
              ]} 
            />
            
            {/* Secondary Progress Ring */}
            <Animated.View 
              style={[
                styles.progressSegment,
                { 
                  borderTopColor: '#EAB308',
                  borderRightColor: '#EAB308',
                  transform: [
                    { 
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['270deg', '360deg'],
                      })
                    },
                    {
                      scale: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1.05, 1],
                      })
                    }
                  ]
                }
              ]} 
            />
            
            {/* Sparkle Effects */}
            <Animated.View 
              style={[
                styles.sparkle,
                {
                  opacity: sparkleAnim.interpolate({
                    inputRange: [0, 0.25, 0.5, 0.75, 1],
                    outputRange: [0, 1, 0, 1, 0],
                  }),
                  transform: [
                    {
                      rotate: sparkleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }
                  ]
                }
              ]} 
            >
              <IconFallback name="star" size={16} color="#FFD700" />
            </Animated.View>

            {/* Logo in Center of Circular Progress */}
            <Animated.View 
              style={[
                styles.logo, 
                { 
                  transform: [
                    { scale: pulseAnim },
                    { 
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '15deg'],
                      })
                    }
                  ]
                }
              ]}
            >
              <Image 
                source={require('../../../assets/Logo.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </View>

        {/* Enhanced Linear Progress Bar with Wave Effect */}
        <View style={styles.linearProgressContainer}>
          <View style={styles.linearProgress}>
            {/* Main Progress Bar */}
            <Animated.View 
              style={[
                styles.progressBar,
                { 
                  backgroundColor: '#DC2626',
                  transform: [{
                    scaleX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    })
                  }]
                }
              ]} 
            />
            
            {/* Wave Effect Overlay */}
            <Animated.View 
              style={[
                styles.waveOverlay,
                {
                  opacity: waveAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 0.7, 0.3],
                  }),
                  transform: [
                    {
                      translateX: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-200, 200],
                      })
                    }
                  ]
                }
              ]} 
            />
            
            {/* Glow Effect */}
            <Animated.View 
              style={[
                styles.progressGlow,
                {
                  opacity: progressGlowAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.2, 0.6, 0.2],
                  }),
                  transform: [{
                    scaleX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    })
                  }]
                }
              ]} 
            />
          </View>
          
          {/* Animated Dots */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    opacity: dotsAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 1, 0.3],
                    }),
                    transform: [
                      {
                        scale: dotsAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.8, 1.2, 0.8],
                        })
                      }
                    ]
                  }
                ]}
              />
            ))}
          </View>
        </View>

        <Animated.Text 
          style={[
            styles.percentageText, 
            { 
              color: '#333333',
              opacity: fadeAnim
            }
          ]}
        >
          {Math.round(progressPercentage)}%
        </Animated.Text>
      </Animated.View>


      {/* Action Buttons */}
      <Animated.View 
        style={[
          styles.buttonsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity style={styles.actionButton}>
          <IconFallback name="group" size={24} color="#DC2626" />
          <Text style={styles.buttonText}>Find</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <IconFallback name="build" size={24} color="#EAB308" />
          <Text style={styles.buttonText}>Connect</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <IconFallback name="build" size={24} color="#DC2626" />
          <Text style={styles.buttonText}>Fix</Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  logo: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  circularProgressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  circularProgress: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#E0E0E0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  rippleEffect: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#DC2626',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  glowEffect: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    shadowColor: '#DC2626',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  sparkle: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  progressSegment: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#DC2626',
    borderRightColor: '#DC2626',
  },
  linearProgressContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  linearProgress: {
    width: 200,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    width: 200,
    height: '100%',
    borderRadius: 4,
    transformOrigin: 'left center',
  },
  waveOverlay: {
    position: 'absolute',
    width: 50,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 4,
  },
  progressGlow: {
    position: 'absolute',
    width: 200,
    height: '100%',
    backgroundColor: 'rgba(220, 38, 38, 0.3)',
    borderRadius: 4,
    transformOrigin: 'left center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginHorizontal: 4,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginTop: 8,
  },
});

