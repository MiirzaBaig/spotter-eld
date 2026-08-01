# How to try it — plain-English walkthrough

This explains, in simple steps, what each part of the app does and how to
verify it works.

---

## 1. Start the two servers

Open **two terminals**.

**Terminal A — backend (the brain):**
```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py runserver 127.0.0.1:8009
```
This is the Django API. It geocodes your locations, finds the driving route,
runs the Hours-of-Service math, and builds the log data.

**Terminal B — frontend (what you see):**
```bash
cd frontend
npm install
npm run dev
```
Open the printed URL (usually <http://localhost:8080>).

---

## 2. What to click

On the page you'll see a form with four inputs. The fastest way to try it is
the **example chips** under the button:

- **Chicago → Detroit** — a short, single-day trip (no fuel/rest needed).
- **Dallas → Denver** — a medium trip, starts with 22 cycle hours used.
- **LA → NYC (multi-day)** — a long trip that spans ~5 days with fuel stops,
  30-minute breaks, and 10-hour rests.

Click a chip, then **"Plan my trip →"**. Results appear below and the page
scrolls to them.

---

## 3. What you're looking at

**Stat row** — distance, driving hours, on-duty hours, and how many daily log
sheets the trip needs.

**Route & stops (map)** — the blue line is your driving route on
OpenStreetMap. The pins are:
- 📍 current · 📦 pickup · 🏁 drop-off
- ⛽ fuel (every ≤1,000 mi) · ☕ 30-min break · 🛏️ 10-hour rest

The right-hand **Trip timeline** lists every stop in order with its time and
mileage.

**ELD daily log sheets** — one card per day. Each shows the 24-hour grid with a
line that sits in the current duty status (Off Duty / Sleeper / Driving / On
Duty) and jumps at each change — exactly like a hand-filled paper log. Below
each grid are the per-status totals (they always sum to 24h) and the day's
remarks. The **↓ PNG** button downloads that single sheet as an image.

**Download report (PDF).** The **Download report** button (in the green
compliance strip above the logs) exports the whole trip as a multi-page PDF —
a cover page with the summary, a route sketch, and the stops table, then one
page per day with the full FMCSA log grid and remarks. This is the document a
dispatcher would actually file.

---

## 4. How to check it's accurate

- **Totals add to 24h.** Every log sheet's four status totals sum to 24.
- **Break rule.** On any day with more than 8 hours of driving, you'll see a
  "30-minute break" remark.
- **11-hour rule.** No single day shows more than 11 hours of driving before a
  10-hour rest appears.
- **Fuel spacing.** On the LA→NYC trip, fuel stops land at ~1,000 and ~2,000
  miles — never more than 1,000 miles apart.
- **Cycle seeding.** Enter a high "current cycle used" (e.g. 68) on a long trip
  and you'll see a "34-hour restart" remark once the 70-hour cycle is hit.

You can also hit the API directly to see the raw numbers:
```bash
curl -s -X POST http://127.0.0.1:8009/api/plan-trip \
  -H "Content-Type: application/json" \
  -d '{"current_location":"Los Angeles, CA","pickup_location":"Los Angeles, CA","dropoff_location":"New York, NY","current_cycle_used":0}' | python3 -m json.tool | head -40
```

---

## 5. Run the automated tests (optional but reassuring)

```bash
cd backend && python -m pytest -q
```
All tests should pass. They lock in the rules above.

---

## 6. Troubleshooting

- **"Map/routing service temporarily unavailable"** — the free OSRM/Nominatim
  demo servers occasionally rate-limit. Wait a few seconds and retry.
- **Map tiles blank** — check your internet; tiles load from OpenStreetMap.
- **Frontend can't reach backend** — make sure Terminal A is running on port
  8009, or set `VITE_API_URL` in `frontend/.env`.
