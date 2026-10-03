import { stackGroups } from "./profile";
import { projects } from "./projects";
import { links, sections, site } from "./site";

/**
 * Everything the command palette can reach, derived from the same data the page
 * renders. Nothing is hand-listed, so the palette cannot fall out of sync with
 * the site as content changes.
 */

export type CommandKind = "section" | "tech" | "action" | "project";

export interface Command {
  id: string;
  kind: CommandKind;
  label: string;
  /** Secondary line — for a technology this is what it is actually used for. */
  hint?: string;
  /** Extra terms matched against, never displayed. */
  keywords?: string;
  /** Section id to scroll to. */
  target?: string;
  /** External or download link. */
  href?: string;
  external?: boolean;
  download?: boolean;
  /** Copies to clipboard instead of navigating. */
  copy?: string;
}

const sectionCommands: Command[] = sections.map(({ id, label }) => ({
  id: `section-${id}`,
  kind: "section",
  label,
  hint: "Jump to section",
  target: id,
}));

const projectCommands: Command[] = projects.map((p) => ({
  id: `project-${p.id}`,
  kind: "project",
  label: p.name,
  hint: p.tagline,
  keywords: `${p.kind} ${p.stack.join(" ")}`,
  target: "projects",
}));

/** One entry per technology, carrying the note as its hint. */
const techCommands: Command[] = stackGroups.flatMap((group) =>
  group.items.map((tech) => ({
    id: `tech-${group.id}-${tech.name}`,
    kind: "tech" as const,
    label: tech.name,
    hint: tech.note,
    keywords: `${group.title} ${tech.maturity}`,
    target: "skills",
  })),
);

const actionCommands: Command[] = [
  {
    id: "action-email-copy",
    kind: "action",
    label: "Copy email address",
    hint: links.email,
    keywords: "contact mail reach",
    copy: links.email,
  },
  {
    id: "action-email-open",
    kind: "action",
    label: "Send an email",
    hint: "Opens your mail client",
    keywords: "contact reach write",
    href: `mailto:${links.email}`,
  },
  {
    id: "action-resume",
    kind: "action",
    label: "Download résumé",
    hint: "PDF",
    keywords: "cv curriculum vitae",
    href: links.resume,
    download: true,
  },
  {
    id: "action-linkedin",
    kind: "action",
    label: "Open LinkedIn",
    hint: "linkedin.com/in/harsh-sahu1",
    keywords: "social profile connect",
    href: links.linkedin,
    external: true,
  },
  ...(links.github
    ? [
        {
          id: "action-github",
          kind: "action" as const,
          label: "Open GitHub",
          hint: links.github.replace("https://", ""),
          keywords: "code source repositories",
          href: links.github,
          external: true,
        },
      ]
    : []),
  {
    id: "action-terminal",
    kind: "action",
    label: "Open the terminal",
    hint: "A real shell, with history and completion",
    keywords: "console shell command cli",
    target: "console",
  },
  {
    id: "action-ask",
    kind: "action",
    label: "Ask about my work",
    hint: "Local knowledge base, no model call",
    keywords: "assistant question search",
    target: "console",
  },
];

export const commands: Command[] = [
  ...actionCommands,
  ...sectionCommands,
  ...projectCommands,
  ...techCommands,
];

export const KIND_LABEL: Record<CommandKind, string> = {
  action: "Actions",
  section: "Sections",
  project: "Projects",
  tech: "Stack",
};

/** Group order in the results list. */
export const KIND_ORDER: CommandKind[] = ["action", "section", "project", "tech"];

/**
 * Subsequence match — the behaviour people expect from an editor palette,
 * where "psql" finds "PostgreSQL". Returns a score so stronger matches float
 * up: exact prefix beats word-start beats scattered subsequence.
 */
export function scoreCommand(command: Command, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;

  const label = command.label.toLowerCase();
  const haystack = `${label} ${command.hint ?? ""} ${command.keywords ?? ""}`.toLowerCase();

  if (label === q) return 1000;
  if (label.startsWith(q)) return 500;
  if (label.includes(q)) return 300;

  // Word-start match, e.g. "ts" → "TanStack …" is weaker than "TypeScript".
  if (label.split(/[\s.+-]/).some((w) => w.startsWith(q))) return 200;
  if (haystack.includes(q)) return 100;

  // Scattered subsequence over the label only, so hints do not create noise.
  let index = 0;
  for (const char of q) {
    index = label.indexOf(char, index);
    if (index === -1) return 0;
    index += 1;
  }
  return 50;
}

export const paletteHint = `Search ${commands.length} entries across ${site.name.split(" ")[0]}'s work`;
