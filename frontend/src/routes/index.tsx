import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Toaster } from "@/components/ui/sonner";
import { TopBar } from "@/components/spotter/TopBar";
import { TripForm, type TripFormValues } from "@/components/spotter/TripForm";
import { EmptyState } from "@/components/spotter/EmptyState";
import { LoadingState } from "@/components/spotter/LoadingState";
import { StatStrip } from "@/components/spotter/StatStrip";
import { SectionHeading } from "@/components/spotter/SectionHeading";
import { Legend } from "@/components/spotter/Legend";
import { RouteMap } from "@/components/spotter/RouteMap";
import { TripTimeline } from "@/components/spotter/TripTimeline";
import { LogSheet } from "@/components/spotter/LogSheet";
import { ComplianceRibbon } from "@/components/spotter/ComplianceRibbon";
import { AssumptionsNote } from "@/components/spotter/AssumptionsNote";
import { toast } from "sonner";
import { planTrip } from "@/lib/api";
import type { TripPlan } from "@/lib/tripTypes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spotter ELD — Trip planner & FMCSA daily logs" },
      {
        name: "description",
        content:
          "Plan commercial-truck trips and auto-generate FMCSA driver's daily log sheets on the classic 24-hour grid, with routes, required stops, and hours-of-service compliance.",
      },
      { property: "og:title", content: "Spotter ELD — Trip planner & FMCSA daily logs" },
      {
        property: "og:description",
        content:
          "Route + electronic logging device sheets for property carriers on the 70h/8-day cycle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ease = [0.2, 0, 0, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease } },
};

function Index() {
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<TripPlan | null>(null);

  async function handleSubmit(values: TripFormValues, preset?: TripPlan) {
    // Preset buttons load their bundled mock instantly (nice for offline demos).
    if (preset) {
      setLoading(true);
      setTrip(null);
      window.setTimeout(() => {
        setTrip(preset);
        setLoading(false);
      }, 500);
      return;
    }

    // Real trips call the Django backend. We surface a clear error rather than
    // silently showing sample logs for the driver's actual trip.
    setLoading(true);
    setTrip(null);
    try {
      const plan = await planTrip(values);
      setTrip(plan);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong planning the trip.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <main className="grid grid-cols-1 lg:grid-cols-[380px_1fr]">
        <aside className="border-b border-border bg-surface p-5 lg:sticky lg:top-12 lg:h-[calc(100vh-48px)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <TripForm loading={loading} onSubmit={handleSubmit} />
        </aside>

        <section className="min-w-0">
          {loading && <LoadingState />}
          {!loading && !trip && <EmptyState />}
          {!loading && trip && <Results trip={trip} />}
        </section>
      </main>
      <Toaster position="bottom-right" />
    </div>
  );
}

function Results({ trip }: { trip: TripPlan }) {
  const s = trip.hos.summary;
  const [activeStop, setActiveStop] = useState<number | null>(null);
  // Bumps each click so re-selecting the same stop still re-triggers the fly-to.
  const [focusStop, setFocusStop] = useState<{ i: number; nonce: number } | null>(null);
  const selectStop = (i: number) => setFocusStop({ i, nonce: Date.now() });

  return (
    <motion.div
      key={trip.inputs.start_time}
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 p-5 sm:p-6"
    >
      <motion.div variants={item}>
        <StatStrip
          animate
          cells={[
            { label: "Distance", value: s.total_distance_miles.toFixed(0), unit: "mi" },
            { label: "Driving", value: s.total_driving_hours.toFixed(1), unit: "h" },
            { label: "On Duty", value: s.total_on_duty_hours.toFixed(1), unit: "h" },
            {
              label: "Log Days",
              value: String(s.total_days),
              unit: s.total_days === 1 ? "sheet" : "sheets",
            },
          ]}
        />
      </motion.div>

      <motion.section variants={item} className="flex flex-col gap-4">
        <SectionHeading
          number="01"
          title="Route & required stops"
          aside={`${trip.hos.stops.length} events`}
        />
        <Legend
          items={[
            { label: "Current", color: "var(--color-duty-off)" },
            { label: "Pickup", color: "var(--color-duty-driving)" },
            { label: "Drop-off", color: "var(--color-accent)" },
            { label: "Fuel", color: "var(--color-stop-fuel)" },
            { label: "30-min break", color: "var(--color-duty-sleeper)" },
            { label: "10-hr rest", color: "var(--color-stop-rest)" },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
          <RouteMap
            trip={trip}
            activeStop={activeStop}
            focusStop={focusStop}
            onHoverStop={setActiveStop}
          />
          <TripTimeline
            trip={trip}
            activeStop={activeStop}
            onHoverStop={setActiveStop}
            onSelectStop={selectStop}
          />
        </div>
      </motion.section>

      <motion.section variants={item} className="flex flex-col gap-4">
        <SectionHeading
          number="02"
          title="ELD daily log sheets"
          aside="midnight → midnight · home terminal time"
        />
        <ComplianceRibbon trip={trip} />
        <div className="flex flex-col gap-4">
          {trip.daily_logs.map((log, i) => (
            <LogSheet key={log.date} log={log} index={i} trip={trip} delayMs={i * 70} />
          ))}
        </div>
      </motion.section>

      <motion.div variants={item}>
        <AssumptionsNote />
      </motion.div>
    </motion.div>
  );
}
