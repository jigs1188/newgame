import React from 'react';
import { Button, Alert } from 'react-native';
import { calculateOptimalPath } from '../Algorithms';

const FixNegativeCycleButton = ({ nodes, edges, startNode, endNode, setHasNegativeCycle, setCycleEdges }) => {
  const handleFixNegativeCycle = () => {
    // Logic to fix negative cycles
    const result = calculateOptimalPath(nodes, edges, startNode, endNode, "sum"); // Assuming "sum" is the operation used
    if (result.hasNegativeCycle) {
      Alert.alert("Negative Cycle Detected", "Please fix the negative cycle before proceeding.");
    } else {
      setHasNegativeCycle(false);
      setCycleEdges(result.cycleEdges || []);
      Alert.alert("Success", "Negative cycle fixed successfully!");
    }
  };

  return (
    <Button title="Fix Negative Cycle" onPress={handleFixNegativeCycle} />
  );
};

export default FixNegativeCycleButton;