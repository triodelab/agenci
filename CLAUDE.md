# CLAUDE.md

This file provides guidance to Claude Code when working with the Agenci codebase.

---

# Project Overview

Agenci is a Norwegian-language AI customer support platform.

Organizations embed a chat widget on their website. The widget connects to an AI support agent backed by a RAG knowledge base.

The platform includes:

* AI-powered customer support agents
* Knowledge base management
* Website crawling and ingestion
* File uploads
* Conversation management
* Billing and subscriptions
* Multi-tenant organization support

---

# Tech Stack

Frontend:

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS v4
* shadcn/ui
* Clerk Authentication

Backend:

* Convex
* Convex Agent
* Convex RAG
* Convex Workflow
* OpenAI GPT-4o-mini

Infrastructure:

* Turborepo
* pnpm workspace
* AWS Secrets Manager
* Stripe

Language:

* Norwegian (Bokmål)

---

# Monorepo Structure

apps/web

* Dashboard application

apps/widget

* Customer-facing chat widget

apps/embed

* Embeddable script loader

packages/backend

* Convex backend

packages/ui

* Shared UI components

packages/math

* Shared utilities

---

# Development Principles

Always:

* Follow existing project architecture
* Reuse existing patterns before introducing new ones
* Keep solutions simple
* Prefer incremental changes
* Maintain strict TypeScript compatibility
* Keep UI text in Norwegian unless explicitly requested otherwise
* Preserve existing coding conventions

Never:

* Introduce new dependencies unless necessary
* Perform large refactors without approval
* Change database schemas without approval
* Change authentication logic without approval
* Change billing logic without approval

---

# Cost Optimization Rules

IMPORTANT:

The repository is large.

Do NOT scan the entire repository unless explicitly requested.

Always minimize token usage.

Before reading files:

1. Identify the smallest possible set of files required.
2. Read only directly relevant files.
3. Avoid recursive exploration.
4. Avoid project-wide searches unless necessary.

When solving issues:

* Start with the file explicitly mentioned by the user.
* Read neighboring files only if required.
* Do not inspect unrelated folders.

Avoid commands and behaviors that result in large-scale repository analysis.

Examples of what NOT to do:

* Analyze the entire codebase
* Review the whole architecture
* Find all bugs in the project
* Scan every component
* Read all Convex functions

Examples of preferred behavior:

* Fix a specific component
* Fix a specific TypeScript error
* Update a single feature
* Review only relevant files

---

# Debugging Strategy

When debugging:

1. Read the failing file first.
2. Identify imports and dependencies.
3. Read only directly connected files.
4. Stop exploring once sufficient context is found.
5. Propose the smallest safe fix.

Never perform broad exploratory debugging without a clear reason.

---

# Context Handling

Prefer focused context over large context.

Only use 1M context mode when:

* explicitly requested
* performing architecture reviews
* performing large migrations
* analyzing multiple subsystems

For normal development tasks:

* Use standard Sonnet mode
* Keep context focused
* Avoid unnecessary file reads

---

# Convex Rules

Authentication:

* Use getOrgIdOrNull(ctx)
* Dashboard routes require Clerk auth
* Widget routes use anonymous contact sessions

Knowledge Base:

* Namespace format: ${orgId}:${agentId}
* Use existing ingestion pipeline
* Preserve deduplication behavior

AI Agent:

* Norwegian system prompts
* Use existing search tools
* Preserve escalation flows

---

# Output Expectations

When making changes:

* Explain what changed
* Explain why
* Keep edits minimal
* Avoid unrelated modifications

When uncertain:

* Ask before making architectural decisions
* Ask before changing database structures
* Ask before changing billing or auth systems

Optimize for correctness, maintainability, and minimal token usage.
