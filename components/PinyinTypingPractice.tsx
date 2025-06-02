'use client';

import { useState, useEffect, useRef } from 'react';
import { hsk1Vocabulary, hsk2Vocabulary, hsk3Vocabulary, hsk4Vocabulary } from '@/data/vocabulary';
import { VocabularyItem, VocabularyCategory } from '@/types/vocabulary';
import { useProgress } from '@/hooks/useProgress';
import CategoryFilter from '@/components/CategoryFilter';

interface PracticeStats {
  totalAttempts: number;
  correctFirstTry: number;
  wordsLearned: string[];
  currentStreak: number;
  bestStreak: number;
}


// Function to remove tone marks from pinyin
const removeTones = (pinyin: string): string => {
  return pinyin
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'ü')
    .replace(/[ńň]/g, 'n')
    .replace(/'/g, ' ') // Replace apostrophe with space
    .toLowerCase();
};

export default function PinyinTypingPractice() {
  const [currentWordIndex, setCurrentWordIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chinese-practice-current-index');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return 0;
  });
  const [filteredVocabulary, setFilteredVocabulary] = useState<VocabularyItem[]>([]);
  const [userInput, setUserInput] = useState('');
  const [showTranslation, setShowTranslation] = useState(true);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'sequential' | 'random' | 'review'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chinese-practice-mode');
      if (stored) {
        return stored as 'sequential' | 'random' | 'review';
      }
    }
    return 'sequential';
  });
  const [hskLevel, setHskLevel] = useState<'hsk1' | 'hsk2' | 'hsk3' | 'hsk4' | 'hsk1-2' | 'hsk1-3' | 'hsk1-4' | 'all'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chinese-practice-hsk-level');
      if (stored) {
        return stored as 'hsk1' | 'hsk2' | 'hsk3' | 'hsk4' | 'hsk1-2' | 'hsk1-3' | 'hsk1-4' | 'all';
      }
    }
    return 'hsk1';
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<PracticeStats>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chinese-practice-stats');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return {
      totalAttempts: 0,
      correctFirstTry: 0,
      wordsLearned: [],
      currentStreak: 0,
      bestStreak: 0
    };
  });
  const [practicedWords, setPracticedWords] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('chinese-practice-practiced-words');
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    }
    return new Set();
  });
  const [selectedCategories, setSelectedCategories] = useState<VocabularyCategory[]>([]);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [optionsCollapsed, setOptionsCollapsed] = useState(false);

  const { progress, updateItemProgress } = useProgress();
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chinese-practice-stats', JSON.stringify(stats));
    }
  }, [stats]);

  // Save current word index to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chinese-practice-current-index', JSON.stringify(currentWordIndex));
    }
  }, [currentWordIndex]);

  // Save practiced words to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chinese-practice-practiced-words', JSON.stringify(Array.from(practicedWords)));
    }
  }, [practicedWords]);

  // Save practice mode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chinese-practice-mode', practiceMode);
    }
  }, [practiceMode]);

  // Save HSK level to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chinese-practice-hsk-level', hskLevel);
    }
  }, [hskLevel]);

  // Filter vocabulary based on HSK level and categories
  useEffect(() => {
    let vocabToUse: VocabularyItem[] = [];
    
    if (hskLevel === 'hsk1') {
      vocabToUse = hsk1Vocabulary;
    } else if (hskLevel === 'hsk2') {
      vocabToUse = hsk2Vocabulary;
    } else if (hskLevel === 'hsk3') {
      vocabToUse = hsk3Vocabulary;
    } else if (hskLevel === 'hsk4') {
      vocabToUse = hsk4Vocabulary;
    } else if (hskLevel === 'hsk1-2') {
      vocabToUse = [...hsk1Vocabulary, ...hsk2Vocabulary];
    } else if (hskLevel === 'hsk1-3') {
      vocabToUse = [...hsk1Vocabulary, ...hsk2Vocabulary, ...hsk3Vocabulary];
    } else if (hskLevel === 'hsk1-4') {
      vocabToUse = [...hsk1Vocabulary, ...hsk2Vocabulary, ...hsk3Vocabulary, ...hsk4Vocabulary];
    } else {
      vocabToUse = [...hsk1Vocabulary, ...hsk2Vocabulary, ...hsk3Vocabulary, ...hsk4Vocabulary];
    }
    
    // Apply category filter if categories are selected
    if (selectedCategories.length > 0) {
      vocabToUse = vocabToUse.filter(item => selectedCategories.includes(item.category));
    }
    
    if (practiceMode === 'review') {
      // Only show words that have been attempted but not mastered
      const reviewWords = vocabToUse.filter(item => {
        const itemProgress = progress.find(p => p.itemId === item.id);
        return itemProgress && itemProgress.correctCount < 3; // Not mastered yet
      });
      setFilteredVocabulary(reviewWords.length > 0 ? reviewWords : vocabToUse);
    } else {
      setFilteredVocabulary(vocabToUse);
    }
    
    // On initial mount, preserve the saved state
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Only reset when user actively changes settings
    if (vocabToUse.length > 0) {
      setCurrentWordIndex(0);
    }
    setUserInput('');
    setShowCorrectAnswer(false);
    setPracticedWords(new Set());
    setIsCompleted(false);
    setIsLoading(false);
  }, [practiceMode, progress, hskLevel, selectedCategories]);

  // Always use currentWordIndex for display to prevent flashing
  const currentWord = filteredVocabulary.length > 0 && currentWordIndex < filteredVocabulary.length 
    ? filteredVocabulary[currentWordIndex] 
    : null;
  
  // Track when a new word is shown
  useEffect(() => {
    if (currentWord && practiceMode === 'random') {
      setPracticedWords(prev => {
        const newSet = new Set(prev);
        newSet.add(currentWord.id);
        return newSet;
      });
    }
  }, [currentWord?.id, practiceMode, currentWord]);

  // Focus input when word changes
  useEffect(() => {
    if (currentWord && !isLoading && !isCompleted && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentWord, isLoading, isCompleted]);
  
  // Calculate progress based on mode
  const progressInfo = (() => {
    if (practiceMode === 'random') {
      const uniqueWords = practicedWords.size;
      const totalWords = filteredVocabulary.length;
      const percentage = totalWords > 0 ? Math.round((uniqueWords / totalWords) * 100) : 0;
      return {
        current: uniqueWords,
        total: totalWords,
        percentage: Math.min(percentage, 100)
      };
    } else {
      const percentage = filteredVocabulary.length > 0 
        ? Math.round(((currentWordIndex + 1) / filteredVocabulary.length) * 100)
        : 0;
      return {
        current: currentWordIndex + 1,
        total: filteredVocabulary.length,
        percentage
      };
    }
  })();


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toLowerCase();
    setUserInput(input);
    setIsCorrect(null);
    
    if (currentWord && input.length > 0 && !showCorrectAnswer) {
      const pinyinWithTones = currentWord.pinyin.toLowerCase().replace(/'/g, ' ');
      const pinyinWithoutTones = removeTones(currentWord.pinyin);
      const trimmedInput = input.trim();
      const trimmedInputWithoutTones = removeTones(trimmedInput);
      
      if (trimmedInput === pinyinWithTones || trimmedInputWithoutTones === pinyinWithoutTones) {
        // Immediately show loading when correct
        setIsLoading(true);
        handleCorrectAnswer(!showCorrectAnswer);
      }
    }
    
    if (showCorrectAnswer && currentWord) {
      const pinyinWithTones = currentWord.pinyin.toLowerCase().replace(/'/g, ' ');
      const pinyinWithoutTones = removeTones(currentWord.pinyin);
      const trimmedInput = input.trim();
      const trimmedInputWithoutTones = removeTones(trimmedInput);
      
      if (trimmedInput === pinyinWithTones || trimmedInputWithoutTones === pinyinWithoutTones) {
        setIsCorrect(true);
        // Update stats for typing after seeing answer
        setStats(prev => ({
          ...prev,
          totalAttempts: prev.totalAttempts + 1,
          wordsLearned: prev.wordsLearned.includes(currentWord.id) 
            ? prev.wordsLearned 
            : [...prev.wordsLearned, currentWord.id]
        }));
        updateItemProgress(currentWord.id, false); // Mark as incorrect since they needed to see answer
        setIsLoading(true);
        setTimeout(() => moveToNextWord(), 200);
      }
    }
  };

  const handleCorrectAnswer = (firstTry: boolean) => {
    if (!currentWord) return;
    
    setIsCorrect(true);
    updateItemProgress(currentWord.id, true);
    
    if (firstTry) {
      const newStreak = stats.currentStreak + 1;
      setStats(prev => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        correctFirstTry: prev.correctFirstTry + 1,
        wordsLearned: prev.wordsLearned.includes(currentWord.id) 
          ? prev.wordsLearned 
          : [...prev.wordsLearned, currentWord.id],
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, prev.bestStreak)
      }));
    } else {
      setStats(prev => ({
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        wordsLearned: prev.wordsLearned.includes(currentWord.id) 
          ? prev.wordsLearned 
          : [...prev.wordsLearned, currentWord.id]
      }));
    }
    
    // Move to next word immediately since loading is already set
    setTimeout(() => moveToNextWord(), 200);
  };

  const handleSkip = () => {
    if (!currentWord) return;
    
    setStats(prev => ({
      ...prev,
      currentStreak: 0
    }));
    
    setShowCorrectAnswer(true);
    setUserInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const moveToNextWord = () => {
    // Clear current state
    setUserInput('');
    setIsCorrect(null);
    setShowCorrectAnswer(false);
    
    // Calculate next index first
    let newIndex: number;
    if (practiceMode === 'random') {
      // Try to find a word we haven't practiced yet
      const unpracticedIndices = filteredVocabulary
        .map((_, index) => index)
        .filter(index => !practicedWords.has(filteredVocabulary[index].id));
      
      if (unpracticedIndices.length > 0) {
        // Pick from unpracticed words
        newIndex = unpracticedIndices[Math.floor(Math.random() * unpracticedIndices.length)];
      } else {
        // All words practiced, pick any random word
        newIndex = Math.floor(Math.random() * filteredVocabulary.length);
      }
    } else {
      // Sequential mode
      newIndex = currentWordIndex + 1;
      if (newIndex >= filteredVocabulary.length) {
        // Completed all words in sequential mode
        setIsCompleted(true);
        setIsLoading(false);
        return; // Don't continue
      }
    }
    
    // If not already loading, set loading state
    if (!isLoading) {
      setIsLoading(true);
    }
    
    // Apply the new index after a delay
    setTimeout(() => {
      setCurrentWordIndex(newIndex);
      setIsLoading(false);
      
      // Focus input after transition
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }, 150); // Small delay for smooth transition
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };


  const accuracy = stats.totalAttempts > 0 
    ? Math.round((stats.correctFirstTry / stats.totalAttempts) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 max-w-5xl mx-auto">
      {/* Header Stats */}
      <div className="bg-white shadow-md rounded-lg p-3 sm:p-4 w-full mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-black">Pinyin Practice</h2>
            <button
              onClick={() => setOptionsCollapsed(!optionsCollapsed)}
              className="px-2 py-1 text-gray-600 hover:text-gray-800 transition-all"
              aria-label={optionsCollapsed ? 'Expand options' : 'Collapse options'}
            >
              {optionsCollapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>
          {!optionsCollapsed && (
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <select
              value={hskLevel}
              onChange={(e) => setHskLevel(e.target.value as 'hsk1' | 'hsk2' | 'hsk3' | 'hsk4' | 'hsk1-2' | 'hsk1-3' | 'hsk1-4' | 'all')}
              className="px-2 py-1 sm:px-3 rounded-lg border border-gray-300 text-black text-xs sm:text-sm font-medium"
            >
              <option value="hsk1">HSK 1</option>
              <option value="hsk2">HSK 2</option>
              <option value="hsk3">HSK 3</option>
              <option value="hsk4">HSK 4</option>
              <option value="hsk1-2">HSK 1 & 2</option>
              <option value="hsk1-3">HSK 1-3</option>
              <option value="hsk1-4">HSK 1-4</option>
              <option value="all">All Levels</option>
            </select>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium transition-all ${
                showTranslation ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
              }`}
            >
              Translation {showTranslation ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setHintsEnabled(!hintsEnabled)}
              className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium transition-all ${
                hintsEnabled ? 'bg-purple-600 text-white' : 'bg-gray-400 text-white'
              }`}
            >
              Hints {hintsEnabled ? 'ON' : 'OFF'}
            </button>
            <select
              value={practiceMode}
              onChange={(e) => setPracticeMode(e.target.value as 'sequential' | 'random' | 'review')}
              className="px-2 py-1 sm:px-3 rounded-lg border border-gray-300 text-black text-xs sm:text-sm"
            >
              <option value="sequential">Sequential</option>
              <option value="random">Random</option>
              <option value="review">Review Mistakes</option>
            </select>
            <button
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              className={`px-2 py-1 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                showCategoryFilter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {selectedCategories.length > 0 ? `Categories (${selectedCategories.length})` : 'Categories'}
            </button>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset your practice statistics and progress?')) {
                  setStats({
                    totalAttempts: 0,
                    correctFirstTry: 0,
                    wordsLearned: [],
                    currentStreak: 0,
                    bestStreak: 0
                  });
                  setCurrentWordIndex(0);
                  setPracticedWords(new Set());
                  setIsCompleted(false);
                }
              }}
              className="px-2 py-1 sm:px-3 rounded-lg text-xs sm:text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
            >
              Reset Progress
            </button>
          </div>
          )}
        </div>
        
        {/* Progress Bar - Always visible */}
        <div className="mb-3 sm:mb-4">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
            <span>
              {practiceMode === 'random' 
                ? `Unique Words: ${progressInfo.current} / ${progressInfo.total}`
                : `Progress: ${progressInfo.current} / ${progressInfo.total}`
              }
            </span>
            <span>{progressInfo.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
            <div 
              className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
                practiceMode === 'random' && progressInfo.percentage === 100
                  ? 'bg-green-600'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${progressInfo.percentage}%` }}
            />
          </div>
        </div>
        
        {!optionsCollapsed && (
        <>
        
        {/* Current Level Indicator */}
        <div className="text-center mb-2">
          <span className="inline-block px-2 py-1 sm:px-3 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
            {hskLevel === 'hsk1' ? 'HSK 1' : 
             hskLevel === 'hsk2' ? 'HSK 2' : 
             hskLevel === 'hsk3' ? 'HSK 3' :
             hskLevel === 'hsk4' ? 'HSK 4' :
             hskLevel === 'hsk1-2' ? 'HSK 1 & 2' :
             hskLevel === 'hsk1-3' ? 'HSK 1-3' :
             hskLevel === 'hsk1-4' ? 'HSK 1-4' :
             'All Levels'} ({filteredVocabulary.length} words{selectedCategories.length > 0 ? ' filtered' : ''})
          </span>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Accuracy</p>
            <p className={`text-lg sm:text-xl font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Words Learned</p>
            <p className="text-lg sm:text-xl font-bold text-black">{stats.wordsLearned.length}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Current Streak</p>
            <p className="text-lg sm:text-xl font-bold text-orange-600">🔥 {stats.currentStreak}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Best Streak</p>
            <p className="text-lg sm:text-xl font-bold text-purple-600">⭐ {stats.bestStreak}</p>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Category Filter */}
      {showCategoryFilter && (
        <CategoryFilter
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
        />
      )}

      {/* Main Practice Area */}
      <div className="w-full">
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-2xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">Loading next character...</p>
          </div>
        </div>
      ) : isCompleted ? (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-2xl text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">🎉 Congratulations!</h3>
          <p className="text-lg sm:text-xl text-gray-700 mb-6">
            You&apos;ve completed all {filteredVocabulary.length} words in sequential mode!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                setCurrentWordIndex(0);
                setIsCompleted(false);
                // Keep stats when starting over
              }}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all text-sm sm:text-base"
            >
              Start Over
            </button>
            <button
              onClick={() => setPracticeMode('random')}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-all text-sm sm:text-base"
            >
              Switch to Random Mode
            </button>
          </div>
        </div>
      ) : currentWord && !isLoading ? (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-2xl">
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-6xl sm:text-8xl font-bold mb-3 sm:mb-4 text-black">{currentWord.chinese}</p>
            {showTranslation && (
              <p className="text-lg sm:text-xl text-gray-700 mb-2">{currentWord.english}</p>
            )}
            {hintsEnabled && currentWord.hint && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-base sm:text-lg text-purple-800 font-medium">
                  💡 Memory Hint:
                </p>
                <p className="text-sm sm:text-md text-purple-700 mt-1">
                  {currentWord.hint}
                </p>
              </div>
            )}
            {showCorrectAnswer && (
              <div className="mt-3 sm:mt-4">
                <p className="text-base sm:text-lg text-red-600 font-bold">Correct answer: {currentWord.pinyin}</p>
                <p className="text-sm sm:text-md text-gray-700 mt-1">({currentWord.english})</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">Type it to continue</p>
              </div>
            )}
          </div>

          <div className="mb-6 sm:mb-8">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 sm:px-6 sm:py-4 text-xl sm:text-2xl text-center border-4 rounded-lg focus:outline-none text-black transition-all ${
                isCorrect === true 
                  ? 'border-green-500 bg-green-50' 
                  : isCorrect === false 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Type pinyin here..."
              autoComplete="off"
              spellCheck={false}
              autoFocus
              inputMode="text"
              enterKeyHint="next"
            />
            
            {/* Visual feedback */}
            <div className="h-8 mt-2">
              {userInput.length > 0 && currentWord && !showCorrectAnswer && !isCorrect && (
                <div className="text-center">
                  {(() => {
                    const pinyinWithTones = currentWord.pinyin.toLowerCase().replace(/'/g, ' ');
                    const pinyinWithoutTones = removeTones(currentWord.pinyin);
                    const trimmedInput = userInput.trim().toLowerCase();
                    const inputWithoutTones = removeTones(trimmedInput);
                    
                    const isOnTrack = pinyinWithTones.startsWith(trimmedInput) || pinyinWithoutTones.startsWith(inputWithoutTones);
                    
                    if (isOnTrack) {
                      return <span className="text-sm sm:text-base text-green-600 font-medium">✓ Keep going!</span>;
                    } else {
                      return (
                        <div>
                          <span className="text-sm sm:text-base text-red-600 font-medium">✗ Check your spelling</span>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
              
              {/* Remove Correct! message since we show loading immediately */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <button
              onClick={handleSkip}
              disabled={showCorrectAnswer || !!isCorrect}
              className={`px-3 py-2 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all ${
                showCorrectAnswer || !!isCorrect
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              Show Answer
            </button>
            
            <button
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => moveToNextWord(), 100);
              }}
              className="px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base font-medium transition-all"
            >
              Next Word →
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <p className="text-sm sm:text-base text-black font-medium">No words available</p>
        </div>
      )}
      </div>
    </div>
  );
}