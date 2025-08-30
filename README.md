# newgame

An Expo + React Native mobile app featuring quiz flows and QR code scanning. Built with React Navigation, Redux Toolkit, and Firebase.

## Highlights
- QR scanning and camera support (expo-camera, expo-barcode-scanner)
- Quiz screens and teacher-focused flows
- Global state with @reduxjs/toolkit
- Navigation with @react-navigation (stack + bottom tabs)
- Firebase client integration
- Expo Router for file-based routing
- Async storage for local persistence

## Tech Stack
- Expo SDK 52, React Native 0.76, React 18
- React Navigation 7, Expo Router 4
- Redux Toolkit, AsyncStorage
- Firebase JS SDK
- Reanimated, Gesture Handler, Safe Area Context, Screens
- QR libraries: react-native-qrcode-scanner, react-native-qrcode-svg, jsqr

## Getting Started

Prerequisites
- Node.js 18+ and npm 9+ (or yarn/pnpm)
- Android Studio or Xcode (for device simulators)
- An Expo account if you plan to use EAS builds

Install
```bash
npm install
```

Run (local development)
```bash
# Start the Expo dev server
npx expo start

# Or use package scripts
npm run android   # run on Android device/emulator
npm run ios       # run on iOS simulator (macOS only)
npm run web       # run in the browser
```

Build (native)
```bash
# Local prebuild + native run
npm run android
npm run ios
```

Test and Lint
```bash
npm test   # uses jest-expo
npm run lint
```

## Configuration

### Firebase Setup
The app now uses environment variables for Firebase configuration to improve security:

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Firebase project configuration:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   # ... other config values
   ```

3. **Never commit the `.env` file** - it's already in `.gitignore`

For development without `.env`, the app will use fallback values, but you should set up proper environment variables for production.

### Permissions
- Camera and barcode scanning require user permissions. Ensure they are granted on your device/emulator.

## Project Structure (key files)
```
.
├─ App.js                     # app entry / navigation wiring
├─ index.js                   # Expo entry
├─ Algorithms.js              # algorithms/utilities
├─ TeacherQuizScreen.js       # quiz flow for teachers
├─ QRScannerScreen.js         # QR scanning feature
├─ Overlay.js                 # UI overlay components
├─ Style.js                   # shared styles
├─ firebaseConfig.js          # Firebase client config
├─ graphUtils.js              # graph helpers
├─ storage.js                 # AsyncStorage helpers
├─ app.json, eas.json         # Expo/EAS configuration
├─ android/                   # native Android (Kotlin present)
├─ assets/                    # images/fonts
├─ auth/                      # authentication-related code
└─ screens/                   # additional screens
```

## Scripts (package.json)
- start: expo start
- android: expo run:android
- ios: expo run:ios
- web: expo start --web
- test: jest --watchAll
- lint: expo lint

## Troubleshooting
- Camera/QR not working: Check app permissions in device settings.
- Metro bundler not detecting changes: Stop dev server, clear cache (Ctrl+C, then restart).
- iOS build issues: Open the iOS project in Xcode after prebuild, ensure signing is configured.

## License
No license specified. If you intend open-source distribution, add a LICENSE file (e.g., MIT).

## Author
- Jignesh Parmar (jigs1188)
- Email: parmarjigs1188@gmail.com
