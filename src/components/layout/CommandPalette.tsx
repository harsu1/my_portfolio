"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import * as m from "motion/react-m";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check, Copy, CornerDownLeft, Search } from "lucide-react";
import {
  commands,
  scoreCommand,
  KIND_LABEL,
  KIND_ORDER,
  type Command,
  type CommandKind,
} from "@/lib/commands";
import { useHydrated } from "@/lib/useHydrated";

/** Lets the nav button open the palette without a provider for one boolean. */
export const OPEN_PALETTE_EVENT = "portfolio:toggle-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
}

/**
 * ⌘K command palette.
 *
 * The most distinctive things on this site — the terminal, the assistant, the
 * architecture diagrams — sit near the bottom of a long page, where most
 * visitors never reach them. Rather than adding more features, this makes the
 * existing ones reachable from anywhere, which is also the interaction model
 * every engineer already knows from their editor.
 *
 * Results come from `lib/commands`, derived from the same content the page
 * renders, so the palette cannot drift from the site.
 */
export default function CommandPalette() {
  const mounted = useHydrated();
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocusTo = useRef<HTMLElement | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const results = useMemo(() => {
    const scored = commands
      .map((command) => ({ command, score: scoreCommand(command, query) }))
      .filter((r) => r.score > 0);

    // Group order is fixed; within a group the stronger match wins. Without a
    // query this keeps actions and sections above forty stack entries.
    scored.sort((a, b) => {
      const kindDelta =
        KIND_ORDER.indexOf(a.command.kind) - KIND_ORDER.indexOf(b.command.kind);
      if (query.trim() && b.score !== a.score) return b.score - a.score;
      if (kindDelta !== 0) return kindDelta;
      return b.score - a.score;
    });

    return scored.slice(0, 40).map((r) => r.command);
  }, [query]);

  /** Index of the first row of each group, for rendering group headers. */
  const groupStarts = useMemo(() => {
    const seen = new Map<CommandKind, number>();
    results.forEach((command, index) => {
      if (!seen.has(command.kind)) seen.set(command.kind, index);
    });
    return seen;
  }, [results]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    returnFocusTo.current?.focus();
  }, []);

  const run = useCallback(
    (command: Command) => {
      if (command.copy) {
        navigator.clipboard
          ?.writeText(command.copy)
          .then(() => {
            setCopied(command.id);
            clearTimeout(copyTimer.current);
            copyTimer.current = setTimeout(() => setCopied(null), 1600);
          })
          .catch(() => {});
        return; // Stay open so the confirmation is visible.
      }

      if (command.href) {
        const anchor = document.createElement("a");
        anchor.href = command.href;
        if (command.external) {
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
        }
        if (command.download) anchor.download = "";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        close();
        return;
      }

      if (command.target) {
        close();
        // Let the dialog unmount before scrolling, or the scroll lock fights it.
        requestAnimationFrame(() => {
          document
            .getElementById(command.target as string)
            ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        });
      }
    },
    [close, reduceMotion],
  );

  // Global shortcut. Capture phase so it works even from inside the terminal.
  // The custom event is how the nav button opens it without lifting state into
  // a provider for one boolean — and it is what makes the palette reachable on
  // touch, where there is no ⌘K.
  useEffect(() => {
    const toggle = () =>
      setOpen((prev) => {
        if (!prev) returnFocusTo.current = document.activeElement as HTMLElement;
        return !prev;
      });

    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      toggle();
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener(OPEN_PALETTE_EVENT, toggle);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener(OPEN_PALETTE_EVENT, toggle);
    };
  }, []);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  // Scroll lock + focus, while open.
  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousPadding = root.style.paddingRight;
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      root.style.overflow = previousOverflow;
      root.style.paddingRight = previousPadding;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  // Keep the highlighted row in view as the selection moves.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0,
      );
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(0, results.length - 1));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const command = results[active];
      if (command) run(command);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-200 flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <m.div
            className="fixed inset-0 bg-canvas/80 backdrop-blur-sm"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
          />

          <m.div
            className="relative flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)]"
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={16} className="shrink-0 text-ink-faint" aria-hidden="true" />
              <label htmlFor="palette-input" className="sr-only">
                Search sections, projects, technologies and actions
              </label>
              <input
                ref={inputRef}
                id="palette-input"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Search sections, stack, actions…"
                autoComplete="off"
                spellCheck={false}
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-results"
                aria-activedescendant={
                  results[active] ? `palette-item-${results[active].id}` : undefined
                }
                className="min-w-0 flex-1 bg-transparent py-4 text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <kbd className="shrink-0 rounded border border-line bg-raised px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
                ESC
              </kbd>
            </div>

            <div
              ref={listRef}
              id="palette-results"
              role="listbox"
              aria-label="Results"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
            >
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-ink-faint">
                  Nothing matches “{query}”.
                </p>
              ) : (
                results.map((command, index) => {
                  const isActive = index === active;
                  const startsGroup = groupStarts.get(command.kind) === index;

                  return (
                    <div key={command.id}>
                      {startsGroup && (
                        <p className="eyebrow px-3 pt-3 pb-1.5">
                          {KIND_LABEL[command.kind]}
                        </p>
                      )}
                      <div
                        id={`palette-item-${command.id}`}
                        data-index={index}
                        role="option"
                        aria-selected={isActive}
                        tabIndex={-1}
                        onMouseMove={() => setActive(index)}
                        onClick={() => run(command)}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                          isActive ? "bg-raised" : ""
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-ink">
                            {command.label}
                          </span>
                          {command.hint && (
                            <span className="mt-0.5 block truncate text-xs text-ink-faint">
                              {command.hint}
                            </span>
                          )}
                        </span>

                        {copied === command.id ? (
                          <Check size={14} className="shrink-0 text-live" aria-hidden="true" />
                        ) : command.copy ? (
                          <Copy size={13} className="shrink-0 text-ink-faint" aria-hidden="true" />
                        ) : command.external ? (
                          <ArrowUpRight
                            size={13}
                            className="shrink-0 text-ink-faint"
                            aria-hidden="true"
                          />
                        ) : isActive ? (
                          <CornerDownLeft
                            size={13}
                            className="shrink-0 text-ink-faint"
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[10px] text-ink-faint">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-line bg-raised px-1 py-0.5">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-line bg-raised px-1 py-0.5">↵</kbd>
                select
              </span>
              <span className="ml-auto">{results.length} results</span>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
