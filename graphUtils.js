// filepath: c:\Users\LENOVO\Desktop\btp\MyNewApp\graphUtils.js
import * as FileSystem from 'expo-file-system';

const graphListPath = FileSystem.documentDirectory + 'graphList.json';
const savedQuizzesPath = FileSystem.documentDirectory + 'savedQuizzes.json';

export const loadGraphFromFile = async (file = graphListPath) => {
  try {
    const content = await FileSystem.readAsStringAsync(file);
    return JSON.parse(content);
  } catch (error) {
    console.error("Error loading graph file:", error);
    return null;
  }
};

export const saveQuizGraphToFile = async (quizGraph) => {
  try {
    // Option: Append or overwrite the savedQuizzes file.
    // Here we read the current saved quizzes, add the new one, then write back.
    let quizzes = { quizzes: [] };
    try {
      const content = await FileSystem.readAsStringAsync(savedQuizzesPath);
      quizzes = JSON.parse(content);
    } catch (error) {
      console.log("No quizzes file yet; creating one.", error);
    }
    quizzes.quizzes.push(quizGraph);
    await FileSystem.writeAsStringAsync(savedQuizzesPath, JSON.stringify(quizzes, null, 2));
    console.log("Quiz saved successfully.");
  } catch (error) {
    console.error("Error saving quiz graph:", error);
  }
};