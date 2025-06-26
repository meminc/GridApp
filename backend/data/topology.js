let nodes = [
  { id: 1, type: 'Bus', name: 'Main Bus' },
  { id: 2, type: 'Load', name: 'Load 1' },
];
let edges = [
  { id: 1, source: 1, target: 2, type: 'CONNECTED_TO' },
];
let nextNodeId = 3;
let nextEdgeId = 2;
function getNextNodeId() { return nextNodeId++; }
function getNextEdgeId() { return nextEdgeId++; }
module.exports = { nodes, edges, getNextNodeId, getNextEdgeId }; 