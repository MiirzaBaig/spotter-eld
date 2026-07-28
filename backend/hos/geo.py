"""
Geocoding + routing using free, no-key services.

    * Geocoding: OpenStreetMap Nominatim (requires a descriptive User-Agent)
    * Routing:   OSRM public demo server (driving profile)

Both are best-effort. If a network call fails, callers get a clear error so
the API can respond gracefully. Distances are converted to miles and
durations to hours for the HOS simulator.
"""

from __future__ import annotations

import time

import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
# Public OSRM demo + a community mirror as a fallback if the first is busy.
OSRM_URLS = [
    "https://router.project-osrm.org/route/v1/driving",
    "https://routing.openstreetmap.de/routed-car/route/v1/driving",
]
USER_AGENT = "spotter-eld-planner/1.0 (assessment project)"

METERS_PER_MILE = 1609.344
TIMEOUT = 20
RETRIES = 3


class GeoError(Exception):
    """Raised when a location cannot be resolved or routed."""


def _get(url: str, **kwargs) -> requests.Response:
    """GET with a small retry/backoff to ride out free-tier rate limits."""
    last_exc = None
    for attempt in range(RETRIES):
        try:
            resp = requests.get(
                url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT, **kwargs
            )
            if resp.status_code in (429, 502, 503, 504):
                last_exc = requests.HTTPError(f"{resp.status_code} from {url}")
                time.sleep(0.6 * (attempt + 1))
                continue
            resp.raise_for_status()
            return resp
        except requests.RequestException as exc:
            last_exc = exc
            time.sleep(0.6 * (attempt + 1))
    raise last_exc if last_exc else requests.RequestException("request failed")


def geocode(query: str) -> dict:
    """Resolve a free-text place to {lat, lon, label}."""
    resp = _get(
        NOMINATIM_URL,
        params={"q": query, "format": "json", "limit": 1, "countrycodes": "us,ca,mx"},
    )
    data = resp.json()
    if not data:
        # Retry once without the country filter for international places.
        resp = _get(NOMINATIM_URL, params={"q": query, "format": "json", "limit": 1})
        data = resp.json()
    if not data:
        raise GeoError(
            f"Couldn't find “{query}”. Try a fuller name, e.g. “City, State”."
        )
    top = data[0]
    return {
        "lat": float(top["lat"]),
        "lon": float(top["lon"]),
        "label": top.get("display_name", query),
        "query": query,
    }


def route(points: list[dict]) -> dict:
    """
    Route through an ordered list of {lat, lon} points.

    Returns {distance_miles, duration_hours, geometry} where geometry is a
    GeoJSON LineString (list of [lon, lat] coords) for drawing on the map.
    """
    if len(points) < 2:
        raise GeoError("Need at least two points to build a route.")

    coord_str = ";".join(f"{p['lon']},{p['lat']}" for p in points)
    last_err = None
    for base in OSRM_URLS:
        try:
            resp = _get(
                f"{base}/{coord_str}",
                params={"overview": "full", "geometries": "geojson"},
            )
            data = resp.json()
            if data.get("code") == "Ok" and data.get("routes"):
                r = data["routes"][0]
                return {
                    "distance_miles": r["distance"] / METERS_PER_MILE,
                    "duration_hours": r["duration"] / 3600.0,
                    "geometry": r["geometry"],  # GeoJSON LineString
                }
            last_err = GeoError("No drivable route between those locations.")
        except requests.RequestException as exc:
            last_err = exc
    raise last_err if last_err else GeoError("Routing failed.")


def plan_geo(current: str, pickup: str, dropoff: str) -> dict:
    """
    Geocode the three inputs and build a route
    current -> pickup -> dropoff. The loaded leg (pickup -> dropoff) drives
    the HOS math; the deadhead current -> pickup is included in the map
    geometry and reported separately.
    """
    c = geocode(current)
    p = geocode(pickup)
    d = geocode(dropoff)

    full = route([c, p, d])
    loaded = route([p, d])

    return {
        "points": {"current": c, "pickup": p, "dropoff": d},
        "route": full,             # for map drawing (whole journey)
        "loaded": loaded,          # for HOS (pickup -> dropoff)
    }
