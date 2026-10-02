import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import FlowDiagram from "@/components/viz/FlowDiagram";
import { aiFlow } from "@/lib/flow";

export default function AI() {
  return (
    <Section
      id="ai"
      index="05"
      eyebrow="AI engineering"
      title={
        <>
          Where full stack engineering
          <br className="hidden sm:block" /> meets AI
        </>
      }
      lead="A model is a dependency with latency, cost and a failure mode — not a feature. The engineering is everything around the call."
    >
      <Reveal>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lit-edge rounded-2xl border border-violet/30 bg-violet/[0.04] p-6">
            <p className="eyebrow text-violet-soft">Shipped</p>
            <h3 className="mt-3 text-lg font-medium text-ink">
              Gemini, in production
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty">
              Google Gemini generates personalised campaign copy and executive
              narration in production — the one place an LLM sits inside a system
              I ship.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <p className="eyebrow">The boundary</p>
            <h3 className="mt-3 text-lg font-medium text-ink">
              Language, never decisions
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty">
              Segment evaluation, A/B assignment and webhook dispatch stay
              deterministic. The model writes the words; it never picks the
              audience or decides what a journey does.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-6">
            <p className="eyebrow">Toolkit</p>
            <h3 className="mt-3 text-lg font-medium text-ink">
              What I build with
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted text-pretty">
              OpenAI, LangChain, RAG, vector databases, agents and MCP are tools
              I work with — marked as toolkit throughout this site rather than
              dressed up as production experience.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="lit-edge mt-6 rounded-2xl border border-line bg-surface p-5 sm:p-8">
          <FlowDiagram spec={aiFlow} />
        </div>
      </Reveal>
    </Section>
  );
}
