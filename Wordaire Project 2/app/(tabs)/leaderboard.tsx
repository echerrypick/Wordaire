import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '@/store/gameStore';

export default function LeaderboardScreen() {
  const { scores, getTotalScore } = useGameStore();
  const totalScore = getTotalScore();

  const sortedScores = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Total Score</Text>
          <Text style={styles.scoreValue}>{totalScore}</Text>
        </View>
      </View>

      <View style={styles.recentScores}>
        <Text style={styles.sectionTitle}>Recent High Scores</Text>
        {sortedScores.map((score, index) => (
          <View key={index} style={styles.scoreItem}>
            <View style={styles.scoreRank}>
              <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.gameTitle}>{score.gameId}</Text>
              <Text style={styles.scoreDetails}>
                {score.difficulty} • {Math.round(score.timeSpent)}s
              </Text>
            </View>
            <Text style={styles.points}>{score.score}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  scoreCard: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
  },
  scoreTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  recentScores: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 16,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  scoreRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  scoreInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 2,
  },
  scoreDetails: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
  points: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#6366f1',
  },
});