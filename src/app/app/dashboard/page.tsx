"use client";

import { useState, useMemo } from "react";
import { startOfWeek, subWeeks, format } from "date-fns";
import { toast } from "sonner";
import { UtensilsCrossed, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonthCalendar } from "@/components/dashboard/month-calendar";
import { RecentMeals } from "@/components/dashboard/recent-meals";
import { WeeklyNutritionSummary } from "@/components/nutrition/weekly-nutrition-summary";
import { MealPickerDialog } from "@/components/plan/meal-picker-dialog";
import { GeneratePlanDialog } from "@/components/plan/generate-plan-dialog";
import { useAuth } from "@/lib/firebase/auth-context";
import { useMeals } from "@/hooks/use-meals";
import { useWeeklyPlan } from "@/hooks/use-weekly-plan";
import { useMonthNavigation } from "@/hooks/use-month-navigation";
import type { DayPlan } from "@/types";

function MonthTitleBar({
  monthLabel,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
}: {
  monthLabel: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onPreviousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <button
          onClick={onCurrentMonth}
          className="text-lg font-semibold transition-colors hover:text-primary"
        >
          {monthLabel}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { meals } = useMeals();
  const {
    currentMonth,
    monthLabel,
    weeksInMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  } = useMonthNavigation();

  // Current week nutrition
  const currentWeekISO = useMemo(
    () => format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    []
  );
  const { days: currentWeekDays } = useWeeklyPlan(currentWeekISO);

  // Meal picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerWeekISO, setPickerWeekISO] = useState<string>("");
  const [pickerDateISO, setPickerDateISO] = useState<string | null>(null);

  // Generate dialog state
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateWeekISO, setGenerateWeekISO] = useState<string>("");

  // Active week plan — used when picker or generate dialog is interacting
  const activeWeekISO = pickerWeekISO || generateWeekISO || weeksInMonth[0] || "";
  const {
    days: activeDays,
    assignMealToDay,
    removeMealFromDay,
    updateDays,
  } = useWeeklyPlan(activeWeekISO);

  // Previous week relative to generate target — for "exclude last week's meals"
  const previousGenerateWeekISO = useMemo(
    () => generateWeekISO
      ? format(subWeeks(new Date(generateWeekISO + "T00:00:00"), 1), "yyyy-MM-dd")
      : "",
    [generateWeekISO]
  );
  const { days: previousGenerateWeekDays } = useWeeklyPlan(previousGenerateWeekISO);

  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const favoritesCount = meals.filter((m) => m.isFavorite).length;

  function handleAssignMeal(weekStartISO: string, dateISO: string) {
    setPickerWeekISO(weekStartISO);
    setPickerDateISO(dateISO);
    setPickerOpen(true);
  }

  function handleMealSelected(mealId: string) {
    if (pickerDateISO) {
      assignMealToDay(pickerDateISO, mealId);
    }
  }

  function handleRemoveMeal(weekStartISO: string, dateISO: string) {
    setPickerWeekISO(weekStartISO);
    // Use requestAnimationFrame to let state settle before calling remove
    requestAnimationFrame(() => {
      removeMealFromDay(dateISO);
    });
  }

  function handleGeneratePlan(weekStartISO: string) {
    setGenerateWeekISO(weekStartISO);
    setGenerateOpen(true);
  }

  async function handleApplyGeneratedPlan(generatedDays: DayPlan[]) {
    try {
      await updateDays(generatedDays);
      toast.success("Meal plan updated");
    } catch {
      // Error toast is already shown by useWeeklyPlan
    }
  }

  return (
    <div className="space-y-6">
      {/* Greeting + stats bar — sticky below toolbar */}
      <div className="sticky top-12 z-20 -mx-4 bg-background px-4 pb-2 pt-0 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-semibold">
            {getGreeting()}, {firstName}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <UtensilsCrossed className="h-4 w-4" />
              {meals.length} meals
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              {favoritesCount} favorites
            </span>
          </div>
        </div>
      </div>

      {/* Month title — sticky below greeting */}
      <div className="sticky top-[7rem] z-10 -mx-4 bg-background px-4 pb-3 pt-0 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <MonthTitleBar
          monthLabel={monthLabel}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onCurrentMonth={goToCurrentMonth}
        />
      </div>

      {/* Month calendar (week rows only) */}
      <MonthCalendar
        currentMonth={currentMonth}
        weeksInMonth={weeksInMonth}
        meals={meals}
        onAssignMeal={handleAssignMeal}
        onRemoveMeal={handleRemoveMeal}
        onGeneratePlan={handleGeneratePlan}
      />

      {/* Family nutrition summary */}
      <WeeklyNutritionSummary days={currentWeekDays} meals={meals} />

      {/* Recent meals */}
      <RecentMeals meals={meals} />

      {/* Meal picker dialog */}
      <MealPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        meals={meals}
        onSelect={handleMealSelected}
      />

      {/* Generate plan dialog */}
      {generateWeekISO && (
        <GeneratePlanDialog
          open={generateOpen}
          onOpenChange={setGenerateOpen}
          meals={meals}
          weekStartISO={generateWeekISO}
          previousMealIds={previousGenerateWeekDays
            .filter((d) => d.mealId)
            .map((d) => d.mealId!)}
          onApply={handleApplyGeneratedPlan}
        />
      )}
    </div>
  );
}
