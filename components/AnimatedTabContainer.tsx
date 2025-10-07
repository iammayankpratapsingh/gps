import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

interface AnimatedTabContainerProps {
  children: React.ReactNode;
  isActive: boolean;
  isExiting: boolean;
  enterDirection: 'left' | 'right';
  exitDirection: 'left' | 'right';
  animationsEnabled: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const AnimatedTabContainer: React.FC<AnimatedTabContainerProps> = ({
  children,
  isActive,
  isExiting,
  enterDirection,
  exitDirection,
  animationsEnabled
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const didAnimateRef = useRef(false);

  useEffect(() => {
    // Only animate when a real tab transition occurs: from inactive -> active or exiting -> inactive
    if (isActive && !isExiting) {
      if (animationsEnabled) {
        // Slide in animation - Faster speeds
        const startPosition = enterDirection === 'left' ? -screenWidth : screenWidth;
        translateX.setValue(startPosition);
        opacity.setValue(0);
        
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 150, // Reduced from 200ms
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150, // Reduced from 200ms
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          didAnimateRef.current = true;
        });
      } else {
        // No animation - set final position immediately
        translateX.setValue(0);
        opacity.setValue(1);
      }
    } else if (isExiting && animationsEnabled) {
      // Slide out animation - Faster speeds
      const endPosition = exitDirection === 'left' ? -screenWidth : screenWidth;
      
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: endPosition,
          duration: 120, // Reduced from 150ms
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120, // Reduced from 150ms
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        didAnimateRef.current = true;
      });
    }
  }, [isActive, isExiting, enterDirection, exitDirection, animationsEnabled, translateX, opacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transform: [{ translateX }],
        opacity,
      }}
    >
      {children}
    </Animated.View>
  );
};
