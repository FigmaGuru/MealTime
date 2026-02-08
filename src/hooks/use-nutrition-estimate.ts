"use client";

import { useState, useCallback } from "react";
import type { Ingredient, NutritionInfo } from "@/types";

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
        const res = await fetch("/api/nutrition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients, servings }),
        });

        if (!res.ok) return null;

        const data = await res.json();
        setNutrition(data.nutrition ?? null);
        return data.nutrition ?? null;
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
