<div align="center">

<img src=".github/banner.svg" alt="spotter eld" width="100%" />

# spotter eld

**plan a truck trip → get a live route + auto-drawn fmcsa daily logs.**

enter where you are, your pickup, your drop-off, and how many cycle hours you've
used. spotter maps the whole route with fuel/break/rest stops and draws every
daily log sheet — computed against the federal 70-hour / 8-day hours-of-service
rules.

[![live](https://img.shields.io/badge/live-spotter--eld.vercel.app-e8873a?style=flat-square)](https://spotter-eld-flax.vercel.app)
[![django](https://img.shields.io/badge/django-5.1-092e20?style=flat-square&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![react](https://img.shields.io/badge/react-19-149eca?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![tests](https://img.shields.io/badge/tests-13%20passing-1f9d6b?style=flat-square)](#tests)
[![license](https://img.shields.io/badge/license-MIT-8a94a6?style=flat-square)](LICENSE)

**[▶ live app](https://spotter-eld-flax.vercel.app)** · [api health](https://spotter-eld-api-two.vercel.app/api/health)

</div>

---

## what it does

you give it a trip. it gives you two things back:

- **a route map** — the full drive on openstreetmap, with color-coded pins for
  pickup, drop-off, fuel stops, 30-min breaks, and 10-hour rests.
- **eld daily log sheets** — the classic 24-hour grid (off duty / sleeper /
  driving / on duty) drawn stroke-by-stroke, with remarks + totals. long trips
  just make more sheets.

plus a one-click **pdf trip report** (cover + route + every log), a
**split-sleeper-berth** toggle, and a **compliance ribbon** with a live cycle
gauge. dark & light. fully responsive.

---

## the stack

| layer | tech |
| --- | --- |
| frontend | tanstack start (react 19 + vite) · tailwind · shadcn/ui · leaflet · framer-motion |
| backend | django + drf (stateless, no database) |
| maps | openstreetmap tiles · nominatim geocoding · osrm routing — **all free, no api keys** |
| hosting | vercel (frontend static/ssr + backend as a python serverless function) |

---

## the interesting part: the hos engine

the real work is `backend/hos/simulator.py` — a pure-python state machine that
walks the trip forward and enforces the fmcsa property-carrier rules:

| rule | value |
| --- | --- |
| driving limit | 11 hours per shift |
| driving window | 14 hours from going on duty |
| break | 30 min after 8 cumulative driving hours |
| daily reset | 10 hours off-duty restarts the 11h & 14h clocks |
| cycle | 70 on-duty hours / rolling 8 days (seeded from *cycle used*) |
| restart | 34 hours off-duty resets the cycle |
| fuel | on-duty stop at least every 1,000 miles |
| pickup / drop-off | 1 hour on duty each |
| split sleeper | optional 8/2 pairing under §395.1(g) |

it's covered by **13 unit tests** — single-day trips, the 8-hour break, the
11-hour limit, fuel spacing, multi-day cross-country routes, and cycle-seeded
34-hour restarts.

---

## run it locally

**backend** (python 3.11+)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py runserver 127.0.0.1:8009
```

**frontend** (node 18+) — second terminal

```bash
cd frontend
npm install
npm run dev          # http://localhost:8080
```

the frontend hits `http://127.0.0.1:8009` by default — override with
`VITE_API_URL` (see `frontend/.env.example`).

---

## api

`POST /api/plan-trip`

```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Chicago, IL",
  "dropoff_location": "Detroit, MI",
  "current_cycle_used": 10,
  "use_split_sleeper": false
}
```

returns geocoded points, route geometry (geojson), the hos timeline
(`segments` · `stops` · `summary`), and `daily_logs` (one per calendar day).

---

## tests

```bash
cd backend && python -m pytest -q
```

---

## project layout

```
spotter/
├── backend/                django + drf api
│   ├── hos/                simulator.py · logsheets.py · geo.py   ← the core
│   ├── api/                plan-trip view + serializers
│   └── tests/              pytest suite for the hos engine
└── frontend/               tanstack start (react + vite + tailwind)
    └── src/
        ├── routes/index.tsx     page shell · form · results
        ├── lib/                 api client · types · pdf export
        └── components/spotter/  tripform · routemap · logsheet · …
```

more: **[DEPLOY.md](DEPLOY.md)** (hosting) · **[HOW_TO_TRY.md](HOW_TO_TRY.md)** (guided walkthrough).

<div align="center">
<sub>built by <a href="https://github.com/MiirzaBaig">mirza baig</a></sub>
</div>
