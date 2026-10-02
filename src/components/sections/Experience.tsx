import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import EvolutionTrack from "./EvolutionTrack";
import { education, evolution, roles } from "@/lib/profile";

/**
 * Employment history rendered statically — recruiters scan this and search
 * engines index it, so none of it is hidden behind an interaction.
 * The interactive piece is the evolution track below it.
 */
export default function Experience() {
  return (
    <Section
      id="experience"
      index="02"
      eyebrow="Experience"
      title="Three years, two companies, one direction"
      lead="From MERN applications to event-driven services, multi-chain wallets and LLM integration — each role pushed further down the stack."
    >
      <ol className="relative space-y-12 border-l border-line pl-6 sm:space-y-16 sm:pl-10">
        {roles.map((role, index) => (
          <Reveal as="li" key={role.company} delay={index * 0.08}>
            {/* Timeline marker, pinned to the rail. */}
            <span
              aria-hidden="true"
              className={`absolute -left-[6.5px] mt-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 ${
                role.current
                  ? "border-violet bg-canvas"
                  : "border-line-strong bg-canvas"
              }`}
            >
              {role.current && (
                <span className="h-1 w-1 rounded-full bg-violet" />
              )}
            </span>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <time className="font-mono text-xs text-ink-faint">
                {role.period}
              </time>
              {role.current && (
                <span className="rounded-full border border-violet/40 bg-violet/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-violet-soft uppercase">
                  Current
                </span>
              )}
            </div>

            <h3 className="mt-3 text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              {role.title}
            </h3>
            <p className="mt-1.5 text-base text-ink-muted">
              {role.company}
              <span className="mx-2 text-line-strong" aria-hidden="true">
                ·
              </span>
              <span className="text-ink-faint">{role.location}</span>
            </p>

            <p className="mt-4 border-l-2 border-violet/40 pl-4 text-sm text-ink-muted italic">
              {role.shift}
            </p>

            <ul className="mt-6 space-y-3">
              {role.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex gap-3 text-sm leading-relaxed text-ink-muted text-pretty"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-line-strong"
                  />
                  {highlight}
                </li>
              ))}
            </ul>

            <ul className="mt-6 flex flex-wrap gap-2">
              {role.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-md border border-line bg-raised px-2 py-1 font-mono text-[11px] text-ink-faint"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mt-14 block">
        <EvolutionTrack stages={evolution} />
      </Reveal>

      <Reveal className="mt-8 block">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-line bg-surface px-5 py-4">
          <span className="eyebrow">Education</span>
          <span className="text-sm text-ink">{education.degree}</span>
          <span className="text-sm text-ink-faint">{education.institution}</span>
        </div>
      </Reveal>
    </Section>
  );
}
