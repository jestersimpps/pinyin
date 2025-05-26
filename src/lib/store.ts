import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { VocabularyCategory, PracticeMode, UserProgress, VocabularyItem } from '@/types/vocabulary';
import { vocabularyData } from '@/data/vocabulary';
import { Language } from '@/types/language';

interface PracticeState {
  // Settings
  selectedCategories: VocabularyCategory[];
  practiceMode: PracticeMode;
  showTranslation: boolean;
  language: Language;
  
  // Progress
  userProgress: UserProgress;
  currentWordIndex: number;
  seenWordIds: Set<string>;
  
  // Session stats
  sessionCorrect: number;
  sessionIncorrect: number;
  currentStreak: number;
  bestStreak: number;
  
  // Current practice
  currentWord: VocabularyItem | null;
  userInput: string;
  showAnswer: boolean;
  isCorrect: boolean | null;
  
  // Actions
  setSelectedCategories: (categories: VocabularyCategory[]) => void;
  setPracticeMode: (mode: PracticeMode) => void;
  setShowTranslation: (show: boolean) => void;
  setUserInput: (input: string) => void;
  setShowAnswer: (show: boolean) => void;
  setLanguage: (language: Language) => void;
  
  // Practice actions
  startPractice: () => void;
  checkAnswer: () => void;
  nextWord: () => void;
  recordAttempt: (wordId: string, correct: boolean) => void;
  
  // Helpers
  getFilteredWords: () => VocabularyItem[];
  getProgress: () => { current: number; total: number };
  getAccuracy: () => number;
  getWordsLearned: () => number;
}

const usePracticeStore = create<PracticeState>()(
  persist(
    (set, get) => ({
      // Settings
      selectedCategories: ['pronouns'],
      practiceMode: 'sequential',
      showTranslation: true,
      language: 'es' as Language,
      
      // Progress
      userProgress: {},
      currentWordIndex: 0,
      seenWordIds: new Set(),
      
      // Session stats
      sessionCorrect: 0,
      sessionIncorrect: 0,
      currentStreak: 0,
      bestStreak: 0,
      
      // Current practice
      currentWord: null,
      userInput: '',
      showAnswer: false,
      isCorrect: null,
      
      // Actions
      setSelectedCategories: (categories) => set({ selectedCategories: categories }),
      setPracticeMode: (mode) => set({ practiceMode: mode }),
      setShowTranslation: (show) => set({ showTranslation: show }),
      setUserInput: (input) => set({ userInput: input }),
      setShowAnswer: (show) => set({ showAnswer: show }),
      setLanguage: (language) => set({ language }),
      
      // Practice actions
      startPractice: () => {
        const state = get();
        const words = state.getFilteredWords();
        
        if (words.length === 0) return;
        
        let wordToShow: VocabularyItem;
        
        if (state.practiceMode === 'sequential') {
          wordToShow = words[0];
        } else if (state.practiceMode === 'random') {
          // Prioritize unseen words
          const unseenWords = words.filter(w => !state.seenWordIds.has(w.id));
          const wordsToChooseFrom = unseenWords.length > 0 ? unseenWords : words;
          wordToShow = wordsToChooseFrom[Math.floor(Math.random() * wordsToChooseFrom.length)];
        } else {
          // Review mode - only words with incorrect attempts
          const mistakeWords = words.filter(w => 
            state.userProgress[w.id]?.incorrect > 0
          );
          if (mistakeWords.length === 0) {
            wordToShow = words[0];
          } else {
            wordToShow = mistakeWords[Math.floor(Math.random() * mistakeWords.length)];
          }
        }
        
        set({
          currentWord: wordToShow,
          currentWordIndex: 0,
          userInput: '',
          showAnswer: false,
          isCorrect: null,
          sessionCorrect: 0,
          sessionIncorrect: 0,
          currentStreak: 0,
          seenWordIds: new Set()
        });
      },
      
      checkAnswer: () => {
        const state = get();
        if (!state.currentWord) return;
        
        const normalizeInput = (str: string) => {
          return str.toLowerCase().trim().replace(/\s+/g, ' ');
        };
        
        const userAnswer = normalizeInput(state.userInput);
        const correctAnswer = normalizeInput(state.currentWord.pinyin);
        const correctAnswerNoTones = correctAnswer.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g, (match) => {
          const toneMap: { [key: string]: string } = {
            'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
            'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
            'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
            'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
            'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
            'ǖ': 'u', 'ǘ': 'u', 'ǚ': 'u', 'ǜ': 'u'
          };
          return toneMap[match] || match;
        });
        
        const isCorrect = userAnswer === correctAnswer || userAnswer === correctAnswerNoTones;
        
        set({ isCorrect });
        
        if (isCorrect && !state.showAnswer) {
          state.recordAttempt(state.currentWord.id, true);
          
          // Auto advance after 1.5 seconds
          setTimeout(() => {
            state.nextWord();
          }, 1500);
        }
      },
      
      nextWord: () => {
        const state = get();
        const words = state.getFilteredWords();
        
        if (words.length === 0) return;
        
        // Record seen word
        const newSeenWordIds = new Set(state.seenWordIds);
        if (state.currentWord) {
          newSeenWordIds.add(state.currentWord.id);
        }
        
        let nextWord: VocabularyItem;
        let nextIndex = state.currentWordIndex;
        
        if (state.practiceMode === 'sequential') {
          nextIndex = (state.currentWordIndex + 1) % words.length;
          nextWord = words[nextIndex];
        } else if (state.practiceMode === 'random') {
          // Prioritize unseen words
          const unseenWords = words.filter(w => !newSeenWordIds.has(w.id));
          const wordsToChooseFrom = unseenWords.length > 0 ? unseenWords : words;
          
          // Avoid showing the same word twice in a row if possible
          const filteredWords = wordsToChooseFrom.filter(w => w.id !== state.currentWord?.id);
          const finalWords = filteredWords.length > 0 ? filteredWords : wordsToChooseFrom;
          
          nextWord = finalWords[Math.floor(Math.random() * finalWords.length)];
        } else {
          // Review mode
          const mistakeWords = words.filter(w => 
            state.userProgress[w.id]?.incorrect > 0
          );
          
          if (mistakeWords.length === 0) {
            nextWord = words[0];
          } else {
            const filteredWords = mistakeWords.filter(w => w.id !== state.currentWord?.id);
            const finalWords = filteredWords.length > 0 ? filteredWords : mistakeWords;
            nextWord = finalWords[Math.floor(Math.random() * finalWords.length)];
          }
        }
        
        set({
          currentWord: nextWord,
          currentWordIndex: nextIndex,
          userInput: '',
          showAnswer: false,
          isCorrect: null,
          seenWordIds: newSeenWordIds
        });
      },
      
      recordAttempt: (wordId: string, correct: boolean) => {
        set((state) => {
          const newProgress = { ...state.userProgress };
          
          if (!newProgress[wordId]) {
            newProgress[wordId] = {
              correct: 0,
              incorrect: 0,
              lastAttempt: new Date()
            };
          }
          
          if (correct) {
            newProgress[wordId].correct++;
          } else {
            newProgress[wordId].incorrect++;
          }
          
          newProgress[wordId].lastAttempt = new Date();
          
          const newSessionCorrect = correct ? state.sessionCorrect + 1 : state.sessionCorrect;
          const newSessionIncorrect = !correct ? state.sessionIncorrect + 1 : state.sessionIncorrect;
          const newCurrentStreak = correct ? state.currentStreak + 1 : 0;
          const newBestStreak = Math.max(state.bestStreak, newCurrentStreak);
          
          return {
            userProgress: newProgress,
            sessionCorrect: newSessionCorrect,
            sessionIncorrect: newSessionIncorrect,
            currentStreak: newCurrentStreak,
            bestStreak: newBestStreak
          };
        });
      },
      
      // Helpers
      getFilteredWords: () => {
        const state = get();
        
        if (state.practiceMode === 'review') {
          // In review mode, show all words with mistakes from selected categories
          return vocabularyData.filter(word => 
            state.selectedCategories.includes(word.category) &&
            state.userProgress[word.id]?.incorrect > 0
          );
        }
        
        return vocabularyData.filter(word => 
          state.selectedCategories.includes(word.category)
        );
      },
      
      getProgress: () => {
        const state = get();
        const words = state.getFilteredWords();
        
        if (state.practiceMode === 'sequential') {
          return {
            current: state.currentWordIndex + 1,
            total: words.length
          };
        } else if (state.practiceMode === 'random') {
          return {
            current: state.seenWordIds.size,
            total: words.length
          };
        } else {
          // Review mode
          const completedReviews = Object.entries(state.userProgress)
            .filter(([id, stats]) => 
              words.some(w => w.id === id) && stats.correct > stats.incorrect
            ).length;
          
          return {
            current: completedReviews,
            total: words.length
          };
        }
      },
      
      getAccuracy: () => {
        const state = get();
        const total = state.sessionCorrect + state.sessionIncorrect;
        if (total === 0) return 0;
        return Math.round((state.sessionCorrect / total) * 100);
      },
      
      getWordsLearned: () => {
        const state = get();
        return Object.entries(state.userProgress)
          .filter(([_, stats]) => stats.correct > 0)
          .length;
      }
    }),
    {
      name: 'pinyin-practice-storage',
      partialize: (state) => ({
        userProgress: state.userProgress,
        bestStreak: state.bestStreak,
        selectedCategories: state.selectedCategories,
        practiceMode: state.practiceMode,
        showTranslation: state.showTranslation,
        language: state.language
      })
    }
  )
);

export default usePracticeStore;