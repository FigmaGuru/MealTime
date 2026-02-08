"use client";

import { useState, useEffect } from "react";
import { Plus, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IngredientRow } from "./ingredient-row";
import { StepRow } from "./step-row";
import { NutritionPanel } from "@/components/nutrition/nutrition-panel";
import { useNutritionEstimate } from "@/hooks/use-nutrition-estimate";
import type { Meal, CreateMealInput, Ingredient, NutritionInfo } from "@/types";

interface MealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal?: Meal | null;
  onSave: (data: CreateMealInput) => Promise<void>;
}

const emptyIngredient: Ingredient = { name: "", quantity: "", unit: "" };

/** Check if a meal has optional detail fields populated */
function hasDetails(meal: Meal | null | undefined): boolean {
  if (!meal) return false;
  return !!(
    meal.description ||
    meal.prepTimeMinutes ||
    meal.cookTimeMinutes ||
    meal.servings ||
    meal.ingredients.length > 0 ||
    meal.steps.length > 0
  );
}

export function MealFormDialog({
  open,
  onOpenChange,
  meal,
  onSave,
}: MealFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { ...emptyIngredient },
  ]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const {
    nutrition,
    loading: nutritionLoading,
    estimate,
    setNutrition,
  } = useNutritionEstimate();

  const isEdit = !!meal;

  useEffect(() => {
    if (meal) {
      setTitle(meal.title);
      setDescription(meal.description ?? "");
      setTags([...meal.tags]);
      setPrepTime(meal.prepTimeMinutes?.toString() ?? "");
      setCookTime(meal.cookTimeMinutes?.toString() ?? "");
      setServings(meal.servings?.toString() ?? "");
      setIngredients(
        meal.ingredients.length > 0
          ? meal.ingredients.map((i) => ({ ...i }))
          : [{ ...emptyIngredient }]
      );
      setSteps(meal.steps.length > 0 ? [...meal.steps] : [""]);
      setNutrition(meal.nutrition ?? null);
      // Auto-expand if meal has details populated
      setShowMore(hasDetails(meal));
    } else {
      setTitle("");
      setDescription("");
      setTags([]);
      setTagInput("");
      setPrepTime("");
      setCookTime("");
      setServings("");
      setIngredients([{ ...emptyIngredient }]);
      setSteps([""]);
      setNutrition(null);
      setShowMore(false);
    }
  }, [meal, open]);

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, "");
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function updateIngredient(index: number, ingredient: Ingredient) {
    setIngredients((prev) =>
      prev.map((item, i) => (i === index ? ingredient : item))
    );
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function updateStep(index: number, value: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        tags,
        prepTimeMinutes: prepTime ? parseInt(prepTime) : undefined,
        cookTimeMinutes: cookTime ? parseInt(cookTime) : undefined,
        servings: servings ? parseInt(servings) : undefined,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.trim()),
        isFavorite: meal?.isFavorite ?? false,
        nutrition: nutrition ?? undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Meal" : "Add Meal"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title — always visible */}
          <div className="space-y-2">
            <Label htmlFor="meal-title">Title *</Label>
            <Input
              id="meal-title"
              placeholder="e.g., Spaghetti Bolognese"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Tags — always visible */}
          <div className="space-y-2">
            <Label htmlFor="meal-tags">Tags</Label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 hover:text-destructive"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <Input
              id="meal-tags"
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>

          {/* Show more toggle */}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {showMore ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Less details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                More details
              </>
            )}
          </button>

          {/* Optional fields — behind "Show more" */}
          <AnimatePresence initial={false}>
            {showMore && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="meal-description">Description</Label>
                <Textarea
                  id="meal-description"
                  placeholder="A brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="prep-time">Prep (min)</Label>
                  <Input
                    id="prep-time"
                    type="number"
                    min={0}
                    placeholder="15"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cook-time">Cook (min)</Label>
                  <Input
                    id="cook-time"
                    type="number"
                    min={0}
                    placeholder="30"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servings">Servings</Label>
                  <Input
                    id="servings"
                    type="number"
                    min={1}
                    placeholder="4"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Ingredients</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setIngredients([...ingredients, { ...emptyIngredient }])
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {ingredients.map((ingredient, i) => (
                    <IngredientRow
                      key={i}
                      ingredient={ingredient}
                      index={i}
                      onChange={updateIngredient}
                      onRemove={removeIngredient}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Steps</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSteps([...steps, ""])}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {steps.map((step, i) => (
                    <StepRow
                      key={i}
                      step={step}
                      index={i}
                      onChange={updateStep}
                      onRemove={removeStep}
                    />
                  ))}
                </div>
              </div>
              <Separator />

              {/* Nutrition estimation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Nutrition</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      estimate(
                        ingredients.filter((i) => i.name.trim()),
                        parseInt(servings) || 1
                      )
                    }
                    disabled={
                      nutritionLoading ||
                      ingredients.filter((i) => i.name.trim()).length === 0
                    }
                  >
                    {nutritionLoading ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Estimating...
                      </>
                    ) : (
                      "Estimate Nutrition"
                    )}
                  </Button>
                </div>
                {nutrition && <NutritionPanel nutrition={nutrition} />}
              </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Add meal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
