'use client';

import { useState, useEffect, useRef } from 'react';
import cytoscape, { ElementsDefinition } from 'cytoscape';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Edge = {
  from: string;
  to: string;
  weight?: number;
};

type Graph = {
  type: 'directional' | 'undirectional';
  edges: Edge[];
};

const GraphForm: React.FC = () => {
  const [graphType, setGraphType] = useState<'directional' | 'undirectional'>(
    'directional',
  );
  const [edges, setEdges] = useState<Edge[]>([]);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addEdge = () => {
    if (from && to) {
      const newEdge: Edge = { from, to };
      if (graphType === 'undirectional' && weight) {
        newEdge.weight = weight;
      }
      setEdges([...edges, newEdge]);
      setFrom('');
      setTo('');
      setWeight(undefined);
    }
  };

  const printGraph = () => {
    console.log(
      'Tipo de Grafo:',
      graphType === 'directional' ? 'Grafo Direcional' : 'Grafo Não Direcional',
    );
    edges.forEach((edge) => {
      const connection =
        graphType === 'directional'
          ? `${edge.from} → ${edge.to}`
          : `${edge.from} — ${edge.to}${
              edge.weight !== undefined ? `: ${edge.weight}` : ''
            }`;
      console.log(connection);
    });
  };

  // Inicializar o Cytoscape
  useEffect(() => {
    if (containerRef.current && !cyRef.current) {
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements: [],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#4f46e5',
              label: 'data(label)',
              color: '#ffffff',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '12px',
              'text-wrap': 'wrap',
              'text-max-width': '80px',
            },
          },
          {
            selector: 'edge',
            style: {
              'curve-style': 'bezier',
              'target-arrow-shape':
                graphType === 'directional' ? 'triangle' : 'none',
              'arrow-scale': 1.5,
              'line-color': '#9ca3af',
              'target-arrow-color': '#9ca3af',
              label: 'data(label)',
              'font-size': '10px',
              'text-background-color': '#ffffff',
              'text-background-opacity': 1,
              'text-background-padding': '2px',
            },
          },
        ],
        layout: {
          name: 'cose',
        },
      });
    }

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  // Atualizar o Cytoscape sempre que os edges ou graphType mudarem
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.elements().remove();

      // Extrair todos os nós únicos
      const nodesSet = new Set<string>();
      edges.forEach((edge) => {
        nodesSet.add(edge.from);
        nodesSet.add(edge.to);
      });
      const nodes = Array.from(nodesSet).map((node) => ({
        data: { id: node, label: node },
      }));

      // Criar arestas
      const edgesElements = edges.map((edge, index) => {
        const edgeId = `e${index}`;
        return {
          data: {
            id: edgeId,
            source: edge.from,
            target: edge.to,
            label: edge.weight ? `${edge.weight}` : '',
          },
        };
      });

      const elements: ElementsDefinition = {
        nodes,
        edges: edgesElements,
      };

      cyRef.current.add(elements);

      // Atualizar o layout
      cyRef.current.layout({ name: 'cose', animate: true }).run();
    }
  }, [edges, graphType]);

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '300px', zIndex: 10 }}
      >
        <div className="p-4 h-full flex flex-col">
          <Button
            onClick={() => setSidebarOpen(false)}
            className="w-full bg-red-600 hover:bg-red-700 text-white mb-4"
          >
            Fechar
          </Button>

          <Card className="flex-1 overflow-auto">
            <CardHeader>
              <CardTitle className="text-xl">Configuração do Grafo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label className="block mb-2 font-semibold">
                  Tipo de Grafo:
                </Label>
                <Select
                  value={graphType}
                  onValueChange={(value) =>
                    setGraphType(value as 'directional' | 'undirectional')
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo de grafo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="directional">
                      Direcional Não Ponderado
                    </SelectItem>
                    <SelectItem value="undirectional">
                      Não Direcional Ponderado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4 space-y-2">
                <Input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Nó de origem"
                  className="w-full"
                />
                <Input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Nó de destino"
                  className="w-full"
                />
                {graphType === 'undirectional' && (
                  <Input
                    type="number"
                    value={weight || ''}
                    onChange={(e) => setWeight(parseFloat(e.target.value))}
                    placeholder="Peso"
                    className="w-full"
                  />
                )}
              </div>

              <Button
                onClick={addEdge}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Adicionar Aresta
              </Button>

              <Button
                onClick={printGraph}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
              >
                Imprimir Grafo
              </Button>

              <div className="mt-6">
                <h2 className="text-lg font-semibold">Conexões do Grafo:</h2>
                <ul className="list-disc list-inside">
                  {edges.map((edge, index) => (
                    <li key={index} className="mt-2">
                      {graphType === 'directional'
                        ? `${edge.from} → ${edge.to}`
                        : `${edge.from} — ${edge.to}${
                            edge.weight !== undefined ? `: ${edge.weight}` : ''
                          }`}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-80' : 'ml-0'
        }`}
      >
        <div className="p-4 h-full flex items-center justify-center">
          <Card className="w-full h-full">
            <CardContent>
              <div
                ref={containerRef}
                style={{ height: '600px', width: '100%' }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GraphForm;
