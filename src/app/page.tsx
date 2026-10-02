import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Architecture from "@/components/sections/Architecture";
import AI from "@/components/sections/AI";
import Skills from "@/components/sections/Skills";
import Console from "@/components/sections/Console";
import Contact from "@/components/sections/Contact";

/**
 * Server Component. The page tree — structure, copy, every case study — is
 * rendered on the server and present in the initial HTML. Only the genuinely
 * interactive leaves (nav, diagrams, terminal, assistant) are Client
 * Components, so the JavaScript that ships maps to actual interaction.
 *
 * The scroll order is the argument: who → what I build → what I've shipped →
 * how I think → where AI fits → what I know → prove it → how to reach me.
 */
export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Architecture />
        <AI />
        <Skills />
        <Console />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
