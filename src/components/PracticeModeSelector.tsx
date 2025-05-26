'use client';

import { PracticeMode } from '@/types/vocabulary';
import usePracticeStore from '@/lib/store';
import { translations } from '@/types/language';


export default function PracticeModeSelector() {
  const { practiceMode, setPracticeMode, language } = usePracticeStore();
  const t = translations[language];
  
  const modeDescriptions: Record<PracticeMode, { label: string; description: string }> = {
    sequential: {
      label: t.sequential,
      description: t.sequentialDesc
    },
    random: {
      label: t.random,
      description: t.randomDesc
    },
    review: {
      label: t.review,
      description: t.reviewDesc
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-black">{t.practiceMode}</h3>
      
      <div className="space-y-3">
        {(Object.keys(modeDescriptions) as PracticeMode[]).map(mode => (
          <label
            key={mode}
            className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg border border-gray-200"
          >
            <input
              type="radio"
              name="practiceMode"
              value={mode}
              checked={practiceMode === mode}
              onChange={() => setPracticeMode(mode)}
              className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="font-medium text-black">{modeDescriptions[mode].label}</div>
              <div className="text-sm text-black">{modeDescriptions[mode].description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}