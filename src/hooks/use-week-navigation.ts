"use client";

import { useState, useCallback } from "react";
import { startOfWeek, addWeeks, subWeeks, format } from "date-fns";

export function useWeekNavigation() {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    () => startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const goToPreviousWeek = useCallback(
    () => setCurrentWeekStart((prev) => subWeeks(prev, 1)),
    []
  );

  const goToNextWeek = useCallback(
    () => setCurrentWeekStart((prev) => addWeeks(prev, 1)),
    []
  );

  const goToCurrentWeek = useCallback(
    () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 })),
    []
  );

  const weekStartISO = format(currentWeekStart, "yyyy-MM-dd");

  return {
    currentWeekStart,
    weekStartISO,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  };
}
