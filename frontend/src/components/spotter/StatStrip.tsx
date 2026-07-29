import { CountUp } from "./CountUp";

interface Cell {
  label: string;
  value: string;
  unit: string;
}

export function StatStrip({ cells, animate = false }: { cells: Cell[]; animate?: boolean }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface shadow-e1 md:grid-cols-4">
      {cells.map((c, i) => (
        <div
          key={c.label}
          className={`group relative px-5 py-4 transition-colors duration-200 hover:bg-surface-2 ${
            i % 2 === 1 ? "border-l border-border" : ""
          } ${i >= 2 ? "border-t border-border md:border-t-0" : ""} ${
            i === 2 ? "md:border-l md:border-border" : ""
          }`}
        >
          <div className="mono-eyebrow transition-colors duration-200 group-hover:text-foreground/70">
            {c.label}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="tabular text-[24px] font-semibold leading-none tracking-[-0.03em] text-foreground sm:text-[27px]">
              {animate ? <CountUp value={c.value} /> : c.value}
            </span>
            <span className="font-mono text-[11px] font-medium text-muted-foreground">
              {c.unit}
            </span>
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
          />
        </div>
      ))}
    </div>
  );
}
