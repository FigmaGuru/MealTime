"use client";

import Link from "next/link";
import { format, parseISO, isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DayPlan, Meal } from "@/types";
import { cn } from "@/lib/utils";

interface WeekSummaryProps {
  days: DayPlan[];
  meals: Meal[];
}

export function WeekSummary({ days, meals }: WeekSummaryProps) {
  function getMealTitle(mealId?: string): string | undefined {
    if (!mealId) return undefined;
    return meals.find((m) => m.id === mealId)?.title;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">This Week</CardTitle>
          <Link
            href="/app/plan"
            className="text-sm text-primary hover:underline"
          >
            View plan
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const date = parseISO(day.dateISO);
            const today = isToday(date);
            const mealTitle = getMealTitle(day.mealId);
            return (
              <div
                key={day.dateISO}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-center",
                  today && "border-primary/40 bg-primary/5"
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-medium uppercase",
                    today ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {format(date, "EEE")}
                </p>
                <p
                  className="mt-0.5 text-xs truncate"
                  title={mealTitle}
                >
                  {mealTitle ?? "—"}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
