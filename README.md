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

## Before deploying

Two values to set, both in [`src/lib/site.ts`](src/lib/site.ts):

| Field         | Why                                                              |
| ------------- | ---------------------------------------------------------------- |
| `site.url`    | Drives `metadataBase`, canonical URL, `sitemap.xml`, `robots.txt` and every Open Graph tag. |
| `links.github`| Currently `null`, so GitHub links are omitted everywhere rather than rendered dead. Set it to `"https://github.com/<handle>"` and the hero, contact section and footer pick it up automatically. |

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
