import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import HeroField from "@/components/viz/HeroField";
import MagneticLink from "@/components/ui/MagneticLink";
import Counter from "@/components/ui/Counter";
import Reveal from "@/components/ui/Reveal";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/Icons";
import { facts, positioning } from "@/lib/profile";
import { links, site } from "@/lib/site";

/**
 * Server Component. Only the node field, the magnetic links and the counters
 * are interactive, so those are the only pieces that ship JavaScript.
 */
export default function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28 pb-16"
    >
      {/* Ambient layers, innermost last. All decorative and aria-hidden. */}
      <div aria-hidden="true" className="ambient-wash absolute inset-0 -z-20" />
      <div aria-hidden="true" className="grid-field absolute inset-0 -z-20" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-70">
        <HeroField />
      </div>
      {/* Fade to page background so the field never collides with the next section. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-canvas"
      />

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        {/* Status only — stated in the same mono / uppercase eyebrow grammar as
            every section label, rather than as a floating badge. Location lives
            in the About and Contact sections, where someone is actually looking
            for it. */}
        <Reveal>
          <p className="eyebrow inline-flex items-center gap-2 text-ink-muted">
            <span
              aria-hidden="true"
              className="h-1.25 w-1.25 rotate-45 bg-violet"
            />
            Open to connecting
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <h1
            id="hero-heading"
            className="mt-7 text-[clamp(2.75rem,10vw,7rem)] leading-[0.92] font-semibold tracking-[-0.035em] text-ink"
          >
            Harsh Sahu
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-sm text-ink-muted sm:text-base">
            <span className="text-ink">{site.role}</span>
            <span className="text-line-strong" aria-hidden="true">
              /
            </span>
            <span>AI</span>
            <span className="text-line-strong" aria-hidden="true">
              /
            </span>
            <span>Distributed Systems</span>
            <span className="text-line-strong" aria-hidden="true">
              /
            </span>
            <span>Web3</span>
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-muted text-pretty sm:text-xl">
            I build{" "}
            <strong className="font-medium text-ink">
              scalable transactional systems
            </strong>
            , AI-powered applications, real-time architectures and blockchain
            integrations — the parts of a product where being wrong is expensive.
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticLink href="#projects" variant="primary">
              View projects
              <ArrowDown size={15} aria-hidden="true" />
            </MagneticLink>

            <MagneticLink href={links.resume} variant="secondary" download>
              Résumé
              <Download size={15} aria-hidden="true" />
            </MagneticLink>

            <MagneticLink href={links.linkedin} variant="ghost" external>
              <LinkedInIcon size={15} />
              LinkedIn
              <ArrowUpRight size={13} aria-hidden="true" className="opacity-50" />
            </MagneticLink>

            {/* Renders only once a handle is set in lib/site.ts — never a dead link. */}
            {links.github && (
              <MagneticLink href={links.github} variant="ghost" external>
                <GitHubIcon size={15} />
                GitHub
                <ArrowUpRight
                  size={13}
                  aria-hidden="true"
                  className="opacity-50"
                />
              </MagneticLink>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.32}>
          <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="sr-only">{fact.label}</dt>
                <dd>
                  <span className="block text-3xl font-semibold tracking-tight text-ink tabular-nums sm:text-4xl">
                    <Counter value={fact.value} suffix={fact.suffix} />
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-2 block text-xs leading-snug text-ink-faint"
                  >
                    {fact.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <p className="sr-only">{positioning.headline}</p>
    </section>
  );
}
