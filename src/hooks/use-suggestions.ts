"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Meal, MealSuggestion } from "@/types";
import { buildMealContext } from "@/lib/utils/meal-context";

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const previousTitlesRef = useRef<Set<string>>(new Set());

  const fetchSuggestions = useCallback(async (meals: Meal[], count = 3) => {
    if (meals.length === 0) {
      toast.error("Add some meals first to get suggestions");
      return;
    }

    setLoading(true);
    try {
      const mealContext = buildMealContext(meals);
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealContext,
          count,
          previousSuggestionTitles: [...previousTitlesRef.current],
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch suggestions");

      const data = await res.json();
      const newSuggestions: MealSuggestion[] = data.suggestions ?? [];

      // Add new titles to the tracking ref
      for (const s of newSuggestions) {
        previousTitlesRef.current.add(s.title.toLowerCase().trim());
      }

      setSuggestions(newSuggestions);
      toast.success(`${newSuggestions.length} suggestions ready`);
    } catch {
      toast.error("Failed to get meal suggestions");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    previousTitlesRef.current = new Set();
  }, []);

  return { suggestions, loading, fetchSuggestions, clearSuggestions };
}
