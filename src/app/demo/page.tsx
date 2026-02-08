"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  CalendarDays,
  Search,
  Heart,
  Clock,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SAMPLE_MEALS } from "@/lib/data/sample-meals";
import { getSamplePlan } from "@/lib/data/sample-plan";
import type { Meal } from "@/types";
import { cn } from "@/lib/utils";

function DemoSignUpPrompt() {
  toast.info("Sign up to save changes", {
    action: {
      label: "Sign up",
      onClick: () => (window.location.href = "/signup"),
    },
  });
}

export default function DemoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const samplePlan = useMemo(() => getSamplePlan(), []);

  const filteredMeals = useMemo(() => {
    return SAMPLE_MEALS.filter((meal) => {
      const matchesSearch = meal.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFavorites = !favoritesOnly || meal.isFavorite;
      return matchesSearch && matchesFavorites;
    });
  }, [searchQuery, favoritesOnly]);

  function getMealById(id?: string): Meal | undefined {
    return SAMPLE_MEALS.find((m) => m.id === id);
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            MealTime
            <Badge variant="secondary" className="text-xs">Demo</Badge>
          </Link>
          <Button size="sm" asChild>
            <Link href="/signup">Sign up free</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Try MealTime
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore with sample data. Sign up to create your own meals and plans.
          </p>
        </div>

        <Tabs defaultValue="plan" className="space-y-6">
          <TabsList>
            <TabsTrigger value="plan" className="gap-1.5">
              <CalendarDays className="h-4 w-4" />
              Weekly Plan
            </TabsTrigger>
            <TabsTrigger value="meals" className="gap-1.5">
              <UtensilsCrossed className="h-4 w-4" />
              Meals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plan">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {samplePlan.map((day) => {
                const meal = getMealById(day.mealId);
                const date = parseISO(day.dateISO);
                const today = isToday(date);
                return (
                  <div
                    key={day.dateISO}
                    className={cn(
                      "rounded-lg border p-3",
                      today && "border-primary/40 bg-primary/5"
                    )}
                  >
                    <div className="mb-2">
                      <p className={cn("text-sm font-medium", today && "text-primary")}>
                        {format(date, "EEE")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(date, "MMM d")}
                      </p>
                    </div>
                    {meal ? (
                      <Card>
                        <CardContent className="p-2.5">
                          <p className="text-sm font-medium truncate">
                            {meal.title}
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <button
                        onClick={DemoSignUpPrompt}
                        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary"
                      >
                        <Plus className="h-4 w-4" />
                        Add meal
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="meals">
            <div className="mb-6 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant={favoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setFavoritesOnly(!favoritesOnly)}
              >
                <Heart className={cn("mr-1.5 h-4 w-4", favoritesOnly && "fill-current")} />
                Favorites
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredMeals.map((meal) => {
                const totalTime =
                  (meal.prepTimeMinutes ?? 0) + (meal.cookTimeMinutes ?? 0);
                return (
                  <Card
                    key={meal.id}
                    className="transition-colors hover:bg-accent/30 cursor-pointer"
                    onClick={DemoSignUpPrompt}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{meal.title}</h3>
                          {meal.description && (
                            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                              {meal.description}
                            </p>
                          )}
                        </div>
                        <Heart
                          className={cn(
                            "h-4 w-4 shrink-0 mt-0.5",
                            meal.isFavorite
                              ? "fill-red-500 text-red-500"
                              : "text-muted-foreground"
                          )}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {meal.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs font-normal">
                            {tag}
                          </Badge>
                        ))}
                        {totalTime > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {totalTime} min
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
