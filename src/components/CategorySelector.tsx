'use client';

import { VocabularyCategory } from '@/types/vocabulary';
import usePracticeStore from '@/lib/store';
import { translations } from '@/types/language';


export default function CategorySelector() {
  const { selectedCategories, setSelectedCategories, language } = usePracticeStore();
  const t = translations[language];

  const toggleCategory = (category: VocabularyCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const selectAll = () => {
    setSelectedCategories(Object.keys(t.categories) as VocabularyCategory[]);
  };

  const selectNone = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-black">{t.selectCategories}</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={selectAll}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {t.selectAll}
        </button>
        <button
          onClick={selectNone}
          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          {t.deselectAll}
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {(Object.keys(t.categories) as VocabularyCategory[]).map(category => (
          <label
            key={category}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => toggleCategory(category)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm select-none text-black">{t.categories[category]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}