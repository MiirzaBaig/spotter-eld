import { useState, type FormEvent } from "react";
import { AlertTriangle, ArrowRight, Check, Loader2 } from "lucide-react";
import { mockTrips } from "@/lib/mockData";
import type { TripPlan } from "@/lib/tripTypes";

export interface TripFormValues {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_used: number;
  use_split_sleeper: boolean;
}

interface Props {
  loading: boolean;
  onSubmit: (values: TripFormValues, preset?: TripPlan) => void;
}

const presets: {
  key: keyof typeof mockTrips;
  title: string;
  sub: string;
}[] = [
  { key: "chicagoDetroit", title: "Chicago → Detroit", sub: "1 day · short haul" },
  { key: "dallasDenver", title: "Dallas → Denver", sub: "~2 days · 22h used" },
  { key: "laToNyc", title: "Los Angeles → New York", sub: "multi-day · cross-country" },
];

export function TripForm({ loading, onSubmit }: Props) {
  const [values, setValues] = useState<TripFormValues>({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    current_cycle_used: 0,
    use_split_sleeper: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  function fail(msg: string) {
    setError(msg);
    setShakeKey((k) => k + 1);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (
      !values.current_location.trim() ||
      !values.pickup_location.trim() ||
      !values.dropoff_location.trim()
    ) {
      fail("Please fill in current location, pickup, and drop-off.");
      return;
    }
    if (values.current_cycle_used < 0 || values.current_cycle_used > 70) {
      fail("Cycle hours must be between 0 and 70.");
      return;
    }
    setError(null);
    onSubmit(values);
  }

  function applyPreset(key: keyof typeof mockTrips) {
    const trip = mockTrips[key];
    const next: TripFormValues = {
      current_location: trip.inputs.current_location,
      pickup_location: trip.inputs.pickup_location,
      dropoff_location: trip.inputs.dropoff_location,
      current_cycle_used: trip.inputs.current_cycle_used,
      use_split_sleeper: values.use_split_sleeper,
    };
    setValues(next);
    setError(null);
    onSubmit(next, trip);
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="mono-eyebrow">Trip Planner</div>
        <h1 className="mt-2 text-h1 text-foreground">Route &amp; hours-of-service logs</h1>
        <p className="mt-2 text-body text-muted-foreground">
          Enter a trip and Spotter maps the route with required stops and draws every FMCSA daily
          log sheet.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <fieldset className="relative m-0 border-0 p-0">
          <div
            aria-hidden
            className="pointer-events-none absolute left-[3.5px] top-[22px] bottom-[62px] w-px bg-linear-to-b from-duty-off via-duty-driving to-accent opacity-45"
          />
          <LocatedField
            id="current"
            label="Current Location"
            code="A"
            dotColor="var(--color-duty-off)"
            placeholder="Chicago, IL"
            value={values.current_location}
            onChange={(v) => setValues({ ...values, current_location: v })}
          />
          <LocatedField
            id="pickup"
            label="Pickup"
            code="B"
            dotColor="var(--color-duty-driving)"
            placeholder="Chicago, IL"
            value={values.pickup_location}
            onChange={(v) => setValues({ ...values, pickup_location: v })}
          />
          <LocatedField
            id="dropoff"
            label="Drop-off"
            code="C"
            dotColor="var(--color-accent)"
            placeholder="Detroit, MI"
            value={values.dropoff_location}
            onChange={(v) => setValues({ ...values, dropoff_location: v })}
          />
        </fieldset>

        <div>
          <label htmlFor="cycle" className="flex items-center justify-between">
            <span className="mono-eyebrow">Cycle Used (hrs)</span>
            <span className="font-mono text-[10.5px] text-muted-foreground/70">0–70</span>
          </label>
          <input
            id="cycle"
            type="number"
            min={0}
            max={70}
            step={0.5}
            value={values.current_cycle_used}
            onChange={(e) => setValues({ ...values, current_cycle_used: Number(e.target.value) })}
            placeholder="0"
            className="tabular mt-2 h-10 w-full rounded-lg border border-border bg-surface-2/60 px-3 font-mono text-[13px] text-foreground shadow-none transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-border-strong focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_var(--accent-soft)] focus:outline-none"
          />
          <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground">
            On-duty hours already logged in the current 8-day cycle.
          </p>
        </div>

        <label
          htmlFor="split"
          className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all duration-200 ${
            values.use_split_sleeper
              ? "border-accent/50 bg-accent-soft/60"
              : "border-border bg-surface-2/40 hover:border-border-strong"
          }`}
        >
          <input
            id="split"
            type="checkbox"
            checked={values.use_split_sleeper}
            onChange={(e) => setValues({ ...values, use_split_sleeper: e.target.checked })}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={`mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border transition-all duration-200 group-active:scale-90 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-surface ${
              values.use_split_sleeper
                ? "border-accent bg-accent text-accent-foreground shadow-e1"
                : "border-border-strong bg-surface group-hover:border-accent/60"
            }`}
          >
            <Check
              size={12}
              strokeWidth={3.2}
              className={`transition-all duration-200 ${
                values.use_split_sleeper ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
            />
          </span>
          <span>
            <span className="mono-eyebrow block transition-colors group-hover:text-foreground/70">
              Split sleeper berth
            </span>
            <span className="mt-1 block text-[11.5px] leading-relaxed text-muted-foreground">
              Use the 8/2 sleeper-berth pairing (§395.1(g)) instead of a single 10-hour reset.
            </span>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="cta-glow group relative mt-1 inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-accent text-[13.5px] font-semibold text-accent-foreground transition-all duration-200 hover:bg-accent-hover active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[spotter-sheen_900ms_cubic-bezier(0.2,0,0,1)]"
          />
          {loading ? (
            <>
              <Loader2 size={15} className="animate-[spotter-spin_0.9s_linear_infinite]" />
              Computing route &amp; logs…
            </>
          ) : (
            <>
              Plan trip
              <ArrowRight
                size={15}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>

        {error && (
          <div
            key={shakeKey}
            role="alert"
            className="animate-shake flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-bg px-3 py-2.5 text-[12.5px] text-danger"
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      <div className="flex flex-col gap-2.5">
        <div className="mono-eyebrow">Example Trips</div>
        <div className="flex flex-col gap-2">
          {presets.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => applyPreset(p.key)}
              disabled={loading}
              className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-3 text-left shadow-e1 transition-all duration-200 hover:-translate-y-px hover:border-accent/40 hover:bg-surface-2 hover:shadow-e2 active:translate-y-0 active:scale-[0.99] disabled:opacity-60"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-foreground">{p.title}</div>
                <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                  {p.sub}
                </div>
              </div>
              <ArrowRight
                size={14}
                className="shrink-0 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LocatedField({
  id,
  label,
  code,
  dotColor,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  code: string;
  dotColor: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const filled = value.trim().length > 0;
  return (
    <div className="relative mb-3.5 pl-6 last:mb-0">
      <span
        aria-hidden
        className="absolute left-0 top-[6px] h-2 w-2 rounded-full ring-4 ring-surface transition-all duration-200"
        style={{
          backgroundColor: filled ? dotColor : "var(--border-strong)",
          boxShadow: filled
            ? `0 0 0 3px color-mix(in oklab, ${dotColor} 22%, transparent)`
            : "none",
        }}
      />
      <label htmlFor={id} className="flex items-center justify-between">
        <span className="mono-eyebrow">{label}</span>
        <span className="font-mono text-[10.5px] font-semibold text-muted-foreground/70">
          {code}
        </span>
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-10 w-full rounded-lg border border-border bg-surface-2/60 px-3 text-[13px] text-foreground transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-border-strong focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_var(--accent-soft)] focus:outline-none"
      />
    </div>
  );
}
