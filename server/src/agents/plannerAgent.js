class PlannerAgent {
  /**
   * Plans the execution order of nodes using Kahn's topological sort algorithm.
   * Emits the ordered node IDs and a calculated confidence score.
   */
  static async plan(workflowSnapshot) {
    console.log('[PlannerAgent] Calculating execution sequence with topological sort...');
    const nodes = workflowSnapshot.nodes || [];
    const edges = workflowSnapshot.edges || [];

    if (nodes.length === 0) {
      return { plan: [], confidenceScore: 1.0 };
    }

    // Build adjacency list and in-degree map
    const inDegree = new Map();
    const adjList = new Map();

    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    });

    edges.forEach(edge => {
      if (inDegree.has(edge.target) && adjList.has(edge.source)) {
        inDegree.set(edge.target, inDegree.get(edge.target) + 1);
        adjList.get(edge.source).push(edge.target);
      }
    });

    // Queue of nodes with 0 in-degree (root triggers or entry points)
    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId);
    });

    const plan = [];
    while (queue.length > 0) {
      const current = queue.shift();
      plan.push(current);

      const neighbors = adjList.get(current) || [];
      neighbors.forEach(neighbor => {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      });
    }

    // If there are disconnected nodes or cycles, append unvisited nodes
    if (plan.length < nodes.length) {
      nodes.forEach(n => {
        if (!plan.includes(n.id)) {
          plan.push(n.id);
        }
      });
    }

    // Calculate confidence score (higher if purely linear and acyclic)
    const hasTrigger = nodes.some(n => n.data?.type === 'trigger' || n.type === 'trigger');
    const confidenceScore = hasTrigger ? 0.98 : 0.85;

    console.log(`[PlannerAgent] Generated plan: ${plan.join(' -> ')} (Confidence: ${confidenceScore})`);
    return {
      plan,
      confidenceScore,
    };
  }
}

module.exports = PlannerAgent;
