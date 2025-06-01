'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { vocabulary } from '@/data/vocabulary';
import { VocabularyItem } from '@/types/vocabulary';

interface PinyinButton {
  id: string;
  text: string;
  x: number;
  y: number;
  isCorrect: boolean;
  isClicked: boolean;
}

interface GameStats {
  score: number;
  round: number;
  totalTime: number;
  streak: number;
  correctAnswers: number;
  averageTime: number;
}

const GAME_AREA_PADDING = 100;
const BUTTON_WIDTH = 120;
const BUTTON_HEIGHT = 50;
const DECOY_COUNT = 15;
const TIME_BONUS_THRESHOLD = 2000; // 2 seconds
const BASE_POINTS = 100;
const SPEED_BONUS_MAX = 200;

export default function PinyinHunter() {
  const [currentItem, setCurrentItem] = useState<VocabularyItem | null>(null);
  const [pinyinButtons, setPinyinButtons] = useState<PinyinButton[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    round: 1,
    totalTime: 0,
    streak: 0,
    correctAnswers: 0,
    averageTime: 0
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFeedback, setShowFeedback] = useState<{
    show: boolean;
    correct: boolean;
    x: number;
    y: number;
    points: number;
  }>({ show: false, correct: false, x: 0, y: 0, points: 0 });
  const [gameAreaSize, setGameAreaSize] = useState({ width: 0, height: 0 });
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const startTimeRef = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timesRef = useRef<number[]>([]);

  useEffect(() => {
    const updateSize = () => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        setGameAreaSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    // Initial size update with delay
    setTimeout(updateSize, 100);
    
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getRandomPosition = useCallback((existingPositions: { x: number; y: number }[]) => {
    if (!gameAreaSize.width || !gameAreaSize.height) {
      return { x: 100, y: 300 };
    }
    
    let attempts = 0;
    let position;
    
    do {
      position = {
        x: 20 + Math.random() * Math.max(100, gameAreaSize.width - BUTTON_WIDTH - 40),
        y: 20 + Math.random() * Math.max(100, gameAreaSize.height - BUTTON_HEIGHT - 40)
      };
      attempts++;
    } while (
      attempts < 50 && 
      existingPositions.some(pos => 
        Math.abs(pos.x - position.x) < BUTTON_WIDTH + 20 && 
        Math.abs(pos.y - position.y) < BUTTON_HEIGHT + 20
      )
    );
    
    return position;
  }, [gameAreaSize]);

  const generateNewRound = useCallback(() => {
    const item = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    setCurrentItem(item);

    const positions: { x: number; y: number }[] = [];
    const buttons: PinyinButton[] = [];

    // Add correct answer
    const correctPos = getRandomPosition(positions);
    positions.push(correctPos);
    buttons.push({
      id: item.id,
      text: item.pinyin,
      x: correctPos.x,
      y: correctPos.y,
      isCorrect: true,
      isClicked: false
    });

    // Add decoys
    const decoyItems = vocabulary
      .filter(v => v.id !== item.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, DECOY_COUNT);

    decoyItems.forEach((decoyItem, index) => {
      const pos = getRandomPosition(positions);
      positions.push(pos);
      buttons.push({
        id: `decoy-${index}`,
        text: decoyItem.pinyin,
        x: pos.x,
        y: pos.y,
        isCorrect: false,
        isClicked: false
      });
    });

    setPinyinButtons(buttons);
    startTimeRef.current = Date.now();
  }, [getRandomPosition, gameAreaSize]);

  const handlePinyinClick = useCallback((button: PinyinButton, event: React.MouseEvent) => {
    if (!isPlaying || button.isClicked) return;

    const clickTime = Date.now() - startTimeRef.current;
    const rect = event.currentTarget.getBoundingClientRect();
    
    if (button.isCorrect) {
      // Calculate score based on speed
      const speedBonus = Math.max(0, Math.floor(
        SPEED_BONUS_MAX * (1 - Math.min(clickTime / TIME_BONUS_THRESHOLD, 1))
      ));
      const roundScore = BASE_POINTS + speedBonus + (gameStats.streak * 10);
      
      timesRef.current.push(clickTime);
      const avgTime = timesRef.current.reduce((a, b) => a + b, 0) / timesRef.current.length;

      setGameStats(prev => ({
        score: prev.score + roundScore,
        round: prev.round + 1,
        totalTime: prev.totalTime + clickTime,
        streak: prev.streak + 1,
        correctAnswers: prev.correctAnswers + 1,
        averageTime: avgTime
      }));

      setShowFeedback({
        show: true,
        correct: true,
        x: rect.left + rect.width / 2,
        y: rect.top,
        points: roundScore
      });

      setPinyinButtons(prev => prev.map(b => 
        b.id === button.id ? { ...b, isClicked: true } : b
      ));

      setTimeout(() => {
        generateNewRound();
        setShowFeedback({ show: false, correct: false, x: 0, y: 0, points: 0 });
      }, 1000);
    } else {
      setGameStats(prev => ({
        ...prev,
        streak: 0
      }));

      setShowFeedback({
        show: true,
        correct: false,
        x: rect.left + rect.width / 2,
        y: rect.top,
        points: -50
      });

      setPinyinButtons(prev => prev.map(b => 
        b.id === button.id ? { ...b, isClicked: true } : b
      ));

      setTimeout(() => {
        setShowFeedback({ show: false, correct: false, x: 0, y: 0, points: 0 });
      }, 500);
    }
  }, [isPlaying, gameStats.streak, generateNewRound]);

  const startGame = useCallback(() => {
    setCountdown(3);
    const countInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countInterval);
          setIsPlaying(true);
          return null;
        }
        return (prev || 0) - 1;
      });
    }, 1000);

    setGameStats({
      score: 0,
      round: 1,
      totalTime: 0,
      streak: 0,
      correctAnswers: 0,
      averageTime: 0
    });
    timesRef.current = [];
  }, [generateNewRound]);

  const stopGame = () => {
    setIsPlaying(false);
    setCurrentItem(null);
    setPinyinButtons([]);
  };

  useEffect(() => {
    if (isPlaying) {
      // Update size when game starts
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        setGameAreaSize({
          width: rect.width,
          height: rect.height
        });
      }
      
      if (pinyinButtons.length === 0) {
        // Small delay to ensure DOM is ready
        setTimeout(() => generateNewRound(), 200);
      }
    }
  }, [isPlaying, pinyinButtons.length, generateNewRound]);

  if (!isPlaying && !countdown) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
        <h2 className="text-3xl font-bold mb-4 text-black">Pinyin Hunter</h2>
        <p className="text-lg text-black mb-2">Find the correct pinyin as fast as possible!</p>
        <p className="text-black mb-8">The faster you click, the more points you earn.</p>
        
        {gameStats.round > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-black">Last Game Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-black">Final Score</p>
                <p className="text-2xl font-bold text-black">{gameStats.score}</p>
              </div>
              <div>
                <p className="text-black">Rounds Played</p>
                <p className="text-2xl font-bold text-black">{gameStats.round - 1}</p>
              </div>
              <div>
                <p className="text-black">Accuracy</p>
                <p className="text-2xl font-bold text-black">
                  {gameStats.round > 1 
                    ? Math.round((gameStats.correctAnswers / (gameStats.round - 1)) * 100) 
                    : 0}%
                </p>
              </div>
              <div>
                <p className="text-black">Avg Response Time</p>
                <p className="text-2xl font-bold text-black">
                  {(gameStats.averageTime / 1000).toFixed(2)}s
                </p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={startGame}
          className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[700px]">
      {/* Game Stats Bar */}
      <div className="bg-white shadow-md p-4 z-10">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div className="flex gap-8">
            <div>
              <span className="text-black text-sm">Score</span>
              <p className="text-2xl font-bold text-black">{gameStats.score}</p>
            </div>
            <div>
              <span className="text-black text-sm">Round</span>
              <p className="text-2xl font-bold text-black">{gameStats.round}</p>
            </div>
            <div>
              <span className="text-black text-sm">Streak</span>
              <p className="text-2xl font-bold text-black">🔥 {gameStats.streak}</p>
            </div>
            <div>
              <span className="text-black text-sm">Avg Time</span>
              <p className="text-2xl font-bold text-black">{(gameStats.averageTime / 1000).toFixed(2)}s</p>
            </div>
          </div>
          <button
            onClick={stopGame}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700"
          >
            End Game
          </button>
        </div>
      </div>

      {/* Countdown */}
      {countdown !== null && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-8xl font-bold animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {/* Current Character Display */}
      {currentItem && isPlaying && (
        <div className="bg-white shadow-lg p-6 mx-auto mb-4">
          <p className="text-sm text-black mb-2 text-center">Find the pinyin for:</p>
          <p className="text-6xl font-bold text-center text-black">{currentItem.chinese}</p>
        </div>
      )}

      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="relative flex-1 bg-gray-100 overflow-hidden"
      >
        {isPlaying && pinyinButtons.map((button) => (
          <button
            key={button.id}
            onClick={(e) => handlePinyinClick(button, e)}
            className={`absolute px-4 py-2 rounded-lg font-semibold text-lg transition-all transform hover:scale-110 ${
              button.isClicked
                ? button.isCorrect
                  ? 'bg-green-600 text-white border-2 border-green-700'
                  : 'bg-red-600 text-white opacity-50 border-2 border-red-700'
                : 'bg-white text-black border-2 border-gray-400 hover:border-blue-600 hover:shadow-xl shadow-md'
            }`}
            style={{
              position: 'absolute',
              left: `${button.x}px`,
              top: `${button.y}px`,
              width: `${BUTTON_WIDTH}px`,
              height: `${BUTTON_HEIGHT}px`,
              cursor: button.isClicked ? 'default' : 'pointer',
              zIndex: 10
            }}
            disabled={button.isClicked}
          >
            {button.text}
          </button>
        ))}
      </div>

      {/* Feedback Animation */}
      {showFeedback.show && (
        <div
          className={`fixed z-50 font-bold text-2xl pointer-events-none animate-bounce ${
            showFeedback.correct ? 'text-green-600' : 'text-red-600'
          }`}
          style={{
            left: `${showFeedback.x}px`,
            top: `${showFeedback.y - 50}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {showFeedback.correct ? `+${showFeedback.points}` : showFeedback.points}
        </div>
      )}
    </div>
  );
}