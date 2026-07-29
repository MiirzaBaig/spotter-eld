import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 h-12 bg-background/72 backdrop-blur-xl transition-all duration-300 ${
        scrolled ? "border-b border-border shadow-e1" : "border-b border-transparent"
      }`}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* Logo lockup */}
        <a href="/" className="group flex items-center gap-2.5" aria-label="Spotter ELD home">
          <div className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-accent text-accent-foreground shadow-e1 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
            <Truck size={14} strokeWidth={2.5} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[14.5px] font-semibold tracking-[-0.02em] text-foreground">
              Spotter
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              ELD
            </span>
          </div>
        </a>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5">
          {/* Compliance badge pill */}
          <div className="hidden items-center gap-2 rounded-full border border-border bg-surface/60 py-1 pl-2.5 pr-3 sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-duty-driving)] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-duty-driving)]" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground">
              FMCSA · 70h / 8-day
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="font-mono text-[10px] tracking-[0.08em] text-foreground/70">
              Property carrier
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
