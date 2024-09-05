import React, { useRef, useState } from 'react';
import { IGraph } from '@/interfaces';
import GraphDisplay from './GraphDisplay';

interface DijkstraProps {
  graph: IGraph;
}

const Dijkstra: React.FC<DijkstraProps> = ({ graph }) => {
  const [path, setPath] = useState<string[]>([]);
  const [controlTable, setControlTable] = useState<
    { node: string; distance: number; previous: string | null }[]
  >([]);
  const [startNode, setStartNode] = useState<string>('');
  const [endNode, setEndNode] = useState<string>('');
  const cyRef = useRef<cytoscape.Core | null>(null);

  const dijkstra = (start: string, end: string) => {
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const visited: Set<string> = new Set();
    const nodes = new Set(graph.edges.flatMap((edge) => [edge.from, edge.to]));

    nodes.forEach((node) => {
      distances[node] = Infinity;
      previous[node] = null;
    });
    distances[start] = 0;

    const updateControlTable = () => {
      setControlTable(
        Array.from(nodes).map((node) => ({
          node,
          distance: distances[node],
          previous: previous[node],
        })),
      );
    };

    while (nodes.size) {
      const closestNode = Array.from(nodes).reduce((minNode, node) =>
        distances[node] < distances[minNode] ? node : minNode,
      );

      if (distances[closestNode] === Infinity) break;

      nodes.delete(closestNode);
      visited.add(closestNode);

      graph.edges
        .filter((edge) => edge.from === closestNode || edge.to === closestNode)
        .forEach((edge) => {
          const neighbor = edge.from === closestNode ? edge.to : edge.from;
          if (!visited.has(neighbor)) {
            const newDistance = distances[closestNode] + edge.weight!;
            if (newDistance < distances[neighbor]) {
              distances[neighbor] = newDistance;
              previous[neighbor] = closestNode;
              updateControlTable();
            }
          }
        });
    }

    const path = [];
    let currentNode: string | null = end;

    while (currentNode !== null && previous[currentNode]) {
      path.unshift(currentNode);
      currentNode = previous[currentNode];
    }
    if (path.length) path.unshift(start);

    setPath(path);
  };

  const handleRun = () => {
    if (startNode && endNode) dijkstra(startNode, endNode);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="lg:w-[30%] flex flex-col space-y-4  max-h-[500px] overflow-y-scroll pr-6">
          <div>
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
            Rodar Dijkstra
          </button>
          <h3 className="font-semibold">Caminho Mínimo:</h3>
          <p>{path.join(' -> ')}</p>
          <h3 className="font-semibold mt-4">Tabela de Controle:</h3>
          <ul className="list-disc list-inside space-y-2">
            {controlTable.map((row, index) => (
              <li
                key={index}
                className="bg-gray-100 p-3 rounded-lg shadow-sm border border-gray-300"
              >
                {`${row.node} - Distância: ${row.distance}, Anterior: ${row.previous}`}
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

export default Dijkstra;
