import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../types/JobTypes';
// import { createJobStyles } from '../../styles/CreateJobScreenStyles';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  theme: Theme;
  style?: any;
}

const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  theme,
  style,
}) => {
  // const styles = createJobStyles(theme);
  const styles = additionalStyles;

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Get step status
  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      return 'completed';
    }
    if (stepNumber === currentStep) {
      return 'current';
    }
    if (stepNumber < currentStep) {
      return 'completed';
    }
    return 'pending';
  };

  // Get step color
  const getStepColor = (stepNumber: number) => {
    const status = getStepStatus(stepNumber);
    switch (status) {
      case 'completed':
        return theme.success;
      case 'current':
        return theme.primary;
      case 'pending':
        return theme.border;
      default:
        return theme.border;
    }
  };

  return (
    <View style={[styles.stepProgressContainer, style]}>
      {/* Progress Bar */}
      <View style={[styles.stepProgressBar, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.stepProgressFill,
            {
              width: `${progressPercentage}%`,
              backgroundColor: theme.primary,
            },
          ]}
        />
      </View>

      {/* Step Indicators */}
      <View style={styles.stepIndicators}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(stepNumber);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';

          return (
            <View
              key={stepNumber}
              style={[
                styles.stepIndicator,
                {
                  backgroundColor: getStepColor(stepNumber),
                  borderColor: getStepColor(stepNumber),
                },
                isCompleted && styles.stepIndicatorCompleted,
                isCurrent && styles.stepIndicatorCurrent,
              ]}
            >
              {isCompleted ? (
                <Text style={[styles.stepIndicatorText, { color: theme.onPrimary }]}>
                  ✓
                </Text>
              ) : (
                <Text
                  style={[
                    styles.stepIndicatorText,
                    { color: isCurrent ? theme.onPrimary : theme.textSecondary },
                  ]}
                >
                  {stepNumber}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Step Text */}
      <Text style={[styles.stepText, { color: theme.textSecondary }]}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
};

// Additional styles for this component
const additionalStyles = StyleSheet.create({
  stepProgressContainer: {
    marginBottom: 16,
  },
  stepProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 16,
  },
  stepProgressFill: {
    height: '100%',
    backgroundColor: '#0891B2',
    borderRadius: 2,
  },
  stepText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepIndicatorCurrent: {
    backgroundColor: '#0891B2',
    borderColor: '#0891B2',
  },
  stepIndicatorText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default StepProgress;
