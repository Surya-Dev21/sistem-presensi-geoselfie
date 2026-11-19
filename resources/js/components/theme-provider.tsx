import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => {},
    setTheme: () => {},
});

const THEME_KEY = "sipres-theme";
const LEGACY_THEME_KEY = "simag-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");

    useEffect(() => {
        try {
            const savedTheme = (localStorage.getItem(THEME_KEY) ??
                localStorage.getItem(LEGACY_THEME_KEY)) as Theme | null;
            if (savedTheme === "dark" || savedTheme === "light") {
                setThemeState(savedTheme);
                applyTheme(savedTheme);
            } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                setThemeState("dark");
                applyTheme("dark");
            }
        } catch (e) {
            // LocalStorage might be restricted
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        if (typeof document !== "undefined") {
            const root = document.documentElement;
            if (newTheme === "dark") {
                root.classList.add("dark");
            } else {
                root.classList.remove("dark");
            }
        }
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        try {
            localStorage.setItem(THEME_KEY, newTheme);
        } catch (e) {}
        applyTheme(newTheme);
    };

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
