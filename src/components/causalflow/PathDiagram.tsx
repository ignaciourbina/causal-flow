
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import VariableNode from './VariableNode';
import type { Variable, Path, NodeIdentifier, NodePosition } from '@/types/causalflow';
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
    setNodePositions(new Map(newPositions)); // Create new Map instance to trigger re-render
  }, [variables, numPeriods]);

  useEffect(() => {
    updateNodePositions();
    const resizeObserver = new ResizeObserver(() => {
      updateNodePositions();
    });
    if (diagramRef.current) {
      resizeObserver.observe(diagramRef.current);
    }
    // Observe individual nodes if necessary, or rely on parent resize
    nodeRefs.current.forEach(nodeEl => {
      if (nodeEl) resizeObserver.observe(nodeEl);
    });
    
    return () => resizeObserver.disconnect();
  }, [updateNodePositions, variables, numPeriods, paths]);


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

      // Validation
      if (fromNode.nodeId === toNode.nodeId) {
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

      // Check for duplicate paths
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
    // If clicking on the diagram background while drawing, cancel drawing
    if (drawingPath.startNode && event.target === diagramRef.current) {
      setDrawingPath({ startNode: null, currentMousePos: null });
      toast({ title: "Path Drawing Cancelled", description: "Clicked on background." });
    }
  };

  // Calculates the intersection point of a line (from lineStartX,Y to lineEndX,Y) with a rectangle (rectNode).
  // The line is then shortened so the arrowhead tip (defined by SVG marker) touches the rectNode's border.
  function getIntersectionPoint(lineStartX: number, lineStartY: number, lineEndX: number, lineEndY: number, rectNode: NodePosition) {
    const { x, y, width, height } = rectNode; 
    const dx = lineEndX - lineStartX;
    const dy = lineEndY - lineStartY;

    let t = Infinity; // Parametric value for intersection (0 <= t <= 1 for segment)
    let intersectX = lineEndX; // Default to target center if no border intersection
    let intersectY = lineEndY;

    // Check intersection with top edge
    if (dy !== 0) {
      const currentT = (y - lineStartY) / dy;
      if (currentT >= 0 && currentT <= 1) {
        const ix = lineStartX + currentT * dx;
        if (ix >= x && ix <= x + width && currentT < t) { t = currentT; intersectX = ix; intersectY = y; }
      }
    }
    // Check intersection with bottom edge
    if (dy !== 0) {
      const currentT = (y + height - lineStartY) / dy;
      if (currentT >= 0 && currentT <= 1) {
        const ix = lineStartX + currentT * dx;
        if (ix >= x && ix <= x + width && currentT < t) { t = currentT; intersectX = ix; intersectY = y + height; }
      }
    }
    // Check intersection with left edge
    if (dx !== 0) {
      const currentT = (x - lineStartX) / dx;
      if (currentT >= 0 && currentT <= 1) {
        const iy = lineStartY + currentT * dy;
        if (iy >= y && iy <= y + height && currentT < t) { t = currentT; intersectX = x; intersectY = iy; }
      }
    }
    // Check intersection with right edge
    if (dx !== 0) {
      const currentT = (x + width - lineStartX) / dx;
      if (currentT >= 0 && currentT <= 1) {
        const iy = lineStartY + currentT * dy;
        if (iy >= y && iy <= y + height && currentT < t) { t = currentT; intersectX = x + width; intersectY = iy; }
      }
    }
    
    // If an intersection point on the border was found along the segment
    if (t < Infinity) { 
      // This point is on the border. The SVG marker's refX will handle tip placement.
      return { x: intersectX, y: intersectY };
    }

    // Fallback: No clear intersection on the border segment from source center to target center.
    // This might happen if source center is inside target node, or nodes are extremely close/overlapping.
    const distToTargetCenter = Math.sqrt(dx*dx + dy*dy);
    if (distToTargetCenter === 0) return {x: lineEndX, y: lineEndY}; // Source and target center are the same.
    
    const fallbackOffset = 12; // Offset from the target node's center

    if (distToTargetCenter > fallbackOffset) {
        // Retract from the target's center by fallbackOffset
        return {
            x: lineEndX - (dx / distToTargetCenter) * fallbackOffset,
            y: lineEndY - (dy / distToTargetCenter) * fallbackOffset,
        };
    }
    // If target center is closer than fallbackOffset (nodes are very close or overlapping)
    // aim for a point 80% of the way from source center to target center.
    // This avoids ending up at the exact center which can look odd with arrowheads.
    return {
      x: lineStartX + dx * 0.8, 
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
      <div className="grid gap-x-1 sm:gap-x-2 md:gap-x-4 lg:gap-x-8 gap-y-1 sm:gap-y-2 md:gap-y-4" style={{ gridTemplateColumns: `repeat(${numPeriods}, minmax(150px, 1fr))` }}>
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

