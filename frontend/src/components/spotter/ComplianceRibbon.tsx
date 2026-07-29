import { useState } from "react";
import { CheckCircle2, Fuel, Bed, CalendarClock, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadTripPdf } from "@/lib/tripPdf";
import type { TripPlan } from "@/lib/tripTypes";

const CYCLE_LIMIT = 70;

/**
 * A compact "compliance at a glance" ribbon above the log sheets:
 * a cycle-hours gauge (turns amber near the 70h limit) plus the key
 * planning facts — fuel stops, rest resets, and the finish date.
 */
export function ComplianceRibbon({ trip }: { trip: TripPlan }) {
  const [exporting, setExporting] = useState(false);

  async function exportPdf() {
    setExporting(true);
    try {
      // Let the spinner paint before the synchronous draw work.
      await new Promise((r) => setTimeout(r, 30));
      downloadTripPdf(trip);
      toast.success("Trip report exported", {
        description: `${trip.daily_logs.length + 1} pages · PDF`,
      });
    } catch {
      toast.error("Couldn't generate the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  const stops = trip.hos.stops;
  const fuel = stops.filter((s) => s.kind === "fuel").length;
  const rests = stops.filter((s) => s.kind === "rest").length;

  const used = trip.inputs.current_cycle_used;
  const projected = Math.min(CYCLE_LIMIT, used + trip.hos.summary.total_on_duty_hours);
  const pct = Math.min(100, (projected / CYCLE_LIMIT) * 100);
  const near = pct >= 85;
  const gaugeColor = near ? "var(--color-stop-fuel)" : "var(--color-duty-driving)";

  const lastStop = stops[stops.length - 1];
  const finish = lastStop
    ? new Date(lastStop.at).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <div className="animate-fade-up flex flex-col gap-y-3.5 rounded-xl border border-border bg-surface px-4 py-3.5 shadow-e1 sm:px-5 sm:py-4 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-6">
      {/* Status */}
      <div className="flex items-center gap-2">
        <CheckCircle2 size={16} className="shrink-0 text-[var(--color-duty-driving)]" />
        <span className="text-[13px] font-semibold text-foreground">HOS-compliant plan</span>
      </div>

      {/* Cycle gauge */}
      <div className="flex flex-1 items-center gap-3 lg:min-w-[200px]">
        <span className="mono-eyebrow shrink-0">Cycle</span>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div
            className="gauge-fill absolute inset-y-0 left-0 rounded-full"
            style={{ ["--gauge-w" as string]: `${pct}%`, backgroundColor: gaugeColor }}
          />
        </div>
        <span className="tabular shrink-0 font-mono text-[12px] font-semibold text-foreground">
          {projected.toFixed(1)}
          <span className="font-normal text-muted-foreground">/{CYCLE_LIMIT}h</span>
        </span>
      </div>

      {/* Facts */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <Fact
          icon={<Fuel size={13} />}
          value={fuel}
          label={fuel === 1 ? "fuel stop" : "fuel stops"}
        />
        <Fact
          icon={<Bed size={13} />}
          value={rests}
          label={rests === 1 ? "rest reset" : "rest resets"}
        />
        <Fact icon={<CalendarClock size={13} />} value={finish} label="finish" />
      </div>

      {/* Export */}
      <button
        type="button"
        onClick={exportPdf}
        disabled={exporting}
        className="lift group ml-auto inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3.5 text-[12.5px] font-semibold text-accent-foreground shadow-e1 transition-colors hover:bg-accent-hover disabled:cursor-progress disabled:opacity-80"
      >
        {exporting ? (
          <Loader2 size={14} className="animate-[spotter-spin_0.9s_linear_infinite]" />
        ) : (
          <FileDown
            size={14}
            className="transition-transform duration-200 group-hover:-translate-y-px"
          />
        )}
        {exporting ? "Preparing…" : "Download report"}
      </button>
    </div>
  );
}

function Fact({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="tabular font-mono text-[13px] font-semibold text-foreground">{value}</span>
      <span className="text-[11.5px] text-muted-foreground">{label}</span>
    </div>
  );
}
