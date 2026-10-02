"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type Status = "idle" | "copied" | "error";

/**
 * Click-to-copy row.
 *
 * Falls back to a hidden textarea + `execCommand` where the async Clipboard API
 * is unavailable (non-secure origins, older Safari), and reports failure rather
 * than silently claiming success.
 */
export default function CopyField({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  const copy = useCallback(async () => {
    const settle = (next: Status) => {
      setStatus(next);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setStatus("idle"), 2000);
    };

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        settle("copied");
        return;
      }

      const scratch = document.createElement("textarea");
      scratch.value = value;
      scratch.setAttribute("readonly", "");
      scratch.style.position = "fixed";
      scratch.style.opacity = "0";
      document.body.appendChild(scratch);
      scratch.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(scratch);
      settle(ok ? "copied" : "error");
    } catch {
      settle("error");
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}: ${value}`}
      className="group flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3.5 text-left transition-colors duration-200 hover:border-line-strong hover:bg-raised"
    >
      <span className="min-w-0">
        <span className="eyebrow block">{label}</span>
        <span className="mt-1 block truncate font-mono text-sm text-ink">
          {value}
        </span>
      </span>
      <span
        className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-ink-faint transition-colors group-hover:text-ink-muted"
        aria-hidden="true"
      >
        {status === "copied" ? (
          <>
            <Check size={13} className="text-live" />
            <span className="text-live">copied</span>
          </>
        ) : status === "error" ? (
          <span>copy failed</span>
        ) : (
          <>
            <Copy size={13} />
            <span>copy</span>
          </>
        )}
      </span>
      {/* Announced to assistive tech without duplicating the visual label. */}
      <span className="sr-only" role="status">
        {status === "copied"
          ? `${label} copied to clipboard`
          : status === "error"
            ? `Could not copy ${label}`
            : ""}
      </span>
    </button>
  );
}
