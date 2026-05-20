# Content Cover Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional cover image upload and thumbnail rendering for Research and Projects without changing existing entries that have no image.

**Architecture:** Extend Project and Research entries with optional `coverImage`, serialize/parse it in MDX frontmatter, and reuse the existing binary GitHub save payload support for uploaded image files. The home page branches per entry: show a thumbnail when `coverImage` is present, otherwise retain the current text-first layout.

**Tech Stack:** React, TypeScript, Vitest, Cloudflare Pages Functions, GitHub Contents API.

---

### Task 1: Content Model and Serialization

**Files:**
- Modify: `client/src/content/types.ts`
- Modify: `client/src/content/schema.ts`
- Modify: `client/src/content/index.ts`
- Modify: `client/src/lib/adminContent.ts`
- Test: `client/src/content/schema.test.ts`
- Test: `client/src/lib/adminContent.test.ts`

- [ ] Add optional `coverImage?: string` to `ProjectEntry` and `ResearchEntry`.
- [ ] Parse and serialize `coverImage` in MDX frontmatter.
- [ ] Add tests proving `coverImage` is accepted and serialized only when present.

### Task 2: Upload Helper

**Files:**
- Modify: `client/src/lib/avatarUpload.ts`
- Test: `client/src/lib/avatarUpload.test.ts`

- [ ] Generalize upload path creation so content covers save to `client/public/uploads/{projects|research}/{slug}.{ext}`.
- [ ] Keep avatar upload behavior unchanged.
- [ ] Add tests for project and research cover paths and public URLs.

### Task 3: Admin UI

**Files:**
- Modify: `client/src/pages/Admin.tsx`

- [ ] Add reusable cover upload card to Projects and Research editors.
- [ ] Track pending cover uploads by `project:<slug>` or `research:<slug>`.
- [ ] Append pending cover image file to the active save payload.
- [ ] Update preview content with data URL while the image is unsaved.
- [ ] Clear pending uploads after a successful save.

### Task 4: Home Thumbnails

**Files:**
- Modify: `client/src/pages/Home.tsx`

- [ ] Render a thumbnail for Research entries with `coverImage`.
- [ ] Render a thumbnail for Project entries with `coverImage`.
- [ ] Preserve existing text layout when `coverImage` is absent.

### Task 5: Verification and Deploy

**Files:**
- No new source files.

- [ ] Run `pnpm test`.
- [ ] Run `pnpm check`.
- [ ] Run `pnpm build`.
- [ ] Verify `/admin?demo=1` and the home page in the in-app browser.
- [ ] Commit, push, deploy with Wrangler, and verify `https://namuori.net`.
