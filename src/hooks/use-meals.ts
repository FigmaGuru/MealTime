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
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMeals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeMeals(user.uid, (updatedMeals) => {
      setMeals(updatedMeals);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addMeal = useCallback(
    async (data: CreateMealInput): Promise<string | undefined> => {
      if (!user) return undefined;
      try {
        const id = await createMeal(user.uid, data);
        toast.success("Meal added");
        return id;
      } catch {
        toast.error("Failed to add meal");
        return undefined;
      }
    },
    [user]
  );

  const updateMeal = useCallback(
    async (mealId: string, data: Partial<Meal>) => {
      if (!user) return;
      const prev = meals.find((m) => m.id === mealId);
      // Optimistic update
      setMeals((current) =>
        current.map((m) => (m.id === mealId ? { ...m, ...data } : m))
      );
      try {
        await updateMealService(user.uid, mealId, data);
      } catch {
        // Revert
        if (prev) {
          setMeals((current) =>
            current.map((m) => (m.id === mealId ? prev : m))
          );
        }
        toast.error("Failed to update meal");
      }
    },
    [user, meals]
  );

  const removeMeal = useCallback(
    async (mealId: string) => {
      if (!user) return;
      const prev = meals;
      // Optimistic update
      setMeals((current) => current.filter((m) => m.id !== mealId));
      try {
        await deleteMealService(user.uid, mealId);
        toast.success("Meal deleted");
      } catch {
        setMeals(prev);
        toast.error("Failed to delete meal");
      }
    },
    [user, meals]
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
      if (!user) return;
      try {
        const count = await bulkCreateMealsService(user.uid, mealInputs);
        toast.success(`Added ${count} meals`);
        return count;
      } catch {
        toast.error("Failed to add meals");
        return 0;
      }
    },
    [user]
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
