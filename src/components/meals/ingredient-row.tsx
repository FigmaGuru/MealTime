"use client";

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Ingredient } from "@/types";

interface IngredientRowProps {
  ingredient: Ingredient;
  index: number;
  onChange: (index: number, ingredient: Ingredient) => void;
  onRemove: (index: number) => void;
}

export function IngredientRow({
  ingredient,
  index,
  onChange,
  onRemove,
}: IngredientRowProps) {
  const update = (field: keyof Ingredient, value: string) => {
    onChange(index, { ...ingredient, [field]: value });
  };

  return (
    <div className="flex items-start gap-2">
      <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
        <Input
          placeholder="Name"
          value={ingredient.name}
          onChange={(e) => update("name", e.target.value)}
          className="col-span-2 sm:col-span-1"
          aria-label={`Ingredient ${index + 1} name`}
        />
        <Input
          placeholder="Qty"
          value={ingredient.quantity ?? ""}
          onChange={(e) => update("quantity", e.target.value)}
          aria-label={`Ingredient ${index + 1} quantity`}
        />
        <Input
          placeholder="Unit"
          value={ingredient.unit ?? ""}
          onChange={(e) => update("unit", e.target.value)}
          aria-label={`Ingredient ${index + 1} unit`}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => onRemove(index)}
        aria-label={`Remove ingredient ${index + 1}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
