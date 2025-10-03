import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Theme } from '../../types/JobTypes';

interface ModernProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  theme: Theme;
  showLabels?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
}

const ModernProgressIndicator: React.FC<ModernProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  theme,
  showLabels = true,
  variant = 'default',
}) => {
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const stepAnimations = useRef(
    Array.from({ length: totalSteps }, () => new Animated.Value(0))
  ).current;

  const progress = (currentStep - 1) / (totalSteps - 1);

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Animate individual steps
    stepAnimations.forEach((stepAnim, index) => {
      const isCompleted = index < currentStep;
      const isCurrent = index === currentStep - 1;
      
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.timing(stepAnim, {
          toValue: isCompleted ? 1 : isCurrent ? 0.5 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [currentStep, totalSteps, progress, progressAnimation, stepAnimations]);

  const getStepStyle = (index: number) => {
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep - 1;
    
    return {
      backgroundColor: isCompleted 
        ? '#0891B2'
        : isCurrent 
          ? '#F0FDFA'
          : '#F3F4F6',
      borderColor: isCompleted 
        ? '#0891B2'
        : isCurrent 
          ? '#0891B2'
          : '#E5E7EB',
      borderWidth: isCompleted || isCurrent ? 2 : 1,
      transform: [{ scale: stepAnimations[index] }],
    };
  };

  const getStepLabel = (index: number) => {
    const stepNames = [
      'Service',
      'Category',
      'Details',
      'Photos',
      'Review',
      'Payment',
    ];
    return stepNames[index] || `Step ${index + 1}`;
  };

  if (variant === 'minimal') {
    return (
      <View style={styles.minimalContainer}>
        <View style={[styles.minimalBar, { backgroundColor: theme.border + '40' }]}>
          <Animated.View
            style={[
              styles.minimalFill,
              {
                backgroundColor: theme.primary,
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        {showLabels && (
          <Text style={[styles.minimalText, { color: theme.textSecondary }]}>
            {currentStep} of {totalSteps}
          </Text>
        )}
      </View>
    );
  }

  if (variant === 'detailed') {
    return (
      <View style={styles.detailedContainer}>
        <View style={styles.detailedBar}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View key={index} style={styles.detailedStepContainer}>
              <Animated.View
                style={[
                  styles.detailedStep,
                  getStepStyle(index),
                ]}
              >
                {index < currentStep && (
                  <Text style={[styles.checkmark, { color: theme.onPrimary }]}>
                    ✓
                  </Text>
                )}
              </Animated.View>
              {index < totalSteps - 1 && (
                <View
                  style={[
                    styles.detailedConnector,
                    {
                      backgroundColor: index < currentStep ? '#0891B2' : '#E5E7EB',
                    },
                  ]}
                />
              )}
            </View>
          ))}
        </View>
        {showLabels && (
          <Text style={[styles.detailedLabel, { color: theme.text }]}>
            {getStepLabel(currentStep - 1)}
          </Text>
        )}
      </View>
    );
  }

  // Default variant - Ultra Modern
  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, { backgroundColor: '#E5E7EB' }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: '#0891B2',
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={styles.stepContainer}>
            <Animated.View
              style={[
                styles.step,
                getStepStyle(index),
              ]}
            >
              {index < currentStep ? (
                <Text style={[styles.stepNumber, { color: '#FFFFFF' }]}>
                  ✓
                </Text>
              ) : index === currentStep - 1 ? (
                <Text style={[styles.stepNumber, { color: '#0891B2' }]}>
                  {index + 1}
                </Text>
              ) : (
                <Text style={[styles.stepNumber, { color: '#9CA3AF' }]}>
                  {index + 1}
                </Text>
              )}
            </Animated.View>
            {showLabels && (
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: index < currentStep ? '#0F766E' : index === currentStep - 1 ? '#0891B2' : '#9CA3AF',
                    fontWeight: index < currentStep ? '700' : index === currentStep - 1 ? '600' : '500',
                  },
                ]}
              >
                {getStepLabel(index)}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  minimalContainer: {
    paddingVertical: 8,
  },
  minimalBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  minimalFill: {
    height: '100%',
    borderRadius: 2,
  },
  minimalText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  detailedContainer: {
    paddingVertical: 12,
  },
  detailedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailedStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailedStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailedConnector: {
    width: 24,
    height: 2,
    marginHorizontal: 6,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailedLabel: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default ModernProgressIndicator;
