import type { Meal } from "@/types";

export function parseBulkMealInput(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function findDuplicates(
  newNames: string[],
  existingMeals: Meal[]
): Set<string> {
  const existingTitles = new Set(
    existingMeals.map((m) => m.title.toLowerCase())
  );
  return new Set(
    newNames.filter((name) => existingTitles.has(name.toLowerCase()))
  );
}
