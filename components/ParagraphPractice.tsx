'use client';

import { useState, useEffect, useRef } from 'react';
import { hsk1Vocabulary, hsk2Vocabulary, hsk3Vocabulary, hsk4Vocabulary } from '@/data/vocabulary';
import { VocabularyItem } from '@/types/vocabulary';
import { generateParagraph } from '@/app/actions/generate-paragraph';

interface ParagraphWord {
  chinese: string;
  pinyin: string;
  english?: string;
  position: number;
}

const removeTones = (pinyin: string): string => {
  return pinyin
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'ü')
    .replace(/[ńň]/g, 'n')
    .replace(/'/g, ' ')
    .toLowerCase();
};

const normalizeForComparison = (text: string): string => {
  // Remove tones first
  const noTones = removeTones(text);
  // Remove all punctuation and special characters, keep only letters and spaces
  return noTones
    .replace(/[^\w\s\u4e00-\u9fff]/g, '') // Remove punctuation but keep Chinese characters
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .trim();
};

export default function ParagraphPractice() {
  const [hskLevel, setHskLevel] = useState<'hsk1' | 'hsk2' | 'hsk3' | 'hsk4' | 'hsk1-2' | 'hsk1-3' | 'hsk1-4'>('hsk1');
  const [paragraph, setParagraph] = useState<string>('');
  const [paragraphWords, setParagraphWords] = useState<ParagraphWord[]>([]);
  const [pinyinAnswer, setPinyinAnswer] = useState<string>('');
  const [userInput, setUserInput] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getVocabularyForLevel = () => {
    let vocabToUse: VocabularyItem[] = [];
    
    if (hskLevel === 'hsk1') {
      vocabToUse = hsk1Vocabulary;
    } else if (hskLevel === 'hsk2') {
      vocabToUse = hsk2Vocabulary;
    } else if (hskLevel === 'hsk3') {
      vocabToUse = hsk3Vocabulary;
    } else if (hskLevel === 'hsk4') {
      vocabToUse = hsk4Vocabulary;
    } else if (hskLevel === 'hsk1-2') {
      vocabToUse = [...hsk1Vocabulary, ...hsk2Vocabulary];
    } else if (hskLevel === 'hsk1-3') {
      vocabToUse = [...hsk1Vocabulary, ...hsk2Vocabulary, ...hsk3Vocabulary];
    } else if (hskLevel === 'hsk1-4') {
      vocabToUse = [...hsk1Vocabulary, ...hsk2Vocabulary, ...hsk3Vocabulary, ...hsk4Vocabulary];
    }
    
    return vocabToUse;
  };

  const generateNewParagraph = async () => {
    setIsLoading(true);
    setShowAnswers(false);
    setUserInput('');
    setPinyinAnswer('');
    setCompletedCount(0);
    setIsCompleted(false);
    setCompletedWords(new Set());
    
    try {
      const vocabulary = getVocabularyForLevel();
      // Select 5-8 random words from the vocabulary
      const wordCount = Math.floor(Math.random() * 4) + 5;
      const selectedWords = vocabulary
        .sort(() => Math.random() - 0.5)
        .slice(0, wordCount);
      
      const result = await generateParagraph(selectedWords, hskLevel);
      setParagraph(result.paragraph);
      setParagraphWords(result.words);
      setPinyinAnswer(result.pinyinAnswer || '');
      
      // Debug: log what we received
      console.log('Generated paragraph:', result.paragraph);
      console.log('Pinyin answer:', result.pinyinAnswer);
      console.log('Words:', result.words);
      
      // Focus textarea after generating
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    } catch (error) {
      console.error('Error generating paragraph:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Build the expected pinyin string (what the user should type)
  const getExpectedPinyin = () => {
    // Use the AI-generated pinyin answer if available
    if (pinyinAnswer) {
      return pinyinAnswer;
    }
    
    // Fallback to the old method (which was incomplete)
    if (!paragraph || paragraphWords.length === 0) return '';
    
    let result = '';
    let lastPosition = 0;
    
    paragraphWords.forEach(word => {
      // Add non-Chinese text as-is
      result += paragraph.substring(lastPosition, word.position);
      // Add pinyin for the Chinese word
      result += word.pinyin;
      lastPosition = word.position + word.chinese.length;
    });
    
    // Add remaining text
    result += paragraph.substring(lastPosition);
    
    return result;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setUserInput(input);
    
    if (showAnswers || isCompleted) return;
    
    // Check if input matches the expected pinyin
    const expectedPinyin = getExpectedPinyin();
    const normalizedExpected = normalizeForComparison(expectedPinyin);
    const normalizedInput = normalizeForComparison(input);
    
    // Track completed words based on progress through the pinyin
    const newCompletedWords = new Set<number>();
    
    if (paragraphWords.length > 0 && pinyinAnswer) {
      // For each word, find where its pinyin appears in the full answer
      let searchStartPos = 0;
      
      paragraphWords.forEach((word, index) => {
        // Find this word's pinyin in the answer (starting from where we left off)
        const wordPos = pinyinAnswer.toLowerCase().indexOf(word.pinyin.toLowerCase(), searchStartPos);
        
        if (wordPos !== -1) {
          // Calculate normalized position
          const beforeWord = pinyinAnswer.substring(0, wordPos + word.pinyin.length);
          const beforeWordNormalized = normalizeForComparison(beforeWord);
          
          // Check if user has typed this far
          if (normalizedInput.length >= beforeWordNormalized.length) {
            // Verify the input matches up to this point
            const inputPrefix = normalizedInput.substring(0, beforeWordNormalized.length);
            const expectedPrefix = normalizeForComparison(expectedPinyin).substring(0, beforeWordNormalized.length);
            
            if (inputPrefix === expectedPrefix) {
              newCompletedWords.add(index);
            }
          }
          
          // Move search position forward
          searchStartPos = wordPos + word.pinyin.length;
        }
      });
    }
    
    setCompletedWords(newCompletedWords);
    setCompletedCount(newCompletedWords.size);
    
    // Check for match (ignoring tones and punctuation)
    if (normalizedInput === normalizedExpected) {
      setIsCompleted(true);
      setCompletedCount(paragraphWords.length);
    }
  };

  // Get feedback for current input
  const getFeedback = () => {
    if (!paragraph || paragraphWords.length === 0 || showAnswers || isCompleted) return null;
    
    const expectedPinyin = getExpectedPinyin();
    const normalizedExpected = normalizeForComparison(expectedPinyin);
    const normalizedInput = normalizeForComparison(userInput);
    
    // For progress calculation, we need to handle character-by-character comparison
    // Split into characters/words for comparison
    const expectedChars = normalizedExpected.split('');
    const inputChars = normalizedInput.split('');
    
    // Find matching prefix length
    let matchingLength = 0;
    for (let i = 0; i < Math.min(expectedChars.length, inputChars.length); i++) {
      if (expectedChars[i] === inputChars[i]) {
        matchingLength++;
      } else {
        break;
      }
    }
    
    // Check if on track
    if (normalizedExpected.startsWith(normalizedInput) || matchingLength === inputChars.length) {
      const progress = Math.min(100, Math.round((matchingLength / expectedChars.length) * 100));
      return {
        type: 'success',
        message: `✓ Keep going! (${progress}% complete)`,
        progress
      };
    } else {
      const progress = Math.round((matchingLength / expectedChars.length) * 100);
      return {
        type: 'error',
        message: '✗ Check your spelling',
        progress
      };
    }
  };

  const feedback = getFeedback();
  const progressPercentage = isCompleted ? 100 : (feedback?.progress || 0);

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-4 w-full mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">Paragraph Practice</h2>
          <select
            value={hskLevel}
            onChange={(e) => setHskLevel(e.target.value as any)}
            className="px-3 py-1 rounded-lg border border-gray-300 text-black text-sm font-medium"
          >
            <option value="hsk1">HSK 1</option>
            <option value="hsk2">HSK 2</option>
            <option value="hsk3">HSK 3</option>
            <option value="hsk4">HSK 4</option>
            <option value="hsk1-2">HSK 1-2</option>
            <option value="hsk1-3">HSK 1-3</option>
            <option value="hsk1-4">HSK 1-4</option>
          </select>
        </div>
        
        {/* Progress Bar */}
        {paragraph && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generateNewParagraph}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'New Paragraph'}
          </button>
          {paragraph && (
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-all"
            >
              {showAnswers ? 'Hide Answer' : 'Show Answer'}
            </button>
          )}
        </div>
      </div>
      
      {/* Practice Area */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full">
        {isLoading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Generating paragraph...</p>
          </div>
        ) : paragraph ? (
          <div>
            {/* Chinese Paragraph Display with Karaoke-style translations */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl leading-relaxed text-black font-medium">
                {(() => {
                  if (!paragraph || paragraphWords.length === 0) return paragraph;
                  
                  let result = [];
                  let lastPosition = 0;
                  
                  paragraphWords.forEach((word, index) => {
                    // Add text before this word
                    if (word.position > lastPosition) {
                      result.push(
                        <span key={`text-${lastPosition}`}>
                          {paragraph.substring(lastPosition, word.position)}
                        </span>
                      );
                    }
                    
                    // Add the word with translation if completed
                    const isWordCompleted = completedWords.has(index);
                    result.push(
                      <span key={`word-${word.position}`} className="inline-block align-top mx-0.5">
                        <span className="block">{word.chinese}</span>
                        {isWordCompleted && word.english && (
                          <span className="block text-xs text-blue-600 font-normal mt-0.5 animate-fade-in">
                            {word.english}
                          </span>
                        )}
                      </span>
                    );
                    
                    lastPosition = word.position + word.chinese.length;
                  });
                  
                  // Add remaining text
                  if (lastPosition < paragraph.length) {
                    result.push(
                      <span key={`text-${lastPosition}`}>
                        {paragraph.substring(lastPosition)}
                      </span>
                    );
                  }
                  
                  return result;
                })()}
              </div>
            </div>
            
            {/* Show Answer */}
            {showAnswers && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-lg text-red-800 font-medium mb-2">Answer:</p>
                <p className="text-red-700">{getExpectedPinyin()}</p>
              </div>
            )}
            
            {/* Input Textarea */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type the pinyin for the entire paragraph:
              </label>
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none resize-none transition-all ${
                  isCompleted 
                    ? 'border-green-500 bg-green-50' 
                    : feedback?.type === 'error'
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Type pinyin here..."
                rows={4}
                autoComplete="off"
                spellCheck={false}
                disabled={isCompleted}
              />
            </div>
            
            {/* Feedback */}
            <div className="h-8">
              {feedback && !isCompleted && (
                <p className={`text-sm font-medium ${
                  feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {feedback.message}
                </p>
              )}
              
              {isCompleted && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">🎉 Perfect!</p>
                  <p className="text-gray-700 mt-1">You completed the entire paragraph correctly!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="mb-4">Click "New Paragraph" to generate a practice paragraph</p>
            <p className="text-sm">The AI will create a contextual paragraph using words from your selected HSK level</p>
          </div>
        )}
      </div>
    </div>
  );
}