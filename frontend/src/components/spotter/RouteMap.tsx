import { useEffect, useRef, useState } from "react";
import type { TripPlan, StopKind } from "@/lib/tripTypes";

const kindMeta: Record<StopKind, { color: string; emoji: string; ring?: boolean }> = {
  start: { color: "var(--color-duty-off)", emoji: "📍", ring: true },
  current: { color: "var(--color-duty-off)", emoji: "📍", ring: true },
  pickup: { color: "var(--color-duty-driving)", emoji: "📦", ring: true },
  dropoff: { color: "var(--color-accent)", emoji: "🏁", ring: true },
  fuel: { color: "var(--color-stop-fuel)", emoji: "⛽" },
  break: { color: "var(--color-duty-sleeper)", emoji: "☕" },
  rest: { color: "var(--color-stop-rest)", emoji: "🛏️" },
};

function readVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#2f6fed";
}

// Free, no-key minimal basemaps from CARTO. Muted styling that lets the route
// and markers read clearly — the light "Positron" and dark "Dark Matter".
const TILES = {
  light: "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
};

interface Props {
  trip: TripPlan;
  activeStop?: number | null;
  focusStop?: { i: number; nonce: number } | null;
  onHoverStop?: (index: number | null) => void;
}

// Minimal shapes we use off the dynamically-imported Leaflet objects.
type LMarker = {
  openPopup: () => void;
  getLatLng: () => { lat: number; lng: number };
};
type LMap = { flyTo: (latlng: [number, number], zoom: number, opts?: object) => void };

export function RouteMap({ trip, activeStop = null, focusStop = null, onHoverStop }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const markerElsRef = useRef<HTMLElement[]>([]);
  const markersRef = useRef<LMarker[]>([]);
  const mapRef = useRef<LMap | null>(null);
  const hoverRef = useRef(onHoverStop);
  hoverRef.current = onHoverStop;

  // Track the active theme so tiles + colors follow it.
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark")),
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;

      const routeColor = readVar("--route") || "#2f6fed";
      const coords: [number, number][] = trip.route.geometry.coordinates.map(([lon, lat]) => [
        lat,
        lon,
      ]);

      const map = L.map(ref.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
        zoomAnimation: true,
        fadeAnimation: true,
      });
      mapRef.current = map as unknown as LMap;
      const markers: LMarker[] = [];

      L.tileLayer(isDark ? TILES.dark : TILES.light, {
        maxZoom: 19,
        detectRetina: true,
        subdomains: "abcd",
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      }).addTo(map);

      // Route: a soft wide glow, a mid halo, then the crisp line on top.
      L.polyline(coords, {
        color: routeColor,
        weight: 12,
        opacity: 0.12,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(map);
      L.polyline(coords, {
        color: routeColor,
        weight: 6,
        opacity: 0.25,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(map);
      const line = L.polyline(coords, {
        color: routeColor,
        weight: 3.5,
        opacity: 1,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(map);

      // Animate the route drawing itself in.
      const path = (line as unknown as { _path?: SVGPathElement })._path;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (path && !reduce) {
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;
        path.style.transition = "stroke-dashoffset 1400ms cubic-bezier(0.22,1,0.36,1)";
        requestAnimationFrame(() => {
          path.style.strokeDashoffset = "0";
        });
      }

      const els: HTMLElement[] = [];

      trip.hos.stops.forEach((stop, i) => {
        const meta = kindMeta[stop.kind] ?? kindMeta.start;
        const t = Math.min(1, Math.max(0, stop.miles_from_start / trip.route.distance_miles));
        const idx = Math.min(coords.length - 1, Math.max(0, Math.round(t * (coords.length - 1))));
        const [lat, lon] = coords[idx];

        // Endpoints get a soft pulsing ring; intermediate stops are compact dots.
        const ring = meta.ring
          ? `<span class="spotter-pulse" style="background:${meta.color}"></span>`
          : "";
        const size = meta.ring ? 26 : 22;

        const icon = L.divIcon({
          className: "spotter-pin",
          html: `<div class="spotter-pin-inner" style="
              position:relative;width:${size}px;height:${size}px;
              transform:translate(-${size / 2}px,-${size / 2}px);
              transition:transform 220ms cubic-bezier(0.34,1.56,0.5,1), filter 220ms ease;
              transform-origin:${size / 2}px ${size / 2}px;">
            ${ring}
            <span class="spotter-dot" style="
                position:absolute;inset:0;border-radius:50%;
                background:${meta.color};
                box-shadow:0 0 0 3px color-mix(in oklab, ${meta.color} 22%, transparent),
                           0 4px 12px -3px rgba(0,0,0,0.55);
                display:grid;place-items:center;font-size:11px;line-height:1;">
              ${meta.emoji}
            </span>
          </div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([lat, lon], { icon, riseOnHover: true })
          .addTo(map)
          .bindPopup(
            `<div class="spotter-pop">
               <b>${stop.label}</b>
               <span>${stop.miles_from_start.toFixed(0)} mi from start</span>
             </div>`,
            { closeButton: false, offset: [0, -6] },
          );
        markers[i] = marker as unknown as LMarker;

        const el = marker.getElement() as HTMLElement | undefined;
        if (el) {
          els[i] = el;
          el.addEventListener("mouseenter", () => hoverRef.current?.(i));
          el.addEventListener("mouseleave", () => hoverRef.current?.(null));
          if (!reduce) {
            const inner = el.querySelector<HTMLElement>(".spotter-pin-inner");
            if (inner) {
              inner.style.opacity = "0";
              inner.style.transform += " scale(0.3)";
              inner.style.transition =
                "opacity 260ms ease, transform 500ms cubic-bezier(0.34,1.56,0.5,1)";
              window.setTimeout(
                () => {
                  inner.style.opacity = "1";
                  inner.style.transform = inner.style.transform.replace(" scale(0.3)", "");
                },
                500 + i * 80,
              );
            }
          }
        }
      });

      markerElsRef.current = els;
      markersRef.current = markers;
      map.fitBounds(L.latLngBounds(coords), { padding: [44, 44] });

      cleanup = () => {
        markerElsRef.current = [];
        markersRef.current = [];
        mapRef.current = null;
        map.remove();
      };
    })();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [trip, isDark]);

  useEffect(() => {
    markerElsRef.current.forEach((el, i) => {
      if (!el) return;
      const inner = el.querySelector<HTMLElement>(".spotter-pin-inner");
      if (!inner) return;
      const active = activeStop === i;
      const base = inner.style.transform.replace(/ scale\([^)]*\)/g, "");
      inner.style.transform = `${base} scale(${active ? 1.4 : 1})`;
      inner.style.filter = active ? "drop-shadow(0 6px 14px rgba(0,0,0,0.5))" : "none";
      el.style.zIndex = active ? "1000" : "";
    });
  }, [activeStop]);

  // Clicking a timeline row flies the map to that stop and opens its popup.
  useEffect(() => {
    if (focusStop == null) return;
    const marker = markersRef.current[focusStop.i];
    const map = mapRef.current;
    if (!marker || !map) return;
    const { lat, lng } = marker.getLatLng();
    map.flyTo([lat, lng], 7, { duration: 0.8 });
    window.setTimeout(() => marker.openPopup(), 400);
  }, [focusStop]);

  return (
    <div className="spotter-map-frame relative h-[430px] w-full overflow-hidden rounded-xl border border-border shadow-e1">
      <div ref={ref} role="img" aria-label="Route map" className="h-full w-full" />
      {/* Subtle inner vignette so the map edges blend into the panel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          boxShadow: "inset 0 0 0 1px var(--border), inset 0 -40px 60px -50px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );
}
