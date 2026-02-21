"use client";

import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Meal, MealSuggestion } from "@/types";
import { buildMealContext } from "@/lib/utils/meal-context";
import { generateSuggestions } from "@/lib/openai/services";

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
      const newSuggestions = await generateSuggestions(
        mealContext,
        count,
        [...previousTitlesRef.current]
      );

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
