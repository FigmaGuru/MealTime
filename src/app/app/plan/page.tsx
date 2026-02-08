"use client";

import { useState, useMemo } from "react";
import { subWeeks, format } from "date-fns";
import { toast } from "sonner";
import { Sparkles, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { WeekNavigator } from "@/components/plan/week-navigator";
import { WeeklyPlanBoard } from "@/components/plan/weekly-plan-board";
import { MealPickerDialog } from "@/components/plan/meal-picker-dialog";
import { GeneratePlanDialog } from "@/components/plan/generate-plan-dialog";
import { ShoppingListDialog } from "@/components/plan/shopping-list-dialog";
import { useMeals } from "@/hooks/use-meals";
import { useWeeklyPlan } from "@/hooks/use-weekly-plan";
import { useWeekNavigation } from "@/hooks/use-week-navigation";
import type { DayPlan } from "@/types";

export default function PlanPage() {
  const {
    currentWeekStart,
    weekStartISO,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  } = useWeekNavigation();

  const { meals } = useMeals();
  const {
    days,
    loading,
    assignMealToDay,
    removeMealFromDay,
    moveMeal,
    updateDays,
  } = useWeeklyPlan(weekStartISO);

  const previousWeekISO = useMemo(
    () => format(subWeeks(currentWeekStart, 1), "yyyy-MM-dd"),
    [currentWeekStart]
  );
  const { days: previousWeekDays } = useWeeklyPlan(previousWeekISO);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDateISO, setPickerDateISO] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [shoppingListOpen, setShoppingListOpen] = useState(false);

  function handleAssignMeal(dateISO: string) {
    setPickerDateISO(dateISO);
    setPickerOpen(true);
  }

  function handleMealSelected(mealId: string) {
    if (pickerDateISO) {
      assignMealToDay(pickerDateISO, mealId);
    }
  }

  function handleRegenerateMeal(dateISO: string) {
    const usedMealIds = new Set(days.filter((d) => d.mealId).map((d) => d.mealId!));
    const eligible = meals.filter((m) => !usedMealIds.has(m.id));
    if (eligible.length === 0) return;
    const randomMeal = eligible[Math.floor(Math.random() * eligible.length)];
    assignMealToDay(dateISO, randomMeal.id);
  }

  async function handleApplyGeneratedPlan(generatedDays: DayPlan[]) {
    await updateDays(generatedDays);
    toast.success("Meal plan updated");
  }

  return (
    <>
      <PageHeader title="Weekly Plan">
        <WeekNavigator
          currentWeekStart={currentWeekStart}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onCurrentWeek={goToCurrentWeek}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShoppingListOpen(true)}
          disabled={days.filter((d) => d.mealId).length === 0}
        >
          <ShoppingCart className="mr-1.5 h-4 w-4" />
          Shopping List
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setGenerateOpen(true)}
          disabled={meals.length === 0}
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          Generate
        </Button>
      </PageHeader>

      <WeeklyPlanBoard
        days={days}
        meals={meals}
        loading={loading}
        onMoveMeal={moveMeal}
        onAssignMeal={handleAssignMeal}
        onRemoveMeal={removeMealFromDay}
        onRegenerateMeal={handleRegenerateMeal}
      />

      <MealPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        meals={meals}
        onSelect={handleMealSelected}
      />

      <GeneratePlanDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        meals={meals}
        weekStartISO={weekStartISO}
        previousMealIds={previousWeekDays.filter((d) => d.mealId).map((d) => d.mealId!)}
        onApply={handleApplyGeneratedPlan}
      />

      <ShoppingListDialog
        open={shoppingListOpen}
        onOpenChange={setShoppingListOpen}
        days={days}
        meals={meals}
      />
    </>
  );
}
