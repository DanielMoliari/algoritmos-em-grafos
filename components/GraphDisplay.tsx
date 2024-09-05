import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { IEdge } from '@/interfaces';

interface GraphDisplayProps {
  edges: IEdge[];
  graphType: 'directional' | 'undirectional';
  onGraphInit: (cy: cytoscape.Core) => void;
  nodeTimes?: { [key: string]: [number, number] }; // Adicionando opcionalmente os tempos
}

const GraphDisplay: React.FC<GraphDisplayProps> = ({
  edges,
  graphType,
  onGraphInit,
  nodeTimes,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [initialized, setInitialized] = useState(false); // Adicionando estado para verificar inicialização

  useEffect(() => {
    if (containerRef.current && !cyRef.current) {
      const cy = cytoscape({
        container: containerRef.current,
        elements: [],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#4f46e5',
              width: '40px', // Ajuste o tamanho do nó aqui
              height: '40px', // Ajuste o tamanho do nó aqui
              label: (ele: cytoscape.NodeSingular) => {
                const id = ele.data('id');
                const times = nodeTimes ? nodeTimes[id] : null;
                return times ? `${id}\n(${times[0]}/${times[1]})` : id;
              },
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
        minZoom: 0.5,
        maxZoom: 2,
        wheelSensitivity: 0.2,
        motionBlur: true,
      });

      cyRef.current = cy;
      onGraphInit(cy);

      //   // Restringir o pan para manter o grafo dentro de uma área visível
      //   const boundingBox = cy.extent();

      //   const panHandler = () => {
      //     const pan = cy.pan();
      //     const newPanX = Math.max(
      //       Math.min(pan.x, boundingBox.x2),
      //       boundingBox.x1,
      //     );
      //     const newPanY = Math.max(
      //       Math.min(pan.y, boundingBox.y2),
      //       boundingBox.y1,
      //     );

      //     // Verifique se o pan realmente precisa ser ajustado
      //     if (newPanX !== pan.x || newPanY !== pan.y) {
      //       // Desativar temporariamente o listener para evitar recursão
      //       cy.off('pan', panHandler);
      //       cy.pan({ x: newPanX, y: newPanY });
      //       // Reativar o listener
      //       cy.on('pan', panHandler);
      //     }
      //   };

      //   cy.on('pan', panHandler);

      setInitialized(true); // Define o estado como inicializado
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphType, onGraphInit, nodeTimes]);

  useEffect(() => {
    if (cyRef.current && initialized) {
      try {
        cyRef.current.elements().remove();
        const nodesSet = new Set<string>();
        edges.forEach((edge) => {
          nodesSet.add(edge.from);
          nodesSet.add(edge.to);
        });
        const nodes = Array.from(nodesSet).map((node) => ({
          data: { id: node, label: node },
        }));
        const edgesElements = edges.map((edge, index) => ({
          data: {
            id: `e${index}`,
            source: edge.from,
            target: edge.to,
            label: edge.weight ? `${edge.weight}` : '',
          },
        }));

        cyRef.current.add({ nodes, edges: edgesElements });
        cyRef.current.layout({ name: 'cose', animate: true }).run();
        cyRef.current.fit();
      } catch (error) {
        console.error('Erro ao manipular o grafo:', error);
      }
    }
  }, [edges, graphType, nodeTimes, initialized]);

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-200 rounded-lg border border-gray-300 shadow-md p-4"
      style={{ minHeight: '500px' }}
    />
  );
};

export default GraphDisplay;
