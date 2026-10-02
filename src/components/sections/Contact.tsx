import { ArrowUpRight, Download, Mail } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import CopyField from "@/components/ui/CopyField";
import MagneticLink from "@/components/ui/MagneticLink";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/Icons";
import { links, site } from "@/lib/site";

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative scroll-mt-24 overflow-hidden border-t border-line py-24 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="ambient-wash absolute inset-0 -z-10 opacity-60"
      />

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="text-violet">08</span>
            <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
            <span>Contact</span>
          </p>

          <h2
            id="contact-heading"
            className="mt-6 text-[clamp(2.25rem,7vw,5rem)] leading-[0.95] font-semibold tracking-[-0.03em] text-ink text-balance"
          >
            Let&apos;s build something.
          </h2>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted text-pretty">
            If you are working on transactional systems, event pipelines or
            putting a model into production without letting it near the
            decisions — I&apos;d be glad to talk.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal delay={0.08} className="max-w-xl space-y-3">
            <CopyField label="Email" value={links.email} />
            <CopyField label="Location" value={site.location} />
          </Reveal>

          <Reveal delay={0.14}>
            <div className="flex flex-wrap items-center gap-3">
              <MagneticLink href={`mailto:${links.email}`} variant="primary">
                <Mail size={15} aria-hidden="true" />
                Email me
              </MagneticLink>

              <MagneticLink href={links.linkedin} variant="secondary" external>
                <LinkedInIcon size={15} />
                LinkedIn
                <ArrowUpRight
                  size={13}
                  aria-hidden="true"
                  className="opacity-50"
                />
              </MagneticLink>

              {links.github && (
                <MagneticLink href={links.github} variant="secondary" external>
                  <GitHubIcon size={15} />
                  GitHub
                  <ArrowUpRight
                    size={13}
                    aria-hidden="true"
                    className="opacity-50"
                  />
                </MagneticLink>
              )}

              <MagneticLink href={links.resume} variant="ghost" download>
                <Download size={15} aria-hidden="true" />
                Résumé
              </MagneticLink>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="mt-16 flex flex-wrap items-center gap-3 border-t border-line pt-8">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-live motion-safe:animate-[pulse-ring_2.4s_ease-out_infinite]" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
            </span>
            <span className="font-mono text-xs text-ink-muted">
              Open to connecting
            </span>
            <span className="text-line-strong" aria-hidden="true">
              ·
            </span>
            <span className="font-mono text-xs text-ink-faint">
              Currently Full Stack Engineer at SDLC Corp
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
