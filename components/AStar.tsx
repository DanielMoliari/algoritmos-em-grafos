import React, { useRef, useState } from 'react';
import { IGraph } from '@/interfaces';
import GraphDisplay from './GraphDisplay';

interface AStarProps {
  graph: IGraph;
  heuristic: { [key: string]: number };
}

const AStar: React.FC<AStarProps> = ({ graph, heuristic }) => {
  const [path, setPath] = useState<string[]>([]);
  const [openList, setOpenList] = useState<string[]>([]);
  const [closedList, setClosedList] = useState<string[]>([]);
  const [startNode, setStartNode] = useState<string>('');
  const [endNode, setEndNode] = useState<string>('');
  const cyRef = useRef<cytoscape.Core | null>(null);

  const aStar = (start: string, end: string) => {
    const gScore: { [key: string]: number } = {};
    const fScore: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};

    const openSet = new Set<string>([start]);
    const closedSet = new Set<string>();

    // Inicialização
    graph.edges
      .flatMap((edge) => [edge.from, edge.to])
      .forEach((node) => {
        gScore[node] = Infinity;
        fScore[node] = Infinity;
        previous[node] = null;
      });
    gScore[start] = 0;
    fScore[start] = heuristic[start] || 0;

    const updateLists = () => {
      setOpenList(Array.from(openSet));
      setClosedList(Array.from(closedSet));
    };

    while (openSet.size) {
      // Encontra o nó com menor fScore
      const current = Array.from(openSet).reduce((minNode, node) =>
        fScore[node] < fScore[minNode] ? node : minNode,
      );

      if (current === end) {
        const finalPath = [];
        let node: string | null = current;
        while (node !== null) {
          finalPath.unshift(node);
          node = previous[node!];
        }
        setPath(finalPath);
        return;
      }

      openSet.delete(current);
      closedSet.add(current);

      const neighbors = graph.edges
        .filter((edge) => edge.from === current || edge.to === current)
        .map((edge) => (edge.from === current ? edge.to : edge.from));

      neighbors.forEach((neighbor) => {
        if (closedSet.has(neighbor)) return;

        const edge = graph.edges.find(
          (e) =>
            (e.from === current && e.to === neighbor) ||
            (e.from === neighbor && e.to === current),
        )!;
        const tentativeGScore = gScore[current] + (edge.weight || 0);

        if (tentativeGScore < gScore[neighbor]) {
          previous[neighbor] = current;
          gScore[neighbor] = tentativeGScore;
          fScore[neighbor] = gScore[neighbor] + (heuristic[neighbor] || 0);
          if (!openSet.has(neighbor)) openSet.add(neighbor);
        }
      });

      updateLists();
    }

    setPath([]); // Caso não encontre caminho
  };

  const handleRun = () => {
    if (startNode && endNode) aStar(startNode, endNode);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="lg:w-[30%] flex flex-col space-y-4 max-h-[500px] overflow-y-scroll pr-6">
          <div className="">
            <label className="block mb-2">Nó de Entrada:</label>
            <input
              type="text"
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Nó de Saída:</label>
            <input
              type="text"
              value={endNode}
              onChange={(e) => setEndNode(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
            onClick={handleRun}
          >
            Rodar A*
          </button>
          <h3 className="font-semibold">Caminho Mínimo:</h3>
          <p>{path.join(' -> ')}</p>
          <h3 className="font-semibold mt-4">Lista Aberta:</h3>
          <ul className="list-disc list-inside space-y-2">
            {openList.map((node, index) => (
              <li
                key={index}
                className="bg-gray-100 p-3 rounded-lg shadow-sm border border-gray-300"
              >
                {node}
              </li>
            ))}
          </ul>
          <h3 className="font-semibold mt-4">Lista Fechada:</h3>
          <ul className="list-disc list-inside space-y-2">
            {closedList.map((node, index) => (
              <li
                key={index}
                className="bg-gray-100 p-3 rounded-lg shadow-sm border border-gray-300"
              >
                {node}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:w-[70%] bg-gray-100 border border-gray-300 rounded-lg p-4 flex-grow">
          <GraphDisplay
            edges={graph.edges}
            graphType="undirectional"
            onGraphInit={(cy) => {
              cyRef.current = cy;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AStar;
