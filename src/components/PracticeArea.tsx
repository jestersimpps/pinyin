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
      <div className="text-center py-8 sm:py-12">
        <p className="mb-4">
          {t.noWordsAvailable}
        </p>
        <p className="text-sm">
          {t.selectCategoryPrompt}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs sm:text-sm">
          <span>
            {practiceMode === 'sequential' && `${t.word} ${progress.current}/${progress.total}`}
            {practiceMode === 'random' && `${progress.current}/${progress.total} ${t.uniqueWords}`}
            {practiceMode === 'review' && `${progress.current}/${progress.total} ${t.reviewed}`}
          </span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <progress 
          className="progress progress-primary w-full" 
          value={progressPercentage} 
          max="100"
        />
      </div>

      {/* Main Character Display */}
      <div className="text-center space-y-2 sm:space-y-4">
        <div className="chinese-character font-bold">
          {currentWord.chinese}
        </div>
        
        {showTranslation && (
          <div className="text-base sm:text-lg md:text-xl">
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
            className={`input input-bordered w-full text-base sm:text-lg ${
              isCorrect === true
                ? 'input-success'
                : isCorrect === false
                ? 'input-error'
                : 'input-primary'
            } ${showAnswer ? 'opacity-50' : ''}`}
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
          <div className="alert alert-info">
            <div>
              <div className="text-sm mb-1">{t.correctAnswer}</div>
              <div className="text-lg sm:text-xl font-semibold">{currentWord.pinyin}</div>
              <div className="text-sm mt-2">{currentWord.english}</div>
              <div className="text-sm mt-3">
                {t.writeCorrectAnswer}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isCorrect === true && !showAnswer && (
          <div className="alert alert-success">
            <div className="font-semibold">¡Correcto! ✓</div>
          </div>
        )}
      </form>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
        {!showAnswer && !isCorrect && (
          <>
            <button
              onClick={handleShowHint}
              className="btn btn-warning btn-sm sm:btn-md"
              title="Mostrar pista"
            >
              💡 Pista
            </button>
            
            <button
              onClick={handleShowAnswer}
              className="btn btn-error btn-sm sm:btn-md"
            >
              Mostrar respuesta
            </button>
          </>
        )}
        
        <button
          onClick={handleNextWord}
          className="btn btn-primary btn-sm sm:btn-md"
        >
          Siguiente palabra →
        </button>
      </div>
    </div>
  );
}