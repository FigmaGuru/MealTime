import { format, parseISO } from "date-fns";
import type { Meal, DayPlan } from "@/types";
import type { MealChatContext } from "@/types";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getDayName(dateISO: string): string {
  const date = parseISO(dateISO);
  const dayIndex = date.getDay();
  // getDay(): 0 = Sunday, 1 = Monday, ...
  const index = dayIndex === 0 ? 6 : dayIndex - 1;
  return DAY_NAMES[index] ?? dateISO;
}

/**
 * Build context for the meal chat API from current meals and week plan.
 * Used by the chat page to send a concise summary so the AI can answer
 * "what's for dinner?", "what's planned?", etc.
 */
export function buildMealChatContext(
  meals: Meal[],
  days: DayPlan[],
  todayISO: string
): MealChatContext {
  const mealMap = new Map(meals.map((m) => [m.id, m]));

  const weekPlan = days.map((d) => {
    const meal = d.mealId ? mealMap.get(d.mealId) : undefined;
    return {
      dateISO: d.dateISO,
      dayName: getDayName(d.dateISO),
      mealTitle: meal?.title ?? null,
    };
  });

  const todayEntry = weekPlan.find((d) => d.dateISO === todayISO) ?? {
    dateISO: todayISO,
    dayName: getDayName(todayISO),
    mealTitle: null as string | null,
  };

  const mealsSummary = meals.map((m) => ({
    id: m.id,
    title: m.title,
    tags: m.tags,
    prepTimeMinutes: m.prepTimeMinutes,
    cookTimeMinutes: m.cookTimeMinutes,
    isFavorite: m.isFavorite,
    ingredientsCount: m.ingredients.length,
  }));

  return {
    mealsSummary,
    weekPlan,
    today: todayEntry,
    counts: {
      totalMeals: meals.length,
      favorites: meals.filter((m) => m.isFavorite).length,
    },
  };
}

/** Format context for the system prompt (read-only summary for the model). */
export function formatMealChatContextForPrompt(ctx: MealChatContext): string {
  const todayLine =
    ctx.today.mealTitle != null
      ? `Tonight (${ctx.today.dayName} ${ctx.today.dateISO}) they're having: ${ctx.today.mealTitle}.`
      : `Tonight (${ctx.today.dayName} ${ctx.today.dateISO}) nothing is planned yet.`;

  const weekLines = ctx.weekPlan
    .map(
      (d) =>
        `  ${d.dayName} ${d.dateISO}: ${d.mealTitle ?? "nothing planned"}`
    )
    .join("\n");

  const favorites = ctx.mealsSummary.filter((m) => m.isFavorite).map((m) => m.title);
  const allTitles = ctx.mealsSummary.map((m) => m.title);

  return `
The user has a meal planning app. Answer only from the following context.

Counts: ${ctx.counts.totalMeals} meals in library, ${ctx.counts.favorites} favorites.

${todayLine}

This week's plan:
${weekLines}

Meal library (titles): ${allTitles.join(", ")}.
Favorite meals: ${favorites.length ? favorites.join(", ") : "none"}.

For each meal in the library you have: title, tags, prep/cook time, favorite flag, and ingredient count. If the user asks for steps or ingredients for a specific meal, say you can only summarize from the library list and suggest they open the meal in the app for full details.
Be concise and helpful. If something isn't planned or unknown, say so.
`.trim();
}
