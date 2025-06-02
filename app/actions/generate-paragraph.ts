'use server';

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { VocabularyItem } from '@/types/vocabulary';

interface ParagraphWord {
  chinese: string;
  pinyin: string;
  english?: string;
  position: number;
}

interface GeneratedParagraph {
  paragraph: string;
  words: ParagraphWord[];
  pinyinAnswer?: string;
}

export async function generateParagraph(
  vocabularyItems: VocabularyItem[], 
  level: string
): Promise<GeneratedParagraph> {
  const wordList = vocabularyItems.map(item => ({
    chinese: item.chinese,
    pinyin: item.pinyin,
    english: item.english
  }));

  const prompt = `Create a short, natural Chinese paragraph (2-3 sentences) using these selected HSK ${level} words:
${wordList.map(w => `${w.chinese} (${w.pinyin}) - ${w.english}`).join('\n')}

Requirements:
1. Use each of the selected words above at least once
2. ONLY use Chinese characters/words from HSK ${level} vocabulary. Do NOT use any characters that are not in HSK ${level}.
3. You may use other HSK ${level} words beyond the selected ones to make natural sentences
4. Create grammatically correct sentences
5. Return the response in this exact JSON format:
{
  "paragraph": "the Chinese paragraph here",
  "pinyinAnswer": "the complete pinyin transcription of the entire paragraph",
  "allWords": [
    {"chinese": "我", "pinyin": "wǒ", "english": "I", "position": 0},
    {"chinese": "有", "pinyin": "yǒu", "english": "have", "position": 1},
    ...
  ]
}

IMPORTANT: 
- The "allWords" array must include EVERY SINGLE Chinese character/word in the paragraph
- The position is the character index where the word starts in the paragraph
- For "pinyinAnswer": 
  * Use ONLY lowercase pinyin with tone marks and spaces between words
  * NO punctuation (no periods, commas, exclamation marks, question marks, etc.)
  * NO capital letters
  * Example: "nǐ hǎo wǒ yǒu yī gè péng yǒu" (NOT "Nǐ hǎo! Wǒ yǒu yī gè péng yǒu.")

6. Make it conversational and realistic`;

  const { text } = await generateText({
    model: openai('gpt-4.1-mini'),
    prompt,
  });

  // Parse the JSON response
  let parsedResponse;
  try {
    parsedResponse = JSON.parse(text);
  } catch {
    // Fallback if not valid JSON
    parsedResponse = {
      paragraph: text.trim(),
      pinyinAnswer: '',
      allWords: []
    };
  }

  const paragraph = parsedResponse.paragraph || text.trim();
  let words: ParagraphWord[] = [];

  // Use the AI-provided word list if available
  if (parsedResponse.allWords && Array.isArray(parsedResponse.allWords)) {
    interface WordData {
      chinese: string;
      pinyin: string;
      english?: string;
      position: number;
    }
    words = parsedResponse.allWords.map((word: WordData) => ({
      chinese: word.chinese,
      pinyin: word.pinyin,
      english: word.english || '',
      position: word.position
    }));
  } else {
    // Fallback: extract vocabulary words only
    vocabularyItems.forEach(item => {
      let position = paragraph.indexOf(item.chinese);
      while (position !== -1) {
        words.push({
          chinese: item.chinese,
          pinyin: item.pinyin,
          english: item.english,
          position
        });
        position = paragraph.indexOf(item.chinese, position + 1);
      }
    });
  }

  // Sort by position
  words.sort((a, b) => a.position - b.position);

  return {
    paragraph: paragraph,
    words: words,
    pinyinAnswer: parsedResponse.pinyinAnswer || ''
  };
}