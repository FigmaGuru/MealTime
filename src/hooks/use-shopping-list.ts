"use client";

import { useMemo, useState, useCallback } from "react";
import type { Meal, DayPlan, ShoppingItem } from "@/types";
import { generateShoppingList } from "@/lib/utils/shopping-list";

export function useShoppingList(days: DayPlan[], meals: Meal[]) {
  const generatedItems = useMemo(
    () => generateShoppingList(days, meals),
    [days, meals]
  );

  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const items: ShoppingItem[] = generatedItems.map((item) => ({
    ...item,
    checked: checkedItems.has(item.name.toLowerCase()),
  }));

  const toggleItem = useCallback((name: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      const key = name.toLowerCase();
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const clearChecked = useCallback(() => setCheckedItems(new Set()), []);

  const categories = useMemo(() => {
    const grouped = new Map<string, ShoppingItem[]>();
    items.forEach((item) => {
      const list = grouped.get(item.category) ?? [];
      list.push(item);
      grouped.set(item.category, list);
    });
    return grouped;
  }, [items]);

  return { items, categories, toggleItem, clearChecked };
}
