/**
 * Single place to change deployment-wide identity.
 *
 * `url` drives metadataBase, the canonical link, sitemap.xml, robots.txt and
 * every Open Graph tag — including the absolute og:image URL that LinkedIn and
 * Twitter fetch when the site is shared. Point it at the wrong host and link
 * previews break silently.
 *
 * It reads `NEXT_PUBLIC_SITE_URL` at build time so the deployed URL lives in
 * Render's config rather than in the repo, which means adding a custom domain
 * later is an environment change and not a commit. The fallback keeps local
 * builds and `npm run build` working with no env set.
 */
const DEFAULT_URL = "https://harsh-sahu-portfolio-501s.onrender.com";

export const site = {
  url: (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_URL).replace(/\/$/, ""),
  name: "Harsh Sahu",
  role: "Full Stack Engineer",
  title: "Harsh Sahu — Full Stack Engineer | AI • Backend • Web3",
  description:
    "Harsh Sahu is a Full Stack Engineer building scalable applications, distributed systems, AI-powered products and blockchain integrations.",
  locale: "en_IN",
  location: "Noida, Uttar Pradesh, India",
} as const;

/**
 * Outbound links.
 *
 * `github` is typed as nullable on purpose — every consumer checks it before
 * rendering, so setting it back to `null` cleanly removes GitHub from the hero,
 * contact section, footer and JSON-LD rather than leaving a dead link.
 */
export const links = {
  email: "sahuharsh164@gmail.com",
  linkedin: "https://www.linkedin.com/in/harsh-sahu1/",
  github: "https://github.com/harsu1" as string | null,
  resume: "/Harsh_Sahu_CV.pdf",
} as const;

export type SectionId =
  | "home"
  | "about"
  | "experience"
  | "projects"
  | "architecture"
  | "ai"
  | "skills"
  | "contact";

export const sections: { id: SectionId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "architecture", label: "Architecture" },
  { id: "ai", label: "AI" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];
