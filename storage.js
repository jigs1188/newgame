import AsyncStorage from '@react-native-async-storage/async-storage';

const QUIZ_STORAGE_KEY = '@Quizzes';

export const loadQuizzes = async () => {
  try {
    const stored = await AsyncStorage.getItem(QUIZ_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading quizzes:', error);
    return [];
  }
};

export const saveQuizzes = async (quizzes) => {
  try {
    await AsyncStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizzes));
  } catch (error) {
    console.error('Error saving quizzes:', error);
    throw error;
  }
};

export const deleteQuiz = async (id) => {
  const quizzes = await loadQuizzes();
  const updated = quizzes.filter(q => q.id !== id);
  await saveQuizzes(updated);
  return updated;
};