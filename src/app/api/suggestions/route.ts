import { NextRequest } from "next/server";
import { getOpenAIClient } from "@/lib/openai/client";
import type { MealSuggestion } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mealContext,
      count = 3,
      previousSuggestionTitles = [],
    } = body as {
      mealContext: {
        titles: string[];
        tags: string[];
        commonIngredients: string[];
      };
      count?: number;
      previousSuggestionTitles?: string[];
    };

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
    if (!content) {
      return Response.json({ suggestions: [] }, { status: 200 });
    }

    const parsed = JSON.parse(content) as { suggestions: MealSuggestion[] };

    // Post-process: filter out any suggestions that match existing or previous titles
    const existingSet = new Set(
      mealContext.titles.map((t) => t.toLowerCase().trim())
    );
    const previousSet = new Set(
      previousSuggestionTitles.map((t) => t.toLowerCase().trim())
    );

    const filtered = (parsed.suggestions ?? []).filter((s) => {
      const normalized = s.title.toLowerCase().trim();
      return !existingSet.has(normalized) && !previousSet.has(normalized);
    });

    return Response.json({ suggestions: filtered });
  } catch (error) {
    console.error("Suggestions API error:", error);
    return Response.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
