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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="text-sm text-black">{t.accuracy}</div>
        <div className={`text-2xl font-bold ${getAccuracyColor(accuracy)}`}>
          {accuracy}%
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="text-sm text-black">{t.wordsLearned}</div>
        <div className="text-2xl font-bold text-blue-600">
          {wordsLearned}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="text-sm text-black">{t.currentStreak}</div>
        <div className="text-2xl font-bold text-orange-600">
          {currentStreak}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="text-sm text-black">{t.bestStreak}</div>
        <div className="text-2xl font-bold text-purple-600">
          {bestStreak}
        </div>
      </div>
    </div>
  );
}