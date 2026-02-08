"use client";

import { Flame } from "lucide-react";
import type { NutritionInfo } from "@/types";

interface NutritionBadgeProps {
  nutrition: NutritionInfo;
  className?: string;
}

export function NutritionBadge({ nutrition, className }: NutritionBadgeProps) {
  return (
    <span
      className={`flex items-center gap-1 text-xs text-muted-foreground ${className ?? ""}`}
    >
      <Flame className="h-3 w-3" />
      {nutrition.calories} cal
    </span>
  );
}
