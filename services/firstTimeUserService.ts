import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_TIME_USER_KEY = 'first_time_user_completed';

export interface FirstTimeUserState {
  hasCompletedIntro: boolean;
  hasSelectedLanguage: boolean;
}

class FirstTimeUserService {
  /**
   * Check if user has completed the intro flow
   */
  async hasCompletedIntro(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(FIRST_TIME_USER_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking intro completion:', error);
      return false;
    }
  }

  /**
   * Mark intro as completed
   */
  async markIntroCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(FIRST_TIME_USER_KEY, 'true');
      console.log('Intro marked as completed');
    } catch (error) {
      console.error('Error marking intro as completed:', error);
    }
  }

  /**
   * Reset intro completion (useful for testing)
   */
  async resetIntroCompletion(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FIRST_TIME_USER_KEY);
      console.log('Intro completion reset');
    } catch (error) {
      console.error('Error resetting intro completion:', error);
    }
  }

  /**
   * Get complete first-time user state
   */
  async getFirstTimeUserState(): Promise<FirstTimeUserState> {
    const hasCompletedIntro = await this.hasCompletedIntro();
    return {
      hasCompletedIntro,
      hasSelectedLanguage: hasCompletedIntro, // If intro is completed, language is selected
    };
  }
}

export default new FirstTimeUserService();
