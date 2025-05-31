"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface PeriodInputFormProps {
  numPeriods: number;
  onSetNumPeriods: (periods: number) => void;
}

export default function PeriodInputForm({ numPeriods, onSetNumPeriods }: PeriodInputFormProps) {
  const [periods, setPeriods] = useState<string>(numPeriods.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(periods, 10);
    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid positive number for periods."); // Replace with toast
      return;
    }
    onSetNumPeriods(num);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="number"
        placeholder="Enter number of periods (e.g., 3)"
        value={periods}
        onChange={(e) => setPeriods(e.target.value)}
        min="1"
        aria-label="Number of time periods"
      />
      <Button type="submit" className="w-full" variant="outline">
        <CheckCircle className="mr-2 h-4 w-4" /> Set Periods
      </Button>
    </form>
  );
}
