import { NextRequest } from "next/server";
import { getOpenAIClient } from "@/lib/openai/client";
import type { Ingredient } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, servings = 1 } = body as {
      ingredients: Ingredient[];
      servings?: number;
    };

    if (ingredients.length === 0) {
      return Response.json({ nutrition: null });
    }

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
    if (!content) {
      return Response.json({ nutrition: null });
    }

    const parsed = JSON.parse(content);
    return Response.json(parsed);
  } catch (error) {
    console.error("Nutrition API error:", error);
    return Response.json(
      { error: "Failed to estimate nutrition" },
      { status: 500 }
    );
  }
}
