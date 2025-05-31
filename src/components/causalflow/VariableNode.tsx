"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VariableNodeProps {
  variableName: string;
  nodeId: string; // DOM ID: variableId-p{periodIndex}
  onClick: () => void;
  isDrawingSource?: boolean;
  isValidTarget?: boolean;
}

const VariableNode = React.forwardRef<HTMLDivElement, VariableNodeProps>(
  ({ variableName, nodeId, onClick, isDrawingSource, isValidTarget }, ref) => {
    return (
      <div ref={ref} id={nodeId} className="mb-4">
        <Card
          onClick={onClick}
          className={cn(
            "cursor-pointer hover:shadow-lg transition-shadow duration-150 select-none",
            "bg-card border-2 border-primary/50 hover:border-primary",
            isDrawingSource && "ring-2 ring-accent ring-offset-2",
            isValidTarget && "bg-accent/30 border-accent"
          )}
          role="button"
          tabIndex={0}
          aria-label={`Variable ${variableName}`}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick();}}
        >
          <CardContent className="p-3 text-center">
            <p className="font-medium text-card-foreground truncate">{variableName}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
);

VariableNode.displayName = "VariableNode";
export default VariableNode;
