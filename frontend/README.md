# Spotter ELD — Frontend

The web client for Spotter ELD: a trip planner and electronic-logging-device
(ELD) log generator for commercial truck drivers. It shows the driving route on
a map with required stops, and draws FMCSA "Driver's Daily Log" sheets on the
classic 24-hour duty grid.

## Stack

- **TanStack Start** (React + Vite) with SSR
- **TypeScript**
- **Tailwind CSS** + shadcn/ui components
- **Leaflet** + OpenStreetMap for the route map

## Develop

Requires Node.js 18+ and npm.

```sh
npm install
npm run dev          # http://localhost:8080
```

The client talks to the Django API. Set the backend URL with `VITE_API_URL`
(see `.env.example`); it defaults to `http://127.0.0.1:8009`.

## Build

```sh
npm run build        # produces the server output via Nitro
```

For Vercel, set `NITRO_PRESET=vercel` so the build emits `.vercel/output/`.
See the repository root `DEPLOY.md` for full deployment steps.

## Structure

```
src/
├── routes/index.tsx        page shell, form, results
├── lib/api.ts              backend client (planTrip)
├── lib/tripTypes.ts        types matching the API response
├── lib/mockData.ts         sample trips for the example buttons
└── components/spotter/      TripForm · RouteMap · LogSheet · TripTimeline · …
```
