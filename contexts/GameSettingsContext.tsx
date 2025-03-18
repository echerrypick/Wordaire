import React, { createContext, useContext, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

interface GameSettings {
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
}

const GameSettingsContext = createContext<GameSettings | undefined>(undefined);

export function GameSettingsProvider({ children }: { children: React.ReactNode }) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  return (
    <GameSettingsContext.Provider value={{ difficulty, setDifficulty }}>
      {children}
    </GameSettingsContext.Provider>
  );
}

export function useGameSettings() {
  const context = useContext(GameSettingsContext);
  if (context === undefined) {
    throw new Error('useGameSettings must be used within a GameSettingsProvider');
  }
  return context;
}