import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withSequence 
} from 'react-native-reanimated';
import { Trophy } from 'lucide-react-native';
import { useFonts, Inter_700Bold, Inter_500Medium } from '@expo-google-fonts/inter';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  streak: number;
}

export default function ScoreBoard({ score, highScore, streak }: ScoreBoardProps) {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSequence(
          withSpring(1.2, { damping: 10 }),
          withSpring(1, { damping: 15 })
        ),
      },
    ],
  }));

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <Animated.Text style={[styles.score, scoreStyle]}>
          {score}
        </Animated.Text>
        <Text style={styles.label}>Current Score</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Trophy size={24} color="#FFD700" />
          <Text style={styles.statValue}>{highScore}</Text>
          <Text style={styles.statLabel}>Best</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.streakValue}>🔥 {streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  score: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: '#4B0082',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#4B0082',
    marginTop: 4,
  },
  streakValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#4B0082',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: '#666',
    marginTop: 2,
  },
});