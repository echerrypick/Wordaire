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
import { Info, Trophy, Delete } from 'lucide-react-native';
import CountdownTimer from '@/components/CountdownTimer';
import { useGameSettings } from '@/contexts/GameSettingsContext';
import { getRandomWords } from '@/utils/wordBank';

// Game configuration based on difficulty
const GAME_CONFIG = {
  easy: {
    hiddenLetters: 2,
    timeLimit: 30,
    rounds: 10,
    pointsPerWord: 100,
    bonusTimePoints: 5,
    streakBonus: 50
  },
  medium: {
    hiddenLetters: 3,
    timeLimit: 25,
    rounds: 10,
    pointsPerWord: 150,
    bonusTimePoints: 8,
    streakBonus: 75
  },
  hard: {
    hiddenLetters: 4,
    timeLimit: 20,
    rounds: 10,
    pointsPerWord: 200,
    bonusTimePoints: 10,
    streakBonus: 100
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
  timeLeft: number;
};

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
];

export default function WordPatternGame() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });
  
  const { difficulty } = useGameSettings();
  const config = GAME_CONFIG[difficulty];

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
      timeLeft: config.timeLimit
    };
  });

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [shake, setShake] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [currentInputIndex, setCurrentInputIndex] = useState(0);

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

  const handleKeyPress = (key: string) => {
    if (!isGameActive || gameState.isCorrect !== null) return;

    if (key === '⌫') {
      // Handle backspace
      if (currentInputIndex > 0) {
        const newInput = [...gameState.userInput];
        newInput[currentInputIndex - 1] = '';
        setGameState(prev => ({ ...prev, userInput: newInput }));
        setCurrentInputIndex(prev => prev - 1);
      }
    } else {
      // Handle letter input
      if (currentInputIndex < gameState.hiddenIndices.length) {
        const newInput = [...gameState.userInput];
        newInput[currentInputIndex] = key;
        setGameState(prev => ({ ...prev, userInput: newInput }));
        setCurrentInputIndex(prev => prev + 1);

        // Check if all inputs are filled
        if (currentInputIndex === gameState.hiddenIndices.length - 1) {
          checkAnswer([...newInput.slice(0, currentInputIndex), key]);
        }
      }
    }
  };

  const checkAnswer = (input: string[]) => {
    const correct = gameState.hiddenIndices.every((hiddenIndex, i) => 
      input[i] === gameState.pattern[hiddenIndex]
    );

    setGameState(prev => ({ ...prev, isCorrect: correct }));

    if (correct) {
      // Calculate score based on:
      // 1. Base points for the word
      // 2. Time bonus (more time left = more points)
      // 3. Streak bonus
      const timeBonus = Math.floor(gameState.timeLeft * config.bonusTimePoints);
      const streakBonus = Math.floor(streak / 3) * config.streakBonus;
      const totalPoints = config.pointsPerWord + timeBonus + streakBonus;

      setScore(prev => {
        const newScore = prev + totalPoints;
        if (newScore > highScore) {
          setHighScore(newScore);
        }
        return newScore;
      });
      setStreak(prev => prev + 1);

      // Show success animation
      Animated.sequence([
        Animated.spring(1.2, { damping: 5 }),
        Animated.spring(1, { damping: 4 })
      ]).start();

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
    if (currentLevel >= config.rounds - 1) {
      setRoundComplete(true);
      setIsGameActive(false);
      return;
    }

    const word = getRandomWords(difficulty, 1)[0];
    const hiddenIndices = generateHiddenIndices(word.word, config.hiddenLetters);
    
    setCurrentLevel(prev => prev + 1);
    setGameState({
      currentWord: word.word,
      definition: word.definition,
      hint: word.hint || '',
      pattern: word.word.split(''),
      hiddenIndices,
      userInput: Array(hiddenIndices.length).fill(''),
      isCorrect: null,
      showHint: false,
      timeLeft: config.timeLimit,
    });
    setCurrentInputIndex(0);
  };

  const resetGame = () => {
    const word = getRandomWords(difficulty, 1)[0];
    const hiddenIndices = generateHiddenIndices(word.word, config.hiddenLetters);
    
    setScore(0);
    setCurrentLevel(0);
    setStreak(0);
    setIsGameActive(true);
    setRoundComplete(false);
    setGameState({
      currentWord: word.word,
      definition: word.definition,
      hint: word.hint || '',
      pattern: word.word.split(''),
      hiddenIndices,
      userInput: Array(hiddenIndices.length).fill(''),
      isCorrect: null,
      showHint: false,
      timeLeft: config.timeLimit,
    });
    setCurrentInputIndex(0);
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
          <Text style={styles.tutorialText}>
            4. Complete words quickly for time bonuses
          </Text>
        </View>
        <View style={styles.bonusInfo}>
          <Text style={styles.bonusTitle}>Scoring:</Text>
          <Text style={styles.bonusText}>• Word completion: {config.pointsPerWord} points</Text>
          <Text style={styles.bonusText}>• Time bonus: {config.bonusTimePoints} points/second</Text>
          <Text style={styles.bonusText}>• Streak bonus: {config.streakBonus} points/3 words</Text>
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
      <View style={styles.gameWrapper}>
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.levelInfo}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - 
              Round {currentLevel + 1}/{config.rounds}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <CountdownTimer
              seconds={config.timeLimit}
              onTimeUp={handleTimeUp}
              isRunning={isGameActive && gameState.isCorrect === null}
            />
            {streak > 0 && (
              <View style={styles.streakContainer}>
                <Trophy size={16} color="#FFD700" />
                <Text style={styles.streak}>{streak}</Text>
              </View>
            )}
            <Pressable
              style={styles.infoButton}
              onPress={() => setShowTutorial(true)}>
              <Info size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}>
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
              const isCurrent = inputIndex === currentInputIndex;
              
              if (isHidden) {
                return (
                  <View
                    key={index}
                    style={[
                      styles.letterInput,
                      gameState.isCorrect === false && 
                      gameState.userInput[inputIndex] && 
                      gameState.userInput[inputIndex] &&
                      styles.incorrectInput,
                      gameState.isCorrect === true && 
                      styles.correctInput,
                      isCurrent && styles.currentInput,
                    ]}
                    >
                    <Text style={styles.letter}>
                      {gameState.userInput[inputIndex]}
                    </Text>
                  </View>
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
                roundComplete ? styles.completedText : styles.timeUpText
              ]}>
                {roundComplete ? 'Game Complete!' : 'Time\'s Up!'}
              </Text>
              {roundComplete && (
                <>
                  <Text style={styles.finalScoreText}>Final Score: {score}</Text>
                  {score > highScore && (
                    <Text style={styles.newHighScoreText}>New High Score! 🏆</Text>
                  )}
                </>
              )}
              <Pressable
                style={styles.playAgainButton}
                onPress={resetGame}>
                <Text style={styles.playAgainButtonText}>Play Again</Text>
              </Pressable>
            </View>
          )}
          </View>
        </ScrollView>

        {/* Virtual Keyboard */}
        {isGameActive && gameState.isCorrect === null && (
          <View style={styles.keyboard}>
            {KEYBOARD_LAYOUT.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keyboardRow}>
                {row.map((key) => (
                  <Pressable
                    key={key}
                    style={[
                      styles.key,
                      key === '⌫' && styles.backspaceKey,
                    ]}
                    onPress={() => handleKeyPress(key)}>
                    {key === '⌫' ? (
                      <Delete size={20} color="#4B0082" />
                    ) : (
                      <Text style={styles.keyText}>{key}</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameWrapper: {
    flex: 1,
    paddingTop: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  streak: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
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
  keyboard: {
    marginTop: 20,
    padding: 10,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  key: {
    minWidth: 30,
    height: 42,
    borderRadius: 8,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  backspaceKey: {
    minWidth: 50,
    backgroundColor: 'rgba(255, 75, 75, 0.1)',
  },
  keyText: {
    fontSize: 16,
    color: '#4B0082',
    fontFamily: 'Inter_700Bold',
  },
  currentInput: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    transform: [{ scale: 1.05 }],
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
  newHighScoreText: {
    fontSize: 18,
    color: '#FFD700',
    fontFamily: 'Inter_700Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  bonusInfo: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  bonusTitle: {
    fontSize: 16,
    color: '#4B0082',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  bonusText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
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