export type VocabularyCategory = 
  | 'pronouns'
  | 'family'
  | 'numbers'
  | 'time'
  | 'countries'
  | 'food'
  | 'animals'
  | 'verbs'
  | 'other'
  | 'names';

export interface VocabularyItem {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  category: VocabularyCategory;
}

export interface PracticeStats {
  correct: number;
  incorrect: number;
  lastAttempt?: Date;
}

export interface UserProgress {
  [wordId: string]: PracticeStats;
}

export type PracticeMode = 'sequential' | 'random' | 'review';

export interface PracticeSettings {
  categories: VocabularyCategory[];
  mode: PracticeMode;
  showTranslation: boolean;
}

export interface SessionStats {
  accuracy: number;
  wordsLearned: number;
  currentStreak: number;
  bestStreak: number;
}