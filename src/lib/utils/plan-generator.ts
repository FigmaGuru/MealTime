import type { Meal, DayPlan } from "@/types";
import { format, addDays } from "date-fns";

export interface GeneratePlanOptions {
  meals: Meal[];
  weekStartISO: string;
  newMealsCount: number;
  includeFavorites: boolean;
  excludeTags: string[];
  maxPrepTimeMinutes?: number;
  previousMealIds?: string[];
  selectedDays?: boolean[];
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateWeeklyPlan(options: GeneratePlanOptions): DayPlan[] {
  const {
    meals,
    weekStartISO,
    newMealsCount,
    includeFavorites,
    excludeTags,
    maxPrepTimeMinutes,
    previousMealIds = [],
    selectedDays = [true, true, true, true, true, true, true],
  } = options;

  const slotsToFill = selectedDays.filter(Boolean).length;

  // Filter eligible meals
  const eligible = meals.filter((m) => {
    if (excludeTags.some((tag) => m.tags.includes(tag))) return false;
    if (
      maxPrepTimeMinutes &&
      m.prepTimeMinutes &&
      m.prepTimeMinutes > maxPrepTimeMinutes
    )
      return false;
    return true;
  });

  const favorites = shuffle(eligible.filter((m) => m.isFavorite));
  const nonFavorites = shuffle(eligible.filter((m) => !m.isFavorite));

  const selected: Meal[] = [];
  const usedIds = new Set<string>();

  // Place favorites first if toggle is on
  if (includeFavorites) {
    const favCount = Math.min(favorites.length, Math.max(slotsToFill - newMealsCount, 0));
    for (let i = 0; i < favCount && selected.length < slotsToFill; i++) {
      selected.push(favorites[i]);
      usedIds.add(favorites[i].id);
    }
  }

  // Fill with "new" meals (not in previous plan)
  const newMeals = shuffle(
    nonFavorites.filter(
      (m) => !previousMealIds.includes(m.id) && !usedIds.has(m.id)
    )
  );
  for (const meal of newMeals) {
    if (selected.length >= slotsToFill) break;
    if (selected.length < slotsToFill - (slotsToFill - newMealsCount - selected.length)) {
      selected.push(meal);
      usedIds.add(meal.id);
    }
  }

  // Fill remaining slots from any eligible meal
  const remaining = [
    ...newMeals.filter((m) => !usedIds.has(m.id)),
    ...favorites.filter((m) => !usedIds.has(m.id)),
    ...nonFavorites.filter((m) => !usedIds.has(m.id)),
  ];
  for (const meal of remaining) {
    if (selected.length >= slotsToFill) break;
    selected.push(meal);
    usedIds.add(meal.id);
  }

  // Shuffle final selection for random day assignment
  const finalSelection = shuffle(selected);

  // Build day plans — only assign meals to selected days
  // Avoid setting properties to `undefined` — Firestore rejects undefined values.
  const start = new Date(weekStartISO + "T00:00:00");
  let mealIndex = 0;
  return Array.from({ length: 7 }, (_, i) => {
    const day: DayPlan = { dateISO: format(addDays(start, i), "yyyy-MM-dd") };
    if (selectedDays[i]) {
      const meal = finalSelection[mealIndex++];
      if (meal) day.mealId = meal.id;
    } else {
      day.skipped = true;
    }
    return day;
  });
}
