'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { vocabulary } from '@/data/vocabulary';
import { VocabularyItem } from '@/types/vocabulary';

interface GameStats {
  score: number;
  wordsCompleted: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  startTime: number | null;
  wpm: number;
  accuracy: number;
  streak: number;
  bestStreak: number;
}

interface PowerUp {
  type: 'slowmo' | 'hint' | 'skip';
  count: number;
  active?: boolean;
  activeUntil?: number;
}

const RACE_DURATIONS = [60, 300, 600]; // 1 min, 5 min, 10 min
const SLOWMO_DURATION = 5000; // 5 seconds
const HINT_PENALTY = 50; // points
const SKIP_PENALTY = 100; // points
const BASE_POINTS = 100;
const STREAK_MULTIPLIER = 10;
const WPM_BONUS_MULTIPLIER = 2;

// Function to remove tone marks from pinyin
const removeTones = (pinyin: string): string => {
  return pinyin
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'ü')
    .replace(/[ńň]/g, 'n')
    .replace(/'/g, ' ') // Replace apostrophe with space
    .toLowerCase();
};

export default function PinyinTypingRace() {
  const [currentWord, setCurrentWord] = useState<VocabularyItem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showFeedback, setShowFeedback] = useState<{ type: 'correct' | 'incorrect' | 'skip', message: string } | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    wordsCompleted: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    startTime: null,
    wpm: 0,
    accuracy: 100,
    streak: 0,
    bestStreak: 0
  });
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    { type: 'slowmo', count: 3 },
    { type: 'hint', count: 3 },
    { type: 'skip', count: 3 }
  ]);
  const [showHint, setShowHint] = useState(false);
  const [isSlowMoActive, setIsSlowMoActive] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const selectNewWord = useCallback(() => {
    const newWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    setCurrentWord(newWord);
    setUserInput('');
    setShowHint(false);
    setShowCorrectAnswer(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const calculateWPM = useCallback(() => {
    if (!gameStats.startTime || gameStats.wordsCompleted === 0) return 0;
    const timeElapsed = (Date.now() - gameStats.startTime) / 1000 / 60; // in minutes
    return Math.round(gameStats.wordsCompleted / timeElapsed);
  }, [gameStats.startTime, gameStats.wordsCompleted]);

  const calculateAccuracy = useCallback(() => {
    if (gameStats.totalKeystrokes === 0) return 100;
    return Math.round((gameStats.correctKeystrokes / gameStats.totalKeystrokes) * 100);
  }, [gameStats.correctKeystrokes, gameStats.totalKeystrokes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toLowerCase();
    setUserInput(input);
    
    if (currentWord && input.length > 0) {
      // Check both with tones and without tones
      const pinyinWithTones = currentWord.pinyin.toLowerCase().replace(/'/g, ' ');
      const pinyinWithoutTones = removeTones(currentWord.pinyin);
      const inputWithoutTones = removeTones(input);
      const trimmedInput = input.trim();
      const trimmedInputWithoutTones = removeTones(trimmedInput);
      
      let isCorrectSoFar = pinyinWithTones.startsWith(trimmedInput) || pinyinWithoutTones.startsWith(trimmedInputWithoutTones);
      
      // If we're showing the correct answer, check if they're typing it correctly
      if (showCorrectAnswer) {
        isCorrectSoFar = pinyinWithTones.startsWith(trimmedInput) || pinyinWithoutTones.startsWith(trimmedInputWithoutTones);
      }
      
      setGameStats(prev => ({
        ...prev,
        totalKeystrokes: prev.totalKeystrokes + 1,
        correctKeystrokes: isCorrectSoFar ? prev.correctKeystrokes + 1 : prev.correctKeystrokes
      }));

      if (trimmedInput === pinyinWithTones || trimmedInputWithoutTones === pinyinWithoutTones) {
        if (showCorrectAnswer) {
          // They typed the answer correctly after being shown it
          setShowFeedback({ type: 'correct', message: 'Good!' });
          setTimeout(() => {
            setShowFeedback(null);
            selectNewWord();
          }, 500);
        } else {
          handleCorrectAnswer();
        }
      } else if (!isCorrectSoFar && input.length >= 2 && !showCorrectAnswer) {
        // If user has typed at least 2 characters and it's wrong, show correct answer
        handleIncorrectAnswer();
      }
    }
  };

  const handleIncorrectAnswer = useCallback(() => {
    if (!currentWord) return;

    setGameStats(prev => ({
      ...prev,
      streak: 0
    }));

    setShowCorrectAnswer(true);
    setUserInput('');
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWord]);

  const handleCorrectAnswer = useCallback(() => {
    if (!currentWord) return;

    const newStreak = gameStats.streak + 1;
    const points = BASE_POINTS + (newStreak * STREAK_MULTIPLIER) + (calculateWPM() * WPM_BONUS_MULTIPLIER);
    
    setGameStats(prev => ({
      ...prev,
      score: prev.score + points,
      wordsCompleted: prev.wordsCompleted + 1,
      streak: newStreak,
      bestStreak: Math.max(newStreak, prev.bestStreak),
      wpm: calculateWPM(),
      accuracy: calculateAccuracy()
    }));

    setShowFeedback({ type: 'correct', message: `+${points} points!` });
    setTimeout(() => {
      setShowFeedback(null);
      selectNewWord();
    }, 1000);
  }, [currentWord, gameStats.streak, calculateWPM, calculateAccuracy, selectNewWord]);

  const usePowerUp = useCallback((type: 'slowmo' | 'hint' | 'skip') => {
    const powerUp = powerUps.find(p => p.type === type);
    if (!powerUp || powerUp.count === 0 || !isPlaying) return;

    setPowerUps(prev => prev.map(p => 
      p.type === type ? { ...p, count: p.count - 1 } : p
    ));

    switch (type) {
      case 'slowmo':
        setIsSlowMoActive(true);
        setTimeout(() => setIsSlowMoActive(false), SLOWMO_DURATION);
        break;
      case 'hint':
        setShowHint(true);
        setGameStats(prev => ({ ...prev, score: Math.max(0, prev.score - HINT_PENALTY) }));
        break;
      case 'skip':
        setGameStats(prev => ({ 
          ...prev, 
          score: Math.max(0, prev.score - SKIP_PENALTY),
          streak: 0 
        }));
        setShowFeedback({ type: 'skip', message: `-${SKIP_PENALTY} points` });
        setTimeout(() => {
          setShowFeedback(null);
          selectNewWord();
        }, 500);
        break;
    }
  }, [powerUps, isPlaying, selectNewWord]);

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(selectedDuration);
    setGameStats({
      score: 0,
      wordsCompleted: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      startTime: Date.now(),
      wpm: 0,
      accuracy: 100,
      streak: 0,
      bestStreak: 0
    });
    setPowerUps([
      { type: 'slowmo', count: 3 },
      { type: 'hint', count: 3 },
      { type: 'skip', count: 3 }
    ]);
    selectNewWord();
  };

  const endGame = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - (isSlowMoActive ? 0.5 : 1);
        });
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, timeLeft, isSlowMoActive]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setGameStats(prev => ({
          ...prev,
          wpm: calculateWPM(),
          accuracy: calculateAccuracy()
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, calculateWPM, calculateAccuracy]);

  if (!isPlaying && gameStats.wordsCompleted === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-center mb-4 text-black">Pinyin Typing Race</h2>
          <p className="text-center mb-6 text-black">Type the pinyin for Chinese characters as fast as you can!</p>
          
          <div className="space-y-4 mb-6">
            <div className="text-center mb-4">
              <p className="font-medium text-black mb-2">Select Race Duration:</p>
              <div className="flex justify-center gap-2">
                {RACE_DURATIONS.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedDuration === duration
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-black hover:bg-gray-300'
                    }`}
                  >
                    {duration === 60 ? '1 min' : duration === 300 ? '5 min' : '10 min'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <span className="font-medium text-black">🎯 Scoring:</span>
              <span className="text-black">Base points + Streak bonus + WPM bonus</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
              <span className="font-medium text-black">💎 Power-ups:</span>
              <span className="text-black">Slow-Mo, Hint, Skip (3 each)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
              <span className="font-medium text-black">🌐 Show Translation:</span>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  showTranslation
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-400 text-white'
                }`}
              >
                {showTranslation ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Race
          </button>
        </div>
      </div>
    );
  }

  if (!isPlaying && gameStats.wordsCompleted > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-center mb-6 text-black">Race Complete!</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-black">Final Score</p>
              <p className="text-3xl font-bold text-black">{gameStats.score}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-black">Words Completed</p>
              <p className="text-3xl font-bold text-black">{gameStats.wordsCompleted}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-black">WPM</p>
              <p className="text-3xl font-bold text-black">{gameStats.wpm}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-black">Accuracy</p>
              <p className="text-3xl font-bold text-black">{gameStats.accuracy}%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center col-span-2">
              <p className="text-sm font-medium text-black">Best Streak</p>
              <p className="text-3xl font-bold text-black">🔥 {gameStats.bestStreak}</p>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="font-medium text-black mb-2">Settings for Next Race:</p>
            <div className="flex justify-center gap-2 mb-3">
              {RACE_DURATIONS.map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedDuration === duration
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {duration === 60 ? '1 min' : duration === 300 ? '5 min' : '10 min'}
                </button>
              ))}
            </div>
            <div className="flex justify-center items-center gap-2">
              <span className="text-sm font-medium text-black">Show Translation:</span>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  showTranslation
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-400 text-white'
                }`}
              >
                {showTranslation ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            Race Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      {/* Stats Bar */}
      <div className="bg-white shadow-md rounded-lg p-4 w-full mb-6">
        <div className="grid grid-cols-5 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-black">Time</p>
            <p className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-black'} ${isSlowMoActive ? 'animate-pulse' : ''}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-black">Score</p>
            <p className="text-2xl font-bold text-black">{gameStats.score}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-black">WPM</p>
            <p className="text-2xl font-bold text-black">{gameStats.wpm}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-black">Accuracy</p>
            <p className="text-2xl font-bold text-black">{gameStats.accuracy}%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-black">Streak</p>
            <p className="text-2xl font-bold text-orange-600">🔥 {gameStats.streak}</p>
          </div>
        </div>
      </div>

      {/* Power-ups */}
      <div className="flex gap-2 mb-6">
        {powerUps.map((powerUp) => (
          <button
            key={powerUp.type}
            onClick={() => usePowerUp(powerUp.type)}
            disabled={powerUp.count === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              powerUp.count > 0
                ? 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {powerUp.type === 'slowmo' && '⏱️ Slow-Mo'}
            {powerUp.type === 'hint' && '💡 Hint'}
            {powerUp.type === 'skip' && '⏭️ Skip'}
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
              {powerUp.count}
            </span>
          </button>
        ))}
      </div>

      {/* Game Area */}
      {currentWord && (
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <p className="text-8xl font-bold mb-4 text-black">{currentWord.chinese}</p>
            {showTranslation && (
              <p className="text-xl text-black mb-2">{currentWord.english}</p>
            )}
            {showHint && (
              <p className="text-lg text-purple-600 font-medium animate-pulse">
                Hint: {removeTones(currentWord.pinyin).slice(0, Math.ceil(currentWord.pinyin.length / 2))}... (tones optional)
              </p>
            )}
            {showCorrectAnswer && (
              <div className="mt-4">
                <p className="text-lg text-red-600 font-bold">Correct answer: {currentWord.pinyin}</p>
                <p className="text-md text-gray-700 mt-1">({currentWord.english})</p>
                <p className="text-sm text-gray-600 mt-2">Type it to continue</p>
              </div>
            )}
          </div>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && userInput.length > 0 && !showCorrectAnswer) {
                  // If user presses Enter, treat it as giving up and show answer
                  handleIncorrectAnswer();
                }
              }}
              className="w-full px-6 py-4 text-2xl text-center border-4 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black"
              placeholder="Type pinyin here..."
              autoComplete="off"
              spellCheck={false}
            />
            
            {/* Visual feedback for correct/incorrect typing */}
            {userInput.length > 0 && currentWord && (
              <div className="absolute top-full mt-2 left-0 right-0 text-center">
                {(() => {
                  const pinyinWithTones = currentWord.pinyin.toLowerCase().replace(/'/g, ' ');
                  const pinyinWithoutTones = removeTones(currentWord.pinyin);
                  const trimmedInput = userInput.trim().toLowerCase();
                  const inputWithoutTones = removeTones(trimmedInput);
                  
                  return pinyinWithTones.startsWith(trimmedInput) || pinyinWithoutTones.startsWith(inputWithoutTones) ? (
                    <span className="text-green-600 font-medium">✓ Keep going!</span>
                  ) : (
                    <span className="text-red-600 font-medium">✗ Check your spelling</span>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {showFeedback && (
        <div
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            px-8 py-4 rounded-lg font-bold text-2xl animate-bounce z-50 ${
            showFeedback.type === 'correct' ? 'bg-green-600 text-white' : 
            showFeedback.type === 'skip' ? 'bg-orange-600 text-white' : 
            'bg-red-600 text-white'
          }`}
        >
          {showFeedback.message}
        </div>
      )}
    </div>
  );
}