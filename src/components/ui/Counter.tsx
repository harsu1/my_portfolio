"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { useHydrated } from "@/lib/useHydrated";

/**
 * Counts up once when scrolled into view.
 *
 * Driven by requestAnimationFrame so it stays in step with the compositor.
 *
 * The displayed number is *derived*, never synced through an effect, and is
 * gated on `useHydrated()` — the reduced-motion preference is a client-only
 * media query, so reading it during the hydration render would produce text
 * that disagrees with the server-rendered HTML.
 *
 * `aria-label` carries the final value, so assistive tech announces "3" rather
 * than narrating every intermediate frame.
 */
export default function Counter({
  value,
  suffix = "",
  duration = 1100,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const [animated, setAnimated] = useState(0);

  const display = !hydrated ? 0 : reduceMotion ? value : animated;

  useEffect(() => {
    if (!inView || reduceMotion) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic: fast arrival, soft settle.
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimated(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, value, duration]);

  return (
    <span ref={ref} aria-label={`${value}${suffix}`}>
      <span aria-hidden="true">
        {display}
        {suffix}
      </span>
    </span>
  );
}
