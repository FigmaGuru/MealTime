"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { parseBulkMealInput, findDuplicates } from "@/lib/utils/meal-utils";
import type { Meal, CreateMealInput } from "@/types";

interface BulkAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMeals: Meal[];
  onBulkAdd: (meals: CreateMealInput[]) => Promise<number | undefined>;
}

export function BulkAddDialog({
  open,
  onOpenChange,
  existingMeals,
  onBulkAdd,
}: BulkAddDialogProps) {
  const [input, setInput] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [parsedNames, setParsedNames] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const duplicates = findDuplicates(parsedNames, existingMeals);

  function handlePreview() {
    const names = parseBulkMealInput(input);
    setParsedNames(names);
    setExcluded(new Set());
    setPreviewing(true);
  }

  function toggleExclude(name: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  async function handleSave() {
    const mealsToCreate: CreateMealInput[] = parsedNames
      .filter((name) => !excluded.has(name))
      .map((name) => ({
        title: name,
        tags: [],
        ingredients: [],
        steps: [],
        isFavorite: false,
      }));

    if (mealsToCreate.length === 0) return;

    setSaving(true);
    try {
      await onBulkAdd(mealsToCreate);
      handleClose();
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setInput("");
    setPreviewing(false);
    setParsedNames([]);
    setExcluded(new Set());
    onOpenChange(false);
  }

  function handleBack() {
    setPreviewing(false);
  }

  const includedCount = parsedNames.filter((n) => !excluded.has(n)).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Add Meals</DialogTitle>
          <DialogDescription>
            {previewing
              ? `${includedCount} meal${includedCount !== 1 ? "s" : ""} will be added`
              : "Enter meal names separated by commas"}
          </DialogDescription>
        </DialogHeader>

        {!previewing ? (
          <div className="space-y-3">
            <Label htmlFor="bulk-input">Meal names</Label>
            <Textarea
              id="bulk-input"
              placeholder="Chicken tacos, Salmon bowls, Pasta primavera"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handlePreview}
                disabled={!input.trim()}
              >
                Preview
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="max-h-64 overflow-y-auto space-y-1">
              {parsedNames.map((name, i) => {
                const isDuplicate = duplicates.has(name.toLowerCase());
                const isExcluded = excluded.has(name);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleExclude(name)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      isExcluded
                        ? "bg-muted/50 text-muted-foreground line-through"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span>{name}</span>
                    <div className="flex items-center gap-2">
                      {isDuplicate && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Exists
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Click a meal to exclude it. Duplicates are marked but will still be added.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSave} disabled={saving || includedCount === 0}>
                {saving ? "Adding..." : `Add ${includedCount} meal${includedCount !== 1 ? "s" : ""}`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
