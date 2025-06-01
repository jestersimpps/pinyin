'use client';

import { Progress } from '@/types/vocabulary';
import { vocabulary } from '@/data/vocabulary';

interface ProgressStatsProps {
  progress: Progress[];
}

export default function ProgressStats({ progress }: ProgressStatsProps) {
  const totalItems = vocabulary.length;
  const practicedItems = progress.length;
  const totalCorrect = progress.reduce((sum, p) => sum + p.correctCount, 0);
  const totalIncorrect = progress.reduce((sum, p) => sum + p.incorrectCount, 0);
  const totalAttempts = totalCorrect + totalIncorrect;
  const accuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-black">Your Progress</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-black text-sm font-medium">Characters Practiced</p>
          <p className="text-2xl font-bold text-black">{practicedItems} / {totalItems}</p>
        </div>
        <div>
          <p className="text-black text-sm font-medium">Correct Answers</p>
          <p className="text-2xl font-bold text-black">{totalCorrect}</p>
        </div>
        <div>
          <p className="text-black text-sm font-medium">Incorrect Answers</p>
          <p className="text-2xl font-bold text-black">{totalIncorrect}</p>
        </div>
        <div>
          <p className="text-black text-sm font-medium">Accuracy</p>
          <p className="text-2xl font-bold text-black">{accuracy}%</p>
        </div>
      </div>
    </div>
  );
}