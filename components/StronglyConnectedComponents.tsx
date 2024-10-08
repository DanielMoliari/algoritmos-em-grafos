import React, { useRef, useState } from 'react';
import { IGraph, IEdge } from '@/interfaces';
import GraphDisplay from './GraphDisplay';

interface StronglyConnectedComponentsProps {
  graph: IGraph;
}

const StronglyConnectedComponents: React.FC<
  StronglyConnectedComponentsProps
> = ({ graph }) => {
  const [components, setComponents] = useState<string[][]>([]);
  const [nodeTimes, setNodeTimes] = useState<{
    [key: string]: [number, number];
  }>({});
  const cyRef = useRef<cytoscape.Core | null>(null);

  const transposeGraph = (edges: IEdge[]): IEdge[] => {
    return edges.map((edge) => ({
      from: edge.to,
      to: edge.from,
      weight: edge.weight,
    }));
  };

  const findSCCs = () => {
    let time = 0;
    let visited: { [key: string]: boolean } = {};
    const times: { [key: string]: [number, number] } = {};
    const stack: string[] = [];
    const result: string[][] = [];

    const dfs = (node: string, collectStack: boolean) => {
      visited[node] = true;
      times[node] = [++time, 0];

      const neighbors = graph.edges
        .filter((edge) => edge.from === node)
        .map((edge) => edge.to);
      neighbors.forEach((neighbor) => {
        if (!visited[neighbor]) dfs(neighbor, collectStack);
      });

      times[node][1] = ++time;
      if (collectStack) stack.push(node);
    };

    const dfsSCC = (node: string, component: string[]) => {
      visited[node] = true;
      component.push(node);

      const neighbors = graph.edges
        .filter((edge) => edge.from === node)
        .map((edge) => edge.to);
      neighbors.forEach((neighbor) => {
        if (!visited[neighbor]) dfsSCC(neighbor, component);
      });
    };

    graph.edges.forEach((edge) => {
      if (!visited[edge.from]) dfs(edge.from, true);
    });

    const transposedEdges = transposeGraph(graph.edges);
    const transposedGraph: IGraph = { ...graph, edges: transposedEdges };

    visited = {};
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (!visited[node]) {
        const component: string[] = [];
        dfsSCC(node, component);
        result.push(component);
      }
    }

    setComponents(result);
    setNodeTimes(times);
  };

  return (
    <div className="p-4">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        onClick={findSCCs}
      >
        Encontrar Componentes
      </button>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[30%] flex flex-col space-y-4">
          {components.length > 0 && (
            <h3 className="font-semibold">
              Componentes Fortemente Conectados:
            </h3>
          )}
          <ul className="list-disc list-inside space-y-2 max-h-96 overflow-y-auto">
            {components.map((component, index) => (
              <li
                key={index}
                className="bg-gray-100 p-3 rounded-lg shadow-sm border border-gray-300"
              >
                {`{ ${component.join(', ')} }`}
              </li>
            ))}
          </ul>
          {components.length > 0 && (
            <h3 className="font-semibold mt-4">
              Tempos de Descoberta e Finalização:
            </h3>
          )}
          <ul className="list-disc list-inside space-y-2 max-h-96 overflow-y-auto">
            {Object.entries(nodeTimes).map(([node, times]) => (
              <li
                key={node}
                className="bg-gray-100 p-3 rounded-lg shadow-sm border border-gray-300 flex items-center justify-between"
              >
                <span className="font-medium text-gray-700">{node}</span>
                <span className="text-gray-500">
                  ({times[0]}/{times[1]})
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:w-[70%] bg-gray-100 border border-gray-300 rounded-lg p-4 flex-grow">
          <GraphDisplay
            edges={graph.edges}
            graphType="directional"
            nodeTimes={nodeTimes}
            onGraphInit={(cy) => {
              cyRef.current = cy;
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StronglyConnectedComponents;
