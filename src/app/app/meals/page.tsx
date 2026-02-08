"use client";

import { useState, useEffect } from "react";
import { Plus, ListPlus, Sparkles, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MealGrid } from "@/components/meals/meal-grid";
import { MealFilters } from "@/components/meals/meal-filters";
import { MealFormDialog } from "@/components/meals/meal-form-dialog";
import { DeleteMealDialog } from "@/components/meals/delete-meal-dialog";
import { BulkAddDialog } from "@/components/meals/bulk-add-dialog";
import { SuggestionsDialog } from "@/components/meals/suggestions-dialog";
import { useMeals } from "@/hooks/use-meals";
import { useMealFilters } from "@/hooks/use-meal-filters";
import { useEnrichMeal } from "@/hooks/use-enrich-meal";
import type { Meal, CreateMealInput } from "@/types";

function isMealMinimal(data: CreateMealInput): boolean {
  let missing = 0;
  if (!data.description) missing++;
  if (!data.ingredients || data.ingredients.length === 0) missing++;
  if (!data.steps || data.steps.length === 0) missing++;
  if (!data.prepTimeMinutes) missing++;
  if (!data.cookTimeMinutes) missing++;
  return missing >= 2;
}

export default function MealsPage() {
  const { meals, loading, addMeal, updateMeal, removeMeal, toggleFavorite, bulkAddMeals } =
    useMeals();
  const filters = useMealFilters(meals);
  const { enrichment, targetMealId, enrich, clearEnrichment } = useEnrichMeal();

  const [formOpen, setFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [deletingMeal, setDeletingMeal] = useState<Meal | null>(null);
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  // When enrichment arrives, show action toast
  useEffect(() => {
    if (enrichment && targetMealId) {
      toast("AI has enriched your meal", {
        description: "Accept to apply the enriched details.",
        action: {
          label: "Accept",
          onClick: () => {
            updateMeal(targetMealId, enrichment);
            toast.success("Enrichment applied");
            clearEnrichment();
          },
        },
        cancel: {
          label: "Dismiss",
          onClick: () => clearEnrichment(),
        },
        duration: 15000,
      });
    }
  }, [enrichment, targetMealId, updateMeal, clearEnrichment]);

  function handleEdit(meal: Meal) {
    setEditingMeal(meal);
    setFormOpen(true);
  }

  function handleNewMeal() {
    setEditingMeal(null);
    setFormOpen(true);
  }

  async function handleSave(data: CreateMealInput) {
    if (editingMeal) {
      await updateMeal(editingMeal.id, data);
    } else {
      const mealId = await addMeal(data);
      // Auto-enrich if the meal is minimal
      if (mealId && isMealMinimal(data)) {
        enrich(mealId, data.title, data.tags);
      }
    }
  }

  async function handleDelete() {
    if (deletingMeal) {
      await removeMeal(deletingMeal.id);
      setDeletingMeal(null);
    }
  }

  return (
    <>
      <PageHeader title="Meals" description="Your meal library">
        <Button variant="outline" size="sm" onClick={() => setSuggestionsOpen(true)}>
          <Sparkles className="mr-1.5 h-4 w-4" />
          Suggestions
        </Button>
        <Button variant="outline" size="sm" onClick={() => setBulkAddOpen(true)}>
          <ListPlus className="mr-1.5 h-4 w-4" />
          Bulk Add
        </Button>
        <Button onClick={handleNewMeal}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Meal
        </Button>
      </PageHeader>

      {!loading && meals.length > 0 && (
        <div className="mb-6">
          <MealFilters
            searchQuery={filters.searchQuery}
            onSearchChange={filters.setSearchQuery}
            allTags={filters.allTags}
            selectedTags={filters.selectedTags}
            onToggleTag={filters.toggleTag}
            showFavoritesOnly={filters.showFavoritesOnly}
            onToggleFavorites={filters.setShowFavoritesOnly}
          />
        </div>
      )}

      {!loading && meals.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No meals yet"
          description="Add your first meal to start building your library."
          actionLabel="Add Meal"
          onAction={handleNewMeal}
        />
      ) : !loading && filters.filteredMeals.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No meals found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <MealGrid
          meals={filters.filteredMeals}
          loading={loading}
          onEdit={handleEdit}
          onDelete={setDeletingMeal}
          onToggleFavorite={toggleFavorite}
        />
      )}

      <MealFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        meal={editingMeal}
        onSave={handleSave}
      />

      <DeleteMealDialog
        open={!!deletingMeal}
        onOpenChange={(open) => !open && setDeletingMeal(null)}
        meal={deletingMeal}
        onConfirm={handleDelete}
      />

      <BulkAddDialog
        open={bulkAddOpen}
        onOpenChange={setBulkAddOpen}
        existingMeals={meals}
        onBulkAdd={bulkAddMeals}
      />

      <SuggestionsDialog
        open={suggestionsOpen}
        onOpenChange={setSuggestionsOpen}
        meals={meals}
        onAddMeal={addMeal}
      />
    </>
  );
}
