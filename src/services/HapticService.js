import * as Haptics from 'expo-haptics';

class HapticService {
  constructor() {
    this.isEnabled = true;
    this.checkAvailability();
  }

  async checkAvailability() {
    try {
      // Android haptics are generally available
      this.isEnabled = true;
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
      this.isEnabled = false;
    }
  }

  async light() {
    if (!this.isEnabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Light haptic failed:', error);
    }
  }

  async medium() {
    if (!this.isEnabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Medium haptic failed:', error);
    }
  }

  async heavy() {
    if (!this.isEnabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Heavy haptic failed:', error);
    }
  }

  async success() {
    if (!this.isEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Success haptic failed:', error);
    }
  }

  async warning() {
    if (!this.isEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Warning haptic failed:', error);
    }
  }

  async error() {
    if (!this.isEnabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Error haptic failed:', error);
    }
  }

  async selection() {
    if (!this.isEnabled) return;
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.warn('Selection haptic failed:', error);
    }
  }

  async impactAsync(style = Haptics.ImpactFeedbackStyle.Light) {
    if (!this.isEnabled) return;
    try {
      await Haptics.impactAsync(style);
    } catch (error) {
      console.warn('Impact haptic failed:', error);
    }
  }

  // Custom haptic patterns for specific app actions
  async buttonPress() {
    await this.light();
  }

  async tabSwitch() {
    await this.selection();
  }

  async jobCreated() {
    await this.success();
  }

  async jobCompleted() {
    await this.success();
  }

  async errorOccurred() {
    await this.error();
  }

  async warningShown() {
    await this.warning();
  }

  async messageReceived() {
    await this.light();
  }

  async paymentSuccess() {
    await this.success();
  }

  async paymentFailed() {
    await this.error();
  }

  // Toggle haptic feedback on/off
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  isHapticEnabled() {
    return this.isEnabled;
  }
}

export const hapticService = new HapticService();
