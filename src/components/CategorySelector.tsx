'use client';

import { useState } from 'react';
import { VocabularyCategory } from '@/types/vocabulary';
import usePracticeStore from '@/lib/store';
import { translations } from '@/types/language';

type TabType = 'initial' | 'basic1';

export default function CategorySelector() {
  const { selectedCategories, setSelectedCategories, language } = usePracticeStore();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<TabType>('initial');
  const [chapter1Selected, setChapter1Selected] = useState(false);

  // Define categories for each tab
  const initialCategories: VocabularyCategory[] = [
    'pronouns', 'family', 'numbers', 'time', 'food', 'verbs', 'other', 'names', 'countries', 'animals'
  ];

  // Define which categories belong to Chapter 1 in Basic 1
  const chapter1Categories: VocabularyCategory[] = [
    'basic1'
  ];

  const getCurrentCategories = () => {
    if (activeTab === 'initial') {
      return initialCategories;
    } else {
      // For Basic 1 tab, we don't show individual categories, just chapter checkboxes
      return [];
    }
  };

  const toggleCategory = (category: VocabularyCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleChapter1 = () => {
    if (chapter1Selected) {
      // Remove all Chapter 1 categories
      setSelectedCategories(selectedCategories.filter(cat => !chapter1Categories.includes(cat)));
      setChapter1Selected(false);
    } else {
      // Add all Chapter 1 categories
      const otherCategories = selectedCategories.filter(cat => !chapter1Categories.includes(cat));
      setSelectedCategories([...otherCategories, ...chapter1Categories]);
      setChapter1Selected(true);
    }
  };


  // Check if Chapter 1 is fully selected
  useState(() => {
    const isChapter1FullySelected = chapter1Categories.every(cat => selectedCategories.includes(cat));
    setChapter1Selected(isChapter1FullySelected);
  });

  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-semibold">{t.selectCategories}</h3>
      
      {/* Tabs */}
      <div className="tabs tabs-boxed">
        <a 
          className={`tab ${activeTab === 'initial' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('initial')}
        >
          Initial
        </a>
        <a 
          className={`tab ${activeTab === 'basic1' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('basic1')}
        >
          Basic 1
        </a>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'initial' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {getCurrentCategories().map(category => (
              t.categories[category] && (
                <label
                  key={category}
                  className="label cursor-pointer bg-base-200 hover:bg-base-300 p-3 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text ml-2 flex-1">{t.categories[category]}</span>
                </label>
              )
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <label className="label cursor-pointer bg-base-200 hover:bg-base-300 p-3 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={chapter1Selected}
                onChange={toggleChapter1}
                className="checkbox checkbox-primary"
              />
              <span className="label-text ml-2 flex-1">{t.categories.basic1}</span>
            </label>
            
            {/* Placeholder for future chapters */}
            <label className="label cursor-pointer bg-base-200 p-3 rounded-lg transition-colors opacity-50 pointer-events-none">
              <input
                type="checkbox"
                disabled
                className="checkbox"
              />
              <span className="label-text ml-2 flex-1">Chapter 2</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}