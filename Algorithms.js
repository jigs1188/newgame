// Algorithms.js
export const dijkstra = (nodes, edges, startNode, endNode) => {
    const distances = {};
    const previousNodes = {};
    const unvisitedNodes = nodes.slice();
  
    nodes.forEach(node => {
      distances[node.id] = Infinity;
    });
  
    distances[startNode] = 0;
    previousNodes[startNode] = null;
  
    while (unvisitedNodes.length > 0) {
      const currentNode = unvisitedNodes.reduce((minNode, node) => {
        return distances[node.id] < distances[minNode.id] ? node : minNode;
      }, unvisitedNodes[0]);
  
      unvisitedNodes.splice(unvisitedNodes.indexOf(currentNode), 1);
  
      if (currentNode.id === endNode) break;
  
      edges.forEach(edge => {
        if (edge.from === currentNode.id) {
          const neighborNode = nodes.find(node => node.id === edge.to);
          const distance = distances[currentNode.id] + edge.weight;
  
          if (distance < distances[neighborNode.id]) {
            distances[neighborNode.id] = distance;
            previousNodes[neighborNode.id] = currentNode.id;
          }
        }
      });
    }
  
    const shortestPath = [];
    let currentNode = endNode;
  
    while (currentNode) {
      shortestPath.unshift(currentNode);
      currentNode = previousNodes[currentNode];
    }
  
    return { shortestPath, weight: distances[endNode] };
  };
  export const bellmanFord = (nodes, edges, startNode, endNode) => {
    const distances = {};
    const predecessors = {};
    let cycleEdges = [];
  
    nodes.forEach(node => {
      distances[node.id] = Infinity;
      predecessors[node.id] = null;
    });
    distances[startNode] = 0;
  
    // Relax edges |V|-1 times
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.forEach(edge => {
        if (distances[edge.from] + edge.weight < distances[edge.to]) {
          distances[edge.to] = distances[edge.from] + edge.weight;
          predecessors[edge.to] = edge.from;
        }
      });
    }
  
    // Detect negative cycles
    edges.forEach(edge => {
      if (distances[edge.from] + edge.weight < distances[edge.to]) {
        let node = edge.from;
        const visited = new Set();
        while (node && !visited.has(node)) {
          visited.add(node);
          node = predecessors[node];
        }
        
        if (node) {
          let cycleNode = node;
          do {
            const nextNode = predecessors[cycleNode];
            const cycleEdge = edges.find(e => 
              e.from === nextNode && e.to === cycleNode
            );
            if (cycleEdge && !cycleEdges.includes(cycleEdge)) {
              cycleEdges.push(cycleEdge);
            }
            cycleNode = nextNode;
          } while (cycleNode !== node && cycleNode);
        }
      }
    });
  
    return {
      weight: cycleEdges.length ? Infinity : distances[endNode],
      cycleEdges,
      hasNegativeCycle: cycleEdges.length > 0
    };
  };
  
 
  // Updated adjustment algorithm
export const adjustNegativeCycle = (edges, cycleEdges) => {
  const cycleNodes = new Set();
  cycleEdges.forEach(edge => {
    cycleNodes.add(edge.from);
    cycleNodes.add(edge.to);
  });

  const adjustment = Math.ceil(
    Math.abs(cycleEdges.reduce((sum, e) => sum + e.weight, 0)) / cycleNodes.size
  );

  return edges.map(edge => 
    cycleEdges.includes(edge)
      ? {...edge, weight: edge.weight + adjustment}
      : edge
  );
};

export const calculateOptimalPath = (nodes, edges, startNode, endNode, operation = 'sum') => {
  const operationEdges = operation === 'multiplication'
    ? edges.map(edge => ({
        ...edge,
        weight: Math.log(edge.weight)
      }))
    : edges;
  const filteredEdges = operationEdges.filter(edge => edge.from !== endNode);
  const hasNegativeWeights = filteredEdges.some(edge => edge.weight < 0);
  
  let result;
  try {
    result = hasNegativeWeights
      ? bellmanFord(nodes, filteredEdges, startNode, endNode)
      : dijkstra(nodes, filteredEdges, startNode, endNode);
  } catch (error) {
    console.error("Path calculation error:", error);
    return { weight: Infinity };
  }
  
  if (operation === 'multiplication') {
    const EXP_TOLERANCE = 1e-10;
    const rawWeight = Math.exp(result.weight);
    const roundedWeight = Math.round((rawWeight + EXP_TOLERANCE) * 1e6) / 1e6;
    return { ...result, weight: roundedWeight };
  }
  
  return result;
};

