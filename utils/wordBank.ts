// Word difficulty criteria:
// Easy: 3-4 letters, common words
// Medium: 5-6 letters, moderate complexity
// Hard: 7+ letters, more complex or technical words

export type Word = {
  word: string;
  definition: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export const WORD_BANK: Word[] = [
  // Easy Words (3-4 letters)
  { word: 'ACT', definition: 'To do something', difficulty: 'easy' },
  { word: 'ADD', definition: 'To combine numbers', difficulty: 'easy' },
  { word: 'AIR', definition: 'What we breathe', difficulty: 'easy' },
  { word: 'ARM', definition: 'Body part used to reach', difficulty: 'easy' },
  { word: 'ART', definition: 'Creative expression', difficulty: 'easy' },
  { word: 'BAG', definition: 'Container for carrying things', difficulty: 'easy' },
  { word: 'BED', definition: 'Place to sleep', difficulty: 'easy' },
  { word: 'BEE', definition: 'Honey-making insect', difficulty: 'easy' },
  { word: 'BOX', definition: 'Container with six sides', difficulty: 'easy' },
  { word: 'BUS', definition: 'Large vehicle for passengers', difficulty: 'easy' },
  { word: 'CAT', definition: 'Feline pet', difficulty: 'easy' },
  { word: 'CUP', definition: 'Drinking container', difficulty: 'easy' },
  { word: 'DOG', definition: 'Canine pet', difficulty: 'easy' },
  { word: 'EAT', definition: 'To consume food', difficulty: 'easy' },
  { word: 'EGG', definition: 'Oval food from birds', difficulty: 'easy' },
  { word: 'EYE', definition: 'Organ for seeing', difficulty: 'easy' },
  { word: 'FLY', definition: 'To move through air', difficulty: 'easy' },
  { word: 'FOX', definition: 'Wild canine', difficulty: 'easy' },
  { word: 'FUN', definition: 'Enjoyable activity', difficulty: 'easy' },
  { word: 'HAT', definition: 'Head covering', difficulty: 'easy' },

  // Medium Words (5-6 letters)
  { word: 'APPLE', definition: 'Round fruit, often red', difficulty: 'medium' },
  { word: 'BEACH', definition: 'Sandy shore by water', difficulty: 'medium' },
  { word: 'BREAD', definition: 'Baked food from flour', difficulty: 'medium' },
  { word: 'CLOUD', definition: 'Visible mass in the sky', difficulty: 'medium' },
  { word: 'DANCE', definition: 'Move to music', difficulty: 'medium' },
  { word: 'DREAM', definition: 'Images during sleep', difficulty: 'medium' },
  { word: 'EARTH', definition: 'Our planet', difficulty: 'medium' },
  { word: 'FLAME', definition: 'Part of fire', difficulty: 'medium' },
  { word: 'GHOST', definition: 'Spooky apparition', difficulty: 'medium' },
  { word: 'HEART', definition: 'Blood-pumping organ', difficulty: 'medium' },
  { word: 'HOUSE', definition: 'Living space', difficulty: 'medium' },
  { word: 'LIGHT', definition: 'Makes things visible', difficulty: 'medium' },
  { word: 'MUSIC', definition: 'Organized sound', difficulty: 'medium' },
  { word: 'OCEAN', definition: 'Large body of water', difficulty: 'medium' },
  { word: 'PEACE', definition: 'State of calm', difficulty: 'medium' },
  { word: 'PLANT', definition: 'Living organism that grows', difficulty: 'medium' },
  { word: 'RIVER', definition: 'Flowing water body', difficulty: 'medium' },
  { word: 'SLEEP', definition: 'Natural rest state', difficulty: 'medium' },
  { word: 'SPACE', definition: 'Area beyond Earth', difficulty: 'medium' },
  { word: 'STORM', definition: 'Bad weather event', difficulty: 'medium' },

  // Hard Words (7+ letters)
  { word: 'ANCIENT', definition: 'Very old, from long ago', difficulty: 'hard' },
  { word: 'BALLOON', definition: 'Inflated flexible bag', difficulty: 'hard' },
  { word: 'CAPTAIN', definition: 'Leader of a ship or team', difficulty: 'hard' },
  { word: 'DIAMOND', definition: 'Precious gemstone', difficulty: 'hard' },
  { word: 'ECLIPSE', definition: 'Blocking of light from sun/moon', difficulty: 'hard' },
  { word: 'FACTORY', definition: 'Building where things are made', difficulty: 'hard' },
  { word: 'GRAVITY', definition: 'Force that pulls things down', difficulty: 'hard' },
  { word: 'HARMONY', definition: 'Pleasant combination', difficulty: 'hard' },
  { word: 'IMAGINE', definition: 'Form mental pictures', difficulty: 'hard' },
  { word: 'JOURNEY', definition: 'Travel from one place to another', difficulty: 'hard' },
  { word: 'KINGDOM', definition: 'Land ruled by a monarch', difficulty: 'hard' },
  { word: 'LIBRARY', definition: 'Place with many books', difficulty: 'hard' },
  { word: 'MYSTERY', definition: 'Something unknown', difficulty: 'hard' },
  { word: 'NETWORK', definition: 'Connected system', difficulty: 'hard' },
  { word: 'OCTOPUS', definition: 'Sea creature with eight arms', difficulty: 'hard' },
  { word: 'PYRAMID', definition: 'Structure with triangular sides', difficulty: 'hard' },
  { word: 'QUANTUM', definition: 'Smallest possible amount', difficulty: 'hard' },
  { word: 'RAINBOW', definition: 'Colorful arc in the sky', difficulty: 'hard' },
  { word: 'SCIENCE', definition: 'Study of natural world', difficulty: 'hard' },
  { word: 'THUNDER', definition: 'Loud sound during storms', difficulty: 'hard' },
  // ... Add more words to reach 500
];

/**
 * Get a random selection of words from the word bank based on difficulty
 * @param difficulty Difficulty level of words to select
 * @param count Number of words to select
 * @returns Array of randomly selected words
 */
export function getRandomWords(difficulty: 'easy' | 'medium' | 'hard', count: number): Word[] {
  const wordsOfDifficulty = WORD_BANK.filter(word => word.difficulty === difficulty);
  const shuffled = [...wordsOfDifficulty].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get a random word from the word bank based on difficulty
 * @param difficulty Difficulty level of word to select
 * @returns A randomly selected word
 */
export function getRandomWord(difficulty: 'easy' | 'medium' | 'hard'): Word {
  const wordsOfDifficulty = WORD_BANK.filter(word => word.difficulty === difficulty);
  const randomIndex = Math.floor(Math.random() * wordsOfDifficulty.length);
  return wordsOfDifficulty[randomIndex];
}

/**
 * Get words that match a specific length
 * @param length Length of words to select
 * @param count Number of words to select
 * @returns Array of words matching the specified length
 */
export function getWordsByLength(length: number, count: number): Word[] {
  const matchingWords = WORD_BANK.filter(word => word.word.length === length);
  const shuffled = [...matchingWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Check if a word exists in the word bank
 * @param word Word to check
 * @returns boolean indicating if word exists
 */
export function isValidWord(word: string): boolean {
  return WORD_BANK.some(w => w.word.toUpperCase() === word.toUpperCase());
}