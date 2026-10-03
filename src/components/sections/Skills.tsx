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
      title="Logos are the easy part"
      lead="Seven layers of the stack, and what every piece actually does in the systems I build. Select any one of them."
    >
      <Reveal>
        <StackExplorer groups={stackGroups} />
      </Reveal>
    </Section>
  );
}
