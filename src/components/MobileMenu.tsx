'use client';

import { useState } from 'react';
import usePracticeStore from '@/lib/store';
import { translations } from '@/types/language';

interface MobileMenuProps {
  isSetup: boolean;
  onBackToSetup: () => void;
  showTranslation: boolean;
  onToggleTranslation: (show: boolean) => void;
}

export default function MobileMenu({ 
  isSetup, 
  onBackToSetup, 
  showTranslation, 
  onToggleTranslation 
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = usePracticeStore();
  const t = translations[language];

  if (isSetup) return null;

  return (
    <div className="lg:hidden">
      <div className="drawer drawer-end">
        <input 
          id="mobile-drawer" 
          type="checkbox" 
          className="drawer-toggle" 
          checked={isOpen}
          onChange={(e) => setIsOpen(e.target.checked)}
        />
        <div className="drawer-content">
          <label htmlFor="mobile-drawer" className="btn btn-square btn-ghost drawer-button">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
        </div>
        <div className="drawer-side">
          <label htmlFor="mobile-drawer" className="drawer-overlay"></label>
          <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <li>
              <button onClick={() => { onBackToSetup(); setIsOpen(false); }}>
                {t.backToSetup}
              </button>
            </li>
            <li>
              <label className="label cursor-pointer">
                <span className="label-text">{t.translation}</span>
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => onToggleTranslation(e.target.checked)}
                  className="checkbox checkbox-primary"
                />
              </label>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}