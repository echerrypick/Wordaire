import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Target, Zap } from 'lucide-react-native';
import { useFonts, Inter_700Bold, Inter_500Medium } from '@expo-google-fonts/inter';

const ACHIEVEMENTS = [
  {
    id: 'wordmaster',
    title: 'Word Master',
    description: 'Complete 100 word puzzles',
    icon: Trophy,
    progress: 45,
    total: 100,
  },
  {
    id: 'streak',
    title: 'On Fire',
    description: '7-day playing streak',
    icon: Zap,
    progress: 5,
    total: 7,
  },
  {
    id: 'perfectscore',
    title: 'Perfect Score',
    description: 'Score 100% in any game mode',
    icon: Star,
    progress: 1,
    total: 1,
  },
  {
    id: 'challenge',
    title: 'Challenge Champion',
    description: 'Win 50 daily challenges',
    icon: Target,
    progress: 23,
    total: 50,
  },
];

export default function AchievementsScreen() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#8A2BE2', '#4B0082']}
      style={styles.container}>
      <Text style={styles.title}>Achievements</Text>
      
      <ScrollView style={styles.scrollView}>
        {ACHIEVEMENTS.map((achievement) => (
          <View key={achievement.id} style={styles.achievementCard}>
            <achievement.icon color="#8A2BE2" size={32} />
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(achievement.progress / achievement.total) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {achievement.progress} / {achievement.total}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 16,
  },
  achievementTitle: {
    fontSize: 18,
    color: '#4B0082',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter_500Medium',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8A2BE2',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter_500Medium',
  },
});