
import React, { useState, useEffect } from 'react'; // <-- Combine imports

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
  Defs,
  Marker,
  Path,
} from "react-native-svg";
import graphData from "./assets/graph.json";
import { calculateOptimalPath } from "./Algorithms";
import { styles } from "./Style";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacherOperation, setTeacherOperation] = useState("sum"); // 'sum' | 'multiplication'
  const [weightType, setWeightType] = useState("integer");

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

  /**
   * Handles the action to play again or proceed to the next level.
   */
  const playAgainOrNextLevel = () => {
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
      {!mode ? (
        // Mode Selection Screen
        <View style={styles.homeContainer}>
          <Text style={styles.titleText}>Select Mode</Text>
          <Button title="Student Mode" onPress={() => setMode("student")} />
          <View style={styles.buttonSpacing} />
          <Button title="Teacher Mode" onPress={() => setMode("teacher")} />
        </View>
      )  : (
        // Game Screen
        <>
          <Svg width="400" height="300" style={styles.gameContainer}>
            {edges.map((edge, index) => {
              const startNodeObj = nodes.find((n) => n.id === edge.from);
              const endNodeObj = nodes.find((n) => n.id === edge.to);
              const midX = (startNodeObj.x + endNodeObj.x) / 2;
              const midY = (startNodeObj.y + endNodeObj.y) / 2;

              // Compute the angle for the arrow text in degrees.
              const dx = endNodeObj.x - startNodeObj.x;
              const dy = endNodeObj.y - startNodeObj.y;
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

              
              const strokeColor = (cycleEdges || []).some(
                (ce) => ce.from === edge.from && ce.to === edge.to
              )
                ? "red"
                : isEdgeSelected(edge.from, edge.to)
                ? "green"
                : "yellow";

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
                  {/* Display the edge weight above the line */}
                  <SvgText
                    x={midX}
                    y={midY - 10}
                    fill="black"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {edge.weight}
                  </SvgText>
                  {/* Display the direction as an arrow ("→") rotated along the edge */}
                  <SvgText
                    x={midX}
                    y={midY}
                    fill="black"
                    fontSize="12"
                    fontWeight="bold"
                    transform={`rotate(${angle}, ${midX}, ${midY})`}
                  >
                    →
                  </SvgText>
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
            {nodes.map((node) => (
              <SvgText
                key={node.id + "-label"}
                x={node.x}
                y={node.y + 5}
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {node.id}
              </SvgText>
            ))}
          </Svg>
          {mode === "teacher" && !gameOver && (
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
              {/* Show current path weight */}
              <Text style={styles.gameMessage}>
                Current Path Weight: {totalWeight}
              </Text>
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
            </View>
          )}

          <Text style={styles.gameMessage}>{message}</Text>
          {gameOver && (
            <View style={styles.gameControls}>
              <Button
                title={message.includes("Bravo") ? "Next Level" : "Play Again"}
                onPress={playAgainOrNextLevel}
              />
            </View>
          )}
          {/* <View style={styles.button}> */}
          <Button title="Undo" onPress={undo} />
          <Button title="Check Path" onPress={checkPath} />
          <Button title="Reset Graph" onPress={resetGraph} />
          {/* </View> */}
        </>
      )}

      <TouchableOpacity onPress={goHome} style={styles.homeButton}>
        <Text>Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Graph;