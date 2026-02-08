import type { DayPlan } from "@/types";
import { format, startOfWeek, addDays } from "date-fns";

export function getSamplePlan(): DayPlan[] {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const mealIds = [
    "demo-1",
    "demo-2",
    "demo-3",
    "demo-5",
    "demo-8",
    "demo-9",
    "demo-15",
  ];

  return Array.from({ length: 7 }, (_, i) => ({
    dateISO: format(addDays(weekStart, i), "yyyy-MM-dd"),
    mealId: mealIds[i],
  }));
}
