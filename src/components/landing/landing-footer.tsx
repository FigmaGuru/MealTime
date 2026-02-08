import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 sm:flex-row sm:justify-between sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <UtensilsCrossed className="h-4 w-4 text-primary" />
          MealTime
        </Link>

        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/demo" className="transition-colors hover:text-foreground">
            Demo
          </Link>
          <Link href="/signin" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
          <Link href="/signup" className="transition-colors hover:text-foreground">
            Sign up
          </Link>
        </nav>

        <p className="text-sm text-muted-foreground">
          Built for families who love good food.
        </p>
      </div>
    </footer>
  );
}
