import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Alert, SafeAreaView, Animated, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface UserTypeSelectionScreenProps {
  navigation: any;
  route?: {
    params?: any;
  };
}

export default function UserTypeSelectionScreen({ navigation, route }: UserTypeSelectionScreenProps) {
  const onUserTypeSelect = route?.params?.onUserTypeSelect;
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Animation values from loading screen
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Reset animation values first
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    pulseAnim.setValue(1);
    rotateAnim.setValue(0);

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

    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      // Stop animations safely
      try {
        pulseAnimation.stop();
        rotateAnimation.stop();
        fadeAnim.stopAnimation();
        slideAnim.stopAnimation();
        scaleAnim.stopAnimation();
        pulseAnim.stopAnimation();
        rotateAnim.stopAnimation();
      } catch (error) {
        console.warn('Error stopping animations:', error);
      }
    };
  }, []);

  const handleCustomerSelect = () => {
    setSelectedType('customer');
    if (onUserTypeSelect) {
      onUserTypeSelect('customer');
    }
    if (navigation) {
      navigation.navigate('Auth', { userType: 'customer' });
    }
  };

  const handleMechanicSelect = () => {
    setSelectedType('mechanic');
    if (onUserTypeSelect) {
      onUserTypeSelect('mechanic');
    }
    if (navigation) {
      navigation.navigate('Auth', { userType: 'mechanic' });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#F8F8F8', '#E5E5E5', '#F0F0F0']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Header */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.logoContainer,
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
            
            <Animated.Text 
              style={[
                styles.appTitle, 
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              QueueUp
            </Animated.Text>
            <Text style={styles.appSubtitle}>Choose your account type</Text>
          </Animated.View>

          {/* User Type Cards */}
          <View style={styles.cardsContainer}>
            {/* Customer Card */}
            <TouchableOpacity
              style={[styles.userCard, styles.customerCard]}
              onPress={handleCustomerSelect}
              activeOpacity={0.8}
            >
              <View style={styles.cardIcon}>
                <MaterialIcons name="person" size={24} color="#EAB308" />
              </View>
              <Text style={styles.cardTitle}>Customer</Text>
              <Text style={styles.cardDescription}>Find trusted mechanics</Text>
              <View style={styles.cardBadge}>
                <Text style={styles.badgeText}>POPULAR</Text>
              </View>
            </TouchableOpacity>

            {/* Mechanic Card */}
            <TouchableOpacity
              style={[styles.userCard, styles.mechanicCard]}
              onPress={handleMechanicSelect}
              activeOpacity={0.8}
            >
              <View style={styles.cardIcon}>
                <MaterialIcons name="build" size={24} color="#DC2626" />
              </View>
              <Text style={styles.cardTitle}>Mechanic</Text>
              <Text style={styles.cardDescription}>Start earning today</Text>
              <View style={styles.cardBadge}>
                <Text style={styles.badgeText}>EARN</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Join thousands of satisfied users
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    letterSpacing: 1,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  userCard: {
    flex: 1,
    alignItems: 'center',
    padding: 25,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255,255,255,0.8)',
    minHeight: 180,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerCard: {
    borderLeftColor: '#EAB308',
    borderLeftWidth: 4,
  },
  mechanicCard: {
    borderLeftColor: '#DC2626',
    borderLeftWidth: 4,
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 15,
  },
  cardBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  badgeText: {
    color: '#333333',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});