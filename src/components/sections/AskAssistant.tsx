"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as m from "motion/react-m";
import { AnimatePresence, useReducedMotion } from "motion/react";
import { CornerDownLeft, Sparkles } from "lucide-react";
import {
  localAnswer,
  suggestedQuestions,
  type Answer,
  type AnswerSource,
} from "@/lib/knowledge";

/**
 * "Ask about my work" — retrieval over a local, structured knowledge base.
 *
 * There is no model call and no API key in this project. The component depends
 * only on the `AnswerSource` interface, so wiring this to a real LLM later means
 * passing a different `source` prop that calls a server route — no changes here.
 *
 * The UI says plainly which knowledge base answered, because a fake chat
 * pretending to be an LLM is worse than an honest lookup that admits its range.
 */
export default function AskAssistant({
  source = localAnswer,
}: {
  source?: AnswerSource;
}) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [pending, setPending] = useState(false);
  const [asked, setAsked] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  // Guards against an out-of-order resolution overwriting a newer answer.
  const requestId = useRef(0);

  const ask = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question) return;

      const id = ++requestId.current;
      setAsked(question);
      setPending(true);

      try {
        const result = await source(question);
        if (id !== requestId.current) return;
        setAnswer(result);
      } catch {
        if (id !== requestId.current) return;
        setAnswer({
          topic: "Lookup failed",
          lines: ["Something went wrong reading the knowledge base."],
          source: "fallback",
        });
      } finally {
        if (id === requestId.current) setPending(false);
      }
    },
    [source],
  );

  useEffect(() => () => void requestId.current++, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    ask(query);
  };

  const askSuggestion = (question: string) => {
    setQuery(question);
    ask(question);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles size={15} className="text-violet" aria-hidden="true" />
        <h3 className="text-sm font-medium text-ink">Ask about my work</h3>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-faint text-pretty">
        Answers come from a structured local knowledge base built from this
        profile — not a language model. It is accurate within its range and
        says so when a question falls outside it.
      </p>

      <form onSubmit={submit} className="mt-4">
        <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-raised px-3 py-2 transition-colors focus-within:border-violet/60">
          <label htmlFor="ask-input" className="sr-only">
            Ask a question about Harsh&apos;s experience, projects or stack
          </label>
          <input
            ref={inputRef}
            id="ask-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What did you build in iGaming?"
            autoComplete="off"
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="submit"
            disabled={!query.trim() || pending}
            aria-label="Ask"
            className="shrink-0 rounded-lg border border-line bg-surface p-1.5 text-ink-muted transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CornerDownLeft size={14} aria-hidden="true" />
          </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestedQuestions.slice(0, 4).map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => askSuggestion(question)}
            className="rounded-full border border-line bg-raised px-2.5 py-1 text-[11px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            {question}
          </button>
        ))}
      </div>

      <div
        className="mt-5 min-h-[180px] flex-1 border-t border-line pt-5"
        aria-live="polite"
        aria-busy={pending}
      >
        <AnimatePresence mode="wait" initial={false}>
          {pending ? (
            <m.p
              key="pending"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              className="font-mono text-xs text-ink-faint"
            >
              searching knowledge base…
            </m.p>
          ) : answer ? (
            <m.div
              key={`${asked}-${answer.topic}`}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-violet">
                  {answer.topic}
                </span>
                <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-ink-faint uppercase">
                  {answer.source === "knowledge-base" ? "matched" : "no match"}
                </span>
              </div>

              <div className="mt-3 max-h-64 space-y-1 overflow-y-auto overscroll-contain pr-1 text-sm leading-relaxed text-ink-muted">
                {answer.lines.map((line, index) => (
                  <p
                    key={`${index}-${line}`}
                    className={
                      line.startsWith("  ")
                        ? "pl-3 font-mono text-xs break-words whitespace-pre-wrap text-ink-faint"
                        : "text-pretty"
                    }
                  >
                    {line || " "}
                  </p>
                ))}
              </div>

              {answer.related && answer.related.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="eyebrow">Next</span>
                  {answer.related.slice(0, 4).map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => askSuggestion(topic)}
                      className="rounded-full border border-line bg-raised px-2 py-0.5 text-[11px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}
            </m.div>
          ) : (
            <m.p
              key="idle"
              initial={false}
              className="text-sm text-ink-faint text-pretty"
            >
              Ask about a project, a technology, or how a piece of the
              architecture works.
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
