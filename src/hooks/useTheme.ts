import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setDarkMode } from "../store/slices/uiSlice";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

/**
 * Custom hook for managing theme state with localStorage persistence
 * Supports light/dark mode with CSS class-based toggling
 */
export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.ui);

  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize theme from localStorage or system preference
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      if (stored && (stored === "light" || stored === "dark")) {
        return stored;
      }

      // Check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  // Set theme and persist to localStorage
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      applyTheme(newTheme);
    },
    [applyTheme],
  );

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // Sync with Redux state
    dispatch(setDarkMode(newTheme === "dark"));
  }, [theme, setTheme, dispatch]);

  // Sync with Redux state on mount and when Redux state changes
  useEffect(() => {
    const reduxTheme: Theme = darkMode ? "dark" : "light";
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;

    // If Redux state differs from stored theme, sync them
    if (storedTheme && reduxTheme !== storedTheme) {
      // Prefer Redux state as source of truth
      setThemeState(reduxTheme);
      localStorage.setItem(THEME_STORAGE_KEY, reduxTheme);
      applyTheme(reduxTheme);
    } else if (!storedTheme) {
      // If no stored theme, use Redux state
      setThemeState(reduxTheme);
      localStorage.setItem(THEME_STORAGE_KEY, reduxTheme);
      applyTheme(reduxTheme);
    } else {
      // If stored theme exists and matches Redux, just apply it
      applyTheme(theme);
    }
    setIsInitialized(true);
  }, [darkMode, theme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no stored preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        const newTheme = e.matches ? "dark" : "light";
        setThemeState(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
    isInitialized,
  };
};

export default useTheme;
