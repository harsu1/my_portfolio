import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import FlowDiagram from "@/components/viz/FlowDiagram";
import { systemFlow } from "@/lib/flow";

const PRINCIPLES = [
  {
    title: "Keep the request path fast",
    body: "A handler should validate, write, and return. Anything that waits on a chain, a third party or a large scan does not belong in a request.",
  },
  {
    title: "Make every retry safe",
    body: "Networks retry whether you planned for it or not. Idempotency keys, distributed locks and ACID boundaries are what turn a retry from a double-charge into a no-op.",
  },
  {
    title: "Match the engine to the load",
    body: "Ledgers want constraints and transactions. Event analytics want columns and scans. Putting both in one database means neither gets what it needs.",
  },
  {
    title: "Fail in one place, not everywhere",
    body: "Services talk through durable messages, so a slow consumer drains at its own pace instead of propagating backpressure to every caller upstream.",
  },
];

export default function Architecture() {
  return (
    <Section
      id="architecture"
      index="04"
      eyebrow="Under the hood"
      title="How I think about a system before I write it"
      lead="The specifics change per product. This shape does not — and neither do the four rules underneath it."
    >
      <Reveal>
        <div className="lit-edge rounded-2xl border border-line bg-surface p-5 sm:p-8">
          <FlowDiagram spec={systemFlow} />
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {PRINCIPLES.map((principle, index) => (
            <li key={principle.title} className="bg-surface p-6">
              <span className="font-mono text-xs text-violet">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-base font-medium text-ink">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted text-pretty">
                {principle.body}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
