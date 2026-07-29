export type DutyStatus = "off_duty" | "sleeper" | "driving" | "on_duty";
export type StopKind = "start" | "pickup" | "dropoff" | "fuel" | "break" | "rest" | "current";

export interface Point {
  lat: number;
  lon: number;
  label: string;
  query: string;
}

export interface Segment {
  status: DutyStatus;
  start: string;
  end: string;
  hours: number;
  location: string;
  remark: string;
}

export interface Stop {
  kind: StopKind;
  label: string;
  at: string;
  miles_from_start: number;
}

export interface LogRowEntry {
  start_h: number;
  end_h: number;
  location: string;
  remark: string;
}

export interface DailyLog {
  date: string;
  rows: Record<DutyStatus, LogRowEntry[]>;
  totals: Record<DutyStatus, number>;
  remarks: { at_h: number; location: string; remark: string }[];
  total_hours: number;
}

export interface TripPlan {
  inputs: {
    current_location: string;
    pickup_location: string;
    dropoff_location: string;
    current_cycle_used: number;
    start_time: string;
  };
  points: {
    current: Point;
    pickup: Point;
    dropoff: Point;
  };
  route: {
    distance_miles: number;
    duration_hours: number;
    geometry: { type: "LineString"; coordinates: [number, number][] };
  };
  hos: {
    segments: Segment[];
    stops: Stop[];
    summary: {
      total_driving_hours: number;
      total_on_duty_hours: number;
      total_distance_miles: number;
      total_days: number;
    };
  };
  daily_logs: DailyLog[];
}
