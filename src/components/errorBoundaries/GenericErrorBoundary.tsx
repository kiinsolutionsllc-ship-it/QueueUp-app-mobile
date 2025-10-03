import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import IconFallback from '../shared/IconFallback';
import { ErrorBoundaryState, AppError } from '../../types/JobTypes';
export interface ErrorBoundaryConfig {
  errorCode: string;
  title: string;
  message: string;
  iconName: string;
  possibleCauses: string[];
  primaryAction: {
    label: string;
    icon: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    icon: string;
    onPress: () => void;
  };
}

interface GenericErrorBoundaryProps {
  children: ReactNode;
  config: ErrorBoundaryConfig;
  onError?: (error: Error, errorInfo: any) => void;
}

class GenericErrorBoundary extends Component<GenericErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: GenericErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error, config: ErrorBoundaryConfig): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error: {
        code: config.errorCode,
        message: error.message,
        details: error.stack,
        timestamp: Date.now(),
      },
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`${this.props.config.errorCode} Error Boundary caught an error:`, error, errorInfo);
    
    this.setState({
      error: {
        code: this.props.config.errorCode,
        message: error.message,
        details: errorInfo,
        timestamp: Date.now(),
      },
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.config.primaryAction.onPress();
  };

  handleSecondaryAction = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.config.secondaryAction?.onPress();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          config={this.props.config}
          onRetry={this.handleRetry}
          onSecondaryAction={this.handleSecondaryAction}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: AppError | null;
  config: ErrorBoundaryConfig;
  onRetry: () => void;
  onSecondaryAction: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  config,
  onRetry,
  onSecondaryAction,
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
          name={config.iconName}
          size={64}
          color={theme.error}
          style={styles.errorIcon}
        />
        
        <Text style={[styles.title, { color: theme.text }]}>
          {config.title}
        </Text>
        
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {config.message}
        </Text>
        
        <View style={styles.errorList}>
          {config.possibleCauses.map((cause, index) => (
            <Text key={index} style={[styles.errorItem, { color: theme.textSecondary }]}>
              • {cause}
            </Text>
          ))}
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
          {config.secondaryAction && (
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.textSecondary }]}
              onPress={onSecondaryAction}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={config.secondaryAction.label}
            >
              <MaterialIcons name={config.secondaryAction.icon as any} size={20} color={theme.textSecondary} />
              <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                {config.secondaryAction.label}
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={onRetry}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={config.primaryAction.label}
          >
            <MaterialIcons name={config.primaryAction.icon as any} size={20} color={theme.onPrimary} />
            <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>
              {config.primaryAction.label}
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
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GenericErrorBoundary;
