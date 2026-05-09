import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark" | "auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "auto";
    return (localStorage.getItem("theme") as Theme) || "auto";
  });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => {
      const dark =
        theme === "dark" ||
        (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDark(dark);
      document.documentElement.classList.toggle("dark", dark);
    };
    update();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem("theme", t);
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
