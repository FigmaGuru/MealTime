"use client";

import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild>
        <Link href="/app/meals">
          <Plus className="mr-1.5 h-4 w-4" />
          Add a Meal
        </Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/app/plan">
          <CalendarDays className="mr-1.5 h-4 w-4" />
          Plan This Week
        </Link>
      </Button>
    </div>
  );
}
