export type Language = 'en' | 'es';

export interface Translations {
  title: string;
  subtitle: string;
  selectCategories: string;
  selectAll: string;
  deselectAll: string;
  practiceMode: string;
  sequential: string;
  sequentialDesc: string;
  random: string;
  randomDesc: string;
  review: string;
  reviewDesc: string;
  showTranslation: string;
  translation: string;
  wordsAvailable: string;
  startPractice: string;
  backToSetup: string;
  accuracy: string;
  wordsLearned: string;
  currentStreak: string;
  bestStreak: string;
  noWordsAvailable: string;
  selectCategoryPrompt: string;
  writePinyinHere: string;
  correctAnswer: string;
  writeCorrectAnswer: string;
  word: string;
  words: string;
  uniqueWords: string;
  reviewed: string;
  categories: {
    pronouns: string;
    family: string;
    numbers: string;
    time: string;
    countries: string;
    food: string;
    animals: string;
    verbs: string;
    other: string;
    names: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    title: 'Pinyin Practice',
    subtitle: 'Learn Chinese by practicing pinyin at your own pace',
    selectCategories: 'Select categories:',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    practiceMode: 'Practice mode:',
    sequential: 'Sequential',
    sequentialDesc: 'Practice words in order',
    random: 'Random',
    randomDesc: 'Random words, prioritizing unseen ones',
    review: 'Review errors',
    reviewDesc: 'Only words you\'ve had difficulties with',
    showTranslation: 'Show translation',
    translation: 'Translation',
    wordsAvailable: 'words available',
    startPractice: 'Start practice',
    backToSetup: '← Back to setup',
    accuracy: 'Accuracy',
    wordsLearned: 'Words learned',
    currentStreak: 'Current streak 🔥',
    bestStreak: 'Best streak ⭐',
    noWordsAvailable: 'No words available with selected categories.',
    selectCategoryPrompt: 'Please select at least one category to start practicing.',
    writePinyinHere: 'Write pinyin here...',
    correctAnswer: 'Correct answer:',
    writeCorrectAnswer: 'Write the correct answer to continue',
    word: 'Word',
    words: 'words',
    uniqueWords: 'unique words',
    reviewed: 'reviewed',
    categories: {
      pronouns: 'Pronouns',
      family: 'Family',
      numbers: 'Numbers',
      time: 'Time',
      countries: 'Countries',
      food: 'Food',
      animals: 'Animals',
      verbs: 'Verbs',
      other: 'Other',
      names: 'Names'
    }
  },
  es: {
    title: 'Práctica de Pinyin',
    subtitle: 'Aprende chino practicando pinyin a tu propio ritmo',
    selectCategories: 'Seleccionar categorías:',
    selectAll: 'Seleccionar todas',
    deselectAll: 'Deseleccionar todas',
    practiceMode: 'Modo de práctica:',
    sequential: 'Secuencial',
    sequentialDesc: 'Practica las palabras en orden',
    random: 'Aleatorio',
    randomDesc: 'Palabras aleatorias, priorizando las no vistas',
    review: 'Revisar errores',
    reviewDesc: 'Solo las palabras con las que has tenido dificultades',
    showTranslation: 'Mostrar traducción',
    translation: 'Traducción',
    wordsAvailable: 'palabras disponibles',
    startPractice: 'Comenzar práctica',
    backToSetup: '← Volver a configuración',
    accuracy: 'Precisión',
    wordsLearned: 'Palabras aprendidas',
    currentStreak: 'Racha actual 🔥',
    bestStreak: 'Mejor racha ⭐',
    noWordsAvailable: 'No hay palabras disponibles con las categorías seleccionadas.',
    selectCategoryPrompt: 'Por favor, selecciona al menos una categoría para practicar.',
    writePinyinHere: 'Escribe el pinyin aquí...',
    correctAnswer: 'Respuesta correcta:',
    writeCorrectAnswer: 'Escribe la respuesta correcta para continuar',
    word: 'Palabra',
    words: 'palabras',
    uniqueWords: 'palabras únicas',
    reviewed: 'revisadas',
    categories: {
      pronouns: 'Pronombres',
      family: 'Familia',
      numbers: 'Números',
      time: 'Tiempo',
      countries: 'Países',
      food: 'Comida',
      animals: 'Animales',
      verbs: 'Verbos',
      other: 'Otros',
      names: 'Nombres'
    }
  }
};