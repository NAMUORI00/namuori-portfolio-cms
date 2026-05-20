# Avatar Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add profile avatar file upload to the admin editor while preserving URL and GitHub-default avatar flows.

**Architecture:** The admin client validates image files, converts the selected image to base64, and appends it to the existing GitHub save payload. The save API accepts either text content or base64 content and commits both `content/profile.json` and the static avatar file to the same draft branch.

**Tech Stack:** React, TypeScript, Vitest, Cloudflare Pages Functions, GitHub Contents API.

---

### Task 1: Avatar Upload Helpers

**Files:**
- Create: `client/src/lib/avatarUpload.ts`
- Test: `client/src/lib/avatarUpload.test.ts`

- [ ] Add tests for accepted formats, rejected formats, data URL parsing, repo path, and public URL.
- [ ] Implement a small helper that turns a selected avatar file descriptor plus a data URL into a GitHub save file with `encoding: "base64"`.
- [ ] Run `pnpm test client/src/lib/avatarUpload.test.ts`.

### Task 2: Binary Save API Support

**Files:**
- Modify: `functions/_utils/github.js`
- Modify: `functions/api/github/save.js`
- Test: `client/src/lib/githubFileEncoding.test.ts`

- [ ] Add tests proving text content is UTF-8 encoded and base64 content is passed through after validation.
- [ ] Extend the GitHub file helper with `encoding: "text" | "base64"`.
- [ ] Reject unknown encodings and malformed base64 payloads at the save API boundary.
- [ ] Run the focused encoding test.

### Task 3: Admin Profile UI

**Files:**
- Modify: `client/src/pages/Admin.tsx`
- Modify: `client/src/lib/adminContent.ts`
- Modify: `client/src/lib/adminContent.test.ts`

- [ ] Add `encoding?: "text" | "base64"` to `SaveFile`.
- [ ] Add profile avatar upload controls: preview, file picker, GitHub-default reset, and status text.
- [ ] Append a pending avatar file to `draft/profile` saves only after a file is selected.
- [ ] Clear the pending upload after a successful save.

### Task 4: Verification and Deploy

**Files:**
- No new source files.

- [ ] Run `pnpm test`.
- [ ] Run `pnpm check`.
- [ ] Run `pnpm build`.
- [ ] Test `/admin` in the in-app browser using local or production flow.
- [ ] Commit, push, deploy with Wrangler, and verify `https://namuori.net/admin`.
