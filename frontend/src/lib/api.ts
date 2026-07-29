import type { TripPlan } from "./tripTypes";
import type { TripFormValues } from "@/components/spotter/TripForm";

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8009";

/**
 * Call the Django backend to plan a trip.
 * Returns the full TripPlan (route + HOS timeline + daily logs).
 * Throws an Error with a user-friendly message on failure.
 */
export async function planTrip(values: TripFormValues): Promise<TripPlan> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/plan-trip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_location: values.current_location,
        pickup_location: values.pickup_location,
        dropoff_location: values.dropoff_location,
        current_cycle_used: Number(values.current_cycle_used) || 0,
        use_split_sleeper: values.use_split_sleeper ?? false,
      }),
    });
  } catch {
    throw new Error("Couldn't reach the trip service. Check your connection and try again.");
  }

  const data = await res.json().catch(() => ({}) as Record<string, unknown>);
  if (!res.ok) {
    const detail = (data as { detail?: string }).detail;
    throw new Error(detail || "Something went wrong planning the trip.");
  }
  return data as TripPlan;
}
