import { links, site } from "@/lib/site";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/Icons";
import Monogram from "@/components/ui/Monogram";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="flex items-center gap-2 text-xs text-ink-muted">
            <Monogram size={16} className="text-ink-muted" />
            {site.name} — {site.role}
          </p>
          <p className="mt-1.5 text-xs text-ink-faint">
            Built with Next.js, TypeScript, Tailwind CSS and Motion. No
            templates, no page builders.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <a
            href={`mailto:${links.email}`}
            className="text-xs text-ink-faint transition-colors hover:text-ink"
          >
            Email
          </a>
          <a
            href={links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="text-ink-faint transition-colors hover:text-ink"
          >
            <LinkedInIcon size={15} />
          </a>
          {links.github && (
            <a
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="text-ink-faint transition-colors hover:text-ink"
            >
              <GitHubIcon size={15} />
            </a>
          )}
          <span className="font-mono text-xs text-ink-faint">© {year}</span>
        </div>
      </div>
    </footer>
  );
}
