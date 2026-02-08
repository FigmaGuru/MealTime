"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { state } = useSidebar();

  return (
    <DropdownMenu>
      <div className="w-full">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-full justify-between px-2">
          {state === "expanded" && <span className="text-sm text-muted-foreground">Theme</span>}
          <span className="relative size-4">
            <Sun className="absolute inset-0 h-4 w-4 rotate-0 scale-100 transition-all duration-300 ease-out dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute inset-0 h-4 w-4 rotate-90 scale-0 transition-all duration-300 ease-out dark:rotate-0 dark:scale-100" />
          </span>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
          {theme === "light" && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {theme === "dark" && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
          {theme === "system" && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
