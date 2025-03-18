import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { useFonts, Inter_700Bold, Inter_500Medium } from '@expo-google-fonts/inter';
import CountdownTimer from '@/components/CountdownTimer';
import { useGameSettings } from '@/contexts/GameSettingsContext';
import { getRandomWords } from '@/utils/wordBank';

// Game configuration based on difficulty
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

// Grid size (8x8)
const GRID_SIZE = 8;

type Direction = 'horizontal' | 'vertical' | 'diagonal' | 'diagonal-reverse';
type WordPlacement = {
  word: string;
  startRow: number;
  startCol: number;
  direction: Direction;
};

const generateGrid = (words: string[]) => {
  let grid: string[][] = [];
  let placedWords: WordPlacement[] = [];
  let allWordsPlaced = false;
  let gridAttempts = 0;
  const maxGridAttempts = 50; // Maximum attempts to generate a valid grid

  // Keep trying to generate a valid grid until all words are placed
  while (!allWordsPlaced && gridAttempts < maxGridAttempts) {
    // Reset grid and placed words for new attempt
    grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    placedWords = [];
    allWordsPlaced = true; // Will be set to false if any word fails to place

    // Sort words by length (longest first) to make placement easier
    const sortedWords = [...words].sort((a, b) => b.length - a.length);

    // Try to place each word
    for (const word of sortedWords) {
      let wordPlaced = false;
      let wordAttempts = 0;
      const maxWordAttempts = 100; // Maximum attempts to place a single word

      // Try different positions and directions for the current word
      while (!wordPlaced && wordAttempts < maxWordAttempts) {
        const direction = ['horizontal', 'vertical', 'diagonal', 'diagonal-reverse'][
          Math.floor(Math.random() * 4)
        ] as Direction;

        // Calculate valid range for starting position based on word length and direction
        let maxRow = GRID_SIZE;
        let maxCol = GRID_SIZE;

        switch (direction) {
          case 'horizontal':
            maxCol = GRID_SIZE - word.length + 1;
            break;
          case 'vertical':
            maxRow = GRID_SIZE - word.length + 1;
            break;
          case 'diagonal':
            maxRow = GRID_SIZE - word.length + 1;
            maxCol = GRID_SIZE - word.length + 1;
            break;
          case 'diagonal-reverse':
            maxRow = GRID_SIZE - word.length + 1;
            maxCol = word.length - 1;
            break;
        }

        if (maxRow <= 0 || maxCol <= 0) {
          wordAttempts++;
          continue;
        }

        const row = Math.floor(Math.random() * maxRow);
        const col = direction === 'diagonal-reverse' 
          ? Math.floor(Math.random() * (GRID_SIZE - 1)) + word.length - 1
          : Math.floor(Math.random() * maxCol);

        // Check if word can be placed at this position
        let canPlace = true;
        let positions: [number, number][] = [];

        for (let i = 0; i < word.length; i++) {
          let currentRow = row;
          let currentCol = col;

          switch (direction) {
            case 'horizontal':
              currentCol += i;
              break;
            case 'vertical':
              currentRow += i;
              break;
            case 'diagonal':
              currentRow += i;
              currentCol += i;
              break;
            case 'diagonal-reverse':
              currentRow += i;
              currentCol -= i;
              break;
          }

          // Validate position
          if (
            currentRow < 0 || currentRow >= GRID_SIZE ||
            currentCol < 0 || currentCol >= GRID_SIZE
          ) {
            canPlace = false;
            break;
          }

          // Check if cell is empty or has matching letter
          if (grid[currentRow][currentCol] !== '' && 
              grid[currentRow][currentCol] !== word[i]) {
            canPlace = false;
            break;
          }

          positions.push([currentRow, currentCol]);
        }

        if (canPlace) {
          // Place the word
          positions.forEach(([r, c], i) => {
            grid[r][c] = word[i];
          });
          placedWords.push({ word, startRow: row, startCol: col, direction });
          wordPlaced = true;
        }

        wordAttempts++;
      }

      if (!wordPlaced) {
        allWordsPlaced = false;
        break;
      }
    }

    gridAttempts++;
  }

  if (!allWordsPlaced) {
    throw new Error('Could not generate valid grid with all words');
  }

  // Fill empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, placedWords };
};

export default function WordSearchGame() {
  const [fontsLoaded] = useFonts({
    Inter_700Bold,
    Inter_500Medium,
  });
  
  const { difficulty } = useGameSettings();
  const config = GAME_CONFIG[difficulty];

  const [gameState, setGameState] = useState(() => {
    try {
      // Get initial words for the game
      const initialWords = getRandomWords(difficulty, config.wordsPerRound)
        .map(w => w.word.toUpperCase());
      return generateGrid(initialWords);
    } catch (error) {
      console.error('Failed to generate grid:', error);
      return {
        grid: Array(GRID_SIZE).fill(null).map(() => 
          Array(GRID_SIZE).fill('X')
        ),
        placedWords: []
      };
    }
  });
  const [selectedCells, setSelectedCells] = useState<{id: string, letter: string}[]>([]);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [pendingWord, setPendingWord] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [roundComplete, setRoundComplete] = useState(false);

  // Get random words for the current round
  const [currentWords, setCurrentWords] = useState<string[]>(() => {
    const randomWords = getRandomWords(difficulty, config.wordsPerRound);
    return randomWords.map(w => w.word.toUpperCase());
  });

  useEffect(() => {
    // Check if all words are found
    if (foundWords.size === currentWords.length && isGameActive && currentWords.length > 0) {
      setRoundComplete(true);
      setIsGameActive(false);
    }
  }, [foundWords, currentWords, isGameActive]);

  const startNextRound = () => {
    let nextLevel = currentLevel;
    let nextRound = currentRound;
    let newWords: string[] = [];

    if (currentRound === 2) {
      // Move to next difficulty level
      if (currentLevel < config.rounds - 1) {
        nextLevel = currentLevel + 1;
        nextRound = 0;
      } else {
        // Game completed all levels
        return;
      }
    } else {
      // Move to next round
      nextRound = currentRound + 1;
    }

    // Generate new grid with words for the next round
    // Get new random words for the next round
    newWords = getRandomWords(difficulty, config.wordsPerRound).map(w => w.word.toUpperCase());
    setCurrentWords(newWords);

    // Generate new grid with the new words
    const newGameState = generateGrid(newWords);

    // Reset for new round
    setFoundWords(new Set());
    setSelectedCells([]);
    setRoundComplete(false);
    setIsGameActive(true);
    setGameState(newGameState);
    setCurrentLevel(nextLevel);
    setCurrentRound(nextRound);
  };

  const checkForWords = (selection: {id: string, letter: string}[]) => {
    if (!isGameActive) return false;
    
    // Get all letters from selection
    const letters = selection.map(cell => cell.letter);
    
    // Check each word that hasn't been found yet
    for (const word of currentWords) {
      if (!foundWords.has(word)) {
        // Check if all letters of the word are in the selection
        const wordLetters = word.split('');
        const hasAllLetters = wordLetters.every(letter => 
          letters.filter(l => l === letter).length >= 
          wordLetters.filter(l => l === letter).length
        );

        if (hasAllLetters) {
          // Found a word
          setFoundWords(prev => new Set([...prev, word]));
          setPendingWord(word);
          setScore(prev => prev + word.length * 10);
          
          // Clear selection after a brief delay
          setTimeout(() => {
            setSelectedCells([]);
            setPendingWord(null);
          }, 500);
          
          return true;
        }
      }
    }
    
    return false;
  };

  const handleTimeUp = () => {
    setIsGameActive(false);
    if (!roundComplete) {
      setScore(0); // Only reset score if round wasn't completed
    }
  };

  const handleCellPress = (row: number, col: number) => {
    if (!isGameActive) return;
    
    const cellId = `${row}-${col}`;
    const letter = gameState.grid[row][col];
    
    setSelectedCells(prev => {
      // Toggle selection
      const existingIndex = prev.findIndex(cell => cell.id === cellId);
      
      if (existingIndex !== -1) {
        // Remove cell if already selected
        const newSelection = prev.filter(cell => cell.id !== cellId);
        return newSelection;
      } else {
        const newSelection = [...prev, { id: cellId, letter }];
        checkForWords(newSelection);
        return newSelection;
      }
    });
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.id === `${row}-${col}`);
  };

  const isCellInFoundWord = (row: number, col: number) => {
    return gameState.placedWords.some(({ word, startRow, startCol, direction }) => {
      if (!foundWords.has(word) && word !== pendingWord) return false;
      
      for (let i = 0; i < word.length; i++) {
        let currentRow = startRow;
        let currentCol = startCol;
        
        switch (direction) {
          case 'horizontal':
            currentCol += i;
            break;
          case 'vertical':
            currentRow += i;
            break;
          case 'diagonal':
            currentRow += i;
            currentCol += i;
            break;
          case 'diagonal-reverse':
            currentRow += i;
            currentCol -= i;
            break;
        }
        
        if (currentRow === row && currentCol === col) {
          // Check if this cell is part of the found word
          const cellLetter = gameState.grid[row][col];
          if (cellLetter === word[i]) {
            return true;
          }
        }
      }
      return false;
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

  const renderCell = (letter: string, row: number, col: number) => {
    const cellStyles = getCellStyle(row, col);
    
    return (
      <Pressable
        key={col}
        onPress={() => handleCellPress(row, col)}
        style={cellStyles.cell}>
        <Text style={cellStyles.text}>
          {letter}
        </Text>
      </Pressable>
    );
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
            <View style={styles.statusContainer}>
              {!isGameActive && (
                <>
                  <Text style={styles.timeUpMessage}>
                    {roundComplete ? 'Round Complete!' : 'Time\'s up!'}
                  </Text>
                  <Pressable
                    style={styles.nextButton}
                    onPress={startNextRound}>
                    <Text style={styles.nextButtonText}>
                      {roundComplete ? 'Start Next Round' : 'Play Again'}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
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
              {row.map((letter, colIndex) => 
                renderCell(letter, rowIndex, colIndex)
              )}
            </View>
          ))}
        </View>
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
  statusContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
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
  foundSelectedCellText: {
    color: '#8A2BE2',
  },
  timeUpMessage: {
    fontSize: 18,
    color: '#FF4B4B',
    fontFamily: 'Inter_700Bold',
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