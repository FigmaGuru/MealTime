"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  subscribePlan,
  createOrUpdatePlan,
} from "@/lib/firebase/plans-service";
import type { WeeklyPlan, DayPlan } from "@/types";
import { format, addDays, startOfWeek } from "date-fns";

function createEmptyDays(weekStartISO: string): DayPlan[] {
  const start = weekStartISO
    ? new Date(weekStartISO + "T00:00:00")
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  if (Number.isNaN(start.getTime())) {
    const fallback = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => ({
      dateISO: format(addDays(fallback, i), "yyyy-MM-dd"),
    }));
  }
  return Array.from({ length: 7 }, (_, i) => ({
    dateISO: format(addDays(start, i), "yyyy-MM-dd"),
  }));
}

export function useWeeklyPlan(weekStartISO: string) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const days = plan?.days ?? createEmptyDays(weekStartISO);

  useEffect(() => {
    if (!user || !weekStartISO) {
      setPlan(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribePlan(user.uid, weekStartISO, (updated) => {
      setPlan(updated);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, weekStartISO]);

  const updateDays = useCallback(
    async (newDays: DayPlan[]) => {
      if (!user) return;
      const prev = plan;
      setPlan((current) =>
        current
          ? { ...current, days: newDays }
          : {
              id: weekStartISO,
              weekStartISO,
              days: newDays,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }
      );
      try {
        await createOrUpdatePlan(user.uid, weekStartISO, newDays);
      } catch (err) {
        if (prev) setPlan(prev);
        toast.error("Failed to update plan");
        throw err;
      }
    },
    [user, weekStartISO, plan]
  );

  const assignMealToDay = useCallback(
    async (dateISO: string, mealId: string) => {
      const newDays = days.map((d) =>
        d.dateISO === dateISO ? { ...d, mealId, skipped: undefined } : d
      );
      await updateDays(newDays);
    },
    [days, updateDays]
  );

  const removeMealFromDay = useCallback(
    async (dateISO: string) => {
      const newDays = days.map((d) =>
        d.dateISO === dateISO ? { dateISO: d.dateISO } : d
      );
      await updateDays(newDays);
    },
    [days, updateDays]
  );

  const moveMeal = useCallback(
    async (fromDateISO: string, toDateISO: string) => {
      const fromDay = days.find((d) => d.dateISO === fromDateISO);
      const toDay = days.find((d) => d.dateISO === toDateISO);
      if (!fromDay) return;

      const newDays = days.map((d) => {
        if (d.dateISO === fromDateISO) return { dateISO: d.dateISO, mealId: toDay?.mealId };
        if (d.dateISO === toDateISO) return { dateISO: d.dateISO, mealId: fromDay.mealId };
        return d;
      });
      await updateDays(newDays);
    },
    [days, updateDays]
  );

  return {
    plan,
    days,
    loading,
    assignMealToDay,
    removeMealFromDay,
    moveMeal,
    updateDays,
  };
}
