"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { stackGroups, roles, education, positioning, evolution } from "@/lib/profile";
import { projects } from "@/lib/projects";
import { links, site } from "@/lib/site";

/**
 * A real terminal, not a typing animation.
 *
 * Commands are a registry of pure functions over the same profile data the rest
 * of the page renders, so output can never drift from the site content.
 * Supports history (arrow keys), completion (Tab) and `clear`.
 *
 * Accessibility: the transcript is a `role="log"` live region so new output is
 * announced, and the prompt is a genuine text input with a label — a div with a
 * fake caret would be unusable with a screen reader or a mobile keyboard.
 */

interface Line {
  id: number;
  kind: "input" | "output" | "error" | "system";
  text: string;
}

type CommandFn = () => string[];

const BANNER = [
  "harsh-sahu — portfolio shell",
  "Type `help` for available commands.",
];

function buildCommands(): Record<string, { describe: string; run: CommandFn }> {
  return {
    help: {
      describe: "List available commands",
      run: () => [
        "Available commands:",
        "",
        ...Object.entries(registry).map(
          ([name, cmd]) => `  ${name.padEnd(16)}${cmd.describe}`,
        ),
        "",
        "Arrow Up/Down for history · Tab to complete",
      ],
    },
    whoami: {
      describe: "Identity",
      run: () => ["harsh-sahu"],
    },
    role: {
      describe: "Current title",
      run: () => [site.role, `${roles[0].company} · ${roles[0].period}`],
    },
    about: {
      describe: "What I work on",
      run: () => positioning.about.flatMap((p) => [p, ""]).slice(0, -1),
    },
    stack: {
      describe: "Technology stack by layer",
      run: () =>
        stackGroups.flatMap((group) => [
          `${group.index} ${group.title.toUpperCase()}`,
          `   ${group.items.map((i) => i.name).join(", ")}`,
          "",
        ]),
    },
    skills: {
      describe: "Alias for stack",
      run: () => registry.stack.run(),
    },
    projects: {
      describe: "Featured systems",
      run: () =>
        projects.flatMap((p) => [
          `${p.name} — ${p.tagline}`,
          `  ${p.summary}`,
          `  stack: ${p.stack.join(", ")}`,
          "",
        ]),
    },
    experience: {
      describe: "Work history",
      run: () =>
        roles.flatMap((r) => [
          `${r.title} @ ${r.company}`,
          `  ${r.period} · ${r.location}`,
          ...r.highlights.map((h) => `  - ${h}`),
          "",
        ]),
    },
    timeline: {
      describe: "Engineering evolution",
      run: () => evolution.map((s) => `${s.year}  ${s.label}`),
    },
    education: {
      describe: "Academic background",
      run: () => [education.degree, education.institution],
    },
    current_focus: {
      describe: "What I'm working toward",
      run: () => [
        "AI-native full stack engineering.",
        "",
        "Gemini runs in production inside an iGaming CRM platform, with a hard",
        "boundary between generated language and deterministic business logic.",
      ],
    },
    status: {
      describe: "Availability",
      run: () => [
        "● Open to connecting",
        `  ${site.location}`,
      ],
    },
    contact: {
      describe: "How to reach me",
      run: () => [
        `email     ${links.email}`,
        `linkedin  ${links.linkedin}`,
        ...(links.github ? [`github    ${links.github}`] : []),
      ],
    },
    clear: {
      describe: "Clear the transcript",
      run: () => [],
    },
  };
}

const registry = buildCommands();

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>(() =>
    BANNER.map((text, i) => ({ id: i, kind: "system" as const, text })),
  );
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);

  const nextId = useRef(BANNER.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const commandNames = useMemo(() => Object.keys(registry), []);

  const push = useCallback((entries: Omit<Line, "id">[]) => {
    setLines((prev) => [
      ...prev,
      ...entries.map((entry) => ({ ...entry, id: nextId.current++ })),
    ]);
  }, []);

  const submit = useCallback(
    (raw: string) => {
      const input = raw.trim();
      setValue("");
      setHistoryIndex(null);
      if (!input) return;

      setHistory((prev) => [...prev, input]);
      const name = input.split(/\s+/)[0].toLowerCase();

      if (name === "clear") {
        nextId.current = 0;
        setLines([]);
        return;
      }

      const command = registry[name];

      if (!command) {
        const near = commandNames.filter((c) => c.startsWith(name.slice(0, 2)));
        push([
          { kind: "input", text: input },
          { kind: "error", text: `command not found: ${name}` },
          {
            kind: "output",
            text: near.length
              ? `did you mean: ${near.join(", ")}?`
              : "type `help` for available commands",
          },
        ]);
        return;
      }

      push([
        { kind: "input", text: input },
        ...command.run().map((text) => ({ kind: "output" as const, text })),
      ]);
    },
    [commandNames, push],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit(value);
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const partial = value.trim().toLowerCase();
      if (!partial) return;
      const matches = commandNames.filter((c) => c.startsWith(partial));
      if (matches.length === 1) setValue(matches[0]);
      else if (matches.length > 1)
        push([
          { kind: "input", text: value },
          { kind: "output", text: matches.join("  ") },
        ]);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      const index = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setValue(history[index]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === null) return;
      const index = historyIndex + 1;
      if (index >= history.length) {
        setHistoryIndex(null);
        setValue("");
      } else {
        setHistoryIndex(index);
        setValue(history[index]);
      }
    }
  };

  // Keep the newest output in view without yanking the whole page around.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#060609]">
      <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        </span>
        <span className="ml-2 font-mono text-[11px] text-ink-faint">
          harsh@portfolio — zsh
        </span>
      </div>

      {/* Clicking anywhere in the body focuses the prompt, the way a terminal
          behaves. Keyboard users reach the input directly via Tab. */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="h-[340px] overflow-y-auto overscroll-contain p-4 font-mono text-[13px] leading-relaxed sm:h-[400px] sm:p-5"
      >
        <div role="log" aria-live="polite" aria-label="Terminal output">
          {lines.map((line) => (
            <div key={line.id} className="break-words whitespace-pre-wrap">
              {line.kind === "input" ? (
                <span>
                  <span className="text-violet" aria-hidden="true">
                    ❯{" "}
                  </span>
                  <span className="text-ink">{line.text}</span>
                </span>
              ) : line.kind === "error" ? (
                <span className="text-[#ff7b72]">{line.text}</span>
              ) : line.kind === "system" ? (
                <span className="text-ink-faint">{line.text}</span>
              ) : (
                <span className="text-ink-muted">{line.text || " "}</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-1 flex items-center gap-2">
          <label htmlFor="terminal-input" className="sr-only">
            Terminal command input. Type help and press Enter for available
            commands.
          </label>
          <span className="text-violet" aria-hidden="true">
            ❯
          </span>
          {/* Block caret stands in for the real one while the prompt is
              unfocused, inviting a click. It sits before the input so it tracks
              the prompt rather than drifting to the end of the flex row. The
              blink is CSS, so the global reduced-motion rule stops it. */}
          {!focused && !value && (
            <span
              aria-hidden="true"
              className="-mr-1 inline-block h-4 w-[7px] bg-violet/70 motion-safe:animate-[caret-blink_1.1s_step-end_infinite]"
            />
          )}
          <input
            ref={inputRef}
            id="terminal-input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            aria-describedby="terminal-hint"
            className="min-w-0 flex-1 bg-transparent text-ink caret-violet outline-none"
          />
        </div>
      </div>

      <p id="terminal-hint" className="sr-only">
        Available commands: {Object.keys(registry).join(", ")}.
      </p>
    </div>
  );
}
