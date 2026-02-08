"use client";

import { Heart, Pencil, Trash2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NutritionBadge } from "@/components/nutrition/nutrition-badge";
import type { Meal } from "@/types";
import { cn } from "@/lib/utils";

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
  onToggleFavorite: (mealId: string) => void;
}

export function MealCard({ meal, onEdit, onDelete, onToggleFavorite }: MealCardProps) {
  const totalTime =
    (meal.prepTimeMinutes ?? 0) + (meal.cookTimeMinutes ?? 0);

  return (
    <Card className="group relative transition-all duration-200 ease-out hover:bg-accent/30 hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <button
              onClick={() => onEdit(meal)}
              className="text-left w-full"
              aria-label={`Edit ${meal.title}`}
            >
              <h3 className="font-medium leading-snug truncate">{meal.title}</h3>
            </button>
            {meal.description && (
              <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                {meal.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleFavorite(meal.id)}
              aria-label={meal.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  meal.isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                )}
              />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
              onClick={() => onEdit(meal)}
              aria-label={`Edit ${meal.title}`}
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:text-destructive"
              onClick={() => onDelete(meal)}
              aria-label={`Delete ${meal.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {meal.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
          {totalTime > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {totalTime} min
            </span>
          )}
          {meal.servings && (
            <span className="text-xs text-muted-foreground">
              {meal.servings} servings
            </span>
          )}
          {meal.nutrition && <NutritionBadge nutrition={meal.nutrition} />}
        </div>
      </CardContent>
    </Card>
  );
}
