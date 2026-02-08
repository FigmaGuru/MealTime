"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Meal,
  DayPlan,
  NutritionInfo,
  FamilyNutritionConfig,
} from "@/types";
import { DEFAULT_FAMILY_CONFIG } from "@/types";

interface WeeklyNutritionSummaryProps {
  days: DayPlan[];
  meals: Meal[];
  config?: FamilyNutritionConfig;
}

function calculateFamilyNutrition(
  nutrition: NutritionInfo,
  config: FamilyNutritionConfig
): NutritionInfo {
  const totalMultiplier =
    config.adults + config.children * config.childPortionPercent;

  return {
    calories: Math.round(nutrition.calories * totalMultiplier),
    proteinG: Math.round(nutrition.proteinG * totalMultiplier),
    carbsG: Math.round(nutrition.carbsG * totalMultiplier),
    fatG: Math.round(nutrition.fatG * totalMultiplier),
    fiberG: Math.round(nutrition.fiberG * totalMultiplier),
    sugarG: Math.round(nutrition.sugarG * totalMultiplier),
    sodiumMg: Math.round(nutrition.sodiumMg * totalMultiplier),
  };
}

export function WeeklyNutritionSummary({
  days,
  meals,
  config = DEFAULT_FAMILY_CONFIG,
}: WeeklyNutritionSummaryProps) {
  const totals: NutritionInfo = {
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 0,
  };

  let mealsWithNutrition = 0;

  days.forEach((day) => {
    if (!day.mealId) return;
    const meal = meals.find((m) => m.id === day.mealId);
    if (!meal?.nutrition) return;

    const familyNutrition = calculateFamilyNutrition(meal.nutrition, config);
    mealsWithNutrition++;
    totals.calories += familyNutrition.calories;
    totals.proteinG += familyNutrition.proteinG;
    totals.carbsG += familyNutrition.carbsG;
    totals.fatG += familyNutrition.fatG;
    totals.fiberG += familyNutrition.fiberG;
    totals.sugarG += familyNutrition.sugarG;
    totals.sodiumMg += familyNutrition.sodiumMg;
  });

  if (mealsWithNutrition === 0) return null;

  const dailyAvg = {
    calories: Math.round(totals.calories / 7),
    proteinG: Math.round(totals.proteinG / 7),
    carbsG: Math.round(totals.carbsG / 7),
    fatG: Math.round(totals.fatG / 7),
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Family Nutrition (Weekly)</CardTitle>
        <p className="text-xs text-muted-foreground">
          {config.adults} adults + {config.children} children (
          {Math.round(config.childPortionPercent * 100)}% portions)
        </p>
        <p className="text-xs text-muted-foreground/80">
          Estimated nutrition for your family based on this week&apos;s planned meals. Daily averages are divided across all 7 days.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">
              {totals.calories.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total cal</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totals.proteinG}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totals.carbsG}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totals.fatG}g</p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>
        <div className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          Daily avg: {dailyAvg.calories} cal | {dailyAvg.proteinG}g protein |{" "}
          {dailyAvg.carbsG}g carbs | {dailyAvg.fatG}g fat
        </div>
      </CardContent>
    </Card>
  );
}
