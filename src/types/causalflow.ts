export interface Variable {
  id: string;
  name: string;
}

export interface NodeIdentifier {
  variableId: string;
  periodIndex: number;
}

export interface Path {
  id: string;
  from: NodeIdentifier;
  to: NodeIdentifier;
}

export interface NodePosition extends NodeIdentifier {
  nodeId: string; // DOM ID: variableId-p{periodIndex}
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}
