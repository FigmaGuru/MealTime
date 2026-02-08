"use client";

import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { DayColumn } from "./day-column";
import { DayColumnSkeleton } from "./day-column-skeleton";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import type { DayPlan, Meal } from "@/types";

interface WeeklyPlanBoardProps {
  days: DayPlan[];
  meals: Meal[];
  loading: boolean;
  onMoveMeal: (fromDateISO: string, toDateISO: string) => void;
  onAssignMeal: (dateISO: string) => void;
  onRemoveMeal: (dateISO: string) => void;
  onRegenerateMeal?: (dateISO: string) => void;
}

export function WeeklyPlanBoard({
  days,
  meals,
  loading,
  onMoveMeal,
  onAssignMeal,
  onRemoveMeal,
  onRegenerateMeal,
}: WeeklyPlanBoardProps) {
  function getMealForDay(mealId?: string): Meal | undefined {
    if (!mealId) return undefined;
    return meals.find((m) => m.id === mealId);
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const sourceId = result.source.droppableId;
    const destId = result.destination.droppableId;
    if (sourceId === destId) return;
    onMoveMeal(sourceId, destId);
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <DayColumnSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {days.map((day) => {
          const meal = getMealForDay(day.mealId);
          return (
            <Droppable key={day.dateISO} droppableId={day.dateISO}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <motion.div variants={fadeInUp}>
                    {meal ? (
                      <Draggable draggableId={day.dateISO} index={0}>
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <DayColumn
                              dateISO={day.dateISO}
                              meal={meal}
                              isSkipped={day.skipped}
                              onAssignMeal={() => onAssignMeal(day.dateISO)}
                              onRemoveMeal={() => onRemoveMeal(day.dateISO)}
                              onRegenerate={onRegenerateMeal ? () => onRegenerateMeal(day.dateISO) : undefined}
                              isDragging={snapshot.isDraggingOver}
                            />
                          </div>
                        )}
                      </Draggable>
                    ) : (
                      <DayColumn
                        dateISO={day.dateISO}
                        isSkipped={day.skipped}
                        onAssignMeal={() => onAssignMeal(day.dateISO)}
                        onRemoveMeal={() => onRemoveMeal(day.dateISO)}
                        onRegenerate={onRegenerateMeal ? () => onRegenerateMeal(day.dateISO) : undefined}
                        isDragging={snapshot.isDraggingOver}
                      />
                    )}
                  </motion.div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </motion.div>
    </DragDropContext>
  );
}
