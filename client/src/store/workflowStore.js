import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

export const useWorkflowStore = create((set, get) => ({
  nodes: [],
  edges: [],
  workflowId: null,
  workflowMeta: null,
  selectedNode: null,

  setWorkflow: (id, meta, nodes, edges) => set({
    workflowId: id,
    workflowMeta: meta,
    nodes: nodes || [],
    edges: edges || [],
    selectedNode: null
  }),

  onNodesChange: (changes) => set({
    nodes: applyNodeChanges(changes, get().nodes),
  }),

  onEdgesChange: (changes) => set({
    edges: applyEdgeChanges(changes, get().edges),
  }),

  addNode: (node) => set({
    nodes: [...get().nodes, node],
  }),

  setSelectedNode: (nodeId) => {
    const node = get().nodes.find(n => n.id === nodeId);
    set({ selectedNode: node || null });
  },

  updateNodeData: (nodeId, data) => set({
    nodes: get().nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, data: { ...node.data, ...data } };
      }
      return node;
    }),
    selectedNode: get().selectedNode?.id === nodeId ? 
      { ...get().selectedNode, data: { ...get().selectedNode.data, ...data } } : get().selectedNode
  }),
}));
