"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * The drifting node field behind the hero.
 *
 * Canvas rather than DOM: this is ~14 nodes plus their connecting edges
 * redrawn every frame, which would be a layout-thrashing mess as elements.
 *
 * Performance guards, in order of importance:
 *  - the loop is suspended whenever the hero scrolls out of view, and whenever
 *    the tab is hidden, so an unread background tab costs nothing;
 *  - device pixel ratio is capped at 2, since a 3x backing store on a phone
 *    quadruples fill cost for no visible gain;
 *  - reduced motion renders exactly one static frame and never starts a loop.
 *
 * Positions are fractions of the canvas, so a resize re-places nodes rather
 * than stretching a bitmap.
 */

interface FieldNode {
  label: string;
  /** Anchor position as a fraction of width/height. */
  x: number;
  y: number;
  /** Drift amplitude and phase — deterministic, so every load looks the same. */
  amp: number;
  phase: number;
  emphasis: boolean;
}

const NODES: FieldNode[] = [
  { label: "Next.js", x: 0.12, y: 0.18, amp: 7, phase: 0.0, emphasis: true },
  { label: "NestJS", x: 0.3, y: 0.08, amp: 5, phase: 1.1, emphasis: true },
  { label: "PostgreSQL", x: 0.48, y: 0.2, amp: 6, phase: 2.3, emphasis: true },
  { label: "Redis", x: 0.68, y: 0.1, amp: 8, phase: 3.4, emphasis: false },
  { label: "RabbitMQ", x: 0.86, y: 0.22, amp: 5, phase: 4.2, emphasis: false },
  { label: "BullMQ", x: 0.78, y: 0.42, amp: 7, phase: 5.1, emphasis: false },
  { label: "ClickHouse", x: 0.92, y: 0.6, amp: 6, phase: 0.8, emphasis: false },
  { label: "Socket.io", x: 0.6, y: 0.52, amp: 5, phase: 1.9, emphasis: false },
  { label: "AI", x: 0.38, y: 0.46, amp: 9, phase: 2.8, emphasis: true },
  { label: "Gemini", x: 0.2, y: 0.58, amp: 6, phase: 3.9, emphasis: false },
  { label: "Web3", x: 0.08, y: 0.4, amp: 7, phase: 4.7, emphasis: true },
  { label: "Solana", x: 0.26, y: 0.76, amp: 5, phase: 5.6, emphasis: false },
  { label: "Docker", x: 0.52, y: 0.82, amp: 6, phase: 0.4, emphasis: false },
  { label: "Prisma", x: 0.74, y: 0.74, amp: 5, phase: 1.5, emphasis: false },
];

/** Index pairs that read as a plausible system topology. */
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [5, 7], [7, 8],
  [8, 9], [0, 10], [10, 11], [11, 12], [12, 13], [13, 6], [2, 8],
  [1, 7], [10, 8], [2, 13],
];

export default function HeroField() {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let running = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const positions = (time: number) =>
      NODES.map((node) => ({
        node,
        x: node.x * width + (reduceMotion ? 0 : Math.cos(time * 0.00028 + node.phase) * node.amp),
        y: node.y * height + (reduceMotion ? 0 : Math.sin(time * 0.00034 + node.phase) * node.amp),
      }));

    const draw = (time: number) => {
      if (width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);
      const points = positions(time);

      // Edges first, so nodes sit on top of their connections.
      ctx.lineWidth = 1;
      for (const [from, to] of EDGES) {
        const a = points[from];
        const b = points[to];
        const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        gradient.addColorStop(0, "rgba(124, 92, 255, 0.16)");
        gradient.addColorStop(0.5, "rgba(124, 92, 255, 0.07)");
        gradient.addColorStop(1, "rgba(45, 212, 222, 0.13)");
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      ctx.font =
        '10px var(--font-mono-code, ui-monospace), ui-monospace, monospace';
      ctx.textBaseline = "middle";

      for (const { node, x, y } of points) {
        const pulse = reduceMotion
          ? 0.5
          : 0.5 + Math.sin(time * 0.0012 + node.phase) * 0.22;

        ctx.beginPath();
        ctx.arc(x, y, node.emphasis ? 2.6 : 1.8, 0, Math.PI * 2);
        ctx.fillStyle = node.emphasis
          ? `rgba(124, 92, 255, ${0.55 + pulse * 0.35})`
          : `rgba(155, 155, 171, ${0.3 + pulse * 0.2})`;
        ctx.fill();

        ctx.fillStyle = node.emphasis
          ? "rgba(237, 237, 242, 0.5)"
          : "rgba(155, 155, 171, 0.3)";
        ctx.fillText(node.label, x + 9, y);
      }
    };

    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduceMotion) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const sync = () => {
      if (visible && !document.hidden) start();
      else stop();
    };

    resize();
    draw(0);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
