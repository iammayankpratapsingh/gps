import { useState, useRef, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const useDrawer = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(-width * 0.8));
  
  // Use refs to track animation state and prevent conflicts
  const isAnimating = useRef(false);
  const resetInProgress = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any pending timeouts
  const clearAnimationTimeout = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  // Validate drawer state consistency
  const validateDrawerState = useCallback(() => {
    const currentAnimationValue = drawerAnimation._value;
    const expectedValue = isDrawerOpen ? 0 : -width * 0.8;
    const isInSync = Math.abs(currentAnimationValue - expectedValue) < 1;
    
    if (!isInSync && !isAnimating.current) {
      console.warn('🔄 Drawer state out of sync, correcting...', {
        isDrawerOpen,
        currentAnimationValue,
        expectedValue
      });
      drawerAnimation.setValue(expectedValue);
    }
    
    return isInSync;
  }, [isDrawerOpen, drawerAnimation]);

  const toggleDrawer = useCallback(() => {
    // Prevent multiple simultaneous animations
    if (isAnimating.current || resetInProgress.current) {
      console.log('🚫 Drawer animation in progress, ignoring toggle');
      return;
    }

    console.log('🔄 Toggle drawer called! Current state:', isDrawerOpen);
    const newValue = isDrawerOpen ? -width * 0.8 : 0;
    console.log('🎯 Animating to:', newValue);
    
    isAnimating.current = true;
    
    if (isDrawerOpen) {
      // Closing drawer: Update state AFTER animation completes
      Animated.timing(drawerAnimation, {
        toValue: newValue,
        duration: 200,
        useNativeDriver: true,
      }).start((finished) => {
        isAnimating.current = false;
        if (finished) {
          setIsDrawerOpen(false);
          console.log('✅ Drawer closed, state updated to:', false);
        }
      });
    } else {
      // Opening drawer: Update state immediately for overlay to appear
      setIsDrawerOpen(true);
      console.log('📝 State updated to:', true);
      
      Animated.timing(drawerAnimation, {
        toValue: newValue,
        duration: 200,
        useNativeDriver: true,
      }).start((finished) => {
        isAnimating.current = false;
        console.log('✅ Animation finished:', finished);
      });
    }
  }, [isDrawerOpen, drawerAnimation]);

  const closeDrawer = useCallback(() => {
    if (isDrawerOpen && !isAnimating.current && !resetInProgress.current) {
      isAnimating.current = true;
      
      Animated.timing(drawerAnimation, {
        toValue: -width * 0.8,
        duration: 200,
        useNativeDriver: true,
      }).start((finished) => {
        isAnimating.current = false;
        if (finished) {
          setIsDrawerOpen(false);
        }
      });
    }
  }, [isDrawerOpen, drawerAnimation]);

  // Improved reset function with debouncing and state validation
  const resetDrawer = useCallback(() => {
    // Prevent multiple rapid resets
    if (resetInProgress.current) {
      console.log('🚫 Drawer reset already in progress, ignoring');
      return;
    }

    console.log('🔄 Resetting drawer state to closed. Current state:', isDrawerOpen);
    resetInProgress.current = true;
    
    // Clear any pending animations
    clearAnimationTimeout();
    
    // Stop any ongoing animations
    drawerAnimation.stopAnimation();
    isAnimating.current = false;
    
    // Set state and animation immediately for reset
    setIsDrawerOpen(false);
    drawerAnimation.setValue(-width * 0.8);
    
    console.log('✅ Drawer reset complete. New state:', false);
    
    // Reset the flag after a short delay to allow for state updates
    animationTimeoutRef.current = setTimeout(() => {
      resetInProgress.current = false;
    }, 100);
  }, [isDrawerOpen, drawerAnimation, clearAnimationTimeout]);

  // Force close drawer (for emergency situations)
  const forceCloseDrawer = useCallback(() => {
    console.log('🚨 Force closing drawer');
    clearAnimationTimeout();
    drawerAnimation.stopAnimation();
    isAnimating.current = false;
    resetInProgress.current = false;
    setIsDrawerOpen(false);
    drawerAnimation.setValue(-width * 0.8);
  }, [drawerAnimation, clearAnimationTimeout]);

  // Cleanup function
  const cleanup = useCallback(() => {
    clearAnimationTimeout();
    drawerAnimation.stopAnimation();
    isAnimating.current = false;
    resetInProgress.current = false;
  }, [drawerAnimation, clearAnimationTimeout]);

  return {
    isDrawerOpen,
    drawerAnimation,
    toggleDrawer,
    closeDrawer,
    resetDrawer,
    forceCloseDrawer,
    validateDrawerState,
    cleanup,
  };
};