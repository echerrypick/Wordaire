import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Search, Brain, Target, Puzzle } from 'lucide-react-native';
import { useFonts, Inter_700Bold, Inter_500Medium } from '@expo-google-fonts/inter';

const GAME_MODES = [
  {
    id: 'word-search',
    title: 'Word Search',
    description: 'Find hidden words in a grid of letters',
    icon: Search,
    image: 'https://images.unsplash.com/photo-1632507127789-702acb819355?q=80&w=800&auto=format&fit=crop',
    gradient: ['#FF6B6B', '#FF8E8E'],
  },
  {
    id: 'quiz',
    title: 'Word Quiz',
    description: 'Test your vocabulary and language skills',
    icon: Brain,
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=800&auto=format&fit=crop',
    gradient: ['#4FACFE', '#00F2FE'],
  },
  {
    id: 'word-pattern',
    title: 'Word Pattern',
    description: 'Fill in the missing letters',
    icon: Target,
    image: 'https://images.unsplash.com/photo-1516562309708-05f3b2b2c238?q=80&w=800&auto=format&fit=crop',
    gradient: ['#FA709A', '#FEE140'],
  },
  {
    id: 'crossword',
    title: 'Daily Crossword',
    description: 'Classic crossword puzzles updated daily',
    icon: Puzzle,
    image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?q=80&w=800&auto=format&fit=crop',
    gradient: ['#7F7FD5', '#91EAE4'],
  },
];

export default function GameMenu() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={['#8A2BE2', '#4B0082']} style={styles.container}>
      <Text style={styles.title}>Word Games</Text>
      <Text style={styles.subtitle}>Choose your challenge</Text>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {GAME_MODES.map((mode) => (
          <Link key={mode.id} href={`/(tabs)/(game)/${mode.id}`} asChild>
            <Pressable>
              <View style={styles.card}>
                <Image
                  source={{ uri: mode.image }}
                  style={styles.cardBackground}
                />
                <LinearGradient
                  colors={mode.gradient}
                  style={styles.cardContent}>
                  <mode.icon color="#fff" size={32} />
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{mode.title}</Text>
                    <Text style={styles.cardDescription}>
                      {mode.description}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </Pressable>
          </Link>
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
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  card: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter_500Medium',
  },
});