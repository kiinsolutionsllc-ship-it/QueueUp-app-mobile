import React, { Component, ReactNode, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, SafeAreaView, StatusBar, ScrollView, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ErrorBoundaryState, AppError } from '../../types/JobTypes';
import { useTheme } from '../../contexts/ThemeContext';
import IconFallback from '../shared/IconFallback';

interface PaymentErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  onCancel?: () => void;
}

class PaymentErrorBoundary extends Component<PaymentErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: PaymentErrorBoundaryProps) {
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
        code: 'PAYMENT_ERROR',
        message: error.message,
        details: error.stack,
        timestamp: Date.now(),
      },
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Payment Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: {
        code: 'PAYMENT_ERROR',
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

  handleCancel = () => {
    this.props.onCancel?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <PaymentErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onCancel={this.handleCancel}
        />
      );
    }

    return this.props.children;
  }
}

interface PaymentErrorFallbackProps {
  error: AppError | null;
  onRetry: () => void;
  onCancel: () => void;
}

const PaymentErrorFallback: React.FC<PaymentErrorFallbackProps> = ({
  error,
  onRetry,
  onCancel,
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
          name="error-outline"
          size={64}
          color={theme.error}
          style={styles.errorIcon}
        />
        
        <Text style={[styles.title, { color: theme.text }]}>
          Payment Error
        </Text>
        
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          We encountered an error while processing your payment. This could be due to:
        </Text>
        
        <View style={styles.errorList}>
          <Text style={[styles.errorItem, { color: theme.textSecondary }]}>
            • Network connectivity issues
          </Text>
          <Text style={[styles.errorItem, { color: theme.textSecondary }]}>
            • Payment method declined
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
            style={[styles.cancelButton, { borderColor: theme.textSecondary }]}
            onPress={onCancel}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel payment"
          >
            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={onRetry}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Retry payment"
          >
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
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentErrorBoundary;
