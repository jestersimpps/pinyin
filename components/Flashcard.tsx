'use client';

import { useState } from 'react';
import { VocabularyItem } from '@/types/vocabulary';

interface FlashcardProps {
  item: VocabularyItem;
  onCorrect: () => void;
  onIncorrect: () => void;
  onNext: () => void;
}

export default function Flashcard({ item, onCorrect, onIncorrect, onNext }: FlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleCorrect = () => {
    onCorrect();
    setShowAnswer(false);
    onNext();
  };

  const handleIncorrect = () => {
    onIncorrect();
    setShowAnswer(false);
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 min-h-[400px] flex flex-col justify-center">
        <div className="text-center">
          <h2 className="text-8xl font-bold mb-4 text-black">{item.chinese}</h2>
          {showAnswer && (
            <>
              <p className="text-3xl mb-2 text-black font-medium">{item.pinyin}</p>
              <p className="text-2xl mb-2 text-black font-semibold">{item.spanish}</p>
              <p className="text-xl text-black">{item.english}</p>
            </>
          )}
        </div>
        
        <div className="mt-8 flex justify-center gap-4">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Show Answer
            </button>
          ) : (
            <>
              <button
                onClick={handleIncorrect}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Incorrect
              </button>
              <button
                onClick={handleCorrect}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Correct
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}