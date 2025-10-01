import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import IconFallback from './IconFallback';
import { useTheme } from '../../contexts/ThemeContext';

class GoogleServicesErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a Google services related error
    const isGoogleError = error.message && (
      error.message.includes('Google') ||
      error.message.includes('Location') ||
      error.message.includes('SignIn') ||
      error.message.includes('expo-location')
    );

    if (isGoogleError) {
      return { hasError: true, error };
    }
    
    // Re-throw non-Google errors
    throw error;
  }

  componentDidCatch(error, errorInfo) {
  }

  render() {
    if (this.state.hasError) {
      return <GoogleServicesErrorFallback onRetry={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

const GoogleServicesErrorFallback = ({ onRetry }) => {
  const { getCurrentTheme } = useTheme();
  const theme = getCurrentTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.errorCard, { backgroundColor: theme.cardBackground }]}>
        <IconFallback name="warning" size={48} color={theme.warning} />
        <Text style={[styles.errorTitle, { color: theme.text }]}>
          Google Services Preview
        </Text>
        <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
          Google services are currently in preview mode. This feature will be available in a future update.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleServicesErrorBoundary;
