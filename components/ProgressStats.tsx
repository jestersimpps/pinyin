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
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Tu progreso</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-gray-700 text-sm font-medium">Caracteres practicados</p>
          <p className="text-2xl font-bold text-gray-900">{practicedItems} / {totalItems}</p>
        </div>
        <div>
          <p className="text-gray-700 text-sm font-medium">Respuestas correctas</p>
          <p className="text-2xl font-bold text-green-700">{totalCorrect}</p>
        </div>
        <div>
          <p className="text-gray-700 text-sm font-medium">Respuestas incorrectas</p>
          <p className="text-2xl font-bold text-red-700">{totalIncorrect}</p>
        </div>
        <div>
          <p className="text-gray-700 text-sm font-medium">Precisión</p>
          <p className="text-2xl font-bold text-blue-700">{accuracy}%</p>
        </div>
      </div>
    </div>
  );
}