'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { vocabulary } from '@/data/vocabulary';
import { VocabularyItem, VocabularyCategory } from '@/types/vocabulary';
import { useProgress } from '@/hooks/useProgress';

interface PracticeStats {
  totalAttempts: number;
  correctFirstTry: number;
  wordsLearned: string[];
  currentStreak: number;
  bestStreak: number;
}

const CATEGORIES: { value: VocabularyCategory; label: string }[] = [
  { value: 'pronouns', label: 'Pronouns' },
  { value: 'family', label: 'Family' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'time', label: 'Time' },
  { value: 'countries', label: 'Countries' },
  { value: 'food', label: 'Food' },
  { value: 'animals', label: 'Animals' },
  { value: 'verbs', label: 'Verbs' },
  { value: 'other', label: 'Other' },
  { value: 'names', label: 'Names' }
];

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
  const [selectedCategories, setSelectedCategories] = useState<VocabularyCategory[]>(['pronouns']);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [filteredVocabulary, setFilteredVocabulary] = useState<VocabularyItem[]>([]);
  const [userInput, setUserInput] = useState('');
  const [showTranslation, setShowTranslation] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'sequential' | 'random' | 'review'>('sequential');
  const [stats, setStats] = useState<PracticeStats>({
    totalAttempts: 0,
    correctFirstTry: 0,
    wordsLearned: [],
    currentStreak: 0,
    bestStreak: 0
  });
  const [practicedWords, setPracticedWords] = useState<Set<string>>(new Set());

  const { progress, updateItemProgress } = useProgress();
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter vocabulary based on selected categories
  useEffect(() => {
    const filtered = vocabulary.filter(item => 
      selectedCategories.includes(item.category)
    );
    
    if (practiceMode === 'review') {
      // Only show words that have been attempted but not mastered
      const reviewWords = filtered.filter(item => {
        const itemProgress = progress.find(p => p.itemId === item.id);
        return itemProgress && itemProgress.correctCount < 3; // Not mastered yet
      });
      setFilteredVocabulary(reviewWords.length > 0 ? reviewWords : filtered);
    } else {
      setFilteredVocabulary(filtered);
    }
    
    setCurrentWordIndex(0);
    setUserInput('');
    setShowHint(false);
    setShowCorrectAnswer(false);
    setPracticedWords(new Set());
  }, [selectedCategories, practiceMode, progress]);

  const currentWord = filteredVocabulary[currentWordIndex];
  
  // Track when a new word is shown
  useEffect(() => {
    if (currentWord && practiceMode === 'random') {
      setPracticedWords(prev => {
        const newSet = new Set(prev);
        newSet.add(currentWord.id);
        return newSet;
      });
    }
  }, [currentWord?.id, practiceMode]);
  
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

  const handleCategoryToggle = (category: VocabularyCategory) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.length > 1 ? prev.filter(c => c !== category) : prev;
      }
      return [...prev, category];
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toLowerCase();
    setUserInput(input);
    setIsCorrect(null);
    
    if (currentWord && input.length > 0 && !showCorrectAnswer) {
      const pinyinWithTones = currentWord.pinyin.toLowerCase().replace(/'/g, ' ');
      const pinyinWithoutTones = removeTones(currentWord.pinyin);
      const inputWithoutTones = removeTones(input);
      const trimmedInput = input.trim();
      const trimmedInputWithoutTones = removeTones(trimmedInput);
      
      if (trimmedInput === pinyinWithTones || trimmedInputWithoutTones === pinyinWithoutTones) {
        handleCorrectAnswer(!showCorrectAnswer);
      }
    }
    
    if (showCorrectAnswer && currentWord) {
      const pinyinWithTones = currentWord.pinyin.toLowerCase().replace(/'/g, ' ');
      const pinyinWithoutTones = removeTones(currentWord.pinyin);
      const inputWithoutTones = removeTones(input);
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
        setTimeout(() => moveToNextWord(), 1000);
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
    
    setTimeout(() => moveToNextWord(), 1500);
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
    setUserInput('');
    setIsCorrect(null);
    setShowHint(false);
    setShowCorrectAnswer(false);
    
    if (practiceMode === 'random') {
      let newIndex;
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
      setCurrentWordIndex(newIndex);
    } else {
      setCurrentWordIndex(prev => {
        const nextIndex = prev + 1;
        return nextIndex >= filteredVocabulary.length ? 0 : nextIndex;
      });
    }
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (filteredVocabulary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
          <h2 className="text-3xl font-bold text-center mb-6 text-black">Pinyin Typing Practice</h2>
          
          <div className="mb-6">
            <p className="text-center mb-4 text-black">Select categories to practice:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {CATEGORIES.map(category => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryToggle(category.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategories.includes(category.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const accuracy = stats.totalAttempts > 0 
    ? Math.round((stats.correctFirstTry / stats.totalAttempts) * 100)
    : 0;

  return (
    <div className="flex flex-col items-center p-4 max-w-5xl mx-auto">
      {/* Header Stats */}
      <div className="bg-white shadow-md rounded-lg p-4 w-full mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">Pinyin Typing Practice</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                showTranslation ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
              }`}
            >
              Translation {showTranslation ? 'ON' : 'OFF'}
            </button>
            <select
              value={practiceMode}
              onChange={(e) => setPracticeMode(e.target.value as any)}
              className="px-3 py-1 rounded-lg border border-gray-300 text-black text-sm"
            >
              <option value="sequential">Sequential</option>
              <option value="random">Random</option>
              <option value="review">Review Mistakes</option>
            </select>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>
              {practiceMode === 'random' 
                ? `Unique Words: ${progressInfo.current} / ${progressInfo.total}`
                : `Progress: ${progressInfo.current} / ${progressInfo.total}`
              }
            </span>
            <span>{progressInfo.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                practiceMode === 'random' && progressInfo.percentage === 100
                  ? 'bg-green-600'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${progressInfo.percentage}%` }}
            />
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-gray-600">Accuracy</p>
            <p className={`text-xl font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Words Learned</p>
            <p className="text-xl font-bold text-black">{stats.wordsLearned.length}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Current Streak</p>
            <p className="text-xl font-bold text-orange-600">🔥 {stats.currentStreak}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Best Streak</p>
            <p className="text-xl font-bold text-purple-600">⭐ {stats.bestStreak}</p>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="bg-white rounded-lg shadow p-4 w-full mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(category => (
            <button
              key={category.value}
              onClick={() => handleCategoryToggle(category.value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedCategories.includes(category.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Practice Area */}
      {currentWord && (
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <p className="text-8xl font-bold mb-4 text-black">{currentWord.chinese}</p>
            {showTranslation && (
              <p className="text-xl text-gray-700 mb-2">{currentWord.english}</p>
            )}
            {showHint && (
              <p className="text-lg text-purple-600 font-medium animate-pulse">
                Hint: {removeTones(currentWord.pinyin).slice(0, Math.ceil(currentWord.pinyin.length / 2))}...
              </p>
            )}
            {showCorrectAnswer && (
              <div className="mt-4">
                <p className="text-lg text-red-600 font-bold">Correct answer: {currentWord.pinyin}</p>
                <p className="text-md text-gray-700 mt-1">({currentWord.english})</p>
                <p className="text-sm text-gray-600 mt-2">Type it to continue</p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className={`w-full px-6 py-4 text-2xl text-center border-4 rounded-lg focus:outline-none text-black transition-all ${
                isCorrect === true 
                  ? 'border-green-500 bg-green-50' 
                  : isCorrect === false 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Type pinyin here..."
              autoComplete="off"
              spellCheck={false}
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
                    
                    return pinyinWithTones.startsWith(trimmedInput) || pinyinWithoutTones.startsWith(inputWithoutTones) ? (
                      <span className="text-green-600 font-medium">✓ Keep going!</span>
                    ) : (
                      <span className="text-red-600 font-medium">✗ Check your spelling</span>
                    );
                  })()}
                </div>
              )}
              
              {isCorrect && (
                <div className="text-center">
                  <span className="text-green-600 font-bold text-xl">Correct! ✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowHint(true)}
              disabled={showHint || showCorrectAnswer || isCorrect}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showHint || showCorrectAnswer || isCorrect
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              💡 Hint
            </button>
            
            <button
              onClick={handleSkip}
              disabled={showCorrectAnswer || isCorrect}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showCorrectAnswer || isCorrect
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              Show Answer
            </button>
            
            <button
              onClick={moveToNextWord}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
            >
              Next Word →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}