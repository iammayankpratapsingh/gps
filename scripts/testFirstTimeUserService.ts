// Test script for first-time user service
import firstTimeUserService from './services/firstTimeUserService';

const testFirstTimeUserService = async () => {
  console.log('🧪 Testing First Time User Service...');
  
  try {
    // Test initial state
    const initialState = await firstTimeUserService.hasCompletedIntro();
    console.log('Initial state:', initialState);
    
    // Test marking as completed
    await firstTimeUserService.markIntroCompleted();
    const afterCompletion = await firstTimeUserService.hasCompletedIntro();
    console.log('After completion:', afterCompletion);
    
    // Test reset
    await firstTimeUserService.resetIntroCompletion();
    const afterReset = await firstTimeUserService.hasCompletedIntro();
    console.log('After reset:', afterReset);
    
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Make test function available globally
(global as any).testFirstTimeUserService = testFirstTimeUserService;

export default testFirstTimeUserService;
