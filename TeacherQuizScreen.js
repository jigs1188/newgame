//// filepath: c:\Users\LENOVO\Desktop\btp\MyNewApp\TeacherQuizScreen.js
import React, { useState, useEffect } from "react";
import { Platform, View, Text, Button, FlatList, TouchableOpacity, Alert, TextInput, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle, Line, Text as SvgText, Polygon } from "react-native-svg";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system";
import graphList from "./assets/graphList.json";
import { calculateOptimalPath } from "./Algorithms";

// ----- Storage Helpers -----
// Native writable file path
const savedQuizzesPath = FileSystem.documentDirectory + "savedQuizzes.json";
// Common key for web localStorage fallback
const STORAGE_KEY = "savedQuizzes";

// For native: Ensure file exists with { quizzes: [] }
const ensureQuizFileExists = async () => {
  if (Platform.OS !== "web") {
    const fileInfo = await FileSystem.getInfoAsync(savedQuizzesPath);
    if (!fileInfo.exists) {
      await FileSystem.writeAsStringAsync(savedQuizzesPath, JSON.stringify({ quizzes: [] }, null, 2));
    }
  }
};

// Native load/save functions
const loadSavedQuizzesNative = async () => {
  try {
    const content = await FileSystem.readAsStringAsync(savedQuizzesPath);
    return JSON.parse(content);
  } catch (_error) {
    console.log("No saved quizzes (native) yet.");
    return { quizzes: [] };
  }
};

const saveQuizzesNative = async (quizzesData) => {
  await FileSystem.writeAsStringAsync(savedQuizzesPath, JSON.stringify(quizzesData, null, 2));
};

// Web load/save using AsyncStorage (works on all platforms)
const loadSavedQuizzesWeb = async () => {
  try {
    if (Platform.OS === 'web') {
      const data = global.localStorage?.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { quizzes: [] };
    } else {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : { quizzes: [] };
    }
  } catch (error) {
    console.log("No saved quizzes yet.", error);
    return { quizzes: [] };
  }
};

const saveQuizzesWeb = async (quizzesData) => {
  if (Platform.OS === 'web') {
    global.localStorage?.setItem(STORAGE_KEY, JSON.stringify(quizzesData, null, 2));
  } else {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(quizzesData, null, 2));
  }
};

const TeacherQuizScreen = ({ currentGraph, onAssignQuiz, onUpdateGraph }) => {
  // ----- State Variables -----

  // ----- Quiz/Graph State -----
  const [availableGraphs, setAvailableGraphs] = useState([]);
  const [editingGraph, setEditingGraph] = useState(currentGraph);
  // quizQuestions: an array of question objects { questionNumber, operation, graphData }
  const [quizQuestions, setQuizQuestions] = useState(editingGraph ? [{ questionNumber: 1, operation: "addition", graphData: editingGraph }] : []);
  const [quizTitle, setQuizTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [operation, setOperation] = useState("addition");
  const [qrData, setQrData] = useState(null);
  const [savedQuizzes, setSavedQuizzes] = useState([]);

  // New state variables for editing (if updating an existing quiz)
  const [editingQuizId, setEditingQuizId] = useState(null);

  // Replicate graph editing state for current question (graph)
  const [nodes, setNodes] = useState(editingGraph ? editingGraph.nodes : []);
  const [edges, setEdges] = useState(editingGraph ? editingGraph.edges : []);
  const [startNode, setStartNode] = useState(editingGraph ? editingGraph.startNode : null);
  const [endNode, setEndNode] = useState(editingGraph ? editingGraph.endNode : null);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [lastClickedNode, setLastClickedNode] = useState(editingGraph ? editingGraph.startNode : null);
  const [cycleEdges, setCycleEdges] = useState([]);
  const [hasNegativeCycle, setHasNegativeCycle] = useState(false);
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [weightType, setWeightType] = useState("integer");
  const [teacherOperation, setTeacherOperation] = useState("sum");
  const [totalWeight, setTotalWeight] = useState(0);
  const [, setOptimalPathWeight] = useState(null);

  // ----- Effects -----
  useEffect(() => {
    // Ensure file is set up on native
    if (Platform.OS !== "web") {
      ensureQuizFileExists();
    }
    if (graphList && graphList.graphs) {
      setAvailableGraphs(graphList.graphs);
    }
    loadSavedQuizzesWrapper();
  }, []);

  // When an individual graph is edited, update editing state
  useEffect(() => {
    if (editingGraph) {
      setNodes(editingGraph.nodes || []);
      setEdges(editingGraph.edges || []);
      setStartNode(editingGraph.startNode);
      setEndNode(editingGraph.endNode);
      setLastClickedNode(editingGraph.startNode);
      setTotalWeight(0);
      setSelectedEdges([]);
    }
  }, [editingGraph]);

  useEffect(() => {
    if (startNode && endNode) {
      const result = calculateOptimalPath(nodes, edges, startNode, endNode, teacherOperation);
      setOptimalPathWeight(result.weight);
      setCycleEdges(result.cycleEdges || []);
      setHasNegativeCycle(result.hasNegativeCycle);
    }
  }, [nodes, edges, startNode, endNode, teacherOperation]);

  // ----- Storage Wrapper -----
  const loadSavedQuizzesWrapper = async () => {
    let data;
    if (Platform.OS === "web") {
      data = await loadSavedQuizzesWeb();
    } else {
      data = await loadSavedQuizzesNative();
    }
    if (data && data.quizzes) {
      setSavedQuizzes(data.quizzes);
    }
  };

  // ----- Quiz Editing Functions -----  
  // Populate quiz fields for editing an existing quiz
  const handleEditQuiz = (quiz) => {
    setQuizTitle(quiz.title);
    setInstructions(quiz.instructions);
    setOperation(quiz.questions[0]?.operation || "addition");
    setQuizQuestions(quiz.questions);
    setEditingQuizId(quiz.createdAt);
    setQrData(null);
  };

  // Remove entire quiz from saved quizzes
  const handleRemoveQuiz = async (index) => {
    try {
      let quizzesData;
      if (Platform.OS === "web") {
        quizzesData = await loadSavedQuizzesWeb();
      } else {
        quizzesData = await loadSavedQuizzesNative();
      }
      const updatedQuizzes = quizzesData.quizzes.filter((_, i) => i !== index);
      if (Platform.OS === "web") {
        await saveQuizzesWeb({ quizzes: updatedQuizzes });
      } else {
        await saveQuizzesNative({ quizzes: updatedQuizzes });
      }
      setSavedQuizzes(updatedQuizzes);
      Alert.alert("Success", "Quiz removed successfully");
    } catch (_error) {
      Alert.alert("Error", "Failed to remove quiz");
    }
  };

  // Add a new question (with a default graph selected)
  const handleAddNewQuestion = () => {
    if (availableGraphs.length === 0) return;
    const newQuestion = {
      questionNumber: quizQuestions.length + 1,
      operation,
      graphData: availableGraphs[0]
    };
    setQuizQuestions([...quizQuestions, newQuestion]);
  };

  // Remove a question from quizQuestions by index
  const handleRemoveQuestion = (index) => {
    const updatedQuestions = quizQuestions.filter((_, i) => i !== index)
      .map((q, i) => ({ ...q, questionNumber: i + 1 })); // renumber
    setQuizQuestions(updatedQuestions);
  };

  // Save the currently edited graph (question) into quizQuestions array
  // const updateCurrentQuestion = () => {
  //   // Update the current question in quizQuestions = current graph object
  //   const updatedQuestion = { questionNumber: 1, operation, graphData: { nodes, edges, startNode, endNode } };
  //   // If editing a specific question, update that one
  //   if (editingQuizId) {
  //     // For simplicity we update the first question; you might add UI to choose which question to update.
  //     const updatedQuestions = quizQuestions.map((q, i) => i === 0 ? updatedQuestion : q);
  //     setQuizQuestions(updatedQuestions);
  //   } else {
  //     // Otherwise, update the last added question
  //     const updatedQuestions = [...quizQuestions];
  //     updatedQuestions[updatedQuestions.length - 1] = updatedQuestion;
  //     setQuizQuestions(updatedQuestions);
  //   }
  // };

  // ----- Graph Related Functions (unchanged) -----
  const handleSelectGraph = (graph) => {
    setEditingGraph(graph);
    // When teacher selects a graph from the library for editing a question,
    // update the current question group if it doesn't already exist.
    const exists = quizQuestions.find(q => q.graphData.id === graph.id);
    if (!exists) {
      setQuizQuestions([...quizQuestions, { questionNumber: quizQuestions.length + 1, operation, graphData: graph }]);
    }
    onUpdateGraph && onUpdateGraph(graph);
  };

  const validateWeights = () => {
    const min = parseFloat(minWeight);
    const max = parseFloat(maxWeight);
    if (isNaN(min) || isNaN(max) || max <= 0 || min >= max) {
      Alert.alert("Invalid Weights", "Enter positive numbers with max > min.");
      return false;
    }
    if (teacherOperation === "multiplication" && (min < 0 || max < 0)) {
      Alert.alert("Invalid Weights", "Weights must be positive for multiplication.");
      return false;
    }
    return true;
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
    const { weight } = calculateOptimalPath(nodes, newEdges, startNode, endNode, teacherOperation);
    setOptimalPathWeight(weight);
  };

  const handleNodeClick = (currentNode) => {
    if (!startNode || !endNode) return;
    if (currentNode === lastClickedNode) return;
    const edge = edges.find((e) => e.from === lastClickedNode && e.to === currentNode);
    if (edge) {
      setSelectedEdges([...selectedEdges, { from: lastClickedNode, to: currentNode }]);
      if (currentNode === endNode) {
        Alert.alert("Finished", "Graph editing complete.");
      } else {
        setLastClickedNode(currentNode);
      }
    } else {
      Alert.alert("Invalid Move", "This edge is not allowed");
    }
  };

  const undo = () => {
    if (selectedEdges.length > 0 && !hasNegativeCycle) {
      const newSelected = selectedEdges.slice(0, -1);
      setSelectedEdges(newSelected);
      const lastEdge = selectedEdges[selectedEdges.length - 1];
      const foundEdge = edges.find(
        (e) =>
          (e.from === lastEdge.from && e.to === lastEdge.to) ||
          (e.from === lastEdge.to && e.to === lastEdge.from)
      );
      if (foundEdge) {
        setTotalWeight(totalWeight - foundEdge.weight);
      }
      setLastClickedNode(lastEdge.from);
    }
  };

  const handleNegativeCycleAdjustment = () => {
    if (!cycleEdges || cycleEdges.length === 0) {
      Alert.alert("No Negative Cycle", "There is no negative cycle to adjust.");
      return;
    }
    const totalCycleWeight = cycleEdges.reduce((sum, e) => sum + e.weight, 0);
    const adjustment = Math.abs(totalCycleWeight) / cycleEdges.length + 0.001;
    const adjustedEdges = edges.map((edge) => {
      if (cycleEdges.some((ce) => ce.from === edge.from && ce.to === edge.to)) {
        let newWeight = edge.weight + adjustment;
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
    const result = calculateOptimalPath(nodes, adjustedEdges, startNode, endNode, teacherOperation);
    setOptimalPathWeight(result.weight);
    setCycleEdges(result.cycleEdges || []);
  };

  const updateQuizGraph = () => {
    // Save current graph edits to the current question
    const updatedGraph = { nodes, edges, startNode, endNode };
    const updatedQuestion = { questionNumber: quizQuestions.length ? quizQuestions[quizQuestions.length - 1].questionNumber : 1, operation, graphData: updatedGraph };
    const newQuestions = quizQuestions.map((q, i) =>
      i === quizQuestions.length - 1 ? updatedQuestion : q
    );
    setQuizQuestions(newQuestions);
  };
     

  // ----- Quiz Save Function -----
  const handleSaveQuiz = async () => {
    // Input validation for quiz title and at least one question
    if (quizQuestions.length === 0) {
      Alert.alert("No Questions", "Add at least one question to the quiz.");
      return;
    }
    if (!quizTitle.trim()) {
      Alert.alert("Missing Title", "Please provide a quiz title.");
      return;
    }

    // Build the quiz object
    const quizToSave = {
      title: quizTitle,
      instructions,
      questions: quizQuestions.map((q, index) => ({
        questionNumber: index + 1,
        operation: q.operation,
        graphData: q.graphData
      })),
      createdAt: editingQuizId || new Date().toISOString(),
    };

    try {
      let quizzesData;
      if (Platform.OS === "web") {
        quizzesData = await loadSavedQuizzesWeb();
      } else {
        await ensureQuizFileExists();
        quizzesData = await loadSavedQuizzesNative();
      }

      // Update existing quiz or add new quiz
      const existingIndex = quizzesData.quizzes.findIndex(q => q.createdAt === editingQuizId);
      if (existingIndex >= 0) {
        quizzesData.quizzes[existingIndex] = quizToSave;
      } else {
        quizzesData.quizzes.push(quizToSave);
      }

      if (Platform.OS === "web") {
        await saveQuizzesWeb(quizzesData);
      } else {
        await saveQuizzesNative(quizzesData);
      }

      Alert.alert("Quiz Saved", existingIndex >= 0 ? "Quiz updated!" : "New quiz saved!");
      setQrData(JSON.stringify(quizToSave));
      setEditingQuizId(null);
      loadSavedQuizzesWrapper();
    } catch (error) {
      Alert.alert("Error", "Failed to save quiz: " + error.message);
    }
  };

  // ----- UI Rendering -----
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={localStyles.header}>Teacher Quiz Management</Text>

      {/* 1. Graph Library Selection */}
      <Text style={localStyles.subHeader}>Select Graph from Library</Text>
      <FlatList
        data={availableGraphs}
        keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
        renderItem={({ item }) => (
          <TouchableOpacity style={localStyles.itemButton} onPress={() => handleSelectGraph(item)}>
            <Text style={localStyles.itemText}>{item.title || `Graph ${item.id}`}</Text>
          </TouchableOpacity>
        )}
      />

      {/* 2. Edit the Currently Selected Graph (for current question) */}
      <Text style={localStyles.subHeader}>Edit Selected Graph</Text>
      {editingGraph ? (
        <>
          <Svg width="400" height="300" style={localStyles.gameContainer}>
            {edges.map((edge, index) => {
              const startObj = nodes.find((n) => n.id === edge.from);
              const endObj = nodes.find((n) => n.id === edge.to);
              const angleRad = Math.atan2(endObj.y - startObj.y, endObj.x - startObj.x);
              const angleDeg = (angleRad * 180) / Math.PI;
              const midX = (startObj.x + endObj.x) / 2;
              const midY = (startObj.y + endObj.y) / 2;
              return (
                <React.Fragment key={index}>
                  <Line x1={startObj.x} y1={startObj.y} x2={endObj.x} y2={endObj.y} stroke="blue" strokeWidth="2" />
                  <SvgText x={midX} y={midY - 10} fill="black" fontSize="14" textAnchor="middle">
                    {edge.weight}
                  </SvgText>
                  <Polygon
                    points="10,0 0,-5 0,-2 -15,-2 -15,2 0,2 0,5"
                    fill="gray"
                    transform={`translate(${midX},${midY}) rotate(${angleDeg})`}
                  />
                </React.Fragment>
              );
            })}
            {nodes.map((node) => (
              <Circle key={node.id} cx={node.x} cy={node.y} r={20} fill={node.id === startNode ? "green" : node.id === endNode ? "red" : "lightblue"} onPress={() => handleNodeClick(node.id)} />
            ))}
          </Svg>
          <View style={localStyles.controlsRow}>
            <TextInput placeholder="Min Weight" value={minWeight} onChangeText={setMinWeight} style={localStyles.input} keyboardType="numeric" />
            <TextInput placeholder="Max Weight" value={maxWeight} onChangeText={setMaxWeight} style={localStyles.input} keyboardType="numeric" />
          </View>
          <Button title="Generate New Weights" onPress={generateRandomEdges} />
          <View style={localStyles.controlsRow}>
            <Button title={`Switch to ${weightType === "integer" ? "Real Numbers" : "Integers"}`} onPress={() => setWeightType((prev) => (prev === "integer" ? "real" : "integer"))} />
            <Button title={`Switch to ${teacherOperation === "sum" ? "Multiplication" : "Sum"}`} onPress={() => setTeacherOperation((prev) => (prev === "sum" ? "multiplication" : "sum"))} />
          </View>
          {hasNegativeCycle && (
            <Text style={localStyles.errorText}>Negative cycle detected! Please fix it before proceeding.</Text>
          )}
          <View style={localStyles.controlsRow}>
            <Button title="Fix Negative Cycles" onPress={handleNegativeCycleAdjustment} />
            <Button title="Undo" onPress={undo} />
            <Button title="Update Edited Graph" onPress={updateQuizGraph} />
          </View>
        </>
      ) : (
        <Text>No graph selected for editing.</Text>
      )}

      {/* 3. Quiz Questions Management */}
      <Text style={localStyles.subHeader}>Quiz Questions</Text>
      <FlatList
        data={quizQuestions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={localStyles.selectedItem}>
            <Text style={localStyles.itemText}>Question {index + 1}: {item.operation}</Text>
            <View style={{ flexDirection: "row" }}>
              <Button title="Edit" onPress={() => {
                // load question into graph editing state
                setEditingGraph(item.graphData);
                // update question operation
                setOperation(item.operation);
                // Optionally store question index if needed
              }} />
              <Button title="Remove" onPress={() => handleRemoveQuestion(index)} />
            </View>
          </View>
        )}
      />
      <Button title="Add New Question" onPress={handleAddNewQuestion} />

      {/* 4. Quiz Basic Info */}
      <TextInput placeholder="Enter Quiz Title" value={quizTitle} onChangeText={setQuizTitle} style={localStyles.input} />
      <TextInput placeholder="Enter Quiz Instructions (e.g. Use Multiplication)" value={instructions} onChangeText={setInstructions} style={localStyles.input} />
      <View style={localStyles.controlsRow}>
        <Button title={`Operation: ${operation}`} onPress={() => setOperation((prev) => (prev === "addition" ? "multiplication" : "addition"))} />
      </View>

      {/* 5. Save Quiz and Generate QR Code */}
      <Button title="Save Quiz" onPress={handleSaveQuiz} />
      {qrData && (
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <Text>QR Code for the Quiz:</Text>
          <QRCode value={qrData} size={150} />
        </View>
      )}

      {/* 6. Display Previously Saved Quizzes */}
      {savedQuizzes.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={localStyles.subHeader}>Previously Saved Quizzes</Text>
          <FlatList
            data={savedQuizzes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={localStyles.savedItem}>
                <Text style={localStyles.itemText}>{item.title || `Quiz ${index + 1}`}</Text>
                <Text style={localStyles.smallText}>{item.instructions ? "Instr: " + item.instructions : ""}</Text>
                <View style={{ flexDirection: "row" }}>
                  <Button title="Edit" onPress={() => handleEditQuiz(item)} />
                  <Button title="Delete" onPress={() => handleRemoveQuiz(index)} />
                  <Button title="Share QR" onPress={() => {
                    setQrData(JSON.stringify(item));
                    onAssignQuiz(item);
                  }} />
                </View>
              </View>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    marginVertical: 8,
  },
  gameContainer: {
    backgroundColor: "#f0f0f0",
    marginVertical: 10,
  },
  itemButton: {
    padding: 8,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
  selectedItem: {
    padding: 8,
    backgroundColor: "#ddd",
    marginVertical: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    padding: 5,
    marginVertical: 10,
  },
  errorText: {
    color: "red",
    marginVertical: 5,
    textAlign: "center",
  },
  itemText: {
    fontSize: 16,
  },
  smallText: {
    fontSize: 12,
    color: "#555",
  },
  savedItem: {
    padding: 5,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 3,
  },
});

export default TeacherQuizScreen;