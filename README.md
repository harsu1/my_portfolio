# Harsh Sahu — Portfolio

Personal portfolio for a Full Stack Engineer working on transactional systems,
event-driven architecture, LLM integration and multi-chain Web3.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4 and Motion.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build — all routes prerender to static
npm start       # serve the production build
npm run lint
```

## Deploying (Render)

The site is a **static export** — every route prerenders at build time, so it
deploys as a Render Static Site rather than a Node web service. That means CDN
delivery on the free tier with no cold starts; a free web service sleeps after
15 minutes and takes ~50s to wake, which is the worst behaviour for a link you
hand to a recruiter.

[`render.yaml`](render.yaml) is a Blueprint, so the whole service is defined in
the repo:

```
Render Dashboard → New → Blueprint → connect this repo
```

| Setting               | Value                      |
| --------------------- | -------------------------- |
| Build command         | `npm ci && npm run build`  |
| Publish directory     | `./out`                    |
| `NEXT_PUBLIC_SITE_URL`| the deployed origin        |

**Attaching a custom domain:** add it in Render, then update
`NEXT_PUBLIC_SITE_URL` and redeploy. That variable is the single source for
`metadataBase`, the canonical link, `sitemap.xml`, `robots.txt` and the absolute
`og:image` URL — if it points at the wrong host, link previews break silently
while the site itself looks fine.

> Static export is set by `output: "export"` in [`next.config.ts`](next.config.ts).
> Removing that line reverts to a full Next.js server build, at which point the
> `export const dynamic = "force-static"` lines in `sitemap.ts` and `robots.ts`
> become optional.

GitHub links are driven by `links.github` in [`src/lib/site.ts`](src/lib/site.ts).
Setting it back to `null` removes GitHub from the hero, contact section, footer
and JSON-LD rather than leaving a dead link.

## Structure

```
src/
  app/
    layout.tsx            Fonts, metadata, Person JSON-LD, motion policy
    page.tsx              Server Component — composes the sections in scroll order
    globals.css           Design tokens (@theme), base layer, reduced-motion policy
    opengraph-image.tsx   OG card generated at build time via next/og
    sitemap.ts robots.ts
  lib/
    site.ts               Deployment identity and nav sections
    profile.ts            Experience, stack, evolution — the content source of truth
    projects.ts           Case studies
    flow.ts               Declarative specs for all four architecture diagrams
    knowledge.ts          Local retrieval behind the terminal and assistant
    useHydrated.ts        Hydration-safe client-only value hook
  components/
    layout/               Nav, Footer, MotionProvider
    sections/             One file per page section
    ui/                   Section, Reveal, MagneticLink, CopyField, Counter, Icons
    viz/                  FlowDiagram (the diagram engine), HeroField (hero canvas)
```

## Notes on a few decisions

**Content is data.** Everything the page says lives in `src/lib/*`. The
terminal, the assistant, the diagrams and the rendered sections all read from
the same objects, so a change to the profile propagates everywhere and output
cannot drift from the page.

**One diagram engine.** The CRM event pipeline, the wallet transaction flow,
the system architecture and the AI pipeline are four `FlowSpec` objects rendered
by one component. Layout is CSS grid, so diagrams reflow to a vertical stack on
mobile; edges are measured from the live DOM and redrawn by a `ResizeObserver`,
which is why there is no separate mobile diagram code path.

**Production vs toolkit.** Technologies carry a `maturity` flag. Anything the
profile does not establish as production use is marked "toolkit" and rendered
differently, rather than being flattened into one undifferentiated logo wall.

**The assistant does not call a model.** It is retrieval over a local knowledge
base, and the UI says so. It depends only on the `AnswerSource` interface, so
swapping in a real LLM means implementing one function — no UI changes, and no
API key in this repo.

**Reduced motion is handled centrally** by `MotionConfig reducedMotion="user"`
plus a global CSS rule, so components never branch their rendered output on a
client-only media query. A `<noscript>` rule forces scroll-reveal content
visible when JavaScript does not run.
