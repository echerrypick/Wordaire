import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

interface CountdownTimerProps {
  seconds: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

export default function CountdownTimer({ seconds, onTimeUp, isRunning }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(seconds);
  const scale = useSharedValue(1);

  const [fontsLoaded] = useFonts({
    Inter_700Bold,
  });

  // Reset timer when seconds prop changes
  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  // Handle countdown logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        if (timeLeft <= 1) {
          clearInterval(intervalId);
          onTimeUp();
          setTimeLeft(0);
        } else {
          setTimeLeft(prev => {
            // Animate when time is running low
            if (prev <= 10) {
              scale.value = withSequence(
                withSpring(1.2, { damping: 10 }),
                withSpring(1, { damping: 15 })
              );
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, timeLeft, onTimeUp, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    color: withTiming(
      timeLeft <= 10 ? '#FF4B4B' : '#4B0082',
      { duration: 200 }
    ),
  }));

  if (!fontsLoaded) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.timerContainer}>
      <Animated.Text style={[styles.timer, animatedStyle]}>
        {formatTime(timeLeft)}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  timer: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
});