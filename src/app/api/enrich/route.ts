import { NextRequest } from "next/server";
import { getOpenAIClient } from "@/lib/openai/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, tags = [] } = body as {
      title: string;
      tags?: string[];
    };

    if (!title?.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const openai = getOpenAIClient();

    const systemPrompt = `You are a helpful meal planning assistant. Given a meal title, generate rich details for it. Return ONLY valid JSON.`;

    const tagHint = tags.length > 0 ? `\nTags/cuisine hints: ${tags.join(", ")}` : "";

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
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return Response.json({ enrichment: null }, { status: 200 });
    }

    const parsed = JSON.parse(content);
    return Response.json(parsed);
  } catch (error) {
    console.error("Enrich API error:", error);
    return Response.json(
      { error: "Failed to enrich meal" },
      { status: 500 }
    );
  }
}
