'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/types/vocabulary';

export function useProgress() {
  const [progress, setProgress] = useState<Progress[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('chinese-practice-progress');
    if (stored) {
      setProgress(JSON.parse(stored));
    }
  }, []);

  const saveProgress = (updatedProgress: Progress[]) => {
    setProgress(updatedProgress);
    localStorage.setItem('chinese-practice-progress', JSON.stringify(updatedProgress));
  };

  const updateItemProgress = (itemId: string, correct: boolean) => {
    const existing = progress.find(p => p.itemId === itemId);
    const now = new Date();

    if (existing) {
      const updated = progress.map(p =>
        p.itemId === itemId
          ? {
              ...p,
              correctCount: correct ? p.correctCount + 1 : p.correctCount,
              incorrectCount: correct ? p.incorrectCount : p.incorrectCount + 1,
              lastPracticed: now
            }
          : p
      );
      saveProgress(updated);
    } else {
      const newProgress: Progress = {
        itemId,
        correctCount: correct ? 1 : 0,
        incorrectCount: correct ? 0 : 1,
        lastPracticed: now
      };
      saveProgress([...progress, newProgress]);
    }
  };

  const getItemProgress = (itemId: string): Progress | undefined => {
    return progress.find(p => p.itemId === itemId);
  };

  const resetProgress = () => {
    setProgress([]);
    localStorage.removeItem('chinese-practice-progress');
  };

  return {
    progress,
    updateItemProgress,
    getItemProgress,
    resetProgress
  };
}