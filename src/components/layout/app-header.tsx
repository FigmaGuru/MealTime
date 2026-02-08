"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, MessageCircle, LayoutDashboard, CalendarDays, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/lib/firebase/auth-context";
import { logOut } from "@/lib/firebase/auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/app", label: "Home", icon: MessageCircle },
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/app/plan", label: "Plan", icon: CalendarDays },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
        <Link href="/app" className="flex items-center gap-2 font-semibold tracking-tight">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          <span>MealTime</span>
        </Link>

        <nav className="mx-6 hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/app"
                ? pathname === "/app"
                : link.href === "/app/dashboard"
                  ? pathname === "/app/dashboard" || pathname.startsWith("/app/dashboard/")
                  : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.displayName ?? "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logOut()} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
