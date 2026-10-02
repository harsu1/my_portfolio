/**
 * Content source of truth.
 *
 * Every string here traces back to the CV or stated profile. Nothing is
 * embellished: where the profile does not establish production use of a
 * technology, `maturity` is "toolkit" rather than "production", and the UI
 * renders that distinction explicitly instead of flattening everything into
 * one wall of logos.
 */

export type Maturity = "production" | "toolkit";

export interface Tech {
  name: string;
  /** What this is actually used for — the engineering substance behind the logo. */
  note: string;
  maturity: Maturity;
}

export interface StackGroup {
  index: string;
  id: string;
  title: string;
  /** One line on how this layer fits into the way the work gets built. */
  premise: string;
  items: Tech[];
}

export const stackGroups: StackGroup[] = [
  {
    index: "01",
    id: "product",
    title: "Product",
    premise:
      "The surface users touch. Server-rendered by default, interactive only where interactivity earns its weight.",
    items: [
      {
        name: "Next.js",
        note: "App Router interfaces for wallet, CRM and gaming surfaces.",
        maturity: "production",
      },
      {
        name: "React",
        note: "Component model behind reusable UI systems and dynamic condition builders.",
        maturity: "production",
      },
      {
        name: "TypeScript",
        note: "One type language from database row to rendered component.",
        maturity: "production",
      },
      {
        name: "TanStack Query",
        note: "Server-state caching, invalidation and request de-duplication.",
        maturity: "production",
      },
      {
        name: "Tailwind CSS",
        note: "Design tokens as constraints — consistent spacing and colour without a CSS graveyard.",
        maturity: "production",
      },
      {
        name: "Material UI",
        note: "Component base for dense admin and operator tooling.",
        maturity: "production",
      },
    ],
  },
  {
    index: "02",
    id: "backend",
    title: "Backend",
    premise:
      "Module-per-domain services with explicit transaction boundaries, not a folder of route handlers.",
    items: [
      {
        name: "NestJS",
        note: "Wallet, settlement and wagering services split by domain module.",
        maturity: "production",
      },
      {
        name: "Node.js",
        note: "Runtime for every service I ship.",
        maturity: "production",
      },
      {
        name: "Express.js",
        note: "REST APIs across earlier full-stack products.",
        maturity: "production",
      },
      {
        name: "Prisma",
        note: "Typed data access with ACID-compliant transaction boundaries.",
        maturity: "production",
      },
      {
        name: "REST",
        note: "Primary contract between services and clients.",
        maturity: "production",
      },
      {
        name: "JWT + RBAC",
        note: "Token auth with role-based access control on protected routes.",
        maturity: "production",
      },
    ],
  },
  {
    index: "03",
    id: "distributed",
    title: "Distributed Systems",
    premise:
      "Work that must not be lost, duplicated, or block a request. Queues, locks and idempotency keys.",
    items: [
      {
        name: "Redis",
        note: "Caching, distributed locking, and SET-NX idempotency keys on event ingestion.",
        maturity: "production",
      },
      {
        name: "BullMQ",
        note: "Asynchronous job orchestration and customer-journey workflow execution.",
        maturity: "production",
      },
      {
        name: "RabbitMQ",
        note: "Durable message transport decoupling ingestion from processing.",
        maturity: "production",
      },
      {
        name: "Socket.io",
        note: "Real-time balance and transaction sync to connected clients.",
        maturity: "production",
      },
      {
        name: "Server-Sent Events",
        note: "One-way server push where a full duplex socket would be overkill.",
        maturity: "production",
      },
      {
        name: "Event-driven architecture",
        note: "Producers emit, consumers decide — services stay independently deployable.",
        maturity: "production",
      },
    ],
  },
  {
    index: "04",
    id: "data",
    title: "Data",
    premise:
      "Different shapes of load want different engines. Ledgers are not analytics.",
    items: [
      {
        name: "PostgreSQL",
        note: "Transaction ledgers optimised for high-concurrency writes.",
        maturity: "production",
      },
      {
        name: "ClickHouse",
        note: "Columnar store for high-throughput analytical and event workloads.",
        maturity: "production",
      },
      {
        name: "MongoDB",
        note: "Document storage across earlier full-stack applications.",
        maturity: "production",
      },
      {
        name: "Redis",
        note: "Hot path reads and short-lived coordination state.",
        maturity: "production",
      },
    ],
  },
  {
    index: "05",
    id: "ai",
    title: "AI",
    premise:
      "Models generate language. They do not get to decide business outcomes.",
    items: [
      {
        name: "Google Gemini",
        note: "Shipped in an iGaming CRM platform to generate campaign copy and executive narration.",
        maturity: "production",
      },
      {
        name: "Prompt engineering",
        note: "Constraining model output to a schema the application can trust.",
        maturity: "production",
      },
      {
        name: "OpenAI API",
        note: "Part of my working toolkit for LLM application development.",
        maturity: "toolkit",
      },
      {
        name: "LangChain",
        note: "Orchestration framework for chained and tool-using LLM calls.",
        maturity: "toolkit",
      },
      {
        name: "RAG",
        note: "Grounding model answers in retrieved source documents.",
        maturity: "toolkit",
      },
      {
        name: "AI agents",
        note: "Tool-calling loops that act rather than just answer.",
        maturity: "toolkit",
      },
      {
        name: "Vector databases",
        note: "Embedding storage and similarity search for retrieval.",
        maturity: "toolkit",
      },
      {
        name: "MCP",
        note: "Model Context Protocol — standardised tool interfaces for agents.",
        maturity: "toolkit",
      },
    ],
  },
  {
    index: "06",
    id: "web3",
    title: "Web3",
    premise:
      "Multi-chain wallets behind one application interface, with the chain treated as an external system that can fail.",
    items: [
      {
        name: "Solana",
        note: "Wallet integration for deposits and withdrawals.",
        maturity: "production",
      },
      {
        name: "EVM",
        note: "EVM-chain wallet integration alongside Solana.",
        maturity: "production",
      },
      {
        name: "Tron",
        note: "Third chain in the multi-chain wallet integration.",
        maturity: "production",
      },
      {
        name: "Web3Auth",
        note: "Wallet onboarding without forcing users through seed-phrase setup.",
        maturity: "production",
      },
      {
        name: "WalletConnect (Reown)",
        note: "Connecting existing user wallets to the application.",
        maturity: "production",
      },
    ],
  },
  {
    index: "07",
    id: "infrastructure",
    title: "Infrastructure",
    premise: "Reproducible environments and boring, debuggable deploys.",
    items: [
      {
        name: "Docker",
        note: "Containerised services so local matches deployed.",
        maturity: "production",
      },
      {
        name: "AWS S3",
        note: "Object storage for user and application assets.",
        maturity: "production",
      },
      {
        name: "AWS EC2",
        note: "Compute for deployed services.",
        maturity: "production",
      },
      {
        name: "Git",
        note: "Version control and review workflow.",
        maturity: "production",
      },
      {
        name: "GraphQL",
        note: "Alternative query contract in my working toolkit.",
        maturity: "toolkit",
      },
    ],
  },
];

export interface Role {
  company: string;
  title: string;
  start: string;
  end: string;
  period: string;
  location: string;
  current: boolean;
  /** The shift this role represented in how I build. */
  shift: string;
  highlights: string[];
  stack: string[];
}

export const roles: Role[] = [
  {
    company: "SDLC Corp Pvt Ltd",
    title: "Full Stack Engineer",
    start: "2025-07",
    end: "Present",
    period: "July 2025 — Present",
    location: "Noida, India",
    current: true,
    shift: "Distributed systems, multi-chain wallets and LLM integration",
    highlights: [
      "Built responsive Next.js applications across wallet, CRM and gaming interfaces using React, TypeScript and Tailwind CSS.",
      "Integrated APIs with TanStack Query, including caching and invalidation strategy.",
      "Engineered scalable NestJS backend services with Prisma ORM, PostgreSQL, ClickHouse, Redis and BullMQ for wallet management, settlements and wagering.",
      "Designed asynchronous workflows using BullMQ and Redis distributed locking.",
      "Enabled real-time synchronisation using Socket.io and Server-Sent Events.",
      "Integrated multi-chain blockchain wallets across Solana, EVM and Tron using Web3Auth and WalletConnect.",
      "Built iGaming back-office capability end to end: KYC verification, referral programs, operator analytics and trust & safety risk flagging.",
      "Containerised services with Docker.",
    ],
    stack: [
      "Next.js",
      "NestJS",
      "PostgreSQL",
      "ClickHouse",
      "Redis",
      "BullMQ",
      "Socket.io",
      "Web3Auth",
      "Docker",
    ],
  },
  {
    company: "Smartest Software Solutions LLP",
    title: "Software Developer",
    start: "2023-06",
    end: "2025-06",
    period: "June 2023 — June 2025",
    location: "Noida, India",
    current: false,
    shift: "MERN foundations, API security and database performance",
    highlights: [
      "Developed responsive full-stack applications using Node.js, Express.js, React.js and MongoDB.",
      "Integrated payment gateways, SendGrid and AWS S3.",
      "Implemented secure REST APIs with JWT authentication and role-based access control.",
      "Optimised PostgreSQL and MongoDB performance, reducing average response latency by 20%.",
    ],
    stack: [
      "React.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "PostgreSQL",
      "AWS S3",
      "JWT",
    ],
  },
];

/** The technical arc, as distinct from the employment history. */
export interface EvolutionStage {
  year: string;
  label: string;
  detail: string;
}

export const evolution: EvolutionStage[] = [
  {
    year: "2023",
    label: "MERN & full stack foundations",
    detail:
      "React, Node, Express and MongoDB. Shipping complete features end to end, and learning where naive queries fall over.",
  },
  {
    year: "2024",
    label: "API security & database performance",
    detail:
      "JWT auth and role-based access control, then measuring and tuning PostgreSQL and MongoDB — 20% off average response latency.",
  },
  {
    year: "2025",
    label: "NestJS, PostgreSQL & distributed systems",
    detail:
      "Domain-module services, ACID transaction boundaries, and work moved off the request path into Redis, BullMQ and RabbitMQ.",
  },
  {
    year: "2025",
    label: "Real-time & multi-chain Web3",
    detail:
      "Socket.io and SSE for live state, plus Solana, EVM and Tron wallets behind one interface via Web3Auth and WalletConnect.",
  },
  {
    year: "2026",
    label: "AI-native full stack engineering",
    detail:
      "Gemini shipped inside a production CRM platform with a hard boundary between generated language and deterministic business logic. Current focus.",
  },
];

export const education = {
  degree: "B.Tech in Computer Science",
  institution: "AKTU",
};

export const languages = ["English", "Hindi"];

/**
 * Only figures the profile actually establishes. No invented uptime,
 * throughput or user-count numbers.
 */
export const facts = [
  { value: 3, suffix: "+", label: "Years building for production" },
  { value: 2, suffix: "", label: "Platforms engineered end to end" },
  { value: 20, suffix: "%", label: "Response latency removed by query tuning" },
  { value: 3, suffix: "", label: "Blockchains behind one wallet interface" },
];

export const positioning = {
  headline:
    "Full Stack Engineer building scalable transactional systems, AI-powered applications, real-time architectures and blockchain integrations.",
  short: "Full Stack Engineer • AI • Distributed Systems • Web3",
  about: [
    "I work on the parts of a product that are hard to take back: money movement, event pipelines, and state that several services disagree about.",
    "Most of that work is unglamorous on purpose — idempotency keys so a retried webhook does not double-credit a wallet, distributed locks so two workers do not settle the same bet, a columnar store so analytics stop competing with the ledger for I/O.",
    "Lately that has extended to putting an LLM inside a production system without letting it near the decisions that have to be correct every time.",
  ],
};
