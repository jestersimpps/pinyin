'use client';

import { Language } from '@/types/language';
import usePracticeStore from '@/lib/store';

export default function LanguageSelector() {
  const { language, setLanguage } = usePracticeStore();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-black hover:bg-gray-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          language === 'es'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-black hover:bg-gray-300'
        }`}
      >
        ES
      </button>
    </div>
  );
}