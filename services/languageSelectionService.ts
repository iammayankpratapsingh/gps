import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_SELECTION_KEY = 'language_selection_completed';

class LanguageSelectionService {
  /**
   * Check if user has completed language selection
   */
  async hasCompletedLanguageSelection(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(LANGUAGE_SELECTION_KEY);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking language selection status:', error);
      return false;
    }
  }

  /**
   * Mark language selection as completed
   */
  async markLanguageSelectionCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(LANGUAGE_SELECTION_KEY, 'true');
      console.log('Language selection marked as completed');
    } catch (error) {
      console.error('Error marking language selection as completed:', error);
    }
  }

  /**
   * Reset language selection status (for testing purposes)
   */
  async resetLanguageSelectionStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LANGUAGE_SELECTION_KEY);
      console.log('Language selection status reset');
    } catch (error) {
      console.error('Error resetting language selection status:', error);
    }
  }
}

export default new LanguageSelectionService();
