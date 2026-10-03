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
          {/* Only the email is worth a copy affordance — location is stated in
              the metadata row below and nobody copies a city to their clipboard. */}
          <Reveal delay={0.08} className="max-w-xl">
            <CopyField label="Email" value={links.email} />
            <p className="mt-3 text-sm text-ink-faint">
              Email is the fastest way to reach me, and I read every one.
            </p>
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
          {/* Same metadata grammar as the hero strip — one status treatment
              across the page rather than two different badges. */}
          <dl className="mt-16 grid gap-x-10 gap-y-5 border-t border-line pt-8 sm:grid-cols-3">
            <div>
              <dt className="eyebrow">Status</dt>
              <dd className="mt-1.5 inline-flex items-center gap-2 text-sm text-ink">
                <span
                  aria-hidden="true"
                  className="h-1.25 w-1.25 rotate-45 bg-violet"
                />
                Open to connecting
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Currently</dt>
              <dd className="mt-1.5 text-sm text-ink-muted">
                Full Stack Engineer, SDLC Corp
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Based in</dt>
              <dd className="mt-1.5 text-sm text-ink-muted">{site.location}</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
