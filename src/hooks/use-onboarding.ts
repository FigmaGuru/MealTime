"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "mealtime-onboarding-completed";

export function useOnboarding() {
  const [open, setOpen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(true); // default true to avoid flash

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY) === "true";
    setHasCompleted(completed);
    if (!completed) {
      // Small delay so the app shell renders first
      const timer = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const complete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setHasCompleted(true);
    setOpen(false);
  }, []);

  const reopen = useCallback(() => {
    setOpen(true);
  }, []);

  return { open, setOpen, hasCompleted, complete, reopen };
}
