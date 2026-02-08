"use client";

import { useState } from "react";
import { Sparkles, Plus, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MealSuggestion, CreateMealInput, Meal } from "@/types";
import { useSuggestions } from "@/hooks/use-suggestions";

interface SuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meals: Meal[];
  onAddMeal: (data: CreateMealInput) => Promise<string | undefined | void>;
}

export function SuggestionsDialog({
  open,
  onOpenChange,
  meals,
  onAddMeal,
}: SuggestionsDialogProps) {
  const { suggestions, loading, fetchSuggestions, clearSuggestions } = useSuggestions();
  const [addedTitles, setAddedTitles] = useState<Set<string>>(new Set());

  function handleOpenChange(isOpen: boolean) {
    onOpenChange(isOpen);
    if (isOpen && suggestions.length === 0) {
      fetchSuggestions(meals);
    }
    if (!isOpen) {
      setAddedTitles(new Set());
      clearSuggestions();
    }
  }

  async function handleAdd(suggestion: MealSuggestion) {
    await onAddMeal({
      title: suggestion.title,
      description: suggestion.description,
      tags: suggestion.tags,
      prepTimeMinutes: suggestion.prepTimeMinutes,
      cookTimeMinutes: suggestion.cookTimeMinutes,
      servings: suggestion.servings,
      ingredients: suggestion.ingredients,
      steps: suggestion.steps,
      isFavorite: false,
      nutrition: suggestion.nutrition,
    });
    setAddedTitles((prev) => new Set(prev).add(suggestion.title));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Meal Suggestions
          </DialogTitle>
          <DialogDescription>
            Personalized meal ideas based on your library
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s, i) => {
              const isAdded = addedTitles.has(s.title);
              return (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium">{s.title}</h4>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {s.description}
                        </p>
                        <p className="mt-1 text-xs italic text-primary">
                          {s.reason}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {s.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {s.nutrition && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {s.nutrition.calories} cal &middot;{" "}
                            {s.nutrition.proteinG}g protein &middot;{" "}
                            {s.nutrition.carbsG}g carbs &middot;{" "}
                            {s.nutrition.fatG}g fat
                          </p>
                        )}
                      </div>
                      <Button
                        variant={isAdded ? "ghost" : "outline"}
                        size="sm"
                        disabled={isAdded}
                        onClick={() => handleAdd(s)}
                      >
                        {isAdded ? (
                          <>
                            <Check className="mr-1 h-4 w-4" /> Added
                          </>
                        ) : (
                          <>
                            <Plus className="mr-1 h-4 w-4" /> Add
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => fetchSuggestions(meals)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{" "}
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-4 w-4" /> Get New Suggestions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
