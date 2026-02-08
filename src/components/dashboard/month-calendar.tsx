"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Plus, X, Sparkles } from "lucide-react";
import { format, parseISO, isToday, addDays, isSameMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWeeklyPlan } from "@/hooks/use-weekly-plan";
import type { Meal, DayPlan } from "@/types";

interface MonthCalendarProps {
  currentMonth: Date;
  weeksInMonth: string[];
  meals: Meal[];
  onAssignMeal: (weekStartISO: string, dateISO: string) => void;
  onRemoveMeal: (weekStartISO: string, dateISO: string) => void;
  onGeneratePlan: (weekStartISO: string) => void;
}

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WeekRow({
  weekStartISO,
  currentMonth,
  meals,
  defaultExpanded,
  onAssignMeal,
  onRemoveMeal,
  onGenerate,
}: {
  weekStartISO: string;
  currentMonth: Date;
  meals: Meal[];
  defaultExpanded: boolean;
  onAssignMeal: (weekStartISO: string, dateISO: string) => void;
  onRemoveMeal: (weekStartISO: string, dateISO: string) => void;
  onGenerate: (weekStartISO: string) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { days, loading } = useWeeklyPlan(weekStartISO);

  const weekDays = useMemo(() => {
    const start = parseISO(weekStartISO);
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      const dateISO = format(date, "yyyy-MM-dd");
      const dayPlan = days.find((d) => d.dateISO === dateISO);
      return { date, dateISO, dayPlan };
    });
  }, [weekStartISO, days]);

  const plannedCount = days.filter((d) => d.mealId).length;
  const weekLabel = `${format(parseISO(weekStartISO), "MMM d")}`;

  function getMealTitle(mealId?: string): string | undefined {
    if (!mealId) return undefined;
    return meals.find((m) => m.id === mealId)?.title;
  }

  return (
    <div className="rounded-lg border bg-card">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
        className="flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm transition-colors duration-200 hover:bg-accent/50"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{weekLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {plannedCount}/7 planned
          </span>
          {expanded && (
            <Button
              variant="ghost"
              size="xs"
              className="h-6 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onGenerate(weekStartISO);
              }}
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Generate
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t px-3 py-3">
          {loading ? (
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
              {weekDays.map(({ date, dateISO, dayPlan }) => {
                const today = isToday(date);
                const inMonth = isSameMonth(date, currentMonth);
                const mealTitle = getMealTitle(dayPlan?.mealId);

                return (
                  <div
                    key={dateISO}
                    className={cn(
                      "group relative flex min-h-[5rem] flex-col rounded-md border p-2 transition-colors duration-200",
                      today && "border-primary/50 bg-primary/5",
                      !inMonth && "opacity-40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          today
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {format(date, "d")}
                      </span>
                      {today && (
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-primary">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex-1">
                      {mealTitle ? (
                        <div className="group/meal flex items-start gap-1">
                          <span className="flex-1 text-xs leading-tight line-clamp-2">
                            {mealTitle}
                          </span>
                          <button
                            onClick={() =>
                              onRemoveMeal(weekStartISO, dateISO)
                            }
                            className="mt-0.5 shrink-0 opacity-0 transition-opacity duration-200 group-hover/meal:opacity-100 focus:opacity-100"
                            aria-label={`Remove meal from ${format(date, "EEE MMM d")}`}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            onAssignMeal(weekStartISO, dateISO)
                          }
                          className="flex h-full w-full items-center justify-center rounded border border-dashed border-border text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
                          aria-label={`Add meal to ${format(date, "EEE MMM d")}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MonthCalendar({
  currentMonth,
  weeksInMonth,
  meals,
  onAssignMeal,
  onRemoveMeal,
  onGeneratePlan,
}: MonthCalendarProps) {
  // Current week ISO for determining which week to expand by default
  const todayISO = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-3">
      {/* Day headers (visible on lg+) */}
      <div className="hidden lg:grid lg:grid-cols-7 gap-1.5 px-3">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Week rows */}
      <div className="space-y-2">
        {weeksInMonth.map((weekStartISO) => {
          // Expand the week that contains today
          const weekEnd = format(addDays(parseISO(weekStartISO), 6), "yyyy-MM-dd");
          const containsToday = todayISO >= weekStartISO && todayISO <= weekEnd;

          return (
            <WeekRow
              key={weekStartISO}
              weekStartISO={weekStartISO}
              currentMonth={currentMonth}
              meals={meals}
              defaultExpanded={containsToday}
              onAssignMeal={onAssignMeal}
              onRemoveMeal={onRemoveMeal}
              onGenerate={onGeneratePlan}
            />
          );
        })}
      </div>
    </div>
  );
}
