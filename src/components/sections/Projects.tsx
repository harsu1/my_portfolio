import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import ProjectShowcase from "./ProjectShowcase";
import { projects } from "@/lib/projects";

export default function Projects() {
  return (
    <Section
      id="projects"
      index="03"
      eyebrow="Systems"
      title="Two platforms, engineered end to end"
      lead="Neither of these is a CRUD application. Open either one for the problem, the constraints that made it hard, the decisions I made, and an interactive map of the architecture."
    >
      <Reveal>
        <ProjectShowcase projects={projects} />
      </Reveal>
    </Section>
  );
}
