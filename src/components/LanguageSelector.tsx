'use client';

import { Language } from '@/types/language';
import usePracticeStore from '@/lib/store';

export default function LanguageSelector() {
  const { language, setLanguage } = usePracticeStore();

  return (
    <div className="join">
      <button
        onClick={() => setLanguage('en')}
        className={`btn btn-sm join-item ${
          language === 'en' ? 'btn-primary' : 'btn-ghost'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`btn btn-sm join-item ${
          language === 'es' ? 'btn-primary' : 'btn-ghost'
        }`}
      >
        ES
      </button>
    </div>
  );
}