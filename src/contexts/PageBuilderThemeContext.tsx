import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type PBTheme =
  | "light" | "dark" | "midnight" | "slate" | "emerald" | "cyberpunk"
  | "serika" | "botanical" | "olivia" | "carbon"
  | "monokai" | "aurora" | "dracula" | "terminal";

interface ThemeConfig {
  label: string;
  preview: string;
}

export const PB_THEMES: Record<PBTheme, ThemeConfig> = {
  light:     { label: "Light",      preview: "#f5f5f5" },
  dark:      { label: "Dark",       preview: "#1e1e2e" },
  midnight:  { label: "Midnight",   preview: "#3b82f6" },
  slate:     { label: "Slate",      preview: "#64748b" },
  emerald:   { label: "Emerald",    preview: "#10b981" },
  cyberpunk: { label: "Cyberpunk",  preview: "#e879f9" },
  serika:    { label: "Serika",     preview: "#e2b714" },
  botanical: { label: "Botanical",  preview: "#7b9e6b" },
  olivia:    { label: "Olivia",     preview: "#e8a0bf" },
  carbon:    { label: "Carbon",     preview: "#f5f5f5" },
  monokai:   { label: "Monokai",    preview: "#f92672" },
  aurora:    { label: "Aurora",     preview: "#88c0d0" },
  dracula:   { label: "Dracula",    preview: "#bd93f9" },
  terminal:  { label: "Terminal",   preview: "#00ff41" },
};

const STORAGE_KEY = "pb_theme";

interface Ctx {
  theme: PBTheme;
  setTheme: (t: PBTheme) => void;
}

const PageBuilderThemeContext = createContext<Ctx>({
  theme: "dark",
  setTheme: () => {},
});

export function PageBuilderThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<PBTheme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in PB_THEMES) return stored as PBTheme;
    return "dark";
  });

  const setTheme = (t: PBTheme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  // Apply theme classes scoped to page builder
  useEffect(() => {
    const root = document.documentElement;
    // Save dashboard theme classes to restore later
    const savedDashTheme = localStorage.getItem("admin_theme") ?? "midnight";
    const savedColorMode = localStorage.getItem("admin_color_mode") ?? "system";

    // Remove all theme-* classes
    Object.keys(PB_THEMES).forEach((k) => root.classList.remove(`theme-${k}`));
    root.classList.add(`theme-${theme}`);

    // Determine light/dark for this PB theme
    const lightThemes: PBTheme[] = ["light"];
    if (lightThemes.includes(theme)) {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }

    return () => {
      // Restore dashboard theme on unmount
      Object.keys(PB_THEMES).forEach((k) => root.classList.remove(`theme-${k}`));
      root.classList.add(`theme-${savedDashTheme}`);

      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolvedMode = savedDashTheme === "light" ? "light"
        : savedDashTheme === "dark" ? "dark"
        : savedColorMode === "system" ? (systemDark ? "dark" : "light")
        : savedColorMode;

      if (resolvedMode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };
  }, [theme]);

  return (
    <PageBuilderThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </PageBuilderThemeContext.Provider>
  );
}

export const usePageBuilderTheme = () => useContext(PageBuilderThemeContext);
