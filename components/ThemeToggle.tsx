"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative inline-flex h-7 w-13 items-center rounded-full border border-border bg-secondary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ width: "52px" }}
    >
      <span
        className={`absolute flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {isDark ? (
          <Moon className="h-3 w-3" />
        ) : (
          <Sun className="h-3 w-3" />
        )}
      </span>
      <span className="sr-only">{isDark ? "Switch to light mode" : "Switch to dark mode"}</span>
    </button>
  );
};
