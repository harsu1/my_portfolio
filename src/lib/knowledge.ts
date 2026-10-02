/**
 * Local knowledge base powering both the terminal and the "Ask" assistant.
 *
 * This runs entirely in the browser against structured content — there is no
 * model call and no API key anywhere in this project. The retrieval interface
 * (`AnswerSource`) is deliberately async and provider-shaped, so swapping in a
 * real LLM later means implementing one function and changing one import,
 * without touching any UI.
 */

import { stackGroups, roles, evolution, education, positioning } from "./profile";
import { projects } from "./projects";
import { links, site } from "./site";

export interface Answer {
  /** Short heading for the response. */
  topic: string;
  /** Body lines, rendered in order. */
  lines: string[];
  /** Suggested next questions. */
  related?: string[];
  /** How this answer was produced — surfaced in the UI for honesty. */
  source: "knowledge-base" | "fallback";
}

export interface KnowledgeDoc {
  id: string;
  topic: string;
  /** Matching terms. Multi-word entries are matched as phrases. */
  keywords: string[];
  lines: string[];
  related?: string[];
}

const productionTech = stackGroups
  .flatMap((g) => g.items)
  .filter((t) => t.maturity === "production");

const toolkitTech = stackGroups
  .flatMap((g) => g.items)
  .filter((t) => t.maturity === "toolkit");

/** Per-technology docs, generated from the stack data so they never drift. */
const techDocs: KnowledgeDoc[] = stackGroups.flatMap((group) =>
  group.items.map((tech) => ({
    id: `tech-${group.id}-${tech.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    topic: tech.name,
    keywords: [tech.name.toLowerCase()],
    lines: [
      tech.note,
      tech.maturity === "production"
        ? `Layer: ${group.title}. Used in production work.`
        : `Layer: ${group.title}. Part of my working toolkit — not claimed as production experience.`,
    ],
    related: ["stack", group.title.toLowerCase()],
  })),
);

/** Per-project docs, generated from the case studies. */
const projectDocs: KnowledgeDoc[] = projects.map((p) => ({
  id: `project-${p.id}`,
  topic: `${p.name} — ${p.tagline}`,
  keywords: [p.name.toLowerCase(), p.id, ...p.name.toLowerCase().split(" ")],
  lines: [
    p.summary,
    "",
    "Problem:",
    p.problem,
    "",
    "Key engineering decisions:",
    ...p.decisions.map((d) => `  • ${d.title} — ${d.body}`),
    "",
    `Stack: ${p.stack.join(", ")}`,
  ],
  related: ["projects", "architecture", ...p.stack.slice(0, 3).map((s) => s.toLowerCase())],
}));

const coreDocs: KnowledgeDoc[] = [
  {
    id: "igaming",
    topic: "iGaming platform work",
    keywords: [
      "igaming",
      "gaming",
      "kyc",
      "verification",
      "compliance",
      "referral",
      "referrals",
      "back office",
      "backoffice",
      "back-office",
      "analytics",
      "reporting",
      "trust",
      "safety",
      "risk",
      "flags",
      "fraud",
      "operator",
    ],
    lines: [
      "Across two iGaming platforms I built the back-office capability operators actually run the business on:",
      "",
      "  • KYC verification — identity checks as their own state machine, so the",
      "    interface shows progress instead of a blocked screen, and downstream",
      "    services read one verified flag rather than re-deriving status.",
      "",
      "  • Referral program — attribution and reward payouts posting through the",
      "    same ACID transaction boundaries and idempotency guarantees as every",
      "    other balance change, so a retry cannot double-credit a reward.",
      "",
      "  • Back-office analytics — operator reporting served from the columnar",
      "    store, so a heavy dashboard query never competes with live writes.",
      "",
      "  • Trust & safety risk flags — risk rules evaluated over event history,",
      "    surfacing flags for human review rather than auto-actioning accounts.",
      "    A false positive should cost a review, not a closed account.",
      "",
      "All of it deterministic. None of it model-driven.",
    ],
    related: ["projects", "architecture", "clickhouse"],
  },
  {
    id: "about",
    topic: "About",
    keywords: ["about", "who", "yourself", "intro", "bio", "harsh", "you"],
    lines: [...positioning.about],
    related: ["experience", "projects", "stack"],
  },
  {
    id: "experience",
    topic: "Experience",
    keywords: [
      "experience",
      "work",
      "job",
      "career",
      "role",
      "company",
      "sdlc",
      "smartest",
      "employment",
      "years",
    ],
    lines: [
      `${roles.length} roles over 3+ years, both in Noida, India.`,
      "",
      ...roles.flatMap((r) => [
        `${r.title} — ${r.company}`,
        `${r.period}`,
        ...r.highlights.map((h) => `  • ${h}`),
        "",
      ]),
    ],
    related: ["projects", "stack", "timeline"],
  },
  {
    id: "timeline",
    topic: "Engineering timeline",
    keywords: ["timeline", "evolution", "growth", "journey", "progression"],
    lines: evolution.flatMap((s) => [`${s.year} — ${s.label}`, `  ${s.detail}`, ""]),
    related: ["experience", "ai"],
  },
  {
    id: "projects",
    topic: "Projects",
    keywords: ["projects", "project", "built", "build", "portfolio", "work on"],
    lines: [
      "Two platforms engineered end to end:",
      "",
      ...projects.flatMap((p) => [
        `${p.name} — ${p.tagline}`,
        `  ${p.summary}`,
        `  Stack: ${p.stack.join(", ")}`,
        "",
      ]),
      'Ask about either by name for the full case study.',
    ],
    related: ["igaming", "architecture", "kyc"],
  },
  {
    id: "stack",
    topic: "Tech stack",
    keywords: ["stack", "skills", "tech", "technologies", "tools", "know"],
    lines: [
      ...stackGroups.map(
        (g) => `${g.index} ${g.title.toUpperCase()}\n  ${g.items.map((t) => t.name).join(", ")}`,
      ),
      "",
      `${productionTech.length} technologies used in production, ${toolkitTech.length} in my working toolkit.`,
      "Ask about any one of them for what I actually use it for.",
    ],
    related: ["ai", "architecture", "redis"],
  },
  {
    id: "ai",
    topic: "AI engineering",
    keywords: [
      "ai",
      "llm",
      "gemini",
      "genai",
      "generative",
      "machine learning",
      "rag",
      "agents",
    ],
    lines: [
      "Production: Google Gemini is integrated in an iGaming CRM platform, generating campaign copy and executive narration.",
      "",
      "The architectural point is the boundary. Gemini writes language. Segment evaluation, A/B assignment and webhook dispatch are deterministic code. The model never decides who gets targeted or what a journey does.",
      "",
      `Working toolkit (not claimed as production): ${toolkitTech.map((t) => t.name).join(", ")}.`,
      "",
      "The interesting engineering in LLM products is everything around the model call — grounding, output constraint, failure handling, and deciding which choices a model must never make.",
    ],
    related: ["igaming", "stack", "architecture"],
  },
  {
    id: "architecture",
    topic: "Architecture",
    keywords: [
      "architecture",
      "system",
      "design",
      "distributed",
      "scale",
      "scalable",
      "backend",
      "infrastructure",
    ],
    lines: [
      "The recurring shape:",
      "  Client → Next.js → NestJS → PostgreSQL / Redis / ClickHouse / RabbitMQ → BullMQ → external services",
      "  with Socket.io and SSE pushing state back to the client.",
      "",
      "Three principles I keep returning to:",
      "  • Keep the request path fast and deterministic.",
      "  • Move anything slow or failure-prone into a queue.",
      "  • Make every retry safe to repeat — idempotency keys, distributed locks, ACID boundaries.",
    ],
    related: ["redis", "bullmq", "projects"],
  },
  {
    id: "education",
    topic: "Education",
    keywords: ["education", "degree", "college", "university", "study", "aktu", "btech"],
    lines: [`${education.degree}`, `${education.institution}`],
    related: ["experience"],
  },
  {
    id: "contact",
    topic: "Contact",
    keywords: ["contact", "email", "reach", "hire", "linkedin", "connect", "available", "talk"],
    lines: [
      `Email:    ${links.email}`,
      `LinkedIn: ${links.linkedin}`,
      ...(links.github ? [`GitHub:   ${links.github}`] : []),
      `Location: ${site.location}`,
      "",
      "Status: open to connecting.",
    ],
    related: ["about", "experience"],
  },
  {
    id: "location",
    topic: "Location",
    keywords: ["location", "where", "based", "noida", "india", "remote"],
    lines: [`Based in ${site.location}.`],
    related: ["contact"],
  },
];

export const knowledgeBase: KnowledgeDoc[] = [...coreDocs, ...projectDocs, ...techDocs];

/** Questions offered as starting points in the assistant UI. */
export const suggestedQuestions = [
  "What did you build in iGaming?",
  "How does KYC verification work?",
  "How do you use Redis?",
  "Tell me about your AI work",
  "How do trust & safety risk flags work?",
  "How do you think about architecture?",
  "What do you use ClickHouse for?",
];

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "do", "does", "did", "what",
  "whats", "how", "why", "when", "who", "your", "you", "me", "my", "about",
  "tell", "explain", "of", "for", "to", "in", "on", "with", "and", "or", "can",
  "i", "it", "that", "this", "have", "has", "use", "used", "using", "more",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Scores a document against the query. Phrase matches on multi-word keywords
 * outrank single-token matches, and exact topic matches outrank both.
 */
function score(doc: KnowledgeDoc, query: string, tokens: string[]): number {
  const normalized = query.toLowerCase().trim();
  let total = 0;

  if (doc.topic.toLowerCase() === normalized) total += 100;

  for (const keyword of doc.keywords) {
    if (keyword.includes(" ")) {
      if (normalized.includes(keyword)) total += 12;
      continue;
    }
    if (normalized === keyword) total += 25;
    else if (tokens.includes(keyword)) total += 10;
    else if (keyword.length > 4 && tokens.some((t) => t.startsWith(keyword))) total += 4;
  }

  // Weak signal so a near-miss still beats the fallback.
  const haystack = doc.topic.toLowerCase();
  for (const token of tokens) {
    if (token.length > 3 && haystack.includes(token)) total += 3;
  }

  return total;
}

export type AnswerSource = (query: string) => Promise<Answer>;

/**
 * Retrieval against the local knowledge base.
 *
 * Async by design: a future `llmAnswer` implementing the same `AnswerSource`
 * signature can replace this without any UI change.
 */
export const localAnswer: AnswerSource = async (query) => {
  const trimmed = query.trim();
  const tokens = tokenize(trimmed);

  if (!trimmed) {
    return {
      topic: "Nothing asked",
      lines: ["Type a question — try one of the suggestions below."],
      source: "fallback",
    };
  }

  const ranked = knowledgeBase
    .map((doc) => ({ doc, value: score(doc, trimmed, tokens) }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);

  const best = ranked[0];

  if (!best) {
    return {
      topic: "No match",
      lines: [
        "This assistant answers from a local, structured knowledge base built from Harsh's actual experience — it does not call a model, so it cannot improvise.",
        "",
        "Try asking about: a platform (iGaming CRM, crypto wallet platform), a capability (KYC, referrals, risk flags, analytics), a technology (Redis, ClickHouse, NestJS, Gemini), or a topic (experience, architecture, AI, contact).",
      ],
      related: suggestedQuestions.slice(0, 3),
      source: "fallback",
    };
  }

  return {
    topic: best.doc.topic,
    lines: best.doc.lines,
    related: best.doc.related,
    source: "knowledge-base",
  };
};
