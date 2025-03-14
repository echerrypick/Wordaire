import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Settings, Medal, Clock, Trophy } from 'lucide-react-native';
import { useGameStore } from '@/store/gameStore';

export default function ProfileScreen() {
  const { scores, getTotalScore } = useGameStore();
  const totalScore = getTotalScore();
  const gamesPlayed = scores.length;
  const averageScore = gamesPlayed > 0 ? Math.round(totalScore / gamesPlayed) : 0;
  const totalTimePlayed = scores.reduce((total, score) => total + score.timeSpent, 0);

  const stats = [
    {
      icon: Trophy,
      label: 'Total Score',
      value: totalScore.toString(),
      color: '#6366f1',
    },
    {
      icon: Medal,
      label: 'Games Played',
      value: gamesPlayed.toString(),
      color: '#34d399',
    },
    {
      icon: Clock,
      label: 'Time Played',
      value: `${Math.round(totalTimePlayed / 60)}m`,
      color: '#fb923c',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>W</Text>
          </View>
          <Text style={styles.username}>Wordaire Player</Text>
          <Text style={styles.level}>Level {Math.floor(totalScore / 1000) + 1}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color }]}>
              <stat.icon size={24} color="#ffffff" />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.settingsButton}>
        <Settings size={24} color="#64748b" />
        <Text style={styles.settingsText}>Settings</Text>
      </Pressable>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  username: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  level: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
  },
});