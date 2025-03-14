import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Timer, Trophy, Lock } from 'lucide-react-native';
import { useGameStore } from '@/store/gameStore';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';

type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  gridSize: number;
  wordCount: number;
  timeLimit: number;
  basePoints: number;
}

const DIFFICULTY_SETTINGS: Record<Difficulty, DifficultyConfig> = {
  easy: { gridSize: 8, wordCount: 5, timeLimit: 180, basePoints: 100 },
  medium: { gridSize: 12, wordCount: 8, timeLimit: 240, basePoints: 150 },
  hard: { gridSize: 15, wordCount: 12, timeLimit: 300, basePoints: 200 },
};

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

const WORD_LIST = [
  'REACT', 'NATIVE', 'EXPO', 'ROUTER', 'GAME',
  'MOBILE', 'CODE', 'WEB', 'APP', 'FUN',
  'PLAY', 'SCORE', 'WIN', 'TIME', 'WORD',
  'SEARCH', 'FIND', 'PUZZLE', 'GRID', 'LEVEL'
];

interface Cell {
  letter: string;
  selected: boolean;
  isPartOfWord: boolean;
  row: number;
  col: number;
}

interface Position {
  x: number;
  y: number;
}

export default function WordSearchGame() {
  const router = useRouter();
  const { addScore, unlockLevel, isLevelUnlocked } = useGameStore();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(1);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<Cell[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [roundFailed, setRoundFailed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<View>(null);
  const cellSize = 40;
  const gridPadding = 16;

  const generateGrid = (size: number, wordsToPlace: string[]) => {
    const newGrid: Cell[][] = Array(size).fill(null).map((_, row) =>
      Array(size).fill(null).map((_, col) => ({
        letter: '',
        selected: false,
        isPartOfWord: false,
        row,
        col,
      }))
    );

    wordsToPlace.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 8);
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        if (canPlaceWord(newGrid, word, row, col, direction, size)) {
          placeWord(newGrid, word, row, col, direction);
          placed = true;
        }
        attempts++;
      }
    });

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!newGrid[i][j].letter) {
          newGrid[i][j].letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    return newGrid;
  };

  const canPlaceWord = (grid: Cell[][], word: string, row: number, col: number, direction: number, size: number) => {
    const dirs = [
      [0, 1], [1, 0], [1, 1], [-1, 1],
      [0, -1], [-1, 0], [-1, -1], [1, -1]
    ];

    const [dRow, dCol] = dirs[direction];
    
    for (let i = 0; i < word.length; i++) {
      const newRow = row + (dRow * i);
      const newCol = col + (dCol * i);

      if (newRow < 0 || newRow >= size || newCol < 0 || newCol >= size) {
        return false;
      }

      if (grid[newRow][newCol].letter && grid[newRow][newCol].letter !== word[i]) {
        return false;
      }
    }

    return true;
  };

  const placeWord = (grid: Cell[][], word: string, row: number, col: number, direction: number) => {
    const dirs = [
      [0, 1], [1, 0], [1, 1], [-1, 1],
      [0, -1], [-1, 0], [-1, -1], [1, -1]
    ];

    const [dRow, dCol] = dirs[direction];
    
    for (let i = 0; i < word.length; i++) {
      const newRow = row + (dRow * i);
      const newCol = col + (dCol * i);
      grid[newRow][newCol].letter = word[i];
    }
  };

  const startGame = (selectedDifficulty: Difficulty) => {
    const config = DIFFICULTY_SETTINGS[selectedDifficulty];
    const gameWords = [...WORD_LIST]
      .sort(() => Math.random() - 0.5)
      .slice(0, config.wordCount)
      .map(word => word.toUpperCase());

    setDifficulty(selectedDifficulty);
    setGrid(generateGrid(config.gridSize, gameWords));
    setWords(gameWords);
    setFoundWords([]);
    setTimeLeft(config.timeLimit);
    setScore(0);
    setGameStarted(true);
    setGameOver(false);
    setRoundFailed(false);
  };

  const handleRoundEnd = (completed: boolean) => {
    if (completed) {
      if (difficulty) {
        setCumulativeScore(prev => prev + score);
        if (round === 3) {
          const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
          if (currentIndex < DIFFICULTY_ORDER.length - 1) {
            unlockLevel(DIFFICULTY_ORDER[currentIndex + 1]);
          }
        }
      }
    } else {
      setCumulativeScore(0);
      setScore(0);
      setRoundFailed(true);
    }
    setGameOver(true);
  };

  const startNextRound = () => {
    if (!difficulty) return;

    if (roundFailed) {
      setRound(1);
      startGame(difficulty);
    } else if (round < 3) {
      setRound(prev => prev + 1);
      startGame(difficulty);
    } else {
      const currentIndex = DIFFICULTY_ORDER.indexOf(difficulty);
      if (currentIndex < DIFFICULTY_ORDER.length - 1) {
        const nextDifficulty = DIFFICULTY_ORDER[currentIndex + 1];
        if (isLevelUnlocked(nextDifficulty)) {
          setRound(1);
          startGame(nextDifficulty);
        }
      } else {
        addScore({
          gameId: 'word-search',
          score: cumulativeScore + score,
          difficulty,
          timeSpent: DIFFICULTY_SETTINGS[difficulty].timeLimit - timeLeft,
          completedAt: new Date(),
        });
        setGameStarted(false);
      }
    }
  };

  const clearSelection = () => {
    setGrid(prev => {
      const newGrid = [...prev];
      for (let i = 0; i < newGrid.length; i++) {
        for (let j = 0; j < newGrid[i].length; j++) {
          newGrid[i][j] = {
            ...newGrid[i][j],
            selected: false,
          };
        }
      }
      return newGrid;
    });
    setSelection([]);
  };

  const findCellFromPosition = (position: Position): Promise<Cell | null> => {
    return new Promise((resolve) => {
      if (!gridRef.current) {
        resolve(null);
        return;
      }

      gridRef.current.measure((x, y, width, height, pageX, pageY) => {
        const relativeX = position.x - (pageX + gridPadding);
        const relativeY = position.y - (pageY + gridPadding);

        const row = Math.floor(relativeY / cellSize);
        const col = Math.floor(relativeX / cellSize);

        if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
          resolve(grid[row][col]);
        } else {
          resolve(null);
        }
      });
    });
  };

  const handleCellSelection = (cell: Cell) => {
    if (gameOver) return;

    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[cell.row][cell.col] = {
        ...cell,
        selected: true,
      };
      return newGrid;
    });

    setSelection(prev => {
      if (prev.length === 0) {
        return [cell];
      }

      const lastCell = prev[prev.length - 1];
      const rowDiff = Math.abs(cell.row - lastCell.row);
      const colDiff = Math.abs(cell.col - lastCell.col);

      if (rowDiff <= 1 && colDiff <= 1) {
        const newSelection = [...prev, cell];
        const selectedWord = getSelectedWord(newSelection);
        
        if (words.includes(selectedWord)) {
          const config = DIFFICULTY_SETTINGS[difficulty!];
          const wordScore = calculateWordScore(selectedWord.length, config.basePoints, timeLeft);
          setScore(s => s + wordScore);
          setFoundWords(fw => [...fw, selectedWord]);
          highlightFoundWord(newSelection);
          clearSelection();
          return [];
        }
        
        return newSelection;
      }

      return prev;
    });
  };

  const getSelectedWord = (cells: Cell[]) => {
    return cells.map(cell => cell.letter).join('');
  };

  const calculateWordScore = (wordLength: number, basePoints: number, timeRemaining: number) => {
    const lengthBonus = wordLength * 10;
    const timeBonus = Math.floor(timeRemaining / 10);
    return basePoints + lengthBonus + timeBonus;
  };

  const highlightFoundWord = (cells: Cell[]) => {
    setGrid(prev => {
      const newGrid = [...prev];
      cells.forEach(cell => {
        newGrid[cell.row][cell.col].isPartOfWord = true;
      });
      return newGrid;
    });
  };

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      findCellFromPosition({
        x: event.absoluteX,
        y: event.absoluteY
      }).then(cell => {
        if (cell) {
          setIsDragging(true);
          clearSelection();
          handleCellSelection(cell);
        }
      });
    })
    .onUpdate((event) => {
      if (!isDragging) return;

      findCellFromPosition({
        x: event.absoluteX,
        y: event.absoluteY
      }).then(cell => {
        if (cell && selection.length > 0) {
          const lastSelected = selection[selection.length - 1];
          if (cell.row === lastSelected.row && cell.col === lastSelected.col) {
            return;
          }
          handleCellSelection(cell);
        }
      });
    })
    .onFinalize(() => {
      if (isDragging) {
        const selectedWord = getSelectedWord(selection);
        if (!words.includes(selectedWord)) {
          clearSelection();
        }
        setIsDragging(false);
      }
    });

  const tapGesture = Gesture.Tap()
    .onBegin((event) => {
      findCellFromPosition({
        x: event.absoluteX,
        y: event.absoluteY
      }).then(cell => {
        if (cell) {
          clearSelection();
          handleCellSelection(cell);
        }
      });
    });

  const composed = Gesture.Race(panGesture, tapGesture);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRoundEnd(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (foundWords.length === words.length && gameStarted) {
      handleRoundEnd(true);
    }
  }, [foundWords, words]);

  if (!gameStarted) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1e293b" />
          </Pressable>
          <Text style={styles.title}>Word Search</Text>
        </View>

        <Text style={styles.subtitle}>Select Difficulty</Text>

        {DIFFICULTY_ORDER.map((level) => {
          const unlocked = isLevelUnlocked(level);
          return (
            <Pressable
              key={level}
              style={[
                styles.difficultyButton,
                !unlocked && styles.difficultyButtonLocked
              ]}
              onPress={() => {
                if (unlocked) {
                  setRound(1);
                  setCumulativeScore(0);
                  startGame(level);
                }
              }}
            >
              <View style={styles.difficultyContent}>
                <View>
                  <Text style={styles.difficultyTitle}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                  <Text style={styles.difficultyDetails}>
                    {DIFFICULTY_SETTINGS[level].gridSize}x{DIFFICULTY_SETTINGS[level].gridSize} grid • {DIFFICULTY_SETTINGS[level].wordCount} words
                  </Text>
                </View>
                {!unlocked && <Lock size={24} color="#94a3b8" />}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} scrollEnabled={!isDragging}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.title}>Word Search</Text>
      </View>

      <View style={styles.gameInfo}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Round {round}/3</Text>
          <Text style={styles.scoreValue}>{score + cumulativeScore}</Text>
        </View>

        {gameOver && (
          <View style={styles.gameOverContent}>
            <Text style={styles.gameOverTitle}>
              {roundFailed ? 'Round Failed!' :
               foundWords.length === words.length ? 'Round Complete!' : 
               'Time\'s Up!'}
            </Text>
            <View style={styles.scoreRow}>
              <Text style={styles.gameOverScore}>Round: {score}</Text>
              <Text style={styles.gameOverTotal}>Total: {score + cumulativeScore}</Text>
            </View>
            <Pressable
              style={styles.playAgainButton}
              onPress={startNextRound}
            >
              <Text style={styles.playAgainText}>
                {roundFailed ? 'Retry Level' :
                 round === 3 && difficulty !== 'hard' ? 'Next Level' : 
                 round === 3 && difficulty === 'hard' ? 'Complete Game' : 
                 'Next Round'}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.timerContainer}>
          <Timer size={20} color="#1e293b" />
          <Text style={styles.timerText}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
        </View>
      </View>

      <View style={styles.difficultyInfo}>
        <Trophy size={20} color="#6366f1" />
        <Text style={styles.difficultyText}>
          {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1)} Level
        </Text>
      </View>

      <View style={styles.wordList}>
        <Text style={styles.wordListTitle}>Words to Find</Text>
        <View style={styles.wordGrid}>
          {words.map((word) => (
            <View
              key={word}
              style={[
                styles.wordItem,
                foundWords.includes(word) && styles.foundWordItem,
              ]}
            >
              <Text style={[
                styles.wordText,
                foundWords.includes(word) && styles.foundWordText,
              ]}>
                {word}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <GestureHandlerRootView>
        <GestureDetector gesture={composed}>
          <View ref={gridRef} style={styles.gridContainer}>
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, colIndex) => (
                  <View
                    key={`${rowIndex}-${colIndex}`}
                    style={[
                      styles.cell,
                      cell.selected && styles.selectedCell,
                      cell.isPartOfWord && styles.foundCell,
                    ]}>
                    <Text style={[
                      styles.cellText,
                      cell.selected && styles.selectedCellText,
                      cell.isPartOfWord && styles.foundCellText,
                    ]}>
                      {cell.letter}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    padding: 16,
  },
  difficultyButton: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  difficultyButtonLocked: {
    opacity: 0.7,
    backgroundColor: '#f1f5f9',
  },
  difficultyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 4,
  },
  difficultyDetails: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  scoreContainer: {
    backgroundColor: '#6366f1',
    padding: 8,
    borderRadius: 8,
    minWidth: 100,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#ffffff',
    opacity: 0.9,
  },
  scoreValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#ffffff',
  },
  gameOverContent: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  gameOverTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  gameOverScore: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  gameOverTotal: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#6366f1',
  },
  playAgainButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  playAgainText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#ffffff',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 8,
    minWidth: 100,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
  },
  difficultyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  difficultyText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
  },
  wordList: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  wordListTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
    marginBottom: 12,
  },
  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordItem: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  foundWordItem: {
    backgroundColor: '#34d399',
  },
  wordText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  foundWordText: {
    color: '#ffffff',
  },
  gridContainer: {
    padding: 16,
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
    backgroundColor: '#ffffff',
    margin: 2,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCell: {
    backgroundColor: '#818cf8',
    transform: [{ scale: 1.05 }],
    zIndex: 2,
  },
  foundCell: {
    backgroundColor: '#34d399',
    zIndex: 1,
  },
  cellText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1e293b',
  },
  selectedCellText: {
    color: '#ffffff',
  },
  foundCellText: {
    color: '#ffffff',
  },
});