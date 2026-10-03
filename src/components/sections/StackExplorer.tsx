"use client";

import { useState } from "react";
import * as m from "motion/react-m";
import { AnimatePresence, useReducedMotion } from "motion/react";
import TechIcon from "@/components/ui/TechIcon";
import type { StackGroup } from "@/lib/profile";

/**
 * Interactive stack breakdown.
 *
 * Brand marks make the list scannable, but they are deliberately the quietest
 * part of each chip: monochrome, small, and subordinate to the name. The
 * substance is the note that appears on selection — what the technology is
 * actually used for — plus an honest production/toolkit marker, so the section
 * never implies uniform depth across forty logos.
 *
 * Hover previews and click pins, which keeps it usable on touch (where there is
 * no hover) and on keyboard (where focus drives the same preview).
 */
export default function StackExplorer({ groups }: { groups: StackGroup[] }) {
  return (
    <>
      {/* The legend shows the two chip treatments themselves rather than
          abstract swatches, so the distinction is readable at a glance. */}
      <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-line py-4">
        <span className="eyebrow">Legend</span>
        <span className="flex items-center gap-2 text-xs text-ink-muted">
          <span
            aria-hidden="true"
            className="rounded-full border border-solid border-line-strong bg-raised px-2 py-0.5 font-mono text-[10px]"
          >
            solid
          </span>
          Used in production work
        </span>
        <span className="flex items-center gap-2 text-xs text-ink-muted">
          <span
            aria-hidden="true"
            className="rounded-full border border-dashed border-line-strong bg-raised px-2 py-0.5 font-mono text-[10px]"
          >
            dashed
          </span>
          Working toolkit — not a production claim
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </>
  );
}

function GroupCard({ group }: { group: StackGroup }) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const activeName = hovered ?? pinned;
  const active = group.items.find((item) => item.name === activeName) ?? null;

  return (
    <div
      className="lit-edge flex flex-col rounded-2xl border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-strong"
      onMouseLeave={() => setHovered(null)}
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-violet">{group.index}</span>
        <h3 className="text-lg font-medium tracking-tight text-ink">
          {group.title}
        </h3>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {group.items.map((item) => {
          const isActive = activeName === item.name;
          const isProd = item.maturity === "production";

          return (
            <button
              key={item.name}
              type="button"
              aria-pressed={pinned === item.name}
              onMouseEnter={() => setHovered(item.name)}
              onFocus={() => setHovered(item.name)}
              onBlur={() => setHovered(null)}
              onClick={() =>
                setPinned((prev) => (prev === item.name ? null : item.name))
              }
              className={[
                "inline-flex items-center gap-2 rounded-full py-1.5 pr-3 pl-2.5 text-[13px]",
                "border transition-all duration-200 motion-safe:hover:-translate-y-px",
                isProd ? "border-solid" : "border-dashed",
                isActive
                  ? "border-violet/60 bg-violet/10 text-ink"
                  : "border-line-strong bg-raised text-ink-muted hover:border-ink-faint hover:text-ink",
              ].join(" ")}
            >
              <TechIcon
                name={item.name}
                size={13}
                className={`shrink-0 transition-colors ${
                  isActive ? "text-violet-soft" : "text-ink-faint"
                }`}
              />
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Fixed-height well so swapping the description never reflows the grid. */}
      <div
        className="mt-5 flex min-h-[78px] items-start border-t border-line pt-4"
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.p
            key={active?.name ?? "premise"}
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm leading-relaxed text-pretty"
          >
            {active ? (
              <>
                <span className="font-mono text-xs text-ink">
                  {active.name}
                </span>
                {active.maturity === "toolkit" && (
                  <span className="ml-2 font-mono text-[10px] tracking-wider text-ink-faint uppercase">
                    toolkit
                  </span>
                )}
                <span className="mt-1.5 block text-ink-muted">{active.note}</span>
              </>
            ) : (
              <span className="text-ink-faint">{group.premise}</span>
            )}
          </m.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
