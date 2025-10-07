import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import themeService from '../services/themeService';

const { width, height } = Dimensions.get('window');

interface IntroSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface IntroSlidesProps {
  onComplete: () => void;
  onSkip: () => void;
}

const introSlides: IntroSlide[] = [
  {
    id: 1,
    title: 'Real-time Tracking',
    description: 'Monitor your devices with live GPS tracking and instant location updates',
    icon: 'gps-fixed',
    color: '#4CAF50',
  },
  {
    id: 2,
    title: 'Battery Optimization',
    description: 'Smart battery management to extend device life and reduce power consumption',
    icon: 'battery-full',
    color: '#FF9800',
  },
  {
    id: 3,
    title: 'Route History',
    description: 'View detailed route history and analyze movement patterns over time',
    icon: 'route',
    color: '#2196F3',
  },
  {
    id: 4,
    title: 'Offline Maps',
    description: 'Access maps and tracking data even without internet connection',
    icon: 'offline-pin',
    color: '#9C27B0',
  },
  {
    id: 5,
    title: 'Secure & Private',
    description: 'Your data is encrypted and secure with enterprise-grade privacy protection',
    icon: 'security',
    color: '#F44336',
  },
];

export default function IntroSlides({ onComplete, onSkip }: IntroSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(true);
  const translateX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const autoAdvanceTimer = useRef<NodeJS.Timeout | null>(null);
  const dotProgressAnim = useRef(new Animated.Value(0)).current;

  const colors = themeService.getColors();

  // Auto-advance functionality (only for slides 1-4)
  useEffect(() => {
    if (isAutoAdvancing && currentSlide < introSlides.length - 1) {
      // Reset dot progress animation
      dotProgressAnim.setValue(0);
      
      // Start dot progress animation
      Animated.timing(dotProgressAnim, {
        toValue: 1,
        duration: 3000, // 3 seconds to match auto-advance
        useNativeDriver: false,
      }).start();

      autoAdvanceTimer.current = setTimeout(() => {
        goToNextSlide();
      }, 3000); // 3 seconds for slides 1-4
    }

    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, [currentSlide, isAutoAdvancing]);

  const goToNextSlide = () => {
    if (currentSlide < introSlides.length - 1) {
      // Animate current slide out to the right
      Animated.timing(translateX, {
        toValue: width,
        duration: 150, // Faster animation - reduced from 300ms
        useNativeDriver: true,
      }).start(() => {
        // Move to next slide
        setCurrentSlide(currentSlide + 1);
        // Set new slide to start from left
        translateX.setValue(-width);
        // Animate new slide in from left to center
        Animated.timing(translateX, {
          toValue: 0,
          duration: 150, // Faster animation - reduced from 300ms
          useNativeDriver: true,
        }).start();
      });
    }
    // Note: onComplete() is now handled by auto-advance timer on last slide
  };

  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      // Animate current slide out to the left
      Animated.timing(translateX, {
        toValue: -width,
        duration: 150, // Faster animation - reduced from 300ms
        useNativeDriver: true,
      }).start(() => {
        // Move to previous slide
        setCurrentSlide(currentSlide - 1);
        // Set new slide to start from right
        translateX.setValue(width);
        // Animate new slide in from right to center
        Animated.timing(translateX, {
          toValue: 0,
          duration: 150, // Faster animation - reduced from 300ms
          useNativeDriver: true,
        }).start();
      });
    }
  };


  const handleSkip = () => {
    setIsAutoAdvancing(false);
    onSkip();
  };

  const renderSlide = (slide: IntroSlide, index: number) => {
    const isActive = index === currentSlide;
    const slideTranslateX = translateX.interpolate({
      inputRange: [-width, 0, width],
      outputRange: [width, 0, -width],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={slide.id}
        style={[
          styles.slide,
          {
            transform: [{ translateX: slideTranslateX }],
            opacity: isActive ? 1 : 0,
          },
        ]}
      >
        <View style={styles.slideContent}>
          <View style={[styles.iconContainer, { backgroundColor: slide.color }]}>
            <Icon name={slide.icon} size={80} color="#fff" />
          </View>
          
          <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {slide.description}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {introSlides.map((_, index) => {
          const isActive = index === currentSlide;
          const isCompleted = index < currentSlide;
          
          return (
            <View key={index} style={styles.dotWrapper}>
              {isActive ? (
                // Animated dot for current slide
                <View style={[styles.dotBackground, { backgroundColor: colors.border }]}>
                  <Animated.View
                    style={[
                      styles.dotProgress,
                      {
                        backgroundColor: colors.primary,
                        width: dotProgressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, 24], // Expand from 8px to 24px
                        }),
                        height: dotProgressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, 8], // Keep height constant
                        }),
                      },
                    ]}
                  />
                </View>
              ) : (
                // Normal dot for other slides
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isCompleted ? colors.primary : colors.border,
                      width: 8,
                      height: 8,
                    },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
      </TouchableOpacity>

      {/* Slides Container */}
      <Animated.View style={styles.slidesContainer}>
        {introSlides.map((slide, index) => renderSlide(slide, index))}
      </Animated.View>

      {/* Dots Indicator */}
      {renderDots()}

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentSlide > 0 && (
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.surface }]}
            onPress={goToPreviousSlide}
          >
            <Icon name="chevron-left" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        
        <View style={styles.navSpacer} />
        
        {currentSlide < introSlides.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.primary }]}
            onPress={goToNextSlide}
          >
            <Icon name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.getStartedButton, { backgroundColor: colors.primary }]}
            onPress={onComplete}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Icon name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  slidesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slide: {
    position: 'absolute',
    width: width,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#000',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    color: '#666',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dotWrapper: {
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 4,
  },
  dotBackground: {
    width: 24,
    height: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  dotProgress: {
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  navSpacer: {
    flex: 1,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
