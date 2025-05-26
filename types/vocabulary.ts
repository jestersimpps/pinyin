export interface VocabularyItem {
  id: string;
  chinese: string;
  pinyin: string;
  spanish: string;
  english: string;
  category: VocabularyCategory;
}

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

export interface Progress {
  itemId: string;
  correctCount: number;
  incorrectCount: number;
  lastPracticed: Date;
}