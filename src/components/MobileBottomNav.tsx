'use client';

import usePracticeStore from '@/lib/store';
import { translations } from '@/types/language';

interface MobileBottomNavProps {
  isSetup: boolean;
  onBackToSetup: () => void;
}

export default function MobileBottomNav({ isSetup, onBackToSetup }: MobileBottomNavProps) {
  const { language, showTranslation, setShowTranslation } = usePracticeStore();
  const t = translations[language];

  if (isSetup) return null;

  return (
    <div className="btm-nav btm-nav-sm lg:hidden">
      <button onClick={onBackToSetup}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="btm-nav-label">{t.backToSetup}</span>
      </button>
      <button 
        className={showTranslation ? 'active' : ''}
        onClick={() => setShowTranslation(!showTranslation)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <span className="btm-nav-label">{t.translation}</span>
      </button>
    </div>
  );
}