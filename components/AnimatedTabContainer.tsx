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

  useEffect(() => {
    if (isActive && !isExiting) {
      if (animationsEnabled) {
        // Slide in animation
        const startPosition = enterDirection === 'left' ? -screenWidth : screenWidth;
        translateX.setValue(startPosition);
        opacity.setValue(0);
        
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
<<<<<<< HEAD
            duration: 200,
            easing: Easing.out(Easing.cubic),
=======
            duration: 300,
>>>>>>> 5f3d0c0d3ce34557c29546742fe99315b29a1610
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
<<<<<<< HEAD
            duration: 200,
            easing: Easing.out(Easing.cubic),
=======
            duration: 300,
>>>>>>> 5f3d0c0d3ce34557c29546742fe99315b29a1610
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // No animation - set final position immediately
        translateX.setValue(0);
        opacity.setValue(1);
      }
    } else if (isExiting && animationsEnabled) {
      // Slide out animation
      const endPosition = exitDirection === 'left' ? -screenWidth : screenWidth;
      
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: endPosition,
<<<<<<< HEAD
          duration: 150,
          easing: Easing.in(Easing.cubic),
=======
          duration: 300,
>>>>>>> 5f3d0c0d3ce34557c29546742fe99315b29a1610
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
<<<<<<< HEAD
          duration: 150,
          easing: Easing.in(Easing.cubic),
=======
          duration: 300,
>>>>>>> 5f3d0c0d3ce34557c29546742fe99315b29a1610
          useNativeDriver: true,
        }),
      ]).start();
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
