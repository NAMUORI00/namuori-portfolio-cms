# Mobile Contact And Knowledge Graph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore mobile contact access and render a mobile-optimized Knowledge Graph inside the main content flow.

**Architecture:** Keep the existing desktop `KnowledgeGraphRail` unchanged and hidden under the current breakpoint. Add `MobileKnowledgeGraph` as a separate compact SVG visualization that reuses `KnowledgeGraphData` and `layoutKnowledgeGraph`, then render it between Research and Projects only on narrow screens. Add the existing contact list to the mobile drawer.

**Tech Stack:** React 19, TypeScript, Vitest, Vite, Cloudflare Pages.

---

### Task 1: Regression Tests

**Files:**
- Create: `client/src/components/MobileKnowledgeGraph.test.tsx`
- Create: `client/src/pages/Home.mobile.test.ts`

- [x] **Step 1: Write failing component test**

Create a test that imports `MobileKnowledgeGraph`, renders a sample graph, and asserts:
- `id="mobile-knowledge-graph"`
- `mobile-knowledge-canvas`
- project/skill/research nodes render
- note/term nodes do not render
- no buttons/click controls render

- [x] **Step 2: Write failing Home source test**

Create a source test asserting:
- mobile drawer maps `PROFILE.contacts`
- `MobileKnowledgeGraph` is imported
- `MobileKnowledgeGraph` is rendered after the research section and before projects
- CSS hides `.mobile-knowledge-section` on desktop and shows it under the mobile breakpoint

- [x] **Step 3: Run focused tests and verify failure**

Run: `pnpm vitest run client/src/components/MobileKnowledgeGraph.test.tsx client/src/pages/Home.mobile.test.ts`
Expected: FAIL because the mobile component/import/rendering do not exist yet.

### Task 2: Mobile Contact Drawer

**Files:**
- Modify: `client/src/pages/Home.tsx`

- [x] **Step 1: Add mobile contact block**

Render `PROFILE.contacts.map(...)` in `.mobile-drawer` below nav and above `PreferenceSegmentedControl`, using existing `ContactIcon`.

- [x] **Step 2: Keep touch targets readable**

Use compact but tappable rows with icon + label, `target="_blank"` and `rel="noopener noreferrer"`.

### Task 3: Mobile Knowledge Graph

**Files:**
- Create: `client/src/components/MobileKnowledgeGraph.tsx`
- Modify: `client/src/pages/Home.tsx`

- [x] **Step 1: Create component**

Use `layoutKnowledgeGraph(graph, 320, 220)` and filter out notes/terms via existing layout behavior. Render passive SVG only.

- [x] **Step 2: Render in Home**

Place it between the Research section and Projects section. Pass `KNOWLEDGE_GRAPH`, `T`, and `active`.

- [x] **Step 3: Add responsive CSS**

Default `.mobile-knowledge-section` hidden. Under `max-width: 1180px`, show it. Under desktop, keep only the rail.

### Task 4: Verification And Release

**Files:**
- Existing tests/build/deploy configuration

- [x] **Step 1: Run verification**

Run `pnpm test`, `pnpm check`, and `pnpm build`.

- [x] **Step 2: Browser QA**

Use the in-app browser at mobile viewport to verify: mobile contact rows visible in drawer, mobile KG visible in content, desktop rail remains hidden on narrow width, no console errors.

- [ ] **Step 3: Commit, push, deploy**

Commit, push `main`, deploy `dist/public` to Cloudflare Pages project `namuori-portfolio-cms`, then verify `https://namuori.net/`.
