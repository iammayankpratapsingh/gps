import { useState, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const useDrawer = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(-width * 0.8));

  const toggleDrawer = () => {
    console.log('🔄 Toggle drawer called! Current state:', isDrawerOpen);
    const newValue = isDrawerOpen ? -width * 0.8 : 0;
    console.log('🎯 Animating to:', newValue);
    
    if (isDrawerOpen) {
      // Closing drawer: Update state AFTER animation completes
      Animated.timing(drawerAnimation, {
        toValue: newValue,
        duration: 200,
        useNativeDriver: true,
      }).start((finished) => {
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
        console.log('✅ Animation finished:', finished);
      });
    }
  };

  const closeDrawer = () => {
    if (isDrawerOpen) {
      Animated.timing(drawerAnimation, {
        toValue: -width * 0.8,
        duration: 200,
        useNativeDriver: true,
      }).start((finished) => {
        if (finished) {
          setIsDrawerOpen(false);
        }
      });
    }
  };

  const resetDrawer = () => {
    console.log('🔄 Resetting drawer state to closed. Current state:', isDrawerOpen);
    // For reset, we can immediately set both state and animation since it's a reset operation
    setIsDrawerOpen(false);
    drawerAnimation.setValue(-width * 0.8);
    console.log('✅ Drawer reset complete. New state:', false);
  };

  return {
    isDrawerOpen,
    drawerAnimation,
    toggleDrawer,
    closeDrawer,
    resetDrawer,
  };
};
