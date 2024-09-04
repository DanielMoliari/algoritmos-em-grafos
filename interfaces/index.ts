export interface IEdge {
  from: string;
  to: string;
  weight?: number;
}

export interface IGraph {
  id: string;
  type: 'directional' | 'undirectional';
  edges: IEdge[];
}
