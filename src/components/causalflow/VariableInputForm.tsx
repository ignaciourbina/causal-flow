"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Variable } from '@/types/causalflow';

interface VariableInputFormProps {
  onAddVariable: (variableName: string) => void;
  existingVariables: Variable[];
}

export default function VariableInputForm({ onAddVariable, existingVariables }: VariableInputFormProps) {
  const [variableName, setVariableName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (variableName.trim() === '') return;
    if (existingVariables.some(v => v.name.toLowerCase() === variableName.trim().toLowerCase())) {
      alert("Variable name already exists."); // Replace with toast later
      return;
    }
    onAddVariable(variableName.trim());
    setVariableName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="text"
        placeholder="Enter variable name (e.g., X1, Y)"
        value={variableName}
        onChange={(e) => setVariableName(e.target.value)}
        aria-label="New variable name"
      />
      <Button type="submit" className="w-full" variant="outline">
        <PlusCircle className="mr-2 h-4 w-4" /> Add Variable
      </Button>
      {existingVariables.length > 0 && (
        <div className="mt-4 space-y-1">
          <h4 className="text-sm font-medium text-muted-foreground">Current Variables:</h4>
          <ul className="list-disc list-inside text-sm">
            {existingVariables.map((v) => (
              <li key={v.id}>{v.name}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
