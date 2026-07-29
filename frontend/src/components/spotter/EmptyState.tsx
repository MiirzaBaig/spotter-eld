import { ArrowLeft, Check } from "lucide-react";

const features = [
  "Live route with fuel, break & rest stops",
  "FMCSA daily log sheets, ready to export",
];

export function EmptyState() {
  return (
    <div className="flex min-h-[calc(100vh-48px)] items-center justify-center px-6 py-12">
      <div className="animate-fade-up flex w-full max-w-sm flex-col items-center text-center">
        {/* Animated route motif — three stops joined by a drawing line. */}
        <RouteMotif />

        <h2 className="mt-8 text-[22px] font-semibold tracking-[-0.02em] text-foreground">
          Plan your first trip
        </h2>
        <p className="mt-2.5 max-w-[19rem] text-[13.5px] leading-relaxed text-muted-foreground">
          Enter your locations on the left, or pick an example. Spotter maps the
          route and draws every daily log sheet.
        </p>

        {/* Features — quiet inline list, not boxed. */}
        <ul className="mt-7 flex flex-col gap-2.5">
          {features.map((f, i) => (
            <li
              key={f}
              className="animate-fade-up flex items-center gap-2.5 text-[12.5px] text-muted-foreground"
              style={{ animationDelay: `${260 + i * 90}ms` }}
            >
              <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                <Check size={11} strokeWidth={3} />
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* Gentle nudge toward the form — a soft accent pill that breathes. */}
        <div
          className="nudge-pill animate-fade-up mt-8 inline-flex items-center gap-2 rounded-full border bg-accent-soft/70 py-1.5 pl-2.5 pr-3.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-accent"
          style={{ animationDelay: "440ms" }}
        >
          <span className="animate-[spotter-nudge_1.4s_cubic-bezier(0.4,0,0.2,1)_infinite]">
            <ArrowLeft size={13} strokeWidth={2.5} />
          </span>
          Start on the left
        </div>
      </div>
    </div>
  );
}

/** A small SVG of three route stops connected by a line that draws itself in. */
function RouteMotif() {
  return (
    <svg
      width="132"
      height="72"
      viewBox="0 0 132 72"
      fill="none"
      className="overflow-visible"
      aria-hidden
    >
      {/* connecting path */}
      <path
        d="M16 52 C 40 52, 46 20, 66 20 S 92 52, 116 52"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="220"
        strokeDashoffset="220"
        opacity="0.85"
        className="motif-draw"
      />
      {/* stops */}
      {[
        { cx: 16, cy: 52, c: "var(--color-duty-off)", d: "0ms" },
        { cx: 66, cy: 20, c: "var(--color-duty-driving)", d: "500ms" },
        { cx: 116, cy: 52, c: "var(--color-accent)", d: "900ms" },
      ].map((s, i) => (
        <g key={i} className="motif-pin" style={{ animationDelay: s.d }}>
          <circle cx={s.cx} cy={s.cy} r="9" fill={s.c} opacity="0.14" />
          <circle cx={s.cx} cy={s.cy} r="4.5" fill={s.c} stroke="var(--surface)" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}
