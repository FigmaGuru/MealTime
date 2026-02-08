"use client";

import { Plus, X, GripVertical, RefreshCw } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Meal } from "@/types";
import { cn } from "@/lib/utils";

interface DayColumnProps {
  dateISO: string;
  meal?: Meal;
  isSkipped?: boolean;
  onAssignMeal: () => void;
  onRemoveMeal: () => void;
  onRegenerate?: () => void;
  isDragging?: boolean;
}

export function DayColumn({
  dateISO,
  meal,
  isSkipped,
  onAssignMeal,
  onRemoveMeal,
  onRegenerate,
  isDragging,
}: DayColumnProps) {
  const date = parseISO(dateISO);
  const dayName = format(date, "EEE");
  const dayDate = format(date, "MMM d");
  const today = isToday(date);

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors duration-200 ease-out",
        today && "border-primary/40 bg-primary/5",
        isDragging && "ring-2 ring-primary/30",
        isSkipped && !meal && "opacity-50 bg-muted/30 border-dashed"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              today && "text-primary"
            )}
          >
            {dayName}
          </p>
          <p className="text-xs text-muted-foreground">{dayDate}</p>
        </div>
        {today && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
            Today
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {meal ? (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="group relative transition-shadow duration-200 hover:shadow-md">
              <CardContent className="flex items-center gap-2 p-2.5">
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50 cursor-grab" />
                <span className="flex-1 text-sm font-medium truncate">
                  {meal.title}
                </span>
                {onRegenerate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
                    onClick={onRegenerate}
                    aria-label={`Regenerate meal for ${dayName}`}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  onClick={onRemoveMeal}
                  aria-label={`Remove ${meal.title} from ${dayName}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : isSkipped ? (
          <motion.div
            key="skipped"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="group relative flex w-full items-center justify-center rounded-md border border-dashed border-border px-3 py-3"
          >
            <span className="text-sm italic text-muted-foreground">Skipped</span>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
              onClick={onAssignMeal}
              aria-label={`Override skip and assign meal to ${dayName}`}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={onAssignMeal}
              className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              aria-label={`Assign meal to ${dayName}`}
            >
              <Plus className="h-4 w-4" />
              Add meal
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
