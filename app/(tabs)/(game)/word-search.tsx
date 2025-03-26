import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_700Bold, Inter_500Medium } from '@expo-google-fonts/inter';
import CountdownTimer from '@/components/CountdownTimer';
import { useGameSettings } from '@/contexts/GameSettingsContext';
import { getRandomWords } from '@/utils/wordBank';
import { 
  generateWordSearchGrid,
  checkSelectedWord,
  type Grid,
  type WordPlacement 
} from '@/utils/wordSearch';

const GAME_CONFIG = {
  easy: {
    wordsPerRound: 3,
    timeLimit: 180,
    rounds: 3
  },
  medium: {
    wordsPerRound: 4,
    timeLimit: 150,
    rounds: 3
  },
  hard: {
    wordsPerRound: 5,
    timeLimit: 120,
    rounds: 3
  }
};

export default function WordSearchGame() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });
  
  const { difficulty } = useGameSettings();
  const config = GAME_CONFIG[difficulty];

  const [gameState, setGameState] = useState<Grid>(() => {
    try {
      const initialWords = getRandomWords(difficulty, config.wordsPerRound)
        .map(w => w.word.toUpperCase());
      return generateWordSearchGrid(initialWords);
    } catch (error) {
      console.error('Failed to generate grid:', error);
      return {
        grid: Array(8).fill(null).map(() => Array(8).fill('X')),
        placedWords: []
      };
    }
  });

  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [pendingWord, setPendingWord] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [roundComplete, setRoundComplete] = useState(false);

  const [currentWords, setCurrentWords] = useState<string[]>(() => {
    const randomWords = getRandomWords(difficulty, config.wordsPerRound);
    return randomWords.map(w => w.word.toUpperCase());
  });

  useEffect(() => {
    if (foundWords.size === currentWords.length && isGameActive && currentWords.length > 0) {
      setRoundComplete(true);
      setIsGameActive(false);
    }
  }, [foundWords, currentWords, isGameActive]);

  const startNextRound = () => {
    let nextLevel = currentLevel;
    let nextRound = currentRound;

    if (currentRound === 2) {
      if (currentLevel < config.rounds - 1) {
        nextLevel = currentLevel + 1;
        nextRound = 0;
      } else {
        nextLevel = 0;
        nextRound = 0;
      }
    } else {
      nextRound = currentRound + 1;
    }

    const newWords = getRandomWords(difficulty, config.wordsPerRound)
      .map(w => w.word.toUpperCase());
    setCurrentWords(newWords);

    try {
      const newGameState = generateWordSearchGrid(newWords);
      setGameState(newGameState);
      setFoundWords(new Set());
      setSelectedCells([]);
      setRoundComplete(false);
      setIsGameActive(true);
      setCurrentLevel(nextLevel);
      setCurrentRound(nextRound);
    } catch (error) {
      console.error('Failed to generate grid for next round:', error);
    }
  };

  const handleTimeUp = () => {
    setIsGameActive(false);
    if (!roundComplete) {
      setScore(0);
    }
  };

  const handleCellPress = (row: number, col: number) => {
    if (!isGameActive) return;

    setSelectedCells(prev => {
      const cellIndex = prev.findIndex(cell => cell.row === row && cell.col === col);
      
      if (cellIndex === -1) {
        // Add cell to selection
        const newSelection = [...prev, { row, col }];
        
        // Check if selection forms a valid word
        const foundWord = checkSelectedWord(
          newSelection,
          gameState.grid,
          currentWords,
          foundWords
        );

        if (foundWord) {
          setFoundWords(prev => new Set([...prev, foundWord]));
          setPendingWord(foundWord);
          setScore(prev => prev + foundWord.length * 10);
          
          setTimeout(() => {
            setSelectedCells([]);
            setPendingWord(null);
          }, 500);
        }

        return newSelection;
      } else {
        // Remove cell from selection
        return prev.slice(0, cellIndex);
      }
    });
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellInFoundWord = (row: number, col: number) => {
    return gameState.placedWords.some(({ word, cells }) => {
      if (!foundWords.has(word) && word !== pendingWord) return false;
      return cells.some(cell => cell.row === row && cell.col === col);
    });
  };

  const getCellStyle = (row: number, col: number) => {
    const isFound = isCellInFoundWord(row, col);
    const isSelected = isCellSelected(row, col);

    return {
      cell: [
        styles.cell,
        isFound && styles.foundCell,
        isSelected && !isFound && styles.selectedCell,
      ],
      text: [
        styles.cellText,
        isFound && styles.foundCellText,
        isSelected && !isFound && styles.selectedCellText,
      ],
    };
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#8A2BE2', '#4B0082']}
      style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{score}</Text>
            <Text style={styles.levelInfo}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} - 
              Round {currentRound + 1}/{config.rounds}
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <CountdownTimer
              seconds={config.timeLimit}
              onTimeUp={handleTimeUp}
              isRunning={isGameActive}
            />
            <Text style={styles.foundCount}>
              Found: {foundWords.size}/{currentWords.length}
            </Text>
          </View>
        </View>

        <View style={styles.wordsContainer}>
          <Text style={styles.wordsTitle}>Words to Find:</Text>
          <View style={styles.wordsList}>
            {currentWords.map(word => (
              <Text
                key={word}
                style={[
                  styles.wordToFind,
                  foundWords.has(word) && styles.wordFound
                ]}>
                {word}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.gridContainer}>
          {gameState.grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((letter, colIndex) => {
                const cellStyles = getCellStyle(rowIndex, colIndex);
                return (
                  <Pressable
                    key={colIndex}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                    style={cellStyles.cell}>
                    <Text style={cellStyles.text}>
                      {letter}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {!isGameActive && (
          <View style={styles.gameOverContainer}>
            <Text style={[
              styles.gameOverText,
              roundComplete ? styles.completedText : styles.timeUpText
            ]}>
              {roundComplete ? 'Round Complete!' : 'Time\'s up!'}
            </Text>
            <Pressable
              style={styles.nextButton}
              onPress={startNextRound}>
              <Text style={styles.nextButtonText}>
                {roundComplete ? 'Next Round' : 'Try Again'}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'flex-start',
  },
  statsContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  score: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  foundCount: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  wordsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
  },
  wordsTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  wordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordToFind: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  wordFound: {
    backgroundColor: '#50C878',
    textDecorationLine: 'line-through',
  },
  gridContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  foundCell: {
    backgroundColor: '#50C878',
    elevation: 4,
    shadowColor: '#50C878',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 3,
  },
  selectedCell: {
    backgroundColor: '#8A2BE2',
    transform: [{ scale: 1.05 }],
    elevation: 8,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1,
  },
  cellText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#4B0082',
    textAlign: 'center',
  },
  foundCellText: {
    color: '#fff'
  },
  selectedCellText: {
    color: '#fff',
  },
  gameOverContainer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 12,
  },
  gameOverText: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  completedText: {
    color: '#50C878',
  },
  timeUpText: {
    color: '#FF4B4B',
  },
  levelInfo: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
    opacity: 0.9,
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
});