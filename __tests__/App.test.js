// Basic smoke test to ensure app components can be imported
import React from 'react';
import { render } from '@testing-library/react-native';
// Import the main app component 
import App from '../App';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo modules
jest.mock('expo-constants', () => ({
  default: {},
}));

jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  },
  CameraView: 'CameraView',
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true })),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock Firebase
jest.mock('../firebaseConfig', () => ({
  auth: {},
  db: {},
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    // This is a basic smoke test to ensure the app can render
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });
});