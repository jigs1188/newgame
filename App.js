import React, { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  Button,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Svg, {
  Circle,
  Line,
  Text as SvgText,
  Polygon,
} from "react-native-svg";
import graphData from "./assets/graph.json";
import { calculateOptimalPath } from "./Algorithms";
import { styles } from "./Style";
import { Modal, ScrollView } from "react-native";
import TeacherQuizScreen from "./TeacherQuizScreen";
import QRScannerScreen from "./QRScannerScreen";
// import Login from "./Login";

const Graph = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [totalWeight, setTotalWeight] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [lastClickedNode, setLastClickedNode] = useState(null);
  const [optimalPathWeight, setOptimalPathWeight] = useState(null);
  const [reachedDestination, setReachedDestination] = useState(false);
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [mode, setMode] = useState(""); // '' | 'student' | 'teacher'
  const [cycleEdges, setCycleEdges] = useState([]); // Initialize as empty array
  const [hasNegativeCycle, setHasNegativeCycle] = useState(false);
  const [teacherOperation, setTeacherOperation] = useState("sum"); // 'sum' | 'multiplication'
  const [weightType, setWeightType] = useState("integer");

  const [modalVisible, setModalVisible] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizProgress, setQuizProgress] = useState([]); // [{questionIndex, attempts: [{timeTaken, isCorrect, ...}], bestTime}]
  const [questionTimer, setQuestionTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);

  // Quiz state
  const [assignedQuiz, setAssignedQuiz] = useState(null);
  // To toggle teacher quiz management UI
  const [showTeacherQuizManager, setShowTeacherQuizManager] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [gameProgress, setGameProgress] = useState({
    level: 0,
    score: 0,
    currentGraph: null,
  });

  useEffect(() => {
    loadSavedProgress();
    initializeGraph();
  }, [loadSavedProgress, initializeGraph]);
  useEffect(() => {
    if (assignedQuiz && !quizFinished) {
      setQuestionTimer(0);
      if (timerInterval) global.clearInterval(timerInterval);
      const interval = global.setInterval(() => {
        setQuestionTimer((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
      return () => global.clearInterval(interval);
    }
  }, [quizQuestionIndex, assignedQuiz, quizFinished, timerInterval]);

  const initializeGraph = useCallback(() => {
    if (assignedQuiz) {
      loadQuizGraph(assignedQuiz);
    } else {
      loadLevel(currentLevel);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedQuiz, currentLevel]);

  useEffect(() => {
    AsyncStorage.getItem("quizProgress").then((data) => {
      if (data) setQuizProgress(JSON.parse(data));
    });
  }, []);
  const saveAttempt = (isCorrect) => {
    const now = Date.now();
    const quizName =
      assignedQuiz?.title || assignedQuiz?.name || "Unnamed Quiz";
    setQuizProgress((prev) => {
      // Find or create quiz entry
      const updated = [...prev];
      let quizEntry = updated.find((q) => q.quizName === quizName);
      if (!quizEntry) {
        quizEntry = { quizName, questions: [] };
        updated.push(quizEntry);
      }
      // Find or create question entry
      let q = quizEntry.questions.find(
        (q) => q.questionIndex === quizQuestionIndex
      );
      if (!q) {
        q = { questionIndex: quizQuestionIndex, attempts: [], bestTime: null };
        quizEntry.questions.push(q);
      }
      q.attempts.push({
        timeTaken: questionTimer,
        isCorrect,
        pathWeight: totalWeight,
        timestamp: now,
      });
      if (isCorrect && (q.bestTime === null || questionTimer < q.bestTime)) {
        q.bestTime = questionTimer;
      }
      // Save to AsyncStorage
      AsyncStorage.setItem("quizProgress", JSON.stringify(updated));
      return updated;
    });
  };

  const loadSavedProgress = useCallback(async () => {
    try {
      const savedProgress = await AsyncStorage.getItem("gameProgress");
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setGameProgress(progress);
        if (progress.currentGraph) loadQuizGraph(progress.currentGraph);
      }
    } catch (error) {
      console.log("Error loading progress:", error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProgress = async () => {
    try {
      const progress = {
        level: currentLevel,
        score: totalWeight,
        currentGraph: assignedQuiz || gameProgress.currentGraph,
      };
      await AsyncStorage.setItem("gameProgress", JSON.stringify(progress));
    } catch (error) {
      console.log("Error saving progress:", error);
    }
  };

  const loadQuizGraph = (quiz, questionIdx = 0) => {
    try {
      const quizData = typeof quiz === "string" ? JSON.parse(quiz) : quiz;
      const graphData = quizData.questions?.[questionIdx]?.graphData;
      if (!graphData) {
        throw new Error("Invalid quiz format: missing graph data");
      }
      setNodes(graphData.nodes || []);
      setEdges(graphData.edges || []);
      setStartNode(graphData.startNode);
      setEndNode(graphData.endNode);
      setLastClickedNode(graphData.startNode);
      setTotalWeight(0);
      setSelectedEdges([]);
      setGameOver(false);
      setMessage("");
      setReachedDestination(false);
      if (quizData.questions?.[questionIdx]?.operation) {
        setTeacherOperation(quizData.questions[questionIdx].operation);
      }
      setAssignedQuiz(quizData);
      setQuizQuestionIndex(questionIdx);
      setQuizFinished(false);
      // Save quiz progress
      AsyncStorage.setItem(
        "gameProgress",
        JSON.stringify({
          level: currentLevel,
          score: 0,
          currentGraph: quizData,
          quizQuestionIndex: questionIdx,
        })
      );
    } catch (error) {
      console.error("Error loading quiz:", error);
      Alert.alert("Error", "Failed to load quiz: " + error.message);
      setAssignedQuiz(null);
      loadLevel(currentLevel);
    }
  };

  useEffect(() => {
    if (!assignedQuiz) loadLevel(0);
  }, [assignedQuiz]);

  useEffect(() => {
    loadLevel(0); // Initial load when component mounts
  }, []);

  // Update optimal path calculation
  useEffect(() => {
    if (startNode && endNode) {
      const result = calculateOptimalPath(
        nodes,
        edges,
        startNode,
        endNode,
        teacherOperation
      );
      setOptimalPathWeight(result.weight);
      // If result.cycleEdges is undefined, default to an empty array
      setCycleEdges(result.cycleEdges || []);
      setHasNegativeCycle(result.hasNegativeCycle);
    }
  }, [nodes, edges, startNode, endNode, teacherOperation]);
  useEffect(() => {
    AsyncStorage.getItem("quizProgress").then((data) => {
      if (data) setQuizProgress(JSON.parse(data));
    });
  }, []);

  const validateWeights = () => {
    const min = parseInt(minWeight);
    const max = parseInt(maxWeight);
    if (isNaN(min) || isNaN(max) || max <= 0 || min >= max) {
      Alert.alert(
        "Invalid Weights",
        "Ensure both max weights are positive, and max is greater than min."
      );
      return false;
    }
    if (teacherOperation === "multiplication") {
      if (min < 0 || max < 0) {
        Alert.alert(
          "Invalid Weights",
          "Ensure both max weights are positive, and max is greater than min."
        );
        return false;
      }
    }

    return true;
  };

  const loadLevel = (level) => {
    if (level < graphData.graphs.length) {
      const graph = graphData.graphs[level];
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setStartNode(graph.startNode);
      setEndNode(graph.endNode);
      setLastClickedNode(graph.startNode);
      setTotalWeight(0);
      setSelectedEdges([]);
      setGameOver(false);
      setMessage("");
      setReachedDestination(false);
      setCurrentLevel(level);
    } else {
      setMessage("Congratulations! All levels completed.");
    }
  };
  const handleAssignQuiz = (quizGraph) => {
    setAssignedQuiz(quizGraph);
    Alert.alert("Quiz Assigned", "Quiz saved and ready to share via QR code");
  };

  const resetGraph = () => {
    setSelectedEdges([]);
    setLastClickedNode(startNode);
    setTotalWeight(0);
    setGameOver(false);
    setMessage("");
    setReachedDestination(false);
  };

  /**
   * Displays the running total weight by adding the additional weight.
   * @param {number} additionalWeight - The weight to add to the total.
   */
  const displayRunningTotal = (additionalWeight) => {
    setTotalWeight((prevWeight) =>
      teacherOperation === "multiplication"
        ? prevWeight === 0
          ? additionalWeight
          : prevWeight * additionalWeight
        : prevWeight + additionalWeight
    );
  };

  const handleNodeClick = (currentNode) => {
    if (gameOver || lastClickedNode === currentNode || reachedDestination)
      return;

    // Allow movement only in the defined direction
    const edge = edges.find(
      (e) => e.from === lastClickedNode && e.to === currentNode
    );

    if (edge) {
      const newEdge = { from: lastClickedNode, to: currentNode };
      setSelectedEdges([...selectedEdges, newEdge]);
      displayRunningTotal(edge.weight);

      if (currentNode === endNode) {
        setReachedDestination(true);
        setMessage("You have reached the destination!");
      } else {
        setLastClickedNode(currentNode);
      }
    } else {
      Alert.alert(
        "Invalid move",
        "You can only move in the defined direction!"
      );
    }
  };

  const isEdgeSelected = (from, to) => {
    return selectedEdges.some(
      (edge) =>
        (edge.from === from && edge.to === to) ||
        (edge.from === to && edge.to === from)
    );
  };

  const checkPath = () => {
    if (!reachedDestination) {
      setMessage("Keep going, you haven't reached the destination yet.");
      return;
    }

    const precision =
      teacherOperation === "multiplication"
        ? 1e-6
        : weightType === "real"
        ? 0.001
        : 0;

    const isValid = Math.abs(totalWeight - optimalPathWeight) <= precision;
    saveAttempt(isValid);

    if (isValid) {
      setMessage("Bravo! You found the optimal path weight!");
      setGameOver(true);
    } else {
      setMessage(
        `Sorry, your path weight (${totalWeight}) is not optimal (${optimalPathWeight})`
      );
      setGameOver(true);
    }
  };
  // Update playAgainOrNextLevel for quiz mode
  const playAgainOrNextLevel = () => {
    if (assignedQuiz) {
      // Quiz mode
      if (message.includes("Bravo")) {
        // Next question or finish quiz
        if (quizQuestionIndex + 1 < assignedQuiz.questions.length) {
          loadQuizGraph(assignedQuiz, quizQuestionIndex + 1);
        } else {
          setQuizFinished(true);
          setMessage("Quiz Finished! 🎉");
        }
      } else {
        // Retry current question
        loadQuizGraph(assignedQuiz, quizQuestionIndex);
      }
      AsyncStorage.setItem(
        "gameProgress",
        JSON.stringify({
          level: currentLevel,
          score: 0,
          currentGraph: assignedQuiz,
          quizQuestionIndex,
        })
      );
    } else {
      // Practice mode
      if (message === "Bravo! You found the optimal path weight!") {
        setCurrentLevel(currentLevel + 1);
        loadLevel(currentLevel + 1);
      } else {
        setSelectedEdges([]);
        setLastClickedNode(startNode);
        setTotalWeight(0);
        setGameOver(false);
        setMessage("");
        setReachedDestination(false);
      }
    }
  };

  const handleNegativeCycleAdjustment = () => {
    // Use safe-check: if cycleEdges is undefined or empty, alert the user.
    if (!cycleEdges || cycleEdges.length === 0) {
      Alert.alert("No Negative Cycle", "There is no negative cycle to adjust.");
      return;
    }

    const totalCycleWeight = cycleEdges.reduce((sum, e) => sum + e.weight, 0);
    const adjustment = Math.abs(totalCycleWeight) / cycleEdges.length + 0.001;

    const adjustedEdges = edges.map((edge) => {
      // Check if this edge is part of the negative cycle.
      if (
        (cycleEdges || []).some(
          (ce) => ce.from === edge.from && ce.to === edge.to
        )
      ) {
        let newWeight = edge.weight + adjustment;
        // Format weight based on the weight type.
        if (weightType === "real") {
          newWeight = parseFloat(newWeight.toFixed(3));
        } else if (weightType === "integer") {
          newWeight = Math.round(Math.ceil(newWeight));
        }
        return { ...edge, weight: newWeight };
      }
      return edge;
    });

    setEdges(adjustedEdges);

    // Recalculate optimal path after adjustment.
    const result = calculateOptimalPath(
      nodes,
      adjustedEdges,
      startNode,
      endNode,
      teacherOperation
    );
    setOptimalPathWeight(result.weight);
    setCycleEdges(result.cycleEdges || []);
  };

  const generateRandomEdges = () => {
    if (!validateWeights()) return;
    const min = parseFloat(minWeight);
    const max = parseFloat(maxWeight);

    const newEdges = edges.map((edge) => ({
      ...edge,
      weight:
        weightType === "integer"
          ? Math.floor(Math.random() * (max - min + 1)) + min
          : parseFloat((Math.random() * (max - min) + min).toFixed(3)),
    }));

    setEdges(newEdges);
    const { weight } = calculateOptimalPath(
      nodes,
      newEdges,
      startNode,
      endNode,
      teacherOperation
    );
    setOptimalPathWeight(weight);
  };

  /**
   * Undoes the last selected edge, reverting the path to its previous state.
   */
  const undo = () => {
    if (selectedEdges.length > 0 && !gameOver) {
      const lastEdge = selectedEdges[selectedEdges.length - 1];
      const newEdges = selectedEdges.slice(0, -1);
      setSelectedEdges(newEdges);
      setTotalWeight(
        totalWeight -
          edges.find(
            (e) =>
              (e.from === lastEdge.from && e.to === lastEdge.to) ||
              (e.from === lastEdge.to && e.to === lastEdge.from)
          ).weight
      );
      setLastClickedNode(lastEdge.from);
      setMessage("");
      setReachedDestination(false);
    }
  };

  /**
   * Resets the mode and loads the first level.
   */
  const goHome = () => {
    setMode("");
    loadLevel(0);
    setCurrentLevel(0);
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <ScrollView>
            <Text style={{ fontSize: 12 }}>Graph Editor Content</Text>
          </ScrollView>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
      {!mode ? (
        // Mode Selection Screen
        <View style={styles.homeContainer}>
          <Text style={styles.titleText}>Select Mode</Text>
          <Button title="Student Mode" onPress={() => setMode("student")} />
          <View style={styles.buttonSpacing} />
          <Button title="Teacher Mode" onPress={() => setMode("teacher")} />
        </View>
      ) : mode === "teacher" ? (
        // Teacher Mode Screen: Toggle between normal teacher controls and quiz management
        showTeacherQuizManager ? (
          <TeacherQuizScreen
            currentGraph={{ nodes, edges, startNode, endNode }}
            onAssignQuiz={handleAssignQuiz}
            onUpdateGraph={(graph) => {
              setNodes(graph.nodes);
              setEdges(graph.edges);
              setStartNode(graph.startNode);
              setEndNode(graph.endNode);
            }}
          />
        ) : (
          <>
            {!assignedQuiz && (
              <View style={styles.playOptions}>
                <Button
                  title="Scan Quiz QR Code"
                  onPress={() => setShowQRScanner(true)}
                />
                <Button
                  title="Free Play"
                  onPress={() => {
                    setAssignedQuiz(null);
                    loadLevel(currentLevel);
                  }}
                />
              </View>
            )}

            {showQRScanner && (
              <QRScannerScreen
                onScanComplete={(data) => {
                  try {
                    const quizData = JSON.parse(data);
                    setShowQRScanner(false);
                    loadQuizGraph(quizData);
                    Alert.alert(
                      "Quiz Loaded",
                      "Quiz loaded successfully! Ready to start?",
                      [
                        {
                          text: "Start",
                          onPress: () => {
                            // Force a re-render of the game view
                            setNodes([
                              ...quizData.questions[0].graphData.nodes,
                            ]);
                            setEdges([
                              ...quizData.questions[0].graphData.edges,
                            ]);
                          },
                        },
                      ]
                    );
                  } catch (error) {
                    console.error("Error processing QR code:", error);
                    Alert.alert("Error", "Invalid QR code format");
                  }
                }}
                onCancel={() => setShowQRScanner(false)}
              />
            )}
            {/* Normal Teacher Controls (editing weights, adjustments, etc.) */}
            <Svg width="400" height="300" style={styles.gameContainer}>
              {edges.map((edge, index) => {
                const startNodeObj = nodes.find((n) => n.id === edge.from);
                const endNodeObj = nodes.find((n) => n.id === edge.to);
                const strokeColor = (cycleEdges || []).some(
                  (ce) => ce.from === edge.from && ce.to === edge.to
                )
                  ? "red"
                  : isEdgeSelected(edge.from, edge.to)
                  ? "green"
                  : "yellow";
                const angleRad = Math.atan2(
                  endNodeObj.y - startNodeObj.y,
                  endNodeObj.x - startNodeObj.x
                );
                const angleDeg = (angleRad * 180) / Math.PI;
                const midX = (startNodeObj.x + endNodeObj.x) / 2;
                const midY = (startNodeObj.y + endNodeObj.y) / 2;
                return (
                  <React.Fragment key={index}>
                    <Line
                      x1={startNodeObj.x}
                      y1={startNodeObj.y}
                      x2={endNodeObj.x}
                      y2={endNodeObj.y}
                      stroke={strokeColor}
                      strokeWidth={strokeColor === "green" ? "3" : "2"}
                    />
                    <SvgText
                      x={midX}
                      y={midY - 13}
                      fill="black"
                      fontSize="18"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {edge.weight}
                    </SvgText>
                    <Polygon
                      points="10,0 0,-5 0,-2 -15,-2 -15,2 0,2 0,5"
                      fill="silver"
                      transform={`translate(${midX},${midY}) rotate(${angleDeg})`}
                    />
                  </React.Fragment>
                );
              })}
              {nodes.map((node) => (
                <Circle
                  key={node.id}
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  stroke="gray"
                  strokeWidth="2"
                  fill={
                    node.id === startNode
                      ? "green"
                      : node.id === endNode
                      ? "red"
                      : "blue"
                  }
                  onPress={() => handleNodeClick(node.id)}
                />
              ))}
            </Svg>
            <View style={styles.teacherControls}>
              <TextInput
                style={styles.inputBox}
                placeholder="Min Weight"
                keyboardType="numeric"
                value={minWeight}
                onChangeText={(text) => setMinWeight(text)}
              />
              <TextInput
                style={styles.inputBox}
                placeholder="Max Weight"
                keyboardType="numeric"
                value={maxWeight}
                onChangeText={(text) => setMaxWeight(text)}
              />
              <Button
                title="Generate New Weights"
                onPress={generateRandomEdges}
              />
              <Button
                title={`Switch to ${
                  weightType === "integer" ? "Real Numbers" : "Integers"
                }`}
                onPress={() =>
                  setWeightType((prev) =>
                    prev === "integer" ? "real" : "integer"
                  )
                }
              />
              {hasNegativeCycle && (
                <Text style={styles.errorText}>
                  Negative cycle detected! Please fix it before proceeding.
                </Text>
              )}
              <Button
                title={`Switch to ${
                  teacherOperation === "sum" ? "Multiplication" : "Sum"
                }`}
                onPress={() =>
                  setTeacherOperation((prev) =>
                    prev === "sum" ? "multiplication" : "sum"
                  )
                }
              />
              <Button
                title="Fix Negative Cycles"
                onPress={handleNegativeCycleAdjustment}
              />
              <Button
                title="Edit Graph & Manage Quiz"
                onPress={() => setShowTeacherQuizManager(true)}
              />
            </View>
            <Text style={styles.gameMessage}>{message}</Text>
            {gameOver && (
              <View style={styles.gameControls}>
                <Button
                  title={
                    message.includes("Bravo") ? "Next Level" : "Play Again"
                  }
                  onPress={playAgainOrNextLevel}
                />
              </View>
            )}
            <Text style={styles.gameMessage}>
              Current Path Weight: {totalWeight}
            </Text>
            <Button title="Undo" onPress={undo} />
            <Button title="Check Path" onPress={checkPath} />
            <Button title="Reset Graph" onPress={resetGraph} />
          </>
        )
      ) : mode === "student" ? (
        <>
          <View style={styles.playOptions}>
            <Button
              title="Scan Quiz QR Code"
              onPress={() => setShowQRScanner(true)}
            />
          </View>
          {showQRScanner && (
            <QRScannerScreen
              onScanComplete={(data) => {
                try {
                  const quizData = JSON.parse(data);
                  setShowQRScanner(false);
                  loadQuizGraph(quizData);
                  Alert.alert(
                    "Quiz Loaded",
                    "Quiz loaded successfully! Ready to start?",
                    [
                      {
                        text: "Start",
                        onPress: () => {
                          // Force a re-render of the game view
                          setNodes([...quizData.questions[0].graphData.nodes]);
                          setEdges([...quizData.questions[0].graphData.edges]);
                        },
                      },
                    ]
                  );
                } catch (error) {
                  console.error("Error processing QR code:", error);
                  Alert.alert("Error", "Invalid QR code format");
                }
              }}
              onCancel={() => setShowQRScanner(false)}
            />
          )}
          {mode === "student" && (
            <View style={styles.modeSwitcher}>
              <Text style={styles.modeText}>
                Current Mode: {assignedQuiz ? "Quiz" : "Practice"}
              </Text>
              {assignedQuiz && (
                <Button
                  title="Switch to Practice"
                  onPress={() => {
                    Alert.alert(
                      "Switch Mode",
                      "Are you sure? Quiz progress will be saved.",
                      [
                        {
                          text: "Yes",
                          onPress: () => {
                            saveProgress();
                            setAssignedQuiz(null);
                            loadLevel(currentLevel);
                          },
                        },
                        { text: "No" },
                      ]
                    );
                  }}
                />
              )}
              {!assignedQuiz && (
                <Button
                  title="Resume Quiz"
                  onPress={async () => {
                    const savedProgress = await AsyncStorage.getItem(
                      "gameProgress"
                    );
                    if (savedProgress) {
                      const progress = JSON.parse(savedProgress);
                      if (progress.currentGraph) {
                        setAssignedQuiz(progress.currentGraph);
                        setQuizQuestionIndex(progress.quizQuestionIndex || 0);
                        loadQuizGraph(
                          progress.currentGraph,
                          progress.quizQuestionIndex || 0
                        );
                      }
                    }
                  }}
                />
              )}
            </View>
          )}
          {quizFinished && assignedQuiz && (
            <View style={styles.gameControls}>
              <Text style={styles.gameMessage}>Quiz Finished! 🎉</Text>
              <Button
                title="Play Again"
                onPress={async () => {
                  setQuizFinished(false);
                  setQuizQuestionIndex(0);
                  loadQuizGraph(assignedQuiz, 0);
                  // Save progress at the start of the quiz
                  await AsyncStorage.setItem(
                    "gameProgress",
                    JSON.stringify({
                      level: currentLevel,
                      score: 0,
                      currentGraph: assignedQuiz,
                      quizQuestionIndex: 0,
                    })
                  );
                }}
              />
              <Button
                title="Exit Quiz"
                onPress={async () => {
                  setAssignedQuiz(null);
                  setQuizFinished(false);
                  setQuizQuestionIndex(0);
                  loadLevel(currentLevel);
                  // Remove quiz progress from storage
                  await AsyncStorage.removeItem("gameProgress");
                }}
              />
            </View>
          )}
          {showProgressModal && (
            <Modal
              visible={true}
              onRequestClose={() => setShowProgressModal(false)}
            >
              <ScrollView contentContainerStyle={{ padding: 20 }}>
                {quizProgress.map((quiz, quizIdx) => (
                  <View
                    key={`quiz_${quiz.quizName || quiz.title || quizIdx}`}
                    style={{ marginBottom: 30 }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 20,
                        marginBottom: 10,
                        color: "#3366cc",
                      }}
                    >
                      {quiz.quizName || `Quiz ${quizIdx + 1}`}
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                      {(quiz.questions || []).map((q, idx) => (
                        <View
                          key={`q_${quiz.quizName || quiz.title || quizIdx}_${
                            typeof q.questionIndex === "number" &&
                            !isNaN(q.questionIndex)
                              ? q.questionIndex
                              : idx
                          }`}
                          style={{
                            width: 160,
                            minHeight: 100,
                            margin: 10,
                            backgroundColor: q.attempts.some((a) => a.isCorrect)
                              ? "#8f8"
                              : q.attempts.length
                              ? "#ff8"
                              : "#eee",
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "#333",
                            padding: 10,
                          }}
                        >
                          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                            Q
                            {typeof q.questionIndex === "number" &&
                            !isNaN(q.questionIndex)
                              ? q.questionIndex + 1
                              : idx + 1}
                          </Text>
                          {q.attempts.length > 0 ? (
                            q.attempts.map((a, i) => (
                              <View key={i} style={{ marginTop: 2 }}>
                                <Text style={{ fontSize: 12 }}>
                                  Attempt {i + 1}: {a.timeTaken}s -{" "}
                                  {a.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text style={{ fontSize: 12, color: "#888" }}>
                              No attempts yet
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
              <Button
                title="Close"
                onPress={() => setShowProgressModal(false)}
              />
            </Modal>
          )}
          {showQuestionPicker && (
            <Modal
              visible={true}
              onRequestClose={() => setShowQuestionPicker(false)}
            >
              <ScrollView
                contentContainerStyle={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  padding: 20,
                }}
              >
                {assignedQuiz?.questions.map((q, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      width: 60,
                      height: 60,
                      margin: 8,
                      backgroundColor:
                        quizQuestionIndex === idx ? "#8cf" : "#eee",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#333",
                    }}
                    onPress={() => {
                      setShowQuestionPicker(false);
                      setQuizQuestionIndex(idx);
                      loadQuizGraph(assignedQuiz, idx);
                    }}
                  >
                    <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                      Q{idx + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Button
                title="Close"
                onPress={() => setShowQuestionPicker(false)}
              />
            </Modal>
          )}

          {/* Rest of the game UI */}
          <Svg width="400" height="300" style={styles.gameContainer}>
            {edges.map((edge, index) => {
              const startNodeObj = nodes.find((n) => n.id === edge.from);
              const endNodeObj = nodes.find((n) => n.id === edge.to);
              const strokeColor = (cycleEdges || []).some(
                (ce) => ce.from === edge.from && ce.to === edge.to
              )
                ? "red"
                : isEdgeSelected(edge.from, edge.to)
                ? "green"
                : "yellow";
              const angleRad = Math.atan2(
                endNodeObj.y - startNodeObj.y,
                endNodeObj.x - startNodeObj.x
              );
              const angleDeg = (angleRad * 180) / Math.PI;
              const midX = (startNodeObj.x + endNodeObj.x) / 2;
              const midY = (startNodeObj.y + endNodeObj.y) / 2;
              return (
                <React.Fragment key={index}>
                  <Line
                    x1={startNodeObj.x}
                    y1={startNodeObj.y}
                    x2={endNodeObj.x}
                    y2={endNodeObj.y}
                    stroke={strokeColor}
                    strokeWidth={strokeColor === "green" ? "3" : "2"}
                  />
                  <SvgText
                    x={midX}
                    y={midY - 13}
                    fill="black"
                    fontSize="18"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {edge.weight}
                  </SvgText>
                  <Polygon
                    points="10,0 0,-5 0,-2 -15,-2 -15,2 0,2 0,5"
                    fill="silver"
                    transform={`translate(${midX},${midY}) rotate(${angleDeg})`}
                  />
                </React.Fragment>
              );
            })}
            {nodes.map((node) => (
              <Circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r={20}
                stroke="gray"
                strokeWidth="2"
                fill={
                  node.id === startNode
                    ? "green"
                    : node.id === endNode
                    ? "red"
                    : "blue"
                }
                onPress={() => handleNodeClick(node.id)}
              />
            ))}
          </Svg>
          <Text style={styles.gameMessage}>{message}</Text>
          {gameOver && (
            <View style={styles.gameControls}>
              <Button
                title={message.includes("Bravo") ? "Next Level" : "Play Again"}
                onPress={playAgainOrNextLevel}
              />
            </View>
          )}
          <Text style={styles.gameMessage}>
            Current Path Weight: {totalWeight}
          </Text>
          <Button title="Undo" onPress={undo} />
          <Button title="Check Path" onPress={checkPath} />
          <Button title="Reset Graph" onPress={resetGraph} />
          <Button
            title="Choose Question"
            onPress={() => setShowQuestionPicker(true)}
          />
          <Button
            title="Show Progress"
            onPress={() => setShowProgressModal(true)}
          />
          <TouchableOpacity onPress={saveProgress} style={styles.saveButton}>
            <Text>Save Progress</Text>
          </TouchableOpacity>
        </>
      ) : null}

      <TouchableOpacity onPress={goHome} style={styles.homeButton}>
        <Text>Home</Text>
      </TouchableOpacity>
    </View>
  );
};
export default Graph;
