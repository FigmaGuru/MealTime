"use client";

import { useState, useCallback } from "react";
import type { Ingredient, NutritionInfo } from "@/types";
import { estimateNutrition } from "@/lib/openai/services";

export function useNutritionEstimate() {
  const [nutrition, setNutrition] = useState<NutritionInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const estimate = useCallback(
    async (ingredients: Ingredient[], servings: number = 1) => {
      if (ingredients.filter((i) => i.name.trim()).length === 0) {
        setNutrition(null);
        return null;
      }

      setLoading(true);
      try {
        const result = await estimateNutrition(ingredients, servings);
        setNutrition(result);
        return result;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { nutrition, loading, estimate, setNutrition };
}
