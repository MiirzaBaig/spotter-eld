interface Item {
  label: string;
  color: string;
}

export function Legend({ items }: { items: Item[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((it, i) => (
        <div
          key={it.label}
          className="lift inline-flex animate-fade-up items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 hover:border-border-strong"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full transition-transform duration-200 group-hover:scale-110"
            style={{
              backgroundColor: it.color,
              boxShadow: `0 0 0 3px color-mix(in oklab, ${it.color} 18%, transparent)`,
            }}
            aria-hidden
          />
          <span className="font-mono text-[10.5px] tracking-wide text-muted-foreground">
            {it.label}
          </span>
        </div>
      ))}
    </div>
  );
}
