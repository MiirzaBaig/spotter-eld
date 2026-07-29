import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function AssumptionsNote() {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-2/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
      >
        <span className="mono-eyebrow">Assumptions</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-3.5 text-[12.5px] leading-relaxed text-muted-foreground">
            Property-carrying driver on the 70-hour / 8-day cycle · no adverse driving conditions ·
            fuel at least every 1,000 miles · 1 hour each for pickup and drop-off. Daily rest uses a
            full 10-hour reset by default; enable “Split sleeper berth” to use the 8/2 pairing under
            §395.1(g). Adverse-driving and short-haul exceptions are out of scope.
          </p>
        </div>
      </div>
    </div>
  );
}
