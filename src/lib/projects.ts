import type { FlowSpec } from "./flow";
import { crmFlow, walletFlow } from "./flow";

export interface CaseStudySection {
  heading: string;
  body: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  kind: string;
  year: string;
  /** Two-line summary used on the card face. */
  summary: string;
  stack: string[];
  /** Problem → challenges → decisions → outcome, as a case study. */
  problem: string;
  challenges: { title: string; body: string }[];
  decisions: { title: string; body: string }[];
  outcome: string[];
  flow: FlowSpec;
  accent: "violet" | "cyan";
}

/**
 * Platforms are identified by domain rather than product name — the work is
 * client-side, so the engineering is the point, not the branding.
 */
export const projects: Project[] = [
  {
    id: "igaming-crm",
    name: "iGaming CRM Platform",
    tagline: "Enterprise player journey automation",
    kind: "Event pipeline · Workflow automation · LLM integration",
    year: "2025 — Present",
    summary:
      "A customer-journey and back-office platform where operators compose automation visually, and the backend turns that into a high-throughput event pipeline with exactly-once semantics.",
    stack: [
      "NestJS",
      "Next.js",
      "PostgreSQL",
      "ClickHouse",
      "Redis",
      "RabbitMQ",
      "BullMQ",
      "Google Gemini",
    ],
    problem:
      "Operators needed to target player segments, automate journeys and watch the health of the business without an engineer writing a query for every campaign or report. That means systems with opposite requirements in one product: a visual builder expressive enough to describe arbitrary conditions, a back office that answers analytical questions on demand, and an ingestion path that can absorb a continuous stream of player events without dropping or double-counting any of them.",
    challenges: [
      {
        title: "Arbitrary segment logic, safe queries",
        body: "Users compose nested AND/OR conditions in a builder. Those have to become real queries without ever concatenating user input into SQL.",
      },
      {
        title: "Duplicate events under retry",
        body: "Producers retry on timeout. A player event that arrives twice must not be counted twice, or every downstream segment, report and campaign trigger is wrong.",
      },
      {
        title: "Analytics competing with transactions",
        body: "Journey evaluation and back-office reporting scan large event volumes. Running that against the same store serving transactional reads degrades both.",
      },
      {
        title: "Risk hides inside normal-looking activity",
        body: "Trust and safety signals only appear across many events over time, so flagging has to run over the full history without slowing the product down for everyone else.",
      },
      {
        title: "LLM output inside a deterministic product",
        body: "Generated campaign copy is useful. A model influencing who gets targeted, what a journey does, or who gets flagged is not acceptable.",
      },
    ],
    decisions: [
      {
        title: "AST-based segment compiler",
        body: "The builder emits an abstract syntax tree, not a string. A compiler walks that tree and produces a parameterised query, so user-composed logic is expressive but structurally incapable of injection.",
      },
      {
        title: "Redis SET-NX idempotency keys",
        body: "Every event carries a key checked with SET-NX before processing. The first write wins, retries are no-ops, and ingestion becomes safe to retry aggressively.",
      },
      {
        title: "Split PostgreSQL and ClickHouse by workload",
        body: "PostgreSQL holds transactional and relational state; ClickHouse absorbs the analytical event volume. Each engine does the job it is actually good at.",
      },
      {
        title: "Back-office analytics on the columnar side",
        body: "Operator reporting reads from the analytical store rather than the transactional one, so a heavy dashboard query never competes with live writes. Operators get the numbers without an engineer in the loop.",
      },
      {
        title: "Trust & safety as deterministic risk flags",
        body: "Risk rules evaluate over event history and surface flags to operators rather than auto-actioning accounts. Keeping a human on the decision means a false positive costs a review, not a wrongly closed account.",
      },
      {
        title: "RabbitMQ for transport, BullMQ for work",
        body: "RabbitMQ decouples ingestion from processing so a slow consumer never backpressures the API. BullMQ runs the scheduled, retryable journey steps.",
      },
      {
        title: "A hard boundary around the model",
        body: "Gemini generates campaign copy and executive narration only. Segment evaluation, A/B assignment, risk flagging and webhook dispatch are deterministic code. The model writes the words; it never picks the audience.",
      },
    ],
    outcome: [
      "Schema validation at the ingestion boundary rejects malformed events before they reach durable storage.",
      "Idempotent ingestion means retries are safe, so upstream producers can be aggressive without corrupting counts.",
      "Operators compose journeys, A/B tests and webhook dispatch without engineering involvement per campaign.",
      "Back-office analytics and trust & safety risk flags run off the event stream, keeping reporting and review off the transactional path.",
      "AI-generated copy ships to users while business logic stays auditable and reproducible.",
    ],
    flow: crmFlow,
    accent: "violet",
  },
  {
    id: "crypto-igaming",
    name: "Crypto iGaming Platform",
    tagline: "Multi-chain wallets, settlement & compliance",
    kind: "Wallets · Settlement · Multi-chain",
    year: "2025 — Present",
    summary:
      "Deposits, withdrawals, settlement and wagering across three blockchains, with verified onboarding and a ledger that stays correct while many players act on it at once.",
    stack: [
      "NestJS",
      "PostgreSQL",
      "Prisma",
      "Redis",
      "BullMQ",
      "Next.js",
      "Web3Auth",
      "Socket.io",
    ],
    problem:
      "Players arrive holding wallets on different chains and expect one balance. Behind that single number are three chain integrations, identity checks that must clear before money moves, an irreversible settlement path, and concurrent writes to the same ledger rows — where a race condition is not a glitch, it is missing money.",
    challenges: [
      {
        title: "Three chains, one balance",
        body: "Solana, EVM and Tron have different signing flows and finality behaviour, but the product shows one wallet.",
      },
      {
        title: "Compliance before money moves",
        body: "Deposits and withdrawals cannot open until identity checks pass — but a heavy verification flow at the front door loses users before they ever reach the product.",
      },
      {
        title: "Onboarding without seed phrases",
        body: "Requiring self-custody setup loses most users at the first screen; supporting existing wallets is still mandatory.",
      },
      {
        title: "Concurrent writes to one ledger",
        body: "Simultaneous bets, settlements, referral rewards and withdrawals touch the same rows. Lost updates here are unrecoverable.",
      },
      {
        title: "Chains are slow and clients are impatient",
        body: "Confirmation takes as long as it takes, but the interface cannot simply freeze while it waits.",
      },
    ],
    decisions: [
      {
        title: "Web3Auth plus WalletConnect, side by side",
        body: "Web3Auth covers users who want to start immediately; WalletConnect (Reown) covers users who already hold a wallet. Both resolve to the same internal account.",
      },
      {
        title: "KYC verification as its own state machine",
        body: "Identity verification runs as a distinct step with explicit states rather than a blocking modal, so the interface can show progress while a check is pending. Downstream services read one verified flag instead of re-deriving status, which keeps the compliance rule in one place.",
      },
      {
        title: "ACID transaction boundaries via Prisma",
        body: "Balance mutations run inside explicit transactions over PostgreSQL, so a settlement either fully applies or does not apply at all.",
      },
      {
        title: "Referral rewards through the same ledger path",
        body: "Referral attribution and payouts post through the same transaction boundaries and idempotency guarantees as every other balance change — so a reward cannot be double-credited by a retry or silently lost.",
      },
      {
        title: "Redis distributed locking",
        body: "A lock per wallet serialises conflicting operations, so two workers cannot settle against the same balance simultaneously. Without it, concurrent writes silently lose money.",
      },
      {
        title: "Chain work off the request path",
        body: "BullMQ handles confirmation polling and retries as background jobs. The API responds immediately; the job finishes the work.",
      },
      {
        title: "Socket.io for state, not polling",
        body: "When a deposit confirms, the server pushes. The client reflects the new balance without hammering an endpoint.",
      },
    ],
    outcome: [
      "One wallet interface over Solana, EVM and Tron, with onboarding that does not require an existing wallet.",
      "KYC verification gates money movement without turning the first screen into a wall.",
      "Settlement, wagering and referral rewards run inside ACID transaction boundaries, with per-wallet locks preventing concurrent-write corruption.",
      "Transaction ledgers tuned for high-concurrency workloads.",
      "Balance and transaction state reach the client in real time over Socket.io.",
    ],
    flow: walletFlow,
    accent: "cyan",
  },
];
