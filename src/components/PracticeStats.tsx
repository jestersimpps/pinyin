'use client';

import usePracticeStore from '@/lib/store';
import { translations } from '@/types/language';

export default function PracticeStats() {
  const { 
    getAccuracy, 
    getWordsLearned, 
    currentStreak, 
    bestStreak,
    language 
  } = usePracticeStore();
  
  const t = translations[language];

  const accuracy = getAccuracy();
  const wordsLearned = getWordsLearned();

  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return 'text-green-600';
    if (acc >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <div className="stat bg-base-100 shadow p-2 sm:p-4">
        <div className="stat-title text-[10px] sm:text-sm">{t.accuracy}</div>
        <div className={`stat-value text-lg sm:text-2xl lg:text-3xl ${getAccuracyColor(accuracy)}`}>
          {accuracy}%
        </div>
      </div>
      
      <div className="stat bg-base-100 shadow p-2 sm:p-4">
        <div className="stat-title text-[10px] sm:text-sm">{t.wordsLearned}</div>
        <div className="stat-value text-lg sm:text-2xl lg:text-3xl text-primary">
          {wordsLearned}
        </div>
      </div>
      
      <div className="stat bg-base-100 shadow p-2 sm:p-4">
        <div className="stat-title text-[10px] sm:text-sm">{t.currentStreak}</div>
        <div className="stat-value text-lg sm:text-2xl lg:text-3xl text-warning">
          {currentStreak}
        </div>
      </div>
      
      <div className="stat bg-base-100 shadow p-2 sm:p-4">
        <div className="stat-title text-[10px] sm:text-sm">{t.bestStreak}</div>
        <div className="stat-value text-lg sm:text-2xl lg:text-3xl text-secondary">
          {bestStreak}
        </div>
      </div>
    </div>
  );
}