import * as SecureStore from 'expo-secure-store';

export interface SavedCredentials {
  email: string;
  password: string;
  userType: 'customer' | 'mechanic';
  savedAt: string;
}

export class SecureStorageService {
  private static readonly CREDENTIALS_KEY = 'saved_login_credentials';
  private static readonly SAVE_LOGIN_ENABLED_KEY = 'save_login_enabled';

  /**
   * Save login credentials securely
   */
  static async saveCredentials(
    email: string, 
    password: string, 
    userType: 'customer' | 'mechanic'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const credentials: SavedCredentials = {
        email,
        password,
        userType,
        savedAt: new Date().toISOString()
      };

      await SecureStore.setItemAsync(
        this.CREDENTIALS_KEY, 
        JSON.stringify(credentials)
      );

      // Also save the preference to save login
      await SecureStore.setItemAsync(this.SAVE_LOGIN_ENABLED_KEY, 'true');

      console.log('Credentials saved successfully');
      return { success: true };
    } catch (error) {
      console.error('Error saving credentials:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save credentials' 
      };
    }
  }

  /**
   * Get saved login credentials
   */
  static async getSavedCredentials(): Promise<{ 
    success: boolean; 
    credentials?: SavedCredentials; 
    error?: string 
  }> {
    try {
      const savedData = await SecureStore.getItemAsync(this.CREDENTIALS_KEY);
      
      if (!savedData) {
        return { success: true, credentials: undefined };
      }

      const credentials: SavedCredentials = JSON.parse(savedData);
      
      // Check if credentials are older than 30 days
      const savedDate = new Date(credentials.savedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (savedDate < thirtyDaysAgo) {
        // Auto-delete old credentials
        await this.clearSavedCredentials();
        return { success: true, credentials: undefined };
      }

      return { success: true, credentials };
    } catch (error) {
      console.error('Error getting saved credentials:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get saved credentials' 
      };
    }
  }

  /**
   * Clear saved login credentials
   */
  static async clearSavedCredentials(): Promise<{ success: boolean; error?: string }> {
    try {
      await SecureStore.deleteItemAsync(this.CREDENTIALS_KEY);
      await SecureStore.deleteItemAsync(this.SAVE_LOGIN_ENABLED_KEY);
      
      console.log('Saved credentials cleared');
      return { success: true };
    } catch (error) {
      console.error('Error clearing saved credentials:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear saved credentials' 
      };
    }
  }

  /**
   * Check if save login is enabled
   */
  static async isSaveLoginEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(this.SAVE_LOGIN_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking save login preference:', error);
      return false;
    }
  }

  /**
   * Set save login preference
   */
  static async setSaveLoginEnabled(enabled: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      if (enabled) {
        await SecureStore.setItemAsync(this.SAVE_LOGIN_ENABLED_KEY, 'true');
      } else {
        await SecureStore.deleteItemAsync(this.SAVE_LOGIN_ENABLED_KEY);
        // Also clear saved credentials if disabled
        await this.clearSavedCredentials();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error setting save login preference:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to set save login preference' 
      };
    }
  }
}

export default SecureStorageService;


