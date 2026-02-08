"use client";

import { useState, useMemo } from "react";
import type { Meal } from "@/types";

export function useMealFilters(meals: Meal[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const allTags = useMemo(
    () => [...new Set(meals.flatMap((m) => m.tags))].sort(),
    [meals]
  );

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      const matchesSearch = meal.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => meal.tags.includes(tag));
      const matchesFavorites = !showFavoritesOnly || meal.isFavorite;
      return matchesSearch && matchesTags && matchesFavorites;
    });
  }, [meals, searchQuery, selectedTags, showFavoritesOnly]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return {
    filteredMeals,
    allTags,
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    showFavoritesOnly,
    setShowFavoritesOnly,
  };
}
