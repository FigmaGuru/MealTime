"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { generateWeeklyPlan } from "@/lib/utils/plan-generator";
import { cn } from "@/lib/utils";
import type { Meal, DayPlan } from "@/types";

interface GeneratePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meals: Meal[];
  weekStartISO: string;
  previousMealIds?: string[];
  onApply: (days: DayPlan[]) => void | Promise<void>;
}

export function GeneratePlanDialog({
  open,
  onOpenChange,
  meals,
  weekStartISO,
  previousMealIds = [],
  onApply,
}: GeneratePlanDialogProps) {
  const [includeFavorites, setIncludeFavorites] = useState(true);
  const [newMealsCount, setNewMealsCount] = useState(3);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [maxPrepTime, setMaxPrepTime] = useState("");
  const [selectedDays, setSelectedDays] = useState<boolean[]>([true, true, true, true, true, true, true]);
  const [excludeLastWeek, setExcludeLastWeek] = useState(true);
  const [applying, setApplying] = useState(false);

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const anyDaySelected = selectedDays.some(Boolean);

  const allTags = [...new Set(meals.flatMap((m) => m.tags))].sort();

  function toggleDay(index: number) {
    setSelectedDays((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  function toggleExcludeTag(tag: string) {
    setExcludeTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleGenerate() {
    const generatedDays = generateWeeklyPlan({
      meals,
      weekStartISO,
      newMealsCount,
      includeFavorites,
      excludeTags,
      maxPrepTimeMinutes: maxPrepTime ? parseInt(maxPrepTime) : undefined,
      previousMealIds: excludeLastWeek ? previousMealIds : [],
      selectedDays,
    });
    setApplying(true);
    try {
      await onApply(generatedDays);
      onOpenChange(false);
    } finally {
      setApplying(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Generate Plan</DialogTitle>
          <DialogDescription>
            Set your preferences and generate a weekly meal plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Days to plan</Label>
            <div className="flex flex-wrap gap-1.5">
              {dayLabels.map((label, i) => (
                <motion.div key={label} whileTap={{ scale: 0.95 }}>
                  <Badge
                    variant={selectedDays[i] ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer select-none",
                      !selectedDays[i] && "opacity-50"
                    )}
                    onClick={() => toggleDay(i)}
                    role="checkbox"
                    aria-checked={selectedDays[i]}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleDay(i);
                      }
                    }}
                  >
                    {label}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-favorites" className="cursor-pointer">
              Include favorites
            </Label>
            <Switch
              id="include-favorites"
              checked={includeFavorites}
              onCheckedChange={setIncludeFavorites}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="exclude-last-week" className="cursor-pointer">
              Exclude last week&apos;s meals
            </Label>
            <Switch
              id="exclude-last-week"
              checked={excludeLastWeek}
              onCheckedChange={setExcludeLastWeek}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-meals-count">
              New meals (0–7)
            </Label>
            <Input
              id="new-meals-count"
              type="number"
              min={0}
              max={7}
              value={newMealsCount}
              onChange={(e) => setNewMealsCount(parseInt(e.target.value) || 0)}
            />
            <p className="text-[11px] text-muted-foreground/70">
              Number of non-favorite meals to include in the plan.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-prep-time">
              Max prep time (minutes)
            </Label>
            <Input
              id="max-prep-time"
              type="number"
              min={0}
              placeholder="No limit"
              value={maxPrepTime}
              onChange={(e) => setMaxPrepTime(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground/70">
              Exclude meals with prep time above this limit. Leave empty for no limit.
            </p>
          </div>

          {allTags.length > 0 && (
            <div className="space-y-2">
              <Label>Exclude tags</Label>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={excludeTags.includes(tag) ? "destructive" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => toggleExcludeTag(tag)}
                    role="checkbox"
                    aria-checked={excludeTags.includes(tag)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleExcludeTag(tag);
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={meals.length === 0 || !anyDaySelected || applying}
          >
            {applying ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
