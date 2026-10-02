/**
 * Declarative specs for every architecture diagram on the site.
 *
 * Diagrams are data, not markup. One renderer (`<FlowDiagram />`) consumes
 * these specs, so the CRM pipeline, the wallet transaction flow, the
 * generic system architecture and the AI pipeline all share layout, keyboard
 * handling, responsive behaviour and reduced-motion support.
 */

export type NodeKind =
  | "client"
  | "service"
  | "queue"
  | "cache"
  | "db"
  | "analytics"
  | "ai"
  | "chain"
  | "infra"
  | "external";

export interface FlowNode {
  id: string;
  label: string;
  /** Small technology label under the node name. */
  sub?: string;
  kind: NodeKind;
  /** Revealed when the node is selected or hovered. */
  detail: string;
  /** Used by the AI pipeline to separate shipped work from toolkit. */
  maturity?: "production" | "toolkit";
}

export interface FlowLayer {
  id: string;
  /** Rail label describing the tier. */
  caption: string;
  nodes: FlowNode[];
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  /** `ai` edges are rendered dashed to mark the model boundary. */
  variant?: "solid" | "ai" | "realtime";
}

export interface FlowSpec {
  id: string;
  title: string;
  subtitle: string;
  layers: FlowLayer[];
  edges: FlowEdge[];
  /** Optional callout rendered beneath the diagram. */
  note?: string;
}

export const crmFlow: FlowSpec = {
  id: "crm-architecture",
  title: "iGaming CRM — event pipeline",
  subtitle:
    "Select any node to see what it does. Dashed edges mark the AI boundary.",
  layers: [
    {
      id: "client",
      caption: "Client",
      nodes: [
        {
          id: "builder",
          label: "Workflow Builder",
          sub: "Next.js · React · TypeScript",
          kind: "client",
          detail:
            "Visual journey builder with dynamic condition groups. Emits a structured condition tree rather than a query string, and talks to the API through TanStack Query with cached, invalidated reads.",
        },
      ],
    },
    {
      id: "api",
      caption: "API",
      nodes: [
        {
          id: "api",
          label: "NestJS API",
          sub: "Domain modules",
          kind: "service",
          detail:
            "Module-per-domain HTTP layer: campaigns, journeys, segments and events each own their boundary. Responds fast because nothing heavy runs on the request path.",
        },
      ],
    },
    {
      id: "ingest",
      caption: "Ingestion",
      nodes: [
        {
          id: "ingest",
          label: "Event Ingestion",
          sub: "Schema validation",
          kind: "service",
          detail:
            "High-throughput entry point for player events. Validates every payload against a schema at the boundary, so malformed events are rejected before they reach durable storage.",
        },
        {
          id: "idem",
          label: "Idempotency Gate",
          sub: "Redis SET-NX",
          kind: "cache",
          detail:
            "Each event carries an idempotency key written with SET-NX. The first write wins and retries become no-ops — producers can retry aggressively without double-counting a single player action.",
        },
      ],
    },
    {
      id: "transport",
      caption: "Transport",
      nodes: [
        {
          id: "rabbit",
          label: "RabbitMQ",
          sub: "Durable queues",
          kind: "queue",
          detail:
            "Decouples ingestion from processing. A slow consumer drains at its own pace instead of applying backpressure to the API, and messages survive a consumer restart.",
        },
      ],
    },
    {
      id: "storage",
      caption: "Storage",
      nodes: [
        {
          id: "postgres",
          label: "PostgreSQL",
          sub: "Transactional state",
          kind: "db",
          detail:
            "Relational source of truth for campaigns, journeys, segments and player records — the data that needs constraints and transactions.",
        },
        {
          id: "clickhouse",
          label: "ClickHouse",
          sub: "Columnar analytics",
          kind: "analytics",
          detail:
            "Absorbs the analytical event volume. Keeping large scans here means segment evaluation never competes with transactional reads for the same I/O.",
        },
      ],
    },
    {
      id: "compute",
      caption: "Compute",
      nodes: [
        {
          id: "segment",
          label: "Segment Compiler",
          sub: "AST → parameterised query",
          kind: "service",
          detail:
            "Walks the abstract syntax tree produced by the builder and compiles it into a parameterised query. Users get arbitrary nested AND/OR logic; the system never concatenates user input into SQL.",
        },
        {
          id: "bullmq",
          label: "BullMQ Workers",
          sub: "Journey execution",
          kind: "queue",
          detail:
            "Runs scheduled and retryable journey steps — wait states, branch evaluation and step execution — as background jobs with their own retry semantics.",
        },
        {
          id: "risk",
          label: "Trust & Safety",
          sub: "Risk flags",
          kind: "service",
          detail:
            "Evaluates risk rules over event history and raises flags for operator review. Deterministic by design, and advisory rather than automatic — a false positive should cost someone a review, not close a player's account.",
        },
      ],
    },
    {
      id: "output",
      caption: "Delivery",
      nodes: [
        {
          id: "abtest",
          label: "A/B Assignment",
          sub: "Deterministic",
          kind: "service",
          detail:
            "Splits players across journey variants in code. Assignment is deterministic and reproducible — never model-generated.",
        },
        {
          id: "webhook",
          label: "Webhook Dispatch",
          sub: "External systems",
          kind: "external",
          detail:
            "Delivers journey outcomes to downstream systems, with queue-backed retries so a failing receiver does not lose the event.",
        },
        {
          id: "backoffice",
          label: "Back-Office Analytics",
          sub: "Operator reporting",
          kind: "analytics",
          detail:
            "Operator-facing reporting over the columnar store, so a heavy dashboard query never competes with live transactional writes. Operators answer their own questions instead of queuing behind an engineer.",
        },
      ],
    },
    {
      id: "ai",
      caption: "AI (isolated)",
      nodes: [
        {
          id: "gemini",
          label: "Google Gemini",
          sub: "Copy + narration",
          kind: "ai",
          detail:
            "Generates personalised campaign copy and executive narration. It reads context and writes language — it has no authority over segment evaluation, A/B assignment or dispatch. Narration is strictly separated from deterministic business logic.",
        },
      ],
    },
  ],
  edges: [
    { from: "builder", to: "api" },
    { from: "api", to: "ingest" },
    { from: "ingest", to: "idem", label: "dedupe" },
    { from: "idem", to: "rabbit", label: "publish" },
    { from: "rabbit", to: "postgres" },
    { from: "rabbit", to: "clickhouse" },
    { from: "postgres", to: "segment" },
    { from: "clickhouse", to: "segment", label: "scan" },
    { from: "clickhouse", to: "risk" },
    { from: "segment", to: "bullmq" },
    { from: "bullmq", to: "abtest" },
    { from: "bullmq", to: "webhook" },
    { from: "risk", to: "backoffice", label: "flags" },
    { from: "postgres", to: "gemini", variant: "ai", label: "context" },
    { from: "gemini", to: "abtest", variant: "ai", label: "copy only" },
  ],
  note: "Gemini sits on a dashed path on purpose: it contributes generated language to campaigns, and nothing else. Every decision that has to be correct every time is deterministic code.",
};

export const walletFlow: FlowSpec = {
  id: "wallet-flow",
  title: "Crypto platform — transaction flow",
  subtitle:
    "Follow a deposit from the player's wallet to a confirmed on-screen balance.",
  layers: [
    {
      id: "player",
      caption: "Player",
      nodes: [
        {
          id: "player",
          label: "Player Wallet",
          sub: "Deposit / withdraw",
          kind: "client",
          detail:
            "The player holds a wallet on one of three chains and expects a single balance in the product, regardless of which one.",
        },
      ],
    },
    {
      id: "ui",
      caption: "Interface",
      nodes: [
        {
          id: "ui",
          label: "Wallet UI",
          sub: "Next.js · TanStack Query",
          kind: "client",
          detail:
            "Deposit, withdrawal and transaction history surfaces. Server state is cached and invalidated through TanStack Query rather than re-fetched on every render.",
        },
      ],
    },
    {
      id: "auth",
      caption: "Wallet access",
      nodes: [
        {
          id: "web3auth",
          label: "Web3Auth",
          sub: "Onboarding",
          kind: "chain",
          detail:
            "Lets a player start without an existing wallet or a seed-phrase ceremony — the step where self-custody onboarding usually loses people.",
        },
        {
          id: "walletconnect",
          label: "WalletConnect",
          sub: "Reown",
          kind: "chain",
          detail:
            "Connects wallets players already hold. Both paths resolve to the same internal account, so downstream services never branch on how the user got here.",
        },
        {
          id: "kyc",
          label: "KYC Verification",
          sub: "Identity + compliance",
          kind: "service",
          detail:
            "Identity verification as its own state machine rather than a blocking modal, so the interface can show progress while a check is pending. Downstream services read one verified flag instead of re-deriving status, keeping the compliance rule in a single place.",
        },
      ],
    },
    {
      id: "chain",
      caption: "Chains",
      nodes: [
        {
          id: "solana",
          label: "Solana",
          sub: "SPL transfers",
          kind: "chain",
          detail:
            "One of three supported chains. Treated as an external system with its own latency and failure modes, never as a synchronous dependency.",
        },
        {
          id: "evm",
          label: "EVM",
          sub: "ERC-20 transfers",
          kind: "chain",
          detail:
            "EVM-chain support alongside Solana and Tron, behind the same internal wallet abstraction.",
        },
        {
          id: "tron",
          label: "Tron",
          sub: "TRC-20 transfers",
          kind: "chain",
          detail:
            "Third supported chain. Different signing flow, identical downstream ledger treatment.",
        },
      ],
    },
    {
      id: "api",
      caption: "API",
      nodes: [
        {
          id: "api",
          label: "NestJS API",
          sub: "Wallet · settlement · wagering",
          kind: "service",
          detail:
            "Domain modules for wallet, settlement and wagering. Accepts the request, enqueues the slow part, and returns immediately.",
        },
      ],
    },
    {
      id: "tx",
      caption: "Transaction core",
      nodes: [
        {
          id: "txservice",
          label: "Transaction Service",
          sub: "Prisma · ACID",
          kind: "service",
          detail:
            "All balance mutations run inside explicit transaction boundaries. A settlement either fully applies or does not apply — there is no partial state to reconcile later.",
        },
        {
          id: "lock",
          label: "Distributed Lock",
          sub: "Redis",
          kind: "cache",
          detail:
            "A lock per wallet serialises conflicting operations, so two workers cannot settle against the same balance at once. Without it, concurrent writes silently lose money.",
        },
        {
          id: "referral",
          label: "Referral Program",
          sub: "Attribution + rewards",
          kind: "service",
          detail:
            "Referral attribution and payouts post through the same transaction boundaries and idempotency guarantees as every other balance change — so a reward cannot be double-credited by a retry, or silently lost when one fails.",
        },
      ],
    },
    {
      id: "ledger",
      caption: "Ledger",
      nodes: [
        {
          id: "postgres",
          label: "PostgreSQL",
          sub: "Transaction ledger",
          kind: "db",
          detail:
            "Append-oriented ledger optimised for high-concurrency writes — the authoritative record of every balance change.",
        },
      ],
    },
    {
      id: "jobs",
      caption: "Background work",
      nodes: [
        {
          id: "bullmq",
          label: "BullMQ Jobs",
          sub: "Confirmation + retries",
          kind: "queue",
          detail:
            "Polls chain confirmations and retries failures off the request path. The chain takes as long as it takes; the API never waits on it.",
        },
      ],
    },
    {
      id: "realtime",
      caption: "Real-time",
      nodes: [
        {
          id: "socket",
          label: "Socket.io",
          sub: "Balance push",
          kind: "service",
          detail:
            "When a deposit confirms, the server pushes the new state to the connected client. No polling loop, no stale balance sitting on screen.",
        },
      ],
    },
  ],
  edges: [
    { from: "player", to: "ui" },
    { from: "ui", to: "web3auth" },
    { from: "ui", to: "walletconnect" },
    { from: "ui", to: "kyc", label: "verify" },
    { from: "web3auth", to: "solana" },
    { from: "web3auth", to: "evm" },
    { from: "walletconnect", to: "evm" },
    { from: "walletconnect", to: "tron" },
    { from: "solana", to: "api" },
    { from: "evm", to: "api" },
    { from: "tron", to: "api" },
    { from: "kyc", to: "api", label: "verified" },
    { from: "api", to: "txservice" },
    { from: "api", to: "referral" },
    { from: "txservice", to: "lock", label: "acquire" },
    { from: "txservice", to: "postgres", label: "ACID" },
    { from: "referral", to: "postgres" },
    { from: "postgres", to: "bullmq" },
    { from: "bullmq", to: "socket" },
    { from: "socket", to: "ui", variant: "realtime", label: "live balance" },
  ],
  note: "The slow, failure-prone part — waiting on a chain — happens in a background job. The request path stays fast, and the client finds out over a socket when the money actually lands.",
};

export const systemFlow: FlowSpec = {
  id: "system-architecture",
  title: "The shape most of my systems take",
  subtitle:
    "A generalised view of how the pieces fit together. Select a component to see the job it does.",
  layers: [
    {
      id: "client",
      caption: "Client",
      nodes: [
        {
          id: "client",
          label: "Browser",
          sub: "React",
          kind: "client",
          detail:
            "Holds as little state as it can get away with. Anything the server already knows stays on the server.",
        },
      ],
    },
    {
      id: "render",
      caption: "Rendering",
      nodes: [
        {
          id: "next",
          label: "Next.js",
          sub: "App Router · RSC",
          kind: "client",
          detail:
            "Server Components by default. Client Components only where state, events or browser APIs are genuinely needed — which is how this portfolio is built, too.",
        },
      ],
    },
    {
      id: "api",
      caption: "API",
      nodes: [
        {
          id: "nest",
          label: "NestJS",
          sub: "Domain modules",
          kind: "service",
          detail:
            "One module per domain, each owning its own contracts. Request handlers stay thin; anything slow gets enqueued rather than awaited.",
        },
      ],
    },
    {
      id: "state",
      caption: "State",
      nodes: [
        {
          id: "postgres",
          label: "PostgreSQL",
          sub: "Source of truth",
          kind: "db",
          detail:
            "Relational state with real constraints and explicit transaction boundaries, accessed through Prisma.",
        },
        {
          id: "redis",
          label: "Redis",
          sub: "Cache · locks · idempotency",
          kind: "cache",
          detail:
            "Three distinct jobs: caching hot reads, distributed locks that serialise conflicting writes, and SET-NX idempotency keys that make retries safe.",
        },
        {
          id: "clickhouse",
          label: "ClickHouse",
          sub: "Analytical workloads",
          kind: "analytics",
          detail:
            "Columnar store for event and analytical queries, kept separate so large scans never degrade transactional performance.",
        },
        {
          id: "rabbit",
          label: "RabbitMQ",
          sub: "Message transport",
          kind: "queue",
          detail:
            "Durable transport between producers and consumers. Services stay independently deployable because they communicate through messages, not direct calls.",
        },
      ],
    },
    {
      id: "work",
      caption: "Async work",
      nodes: [
        {
          id: "bullmq",
          label: "BullMQ",
          sub: "Job orchestration",
          kind: "queue",
          detail:
            "Scheduled, retryable background jobs with backoff. Everything that can fail or take unbounded time lives here instead of in a request.",
        },
      ],
    },
    {
      id: "external",
      caption: "Outbound",
      nodes: [
        {
          id: "jobs",
          label: "External Services",
          sub: "Chains · webhooks · mail",
          kind: "external",
          detail:
            "Blockchains, webhook receivers and third-party APIs — all treated as systems that will eventually be slow or down, and retried accordingly.",
        },
      ],
    },
    {
      id: "push",
      caption: "Push",
      nodes: [
        {
          id: "socket",
          label: "Socket.io",
          sub: "Bidirectional",
          kind: "service",
          detail:
            "Real-time sync where the client also sends — live balances, live status.",
        },
        {
          id: "sse",
          label: "SSE",
          sub: "Server push",
          kind: "service",
          detail:
            "One-way server-to-client streams where a full duplex connection would be more machinery than the problem needs.",
        },
      ],
    },
    {
      id: "infra",
      caption: "Runtime",
      nodes: [
        {
          id: "docker",
          label: "Docker",
          sub: "Containerised services",
          kind: "infra",
          detail:
            "Every service containerised so the environment that runs locally is the environment that deploys.",
        },
      ],
    },
  ],
  edges: [
    { from: "client", to: "next" },
    { from: "next", to: "nest" },
    { from: "nest", to: "postgres" },
    { from: "nest", to: "redis" },
    { from: "nest", to: "clickhouse" },
    { from: "nest", to: "rabbit" },
    { from: "rabbit", to: "bullmq" },
    { from: "bullmq", to: "jobs" },
    { from: "bullmq", to: "socket" },
    { from: "nest", to: "sse" },
    { from: "socket", to: "client", variant: "realtime" },
    { from: "sse", to: "client", variant: "realtime" },
    { from: "jobs", to: "docker" },
  ],
  note: "The recurring principle: keep the request path fast and deterministic, move anything slow or failure-prone into a queue, and make every retry safe to repeat.",
};

export const aiFlow: FlowSpec = {
  id: "ai-pipeline",
  title: "The AI stack as I use it",
  subtitle:
    "Solid nodes are shipped in production. Outlined nodes are toolkit I build with, not production claims.",
  layers: [
    {
      id: "model",
      caption: "Model",
      nodes: [
        {
          id: "llm",
          label: "LLM",
          sub: "Gemini · OpenAI",
          kind: "ai",
          maturity: "production",
          detail:
            "Google Gemini is integrated in the iGaming CRM in production. The OpenAI API is part of the same working toolkit. A model is a component with latency and failure modes, not a feature by itself.",
        },
      ],
    },
    {
      id: "prompt",
      caption: "Control",
      nodes: [
        {
          id: "prompt",
          label: "Prompt Engineering",
          sub: "Schema-constrained output",
          kind: "ai",
          maturity: "production",
          detail:
            "The practical half of LLM work: constraining output so the application can parse and trust it, and handling the case where the model returns something unusable.",
        },
      ],
    },
    {
      id: "retrieval",
      caption: "Grounding",
      nodes: [
        {
          id: "rag",
          label: "RAG",
          sub: "Retrieval-augmented generation",
          kind: "ai",
          maturity: "toolkit",
          detail:
            "Grounding answers in retrieved source material rather than model memory, so output can be traced back to a document.",
        },
        {
          id: "vector",
          label: "Vector DB",
          sub: "Embeddings · similarity",
          kind: "ai",
          maturity: "toolkit",
          detail:
            "Embedding storage and nearest-neighbour search — the retrieval half of RAG.",
        },
      ],
    },
    {
      id: "agents",
      caption: "Action",
      nodes: [
        {
          id: "agents",
          label: "AI Agents",
          sub: "Tool-calling loops",
          kind: "ai",
          maturity: "toolkit",
          detail:
            "Loops where the model selects and calls tools to accomplish a task, instead of returning a single answer.",
        },
        {
          id: "mcp",
          label: "Tools / MCP",
          sub: "Model Context Protocol",
          kind: "ai",
          maturity: "toolkit",
          detail:
            "Standardised tool interfaces, so capabilities are defined once and reused across agents rather than hand-wired per integration.",
        },
        {
          id: "langchain",
          label: "LangChain",
          sub: "Orchestration",
          kind: "ai",
          maturity: "toolkit",
          detail:
            "Framework for composing chained and tool-using LLM calls.",
        },
      ],
    },
    {
      id: "boundary",
      caption: "Boundary",
      nodes: [
        {
          id: "boundary",
          label: "Determinism Boundary",
          sub: "Non-negotiable",
          kind: "service",
          maturity: "production",
          detail:
            "The line the model does not cross. In the CRM platform, Gemini writes campaign copy; segment evaluation, A/B assignment, risk flagging and dispatch stay deterministic. Generated language is a product feature. Generated decisions are a liability.",
        },
      ],
    },
    {
      id: "app",
      caption: "Product",
      nodes: [
        {
          id: "app",
          label: "Production Application",
          sub: "NestJS · Next.js",
          kind: "service",
          maturity: "production",
          detail:
            "The model output lands in a normal application with validation, error handling and fallbacks — the same engineering standard as any other external dependency.",
        },
      ],
    },
  ],
  edges: [
    { from: "llm", to: "prompt" },
    { from: "prompt", to: "rag" },
    { from: "prompt", to: "vector" },
    { from: "rag", to: "agents" },
    { from: "vector", to: "agents" },
    { from: "rag", to: "langchain" },
    { from: "agents", to: "mcp" },
    { from: "agents", to: "boundary" },
    { from: "mcp", to: "boundary" },
    { from: "langchain", to: "boundary" },
    { from: "boundary", to: "app" },
  ],
  note: "I am interested in building AI-native applications, not in bolting a chat box onto a product. The interesting engineering is everything around the model call — grounding, constraint, failure handling, and knowing which decisions a model must never make.",
};
