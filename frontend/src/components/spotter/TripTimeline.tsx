import type { TripPlan, StopKind } from "@/lib/tripTypes";

export const kindMeta: Record<StopKind, { color: string; emoji: string; label: string }> = {
  start: { color: "var(--color-duty-off)", emoji: "📍", label: "Current" },
  current: { color: "var(--color-duty-off)", emoji: "📍", label: "Current" },
  pickup: { color: "var(--color-duty-driving)", emoji: "📦", label: "Pickup" },
  dropoff: { color: "var(--color-accent)", emoji: "🏁", label: "Drop-off" },
  fuel: { color: "var(--color-stop-fuel)", emoji: "⛽", label: "Fuel" },
  break: { color: "var(--color-duty-sleeper)", emoji: "☕", label: "Break" },
  rest: { color: "var(--color-stop-rest)", emoji: "🛏️", label: "Rest" },
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface Props {
  trip: TripPlan;
  activeStop?: number | null;
  onHoverStop?: (index: number | null) => void;
  onSelectStop?: (index: number) => void;
}

export function TripTimeline({ trip, activeStop = null, onHoverStop, onSelectStop }: Props) {
  return (
    <div className="flex max-h-[430px] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-e1 lg:h-[430px]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
          Trip timeline
        </div>
        <div className="mono-eyebrow">{trip.hos.stops.length} stops</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ol className="divide-y divide-border">
          {trip.hos.stops.map((stop, i) => {
            const meta = kindMeta[stop.kind];
            const active = activeStop === i;
            return (
              <li
                key={i}
                onMouseEnter={() => onHoverStop?.(i)}
                onMouseLeave={() => onHoverStop?.(null)}
                onClick={() => onSelectStop?.(i)}
                className={`relative flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                  active ? "bg-surface-2" : "hover:bg-surface-2/70"
                }`}
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-[2px] origin-top transition-transform duration-200"
                  style={{
                    backgroundColor: meta.color,
                    transform: `scaleY(${active ? 1 : 0})`,
                  }}
                />
                <div
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[17px] leading-none transition-transform duration-200"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${meta.color} 13%, transparent)`,
                    transform: active ? "scale(1.1)" : "scale(1)",
                  }}
                  aria-hidden
                >
                  <span>{meta.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-foreground">
                    {stop.label}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {formatWhen(stop.at)}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="tabular font-mono text-[12px] font-semibold text-foreground">
                    {stop.miles_from_start.toFixed(0)}
                    <span className="ml-0.5 font-normal text-muted-foreground">mi</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
