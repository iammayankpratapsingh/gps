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
    
    Animated.timing(drawerAnimation, {
      toValue: newValue,
      duration: 200,
      useNativeDriver: true,
    }).start((finished) => {
      console.log('✅ Animation finished:', finished, 'New state:', !isDrawerOpen);
    });
    
    setIsDrawerOpen(!isDrawerOpen);
    console.log('📝 State updated to:', !isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    drawerAnimation.setValue(-width * 0.8);
  };

  const resetDrawer = () => {
    console.log('🔄 Resetting drawer state to closed. Current state:', isDrawerOpen);
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
