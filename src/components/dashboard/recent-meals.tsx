"use client";

import Link from "next/link";
import { Clock, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Meal } from "@/types";
import { cn } from "@/lib/utils";

interface RecentMealsProps {
  meals: Meal[];
}

export function RecentMeals({ meals }: RecentMealsProps) {
  const recent = meals.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Meals</CardTitle>
          <Link
            href="/app/meals"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {recent.map((meal) => {
            const totalTime =
              (meal.prepTimeMinutes ?? 0) + (meal.cookTimeMinutes ?? 0);
            return (
              <div
                key={meal.id}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors duration-200 hover:bg-accent/50"
              >
                <span className="font-medium truncate">{meal.title}</span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {totalTime > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {totalTime}m
                    </span>
                  )}
                  {meal.isFavorite && (
                    <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
