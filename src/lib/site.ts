/**
 * Single place to change deployment-wide identity.
 *
 * `url` drives metadataBase, the sitemap, robots.txt and every Open Graph tag.
 * Update it once here before deploying and the whole SEO surface follows.
 */
export const site = {
  url: "https://harshsahu.dev", // TODO: replace with the real domain before deploy
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
