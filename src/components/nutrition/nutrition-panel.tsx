"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NutritionInfo } from "@/types";

const RDV = {
  calories: 2000,
  proteinG: 50,
  carbsG: 300,
  fatG: 65,
  fiberG: 25,
  sugarG: 50,
  sodiumMg: 2300,
};

function NutrientRow({
  label,
  value,
  unit,
  rdv,
}: {
  label: string;
  value: number;
  unit: string;
  rdv: number;
}) {
  const percent = Math.round((value / rdv) * 100);
  const barColor =
    percent > 100
      ? "bg-destructive"
      : percent > 75
        ? "bg-yellow-500"
        : "bg-primary";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">
          {value}
          {unit}{" "}
          <span className="text-xs text-muted-foreground">({percent}%)</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className={`h-1.5 rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface NutritionPanelProps {
  nutrition: NutritionInfo;
}

export function NutritionPanel({ nutrition }: NutritionPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Nutrition per Serving
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <NutrientRow
          label="Calories"
          value={nutrition.calories}
          unit=""
          rdv={RDV.calories}
        />
        <NutrientRow
          label="Protein"
          value={nutrition.proteinG}
          unit="g"
          rdv={RDV.proteinG}
        />
        <NutrientRow
          label="Carbs"
          value={nutrition.carbsG}
          unit="g"
          rdv={RDV.carbsG}
        />
        <NutrientRow
          label="Fat"
          value={nutrition.fatG}
          unit="g"
          rdv={RDV.fatG}
        />
        <NutrientRow
          label="Fiber"
          value={nutrition.fiberG}
          unit="g"
          rdv={RDV.fiberG}
        />
        <NutrientRow
          label="Sugar"
          value={nutrition.sugarG}
          unit="g"
          rdv={RDV.sugarG}
        />
        <NutrientRow
          label="Sodium"
          value={nutrition.sodiumMg}
          unit="mg"
          rdv={RDV.sodiumMg}
        />
      </CardContent>
    </Card>
  );
}
