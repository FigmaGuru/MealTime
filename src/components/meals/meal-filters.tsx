"use client";

import { Search, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MealFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: (value: boolean) => void;
}

export function MealFilters({
  searchQuery,
  onSearchChange,
  allTags,
  selectedTags,
  onToggleTag,
  showFavoritesOnly,
  onToggleFavorites,
}: MealFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meals..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            aria-label="Search meals"
          />
        </div>
        <Button
          variant={showFavoritesOnly ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleFavorites(!showFavoritesOnly)}
          className="shrink-0"
          aria-label={showFavoritesOnly ? "Show all meals" : "Show favorites only"}
        >
          <Heart
            className={cn(
              "mr-1.5 h-4 w-4",
              showFavoritesOnly && "fill-current"
            )}
          />
          Favorites
        </Button>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by tags">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer select-none"
              onClick={() => onToggleTag(tag)}
              role="checkbox"
              aria-checked={selectedTags.includes(tag)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleTag(tag);
                }
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
