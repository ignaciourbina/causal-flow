
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import VariableNode from './VariableNode';
import type { Variable, Path, NodePosition } from '@/types/causalflow';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

interface PathDiagramProps {
  variables: Variable[];
  numPeriods: number;
  paths: Path[];
  onPathsChange: (newPaths: Path[]) => void;
}

interface DrawingPathState {
  startNode: NodePosition | null;
  currentMousePos: { x: number; y: number } | null;
}

const MAX_LANES = 3;
const LANE_SEPARATION = 15; 
const BASE_ELBOW_OFFSET = 20; 

export default function PathDiagram({ variables, numPeriods, paths, onPathsChange }: PathDiagramProps) {
  const { toast } = useToast();
  const diagramRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());
  const [drawingPath, setDrawingPath] = useState<DrawingPathState>({ startNode: null, currentMousePos: null });

  const updateNodePositions = useCallback(() => {
    if (!diagramRef.current) return;
    const newPositions = new Map<string, NodePosition>();
    const diagramRect = diagramRef.current.getBoundingClientRect();

    variables.forEach(variable => {
      for (let periodIndex = 0; periodIndex < numPeriods; periodIndex++) {
        const nodeId = `${variable.id}-p${periodIndex}`;
        const nodeElement = nodeRefs.current.get(nodeId);
        if (nodeElement) {
          const rect = nodeElement.getBoundingClientRect();
          const x = rect.left - diagramRect.left;
          const y = rect.top - diagramRect.top;
          newPositions.set(nodeId, {
            variableId: variable.id,
            periodIndex,
            nodeId,
            x,
            y,
            width: rect.width,
            height: rect.height,
            centerX: x + rect.width / 2,
            centerY: y + rect.height / 2,
          });
        }
      }
    });
    setNodePositions(new Map(newPositions));
  }, [variables, numPeriods]);

  useEffect(() => {
    updateNodePositions();
    const resizeObserver = new ResizeObserver(() => {
      updateNodePositions();
    });
    if (diagramRef.current) {
      resizeObserver.observe(diagramRef.current);
    }
    nodeRefs.current.forEach(nodeEl => {
      if (nodeEl) resizeObserver.observe(nodeEl);
    });
    
    return () => resizeObserver.disconnect();
  }, [updateNodePositions, variables, numPeriods, paths]);

  const pathCustomProps = useMemo(() => {
    const propsMap = new Map<string, { direction: 'left' | 'right'; lane: number }>();
    const periodLaneCounters = new Map<number, { right: number; left: number }>();

    for (let i = 0; i < numPeriods; i++) {
        periodLaneCounters.set(i, { right: 0, left: 0 });
    }

    const sortedPaths = [...paths].sort((a, b) => {
        if (a.from.periodIndex !== b.from.periodIndex) {
            return a.from.periodIndex - b.from.periodIndex;
        }
        // Consistent key for pairs (A-C and C-A map to "A-C")
        const keyAFrom = Math.min(variables.findIndex(v => v.id === a.from.variableId), variables.findIndex(v => v.id === a.to.variableId));
        const keyATo = Math.max(variables.findIndex(v => v.id === a.from.variableId), variables.findIndex(v => v.id === a.to.variableId));
        const keyA = `${keyAFrom}-${keyATo}`;
        
        const keyBFrom = Math.min(variables.findIndex(v => v.id === b.from.variableId), variables.findIndex(v => v.id === b.to.variableId));
        const keyBTo = Math.max(variables.findIndex(v => v.id === b.from.variableId), variables.findIndex(v => v.id === b.to.variableId));
        const keyB = `${keyBFrom}-${keyBTo}`;

        if (keyA !== keyB) return keyA.localeCompare(keyB);
        
        // If same pair, sort by from variable ID to distinguish A->C from C->A
        return a.from.variableId.localeCompare(b.from.variableId);
    });


    for (const path of sortedPaths) {
        const isCross = path.from.periodIndex === path.to.periodIndex;
        if (!isCross) continue;

        const fromIdx = variables.findIndex(v => v.id === path.from.variableId);
        const toIdx = variables.findIndex(v => v.id === path.to.variableId);
        if (fromIdx === -1 || toIdx === -1) continue; // Variable not found
        
        const isSkipping = Math.abs(fromIdx - toIdx) > 1;

        if (!isSkipping) continue;
        if (propsMap.has(path.id)) continue; 

        const periodIndex = path.from.periodIndex;
        const counters = periodLaneCounters.get(periodIndex)!;

        const reciprocalPath = sortedPaths.find(rp =>
            rp.id !== path.id && 
            rp.from.variableId === path.to.variableId &&
            rp.to.variableId === path.from.variableId &&
            rp.from.periodIndex === periodIndex
        );

        if (reciprocalPath && !propsMap.has(reciprocalPath.id)) {
            // Pair found
            const pathIsPrimary = path.from.variableId < path.to.variableId; // Arbitrary but stable way to assign primary
            const primaryPath = pathIsPrimary ? path : reciprocalPath;
            const secondaryPath = pathIsPrimary ? reciprocalPath : path;

            propsMap.set(primaryPath.id, { direction: 'right', lane: counters.right % MAX_LANES });
            counters.right++;
            
            propsMap.set(secondaryPath.id, { direction: 'left', lane: counters.left % MAX_LANES });
            counters.left++;
        } else if (!reciprocalPath) {
            // No reciprocal path, assign to right by default
            propsMap.set(path.id, { direction: 'right', lane: counters.right % MAX_LANES });
            counters.right++;
        }
        // If reciprocalPath exists but was already processed, this path (current 'path') was the secondary in the pair and is now covered.
    }
    return propsMap;
  }, [paths, variables, numPeriods]);


  const getRelativeMousePos = (event: React.MouseEvent): { x: number; y: number } => {
    if (!diagramRef.current) return { x: 0, y: 0 };
    const rect = diagramRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleNodeClick = (variableId: string, periodIndex: number) => {
    const nodeId = `${variableId}-p${periodIndex}`;
    const clickedNodePosition = nodePositions.get(nodeId);

    if (!clickedNodePosition) {
      console.error("Clicked node position not found:", nodeId);
      return;
    }
    
    if (!drawingPath.startNode) {
      setDrawingPath({ startNode: clickedNodePosition, currentMousePos: { x: clickedNodePosition.centerX, y: clickedNodePosition.centerY } });
    } else {
      const fromNode = drawingPath.startNode;
      const toNode = clickedNodePosition;

      if (fromNode.nodeId === toNode.nodeId) {
        // Allow self-loops in different periods, but not same instance.
        // This condition is for the same node instance.
        toast({ title: "Invalid Path", description: "Cannot connect a variable to itself in the same period instance.", variant: "destructive" });
        setDrawingPath({ startNode: null, currentMousePos: null });
        return;
      }

      if (toNode.periodIndex < fromNode.periodIndex || toNode.periodIndex > fromNode.periodIndex + 1) {
        toast({ title: "Invalid Path", description: "Connections allowed only to variables in the same time period or the immediate next period.", variant: "destructive" });
        setDrawingPath({ startNode: null, currentMousePos: null });
        return;
      }
      
      const newPath: Path = {
        id: crypto.randomUUID(),
        from: { variableId: fromNode.variableId, periodIndex: fromNode.periodIndex },
        to: { variableId: toNode.variableId, periodIndex: toNode.periodIndex },
      };

      const pathExists = paths.some(p => 
        p.from.variableId === newPath.from.variableId &&
        p.from.periodIndex === newPath.from.periodIndex &&
        p.to.variableId === newPath.to.variableId &&
        p.to.periodIndex === newPath.to.periodIndex
      );

      if (pathExists) {
        toast({ title: "Duplicate Path", description: "This path already exists.", variant: "destructive" });
      } else {
        onPathsChange([...paths, newPath]);
      }
      setDrawingPath({ startNode: null, currentMousePos: null });
    }
  };

  const handleDiagramMouseMove = (event: React.MouseEvent) => {
    if (drawingPath.startNode) {
      setDrawingPath(prev => ({ ...prev, currentMousePos: getRelativeMousePos(event) }));
    }
  };
  
  const handleDiagramClick = (event: React.MouseEvent) => {
    if (drawingPath.startNode && (event.target === diagramRef.current || event.target === svgRef.current)) {
      setDrawingPath({ startNode: null, currentMousePos: null });
      toast({ title: "Path Drawing Cancelled", description: "Clicked on background." });
    }
  };

  function getIntersectionPoint(lineStartX: number, lineStartY: number, lineEndX: number, lineEndY: number, rectNode: NodePosition) {
    const { x, y, width, height } = rectNode; 
    const dx = lineEndX - lineStartX;
    const dy = lineEndY - lineStartY;

    let t = Infinity; 
    let intersectX = lineEndX; 
    let intersectY = lineEndY;

    const checkEdge = (edgeT: number, ix: number, iy: number, condition: boolean) => {
      if (edgeT >= 0 && edgeT <= 1 && condition && edgeT < t) {
        t = edgeT;
        intersectX = ix;
        intersectY = iy;
      }
    };

    if (dy !== 0) { // Top edge
      const currentT = (y - lineStartY) / dy;
      checkEdge(currentT, lineStartX + currentT * dx, y, lineStartX + currentT * dx >= x && lineStartX + currentT * dx <= x + width);
    }
    if (dy !== 0) { // Bottom edge
      const currentT = (y + height - lineStartY) / dy;
      checkEdge(currentT, lineStartX + currentT * dx, y + height, lineStartX + currentT * dx >= x && lineStartX + currentT * dx <= x + width);
    }
    if (dx !== 0) { // Left edge
      const currentT = (x - lineStartX) / dx;
      checkEdge(currentT, x, lineStartY + currentT * dy, lineStartY + currentT * dy >= y && lineStartY + currentT * dy <= y + height);
    }
    if (dx !== 0) { // Right edge
      const currentT = (x + width - lineStartX) / dx;
      checkEdge(currentT, x + width, lineStartY + currentT * dy, lineStartY + currentT * dy >= y && lineStartY + currentT * dy <= y + height);
    }
    
    // If an intersection was found on the line segment between start and end, use it.
    if (t < Infinity && t <= 1) {
        return { x: intersectX, y: intersectY };
    }

    // Fallback: If no intersection found on the segment (e.g., start is inside rect, or line ends before hitting border),
    // aim for the center of the target node and retract slightly if possible.
    const distToTargetCenter = Math.sqrt(dx*dx + dy*dy);
    if (distToTargetCenter === 0) return {x: lineEndX, y: lineEndY}; // Start and end are the same
    
    const fallbackOffset = 12; // How much to retract from the center if no border intersection.

    // If the line is long enough, retract by offset.
    if (distToTargetCenter > fallbackOffset) {
        return {
            x: lineEndX - (dx / distToTargetCenter) * fallbackOffset,
            y: lineEndY - (dy / distToTargetCenter) * fallbackOffset,
        };
    }
    // If line is too short, aim for a point partway along the line to avoid arrow head completely inside.
    return {
      x: lineStartX + dx * 0.8, // Take 80% of the way
      y: lineStartY + dy * 0.8,
    };
  }


  if (variables.length === 0 || numPeriods === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Please add variables and define time periods to start building your diagram.
      </div>
    );
  }

  return (
    <div 
      ref={diagramRef} 
      className="w-full h-full overflow-auto relative bg-background p-1 sm:p-2 md:p-4 rounded-md border"
      onMouseMove={handleDiagramMouseMove}
      onClick={handleDiagramClick}
    >
      <div 
        className="grid gap-x-1 sm:gap-x-2 md:gap-x-4 lg:gap-x-8" 
        style={{ gridTemplateColumns: `repeat(${numPeriods}, minmax(150px, 1fr))` }}
      >
        {Array.from({ length: numPeriods }).map((_, periodIndex) => (
          <div key={`period-${periodIndex}`} className="flex flex-col items-center py-4">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 p-1 bg-secondary rounded-sm">
              Time Period {periodIndex + 1}
            </h3>
            {variables.map(variable => {
              const nodeId = `${variable.id}-p${periodIndex}`;
              const isDrawingSource = drawingPath.startNode?.nodeId === nodeId;
              const isValidTarget = drawingPath.startNode && 
                                    (periodIndex === drawingPath.startNode.periodIndex || periodIndex === drawingPath.startNode.periodIndex + 1) &&
                                    nodeId !== drawingPath.startNode.nodeId;

              return (
                <VariableNode
                  key={nodeId}
                  ref={el => nodeRefs.current.set(nodeId, el)}
                  variableName={variable.name}
                  nodeId={nodeId}
                  onClick={() => handleNodeClick(variable.id, periodIndex)}
                  isDrawingSource={isDrawingSource}
                  isValidTarget={isValidTarget}
                />
              );
            })}
          </div>
        ))}
      </div>
      <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ minHeight: diagramRef.current?.scrollHeight }}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 10 3.5, 0 7" className="fill-primary" />
          </marker>
        </defs>
        {paths.map(path => {
          const fromNodePos = nodePositions.get(`${path.from.variableId}-p${path.from.periodIndex}`);
          const toNodePos = nodePositions.get(`${path.to.variableId}-p${path.to.periodIndex}`);
          if (!fromNodePos || !toNodePos) return null;

          const fromVariableIndex = variables.findIndex(v => v.id === path.from.variableId);
          const toVariableIndex = variables.findIndex(v => v.id === path.to.variableId);

          const isCrossSectional = path.from.periodIndex === path.to.periodIndex;
          const isSkipping = isCrossSectional && (fromVariableIndex !== -1 && toVariableIndex !== -1) && Math.abs(fromVariableIndex - toVariableIndex) > 1;

          if (isSkipping) {
            const props = pathCustomProps.get(path.id);
            if (!props) { // Fallback or error, draw straight line
                const {x: finalToX, y: finalToY} = getIntersectionPoint(fromNodePos.centerX, fromNodePos.centerY, toNodePos.centerX, toNodePos.centerY, toNodePos);
                 return (
                  <line
                    key={path.id + "-fallback"}
                    x1={fromNodePos.centerX}
                    y1={fromNodePos.centerY}
                    x2={finalToX}
                    y2={finalToY}
                    className="stroke-primary"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                );
            }

            const { direction, lane } = props;
            const directionMultiplier = direction === 'left' ? -1 : 1;
            const laneSpecificOffset = BASE_ELBOW_OFFSET + (lane % MAX_LANES) * LANE_SEPARATION;

            const p0x = (direction === 'right') ? (fromNodePos.x + fromNodePos.width) : fromNodePos.x;
            const p0y = fromNodePos.centerY;

            const p1x = p0x + (laneSpecificOffset * directionMultiplier);
            const p1y = p0y;

            const p2x = p1x;
            const p2y = toNodePos.centerY;
            
            const {x: finalToX, y: finalToY} = getIntersectionPoint(p2x, p2y, toNodePos.centerX, toNodePos.centerY, toNodePos);
            
            const d = `M ${p0x} ${p0y} L ${p1x} ${p1y} L ${p2x} ${p2y} L ${finalToX} ${finalToY}`;
            return (
              <path
                key={path.id}
                d={d}
                className="stroke-primary"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                fill="none"
              />
            );
          } else {
            // Standard straight line path
            const {x: finalToX, y: finalToY} = getIntersectionPoint(fromNodePos.centerX, fromNodePos.centerY, toNodePos.centerX, toNodePos.centerY, toNodePos);
            return (
              <line
                key={path.id}
                x1={fromNodePos.centerX}
                y1={fromNodePos.centerY}
                x2={finalToX}
                y2={finalToY}
                className="stroke-primary"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          }
        })}
        {drawingPath.startNode && drawingPath.currentMousePos && (
           <line
              x1={drawingPath.startNode.centerX}
              y1={drawingPath.startNode.centerY}
              x2={drawingPath.currentMousePos.x}
              y2={drawingPath.currentMousePos.y}
              className="stroke-accent"
              strokeWidth="2"
              strokeDasharray="5,5"
              markerEnd="url(#arrowhead)" 
            />
        )}
      </svg>
    </div>
  );
}

