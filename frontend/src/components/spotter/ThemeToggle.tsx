import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-pressed={isDark}
      className="group inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-border bg-surface text-foreground/80 transition-all duration-200 hover:bg-surface-2 hover:text-foreground active:scale-90"
    >
      <span
        key={isDark ? "sun" : "moon"}
        className="inline-flex animate-[spotter-theme-swap_360ms_cubic-bezier(0.34,1.56,0.5,1)]"
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </span>
    </button>
  );
}
