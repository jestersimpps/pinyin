'use client';

import { useState, useEffect } from 'react';
import CategorySelector from '@/components/CategorySelector';
import PracticeModeSelector from '@/components/PracticeModeSelector';
import PracticeStats from '@/components/PracticeStats';
import PracticeArea from '@/components/PracticeArea';
import LanguageSelector from '@/components/LanguageSelector';
import usePracticeStore from '@/lib/store';
import { translations } from '@/types/language';

export default function Home() {
  const [isSetup, setIsSetup] = useState(true);
  const { 
    selectedCategories, 
    showTranslation, 
    setShowTranslation,
    startPractice,
    getFilteredWords,
    language
  } = usePracticeStore();
  
  const t = translations[language];

  const handleStartPractice = () => {
    if (selectedCategories.length === 0) {
      alert(t.selectCategoryPrompt);
      return;
    }
    
    startPractice();
    setIsSetup(false);
  };

  const handleBackToSetup = () => {
    setIsSetup(true);
  };

  const filteredWords = getFilteredWords();

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-black">
              {t.title}
            </h1>
            <LanguageSelector />
          </div>
          <p className="text-black">
            {t.subtitle}
          </p>
        </header>

        {isSetup ? (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <CategorySelector />
            
            <div className="border-t pt-6">
              <PracticeModeSelector />
            </div>
            
            <div className="border-t pt-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-lg text-black">{t.showTranslation}</span>
              </label>
            </div>
            
            <div className="border-t pt-6 text-center">
              <div className="text-sm text-black mb-4">
                {filteredWords.length} {t.wordsAvailable}
              </div>
              <button
                onClick={handleStartPractice}
                className="px-8 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.startPractice}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handleBackToSetup}
                className="px-4 py-2 text-black hover:text-gray-800 transition-colors"
              >
                {t.backToSetup}
              </button>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-black">{t.translation}</span>
              </label>
            </div>
            
            <PracticeStats />
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <PracticeArea />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
