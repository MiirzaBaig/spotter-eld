# Deployment guide — Render (backend) + Vercel (frontend)

You deploy the two halves separately, then connect them with two environment
variables. Do the **backend first** so you have its URL for the frontend.

---

## Part 1 — Backend on Render

1. Push this repo to GitHub (see bottom of this file for the git commands).
2. Go to <https://render.com> → **New +** → **Web Service** → connect your repo.
3. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:**
     `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command:** `gunicorn config.wsgi:application`
4. Add environment variables (Render → your service → **Environment**):
   - `SECRET_KEY` → any long random string
   - `DEBUG` → `False`
   - `FRONTEND_URL` → *leave blank for now; fill in after Part 2*
5. Click **Create Web Service**. When it's live, copy the URL, e.g.
   `https://spotter-eld-api.onrender.com`.
6. Verify: open `https://<your-render-url>/api/health` — you should see
   `{"status": "ok"}`.

> There is also a `backend/render.yaml` blueprint if you prefer
> **New + → Blueprint** — it fills in the settings above automatically.

> **Note:** Render's free tier sleeps after inactivity, so the *first*
> request after idle takes ~30–50s to wake. Upgrade to the cheapest paid tier
> to avoid the cold start.

---

## Part 2 — Frontend on Vercel

The frontend is a **TanStack Start** app (React + Vite + Tailwind). It builds
to a server output via Nitro, so we point Nitro at Vercel with one env var.

1. Go to <https://vercel.com> → **Add New** → **Project** → import the same repo.
2. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** **Other** (do not pick Vite — let Nitro drive it)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** leave **empty** (Nitro writes `.vercel/output`
     automatically — Vercel picks it up via the Build Output API)
   - **Install Command:** `npm install` (default)
3. Add environment variables (Project → Settings → Environment Variables):
   - `NITRO_PRESET` → `vercel`  ← **required**, this makes the build target Vercel
   - `VITE_API_URL` → your Render URL from Part 1
     (e.g. `https://spotter-eld-api.onrender.com`, **no trailing slash**)
4. Click **Deploy**. Copy the resulting URL, e.g.
   `https://spotter-eld.vercel.app`.

> If Vercel errors about the output directory, confirm `NITRO_PRESET=vercel` is
> set — without it, Nitro defaults to a Cloudflare build that Vercel can't serve.
> You can verify the same build locally with:
> `cd frontend && NITRO_PRESET=vercel npm run build` (produces `.vercel/output/`).

---

## Part 3 — Connect them (CORS)

1. Back in Render → your service → **Environment**, set:
   - `FRONTEND_URL` → your Vercel URL (e.g. `https://spotter-eld.vercel.app`)
2. Save — Render redeploys automatically.
3. Open your Vercel URL and plan a trip. Done. 🎉

If you later add a custom domain, add it to `FRONTEND_URL` as a
comma-separated list.

---

## Pushing to GitHub

```bash
cd spotter
git init
git add .
git commit -m "Spotter ELD trip planner"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

`.gitignore` already excludes `.venv/`, `node_modules/`, `.env`, and build
output.
