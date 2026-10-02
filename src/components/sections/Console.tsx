import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Terminal from "./Terminal";
import AskAssistant from "./AskAssistant";

export default function Console() {
  return (
    <Section
      id="console"
      index="07"
      eyebrow="Console"
      title="Two ways to interrogate this page"
      lead="A working shell on the left — real command parsing, history and completion. A local retrieval assistant on the right, answering from structured content rather than a model."
    >
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr] lg:items-stretch">
        <Reveal>
          <Terminal />
        </Reveal>
        <Reveal delay={0.08} className="h-full">
          <AskAssistant />
        </Reveal>
      </div>
    </Section>
  );
}
