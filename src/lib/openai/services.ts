import { getOpenAIClient } from "./client";
import { formatMealChatContextForPrompt } from "@/lib/utils/chat-context";
import type {
  MealChatContext,
  CreateMealInput,
  Ingredient,
  MealSuggestion,
  NutritionInfo,
} from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeAddMeal(raw: unknown): CreateMealInput | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  if (!title) return null;

  const tags = Array.isArray(o.tags)
    ? (o.tags as unknown[])
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter(Boolean)
    : [];
  const ingredients: Ingredient[] = Array.isArray(o.ingredients)
    ? (o.ingredients as unknown[])
        .map((i) => {
          if (i && typeof i === "object" && "name" in i) {
            const ing = i as Record<string, unknown>;
            return {
              name: typeof ing.name === "string" ? ing.name : "",
              quantity:
                typeof ing.quantity === "string" ? ing.quantity : undefined,
              unit: typeof ing.unit === "string" ? ing.unit : undefined,
            };
          }
          return { name: String(i) };
        })
        .filter((i) => i.name)
    : [];
  const steps: string[] = Array.isArray(o.steps)
    ? (o.steps as unknown[])
        .map((s) => (typeof s === "string" ? s.trim() : String(s)))
        .filter(Boolean)
    : [];

  const prepTimeMinutes =
    typeof o.prepTimeMinutes === "number" ? o.prepTimeMinutes : undefined;
  const cookTimeMinutes =
    typeof o.cookTimeMinutes === "number" ? o.cookTimeMinutes : undefined;
  const servings = typeof o.servings === "number" ? o.servings : undefined;
  const description =
    typeof o.description === "string"
      ? o.description.trim() || undefined
      : undefined;

  let nutrition = undefined;
  if (o.nutrition && typeof o.nutrition === "object") {
    const n = o.nutrition as Record<string, unknown>;
    if (
      typeof n.calories === "number" &&
      typeof n.proteinG === "number" &&
      typeof n.carbsG === "number" &&
      typeof n.fatG === "number"
    ) {
      nutrition = {
        calories: n.calories,
        proteinG: n.proteinG,
        carbsG: n.carbsG,
        fatG: n.fatG,
        fiberG: typeof n.fiberG === "number" ? n.fiberG : 0,
        sugarG: typeof n.sugarG === "number" ? n.sugarG : 0,
        sodiumMg: typeof n.sodiumMg === "number" ? n.sodiumMg : 0,
      };
    }
  }

  return {
    title,
    description,
    tags,
    prepTimeMinutes,
    cookTimeMinutes,
    servings,
    ingredients: ingredients.length ? ingredients : [{ name: title }],
    steps: steps.length ? steps : ["See recipe."],
    isFavorite: false,
    nutrition,
  };
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export async function chatWithAI(
  message: string,
  context: MealChatContext
): Promise<{ reply: string; addMeal?: CreateMealInput }> {
  const contextBlock = formatMealChatContextForPrompt(context);

  const systemPrompt = `You are the MealTime assistant. You help the user with their meal library and weekly plan.

${contextBlock}

For normal questions (what's for dinner, what's planned, etc.), answer ONLY from the context above. Do not make up meals or dates.

When the user asks to ADD or CREATE a meal (e.g. "add a Greek salad", "suggest a quick pasta and add it", "create a meal for tacos"), you must:
1. Reply with a short message (e.g. "Here's a Greek salad you can add to your library. Click Add to library below.")
2. Include a valid addMeal object in your JSON so the app can add the meal. You may invent the meal details (ingredients, steps) when the user asks to add a meal.
Household constraint: Meals must be suitable for 2 children who don't really like vegetables. Prefer child-friendly options (pasta, nuggets, tacos, pizza, etc.); keep vegetables minimal or optional; avoid veg-heavy or salad-focused dishes unless the user explicitly asks for them.

Return a JSON object with exactly:
- reply (string): your message to the user.
- addMeal (object, only when the user asked to add/create a meal): title (string), description (string, 1-2 sentences, optional), tags (array of strings), ingredients (array of {name, quantity?, unit?}), steps (array of strings), prepTimeMinutes (number, optional), cookTimeMinutes (number, optional), servings (number, optional), isFavorite (false), nutrition (optional: calories, proteinG, carbsG, fatG, fiberG, sugarG, sodiumMg).

For addMeal: ingredients and steps must be non-empty arrays. Use sensible defaults if the user only gave a title. Do not include addMeal when the user is only asking a question (e.g. "what's for dinner?").`;

  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message.trim() },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    return { reply: "I couldn't generate a reply. Try again." };
  }

  let reply = "I couldn't generate a reply. Try again.";
  let addMeal: CreateMealInput | undefined = undefined;

  try {
    const parsed = JSON.parse(content) as {
      reply?: string;
      addMeal?: unknown;
    };
    reply =
      typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : reply;
    if (parsed.addMeal != null) {
      addMeal = normalizeAddMeal(parsed.addMeal) ?? undefined;
    }
  } catch {
    reply = content;
  }

  return { reply, addMeal };
}

// ---------------------------------------------------------------------------
// Suggestions
// ---------------------------------------------------------------------------

export async function generateSuggestions(
  mealContext: {
    titles: string[];
    tags: string[];
    commonIngredients: string[];
  },
  count: number = 3,
  previousSuggestionTitles: string[] = []
): Promise<MealSuggestion[]> {
  const openai = getOpenAIClient();

  const allExistingTitles = mealContext.titles.join(", ");
  const previousTitles = previousSuggestionTitles.join(", ");

  const avoidClause = previousTitles
    ? `\nIMPORTANT: Do NOT suggest any of these existing meals: ${allExistingTitles}. Also avoid these previously suggested meals: ${previousTitles}.`
    : `\nIMPORTANT: Do NOT suggest any of these existing meals: ${allExistingTitles}.`;

  const systemPrompt = `You are a creative meal planning assistant. Based on the user's existing meal library, suggest new meals they might enjoy. All suggestions must be suitable for a household with 2 children who don't really like vegetables: prefer child-friendly meals (e.g. pasta, nuggets, tacos, pizza, mac and cheese), keep vegetables minimal or easy to omit, and avoid veg-heavy or salad-focused dishes. Return ONLY valid JSON.`;

  const userPrompt = `Here are the meals in my library:
Titles: ${mealContext.titles.join(", ")}
Common tags: ${mealContext.tags.join(", ")}
Frequently used ingredients: ${mealContext.commonIngredients.join(", ")}
${avoidClause}

Household: 2 children who don't really like vegetables — suggest meals that are child-friendly and not veg-heavy (minimal or optional veg only).

Suggest ${count} NEW meal ideas I haven't tried. For each, provide:
- title
- description (1-2 sentences)
- tags (array of cuisine/category tags)
- reason (why this fits my preferences)
- prepTimeMinutes
- cookTimeMinutes
- servings
- ingredients (array of {name, quantity, unit})
- steps (array of instruction strings)
- nutrition (per serving: {calories, proteinG, carbsG, fatG, fiberG, sugarG, sodiumMg})

Return as JSON: { "suggestions": [...] }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return [];

  const parsed = JSON.parse(content) as { suggestions: MealSuggestion[] };

  const existingSet = new Set(
    mealContext.titles.map((t) => t.toLowerCase().trim())
  );
  const previousSet = new Set(
    previousSuggestionTitles.map((t) => t.toLowerCase().trim())
  );

  return (parsed.suggestions ?? []).filter((s) => {
    const normalized = s.title.toLowerCase().trim();
    return !existingSet.has(normalized) && !previousSet.has(normalized);
  });
}

// ---------------------------------------------------------------------------
// Enrich
// ---------------------------------------------------------------------------

export async function enrichMeal(
  title: string,
  tags?: string[]
): Promise<{
  description?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  ingredients?: Ingredient[];
  steps?: string[];
  nutrition?: NutritionInfo;
} | null> {
  if (!title?.trim()) return null;

  const openai = getOpenAIClient();
  const tagHint =
    tags && tags.length > 0
      ? `\nTags/cuisine hints: ${tags.join(", ")}`
      : "";

  const userPrompt = `Meal title: "${title}"${tagHint}

Generate the following details for this meal:
- description (1-2 sentences)
- prepTimeMinutes (number)
- cookTimeMinutes (number)
- servings (number)
- ingredients (array of {name, quantity, unit})
- steps (array of instruction strings)
- nutrition (per serving: {calories, proteinG, carbsG, fatG, fiberG, sugarG, sodiumMg})

Return as JSON: { "enrichment": { ... } }`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful meal planning assistant. Given a meal title, generate rich details for it. Return ONLY valid JSON.",
      },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as Record<string, unknown>;
  return (parsed.enrichment as {
    description?: string;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    servings?: number;
    ingredients?: Ingredient[];
    steps?: string[];
    nutrition?: NutritionInfo;
  }) ?? null;
}

// ---------------------------------------------------------------------------
// Nutrition
// ---------------------------------------------------------------------------

export async function estimateNutrition(
  ingredients: Ingredient[],
  servings: number = 1
): Promise<NutritionInfo | null> {
  if (ingredients.filter((i) => i.name.trim()).length === 0) return null;

  const openai = getOpenAIClient();
  const ingredientList = ingredients
    .map((i) => `${i.quantity ?? ""} ${i.unit ?? ""} ${i.name}`.trim())
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a nutrition expert. Estimate the total nutrition for a recipe given its ingredients, then divide by servings to get per-serving values. Return ONLY valid JSON.",
      },
      {
        role: "user",
        content: `Estimate per-serving nutrition for this recipe (${servings} servings):

Ingredients:
${ingredientList}

Return JSON: {"nutrition":{"calories":number,"proteinG":number,"carbsG":number,"fatG":number,"fiberG":number,"sugarG":number,"sodiumMg":number}}

Round all values to integers.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as { nutrition: NutritionInfo };
  return parsed.nutrition ?? null;
}
