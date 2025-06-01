'use client';

import { useState, useEffect } from 'react';
import { vocabulary } from '@/data/vocabulary';
import { VocabularyCategory, VocabularyItem } from '@/types/vocabulary';
import Flashcard from '@/components/Flashcard';
import CategoryFilter from '@/components/CategoryFilter';
import ProgressStats from '@/components/ProgressStats';
import ChineseTetris from '@/components/ChineseTetris';
import PinyinHunter from '@/components/PinyinHunter';
import PinyinTypingRace from '@/components/PinyinTypingRace';
import PinyinTypingPractice from '@/components/PinyinTypingPractice';
import { useProgress } from '@/hooks/useProgress';

type GameMode = 'flashcards' | 'tetris' | 'pinyin-hunter' | 'typing-race' | 'typing-practice';

export default function Home() {
  const [gameMode, setGameMode] = useState<GameMode>('flashcards');
  const [selectedCategories, setSelectedCategories] = useState<VocabularyCategory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filteredVocabulary, setFilteredVocabulary] = useState<VocabularyItem[]>(vocabulary);
  const { progress, updateItemProgress, resetProgress, isLoaded } = useProgress();

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredVocabulary(vocabulary);
    } else {
      setFilteredVocabulary(
        vocabulary.filter(item => selectedCategories.includes(item.category))
      );
    }
    setCurrentIndex(0);
  }, [selectedCategories]);

  const handleCategoryToggle = (category: VocabularyCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleCorrect = () => {
    if (filteredVocabulary[currentIndex]) {
      updateItemProgress(filteredVocabulary[currentIndex].id, true);
    }
  };

  const handleIncorrect = () => {
    if (filteredVocabulary[currentIndex]) {
      updateItemProgress(filteredVocabulary[currentIndex].id, false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredVocabulary.length);
  };

  const handleShuffle = () => {
    const shuffled = [...filteredVocabulary].sort(() => Math.random() - 0.5);
    setFilteredVocabulary(shuffled);
    setCurrentIndex(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-black">Chinese Character Practice</h1>
        
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setGameMode('flashcards')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              gameMode === 'flashcards'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-black border-2 border-gray-300 hover:border-gray-400'
            }`}
          >
            📚 Flashcards
          </button>
          <button
            onClick={() => setGameMode('tetris')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              gameMode === 'tetris'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-black border-2 border-gray-300 hover:border-gray-400'
            }`}
          >
            🎮 Chinese Tetris
          </button>
          <button
            onClick={() => setGameMode('pinyin-hunter')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              gameMode === 'pinyin-hunter'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-black border-2 border-gray-300 hover:border-gray-400'
            }`}
          >
            🎯 Pinyin Hunter
          </button>
          <button
            onClick={() => setGameMode('typing-race')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              gameMode === 'typing-race'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-black border-2 border-gray-300 hover:border-gray-400'
            }`}
          >
            ⌨️ Typing Race
          </button>
          <button
            onClick={() => setGameMode('typing-practice')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              gameMode === 'typing-practice'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-black border-2 border-gray-300 hover:border-gray-400'
            }`}
          >
            📝 Typing Practice
          </button>
        </div>

        {gameMode === 'flashcards' ? (
          <>
            {isLoaded && <ProgressStats progress={progress} />}
            
            <div className="mb-6 flex justify-center gap-4">
              <button
                onClick={handleShuffle}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Shuffle
              </button>
              <button
                onClick={resetProgress}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Reset Progress
              </button>
            </div>
            
            <CategoryFilter
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
            />
            
            {filteredVocabulary.length > 0 ? (
              <>
                <div className="text-center mb-4">
                  <p className="text-black font-medium">
                    Character {currentIndex + 1} of {filteredVocabulary.length}
                  </p>
                </div>
                <Flashcard
                  item={filteredVocabulary[currentIndex]}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                  onNext={handleNext}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-black font-medium">Select at least one category to begin</p>
              </div>
            )}
          </>
        ) : gameMode === 'tetris' ? (
          <ChineseTetris />
        ) : gameMode === 'pinyin-hunter' ? (
          <PinyinHunter />
        ) : gameMode === 'typing-race' ? (
          <PinyinTypingRace />
        ) : (
          <PinyinTypingPractice />
        )}
      </div>
    </div>
  );
}