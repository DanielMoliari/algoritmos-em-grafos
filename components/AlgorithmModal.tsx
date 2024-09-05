import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TopologicalSort from '@/components/TopologicalSort';
import StronglyConnectedComponents from '@/components/StronglyConnectedComponents';
import { IGraph } from '@/interfaces';
import Dijkstra from './Dijkstra';
import AStar from './AStar';

interface AlgorithmModalProps {
  isOpen: boolean;
  onClose: () => void;
  algorithm: string | null;
  graph: IGraph;
}

const AlgorithmModal: React.FC<AlgorithmModalProps> = ({
  isOpen,
  onClose,
  algorithm,
  graph,
}) => {
  const getAlgorithmTitle = () => {
    switch (algorithm) {
      case 'topologicalSort':
        return 'Ordenação Topológica';
      case 'stronglyConnectedComponents':
        return 'Componentes Fortemente Conectados';
      case 'dijkistra':
        return 'Dijkstra';
      case 'astar':
        return 'A*';
      default:
        return 'Algoritmo';
    }
  };

  const calculateHeuristic = (graph: IGraph): Record<string, number> => {
    // Calcule a heurística com base no grafo
    const heuristic: Record<string, number> = {};
    for (const edge of graph.edges) {
      // Exemplo simplificado: atribui um valor heurístico baseado no peso da aresta
      if (edge.weight !== undefined) {
        heuristic[edge.from] = (heuristic[edge.from] || 0) + edge.weight;
        heuristic[edge.to] = (heuristic[edge.to] || 0) + edge.weight;
      }
    }
    return heuristic;
  };

  const heuristic = algorithm === 'astar' ? calculateHeuristic(graph) : {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg max-h-lvh">
        <DialogHeader className="border-b border-gray-200">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {getAlgorithmTitle()}
          </DialogTitle>
        </DialogHeader>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={onClose}
          aria-label="Fechar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="mt-4">
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center justify-center">
            {algorithm === 'topologicalSort' && (
              <div className="w-full h-full">
                <TopologicalSort graph={graph} />
              </div>
            )}
            {algorithm === 'stronglyConnectedComponents' && (
              <div className="w-full h-full">
                <StronglyConnectedComponents graph={graph} />
              </div>
            )}
            {algorithm === 'dijkistra' && (
              <div className="w-full h-full">
                <Dijkstra graph={graph} />
              </div>
            )}
            {algorithm === 'astar' && (
              <div className="w-full h-full">
                <AStar graph={graph} heuristic={heuristic} />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlgorithmModal;
