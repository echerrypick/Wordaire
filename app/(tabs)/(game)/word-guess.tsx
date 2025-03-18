import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
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

// Game configuration
const WORD_LENGTH = 4;
const MAX_ATTEMPTS = 6;
const TIME_LIMIT = 180; // 3 minutes

// Word lists by difficulty
const WORDS = {
  easy: [
    { word: 'CODE', hint: 'What developers write' },
    { word: 'GAME', hint: 'Interactive entertainment' },
    { word: 'PLAY', hint: 'Have fun with something' },
    { word: 'WORD', hint: 'A unit of language' },
    { word: 'QUIZ', hint: 'Test your knowledge' }
  ],
  medium: [
    { word: 'REDUX', hint: 'State management for React' },
    { word: 'ASYNC', hint: 'Not happening at the same time' },
    { word: 'CACHE', hint: 'Temporary storage for quick access' },
    { word: 'PROXY', hint: 'An intermediary server' },
    { word: 'QUEUE', hint: 'First in, first out' }
  ],
  hard: [
    { word: 'OAUTH', hint: 'Secure authorization protocol' },
    { word: 'GRAPH', hint: 'A non-linear data structure' },
    { word: 'MUTEX', hint: 'Prevents concurrent access' },
    { word: 'LINUX', hint: 'An open source operating system' },
    { word: 'NGINX', hint: 'A popular web server' }
  ]
};

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

type GameState = {
  attempts: string[];
  currentAttempt: string;
  targetWord: string;
  hint: string;
  gameStatus: 'playing' | 'won' | 'lost';
  usedLetters: {
    [key: string]: 'correct' | 'present' | 'absent' | undefined;
  };
};

export default function WordGuessGame() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isGameActive, setIsGameActive] = useState(true);
  const [shake, setShake] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentRow, setCurrentRow] = useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const [gameState, setGameState] = useState<GameState>(() => ({
    attempts: [],
    currentAttempt: '',
    targetWord: WORDS[difficulty][level].word,
    hint: WORDS[difficulty][level].hint,
    gameStatus: 'playing',
    usedLetters: {},
  }));

  const handleKeyPress = (key: string) => {
    if (!isGameActive || gameState.gameStatus !== 'playing') return;

    const isCurrentRowComplete = gameState.attempts.length === currentRow;

    setGameState(prev => {
      if (key === '⌫') {
        return {
          ...prev,
          currentAttempt: prev.currentAttempt.slice(0, -1)
        };
      }

      if (key === 'ENTER') {
        if (prev.currentAttempt.length !== WORD_LENGTH) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          return prev;
        }

        setCurrentRow(prev => prev + 1);
        const newAttempts = [...prev.attempts, prev.currentAttempt];
        const isCorrect = prev.currentAttempt === prev.targetWord;

        // Handle correct guess
        if (isCorrect) {
          const attemptsBonus = (MAX_ATTEMPTS - newAttempts.length) * 50;
          const timeBonus = Math.floor(TIME_LIMIT * 10);
          setScore(prev => prev + 1000 + attemptsBonus + timeBonus);
        }

        return {
          ...prev,
          attempts: newAttempts,
          currentAttempt: '',
          gameStatus: isCorrect ? 'won' : 
            newAttempts.length >= MAX_ATTEMPTS ? 'lost' : 'playing',
        };
      }

      if (prev.currentAttempt.length < WORD_LENGTH && isCurrentRowComplete) {
        return {
          ...prev,
          currentAttempt: prev.currentAttempt + key
        };
      }

      return prev;
    });
  };

  // Update getLetterStyle to handle completed rows differently
  const getLetterStyle = (letter: string, index: number, attempt: string) => {
    if (!attempt) return styles.emptyCell;

    if (letter === gameState.targetWord[index]) {
      return styles.correctLetter;
    }
    if (gameState.targetWord.includes(letter)) {
      return styles.presentLetter;
    }
    return styles.absentLetter;
  };

  // Update keyboard key styles based on letter status
  const getKeyboardKeyStyle = (key: string) => {
    const status = gameState.usedLetters[key];
    switch (status) {
      case 'correct':
        return styles.correctKey;
      case 'present':
        return styles.presentKey;
      case 'absent': 
        return styles.absentKey;
      default:
        return styles.key;
    }
  };

  const handleTimeUp = () => {
    setIsGameActive(false);
    setGameState(prev => ({
      ...prev,
      gameStatus: 'lost'
    }));
    setScore(0); // Reset score when time is up
  };

  const startNextLevel = () => {
    const nextLevel = level + 1;
    if (nextLevel >= WORDS[difficulty].length) {
      setLevel(0);
    } else {
      setLevel(nextLevel);
    }

    // Reset game state for next level
    setCurrentRow(0);
    setGameState({
      attempts: [],
      currentAttempt: '',
      targetWord: WORDS[difficulty][nextLevel < WORDS[difficulty].length ? nextLevel : 0].word,
      hint: WORDS[difficulty][nextLevel < WORDS[difficulty].length ? nextLevel : 0].hint,
      gameStatus: 'playing',
      usedLetters: {},
    });
    setIsGameActive(true);
    setShowHint(false);
  };

  const resetGame = () => {
    setGameState({
      attempts: [],
      currentAttempt: '',
      targetWord: WORDS[difficulty][level].word,
      hint: WORDS[difficulty][level].hint,
      gameStatus: 'playing',
      usedLetters: {},
    });
    setCurrentRow(0);
    setIsGameActive(true);
    setShowHint(false);
    setScore(0);
  };

  const Tutorial = () => (
    <View style={styles.tutorialOverlay}>
      <View style={styles.tutorialCard}>
        <Text style={styles.tutorialTitle}>How to Play Word Guess</Text>
        <View style={styles.tutorialContent}>
          <Text style={styles.tutorialText}>1. Guess the 5-letter word in 6 tries</Text>
          <View style={styles.colorExample}>
            <View style={[styles.exampleBox, { backgroundColor: '#50C878' }]} />
            <Text style={styles.tutorialText}>Green: Letter is correct and in right spot</Text>
          </View>
          <View style={styles.colorExample}>
            <View style={[styles.exampleBox, { backgroundColor: '#FFD700' }]} />
            <Text style={styles.tutorialText}>Yellow: Letter is in the word but wrong spot</Text>
          </View>
          <View style={styles.colorExample}>
            <View style={[styles.exampleBox, { backgroundColor: '#808080' }]} />
            <Text style={styles.tutorialText}>Gray: Letter is not in the word</Text>
          </View>
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
      <View style={styles.gameContainer}>
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.levelInfo}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - 
              Level {level + 1}/{WORDS[difficulty].length}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <CountdownTimer
              seconds={TIME_LIMIT}
              onTimeUp={handleTimeUp}
              isRunning={isGameActive && gameState.gameStatus === 'playing'}
            />
            <Pressable
              style={styles.infoButton}
              onPress={() => setShowTutorial(true)}>
              <Info size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Type a 4-letter word and press ENTER to guess
          </Text>
        </View>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.gameContent}
          contentContainerStyle={styles.gameContentContainer}
          showsVerticalScrollIndicator={false}>
          <Animated.View 
            style={[
              styles.grid,
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
            {Array(MAX_ATTEMPTS).fill(0).map((_, rowIndex) => (
              <View 
                key={rowIndex} 
                style={[
                  styles.row,
                  rowIndex === currentRow && styles.activeRow,
                  gameState.gameStatus === 'won' && rowIndex > currentRow - 1 && styles.inactiveRow
                ]}>
                {Array(WORD_LENGTH).fill(0).map((_, colIndex) => {
                  const attempt = gameState.attempts[rowIndex] || 
                    (rowIndex === gameState.attempts.length ? gameState.currentAttempt : '');
                  const letter = attempt[colIndex] || '';
                  
                  return (
                    <View
                      key={colIndex}
                      style={[
                        styles.cell,
                        letter ? getLetterStyle(letter, colIndex, attempt) : null,
                      ]}>
                      <Text style={styles.cellText}>{letter}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </Animated.View>

          {!showHint && gameState.gameStatus === 'playing' && (
            <Pressable
              style={styles.hintButton}
              onPress={() => setShowHint(true)}>
              <Text style={styles.hintButtonText}>Show Hint</Text>
            </Pressable>
          )}

          {showHint && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>{gameState.hint}</Text>
            </View>
          )}

          {(gameState.gameStatus !== 'playing' || !isGameActive) && (
            <View style={styles.resultContainer}>
              <View style={styles.resultContent}>
                <Text style={[
                  styles.resultText,
                  gameState.gameStatus === 'won' ? styles.wonText : styles.lostText
                ]}>
                  {gameState.gameStatus === 'won' ? 'Congratulations!' : 
                    !isGameActive ? 'Time\'s Up!' : 'Better luck next time!'}
                </Text>
                <Text style={styles.targetWordText}>
                  The word was: {gameState.targetWord}
                </Text>
                <Pressable
                  style={styles.nextButton}
                  onPress={gameState.gameStatus === 'won' ? startNextLevel : resetGame}>
                  <Text style={styles.nextButtonText}>
                    {gameState.gameStatus === 'won' ? 
                      (level === WORDS[difficulty].length - 1 ? 'Play Again' : 'Next Level') : 
                      'Try Again'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.keyboard}>
          {KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keyboardRow}>
              {row.map((key) => (
                <Pressable
                  key={key}
                  style={[
                    styles.key,
                    key === 'ENTER' && styles.enterKey,
                  ]}
                  onPress={() => handleKeyPress(key)}>
                  <Text style={[
                    styles.keyText,
                    key === 'ENTER' && styles.enterKeyText,
                  ]}>
                    {key}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#8A2BE2',
  },
  gameContainer: {
    flex: 1,
    paddingTop: 40,
  },
  gameContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gameContentContainer: {
    paddingBottom: 10,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'flex-start',
  },
  score: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  levelInfo: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
    opacity: 0.9,
  },
  grid: {
    alignItems: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    padding: 4,
    position: 'relative',
  },
  activeRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    transform: [{ scale: 1.02 }],
  },
  inactiveRow: {
    opacity: 0.3,
  },
  cell: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyCell: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  correctLetter: {
    backgroundColor: '#50C878',
    borderColor: '#50C878',
  },
  presentLetter: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  absentLetter: {
    backgroundColor: '#808080',
    borderColor: '#808080',
  },
  cellText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#4B0082',
  },
  keyboard: {
    marginTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  key: {
    minWidth: 32,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  enterKey: {
    minWidth: 70,
    backgroundColor: '#9932CC',
  },
  keyText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#4B0082',
  },
  enterKeyText: {
    color: '#fff',
  },
  hintButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: 'center',
    marginBottom: 12,
  },
  hintButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  hintContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  hintText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(75, 0, 130, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    gap: 12,
    padding: 20,
    backdropFilter: 'blur(8px)',
  },
  resultContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    backdropFilter: 'blur(12px)',
  },
  resultText: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  wonText: {
    color: '#50C878',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  lostText: {
    color: '#FF4B4B',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  targetWordText: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  nextButton: {
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
  nextButtonText: {
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
  colorExample: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exampleBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  instructionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    opacity: 0.9,
  },
});