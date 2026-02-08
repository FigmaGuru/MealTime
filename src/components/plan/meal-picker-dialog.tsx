"use client";

import { useState, useMemo } from "react";
import { Search, UtensilsCrossed, Heart, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Meal } from "@/types";

interface MealPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meals: Meal[];
  onSelect: (mealId: string) => void;
  previousWeekMealIds?: string[];
}

export function MealPickerDialog({
  open,
  onOpenChange,
  meals,
  onSelect,
  previousWeekMealIds = [],
}: MealPickerDialogProps) {
  const [search, setSearch] = useState("");

  const favorites = useMemo(
    () => meals.filter((m) => m.isFavorite),
    [meals]
  );

  const previousWeekMeals = useMemo(
    () =>
      previousWeekMealIds.length > 0
        ? meals.filter((m) => previousWeekMealIds.includes(m.id))
        : [],
    [meals, previousWeekMealIds]
  );

  const filtered = useMemo(
    () =>
      meals.filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase())
      ),
    [meals, search]
  );

  function handleSelect(mealId: string) {
    onSelect(mealId);
    setSearch("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose a meal</DialogTitle>
        </DialogHeader>

        {/* Favorites quick-select */}
        {favorites.length > 0 && !search && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              Favorites
            </p>
            <div className="flex flex-wrap gap-1.5">
              {favorites.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => handleSelect(meal.id)}
                  className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {meal.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Used last week */}
        {previousWeekMeals.length > 0 && !search && (
          <>
            <Separator />
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Used last week
              </p>
              <div className="flex flex-wrap gap-1.5">
                {previousWeekMeals.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => handleSelect(meal.id)}
                    className="inline-flex items-center rounded-full border border-dashed bg-background px-3 py-1 text-xs transition-colors hover:bg-accent"
                  >
                    {meal.title}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {(favorites.length > 0 || previousWeekMeals.length > 0) && !search && (
          <Separator />
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* All meals list */}
        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <UtensilsCrossed className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No meals found</p>
            </div>
          ) : (
            filtered.map((meal) => {
              const totalTime =
                (meal.prepTimeMinutes ?? 0) + (meal.cookTimeMinutes ?? 0);
              return (
                <button
                  key={meal.id}
                  onClick={() => handleSelect(meal.id)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {meal.isFavorite && (
                      <Heart className="h-3 w-3 shrink-0 fill-red-500 text-red-500" />
                    )}
                    <span className="font-medium truncate">{meal.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {totalTime > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {totalTime}m
                      </span>
                    )}
                    {meal.tags.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs font-normal"
                      >
                        {meal.tags[0]}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
