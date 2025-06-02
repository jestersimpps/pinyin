'use client';

import { useState } from 'react';
import PinyinTypingPractice from '@/components/PinyinTypingPractice';
import ParagraphPractice from '@/components/ParagraphPractice';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'single' | 'paragraph'>('single');

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-4 flex gap-2">
          <button
            onClick={() => setActiveTab('single')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Single Word Practice
          </button>
          <button
            onClick={() => setActiveTab('paragraph')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'paragraph'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paragraph Practice
          </button>
        </div>
        
        {/* Content */}
        {activeTab === 'single' ? (
          <PinyinTypingPractice />
        ) : (
          <ParagraphPractice />
        )}
      </div>
    </div>
  );
}