"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Meal } from "@/types";

export type EnrichmentResult = Pick<
  Meal,
  | "description"
  | "prepTimeMinutes"
  | "cookTimeMinutes"
  | "servings"
  | "ingredients"
  | "steps"
  | "nutrition"
>;

export function useEnrichMeal() {
  const [enrichment, setEnrichment] = useState<EnrichmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetMealId, setTargetMealId] = useState<string | null>(null);

  const enrich = useCallback(
    async (mealId: string, title: string, tags?: string[]) => {
      setLoading(true);
      setTargetMealId(mealId);
      try {
        const res = await fetch("/api/enrich", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, tags }),
        });

        if (!res.ok) throw new Error("Failed to enrich");

        const data = await res.json();
        setEnrichment(data.enrichment ?? null);
      } catch {
        toast.error("Failed to enrich meal with AI");
        setEnrichment(null);
        setTargetMealId(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearEnrichment = useCallback(() => {
    setEnrichment(null);
    setTargetMealId(null);
  }, []);

  return { enrichment, loading, targetMealId, enrich, clearEnrichment };
}
