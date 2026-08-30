import { useCallback, useRef } from 'react';
import { ReactFlow, Background, Controls, addEdge, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../store/workflowStore';

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, setWorkflow, setSelectedNode, addNode } = useWorkflowStore();
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params) => {
      const edgeWithAnimation = { ...params, animated: true };
      setWorkflow(
        useWorkflowStore.getState().workflowId,
        useWorkflowStore.getState().workflowMeta,
        nodes,
        addEdge(edgeWithAnimation, edges)
      );
    },
    [edges, nodes, setWorkflow]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label') || `${type} Node`;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: Date.now().toString(),
        type: 'default',
        position,
        data: { label, type, config: {} },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="flex-grow h-full relative bg-[#090b10]" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        colorMode="dark"
      >
        <Background color="#1e293b" gap={20} size={1.5} />
        <Controls className="bg-gray-900! border-gray-800! fill-white! rounded-xl!" />
      </ReactFlow>
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
