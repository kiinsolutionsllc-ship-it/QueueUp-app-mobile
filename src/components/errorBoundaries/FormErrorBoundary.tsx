import React, { Component, ReactNode, useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, BackHandler } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ErrorBoundaryState, AppError } from '../../types/JobTypes';
import { useTheme } from '../../contexts/ThemeContext';
import IconFallback from '../shared/IconFallback';

interface FormErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  onReset?: () => void;
  stepName?: string;
}

class FormErrorBoundary extends Component<FormErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error: {
        code: 'FORM_ERROR',
        message: error.message,
        details: error.stack,
        timestamp: Date.now(),
      },
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Form Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: {
        code: 'FORM_ERROR',
        message: error.message,
        details: errorInfo,
        timestamp: Date.now(),
      },
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onRetry?.();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <FormErrorFallback
          error={this.state.error}
          stepName={this.props.stepName}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface FormErrorFallbackProps {
  error: AppError | null;
  stepName?: string;
  onRetry: () => void;
  onReset: () => void;
}

const FormErrorFallback: React.FC<FormErrorFallbackProps> = ({
  error,
  stepName,
  onRetry,
  onReset,
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme() || {
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    error: '#EF4444',
    primary: '#0891B2',
    onPrimary: '#FFFFFF',
  };

  const styles = createErrorStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <IconFallback
          name="warning"
          size={64}
          color={theme.error}
          style={styles.errorIcon}
        />
        
        <Text style={[styles.title, { color: theme.text }]}>
          Something went wrong
        </Text>
        
        {stepName && (
          <Text style={[styles.stepName, { color: theme.textSecondary }]}>
            Error in {stepName} step
          </Text>
        )}
        
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          We encountered an unexpected error. This could be due to:
        </Text>
        
        <View style={styles.errorList}>
          <Text style={[styles.errorItem, { color: theme.textSecondary }]}>
            • Form validation issues
          </Text>
          <Text style={[styles.errorItem, { color: theme.textSecondary }]}>
            • Network connectivity problems
          </Text>
          <Text style={[styles.errorItem, { color: theme.textSecondary }]}>
            • Temporary service outage
          </Text>
        </View>
        
        {error && (
          <View style={styles.errorDetails}>
            <Text style={[styles.errorCode, { color: theme.error }]}>
              Error: {error.code}
            </Text>
            <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
              {error.message}
            </Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: theme.textSecondary }]}
            onPress={onReset}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Reset form"
          >
            <MaterialIcons name="refresh" size={20} color={theme.textSecondary} />
            <Text style={[styles.resetButtonText, { color: theme.textSecondary }]}>
              Reset Form
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={onRetry}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Retry current step"
          >
            <MaterialIcons name="replay" size={20} color={theme.onPrimary} />
            <Text style={[styles.retryButtonText, { color: theme.onPrimary }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const createErrorStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  errorIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepName: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorList: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  errorItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  errorDetails: {
    alignSelf: 'stretch',
    backgroundColor: theme.error + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorCode: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FormErrorBoundary;
