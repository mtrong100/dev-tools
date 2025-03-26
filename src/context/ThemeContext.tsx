import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("DEVTOOLS_THEME");
    return (savedTheme as Theme) || "system";
  });

  const [isDark, setIsDark] = useState(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return theme === "dark";
  });

  // Update theme in localStorage when it changes
  useEffect(() => {
    localStorage.setItem("DEVTOOLS_THEME", theme);
  }, [theme]);

  // Update dark mode state and apply theme immediately
  useEffect(() => {
    const root = window.document.documentElement;
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (theme === "system") {
      setIsDark(systemDark);
    } else {
      setIsDark(theme === "dark");
    }

    // Remove both classes first to ensure clean state
    root.classList.remove("light", "dark");
    // Then add the appropriate class
    root.classList.add(isDark ? "dark" : "light");
  }, [theme, isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        setIsDark(mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
