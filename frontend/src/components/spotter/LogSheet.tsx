import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { DailyLog, DutyStatus, TripPlan } from "@/lib/tripTypes";

const rowOrder: DutyStatus[] = ["off_duty", "sleeper", "driving", "on_duty"];
const rowLabels: Record<DutyStatus, string> = {
  off_duty: "1. Off Duty",
  sleeper: "2. Sleeper",
  driving: "3. Driving",
  on_duty: "4. On Duty",
};

function dutyColor(status: DutyStatus): string {
  const map: Record<DutyStatus, string> = {
    off_duty: "--color-duty-off",
    sleeper: "--color-duty-sleeper",
    driving: "--color-duty-driving",
    on_duty: "--color-duty-onduty",
  };
  return getComputedStyle(document.documentElement).getPropertyValue(map[status]).trim();
}

function readVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

interface EventPoint {
  h: number;
  status: DutyStatus;
}

function buildEvents(log: DailyLog): EventPoint[] {
  const events: EventPoint[] = [];
  rowOrder.forEach((status) => {
    log.rows[status].forEach((seg) => {
      events.push({ h: seg.start_h, status });
      events.push({ h: seg.end_h, status });
    });
  });
  events.sort((a, b) => a.h - b.h);
  // Deduplicate exact-same-h same-status
  return events;
}

function drawGrid(canvas: HTMLCanvasElement, log: DailyLog, progress = 1) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth;
  const cssHeight = 260;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.height = `${cssHeight}px`;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const fg = readVar("--foreground") || "#222";
  const muted = readVar("--muted-foreground") || "#888";
  const border = readVar("--border") || "#e5e5e5";
  const surface = readVar("--surface") || "#fff";

  ctx.fillStyle = surface;
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  // Scale the label gutters down on narrow screens so the grid stays usable.
  const narrow = cssWidth < 420;
  const padLeft = narrow ? 62 : 90;
  const padRight = narrow ? 48 : 70;
  const padTop = 30;
  const padBottom = 18;

  const gridW = cssWidth - padLeft - padRight;
  const gridH = cssHeight - padTop - padBottom;
  const rowH = gridH / 4;
  const hourW = gridW / 24;

  ctx.font = "500 10px ui-monospace, 'JetBrains Mono', monospace";
  ctx.fillStyle = muted;
  ctx.textBaseline = "middle";

  // Hour labels
  const labels = [
    "M",
    ...Array.from({ length: 11 }, (_, i) => String(i + 1)),
    "N",
    ...Array.from({ length: 11 }, (_, i) => String(i + 1)),
    "M",
  ];
  ctx.textAlign = "center";
  for (let h = 0; h <= 24; h++) {
    const x = padLeft + h * hourW;
    ctx.fillText(labels[h], x, padTop - 14);
  }

  // Grid background rows
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  for (let r = 0; r <= 4; r++) {
    const y = padTop + r * rowH + 0.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + gridW, y);
    ctx.stroke();
  }
  // Hour verticals + 15-min ticks
  for (let h = 0; h <= 24; h++) {
    const x = padLeft + h * hourW + 0.5;
    ctx.strokeStyle = h % 6 === 0 ? border : `color-mix(in oklab, ${border} 60%, transparent)`;
    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + gridH);
    ctx.stroke();
    // 15-min ticks
    if (h < 24) {
      for (let q = 1; q < 4; q++) {
        const tx = padLeft + (h + q / 4) * hourW + 0.5;
        for (let r = 0; r < 4; r++) {
          const cy = padTop + r * rowH + rowH / 2;
          ctx.strokeStyle = border;
          ctx.beginPath();
          ctx.moveTo(tx, cy - 3);
          ctx.lineTo(tx, cy + 3);
          ctx.stroke();
        }
      }
    }
  }

  // Row labels (abbreviated on narrow screens to fit the smaller gutter).
  const shortLabels: Record<DutyStatus, string> = {
    off_duty: "1. Off",
    sleeper: "2. SB",
    driving: "3. Drv",
    on_duty: "4. On",
  };
  ctx.fillStyle = fg;
  ctx.textAlign = "right";
  ctx.font = `500 ${narrow ? 10 : 11}px Inter, ui-sans-serif, system-ui, sans-serif`;
  rowOrder.forEach((s, i) => {
    const y = padTop + i * rowH + rowH / 2;
    ctx.fillText(narrow ? shortLabels[s] : rowLabels[s], padLeft - (narrow ? 8 : 10), y);
  });

  // Totals right
  ctx.textAlign = "left";
  ctx.font = "600 11px ui-monospace, 'JetBrains Mono', monospace";
  rowOrder.forEach((s, i) => {
    const y = padTop + i * rowH + rowH / 2;
    ctx.fillStyle = fg;
    ctx.fillText(`${log.totals[s].toFixed(1)}h`, padLeft + gridW + 12, y);
  });

  // Draw step segments (progress only clips how much of the line is revealed;
  // the underlying FMCSA math is untouched)
  const cut = Math.max(0, Math.min(1, progress)) * 24;
  const events = buildEvents(log);
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  // Horizontal segments per row per entry
  rowOrder.forEach((status, i) => {
    const color = dutyColor(status);
    const y = padTop + i * rowH + rowH / 2;
    ctx.strokeStyle = color;
    log.rows[status].forEach((seg) => {
      if (seg.start_h >= cut) return;
      const endH = Math.min(seg.end_h, cut);
      const x1 = padLeft + seg.start_h * hourW;
      const x2 = padLeft + endH * hourW;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    });
  });

  // Vertical connectors between status changes
  ctx.strokeStyle = fg;
  ctx.lineWidth = 1.2;
  for (let k = 0; k < events.length - 1; k++) {
    const cur = events[k];
    const next = events[k + 1];
    if (cur.h > cut) continue;
    if (Math.abs(cur.h - next.h) < 0.01 && cur.status !== next.status) {
      const x = padLeft + cur.h * hourW;
      const y1 = padTop + rowOrder.indexOf(cur.status) * rowH + rowH / 2;
      const y2 = padTop + rowOrder.indexOf(next.status) * rowH + rowH / 2;
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.stroke();
    }
  }
}

interface Props {
  log: DailyLog;
  index: number;
  trip: TripPlan;
  delayMs?: number;
}

function HeaderField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[9.5px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="truncate text-[12px] font-medium text-foreground">{value}</dd>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatHour(h: number) {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${mm.toString().padStart(2, "0")} ${period}`;
}

export function LogSheet({ log, index, trip, delayMs = 0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(1);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      progressRef.current = 1;
      drawGrid(canvas, log, 1);
    } else {
      progressRef.current = 0;
      const start = performance.now();
      const duration = 1100;
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutCubic
        progressRef.current = 1 - Math.pow(1 - t, 3);
        drawGrid(canvas, log, progressRef.current);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    const redraw = () => drawGrid(canvas, log, progressRef.current);
    const ro = new ResizeObserver(redraw);
    ro.observe(canvas);
    // Redraw on theme change
    const mo = new MutationObserver(redraw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
    };
  }, [log]);

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Export is always the complete, unanimated sheet
    drawGrid(canvas, log, 1);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `spotter-log-${log.date}.png`;
    link.click();
    drawGrid(canvas, log, progressRef.current);
    toast.success("PNG exported", { description: `spotter-log-${log.date}.png` });
  }

  // Per-day driven miles, derived from the day's driving hours at the trip's
  // average road speed (keeps totals consistent with the route distance).
  const mph =
    trip.route.duration_hours > 0 ? trip.route.distance_miles / trip.route.duration_hours : 55;
  const milesToday = Math.round(log.totals.driving * mph);

  return (
    <div
      className="animate-fade-up overflow-hidden rounded-lg border border-border bg-surface transition-shadow duration-200 hover:shadow-e1"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <div className="text-[13.5px] font-semibold text-foreground">
            Driver's Daily Log — Day {index + 1}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {formatDate(log.date)}
          </div>
        </div>
        <button
          type="button"
          onClick={downloadPng}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
        >
          <Download size={12} /> PNG
        </button>
      </div>

      {/* Authentic FMCSA record-of-duty-status header fields (§395.8). */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-b border-border px-4 py-3 sm:grid-cols-4">
        <HeaderField label="Total miles driving today" value={milesToday.toLocaleString()} />
        <HeaderField label="Carrier" value="Spotter Logistics LLC" />
        <HeaderField label="Main office" value="Chicago, IL" />
        <HeaderField label="Vehicle (truck / trailer)" value="TRK-1187 / TRL-4402" />
        <HeaderField label="From" value={trip.inputs.pickup_location} />
        <HeaderField label="To" value={trip.inputs.dropoff_location} />
        <HeaderField label="Shipping doc / commodity" value="BOL-77043 · General freight" />
        <HeaderField label="Driver's initials" value="M.B." />
      </dl>

      <div className="px-4 pt-4">
        <canvas ref={canvasRef} className="block w-full" aria-label={`Log grid for ${log.date}`} />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3">
        {rowOrder.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{
                backgroundColor: `var(--color-duty-${s === "off_duty" ? "off" : s === "on_duty" ? "onduty" : s})`,
              }}
            />
            <span className="font-mono text-[11px] text-muted-foreground">
              {rowLabels[s].replace(/^\d\.\s/, "")}
            </span>
            <span className="tabular font-mono text-[11.5px] font-semibold text-foreground">
              {log.totals[s].toFixed(1)}h
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="mono-eyebrow mb-2">Remarks</div>
        <ul className="flex flex-col gap-1.5">
          {log.remarks.map((r, i) => (
            <li key={i} className="flex items-baseline gap-3 text-[12.5px]">
              <span className="tabular w-20 shrink-0 font-mono text-[11.5px] text-muted-foreground">
                {formatHour(r.at_h)}
              </span>
              <span className="text-foreground">
                {r.remark}
                {r.location && <span className="text-muted-foreground"> — {r.location}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
