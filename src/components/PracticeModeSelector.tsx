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
      <h3 className="text-base sm:text-lg font-semibold">{t.practiceMode}</h3>
      
      <div className="space-y-2 sm:space-y-3">
        {(Object.keys(modeDescriptions) as PracticeMode[]).map(mode => (
          <label
            key={mode}
            className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
          >
            <div className="card-body p-3 sm:p-4 flex-row items-start space-x-3">
              <input
                type="radio"
                name="practiceMode"
                value={mode}
                checked={practiceMode === mode}
                onChange={() => setPracticeMode(mode)}
                className="radio radio-primary mt-1"
              />
              <div className="flex-1">
                <div className="font-medium">{modeDescriptions[mode].label}</div>
                <div className="text-xs sm:text-sm opacity-70">{modeDescriptions[mode].description}</div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}