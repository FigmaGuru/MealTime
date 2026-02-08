"use client";

import { useState, useCallback, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachWeekOfInterval,
  format,
} from "date-fns";

export function useMonthNavigation() {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  const goToPreviousMonth = useCallback(
    () => setCurrentMonth((prev) => subMonths(prev, 1)),
    []
  );

  const goToNextMonth = useCallback(
    () => setCurrentMonth((prev) => addMonths(prev, 1)),
    []
  );

  const goToCurrentMonth = useCallback(
    () => setCurrentMonth(startOfMonth(new Date())),
    []
  );

  /** Array of Monday-start week ISO dates that cover this month */
  const weeksInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Expand to full weeks (Mon-Sun)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachWeekOfInterval(
      { start: calendarStart, end: calendarEnd },
      { weekStartsOn: 1 }
    ).map((weekStart) => format(weekStart, "yyyy-MM-dd"));
  }, [currentMonth]);

  const monthLabel = format(currentMonth, "MMMM yyyy");

  return {
    currentMonth,
    monthLabel,
    weeksInMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  };
}
