"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as m from "motion/react-m";
import { AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import Monogram from "@/components/ui/Monogram";
import { sections, type SectionId } from "@/lib/site";

/**
 * Floating navigation with active-section tracking.
 *
 * Active state comes from an IntersectionObserver with a thin horizontal band
 * (`-45% / -50%`) across the middle of the viewport: whichever section crosses
 * that band is current. This is cheaper and steadier than a scroll handler
 * comparing offsets on every frame, and it does not drift when sections have
 * wildly different heights.
 *
 * The one case a band cannot cover is the end of the document — the final
 * section may be too short to ever reach the middle — so a bottom check pins
 * the last entry.
 */
export default function Nav() {
  const [active, setActive] = useState<SectionId>("home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const elements = sections
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((entry) => entry.isIntersecting);
        if (hit) setActive(hit.target.id as SectionId);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        const atBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2;
        if (atBottom) setActive(sections[sections.length - 1].id);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Mobile sheet: lock scroll, close on Escape, restore focus to the toggle.
  useEffect(() => {
    if (!open) return;

    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const go = useCallback((id: SectionId) => {
    setOpen(false);
    setActive(id);
  }, []);

  return (
    <>
      {/* Skip link — first tab stop, so keyboard users can bypass the nav. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-lg focus:border focus:border-violet focus:bg-raised focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5">
        <nav
          aria-label="Primary"
          className={[
            "flex w-full max-w-4xl items-center justify-between gap-4 rounded-full border px-3 py-2 transition-all duration-300 sm:px-4",
            scrolled
              ? "border-line bg-surface/80 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl"
              : "border-transparent bg-transparent",
          ].join(" ")}
        >
          <a
            href="#home"
            onClick={() => go("home")}
            aria-label="Harsh Sahu — back to top"
            className="group flex shrink-0 items-center gap-2.5 rounded-full py-1 pr-3 pl-1.5"
          >
            <span className="relative flex h-7 w-7 items-center justify-center">
              {/* Halo echoing the node pulse used across the diagrams. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-lg bg-violet/0 transition-colors duration-300 group-hover:bg-violet/10"
              />
              <Monogram
                size={22}
                className="relative text-ink transition-transform duration-300 motion-safe:group-hover:scale-105"
              />
            </span>
            <span
              aria-hidden="true"
              className="text-[15px] leading-none font-semibold tracking-[-0.02em]"
            >
              <span className="text-ink">Harsh</span>
              <span className="ml-1 text-ink-faint transition-colors duration-300 group-hover:text-ink-muted">
                Sahu
              </span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-0.5 md:flex">
            {sections.map(({ id, label }) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={() => go(id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative block rounded-full px-3 py-1.5 text-[13px] transition-colors duration-200 ${
                      isActive
                        ? "text-ink"
                        : "text-ink-faint hover:text-ink-muted"
                    }`}
                  >
                    {isActive && (
                      <m.span
                        layoutId="nav-pill"
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-full border border-line-strong bg-raised"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="rounded-full border border-line bg-raised p-2 text-ink-muted transition-colors hover:text-ink md:hidden"
          >
            {open ? (
              <X size={16} aria-hidden="true" />
            ) : (
              <Menu size={16} aria-hidden="true" />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-nav"
            ref={panelRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-canvas/95 backdrop-blur-xl md:hidden"
          >
            <nav
              aria-label="Mobile"
              className="flex h-full flex-col justify-center px-8"
            >
              <ul className="space-y-1">
                {sections.map(({ id, label }, index) => (
                  <m.li
                    key={id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.04 + index * 0.035,
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <a
                      href={`#${id}`}
                      onClick={() => go(id)}
                      aria-current={active === id ? "true" : undefined}
                      className="flex items-baseline gap-4 border-b border-line py-4"
                    >
                      <span className="font-mono text-xs text-violet">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-2xl tracking-tight ${
                          active === id ? "text-ink" : "text-ink-muted"
                        }`}
                      >
                        {label}
                      </span>
                    </a>
                  </m.li>
                ))}
              </ul>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
