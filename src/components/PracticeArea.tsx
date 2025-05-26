'use client';

import { useEffect, useRef } from 'react';
import usePracticeStore from '@/lib/store';
import { translations } from '@/types/language';

export default function PracticeArea() {
  const {
    currentWord,
    userInput,
    showAnswer,
    isCorrect,
    showTranslation,
    setUserInput,
    setShowAnswer,
    checkAnswer,
    nextWord,
    recordAttempt,
    getProgress,
    practiceMode,
    language
  } = usePracticeStore();
  
  const t = translations[language];

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentWord && !showAnswer) {
      inputRef.current?.focus();
    }
  }, [currentWord, showAnswer]);

  useEffect(() => {
    if (userInput && currentWord) {
      checkAnswer();
    }
  }, [userInput, currentWord, checkAnswer]);

  const handleShowHint = () => {
    if (!currentWord) return;
    const halfLength = Math.ceil(currentWord.pinyin.length / 2);
    setUserInput(currentWord.pinyin.substring(0, halfLength));
    inputRef.current?.focus();
  };

  const handleShowAnswer = () => {
    if (!currentWord) return;
    setShowAnswer(true);
    recordAttempt(currentWord.id, false);
  };

  const handleNextWord = () => {
    nextWord();
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showAnswer && userInput.toLowerCase().trim() === currentWord?.pinyin.toLowerCase().trim()) {
      handleNextWord();
    }
  };

  const progress = getProgress();
  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  const allWordsSeen = practiceMode === 'random' && progress.current === progress.total;

  if (!currentWord) {
    return (
      <div className="text-center py-12">
        <p className="text-black mb-4">
          {t.noWordsAvailable}
        </p>
        <p className="text-sm text-black">
          {t.selectCategoryPrompt}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-black">
          <span>
            {practiceMode === 'sequential' && `${t.word} ${progress.current}/${progress.total}`}
            {practiceMode === 'random' && `${progress.current}/${progress.total} ${t.uniqueWords}`}
            {practiceMode === 'review' && `${progress.current}/${progress.total} ${t.reviewed}`}
          </span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              allWordsSeen ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Character Display */}
      <div className="text-center space-y-4">
        <div className="text-8xl font-bold text-black">
          {currentWord.chinese}
        </div>
        
        {showTranslation && (
          <div className="text-xl text-black">
            {currentWord.english}
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleAnswerSubmit} className="space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={t.writePinyinHere}
            disabled={showAnswer}
            className={`w-full px-4 py-3 text-lg text-black border rounded-lg focus:outline-none focus:ring-2 ${
              isCorrect === true
                ? 'border-green-500 focus:ring-green-500'
                : isCorrect === false
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } ${showAnswer ? 'bg-gray-100' : ''}`}
          />
          
          {isCorrect !== null && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isCorrect ? (
                <span className="text-green-500 text-2xl">✓</span>
              ) : (
                <span className="text-red-500 text-2xl">✗</span>
              )}
            </div>
          )}
        </div>

        {/* Answer Display */}
        {showAnswer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">{t.correctAnswer}</div>
            <div className="text-xl font-semibold text-blue-800">{currentWord.pinyin}</div>
            <div className="text-sm text-blue-600 mt-2">{currentWord.english}</div>
            <div className="text-sm text-black mt-3">
              {t.writeCorrectAnswer}
            </div>
          </div>
        )}

        {/* Success Message */}
        {isCorrect === true && !showAnswer && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-green-800 font-semibold">¡Correcto! ✓</div>
          </div>
        )}
      </form>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        {!showAnswer && !isCorrect && (
          <>
            <button
              onClick={handleShowHint}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              title="Mostrar pista"
            >
              💡 Pista
            </button>
            
            <button
              onClick={handleShowAnswer}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Mostrar respuesta
            </button>
          </>
        )}
        
        <button
          onClick={handleNextWord}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Siguiente palabra →
        </button>
      </div>
    </div>
  );
}