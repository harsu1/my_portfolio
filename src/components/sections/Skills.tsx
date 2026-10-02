import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import StackExplorer from "./StackExplorer";
import { stackGroups } from "@/lib/profile";

export default function Skills() {
  return (
    <Section
      id="skills"
      index="06"
      eyebrow="Engineering DNA"
      title="A logo grid proves nothing"
      lead="Seven layers, and what each technology actually does in the systems I build. Select any one of them."
    >
      <Reveal>
        <StackExplorer groups={stackGroups} />
      </Reveal>
    </Section>
  );
}
