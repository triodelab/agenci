"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { cn } from "@workspace/ui/lib/utils";

export type ModeToggleProps = {
  /** Ekstra klasser på nedtrekksmenyen (innhold) */
  contentClassName?: string;
  /** Ekstra klasser på trigger-knappen (f.eks. sidebar-stil) */
  triggerClassName?: string;
};

export function ModeToggle({
  contentClassName,
  triggerClassName,
}: ModeToggleProps) {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        disabled
        className={cn(
          "inline-flex cursor-not-allowed items-center justify-center rounded-md p-2 text-foreground opacity-50",
          triggerClassName,
        )}
        aria-label="Bytt tema"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Bytt tema</span>
      </button>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          "relative inline-flex items-center justify-center rounded-md border-0 bg-transparent p-2 text-foreground transition-opacity hover:opacity-80",
          triggerClassName,
        )}
        aria-label="Bytt tema"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Bytt tema</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={contentClassName}>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Lys
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Mørk
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
