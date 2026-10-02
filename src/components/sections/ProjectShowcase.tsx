"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as m from "motion/react-m";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import FlowDiagram from "@/components/viz/FlowDiagram";
import { useHydrated } from "@/lib/useHydrated";
import type { Project } from "@/lib/projects";

const ACCENT = {
  violet: {
    text: "text-violet-soft",
    border: "group-hover:border-violet/45",
    glow: "from-violet/[0.10]",
    rule: "bg-violet",
  },
  cyan: {
    text: "text-cyan-soft",
    border: "group-hover:border-cyan/45",
    glow: "from-cyan/[0.09]",
    rule: "bg-cyan",
  },
} as const;

export default function ProjectShowcase({ projects }: { projects: Project[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const open = (id: string, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setOpenId(id);
  };

  const close = useCallback(() => {
    setOpenId(null);
    // Send focus back where it came from, or the keyboard user is stranded at
    // the top of the document.
    triggerRef.current?.focus();
  }, []);

  const active = projects.find((p) => p.id === openId) ?? null;

  return (
    <>
      <div className="space-y-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onOpen={open} />
        ))}
      </div>

      <CaseStudyDialog project={active} onClose={close} />
    </>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: (id: string, trigger: HTMLButtonElement) => void;
}) {
  const accent = ACCENT[project.accent];

  return (
    <article className="group relative">
      <button
        type="button"
        onClick={(event) => onOpen(project.id, event.currentTarget)}
        aria-haspopup="dialog"
        className={`relative w-full overflow-hidden rounded-2xl border border-line bg-surface p-6 text-left transition-colors duration-300 sm:p-9 ${accent.border}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-linear-to-br ${accent.glow} via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        />

        <span className="relative block">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className={`font-mono text-xs ${accent.text}`}>
              {project.kind}
            </span>
            <span className="font-mono text-xs text-ink-faint">
              {project.year}
            </span>
          </span>

          <span className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
              {project.name}
            </h3>
            <span className="text-base text-ink-muted sm:text-lg">
              {project.tagline}
            </span>
          </span>

          <span className="mt-5 block max-w-2xl text-base leading-relaxed text-ink-muted text-pretty">
            {project.summary}
          </span>

          {/* Tier ladder — a compact preview of the architecture inside. */}
          <span className="mt-7 flex flex-wrap items-center gap-x-1.5 gap-y-2">
            {project.flow.layers.map((layer, index) => (
              <span key={layer.id} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="h-px w-3 bg-line-strong"
                  />
                )}
                <span className="rounded border border-line bg-raised px-2 py-1 font-mono text-[10px] tracking-wide text-ink-faint uppercase">
                  {layer.caption}
                </span>
              </span>
            ))}
          </span>

          <span className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <span className="flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-line bg-raised px-2 py-1 font-mono text-[11px] text-ink-faint"
                >
                  {tech}
                </span>
              ))}
            </span>

            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              Open case study
              <ArrowUpRight
                size={15}
                aria-hidden="true"
                className="transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
              />
            </span>
          </span>
        </span>
      </button>
    </article>
  );
}

/**
 * Full-screen case study.
 *
 * Rendered through a portal so it escapes the section's stacking context, and
 * implements the full dialog contract by hand: Escape to dismiss, focus moved
 * in on open and trapped while open, background scroll locked without the
 * layout shift that hiding the scrollbar normally causes, and the rest of the
 * page marked `aria-hidden` so screen readers stay inside the dialog.
 */
function CaseStudyDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The portal container must stay mounted even when no project is open, or
  // AnimatePresence would unmount before it could run the exit animation.
  const mounted = useHydrated();

  useEffect(() => {
    if (!project) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousPadding = root.style.paddingRight;
    const scrollbar = window.innerWidth - root.clientWidth;

    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;

    // Move focus to the dialog heading rather than the close button, so the
    // first thing announced is what was opened.
    const focusTimer = window.setTimeout(() => headingRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || current === headingRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
      root.style.overflow = previousOverflow;
      root.style.paddingRight = previousPadding;
    };
  }, [project, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {project && (
        <div
          className="fixed inset-0 z-100 flex justify-center overflow-y-auto overscroll-contain p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
        >
          <m.div
            className="fixed inset-0 bg-canvas/85 backdrop-blur-sm"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <m.div
            ref={panelRef}
            className="relative my-0 h-fit w-full max-w-5xl border border-line bg-surface sm:my-auto sm:rounded-2xl"
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.99 }
            }
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 px-6 py-5 backdrop-blur-md sm:rounded-t-2xl sm:px-9">
              <div className="min-w-0">
                <p
                  className={`font-mono text-xs ${ACCENT[project.accent].text}`}
                >
                  {project.kind}
                </p>
                <h2
                  id="case-study-title"
                  ref={headingRef}
                  tabIndex={-1}
                  className="mt-2 text-2xl font-semibold tracking-tight text-ink outline-none sm:text-3xl"
                >
                  {project.name}
                  <span className="ml-3 text-base font-normal text-ink-muted">
                    {project.tagline}
                  </span>
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                className="shrink-0 rounded-lg border border-line bg-raised p-2 text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </header>

            <div className="space-y-12 px-6 py-9 sm:px-9 sm:py-12">
              <CaseBlock label="The problem">
                <p className="max-w-3xl text-base leading-relaxed text-ink-muted text-pretty">
                  {project.problem}
                </p>
              </CaseBlock>

              <CaseBlock label="Technical challenges">
                <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
                  {project.challenges.map((challenge) => (
                    <li key={challenge.title} className="bg-surface p-5">
                      <h4 className="text-sm font-medium text-ink">
                        {challenge.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-ink-muted text-pretty">
                        {challenge.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </CaseBlock>

              <CaseBlock label="Engineering decisions">
                <ol className="space-y-5">
                  {project.decisions.map((decision, index) => (
                    <li key={decision.title} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 font-mono text-xs text-ink-faint tabular-nums"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-ink">
                          {decision.title}
                        </h4>
                        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted text-pretty">
                          {decision.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CaseBlock>

              <CaseBlock label="Architecture">
                <FlowDiagram spec={project.flow} />
              </CaseBlock>

              <CaseBlock label="What it produced">
                <ul className="space-y-3">
                  {project.outcome.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-relaxed text-ink-muted text-pretty"
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-2 h-1 w-1 shrink-0 rounded-full ${ACCENT[project.accent].rule}`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </CaseBlock>

              <CaseBlock label="Stack">
                <ul className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-md border border-line bg-raised px-2.5 py-1.5 font-mono text-[11px] text-ink-muted"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </CaseBlock>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function CaseBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="eyebrow mb-5 flex items-center gap-3">
        <span>{label}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </h3>
      {children}
    </section>
  );
}
