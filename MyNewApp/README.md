# Teacher Quiz Application

## Overview
The Teacher Quiz Application is designed to help educators create, manage, and share quizzes based on graph theory concepts. The application allows teachers to select graphs, edit them, assemble quizzes, and save them for future use. Additionally, it provides functionality to generate QR codes for easy sharing of quizzes as homework.

## Project Structure
```
MyNewApp
├── assets
│   ├── graphList.json         # Contains a list of graphs available for selection
│   └── savedQuizzes.json      # Stores saved quizzes in JSON format
├── components
│   └── FixNegativeCycleButton.js # Component to fix negative cycles in graphs
├── screens
│   └── TeacherQuizScreen.js    # Main logic for quiz management interface
├── App.js                       # Entry point for the application
├── package.json                 # Configuration file for npm
└── README.md                    # Documentation for the project
```

## Features
- **Graph Selection**: Choose from a library of pre-defined graphs.
- **Graph Editing**: Edit selected graphs with options to set weights and define start and end nodes.
- **Quiz Assembly**: Combine multiple graphs into a single quiz with customizable titles and instructions.
- **Save Quizzes**: Save quizzes in a JSON file, including details such as the type of each question (addition or multiplication).
- **Fix Negative Cycles**: A dedicated button to fix negative cycles in the graph before saving the quiz.
- **QR Code Generation**: Generate a QR code for each quiz, allowing easy sharing with students.

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd MyNewApp
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage
1. Start the application:
   ```
   npm start
   ```
2. Use the interface to select graphs, edit them, and assemble quizzes.
3. Save quizzes and share them using the generated QR codes.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.