import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { useFonts, Inter_700Bold, Inter_500Medium } from '@expo-google-fonts/inter';
import { Info } from 'lucide-react-native';
import CountdownTimer from '@/components/CountdownTimer';
import { useGameSettings } from '@/contexts/GameSettingsContext';
import { getRandomWords } from '@/utils/wordBank';

// Game configuration based on difficulty
const GAME_CONFIG = {
  easy: {
    hiddenLetters: 2,
    timeLimit: 30,
    rounds: 10,
    pointsPerWord: 100
  },
  medium: {
    hiddenLetters: 3,
    timeLimit: 25,
    rounds: 10,
    pointsPerWord: 150
  },
  hard: {
    hiddenLetters: 4,
    timeLimit: 20,
    rounds: 10,
    pointsPerWord: 200
  }
};

type GameState = {
  currentWord: string;
  definition: string;
  hint: string;
  pattern: string[];
  hiddenIndices: number[];
  userInput: string[];
  isCorrect: boolean | null;
  showHint: boolean;
};

export default function WordPatternGame() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });

  const { difficulty } = useGameSettings();
  const config = GAME_CONFIG[difficulty];

  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [shake, setShake] = useState(false);

  const [gameState, setGameState] = useState<GameState>(() => {
    const word = getRandomWords(difficulty, 1)[0];
    const hiddenIndices = generateHiddenIndices(word.word, config.hiddenLetters);
    return {
      currentWord: word.word,
      definition: word.definition,
      hint: word.hint || '',
      pattern: word.word.split(''),
      hiddenIndices,
      userInput: Array(hiddenIndices.length).fill(''),
      isCorrect: null,
      showHint: false,
    };
  });

  function generateHiddenIndices(word: string, count: number): number[] {
    const indices = Array.from({ length: word.length }, (_, i) => i);
    return shuffleArray(indices).slice(0, count);
  }

  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  const handleInputChange = (text: string, index: number) => {
    if (!isGameActive || gameState.isCorrect !== null) return;

    const newInput = [...gameState.userInput];
    newInput[index] = text.toUpperCase();
    setGameState(prev => ({ ...prev, userInput: newInput }));

    // Check if all inputs are filled
    if (newInput.every(input => input !== '')) {
      checkAnswer(newInput);
    }
  };

  const checkAnswer = (input: string[]) => {
    const correct = gameState.hiddenIndices.every((hiddenIndex, i) => 
      input[i] === gameState.pattern[hiddenIndex]
    );

    setGameState(prev => ({ ...prev, isCorrect: correct }));

    if (correct) {
      const streakBonus = Math.floor(streak / 3) * 50;
      setScore(prev => prev + config.pointsPerWord + streakBonus);
      setStreak(prev => prev + 1);
      setTimeout(nextRound, 1500);
    } else {
      setStreak(0);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleTimeUp = () => {
    setIsGameActive(false);
    setGameState(prev => ({ ...prev, isCorrect: false }));
  };

  const nextRound = () => {
    if (round >= config.rounds - 1) {
      setIsGameActive(false);
      return;
    }

    const word = getRandomWords(difficulty, 1)[0];
    const hiddenIndices = generateHiddenIndices(word.word, config.hiddenLetters);
    
    setRound(prev => prev + 1);
    setGameState({
      currentWord: word.word,
      definition: word.definition,
      hint: word.hint || '',
      pattern: word.word.split(''),
      hiddenIndices,
      userInput: Array(hiddenIndices.length).fill(''),
      isCorrect: null,
      showHint: false,
    });
  };

  const resetGame = () => {
    const word = getRandomWords(difficulty, 1)[0];
    const hiddenIndices = generateHiddenIndices(word.word, config.hiddenLetters);
    
    setScore(0);
    setRound(0);
    setStreak(0);
    setIsGameActive(true);
    setGameState({
      currentWord: word.word,
      definition: word.definition,
      hint: word.hint || '',
      pattern: word.word.split(''),
      hiddenIndices,
      userInput: Array(hiddenIndices.length).fill(''),
      isCorrect: null,
      showHint: false,
    });
  };

  const Tutorial = () => (
    <View style={styles.tutorialOverlay}>
      <View style={styles.tutorialCard}>
        <Text style={styles.tutorialTitle}>How to Play Word Pattern</Text>
        <View style={styles.tutorialContent}>
          <Text style={styles.tutorialText}>
            1. Fill in the missing letters to complete the word
          </Text>
          <Text style={styles.tutorialText}>
            2. Use the definition and hint to help you guess
          </Text>
          <Text style={styles.tutorialText}>
            3. Build a streak for bonus points!
          </Text>
        </View>
        <Pressable
          style={styles.tutorialButton}
          onPress={() => setShowTutorial(false)}>
          <Text style={styles.tutorialButtonText}>Got it!</Text>
        </Pressable>
      </View>
    </View>
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient colors={['#8A2BE2', '#4B0082']} style={styles.container}>
      {showTutorial && <Tutorial />}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.levelInfo}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - 
              Round {round + 1}/{config.rounds}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <CountdownTimer
              seconds={config.timeLimit}
              onTimeUp={handleTimeUp}
              isRunning={isGameActive && gameState.isCorrect === null}
            />
            {streak > 0 && (
              <Text style={styles.streak}>🔥 {streak}</Text>
            )}
            <Pressable
              style={styles.infoButton}
              onPress={() => setShowTutorial(true)}>
              <Info size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.gameCard}>
          <Text style={styles.definition}>{gameState.definition}</Text>
          
          {!gameState.showHint && gameState.isCorrect === null && (
            <Pressable
              style={styles.hintButton}
              onPress={() => setGameState(prev => ({ ...prev, showHint: true }))}>
              <Text style={styles.hintButtonText}>Show Hint</Text>
            </Pressable>
          )}

          {gameState.showHint && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>{gameState.hint}</Text>
            </View>
          )}

          <Animated.View
            style={[
              styles.wordContainer,
              shake && {
                transform: [{
                  translateX: withSequence(
                    withTiming(-10, { duration: 50 }),
                    withTiming(10, { duration: 50 }),
                    withTiming(-10, { duration: 50 }),
                    withTiming(10, { duration: 50 }),
                    withTiming(0, { duration: 50 })
                  )
                }]
              }
            ]}>
            {gameState.pattern.map((letter, index) => {
              const isHidden = gameState.hiddenIndices.includes(index);
              const inputIndex = gameState.hiddenIndices.indexOf(index);
              
              if (isHidden) {
                return (
                  <TextInput
                    key={index}
                    style={[
                      styles.letterInput,
                      gameState.isCorrect === false && 
                      gameState.userInput[inputIndex] && 
                      styles.incorrectInput,
                      gameState.isCorrect === true && 
                      styles.correctInput,
                    ]}
                    value={gameState.userInput[inputIndex]}
                    onChangeText={(text) => handleInputChange(text, inputIndex)}
                    maxLength={1}
                    autoCapitalize="characters"
                    editable={isGameActive && gameState.isCorrect === null}
                  />
                );
              }

              return (
                <View key={index} style={styles.letterBox}>
                  <Text style={styles.letter}>{letter}</Text>
                </View>
              );
            })}
          </Animated.View>

          {!isGameActive && (
            <View style={styles.gameOverContainer}>
              <Text style={[
                styles.gameOverText,
                round >= config.rounds - 1 ? styles.completedText : styles.timeUpText
              ]}>
                {round >= config.rounds - 1 ? 'Game Complete!' : 'Time\'s Up!'}
              </Text>
              <Text style={styles.finalScoreText}>Final Score: {score}</Text>
              <Pressable
                style={styles.playAgainButton}
                onPress={resetGame}>
                <Text style={styles.playAgainButtonText}>Play Again</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'flex-start',
  },
  score: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  levelInfo: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
    opacity: 0.9,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streak: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  infoButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  gameCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  definition: {
    fontSize: 20,
    color: '#4B0082',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  hintButton: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: 'center',
    marginBottom: 20,
  },
  hintButtonText: {
    color: '#4B0082',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  hintContainer: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  hintText: {
    fontSize: 16,
    color: '#4B0082',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  wordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  letterBox: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderRadius: 8,
  },
  letter: {
    fontSize: 24,
    color: '#4B0082',
    fontFamily: 'Inter_700Bold',
  },
  letterInput: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#8A2BE2',
    borderRadius: 8,
    fontSize: 24,
    color: '#4B0082',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  incorrectInput: {
    borderColor: '#FF4B4B',
    backgroundColor: '#FFE5E5',
  },
  correctInput: {
    borderColor: '#50C878',
    backgroundColor: '#E5FFE5',
  },
  gameOverContainer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  gameOverText: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  timeUpText: {
    color: '#FF4B4B',
  },
  completedText: {
    color: '#50C878',
  },
  finalScoreText: {
    fontSize: 20,
    color: '#4B0082',
    fontFamily: 'Inter_500Medium',
  },
  playAgainButton: {
    backgroundColor: '#9932CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 3,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
    borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    borderRightColor: 'rgba(138, 43, 226, 0.5)',
    borderBottomColor: 'rgba(138, 43, 226, 0.8)',
    transform: [
      { translateY: -2 },
      { perspective: 1000 },
      { rotateX: '10deg' }
    ],
  },
  playAgainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  tutorialCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  tutorialTitle: {
    fontSize: 24,
    color: '#4B0082',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  tutorialContent: {
    gap: 16,
    marginBottom: 24,
  },
  tutorialText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Inter_500Medium',
  },
  tutorialButton: {
    backgroundColor: '#9932CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  tutorialButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
});