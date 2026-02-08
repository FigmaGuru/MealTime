export interface Ingredient {
  name: string;
  quantity?: string;
  unit?: string;
  notes?: string;
}

export interface NutritionInfo {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
}

export interface Meal {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  ingredients: Ingredient[];
  steps: string[];
  isFavorite: boolean;
  nutrition?: NutritionInfo;
  createdAt: number;
  updatedAt: number;
}

export type CreateMealInput = Omit<Meal, "id" | "createdAt" | "updatedAt">;

export interface MealSuggestion {
  title: string;
  description: string;
  tags: string[];
  reason: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  ingredients: Ingredient[];
  steps: string[];
  nutrition?: NutritionInfo;
}

export interface DayPlan {
  dateISO: string;
  mealId?: string;
  skipped?: boolean;
}

export interface WeeklyPlan {
  id: string;
  weekStartISO: string;
  days: DayPlan[];
  createdAt: number;
  updatedAt: number;
}

export type WeeklyPlanInput = Omit<WeeklyPlan, "id" | "createdAt" | "updatedAt">;

export type IngredientCategory =
  | "produce"
  | "meat"
  | "dairy"
  | "grains"
  | "canned"
  | "spices"
  | "other";

export interface ShoppingItem {
  name: string;
  quantity?: string;
  unit?: string;
  category: IngredientCategory;
  checked: boolean;
  fromMeals: string[];
}

export interface FamilyNutritionConfig {
  adults: number;
  children: number;
  childPortionPercent: number;
}

export const DEFAULT_FAMILY_CONFIG: FamilyNutritionConfig = {
  adults: 2,
  children: 2,
  childPortionPercent: 0.65,
};

/** Context sent to the meal chat API so the AI can answer from real data. */
export interface MealChatContext {
  /** Meal library: title, id, tags, prep+cook time, favorite, ingredients count */
  mealsSummary: {
    id: string;
    title: string;
    tags: string[];
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    isFavorite: boolean;
    ingredientsCount: number;
  }[];
  /** This week: dateISO -> meal title (or "nothing planned") */
  weekPlan: { dateISO: string; dayName: string; mealTitle: string | null }[];
  /** Today's date (yyyy-MM-dd) and dinner for today */
  today: { dateISO: string; dayName: string; mealTitle: string | null };
  /** Total meals and favorites count */
  counts: { totalMeals: number; favorites: number };
}
