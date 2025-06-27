'use client';

import { useState, useEffect } from 'react';
import CategorySelector from '@/components/CategorySelector';
import PracticeModeSelector from '@/components/PracticeModeSelector';
import PracticeStats from '@/components/PracticeStats';
import PracticeArea from '@/components/PracticeArea';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeToggle from '@/components/ThemeToggle';
import MobileBottomNav from '@/components/MobileBottomNav';
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
    <main className="min-h-screen min-h-[100dvh] bg-base-200 overflow-y-auto overflow-x-hidden">
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl pb-20 lg:pb-8">
        <header className="mb-6 sm:mb-8">
          <div className="navbar bg-base-100 rounded-lg shadow-md px-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                {t.title}
              </h1>
            </div>
            <div className="flex-none gap-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {isSetup ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-4 sm:p-6 space-y-4 sm:space-y-6">
              <CategorySelector />
              
              <div className="divider my-0"></div>
              
              <PracticeModeSelector />
              
              <div className="divider my-0"></div>
              
              <div className="form-control">
                <label className="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(e) => setShowTranslation(e.target.checked)}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text ml-3 text-base sm:text-lg">{t.showTranslation}</span>
                </label>
              </div>
              
              <div className="divider my-0"></div>
              
              <div className="text-center">
                <div className="text-sm mb-4">
                  {filteredWords.length} {t.wordsAvailable}
                </div>
                <button
                  onClick={handleStartPractice}
                  className="btn btn-primary btn-lg w-full sm:w-auto"
                >
                  {t.startPractice}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <button
                onClick={handleBackToSetup}
                className="btn btn-ghost btn-sm"
              >
                {t.backToSetup}
              </button>
              
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="label-text">{t.translation}</span>
              </label>
            </div>
            
            <PracticeStats />
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-4 sm:p-6">
                <PracticeArea />
              </div>
            </div>
          </div>
        )}
      </div>
      <MobileBottomNav isSetup={isSetup} onBackToSetup={handleBackToSetup} />
    </main>
  );
}
