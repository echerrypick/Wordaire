import { Word } from './wordBank';

export type Direction = 'horizontal' | 'horizontal-reverse' | 'vertical' | 'vertical-reverse' | 'diagonal' | 'diagonal-reverse';

export type WordPlacement = {
  word: string;
  startRow: number;
  startCol: number;
  direction: Direction;
  cells: { row: number; col: number }[];
};

export type GridCell = {
  row: number;
  col: number;
  letter: string;
};

export type Grid = {
  grid: string[][];
  placedWords: WordPlacement[];
  validationErrors?: string[];
};

const GRID_SIZE = 8;

export const DIRECTIONS: Direction[] = [
  'horizontal',
  'vertical',
  'diagonal',
  'horizontal-reverse',
  'vertical-reverse',
  'diagonal-reverse'
];

// Get starting position for word placement based on direction
export const getStartPosition = (direction: Direction, wordLength: number): { startRow: number; startCol: number } => {
  switch (direction) {
    case 'horizontal':
      return {
        startRow: Math.floor(Math.random() * GRID_SIZE),
        startCol: Math.floor(Math.random() * (GRID_SIZE - wordLength + 1))
      };
    case 'horizontal-reverse':
      return {
        startRow: Math.floor(Math.random() * GRID_SIZE),
        startCol: Math.floor(Math.random() * (GRID_SIZE - wordLength + 1)) + wordLength - 1
      };
    case 'vertical':
      return {
        startRow: Math.floor(Math.random() * (GRID_SIZE - wordLength + 1)),
        startCol: Math.floor(Math.random() * GRID_SIZE)
      };
    case 'vertical-reverse':
      return {
        startRow: Math.floor(Math.random() * (GRID_SIZE - wordLength + 1)) + wordLength - 1,
        startCol: Math.floor(Math.random() * GRID_SIZE)
      };
    case 'diagonal':
      return {
        startRow: Math.floor(Math.random() * (GRID_SIZE - wordLength + 1)),
        startCol: Math.floor(Math.random() * (GRID_SIZE - wordLength + 1))
      };
    case 'diagonal-reverse':
      return {
        startRow: Math.floor(Math.random() * (GRID_SIZE - wordLength + 1)),
        startCol: Math.floor(Math.random() * (GRID_SIZE - wordLength + 1)) + wordLength - 1
      };
  }
};

// Calculate cells for word placement
export const calculateWordCells = (
  word: string,
  startRow: number,
  startCol: number,
  direction: Direction
): GridCell[] => {
  const cells: GridCell[] = [];
  // Always split word into array of letters first
  const letters = word.split('');
  
  // Reverse letters array if direction includes 'reverse'
  if (direction.includes('reverse')) {
    letters.reverse();
  }

  for (let i = 0; i < word.length; i++) {
    let row = startRow;
    let col = startCol;

    switch (direction) {
      case 'horizontal':
        col += i;
        break;
      case 'horizontal-reverse':
        col -= i;
        break;
      case 'vertical':
        row += i;
        break;
      case 'vertical-reverse':
        row -= i;
        break;
      case 'diagonal':
        row += i;
        col += i;
        break;
      case 'diagonal-reverse':
        row += i;
        col -= i;
        break;
    }

    cells.push({ row, col, letter: letters[i] });
  }

  return cells;
};

// Improved validation to ensure cells are within bounds and don't conflict
// Validate if cells are within grid bounds and don't conflict
export const isValidPlacement = (cells: GridCell[], grid: string[][]): boolean => {
  return cells.every(({ row, col, letter }) => {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return false;
    }
    return grid[row][col] === '' || grid[row][col] === letter;
  });
};

// Helper function to get all possible directions for a word
const getValidDirections = (word: string): Direction[] => {
  // Filter directions based on word length and grid size
  return DIRECTIONS.filter(direction => {
    const maxLength = direction.includes('diagonal') ? 
      Math.min(GRID_SIZE, GRID_SIZE) : 
      direction.includes('horizontal') ? 
        GRID_SIZE : 
        GRID_SIZE;
    return word.length <= maxLength;
  });
};

// Place word on grid
export const placeWord = (
  word: string,
  grid: string[][],
  direction: Direction
): WordPlacement | null => {
  const { startRow, startCol } = getStartPosition(direction, word.length);
  // Calculate cells for word placement
  let cells = calculateWordCells(word, startRow, startCol, direction);

  if (!isValidPlacement(cells, grid)) {
    return null;
  }

  // Place the word
  cells.forEach(({ row, col, letter }) => {
    grid[row][col] = letter;
  });

  return {
    word,
    startRow,
    startCol,
    direction,
    cells: cells.map(({ row, col }) => ({ row, col }))
  };
};

// Improved word placement verification
// Fill remaining empty cells with random letters
export const fillEmptyCells = (grid: string[][]): void => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
};

// Verify word placement is correct
export const verifyWordPlacement = (placement: WordPlacement, grid: string[][]): boolean => {
  const gridWord = placement.cells
    .map(({ row, col }) => grid[row][col])
    .join('');
  
  return gridWord === placement.word || 
         gridWord === placement.word.split('').reverse().join('');
};
// Validate if a word can be found in the grid
export const findWordInGrid = (
  word: string,
  grid: string[][]
): WordPlacement | null => {
  const wordLength = word.length;

  // Check all possible starting positions
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      // Try each direction from this starting point
      for (const direction of DIRECTIONS) {
        const cells = calculateWordCells(word, row, col, direction);
        
        // Skip if any cell is out of bounds
        if (cells.some(cell => 
          cell.row < 0 || cell.row >= GRID_SIZE || 
          cell.col < 0 || cell.col >= GRID_SIZE
        )) {
          continue;
        }

        // Check if the word matches in this direction
        const gridWord = cells
          .map(cell => grid[cell.row][cell.col])
          .join('');

        if (gridWord === word) {
          return {
            word,
            startRow: row,
            startCol: col,
            direction,
            cells: cells.map(({ row, col }) => ({ row, col }))
          };
        }
      }
    }
  }

  return null;
};

// Comprehensive grid validation
export const validateWordSearchGrid = (
  grid: string[][],
  words: string[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const foundPlacements = new Map<string, WordPlacement>();

  // Check each word
  for (const word of words) {
    const placement = findWordInGrid(word, grid);
    
    if (!placement) {
      errors.push(`Word "${word}" cannot be found in the grid`);
    } else {
      foundPlacements.set(word, placement);
    }
  }

  // Check for overlapping words
  const cellUsage = new Map<string, string>();
  foundPlacements.forEach((placement, word) => {
    placement.cells.forEach(({ row, col }) => {
      const key = `${row},${col}`;
      if (cellUsage.has(key) && cellUsage.get(key) !== word) {
        errors.push(
          `Word "${word}" overlaps with "${cellUsage.get(key)}" at position (${row}, ${col})`
        );
      }
      cellUsage.set(key, word);
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Enhanced grid generation with better word placement
// Generate complete word search grid
export const generateWordSearchGrid = (words: string[]): Grid => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    try {
      const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
      let placedWords: WordPlacement[] = [];
      const sortedWords = [...words].sort((a, b) => b.length - a.length);

      for (const word of sortedWords) {
        let placed = false;
        let wordAttempts = 0;
        const maxWordAttempts = 50;

        // Try placing word in different directions
        while (!placed && wordAttempts < maxWordAttempts) {
          // Get valid directions for current word
          const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
          const placement = placeWord(word, grid, direction);

          if (placement) {
            placedWords.push(placement);
            placed = true;
          }

          wordAttempts++;
        }

        // If word couldn't be placed, throw error
        if (!placed) {
          throw new Error(`Could not place word: ${word}`);
        }
      }

      fillEmptyCells(grid);
      
      // Validate the completed grid
      const validation = validateWordSearchGrid(grid, words);
      if (!validation.isValid) {
        throw new Error(`Grid validation failed: ${validation.errors.join(', ')}`);
      }

      // Return the validated grid with any validation messages
      return {
        grid,
        placedWords,
        validationErrors: validation.errors
      };
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) {
        throw new Error(`Could not generate valid grid after ${maxAttempts} attempts: ${error.message}`);
      }
    }
  }

  throw new Error('Could not generate valid grid');
};

// Helper function to validate grid before starting game
export const validateGridBeforeGame = (grid: Grid, words: string[]): boolean => {
  try {
    // Perform comprehensive validation
    const validation = validateWordSearchGrid(grid.grid, words);
    
    if (!validation.isValid) {
      console.error('Grid validation failed:', validation.errors);
      return false;
    }

    // Additional validation: check if all words from the list are in placedWords
    const placedWordSet = new Set(grid.placedWords.map(p => p.word));
    const missingWords = words.filter(word => !placedWordSet.has(word));
    
    if (missingWords.length > 0) {
      console.error('Missing words in grid:', missingWords);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Grid validation error:', error);
    return false;
  }
};

// Enhanced word checking logic to handle all directions
// Check if selected cells form a valid word
export const checkSelectedWord = (
  selectedCells: { row: number; col: number }[],
  grid: string[][],
  words: string[],
  foundWords: Set<string>
): string | null => {
  if (selectedCells.length < 2) return null;

  // Get word from selected cells
  const selectedWord = selectedCells
    .map(cell => grid[cell.row][cell.col])
    .join('');
  
  // Get reversed word
  const reversedWord = selectedWord.split('').reverse().join('');

  // Check if selected cells form a valid line (horizontal, vertical, or diagonal)
  const isValidLine = selectedCells.every((cell, index) => {
    if (index === 0) return true;
    const prev = selectedCells[index - 1];
    const rowDiff = Math.abs(cell.row - prev.row);
    const colDiff = Math.abs(cell.col - prev.col);
    return rowDiff <= 1 && colDiff <= 1;
  });

  if (!isValidLine) return null;

  return words.find(word => 
    !foundWords.has(word) && (word === selectedWord || word === reversedWord)
  ) || null;
};