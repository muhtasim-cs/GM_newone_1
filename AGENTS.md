# AgriPlatform Development & Skill Orchestration Guidelines

This document governs agent behavior for the AgriPlatform codebase (`apps/web` Next.js frontend, `apps/api` NestJS backend).

---

## 🧭 Mandatory Skill Orchestration Matrix

Before writing code or executing tasks, route your process through the specialized skills according to the task phase:

| Phase | Assigned Skill / Tool | Trigger & Responsibility |
| :--- | :--- | :--- |
| **1. Memory & History** | `supermemory` | Consult project history, past architecture decisions, and developer preferences across sessions. |
| **2. Codebase Topology** | `graphify` | When exploring relationships, dependencies, cross-module flows, or database models in `apps/api` or `apps/web`. |
| **3. External Research** | `firecrawl` | When researching third-party libraries, live API documentation, or technical specs on the web. |
| **4. Requirements & Planning**| `superpowers:brainstorming`<br>`prd-creator`<br>`writing-plans` | **Mandatory before non-trivial coding**: Clarify user intent, write specifications, and break features into 2–5 minute testable micro-tasks. |
| **5. Implementation Discipline**| `superpowers:test-driven-development`<br>`systematic-debugging` | Enforce Red-Green-Refactor TDD loop. Never guess bug fixes—diagnose root causes systematically. |
| **6. Visual UI Verification** | `iris` | Whenever modifying frontend components or pages in `apps/web`, capture screenshots from `http://localhost:3000` to verify responsiveness, layout, and visual fidelity. |
| **7. Code Review & Security** | `coderabbit`<br>`vercel-react-best-practices`<br>`web-design-guidelines` | Audit git diffs for vulnerabilities, memory leaks, unnecessary re-renders, and code quality before completing tasks. |
| **8. Autonomous Loops** | `ralph-loop` | For batch or multi-task features: execute exactly **one task per iteration**, test, verify UI with Iris, commit, and advance. |

---

## 🛠️ Project Execution Standards

### Frontend (`apps/web` - Next.js)
- Server running at: `http://localhost:3000`
- Visual inspection tool: `iris http://localhost:3000 -o screenshot.png` or with `--selector`
- Adhere to `vercel-react-best-practices` (server/client component split, no unneeded re-renders, accessible HTML).

### Backend (`apps/api` - NestJS)
- Server running at: `http://localhost:3001`
- Use modular architecture (controllers, services, repositories/Prisma).
- Verify endpoints with unit and integration tests.

### Autonomous Task Execution Rule
- When executing from `.agent/tasks.json` or a multi-step plan, complete **one task per turn**, run unit tests, verify UI with `iris`, make a Conventional Commit (`feat: ...`, `fix: ...`), and report completion before moving to the next.
