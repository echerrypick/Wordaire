import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameScore {
  gameId: string;
  score: number;
  difficulty: Difficulty;
  timeSpent: number;
  completedAt: Date;
}

interface GameStore {
  scores: GameScore[];
  unlockedLevels: Difficulty[];
  addScore: (score: GameScore) => void;
  getTotalScore: () => number;
  getBestScore: (gameId: string, difficulty: Difficulty) => number;
  unlockLevel: (difficulty: Difficulty) => void;
  isLevelUnlocked: (difficulty: Difficulty) => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  scores: [],
  unlockedLevels: ['easy'],
  addScore: (score) => set((state) => ({ scores: [...state.scores, score] })),
  getTotalScore: () => {
    const { scores } = get();
    return scores.reduce((total, score) => total + score.score, 0);
  },
  getBestScore: (gameId, difficulty) => {
    const { scores } = get();
    const gameScores = scores.filter(
      (score) => score.gameId === gameId && score.difficulty === difficulty
    );
    if (gameScores.length === 0) return 0;
    return Math.max(...gameScores.map((score) => score.score));
  },
  unlockLevel: (difficulty) => 
    set((state) => ({
      unlockedLevels: [...new Set([...state.unlockedLevels, difficulty])]
    })),
  isLevelUnlocked: (difficulty) => {
    const { unlockedLevels } = get();
    return unlockedLevels.includes(difficulty);
  },
}));