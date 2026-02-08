import type { Meal } from "@/types";

export interface MealContext {
  titles: string[];
  tags: string[];
  commonIngredients: string[];
}

export function buildMealContext(meals: Meal[]): MealContext {
  const titles = meals.map((m) => m.title);

  const tagCounts = new Map<string, number>();
  meals.forEach((m) =>
    m.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1))
  );
  const tags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t]) => t);

  const ingredientCounts = new Map<string, number>();
  meals.forEach((m) =>
    m.ingredients.forEach((i) => {
      const name = i.name.toLowerCase();
      ingredientCounts.set(name, (ingredientCounts.get(name) ?? 0) + 1);
    })
  );
  const commonIngredients = [...ingredientCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name]) => name);

  return { titles, tags, commonIngredients };
}
