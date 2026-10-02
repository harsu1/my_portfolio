"use client";

import type { ReactNode } from "react";
import * as m from "motion/react-m";

/**
 * Scroll-triggered entrance, animated once on first intersection.
 *
 * Deliberately does *not* branch its output on `useReducedMotion`: that would
 * make the server and client render different trees. The global
 * `MotionConfig reducedMotion="user"` handles the preference instead, skipping
 * the transform while still fading in.
 *
 * `data-reveal` exists so the no-JS stylesheet in the root layout can force
 * these elements visible — content must never be reachable only via an
 * animation that might not run.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 16,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const MotionTag = m[as];

  return (
    <MotionTag
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}
