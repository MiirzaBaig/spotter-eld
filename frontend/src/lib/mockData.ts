import type { TripPlan } from "./tripTypes";

export const chicagoDetroit: TripPlan = {
  inputs: {
    current_location: "Chicago, IL",
    pickup_location: "Chicago, IL",
    dropoff_location: "Detroit, MI",
    current_cycle_used: 10,
    start_time: "2026-07-29T08:00:00",
  },
  points: {
    current: { lat: 41.88, lon: -87.63, label: "Chicago, IL", query: "Chicago, IL" },
    pickup: { lat: 41.88, lon: -87.63, label: "Chicago, IL", query: "Chicago, IL" },
    dropoff: { lat: 42.33, lon: -83.05, label: "Detroit, MI", query: "Detroit, MI" },
  },
  route: {
    distance_miles: 281.5,
    duration_hours: 5.3,
    geometry: {
      type: "LineString",
      coordinates: [
        [-87.63, 41.88],
        [-86.25, 41.68],
        [-84.4, 41.66],
        [-83.55, 42.05],
        [-83.05, 42.33],
      ],
    },
  },
  hos: {
    segments: [
      {
        status: "on_duty",
        start: "2026-07-29T08:00:00",
        end: "2026-07-29T09:00:00",
        hours: 1.0,
        location: "Chicago, IL",
        remark: "Pickup / loading",
      },
      {
        status: "driving",
        start: "2026-07-29T09:00:00",
        end: "2026-07-29T14:18:00",
        hours: 5.3,
        location: "En route",
        remark: "Driving toward Detroit, MI",
      },
      {
        status: "on_duty",
        start: "2026-07-29T14:18:00",
        end: "2026-07-29T15:18:00",
        hours: 1.0,
        location: "Detroit, MI",
        remark: "Drop-off / unloading",
      },
    ],
    stops: [
      { kind: "start", label: "Chicago, IL", at: "2026-07-29T08:00:00", miles_from_start: 0.0 },
      { kind: "pickup", label: "Chicago, IL", at: "2026-07-29T08:00:00", miles_from_start: 0.0 },
      { kind: "dropoff", label: "Detroit, MI", at: "2026-07-29T15:18:00", miles_from_start: 281.5 },
    ],
    summary: {
      total_driving_hours: 5.3,
      total_on_duty_hours: 7.3,
      total_distance_miles: 281.5,
      total_days: 1,
    },
  },
  daily_logs: [
    {
      date: "2026-07-29",
      rows: {
        off_duty: [
          { start_h: 0.0, end_h: 8.0, location: "", remark: "Off duty" },
          { start_h: 15.3, end_h: 24.0, location: "", remark: "Off duty" },
        ],
        sleeper: [],
        driving: [
          { start_h: 9.0, end_h: 14.3, location: "En route", remark: "Driving toward Detroit, MI" },
        ],
        on_duty: [
          { start_h: 8.0, end_h: 9.0, location: "Chicago, IL", remark: "Pickup / loading" },
          { start_h: 14.3, end_h: 15.3, location: "Detroit, MI", remark: "Drop-off / unloading" },
        ],
      },
      totals: { off_duty: 16.7, sleeper: 0.0, driving: 5.3, on_duty: 2.0 },
      remarks: [
        { at_h: 8.0, location: "Chicago, IL", remark: "Pickup / loading" },
        { at_h: 9.0, location: "En route", remark: "Driving toward Detroit, MI" },
        { at_h: 14.3, location: "Detroit, MI", remark: "Drop-off / unloading" },
      ],
      total_hours: 24.0,
    },
  ],
};

export const dallasDenver: TripPlan = {
  inputs: {
    current_location: "Dallas, TX",
    pickup_location: "Dallas, TX",
    dropoff_location: "Denver, CO",
    current_cycle_used: 22,
    start_time: "2026-07-29T06:00:00",
  },
  points: {
    current: { lat: 32.78, lon: -96.8, label: "Dallas, TX", query: "Dallas, TX" },
    pickup: { lat: 32.78, lon: -96.8, label: "Dallas, TX", query: "Dallas, TX" },
    dropoff: { lat: 39.74, lon: -104.99, label: "Denver, CO", query: "Denver, CO" },
  },
  route: {
    distance_miles: 880.0,
    duration_hours: 13.5,
    geometry: {
      type: "LineString",
      coordinates: [
        [-96.8, 32.78],
        [-97.75, 34.17],
        [-99.5, 35.47],
        [-101.83, 35.22],
        [-103.72, 35.68],
        [-104.52, 37.17],
        [-104.99, 39.74],
      ],
    },
  },
  hos: {
    segments: [
      {
        status: "on_duty",
        start: "2026-07-29T06:00:00",
        end: "2026-07-29T07:00:00",
        hours: 1,
        location: "Dallas, TX",
        remark: "Pickup / loading",
      },
      {
        status: "driving",
        start: "2026-07-29T07:00:00",
        end: "2026-07-29T12:00:00",
        hours: 5,
        location: "En route",
        remark: "Driving north on I-35",
      },
      {
        status: "off_duty",
        start: "2026-07-29T12:00:00",
        end: "2026-07-29T12:30:00",
        hours: 0.5,
        location: "Amarillo, TX",
        remark: "30-minute break",
      },
      {
        status: "driving",
        start: "2026-07-29T12:30:00",
        end: "2026-07-29T15:30:00",
        hours: 3,
        location: "En route",
        remark: "Driving toward Denver",
      },
      {
        status: "on_duty",
        start: "2026-07-29T15:30:00",
        end: "2026-07-29T15:45:00",
        hours: 0.25,
        location: "Amarillo, TX",
        remark: "Fuel stop",
      },
      {
        status: "driving",
        start: "2026-07-29T15:45:00",
        end: "2026-07-29T18:00:00",
        hours: 2.25,
        location: "En route",
        remark: "Driving toward Denver",
      },
      {
        status: "sleeper",
        start: "2026-07-29T18:00:00",
        end: "2026-07-30T04:00:00",
        hours: 10,
        location: "Trinidad, CO",
        remark: "10-hour rest",
      },
      {
        status: "on_duty",
        start: "2026-07-30T04:00:00",
        end: "2026-07-30T04:15:00",
        hours: 0.25,
        location: "Trinidad, CO",
        remark: "Pre-trip inspection",
      },
      {
        status: "driving",
        start: "2026-07-30T04:15:00",
        end: "2026-07-30T07:30:00",
        hours: 3.25,
        location: "En route",
        remark: "Driving toward Denver",
      },
      {
        status: "on_duty",
        start: "2026-07-30T07:30:00",
        end: "2026-07-30T08:30:00",
        hours: 1,
        location: "Denver, CO",
        remark: "Drop-off / unloading",
      },
    ],
    stops: [
      { kind: "start", label: "Dallas, TX", at: "2026-07-29T06:00:00", miles_from_start: 0 },
      { kind: "pickup", label: "Dallas, TX", at: "2026-07-29T06:00:00", miles_from_start: 0 },
      {
        kind: "break",
        label: "30-minute break — Amarillo, TX",
        at: "2026-07-29T12:00:00",
        miles_from_start: 335,
      },
      {
        kind: "fuel",
        label: "Fuel stop — Amarillo, TX",
        at: "2026-07-29T15:30:00",
        miles_from_start: 500,
      },
      {
        kind: "rest",
        label: "10-hour rest — Trinidad, CO",
        at: "2026-07-29T18:00:00",
        miles_from_start: 640,
      },
      { kind: "dropoff", label: "Denver, CO", at: "2026-07-30T08:30:00", miles_from_start: 880 },
    ],
    summary: {
      total_driving_hours: 13.5,
      total_on_duty_hours: 16.25,
      total_distance_miles: 880,
      total_days: 2,
    },
  },
  daily_logs: [
    {
      date: "2026-07-29",
      rows: {
        off_duty: [
          { start_h: 0, end_h: 6, location: "", remark: "Off duty" },
          { start_h: 12, end_h: 12.5, location: "Amarillo, TX", remark: "30-minute break" },
        ],
        sleeper: [{ start_h: 18, end_h: 24, location: "Trinidad, CO", remark: "10-hour rest" }],
        driving: [
          { start_h: 7, end_h: 12, location: "En route", remark: "Driving north on I-35" },
          { start_h: 12.5, end_h: 15.5, location: "En route", remark: "Driving toward Denver" },
          { start_h: 15.75, end_h: 18, location: "En route", remark: "Driving toward Denver" },
        ],
        on_duty: [
          { start_h: 6, end_h: 7, location: "Dallas, TX", remark: "Pickup / loading" },
          { start_h: 15.5, end_h: 15.75, location: "Amarillo, TX", remark: "Fuel stop" },
        ],
      },
      totals: { off_duty: 6.5, sleeper: 6, driving: 10.25, on_duty: 1.25 },
      remarks: [
        { at_h: 6, location: "Dallas, TX", remark: "Pickup / loading" },
        { at_h: 7, location: "Dallas, TX", remark: "Begin driving" },
        { at_h: 12, location: "Amarillo, TX", remark: "30-minute break" },
        { at_h: 15.5, location: "Amarillo, TX", remark: "Fuel stop" },
        { at_h: 18, location: "Trinidad, CO", remark: "10-hour rest begins" },
      ],
      total_hours: 24,
    },
    {
      date: "2026-07-30",
      rows: {
        off_duty: [{ start_h: 8.5, end_h: 24, location: "Denver, CO", remark: "Off duty" }],
        sleeper: [{ start_h: 0, end_h: 4, location: "Trinidad, CO", remark: "10-hour rest" }],
        driving: [
          { start_h: 4.25, end_h: 7.5, location: "En route", remark: "Driving toward Denver" },
        ],
        on_duty: [
          { start_h: 4, end_h: 4.25, location: "Trinidad, CO", remark: "Pre-trip inspection" },
          { start_h: 7.5, end_h: 8.5, location: "Denver, CO", remark: "Drop-off / unloading" },
        ],
      },
      totals: { off_duty: 15.5, sleeper: 4, driving: 3.25, on_duty: 1.25 },
      remarks: [
        { at_h: 4, location: "Trinidad, CO", remark: "Pre-trip inspection" },
        { at_h: 4.25, location: "Trinidad, CO", remark: "Begin driving" },
        { at_h: 7.5, location: "Denver, CO", remark: "Drop-off / unloading" },
      ],
      total_hours: 24,
    },
  ],
};

// LA -> NYC, 5 days
function fullOff(): TripPlan["daily_logs"][number]["rows"] {
  return {
    off_duty: [{ start_h: 0, end_h: 24, location: "", remark: "Off duty" }],
    sleeper: [],
    driving: [],
    on_duty: [],
  };
}

export const laToNyc: TripPlan = {
  inputs: {
    current_location: "Los Angeles, CA",
    pickup_location: "Los Angeles, CA",
    dropoff_location: "New York, NY",
    current_cycle_used: 5,
    start_time: "2026-07-29T06:00:00",
  },
  points: {
    current: { lat: 34.05, lon: -118.24, label: "Los Angeles, CA", query: "Los Angeles, CA" },
    pickup: { lat: 34.05, lon: -118.24, label: "Los Angeles, CA", query: "Los Angeles, CA" },
    dropoff: { lat: 40.71, lon: -74.01, label: "New York, NY", query: "New York, NY" },
  },
  route: {
    distance_miles: 2790,
    duration_hours: 42,
    geometry: {
      type: "LineString",
      coordinates: [
        [-118.24, 34.05],
        [-115.17, 36.17], // Las Vegas
        [-111.89, 40.76], // Salt Lake City
        [-106.65, 41.31], // Laramie WY
        [-104.99, 39.74], // Denver
        [-100.35, 41.13], // North Platte NE
        [-95.93, 41.26], // Omaha
        [-90.2, 41.52], // Davenport IA
        [-87.63, 41.88], // Chicago
        [-84.0, 41.5], // Ohio
        [-80.0, 40.44], // Pittsburgh
        [-76.15, 40.27], // PA
        [-74.01, 40.71], // NYC
      ],
    },
  },
  hos: {
    segments: [],
    stops: [
      { kind: "start", label: "Los Angeles, CA", at: "2026-07-29T06:00:00", miles_from_start: 0 },
      { kind: "pickup", label: "Los Angeles, CA", at: "2026-07-29T06:00:00", miles_from_start: 0 },
      {
        kind: "break",
        label: "30-minute break — Barstow, CA",
        at: "2026-07-29T10:30:00",
        miles_from_start: 280,
      },
      {
        kind: "fuel",
        label: "Fuel — Las Vegas, NV",
        at: "2026-07-29T13:30:00",
        miles_from_start: 480,
      },
      {
        kind: "rest",
        label: "10-hour rest — Cedar City, UT",
        at: "2026-07-29T18:00:00",
        miles_from_start: 620,
      },
      {
        kind: "break",
        label: "30-minute break — Green River, UT",
        at: "2026-07-30T09:00:00",
        miles_from_start: 830,
      },
      {
        kind: "fuel",
        label: "Fuel — Grand Junction, CO",
        at: "2026-07-30T12:00:00",
        miles_from_start: 940,
      },
      {
        kind: "rest",
        label: "10-hour rest — Denver, CO",
        at: "2026-07-30T18:00:00",
        miles_from_start: 1210,
      },
      {
        kind: "break",
        label: "30-minute break — North Platte, NE",
        at: "2026-07-31T10:00:00",
        miles_from_start: 1450,
      },
      {
        kind: "fuel",
        label: "Fuel — Omaha, NE",
        at: "2026-07-31T13:30:00",
        miles_from_start: 1600,
      },
      {
        kind: "rest",
        label: "10-hour rest — Des Moines, IA",
        at: "2026-07-31T18:00:00",
        miles_from_start: 1790,
      },
      {
        kind: "break",
        label: "30-minute break — Chicago, IL",
        at: "2026-08-01T09:30:00",
        miles_from_start: 2000,
      },
      {
        kind: "fuel",
        label: "Fuel — Toledo, OH",
        at: "2026-08-01T14:00:00",
        miles_from_start: 2240,
      },
      {
        kind: "rest",
        label: "10-hour rest — Cleveland, OH",
        at: "2026-08-01T18:00:00",
        miles_from_start: 2370,
      },
      {
        kind: "break",
        label: "30-minute break — Harrisburg, PA",
        at: "2026-08-02T10:30:00",
        miles_from_start: 2620,
      },
      { kind: "dropoff", label: "New York, NY", at: "2026-08-02T14:00:00", miles_from_start: 2790 },
    ],
    summary: {
      total_driving_hours: 42,
      total_on_duty_hours: 48,
      total_distance_miles: 2790,
      total_days: 5,
    },
  },
  daily_logs: [
    {
      date: "2026-07-29",
      rows: {
        off_duty: [
          { start_h: 0, end_h: 6, location: "", remark: "Off duty" },
          { start_h: 10.5, end_h: 11, location: "Barstow, CA", remark: "30-minute break" },
        ],
        sleeper: [{ start_h: 18, end_h: 24, location: "Cedar City, UT", remark: "10-hour rest" }],
        driving: [
          { start_h: 7, end_h: 10.5, location: "En route", remark: "LA → Barstow" },
          { start_h: 11, end_h: 13.5, location: "En route", remark: "Barstow → Las Vegas" },
          { start_h: 13.75, end_h: 18, location: "En route", remark: "Las Vegas → Cedar City" },
        ],
        on_duty: [
          { start_h: 6, end_h: 7, location: "Los Angeles, CA", remark: "Pickup / loading" },
          { start_h: 13.5, end_h: 13.75, location: "Las Vegas, NV", remark: "Fuel stop" },
        ],
      },
      totals: { off_duty: 6.5, sleeper: 6, driving: 10.25, on_duty: 1.25 },
      remarks: [
        { at_h: 6, location: "Los Angeles, CA", remark: "Pickup / loading" },
        { at_h: 10.5, location: "Barstow, CA", remark: "30-minute break" },
        { at_h: 13.5, location: "Las Vegas, NV", remark: "Fuel stop" },
        { at_h: 18, location: "Cedar City, UT", remark: "10-hour rest begins" },
      ],
      total_hours: 24,
    },
    {
      date: "2026-07-30",
      rows: {
        off_duty: [
          { start_h: 9, end_h: 9.5, location: "Green River, UT", remark: "30-minute break" },
        ],
        sleeper: [
          { start_h: 0, end_h: 4, location: "Cedar City, UT", remark: "10-hour rest" },
          { start_h: 18, end_h: 24, location: "Denver, CO", remark: "10-hour rest" },
        ],
        driving: [
          { start_h: 4.25, end_h: 9, location: "En route", remark: "Cedar City → Green River" },
          { start_h: 9.5, end_h: 12, location: "En route", remark: "Green River → Grand Junction" },
          { start_h: 12.25, end_h: 18, location: "En route", remark: "Grand Junction → Denver" },
        ],
        on_duty: [
          { start_h: 4, end_h: 4.25, location: "Cedar City, UT", remark: "Pre-trip inspection" },
          { start_h: 12, end_h: 12.25, location: "Grand Junction, CO", remark: "Fuel stop" },
        ],
      },
      totals: { off_duty: 0.5, sleeper: 10, driving: 13, on_duty: 0.5 },
      remarks: [
        { at_h: 4, location: "Cedar City, UT", remark: "Pre-trip inspection" },
        { at_h: 9, location: "Green River, UT", remark: "30-minute break" },
        { at_h: 12, location: "Grand Junction, CO", remark: "Fuel stop" },
        { at_h: 18, location: "Denver, CO", remark: "10-hour rest begins" },
      ],
      total_hours: 24,
    },
    {
      date: "2026-07-31",
      rows: {
        off_duty: [
          { start_h: 10, end_h: 10.5, location: "North Platte, NE", remark: "30-minute break" },
        ],
        sleeper: [
          { start_h: 0, end_h: 4, location: "Denver, CO", remark: "10-hour rest" },
          { start_h: 18, end_h: 24, location: "Des Moines, IA", remark: "10-hour rest" },
        ],
        driving: [
          { start_h: 4.25, end_h: 10, location: "En route", remark: "Denver → North Platte" },
          { start_h: 10.5, end_h: 13.5, location: "En route", remark: "North Platte → Omaha" },
          { start_h: 13.75, end_h: 18, location: "En route", remark: "Omaha → Des Moines" },
        ],
        on_duty: [
          { start_h: 4, end_h: 4.25, location: "Denver, CO", remark: "Pre-trip inspection" },
          { start_h: 13.5, end_h: 13.75, location: "Omaha, NE", remark: "Fuel stop" },
        ],
      },
      totals: { off_duty: 0.5, sleeper: 10, driving: 13, on_duty: 0.5 },
      remarks: [
        { at_h: 4, location: "Denver, CO", remark: "Pre-trip inspection" },
        { at_h: 10, location: "North Platte, NE", remark: "30-minute break" },
        { at_h: 13.5, location: "Omaha, NE", remark: "Fuel stop" },
        { at_h: 18, location: "Des Moines, IA", remark: "10-hour rest begins" },
      ],
      total_hours: 24,
    },
    {
      date: "2026-08-01",
      rows: {
        off_duty: [{ start_h: 9.5, end_h: 10, location: "Chicago, IL", remark: "30-minute break" }],
        sleeper: [
          { start_h: 0, end_h: 4, location: "Des Moines, IA", remark: "10-hour rest" },
          { start_h: 18, end_h: 24, location: "Cleveland, OH", remark: "10-hour rest" },
        ],
        driving: [
          { start_h: 4.25, end_h: 9.5, location: "En route", remark: "Des Moines → Chicago" },
          { start_h: 10, end_h: 14, location: "En route", remark: "Chicago → Toledo" },
          { start_h: 14.25, end_h: 18, location: "En route", remark: "Toledo → Cleveland" },
        ],
        on_duty: [
          { start_h: 4, end_h: 4.25, location: "Des Moines, IA", remark: "Pre-trip inspection" },
          { start_h: 14, end_h: 14.25, location: "Toledo, OH", remark: "Fuel stop" },
        ],
      },
      totals: { off_duty: 0.5, sleeper: 10, driving: 13, on_duty: 0.5 },
      remarks: [
        { at_h: 4, location: "Des Moines, IA", remark: "Pre-trip inspection" },
        { at_h: 9.5, location: "Chicago, IL", remark: "30-minute break" },
        { at_h: 14, location: "Toledo, OH", remark: "Fuel stop" },
        { at_h: 18, location: "Cleveland, OH", remark: "10-hour rest begins" },
      ],
      total_hours: 24,
    },
    {
      date: "2026-08-02",
      rows: {
        off_duty: [
          { start_h: 10.5, end_h: 11, location: "Harrisburg, PA", remark: "30-minute break" },
          { start_h: 15, end_h: 24, location: "New York, NY", remark: "Off duty" },
        ],
        sleeper: [{ start_h: 0, end_h: 4, location: "Cleveland, OH", remark: "10-hour rest" }],
        driving: [
          { start_h: 4.25, end_h: 10.5, location: "En route", remark: "Cleveland → Harrisburg" },
          { start_h: 11, end_h: 14, location: "En route", remark: "Harrisburg → New York" },
        ],
        on_duty: [
          { start_h: 4, end_h: 4.25, location: "Cleveland, OH", remark: "Pre-trip inspection" },
          { start_h: 14, end_h: 15, location: "New York, NY", remark: "Drop-off / unloading" },
        ],
      },
      totals: { off_duty: 9.5, sleeper: 4, driving: 9.25, on_duty: 1.25 },
      remarks: [
        { at_h: 4, location: "Cleveland, OH", remark: "Pre-trip inspection" },
        { at_h: 10.5, location: "Harrisburg, PA", remark: "30-minute break" },
        { at_h: 14, location: "New York, NY", remark: "Drop-off / unloading" },
      ],
      total_hours: 24,
    },
  ],
};

export const mockTrips = {
  chicagoDetroit,
  dallasDenver,
  laToNyc,
};

// Silence unused warning during dev
void fullOff;
