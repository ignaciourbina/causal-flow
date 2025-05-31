"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateLavaanScript } from "@/lib/causalflowUtils";
import type { Variable, Path } from '@/types/causalflow';

interface LavaanExportButtonProps {
  variables: Variable[];
  paths: Path[];
}

export default function LavaanExportButton({ variables, paths }: LavaanExportButtonProps) {
  const handleExport = () => {
    const script = generateLavaanScript(variables, paths);
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'causalflow_model.lav'; // .lav is a common extension for lavaan syntax
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <Button onClick={handleExport} className="w-full" variant="default" disabled={paths.length === 0}>
      <Download className="mr-2 h-4 w-4" /> Export Lavaan Script
    </Button>
  );
}
