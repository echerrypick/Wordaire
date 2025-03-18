import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Brain, Target, Puzzle } from 'lucide-react-native';
import { useFonts, Inter_700Bold, Inter_500Medium } from '@expo-google-fonts/inter';
import { Link, router } from 'expo-router';

const GAME_MODES = [
  {
    id: 'word-search',
    title: 'Word Search',
    description: 'Find hidden words in a grid',
    icon: Search,
    gradient: ['#FF6B6B', '#FF8E8E'],
  },
  {
    id: 'quiz',
    title: 'Knowledge Quiz',
    title: 'Word Quiz',
    description: 'Test your vocabulary and language skills',
    icon: Brain,
    gradient: ['#4FACFE', '#00F2FE'],
  },
  {
    id: 'word-guess',
    title: 'Word Guess',
    description: 'Guess the word from clues',
    icon: Target,
    gradient: ['#FA709A', '#FEE140'],
  },
  {
    id: 'word-pattern',
    title: 'Word Pattern',
    description: 'Complete word patterns',
    icon: Puzzle,
    gradient: ['#FA709A', '#FEE140'],
  },
];

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleGameSelect = (gameId: string) => {
    router.push(`/(tabs)/(game)/${gameId}`);
  };

  return (
    <LinearGradient
      colors={['#8A2BE2', '#4B0082']}
      style={styles.container}> 
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Wordaire</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always">
          <View style={styles.modes}>
            {GAME_MODES.map((mode) => (
              <Pressable
                key={mode.id}
                style={styles.modeCard}
                onPress={() => handleGameSelect(mode.id)}>
                <LinearGradient
                  colors={mode.gradient}
                  style={styles.cardContent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}>
                  <View style={styles.iconContainer}>
                    <mode.icon color="#fff" size={32} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.modeTitle}>{mode.title}</Text>
                    <Text style={styles.modeDescription}>{mode.description}</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    gap: 16,
  },
  modes: {
    flex: 1,
    gap: 16,
  },
  modeCard: {
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  textContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter_500Medium',
  },
});