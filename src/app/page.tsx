"use client";

import { useState, useEffect } from 'react';
import VariableInputForm from '@/components/causalflow/VariableInputForm';
import PeriodInputForm from '@/components/causalflow/PeriodInputForm';
import PathDiagram from '@/components/causalflow/PathDiagram';
import LavaanExportButton from '@/components/causalflow/LavaanExportButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Variable, Path } from '@/types/causalflow';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, LayoutGrid, Settings, DownloadCloud } from 'lucide-react';

export default function CausalFlowPage() {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [numPeriods, setNumPeriods] = useState<number>(1);
  const [paths, setPaths] = useState<Path[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleAddVariable = (variableName: string) => {
    setVariables(prev => [...prev, { id: crypto.randomUUID(), name: variableName }]);
  };

  const handleSetNumPeriods = (periods: number) => {
    setNumPeriods(periods);
    // Optional: Clear paths if number of periods changes drastically? Or try to adapt?
    // For now, keep paths, but some might become invalid if periods reduce.
    // PathDiagram's validation logic will handle display.
  };

  const handlePathsChange = (newPaths: Path[]) => {
    setPaths(newPaths);
  };
  
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading CausalFlow...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-body">
      <header className="text-center">
        <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary">CausalFlow</h1>
        <p className="text-lg sm:text-xl text-foreground/80 mt-2">
          Model complex causal relationships over time with ease.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Settings className="mr-2 h-5 w-5 text-primary" />
                Configuration
              </CardTitle>
              <CardDescription>Define your model's parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-md font-semibold mb-2 text-foreground/90">1. Define Variables</h3>
                <VariableInputForm onAddVariable={handleAddVariable} existingVariables={variables} />
              </div>
              <Separator />
              <div>
                <h3 className="text-md font-semibold mb-2 text-foreground/90">2. Set Time Periods</h3>
                <PeriodInputForm numPeriods={numPeriods} onSetNumPeriods={handleSetNumPeriods} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
             <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <DownloadCloud className="mr-2 h-5 w-5 text-primary" />
                Export
              </CardTitle>
              <CardDescription>Download your model.</CardDescription>
            </CardHeader>
            <CardContent>
              <LavaanExportButton variables={variables} paths={paths} />
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-9">
          <Card className="shadow-xl h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <LayoutGrid className="mr-3 h-6 w-6 text-primary" />
                Causal Path Diagram
              </CardTitle>
              <CardDescription>
                Click on a variable node to start drawing a path. Click on another valid node (same or next period) to complete the path.
                 Connections are directed from the first clicked node to the second.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px] relative">
              {variables.length > 0 && numPeriods > 0 ? (
                <PathDiagram
                  variables={variables}
                  numPeriods={numPeriods}
                  paths={paths}
                  onPathsChange={handlePathsChange}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 rounded-md border-2 border-dashed">
                  <AlertCircle className="w-16 h-16 mb-4 text-accent" />
                  <p className="text-lg font-semibold">Diagram Area</p>
                  <p>Please add variables and set time periods in the configuration panel to begin.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
