import { NextRequest } from "next/server";
import { getOpenAIClient } from "@/lib/openai/client";
import { formatMealChatContextForPrompt } from "@/lib/utils/chat-context";
import type { MealChatContext, CreateMealInput, Ingredient } from "@/types";

/** Normalize and validate addMeal from the model so it matches CreateMealInput. */
function normalizeAddMeal(raw: unknown): CreateMealInput | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  if (!title) return null;

  const tags = Array.isArray(o.tags)
    ? (o.tags as unknown[]).map((t) => (typeof t === "string" ? t.trim() : "")).filter(Boolean)
    : [];
  const ingredients: Ingredient[] = Array.isArray(o.ingredients)
    ? (o.ingredients as unknown[]).map((i) => {
        if (i && typeof i === "object" && "name" in i) {
          const ing = i as Record<string, unknown>;
          return {
            name: typeof ing.name === "string" ? ing.name : "",
            quantity: typeof ing.quantity === "string" ? ing.quantity : undefined,
            unit: typeof ing.unit === "string" ? ing.unit : undefined,
          };
        }
        return { name: String(i) };
      }).filter((i) => i.name)
    : [];
  const steps: string[] = Array.isArray(o.steps)
    ? (o.steps as unknown[]).map((s) => (typeof s === "string" ? s.trim() : String(s))).filter(Boolean)
    : [];

  const prepTimeMinutes = typeof o.prepTimeMinutes === "number" ? o.prepTimeMinutes : undefined;
  const cookTimeMinutes = typeof o.cookTimeMinutes === "number" ? o.cookTimeMinutes : undefined;
  const servings = typeof o.servings === "number" ? o.servings : undefined;
  const description = typeof o.description === "string" ? o.description.trim() || undefined : undefined;

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body as {
      message: string;
      context: MealChatContext;
    };

    if (!message || typeof message !== "string" || !context) {
      return Response.json(
        { error: "message and context are required" },
        { status: 400 }
      );
    }

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
      return Response.json({
        reply: "I couldn't generate a reply. Try again.",
      });
    }

    let reply = "I couldn't generate a reply. Try again.";
    let addMeal: CreateMealInput | null = null;

    try {
      const parsed = JSON.parse(content) as { reply?: string; addMeal?: unknown };
      reply =
        typeof parsed.reply === "string" && parsed.reply.trim()
          ? parsed.reply.trim()
          : reply;
      if (parsed.addMeal != null) {
        addMeal = normalizeAddMeal(parsed.addMeal);
      }
    } catch {
      // If JSON parse fails, treat content as plain reply (backwards compatible)
      reply = content;
    }

    return Response.json({ reply, addMeal: addMeal ?? undefined });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to get a reply" },
      { status: 500 }
    );
  }
}
