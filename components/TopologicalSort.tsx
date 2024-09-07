import React, { useRef, useState, useEffect } from 'react';
import { IGraph } from '@/interfaces';
import GraphDisplay from './GraphDisplay';

interface TopologicalSortProps {
  graph: IGraph;
}

const TopologicalSort: React.FC<TopologicalSortProps> = ({ graph }) => {
  const [sortedNodes, setSortedNodes] = useState<string[]>([]);
  const [nodeTimes, setNodeTimes] = useState<{
    [key: string]: [number, number];
  }>({});
  const [availableNodes, setAvailableNodes] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const time = useRef(0); // Controla o tempo globalmente
  const visitedRef = useRef<{ [key: string]: boolean }>({}); // Estado persistente de nós visitados

  // Inicializa a lista de nós 'from'
  useEffect(() => {
    console.log('Effect triggered. Initializing available nodes...');
    initializeAvailableNodes();
  }, [graph]);

  // Função que inicializa nós 'from'
  const initializeAvailableNodes = () => {
    console.log('Initializing available nodes...');
    const fromNodes = new Set(graph.edges.map((edge) => edge.from));
    setAvailableNodes(Array.from(fromNodes));
  };

  // Função que realiza a ordenação topológica
  const topologicalSort = () => {
    if (!selectedNode) {
      alert('Selecione um nó de partida.');
      return;
    }

    console.log('Starting topological sort with node:', selectedNode);

    const times: { [key: string]: [number, number] } = {};
    const result: string[] = [];

    const dfs = (node: string) => {
      const visited = visitedRef.current;
      console.log(`Visited state for node ${node}:`, visited[node]);

      if (visited[node]) return; // Se já foi visitado, saia da função
      visited[node] = true;
      times[node] = [++time.current, 0];

      const neighbors = graph.edges
        .filter((edge) => edge.from === node)
        .map((edge) => edge.to)
        .filter((neighbor) => !visited[neighbor]);

      neighbors.forEach((neighbor) => {
        dfs(neighbor);
      });

      times[node][1] = ++time.current;
      result.push(node);
      console.log(`Finished visiting node: ${node}`);
    };

    // Inicia a DFS no nó selecionado
    dfs(selectedNode);

    console.log('DFS complete. Result:', result);
    console.log('Visited nodes:', visitedRef.current);
    console.log('Times:', times);

    // Atualiza os nós disponíveis que ainda não foram visitados
    const remainingNodesWithoutDependencies = availableNodes.filter(
      (node) => !visitedRef.current[node],
    );

    setAvailableNodes(remainingNodesWithoutDependencies);

    // Adiciona os nós ordenados e os tempos de descoberta/conclusão
    setSortedNodes((prevSortedNodes) => [
      ...prevSortedNodes,
      ...result.reverse(),
    ]);
    setNodeTimes((prevNodeTimes) => ({ ...prevNodeTimes, ...times }));
  };

  // Lida com a seleção de um nó
  const handleNodeSelection = (node: string) => {
    setSelectedNode(node);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[30%] flex flex-col space-y-4">
          <h3 className="font-semibold mb-0">Selecione um nó de partida:</h3>
          {availableNodes.length > 0 ? (
            <ul className="flex flex-row gap-3 flex-wrap mb-4">
              {availableNodes.map((node) => (
                <li key={node}>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedNode === node}
                      onChange={() => handleNodeSelection(node)}
                    />
                    <span>{node}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-500">
              Não há nós disponíveis para selecionar.
            </p>
          )}

          {availableNodes.length > 0 && (
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
              onClick={topologicalSort}
              disabled={!selectedNode}
            >
              Ordenar
            </button>
          )}

          {sortedNodes.length > 0 && (
            <>
              <h3 className="font-semibold">Ordem Topológica:</h3>
              <p>{sortedNodes.join(' -> ')}</p>
            </>
          )}

          {sortedNodes.length > 0 && (
            <>
              <h3 className="font-semibold mt-4">
                Tempos de Descoberta e Finalização:
              </h3>
              <ul className="list-disc list-inside space-y-2 max-h-64 overflow-y-auto">
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
            </>
          )}
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

export default TopologicalSort;
