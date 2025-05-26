'use client';

import { useState, useEffect } from 'react';
import { vocabulary } from '@/data/vocabulary';
import { VocabularyCategory, VocabularyItem } from '@/types/vocabulary';
import Flashcard from '@/components/Flashcard';
import CategoryFilter from '@/components/CategoryFilter';
import ProgressStats from '@/components/ProgressStats';
import { useProgress } from '@/hooks/useProgress';

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<VocabularyCategory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filteredVocabulary, setFilteredVocabulary] = useState<VocabularyItem[]>(vocabulary);
  const { progress, updateItemProgress, resetProgress } = useProgress();

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
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Práctica de Caracteres Chinos</h1>
        
        <ProgressStats progress={progress} />
        
        <div className="mb-6 flex justify-center gap-4">
          <button
            onClick={handleShuffle}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Mezclar
          </button>
          <button
            onClick={resetProgress}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Reiniciar progreso
          </button>
        </div>
        
        <CategoryFilter
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />
        
        {filteredVocabulary.length > 0 ? (
          <>
            <div className="text-center mb-4">
              <p className="text-gray-800 font-medium">
                Carácter {currentIndex + 1} de {filteredVocabulary.length}
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
            <p className="text-gray-800 font-medium">Selecciona al menos una categoría para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}