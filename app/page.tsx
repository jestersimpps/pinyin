'use client';

import PinyinTypingPractice from '@/components/PinyinTypingPractice';

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <PinyinTypingPractice />
      </div>
    </div>
  );
}