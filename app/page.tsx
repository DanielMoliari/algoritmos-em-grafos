'use client';
import React, { useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import GraphControls from '../components/GraphControls';
import GraphDisplay from '../components/GraphDisplay';
import GraphList from '../components/GraphList';

interface Graph {
  id: string;
  type: 'directional' | 'undirectional';
  edges: { from: string; to: string; weight?: number }[];
}

const HomePage: React.FC = () => {
  const [graphType, setGraphType] = useState<'directional' | 'undirectional'>(
    'directional',
  );
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [edges, setEdges] = useState<
    { from: string; to: string; weight?: number }[]
  >([]);
  const [graphs, setGraphs] = useState<Graph[]>([]);
  const [viewMode, setViewMode] = useState<boolean>(false);
  const [viewedGraph, setViewedGraph] = useState<Graph | null>(null);

  const cyRef = useRef<cytoscape.Core | null>(null);

  const addEdge = () => {
    if (!viewMode && from && to) {
      setEdges([...edges, { from, to, weight }]);
      setFrom('');
      setTo('');
      setWeight(undefined);
    }
  };

  const saveGraph = () => {
    if (edges.length === 0 || viewMode) return;

    const newGraph: Graph = {
      id: Date.now().toString(),
      type: graphType,
      edges: edges,
    };

    setGraphs([...graphs, newGraph]);
    setEdges([]);
  };

  const printGraph = () => {
    console.log(edges);
  };

  const handleCenterGraph = () => {
    if (cyRef.current) {
      cyRef.current.fit();
      cyRef.current.zoom(1);
    } else {
      console.error('Cytoscape instance is not initialized');
    }
  };

  const handleSelectGraph = (graph: Graph) => {
    if (!viewMode) {
      setGraphType(graph.type);
      setEdges(graph.edges);
    }
  };

  const handleViewGraph = (graph: Graph) => {
    setGraphType(graph.type);
    setViewedGraph(graph);
    setEdges(graph.edges);
    setViewMode(true);
  };

  const handleDeleteGraph = (id: string) => {
    setGraphs(graphs.filter((graph) => graph.id !== id));
  };

  const handleExitViewMode = () => {
    setViewMode(false);
    setFrom('');
    setTo('');
    setWeight(undefined);
    setViewedGraph(null);

    // Cria um novo grafo vazio para futuras adições de arestas
    setEdges([]);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        graphType={graphType}
        setGraphType={setGraphType}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        weight={weight}
        setWeight={setWeight}
        edges={edges}
        addEdge={addEdge}
        saveGraph={saveGraph}
        printGraph={printGraph}
        viewMode={viewMode}
        handleExitViewMode={handleExitViewMode}
      />
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-auto">
        <GraphControls
          onSidebarOpen={() => document.querySelector('button')?.click()}
          onCenterGraph={handleCenterGraph}
        />
        <div className="flex-1 flex items-center justify-center bg-gray-200 rounded-lg border border-gray-300 shadow-lg">
          <GraphDisplay
            edges={viewMode && viewedGraph ? viewedGraph.edges : edges}
            graphType={viewMode && viewedGraph ? viewedGraph.type : graphType}
            onGraphInit={(cy) => {
              cyRef.current = cy;
            }}
          />
        </div>
        <GraphList
          graphs={graphs}
          onSelectGraph={handleSelectGraph}
          onDeleteGraph={handleDeleteGraph}
          onViewGraph={handleViewGraph}
        />
      </div>
    </div>
  );
};

export default HomePage;
