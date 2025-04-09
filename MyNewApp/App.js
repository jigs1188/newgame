import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TeacherQuizScreen from './screens/TeacherQuizScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TeacherQuiz">
        <Stack.Screen name="TeacherQuiz" component={TeacherQuizScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;