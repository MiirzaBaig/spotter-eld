import { useEffect, useRef, useState } from "react";

/**
 * Purely presentational count-up. It never alters the value it is given —
 * it only animates the display from 0 to that exact value and lands on it.
 */
export function CountUp({ value, duration = 800 }: { value: string; duration?: number }) {
  const target = Number(value);
  const numeric = Number.isFinite(target);
  const decimals = value.includes(".") ? value.split(".")[1].length : 0;
  const [display, setDisplay] = useState(numeric ? "0" : value);
  const raf = useRef(0);

  useEffect(() => {
    if (!numeric) {
      setDisplay(value);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(t < 1 ? (target * eased).toFixed(decimals) : value);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, target, numeric, decimals, duration]);

  return <>{display}</>;
}
