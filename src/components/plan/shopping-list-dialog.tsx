"use client";

import { ShoppingCart, Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Meal, DayPlan } from "@/types";
import { useShoppingList } from "@/hooks/use-shopping-list";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  produce: "Produce",
  meat: "Meat & Seafood",
  dairy: "Dairy & Eggs",
  grains: "Grains & Bread",
  canned: "Canned & Jarred",
  spices: "Spices & Oils",
  other: "Other",
};

interface ShoppingListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  days: DayPlan[];
  meals: Meal[];
}

export function ShoppingListDialog({
  open,
  onOpenChange,
  days,
  meals,
}: ShoppingListDialogProps) {
  const { items, categories, toggleItem, clearChecked } = useShoppingList(
    days,
    meals
  );

  function handleCopyToClipboard() {
    const text = items
      .filter((i) => !i.checked)
      .map((i) => `${i.quantity ?? ""} ${i.unit ?? ""} ${i.name}`.trim())
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Shopping list copied");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping List
          </DialogTitle>
          <DialogDescription>
            {items.length} items from{" "}
            {days.filter((d) => d.mealId).length} planned meals
          </DialogDescription>
        </DialogHeader>

        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No ingredients to show. Plan some meals with ingredients first.
          </p>
        ) : (
          <div className="space-y-4">
            {[...categories.entries()].map(([category, categoryItems]) => (
              <div key={category}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {CATEGORY_LABELS[category] ?? category}
                </h4>
                <div className="space-y-1">
                  {categoryItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => toggleItem(item.name)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                        item.checked && "text-muted-foreground line-through"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded border",
                            item.checked && "border-primary bg-primary"
                          )}
                        >
                          {item.checked && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span>
                          {item.quantity
                            ? `${item.quantity} ${item.unit ?? ""} `
                            : ""}
                          {item.name}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {item.fromMeals.map((meal) => (
                          <Badge
                            key={meal}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {meal.length > 12
                              ? meal.slice(0, 12) + "..."
                              : meal}
                          </Badge>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={clearChecked}>
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyToClipboard}
            disabled={items.length === 0}
          >
            <Copy className="mr-1.5 h-4 w-4" /> Copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
