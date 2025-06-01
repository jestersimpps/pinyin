export interface FallingCharacter {
  id: string;
  chinese: string;
  pinyin: string;
  spanish: string;
  english: string;
  x: number;
  y: number;
  speed: number;
  matched: boolean;
}

export interface GameState {
  score: number;
  level: number;
  lives: number;
  streak: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
  position: number;
}