import React from 'react';
import { Button } from '@/components/ui/button';
import { IGraph } from '@/interfaces';

interface GraphListProps {
  graphs: IGraph[];
  onSelectGraph: (graph: IGraph) => void;
  onDeleteGraph: (id: string) => void;
  onViewGraph: (graph: IGraph) => void;
  onEditGraph: (graph: IGraph) => void;
}

const GraphList: React.FC<GraphListProps> = ({
  graphs,
  onSelectGraph,
  onDeleteGraph,
  onViewGraph,
  onEditGraph,
}) => {
  return (
    <div className="p-4 bg-gray-100 shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Grafos Criados</h2>
      <ul className="space-y-4">
        {graphs.map((graph) => (
          <li
            key={graph.id}
            className="p-4 bg-white shadow-md rounded-lg flex items-center justify-between"
          >
            <div>
              <p className="font-semibold mb-1">
                {graph.type === 'directional' ? 'Direcional' : 'Não Direcional'}
              </p>
              <p>
                {graph.edges
                  .map((e) =>
                    graph.type === 'directional'
                      ? `${e.from} → ${e.to}`
                      : `${e.from} — ${e.to}${
                          e.weight !== undefined ? `: ${e.weight}` : ''
                        }`,
                  )
                  .join(', ')}
              </p>
            </div>
            <div>
              <Button
                onClick={() => onViewGraph(graph)}
                className="mr-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                Selecionar
              </Button>
              <Button
                onClick={() => onEditGraph(graph)}
                className="mr-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                Editar
              </Button>
              <Button
                onClick={() => onDeleteGraph(graph.id)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                Excluir
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GraphList;
