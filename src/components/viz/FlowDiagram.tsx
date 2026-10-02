"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as m from "motion/react-m";
import { AnimatePresence, useReducedMotion } from "motion/react";
import type { FlowEdge, FlowSpec, NodeKind } from "@/lib/flow";

/**
 * Renders any `FlowSpec` as an interactive, keyboard-navigable architecture
 * diagram.
 *
 * Layout is plain CSS grid — rows are tiers, cells are nodes — so the diagram
 * reflows to a vertical stack on mobile for free. Edges are the only thing that
 * cannot be expressed in CSS, so they are measured from the live DOM after
 * layout and drawn into an absolutely positioned SVG. A ResizeObserver
 * re-measures on any reflow (viewport change, font load, wrap), which means the
 * edges stay correct at every breakpoint without a second mobile code path.
 */

type Tone = "edge" | "core" | "store" | "ai" | "ext";

const KIND_TONE: Record<NodeKind, Tone> = {
  client: "edge",
  service: "core",
  queue: "core",
  cache: "store",
  db: "store",
  analytics: "store",
  ai: "ai",
  chain: "ext",
  infra: "ext",
  external: "ext",
};

const TONE_STYLES: Record<Tone, { idle: string; active: string; dot: string }> = {
  edge: {
    idle: "border-cyan/25 bg-cyan/[0.04] hover:border-cyan/50",
    active: "border-cyan/70 bg-cyan/[0.10] shadow-[0_0_0_1px_rgba(45,212,222,0.25),0_8px_32px_-8px_rgba(45,212,222,0.35)]",
    dot: "bg-cyan",
  },
  core: {
    idle: "border-violet/25 bg-violet/[0.05] hover:border-violet/50",
    active: "border-violet/70 bg-violet/[0.12] shadow-[0_0_0_1px_rgba(124,92,255,0.28),0_8px_32px_-8px_rgba(124,92,255,0.4)]",
    dot: "bg-violet",
  },
  store: {
    idle: "border-line-strong bg-raised hover:border-ink-faint",
    active: "border-ink-muted bg-overlay shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]",
    dot: "bg-ink-muted",
  },
  ai: {
    idle: "border-dashed border-violet-soft/35 bg-violet/[0.03] hover:border-violet-soft/65",
    active: "border-dashed border-violet-soft/80 bg-violet/[0.10] shadow-[0_0_0_1px_rgba(165,148,255,0.28),0_8px_32px_-8px_rgba(165,148,255,0.35)]",
    dot: "bg-violet-soft",
  },
  ext: {
    idle: "border-line bg-surface hover:border-line-strong",
    active: "border-ink-faint bg-raised",
    dot: "bg-ink-faint",
  },
};

interface MeasuredEdge {
  key: string;
  d: string;
  edge: FlowEdge;
  /** Anchor for the optional label. */
  label: { x: number; y: number; anchor: "middle" | "end" };
}

/**
 * Two reserved channels down the right-hand side.
 *
 * Edges that connect adjacent tiers get a short vertical bezier. Everything
 * else would otherwise cut straight through the nodes in between, so it is
 * routed out into a channel instead: feedback loops (real-time pushes back to
 * the client) take the outer one, forward edges that skip a tier take the
 * inner one. Keeping them apart stops the two kinds of long edge overlapping.
 */
const RETURN_CHANNEL = 14;
const SKIP_CHANNEL = 34;
const GUTTER = SKIP_CHANNEL + 18;

export default function FlowDiagram({
  spec,
  className = "",
}: {
  spec: FlowSpec;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());

  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [edges, setEdges] = useState<MeasuredEdge[]>([]);
  const [canvas, setCanvas] = useState({ width: 0, height: 0 });

  const nodesById = useMemo(() => {
    const map = new Map<string, { node: (typeof spec.layers)[number]["nodes"][number]; layer: number }>();
    spec.layers.forEach((layer, i) =>
      layer.nodes.forEach((node) => map.set(node.id, { node, layer: i })),
    );
    return map;
  }, [spec]);

  /** The node whose detail is shown: hover previews, selection sticks. */
  const focusId = hovered ?? selected;
  const focus = focusId ? nodesById.get(focusId)?.node ?? null : null;

  const registerNode = useCallback((id: string, el: HTMLElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  /**
   * Translates DOM geometry into edge paths.
   *
   * Adjacent tiers get a short vertical bezier. Anything spanning further —
   * forwards or backwards — is routed into a side channel, because a straight
   * line between distant tiers runs straight over every node in between.
   */
  const measure = useCallback(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const base = canvasEl.getBoundingClientRect();
    if (base.width === 0) return;
    setCanvas({ width: base.width, height: base.height });

    const next: MeasuredEdge[] = [];

    /**
     * Orthogonal detour for non-adjacent tiers.
     *
     * Leaves through the node's top or bottom edge — never the side — so the
     * horizontal runs sit in the empty gaps *between* rows rather than crossing
     * the nodes sharing a row with the endpoints. Vertical travel happens out
     * in the reserved channel.
     */
    const viaChannel = (
      a: DOMRect,
      b: DOMRect,
      channelX: number,
      downward: boolean,
    ): { d: string; label: MeasuredEdge["label"] } => {
      const dir = downward ? 1 : -1;
      const inset = 14;

      // Exit/entry columns sit near each node's right edge.
      const ax = Math.max(a.left - base.left + 12, a.right - base.left - inset);
      const bx = Math.max(b.left - base.left + 12, b.right - base.left - inset);

      const aEdgeY = downward ? a.bottom - base.top : a.top - base.top;
      const bEdgeY = downward ? b.top - base.top : b.bottom - base.top;

      // Horizontal lanes, parked in the row gaps.
      const laneA = aEdgeY + dir * 14;
      const laneB = bEdgeY - dir * 14;

      const r = Math.max(
        2,
        Math.min(8, Math.abs(laneB - laneA) / 2, Math.abs(channelX - ax) / 2),
      );

      return {
        d:
          `M ${ax} ${aEdgeY} ` +
          `L ${ax} ${laneA - dir * r} Q ${ax} ${laneA}, ${ax + r} ${laneA} ` +
          `L ${channelX - r} ${laneA} Q ${channelX} ${laneA}, ${channelX} ${laneA + dir * r} ` +
          `L ${channelX} ${laneB - dir * r} Q ${channelX} ${laneB}, ${channelX - r} ${laneB} ` +
          `L ${bx + r} ${laneB} Q ${bx} ${laneB}, ${bx} ${laneB + dir * r} ` +
          `L ${bx} ${bEdgeY}`,
        // Anchored just inside the channel so it never clips off the canvas.
        label: { x: channelX - 6, y: (laneA + laneB) / 2, anchor: "end" },
      };
    };

    for (const edge of spec.edges) {
      const fromEl = nodeRefs.current.get(edge.from);
      const toEl = nodeRefs.current.get(edge.to);
      if (!fromEl || !toEl) continue;

      const fromLayer = nodesById.get(edge.from)?.layer ?? 0;
      const toLayer = nodesById.get(edge.to)?.layer ?? 0;
      const span = toLayer - fromLayer;

      const a = fromEl.getBoundingClientRect();
      const b = toEl.getBoundingClientRect();

      let d: string;
      let label: MeasuredEdge["label"];

      if (span === 1) {
        const ax = a.left - base.left + a.width / 2;
        const bx = b.left - base.left + b.width / 2;
        const aBottom = a.top - base.top + a.height;
        const by = b.top - base.top;
        const gap = by - aBottom;
        const curve = Math.max(12, Math.min(gap * 0.6, 44));

        d = `M ${ax} ${aBottom} C ${ax} ${aBottom + curve}, ${bx} ${by - curve}, ${bx} ${by}`;
        label = { x: (ax + bx) / 2, y: aBottom + gap / 2, anchor: "middle" };
      } else {
        const channelX =
          base.width - (span > 1 ? SKIP_CHANNEL : RETURN_CHANNEL);
        ({ d, label } = viaChannel(a, b, channelX, span > 0));
      }

      next.push({ key: `${edge.from}->${edge.to}`, d, edge, label });
    }

    setEdges(next);
  }, [spec.edges, nodesById]);

  // Measure before paint so edges never flash in the wrong position.
  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(canvasEl);
    // Node boxes can resize without the canvas changing size (text wrapping).
    nodeRefs.current.forEach((el) => observer.observe(el));

    // Web fonts land after first paint and shift every node box.
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => measure()).catch(() => {});
    }

    return () => observer.disconnect();
  }, [measure]);

  const connected = useMemo(() => {
    if (!focusId) return null;
    const ids = new Set<string>([focusId]);
    for (const edge of spec.edges) {
      if (edge.from === focusId) ids.add(edge.to);
      if (edge.to === focusId) ids.add(edge.from);
    }
    return ids;
  }, [focusId, spec.edges]);

  const isEdgeLit = (edge: FlowEdge) =>
    focusId != null && (edge.from === focusId || edge.to === focusId);

  return (
    <div className={className}>
      <div className="mb-5">
        <h3 className="font-mono text-sm text-ink">{spec.title}</h3>
        <p className="mt-1 text-sm text-ink-faint">{spec.subtitle}</p>
      </div>

      <div
        ref={canvasRef}
        className="relative"
        style={{ paddingRight: GUTTER }}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Edge layer. Purely decorative: every relationship it draws is also
            stated in the selected node's description, which screen readers get. */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          width={canvas.width}
          height={canvas.height}
          style={{ overflow: "visible" }}
        >
          <defs>
            <marker
              id={`${uid}-arrow`}
              viewBox="0 0 8 8"
              refX="6"
              refY="4"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 7 4 L 0 7 z" fill="currentColor" />
            </marker>
          </defs>

          {edges.map(({ key, d, edge, label }) => {
            const lit = isEdgeLit(edge);
            const dimmed = focusId != null && !lit;
            const isAi = edge.variant === "ai";
            const isRealtime = edge.variant === "realtime";

            const color = isAi
              ? "var(--color-violet-soft)"
              : isRealtime
                ? "var(--color-cyan)"
                : lit
                  ? "var(--color-violet)"
                  : "var(--color-line-strong)";

            return (
              <g
                key={key}
                style={{ color }}
                className="transition-opacity duration-300"
                opacity={dimmed ? 0.18 : 1}
              >
                <path
                  d={d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={lit ? 1.75 : 1.25}
                  strokeLinecap="round"
                  strokeDasharray={isAi ? "5 5" : isRealtime ? "2 6" : undefined}
                  markerEnd={`url(#${uid}-arrow)`}
                  style={
                    (isAi || isRealtime) && !reduceMotion
                      ? { animation: "flow-dash 1.4s linear infinite" }
                      : undefined
                  }
                />
                {edge.label && (
                  <text
                    x={label.x}
                    y={label.y}
                    dy="-3"
                    textAnchor={label.anchor}
                    className="fill-current font-mono"
                    style={{
                      fontSize: 9,
                      opacity: lit ? 1 : 0.65,
                      // Halo in the surface colour so labels stay readable
                      // wherever a path happens to cross something.
                      stroke: "var(--color-surface)",
                      strokeWidth: 3,
                      paintOrder: "stroke",
                      strokeLinejoin: "round",
                    }}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Node layer */}
        <div className="relative flex flex-col gap-7 sm:gap-9">
          {spec.layers.map((layer) => (
            <div
              key={layer.id}
              className="grid gap-2 sm:grid-cols-[88px_1fr] sm:items-center sm:gap-4"
            >
              <div className="eyebrow sm:text-right">{layer.caption}</div>
              <div className="flex flex-wrap items-stretch gap-2.5 sm:gap-3">
                {layer.nodes.map((node) => {
                  const tone = KIND_TONE[node.kind];
                  const styles = TONE_STYLES[tone];
                  const isActive = focusId === node.id;
                  const isDimmed = connected != null && !connected.has(node.id);

                  return (
                    <button
                      key={node.id}
                      ref={(el) => registerNode(node.id, el)}
                      type="button"
                      aria-pressed={selected === node.id}
                      aria-describedby={isActive ? `${uid}-detail` : undefined}
                      onMouseEnter={() => setHovered(node.id)}
                      onFocus={() => setHovered(node.id)}
                      onBlur={() => setHovered(null)}
                      onClick={() =>
                        setSelected((prev) => (prev === node.id ? null : node.id))
                      }
                      className={[
                        "group relative min-w-0 rounded-lg border px-3 py-2 text-left",
                        "transition-[border-color,background-color,box-shadow,opacity,transform] duration-200",
                        "motion-safe:hover:-translate-y-0.5",
                        isActive ? styles.active : styles.idle,
                        isDimmed ? "opacity-35" : "opacity-100",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`}
                        />
                        <span className="text-[13px] font-medium text-ink">
                          {node.label}
                        </span>
                        {node.maturity === "toolkit" && (
                          <span className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">
                            toolkit
                          </span>
                        )}
                      </span>
                      {node.sub && (
                        <span className="mt-0.5 block font-mono text-[10px] text-ink-faint">
                          {node.sub}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel. Sibling of the canvas, never inside it — otherwise
          opening it would resize the measured container and loop. */}
      <div className="mt-6 min-h-28" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {focus ? (
            <m.div
              key={focus.id}
              id={`${uid}-detail`}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="lit-edge rounded-xl border border-line bg-surface p-5"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-sm font-medium text-ink">{focus.label}</span>
                {focus.sub && (
                  <span className="font-mono text-[11px] text-ink-faint">
                    {focus.sub}
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted text-pretty">
                {focus.detail}
              </p>
            </m.div>
          ) : (
            <m.div
              key="idle"
              initial={false}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-line bg-surface/40 p-5"
            >
              <p className="text-sm text-ink-faint">
                Hover or select a node to see what it does and why it is there.
                {spec.edges.some((e) => e.variant === "ai") &&
                  " Dashed violet edges mark the boundary the model is not allowed to cross."}
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {spec.note && (
        <p className="mt-4 border-l-2 border-violet/40 pl-4 text-sm leading-relaxed text-ink-muted text-pretty">
          {spec.note}
        </p>
      )}
    </div>
  );
}
