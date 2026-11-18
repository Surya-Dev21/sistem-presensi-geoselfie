import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Alihkan tema gelap/terang"
            className={`rounded-xl p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors ${className}`}
        >
            {theme === "dark" ? (
                <FiSun className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            ) : (
                <FiMoon className="h-5 w-5 text-slate-600 dark:text-blue-200" />
            )}
        </Button>
    );
}
