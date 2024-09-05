import React from 'react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IEdge, IGraph } from '@/interfaces';

interface SidebarProps {
  graphType: 'directional' | 'undirectional';
  setGraphType: (value: 'directional' | 'undirectional') => void;
  from: string;
  setFrom: (value: string) => void;
  to: string;
  setTo: (value: string) => void;
  weight: number | undefined;
  setWeight: (value: number | undefined) => void;
  edges: IEdge[];
  addEdge: () => void;
  saveGraph: () => void;
  printGraph: () => void;
  viewMode: boolean;
  handleExitViewMode: () => void;
  graphs: IGraph[];
  setGraphs: (graphs: IGraph[]) => void;
  onAlgorithmSelect: (algorithm: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  graphType,
  setGraphType,
  from,
  setFrom,
  to,
  setTo,
  weight,
  setWeight,
  edges,
  addEdge,
  saveGraph,
  printGraph,
  viewMode,
  handleExitViewMode,
  graphs,
  setGraphs,
  onAlgorithmSelect,
}) => {
  const [newGraphType, setNewGraphType] = React.useState<
    'directional' | 'undirectional'
  >('directional');

  const handleGraphTypeChange = (value: 'directional' | 'undirectional') => {
    if (edges.length > 0 && !viewMode) {
      if (
        !confirm('Você tem arestas não salvas. Deseja salvar o grafo atual?')
      ) {
        return;
      }
      saveGraph();
    }
    setGraphType(value);
    setNewGraphType(value);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white z-10">
          Configurações
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-4">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">
            Configurações do Grafo
          </SheetTitle>
          <SheetClose
            className="absolute top-4 right-4"
            onClick={viewMode ? handleExitViewMode : undefined}
          />
        </SheetHeader>
        <div className="mt-8 space-y-4">
          {!viewMode && (
            <>
              <div className="mb-4">
                <Label className="block mb-2 font-semibold">
                  Tipo de Grafo:
                </Label>
                <Select value={graphType} onValueChange={handleGraphTypeChange}>
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
                onClick={saveGraph}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={viewMode}
              >
                Salvar Grafo
              </Button>
              <Button
                onClick={printGraph}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                disabled={viewMode}
              >
                Imprimir Grafo
              </Button>
            </>
          )}
          {viewMode && graphType === 'directional' && (
            <div className="space-y-4 mt-4">
              <Button
                onClick={() => onAlgorithmSelect('topologicalSort')}
                className="bg-blue-500 w-full text-white"
              >
                Ordenação Topológica
              </Button>
              <Button
                onClick={() => onAlgorithmSelect('stronglyConnectedComponents')}
                className="bg-green-500 w-full text-white"
              >
                Componentes Fortemente Conectados
              </Button>
            </div>
          )}
          {viewMode && graphType === 'undirectional' && (
            <div className="space-y-4 mt-4">
              <Button
                onClick={() => onAlgorithmSelect('dijkistra')}
                className="bg-blue-500 w-full text-white"
              >
                Dijkistra
              </Button>
              <Button
                onClick={() => onAlgorithmSelect('astar')}
                className="bg-green-500 w-full text-white"
              >
                A*
              </Button>
            </div>
          )}
          {viewMode && (
            <Button
              onClick={handleExitViewMode}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Sair do Modo de Seleção
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
