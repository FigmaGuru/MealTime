"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  subscribeMeals,
  createMeal,
  updateMeal as updateMealService,
  deleteMeal as deleteMealService,
  bulkCreateMeals as bulkCreateMealsService,
} from "@/lib/firebase/meals-service";
import type { Meal, CreateMealInput } from "@/types";

export function useMeals() {
  const { user, dataUid } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dataUid) {
      setMeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeMeals(dataUid, (updatedMeals) => {
      setMeals(updatedMeals);
      setLoading(false);
    });

    return unsubscribe;
  }, [dataUid]);

  const addMeal = useCallback(
    async (data: CreateMealInput): Promise<string | undefined> => {
      if (!dataUid) return undefined;
      try {
        const id = await createMeal(dataUid, data);
        toast.success("Meal added");
        return id;
      } catch {
        toast.error("Failed to add meal");
        return undefined;
      }
    },
    [dataUid]
  );

  const updateMeal = useCallback(
    async (mealId: string, data: Partial<Meal>) => {
      if (!dataUid) return;
      const prev = meals.find((m) => m.id === mealId);
      setMeals((current) =>
        current.map((m) => (m.id === mealId ? { ...m, ...data } : m))
      );
      try {
        await updateMealService(dataUid, mealId, data);
      } catch {
        if (prev) {
          setMeals((current) =>
            current.map((m) => (m.id === mealId ? prev : m))
          );
        }
        toast.error("Failed to update meal");
      }
    },
    [dataUid, meals]
  );

  const removeMeal = useCallback(
    async (mealId: string) => {
      if (!dataUid) return;
      const prev = meals;
      setMeals((current) => current.filter((m) => m.id !== mealId));
      try {
        await deleteMealService(dataUid, mealId);
        toast.success("Meal deleted");
      } catch {
        setMeals(prev);
        toast.error("Failed to delete meal");
      }
    },
    [dataUid, meals]
  );

  const toggleFavorite = useCallback(
    async (mealId: string) => {
      const meal = meals.find((m) => m.id === mealId);
      if (!meal || !user) return;
      await updateMeal(mealId, { isFavorite: !meal.isFavorite });
    },
    [meals, user, updateMeal]
  );

  const bulkAddMeals = useCallback(
    async (mealInputs: CreateMealInput[]) => {
      if (!dataUid) return;
      try {
        const count = await bulkCreateMealsService(dataUid, mealInputs);
        toast.success(`Added ${count} meals`);
        return count;
      } catch {
        toast.error("Failed to add meals");
        return 0;
      }
    },
    [dataUid]
  );

  return {
    meals,
    loading,
    addMeal,
    updateMeal,
    removeMeal,
    toggleFavorite,
    bulkAddMeals,
  };
}
