import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import { education, languages, positioning } from "@/lib/profile";
import { site } from "@/lib/site";

export default function About() {
  return (
    <Section
      id="about"
      index="01"
      eyebrow="The work"
      title="I work on the parts that are expensive to get wrong"
    >
      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <Reveal className="space-y-6">
          {positioning.about.map((paragraph) => (
            <p
              key={paragraph}
              className="text-lg leading-relaxed text-ink-muted text-pretty"
            >
              {paragraph}
            </p>
          ))}
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            <Detail label="Based in" value={site.location} />
            <Detail label="Currently" value="Full Stack Engineer, SDLC Corp" />
            <Detail
              label="Education"
              value={`${education.degree}, ${education.institution}`}
            />
            <Detail label="Languages" value={languages.join(" · ")} />
            <Detail label="Focus" value="AI-native full stack engineering" />
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 text-sm text-ink text-pretty">{value}</dd>
    </div>
  );
}
