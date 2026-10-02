"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig } from "motion/react";

/**
 * Two global animation policies, applied once.
 *
 * 1. `LazyMotion` — every component uses the lightweight `m` components rather
 *    than the `motion` proxy, which pulls in the whole feature set eagerly.
 *    Features are instead code-split and fetched after first paint, so the
 *    animation engine never sits on the critical path. `domMax` is required
 *    because the nav indicator uses a shared-layout animation.
 *
 * 2. `reducedMotion="user"` — Motion reads the OS preference itself and skips
 *    transform and layout animations while still allowing opacity, which is
 *    what the accessibility guidance actually asks for rather than freezing
 *    the interface outright.
 *
 *    Handling it here also removes a class of hydration bugs: components no
 *    longer branch their *rendered output* on a client-only media query, so the
 *    server and client trees stay identical and only behaviour differs.
 *
 * This is a Client Component, but `children` arrive as a prop, so everything
 * inside remains a Server Component.
 */
const loadFeatures = () =>
  import("motion/react").then((mod) => mod.domMax);

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
