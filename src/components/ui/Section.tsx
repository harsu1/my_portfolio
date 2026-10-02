import type { ReactNode } from "react";
import Reveal from "./Reveal";

/**
 * Standard section shell: numbered eyebrow, heading, optional lead paragraph.
 *
 * A Server Component — it ships no JavaScript of its own. Only the `Reveal`
 * wrapper around the header is a Client Component, so the page's static
 * structure stays on the server.
 */
export default function Section({
  id,
  index,
  eyebrow,
  title,
  lead,
  children,
  className = "",
  contain = true,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Set false for sections that manage their own width. */
  contain?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`relative scroll-mt-24 border-t border-line py-20 sm:py-28 ${className}`}
    >
      <div className={contain ? "mx-auto w-full max-w-6xl px-5 sm:px-8" : ""}>
        <Reveal>
          <div className="max-w-3xl">
            <p className="eyebrow flex items-center gap-3">
              <span className="text-violet">{index}</span>
              <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
              <span>{eyebrow}</span>
            </p>
            <h2
              id={`${id}-heading`}
              className="mt-5 text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl md:text-5xl"
            >
              {title}
            </h2>
            {lead && (
              <div className="mt-5 text-base leading-relaxed text-ink-muted text-pretty sm:text-lg">
                {lead}
              </div>
            )}
          </div>
        </Reveal>

        <div className="mt-12 sm:mt-16">{children}</div>
      </div>
    </section>
  );
}
