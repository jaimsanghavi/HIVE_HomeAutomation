import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { lightScheme, darkScheme, type ColorScheme } from "../theme";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  colors: ColorScheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveSystemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem("hive-theme") as ThemeMode) || "dark";
  });

  const isDark = mode === "dark" || (mode === "system" && resolveSystemDark());
  const colors = isDark ? darkScheme : lightScheme;

  useEffect(() => {
    localStorage.setItem("hive-theme", mode);
    document.documentElement.classList.toggle("dark", isDark);
  }, [mode, isDark]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setModeState("system"); // re-trigger
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [mode]);

  function setMode(m: ThemeMode) {
    setModeState(m);
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, colors, isDark }}>
      <div
        style={
          {
            "--md-sys-color-primary": colors.primary,
            "--md-sys-color-on-primary": colors.onPrimary,
            "--md-sys-color-primary-container": colors.primaryContainer,
            "--md-sys-color-on-primary-container": colors.onPrimaryContainer,
            "--md-sys-color-secondary": colors.secondary,
            "--md-sys-color-on-secondary": colors.onSecondary,
            "--md-sys-color-secondary-container": colors.secondaryContainer,
            "--md-sys-color-on-secondary-container": colors.onSecondaryContainer,
            "--md-sys-color-tertiary": colors.tertiary,
            "--md-sys-color-on-tertiary": colors.onTertiary,
            "--md-sys-color-tertiary-container": colors.tertiaryContainer,
            "--md-sys-color-on-tertiary-container": colors.onTertiaryContainer,
            "--md-sys-color-error": colors.error,
            "--md-sys-color-on-error": colors.onError,
            "--md-sys-color-error-container": colors.errorContainer,
            "--md-sys-color-on-error-container": colors.onErrorContainer,
            "--md-sys-color-surface": colors.surface,
            "--md-sys-color-on-surface": colors.onSurface,
            "--md-sys-color-surface-variant": colors.surfaceVariant,
            "--md-sys-color-on-surface-variant": colors.onSurfaceVariant,
            "--md-sys-color-surface-container": colors.surfaceContainer,
            "--md-sys-color-surface-container-low": colors.surfaceContainerLow,
            "--md-sys-color-surface-container-high": colors.surfaceContainerHigh,
            "--md-sys-color-surface-container-highest": colors.surfaceContainerHighest,
            "--md-sys-color-outline": colors.outline,
            "--md-sys-color-outline-variant": colors.outlineVariant,
            "--md-sys-color-inverse-surface": colors.inverseSurface,
            "--md-sys-color-inverse-on-surface": colors.inverseOnSurface,
            "--md-sys-color-success": colors.success,
            "--md-sys-color-warning": colors.warning,
            "--md-sys-color-shadow": colors.shadow,
            "--md-sys-color-scrim": colors.scrim,
            backgroundColor: colors.surface,
            color: colors.onSurface,
            minHeight: "100dvh",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
