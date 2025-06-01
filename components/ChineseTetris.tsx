'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { vocabulary } from '@/data/vocabulary';
import { VocabularyItem } from '@/types/vocabulary';
import { FallingCharacter, GameState, AnswerOption } from '@/types/game';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const ANSWER_ZONE_HEIGHT = 100;
const CHARACTER_SIZE = 60;
const INITIAL_SPEED = 1;
const SPEED_INCREMENT = 0.2;
const LIVES = 3;

export default function ChineseTetris() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isMounted, setIsMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: LIVES,
    streak: 0,
    isGameOver: false,
    isPaused: false
  });
  
  const [fallingCharacters, setFallingCharacters] = useState<FallingCharacter[]>([]);
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number>(-1);
  const [currentCharacter, setCurrentCharacter] = useState<FallingCharacter | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ type: 'correct' | 'incorrect', x: number, y: number } | null>(null);

  const getRandomVocabularyItem = useCallback((): VocabularyItem => {
    return vocabulary[Math.floor(Math.random() * vocabulary.length)];
  }, []);

  const generateAnswerOptions = useCallback((correctItem: VocabularyItem): AnswerOption[] => {
    const options: AnswerOption[] = [
      {
        id: correctItem.id,
        text: correctItem.pinyin,
        isCorrect: true,
        position: 0
      }
    ];

    const incorrectItems = vocabulary
      .filter(item => item.id !== correctItem.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    incorrectItems.forEach((item, index) => {
      options.push({
        id: item.id,
        text: item.pinyin,
        isCorrect: false,
        position: index + 1
      });
    });

    return options.sort(() => Math.random() - 0.5).map((opt, idx) => ({ ...opt, position: idx }));
  }, []);

  const spawnNewCharacter = useCallback(() => {
    const item = getRandomVocabularyItem();
    const newCharacter: FallingCharacter = {
      ...item,
      x: Math.random() * (GAME_WIDTH - CHARACTER_SIZE),
      y: 0,
      speed: INITIAL_SPEED + (gameState.level - 1) * SPEED_INCREMENT,
      matched: false
    };
    
    setCurrentCharacter(newCharacter);
    setFallingCharacters(prev => [...prev, newCharacter]);
    setAnswerOptions(generateAnswerOptions(item));
    setSelectedAnswer(-1);
  }, [gameState.level, getRandomVocabularyItem, generateAnswerOptions]);

  const checkAnswer = useCallback((answerIndex: number) => {
    if (!currentCharacter || gameState.isGameOver || gameState.isPaused || gameState.lives <= 0) return;

    const selectedOption = answerOptions[answerIndex];
    const characterY = fallingCharacters.find(char => char.id === currentCharacter.id)?.y || 0;

    if (selectedOption.isCorrect) {
      setShowFeedback({ type: 'correct', x: GAME_WIDTH / 2, y: characterY });
      setGameState(prev => ({
        ...prev,
        score: prev.score + 100 * prev.level + (prev.streak * 10),
        streak: prev.streak + 1
      }));
      
      setFallingCharacters(prev => 
        prev.map(char => 
          char.id === currentCharacter.id ? { ...char, matched: true } : char
        )
      );
      
      setTimeout(() => {
        setFallingCharacters(prev => prev.filter(char => char.id !== currentCharacter.id));
        spawnNewCharacter();
        setShowFeedback(null);
      }, 500);
    } else {
      setShowFeedback({ type: 'incorrect', x: GAME_WIDTH / 2, y: characterY });
      const newLives = Math.max(0, gameState.lives - 1);
      setGameState(prev => ({
        ...prev,
        lives: newLives,
        streak: 0,
        isGameOver: newLives === 0
      }));
      
      setTimeout(() => {
        setShowFeedback(null);
      }, 500);
    }
  }, [currentCharacter, answerOptions, fallingCharacters, gameState.isGameOver, gameState.isPaused, gameState.lives, spawnNewCharacter]);

  const updateGame = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    setFallingCharacters(prev => {
      const updated = prev.map(char => ({
        ...char,
        y: char.matched ? char.y : char.y + char.speed
      }));

      const missed = updated.filter(char => !char.matched && char.y > GAME_HEIGHT - ANSWER_ZONE_HEIGHT);
      if (missed.length > 0 && missed.some(char => char.id === currentCharacter?.id)) {
        const newLives = Math.max(0, gameState.lives - 1);
        setGameState(prev => ({
          ...prev,
          lives: newLives,
          streak: 0,
          isGameOver: newLives === 0
        }));
        
        if (newLives > 0) {
          spawnNewCharacter();
        }
        
        return updated.filter(char => !missed.includes(char));
      }

      return updated;
    });

    if (gameState.score > 0 && gameState.score % 500 === 0) {
      setGameState(prev => ({
        ...prev,
        level: Math.floor(prev.score / 500) + 1
      }));
    }
  }, [gameState.isGameOver, gameState.isPaused, gameState.lives, gameState.score, currentCharacter, spawnNewCharacter]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, GAME_HEIGHT - ANSWER_ZONE_HEIGHT, GAME_WIDTH, ANSWER_ZONE_HEIGHT);

    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT - ANSWER_ZONE_HEIGHT);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - ANSWER_ZONE_HEIGHT);
    ctx.stroke();

    fallingCharacters.forEach(char => {
      ctx.fillStyle = char.matched ? '#10b981' : '#1f2937';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char.chinese, char.x + CHARACTER_SIZE / 2, char.y + CHARACTER_SIZE / 2);
    });

    if (showFeedback) {
      ctx.fillStyle = showFeedback.type === 'correct' ? '#10b981' : '#ef4444';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        showFeedback.type === 'correct' ? 'Correct! ✓' : 'Incorrect! ✗',
        showFeedback.x,
        showFeedback.y
      );
    }

    if (gameState.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
      ctx.font = '32px sans-serif';
      ctx.fillText(`Final Score: ${gameState.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
    }
  }, [fallingCharacters, showFeedback, gameState.isGameOver, gameState.score]);

  const gameLoop = useCallback(() => {
    updateGame();
    draw();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, draw]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!gameState.isGameOver && !gameState.isPaused && isMounted) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop, gameState.isGameOver, gameState.isPaused, isMounted]);

  useEffect(() => {
    if (fallingCharacters.length === 0 && !gameState.isGameOver && isMounted) {
      spawnNewCharacter();
    }
  }, [fallingCharacters.length, gameState.isGameOver, spawnNewCharacter, isMounted]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState.isGameOver) return;
    
    if (e.key === ' ') {
      e.preventDefault();
      setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
      return;
    }

    const keyNum = parseInt(e.key);
    if (keyNum >= 1 && keyNum <= 4 && keyNum <= answerOptions.length) {
      setSelectedAnswer(keyNum - 1);
      checkAnswer(keyNum - 1);
    }
  }, [gameState.isGameOver, answerOptions.length, checkAnswer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const resetGame = () => {
    setGameState({
      score: 0,
      level: 1,
      lives: LIVES,
      streak: 0,
      isGameOver: false,
      isPaused: false
    });
    setFallingCharacters([]);
    setCurrentCharacter(null);
    setAnswerOptions([]);
    setSelectedAnswer(-1);
    setShowFeedback(null);
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center p-4">
        <div className="text-2xl text-black">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 flex gap-8">
        <div className="text-center">
          <p className="text-sm font-medium text-black">Score</p>
          <p className="text-2xl font-bold text-black">{gameState.score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-black">Level</p>
          <p className="text-2xl font-bold text-black">{gameState.level}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-black">Lives</p>
          <p className="text-2xl font-bold text-black">{'❤️'.repeat(Math.max(0, gameState.lives))}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-black">Streak</p>
          <p className="text-2xl font-bold text-black">{gameState.streak}</p>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="border-2 border-gray-300 rounded-lg shadow-lg"
        />
        
        {gameState.isPaused && !gameState.isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <p className="text-white text-4xl font-bold">PAUSED</p>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 w-full max-w-2xl">
        {answerOptions.map((option, index) => (
          <button
            key={option.id}
            onClick={() => {
              setSelectedAnswer(index);
              checkAnswer(index);
            }}
            disabled={gameState.isGameOver || gameState.isPaused}
            className={`p-4 rounded-lg font-medium transition-all shadow-md hover:shadow-lg ${
              selectedAnswer === index
                ? option.isCorrect
                  ? 'bg-green-600 text-white border-2 border-green-700'
                  : 'bg-red-600 text-white border-2 border-red-700'
                : 'bg-white border-2 border-gray-300 hover:border-gray-500 text-black hover:bg-gray-50'
            } ${gameState.isGameOver || gameState.isPaused ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`text-sm font-bold ${
              selectedAnswer === index ? 'text-white' : 'text-black'
            }`}>{index + 1}</span>
            <p className={`mt-1 text-lg ${
              selectedAnswer === index ? 'text-white' : 'text-black'
            }`}>{option.text}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-4">
        {gameState.isGameOver ? (
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Play Again
          </button>
        ) : (
          <button
            onClick={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            {gameState.isPaused ? 'Resume' : 'Pause'} (Space)
          </button>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-black font-medium">
        <p>Press numbers 1-4 or click the options to answer</p>
        <p>Press spacebar to pause</p>
      </div>
    </div>
  );
}