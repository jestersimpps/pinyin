'use client';

import { VocabularyCategory } from '@/types/vocabulary';

interface CategoryFilterProps {
  selectedCategories: VocabularyCategory[];
  onCategoryToggle: (category: VocabularyCategory) => void;
}

const categoryLabels: Record<VocabularyCategory, string> = {
  pronouns: 'Pronombres',
  family: 'Familia',
  numbers: 'Números',
  time: 'Tiempo',
  countries: 'Países',
  food: 'Comida',
  animals: 'Animales',
  verbs: 'Verbos',
  other: 'Otros',
  names: 'Nombres'
};

export default function CategoryFilter({ selectedCategories, onCategoryToggle }: CategoryFilterProps) {
  const categories = Object.keys(categoryLabels) as VocabularyCategory[];

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryToggle(category)}
          className={`px-4 py-2 rounded-lg transition-colors font-medium ${
            selectedCategories.includes(category)
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {categoryLabels[category]}
        </button>
      ))}
    </div>
  );
}