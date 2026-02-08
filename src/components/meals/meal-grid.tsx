"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import type { Meal } from "@/types";
import { MealCard } from "./meal-card";
import { MealCardSkeleton } from "./meal-card-skeleton";

interface MealGridProps {
  meals: Meal[];
  loading: boolean;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
  onToggleFavorite: (mealId: string) => void;
}

export function MealGrid({
  meals,
  loading,
  onEdit,
  onDelete,
  onToggleFavorite,
}: MealGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MealCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {meals.map((meal) => (
        <motion.div key={meal.id} variants={fadeInUp} layout>
          <MealCard
            meal={meal}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
