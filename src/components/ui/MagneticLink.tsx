"use client";

import { useRef, useState, type ReactNode } from "react";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-ink text-canvas font-medium hover:bg-white border border-transparent",
  secondary:
    "border border-line-strong bg-raised text-ink hover:border-ink-faint hover:bg-overlay",
  ghost: "border border-transparent text-ink-muted hover:text-ink",
};

/**
 * Anchor with a magnetic hover pull.
 *
 * The effect is pointer-only: it is driven by `pointermove` with a `mouse`
 * pointer-type guard, so touch users never trigger a transform that would fight
 * with scrolling, and reduced-motion users get a plain static link.
 */
export default function MagneticLink({
  href,
  children,
  variant = "secondary",
  external = false,
  download = false,
  className = "",
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  download?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (reduceMotion || event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    setOffset({ x: dx * 0.18, y: dy * 0.28 });
  };

  const reset = () => setOffset({ x: 0, y: 0 });

  return (
    <m.a
      ref={ref}
      href={href}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onBlur={reset}
      download={download || undefined}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      animate={offset}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.4 }}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm",
        "transition-colors duration-200",
        VARIANTS[variant],
        className,
      ].join(" ")}
    >
      {children}
    </m.a>
  );
}
