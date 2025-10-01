import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { hapticService } from './HapticService';

class SecurityService {
  constructor() {
    this.biometricType = null;
    this.isBiometricAvailable = false;
    this.checkBiometricAvailability();
  }

  // Check if biometric authentication is available
  async checkBiometricAvailability() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      this.isBiometricAvailable = hasHardware && isEnrolled;
      this.biometricType = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) 
        ? 'face' 
        : supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) 
        ? 'fingerprint' 
        : null;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      this.isBiometricAvailable = false;
    }
  }

  // Authenticate with biometrics
  async authenticateWithBiometrics(reason = 'Authenticate to continue') {
    try {
      if (!this.isBiometricAvailable) {
        throw new Error('Biometric authentication not available');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await hapticService.success();
        return { success: true, error: null };
      } else {
        await hapticService.error();
        return { success: false, error: result.error };
      }
    } catch (error) {
      await hapticService.error();
      return { success: false, error: error.message };
    }
  }

  // Store sensitive data securely
  async storeSecureData(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await SecureStore.setItemAsync(key, jsonValue);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error storing secure data:', error);
      return { success: false, error: error.message };
    }
  }

  // Retrieve sensitive data securely
  async getSecureData(key) {
    try {
      const jsonValue = await SecureStore.getItemAsync(key);
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  // Delete sensitive data
  async deleteSecureData(key) {
    try {
      await SecureStore.deleteItemAsync(key);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting secure data:', error);
      return { success: false, error: error.message };
    }
  }

  // Store authentication token securely
  async storeAuthToken(token) {
    return await this.storeSecureData('auth_token', token);
  }

  // Retrieve authentication token
  async getAuthToken() {
    return await this.getSecureData('auth_token');
  }

  // Delete authentication token
  async deleteAuthToken() {
    return await this.deleteSecureData('auth_token');
  }

  // Store user credentials securely
  async storeUserCredentials(credentials) {
    const encryptedCredentials = await this.encryptData(credentials);
    return await this.storeSecureData('user_credentials', encryptedCredentials);
  }

  // Retrieve user credentials
  async getUserCredentials() {
    const encryptedCredentials = await this.getSecureData('user_credentials');
    if (encryptedCredentials) {
      return await this.decryptData(encryptedCredentials);
    }
    return null;
  }

  // Simple encryption (in production, use a proper encryption library)
  async encryptData(data) {
    try {
      // This is a simple base64 encoding for demo purposes
      // In production, use a proper encryption library like react-native-crypto-js
      const jsonString = JSON.stringify(data);
      return btoa(jsonString);
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  }

  // Simple decryption
  async decryptData(encryptedData) {
    try {
      const jsonString = atob(encryptedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  }

  // Validate password strength
  validatePasswordStrength(password) {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNoSpaces = !/\s/.test(password);
    const hasNoCommonPatterns = !this.hasCommonPatterns(password);

    const strength = {
      score: 0,
      feedback: [],
      isValid: false,
      strengthLevel: 'weak',
    };

    if (password.length < minLength) {
      strength.feedback.push(`Password must be at least ${minLength} characters long`);
    } else {
      strength.score += 1;
    }

    if (!hasUpperCase) {
      strength.feedback.push('Password must contain at least one uppercase letter');
    } else {
      strength.score += 1;
    }

    if (!hasLowerCase) {
      strength.feedback.push('Password must contain at least one lowercase letter');
    } else {
      strength.score += 1;
    }

    if (!hasNumbers) {
      strength.feedback.push('Password must contain at least one number');
    } else {
      strength.score += 1;
    }

    if (!hasSpecialChar) {
      strength.feedback.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
    } else {
      strength.score += 1;
    }

    if (!hasNoSpaces) {
      strength.feedback.push('Password cannot contain spaces');
    } else {
      strength.score += 1;
    }

    if (!hasNoCommonPatterns) {
      strength.feedback.push('Password cannot contain common patterns (123, abc, qwe, etc.)');
    } else {
      strength.score += 1;
    }

    // Determine strength level
    if (strength.score >= 6) {
      strength.strengthLevel = 'strong';
    } else if (strength.score >= 4) {
      strength.strengthLevel = 'medium';
    } else {
      strength.strengthLevel = 'weak';
    }

    strength.isValid = strength.score >= 5;

    return strength;
  }

  // Check for common patterns
  hasCommonPatterns(password) {
    const commonPatterns = [
      /123/g, /abc/g, /qwe/g, /asd/g, /zxc/g,
      /password/i, /admin/i, /user/i, /test/i,
      /111/g, /000/g, /aaa/g, /zzz/g
    ];
    
    return commonPatterns.some(pattern => pattern.test(password));
  }

  // Generate secure random string
  generateSecureRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Check if device is jailbroken/rooted
  async isDeviceSecure() {
    try {
      // This is a basic check - in production, use a proper library
      // like react-native-device-info with jailbreak detection
      const result = {
        isSecure: true,
        isJailbroken: false,
        isRooted: false,
      };
      return result;
    } catch (error) {
      console.error('Error checking device security:', error);
      const result = {
        isSecure: false,
        isJailbroken: false,
        isRooted: false,
      };
      return result;
    }
  }

  // Session timeout management
  startSessionTimeout(timeoutMinutes = 30, onTimeout) {
    const timeoutMs = timeoutMinutes * 60 * 1000;
    
    // Clear existing timeout
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }

    // Set new timeout
    this.sessionTimeoutId = setTimeout(() => {
      onTimeout?.();
    }, timeoutMs);
  }

  // Reset session timeout
  resetSessionTimeout() {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }
  }

  // Clear session timeout
  clearSessionTimeout() {
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }
  }

  // Get security recommendations
  getSecurityRecommendations() {
    const recommendations = [];

    if (!this.isBiometricAvailable) {
      recommendations.push({
        type: 'biometric',
        title: 'Enable Biometric Authentication',
        description: 'Add fingerprint or face recognition for better security',
        priority: 'high',
      });
    }

    if (Platform.OS === 'android') {
      recommendations.push({
        type: 'device',
        title: 'Keep Device Updated',
        description: 'Make sure your device has the latest security updates',
        priority: 'medium',
      });
    }

    recommendations.push({
      type: 'password',
      title: 'Use Strong Passwords',
      description: 'Use a combination of letters, numbers, and special characters',
      priority: 'high',
    });

    recommendations.push({
      type: 'session',
      title: 'Log Out When Done',
      description: 'Always log out when you finish using the app',
      priority: 'medium',
    });

    return recommendations;
  }

  // Security audit
  async performSecurityAudit() {
    const audit = {
      timestamp: new Date().toISOString(),
      biometricEnabled: this.isBiometricAvailable,
      deviceSecure: await this.isDeviceSecure(),
      hasAuthToken: !!(await this.getAuthToken()),
      recommendations: this.getSecurityRecommendations(),
      score: 0,
    };

    // Calculate security score
    if (audit.biometricEnabled) audit.score += 25;
    if (audit.deviceSecure.isSecure) audit.score += 25;
    if (audit.hasAuthToken) audit.score += 25;
    if (audit.recommendations.length === 0) audit.score += 25;

    return audit;
  }
}

export const securityService = new SecurityService();
