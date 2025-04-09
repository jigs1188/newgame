import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import Svg, { Circle, Line, Text as SvgText, Polygon } from "react-native-svg";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system";
import graphList from "../assets/graphList.json";
import { calculateOptimalPath } from "../Algorithms";
import { styles } from "../Style";
import FixNegativeCycleButton from "../components/FixNegativeCycleButton";

// Define the path for the saved quizzes file
const savedQuizzesPath = FileSystem.documentDirectory + "savedQuizzes.json";

const TeacherQuizScreen = ({ currentGraph, onAssignQuiz, onUpdateGraph }) => {
  const [availableGraphs, setAvailableGraphs] = useState([]);
  const [editingGraph, setEditingGraph] = useState(currentGraph);
  const [quizGraphs, setQuizGraphs] = useState(editingGraph ? [editingGraph] : []);
  const [quizTitle, setQuizTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [operation, setOperation] = useState("addition");
  const [qrData, setQrData] = useState(null);
  const [savedQuizzes, setSavedQuizzes] = useState([]);

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
  const [optimalPathWeight, setOptimalPathWeight] = useState(null);

  useEffect(() => {
    if (graphList && graphList.graphs) {
      setAvailableGraphs(graphList.graphs);
    }
    loadSavedQuizzes();
  }, []);

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

  const loadSavedQuizzes = async () => {
    try {
      const content = await FileSystem.readAsStringAsync(savedQuizzesPath);
      const parsed = JSON.parse(content);
      if (parsed && parsed.quizzes) {
        setSavedQuizzes(parsed.quizzes);
      }
    } catch (error) {
      console.log("No saved quizzes yet.");
    }
  };

  const handleSelectGraph = (graph) => {
    setEditingGraph(graph);
    const exists = quizGraphs.find((g) => g.id === graph.id);
    if (!exists) {
      setQuizGraphs([...quizGraphs, graph]);
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
      Alert.alert("Invalid move", "This edge is not allowed");
    }
  };

  const undo = () => {
    if (selectedEdges.length > 0) {
      const newSelected = selectedEdges.slice(0, -1);
      setSelectedEdges(newSelected);
    }
  };

  const updateQuizGraph = () => {
    const updatedGraph = { ...editingGraph, nodes, edges, startNode, endNode };
    setQuizGraphs(quizGraphs.map((g) => (g.id === editingGraph.id ? updatedGraph : g)));
  };

  const handleSaveQuiz = async () => {
    if (quizGraphs.length === 0) {
      Alert.alert("No Graphs", "Add at least one graph to the quiz.");
      return;
    }
    if (!quizTitle) {
      Alert.alert("Missing Title", "Provide a quiz title.");
      return;
    }
    const quizToSave = {
      title: quizTitle,
      instructions,
      operation,
      graphs: quizGraphs,
      createdAt: new Date().toISOString(),
    };
    try {
      let quizzesData = { quizzes: [] };
      try {
        const content = await FileSystem.readAsStringAsync(savedQuizzesPath);
        quizzesData = JSON.parse(content);
      } catch (err) {
        console.log("Creating new quizzes file.");
      }
      quizzesData.quizzes.push(quizToSave);
      await FileSystem.writeAsStringAsync(savedQuizzesPath, JSON.stringify(quizzesData, null, 2));
      Alert.alert("Quiz Saved", "Quiz saved successfully!");
      setQrData(JSON.stringify(quizToSave));
      loadSavedQuizzes();
    } catch (error) {
      Alert.alert("Error", "Error saving the quiz.");
    }
  };

  const handleFixNegativeCycle = () => {
    // Logic to fix negative cycles in the graph
    // This function should be implemented in the FixNegativeCycleButton component
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={localStyles.header}>Teacher Quiz Management</Text>

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
                  <Line
                    x1={startObj.x}
                    y1={startObj.y}
                    x2={endObj.x}
                    y2={endObj.y}
                    stroke="blue"
                    strokeWidth="2"
                  />
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
              <Circle
                key={node.id}
                cx={node.x}
                cy={node.y}
                r={20}
                fill={node.id === startNode ? "green" : node.id === endNode ? "red" : "lightblue"}
                onPress={() => handleNodeClick(node.id)}
              />
            ))}
          </Svg>
          <View style={localStyles.controlsRow}>
            <TextInput
              placeholder="Min Weight"
              value={minWeight}
              onChangeText={setMinWeight}
              style={localStyles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Max Weight"
              value={maxWeight}
              onChangeText={setMaxWeight}
              style={localStyles.input}
              keyboardType="numeric"
            />
          </View>
          <Button title="Generate New Weights" onPress={generateRandomEdges} />
          <View style={localStyles.controlsRow}>
            <Button
              title={`Switch to ${weightType === "integer" ? "Real Numbers" : "Integers"}`}
              onPress={() => setWeightType((prev) => (prev === "integer" ? "real" : "integer"))}
            />
            <Button
              title={`Switch to ${teacherOperation === "sum" ? "Multiplication" : "Sum"}`}
              onPress={() => setTeacherOperation((prev) => (prev === "sum" ? "multiplication" : "sum"))}
            />
          </View>
          {hasNegativeCycle && (
            <Text style={localStyles.errorText}>
              Negative cycle detected! Please fix it before proceeding.
            </Text>
          )}
          <FixNegativeCycleButton onFix={handleFixNegativeCycle} />
          <View style={localStyles.controlsRow}>
            <Button title="Undo" onPress={undo} />
            <Button title="Update Edited Graph" onPress={updateQuizGraph} />
          </View>
        </>
      ) : (
        <Text>No graph selected for editing.</Text>
      )}

      <Text style={localStyles.subHeader}>Assemble Quiz</Text>
      <FlatList
        data={quizGraphs}
        keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
        renderItem={({ item }) => (
          <View style={localStyles.selectedItem}>
            <Text style={localStyles.itemText}>{item.title || `Graph ${item.id}`}</Text>
            <Button title="Remove" onPress={() => setQuizGraphs(quizGraphs.filter(g => g.id !== item.id))} />
          </View>
        )}
      />
      <TextInput
        placeholder="Enter Quiz Title"
        value={quizTitle}
        onChangeText={setQuizTitle}
        style={localStyles.input}
      />
      <TextInput
        placeholder="Enter Quiz Instructions (e.g., Use Multiplication)"
        value={instructions}
        onChangeText={setInstructions}
        style={localStyles.input}
      />
      <View style={localStyles.controlsRow}>
        <Button
          title={`Operation: ${operation}`}
          onPress={() => setOperation((prev) => (prev === "addition" ? "multiplication" : "addition"))}
        />
      </View>
      <Button title="Save Quiz" onPress={handleSaveQuiz} />
      {qrData && (
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <Text>QR Code for the Quiz:</Text>
          <QRCode value={qrData} size={150} />
        </View>
      )}
      {savedQuizzes.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={localStyles.subHeader}>Previously Saved Quizzes</Text>
          <FlatList
            data={savedQuizzes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={localStyles.savedItem}>
                <Text style={localStyles.itemText}>{item.title || `Quiz ${index + 1}`}</Text>
                <Text style={localStyles.smallText}>
                  {item.instructions ? "Instr: " + item.instructions : ""}
                </Text>
                <Button title="Edit this Quiz" onPress={() => onAssignQuiz(item)} />
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