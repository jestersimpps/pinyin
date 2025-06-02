'use client';

import { VocabularyCategory } from '@/types/vocabulary';

interface CategoryFilterProps {
  selectedCategories: VocabularyCategory[];
  onCategoryChange: (categories: VocabularyCategory[]) => void;
}

const allCategories: VocabularyCategory[] = [
  'pronouns', 'family', 'numbers', 'time', 'countries', 'food', 'animals', 
  'verbs', 'other', 'names', 'emotions', 'objects', 'places', 'concepts', 
  'phrases', 'grammar', 'drinks', 'transportation', 'actions', 'adjectives', 
  'measure', 'technology', 'entertainment', 'adverbs', 'question words', 
  'work', 'language', 'conjunctions', 'modal verbs', 'directions', 
  'professions', 'relationships', 'finance', 'politeness', 'people', 
  'identity', 'greetings', 'prepositions', 'clothing', 'furniture', 
  'activities', 'age', 'body', 'business', 'celebrations', 'colors', 
  'determiners', 'education', 'health', 'media', 'nature', 'ordinals', 
  'sports', 'titles', 'weather', 'languages', 'appliances', 'arts', 
  'books', 'documents', 'geography', 'life events', 'money', 'plants', 
  'politics', 'seasons', 'senses', 'shapes', 'subjects', 'tastes', 
  'travel', 'utensils', 'behavior', 'communication', 'culture', 
  'elements', 'events', 'expressions', 'information', 'landmarks', 
  'medical', 'office', 'skills', 'society', 'tools', 'measurement'
];

export default function CategoryFilter({ selectedCategories, onCategoryChange }: CategoryFilterProps) {
  const handleSelectAll = () => {
    onCategoryChange(allCategories);
  };

  const handleClearAll = () => {
    onCategoryChange([]);
  };

  const handleCategoryToggle = (category: VocabularyCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const formatCategoryName = (category: string): string => {
    return category.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-black">Filter by Category</h3>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="px-2 py-1 sm:px-3 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="px-2 py-1 sm:px-3 text-xs sm:text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="max-h-32 sm:max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
        <div className="flex flex-wrap gap-2">
          {allCategories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className={`px-2 py-1 sm:px-3 text-xs sm:text-sm rounded-full transition-all ${
                selectedCategories.includes(category)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {formatCategoryName(category)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-2 text-xs sm:text-sm text-gray-600">
        {selectedCategories.length === 0 
          ? 'No categories selected' 
          : `${selectedCategories.length} of ${allCategories.length} categories selected`}
      </div>
    </div>
  );
}