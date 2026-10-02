"use client";

import { useState } from "react";
import * as m from "motion/react-m";
import { AnimatePresence, useReducedMotion } from "motion/react";
import type { EvolutionStage } from "@/lib/profile";

/**
 * The technical arc, as distinct from the employment history: what changed
 * about how the work gets built, year over year.
 *
 * Implemented as a tablist so arrow keys move between stages the way a
 * keyboard user expects, rather than requiring a Tab press per stage.
 */
export default function EvolutionTrack({
  stages,
}: {
  stages: EvolutionStage[];
}) {
  const reduceMotion = useReducedMotion();
  // Opens on the current focus — the most relevant stage, not the oldest.
  const [active, setActive] = useState(stages.length - 1);

  const move = (event: React.KeyboardEvent, index: number) => {
    const last = stages.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;

    if (next === null) return;
    event.preventDefault();
    setActive(next);
    document.getElementById(`evolution-tab-${next}`)?.focus();
  };

  return (
    <div className="lit-edge rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <p className="eyebrow">The arc</p>
      <h3 className="mt-3 text-xl font-medium tracking-tight text-ink">
        How the work changed
      </h3>

      <div
        role="tablist"
        aria-label="Engineering evolution by year"
        aria-orientation="horizontal"
        className="mt-7 flex flex-col gap-1 md:flex-row md:items-stretch md:gap-0"
      >
        {stages.map((stage, index) => {
          const isActive = index === active;
          return (
            <button
              key={`${stage.year}-${stage.label}`}
              id={`evolution-tab-${index}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`evolution-panel-${index}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => move(event, index)}
              className={[
                "group relative flex-1 border-line px-3 py-3 text-left transition-colors duration-200",
                "border-l-2 md:border-l-0 md:border-t-2 md:px-4",
                isActive
                  ? "border-violet"
                  : "hover:border-ink-faint border-line-strong",
              ].join(" ")}
            >
              <span
                className={`block font-mono text-xs transition-colors ${
                  isActive ? "text-violet" : "text-ink-faint"
                }`}
              >
                {stage.year}
              </span>
              <span
                className={`mt-1.5 block text-[13px] leading-snug transition-colors ${
                  isActive ? "text-ink" : "text-ink-muted group-hover:text-ink"
                }`}
              >
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 min-h-[84px] border-t border-line pt-6">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={active}
            id={`evolution-panel-${active}`}
            role="tabpanel"
            aria-labelledby={`evolution-tab-${active}`}
            tabIndex={0}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="max-w-3xl text-base leading-relaxed text-ink-muted text-pretty">
              {stages[active].detail}
            </p>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
