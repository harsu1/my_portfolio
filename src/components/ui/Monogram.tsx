/**
 * The identity mark.
 *
 * An "H" drawn as a miniature system diagram: two vertical rails (tiers), one
 * horizontal edge connecting them, and an accent node sitting on that edge —
 * the same visual language as the architecture diagrams further down the page.
 * It reads as a monogram at a glance and as a node graph on inspection.
 *
 * Geometry lives on a 24-unit grid so the identical path data can be reused by
 * `app/icon.svg` without redrawing it at a different scale.
 */
export default function Monogram({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Rails — the two tiers */}
      <path
        d="M6.5 4.5v15M17.5 4.5v15"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Edge between them */}
      <path
        d="M6.5 12h11"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* The node on the boundary */}
      <circle cx="12" cy="12" r="2.85" className="fill-violet" />
      <circle cx="12" cy="12" r="1.0" className="fill-canvas" />
    </svg>
  );
}
