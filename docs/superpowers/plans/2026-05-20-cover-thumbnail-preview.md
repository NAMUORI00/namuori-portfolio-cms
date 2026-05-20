# Cover Thumbnail Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make main-page project and research cover images compact right-side thumbnails with an intentional large preview interaction.

**Architecture:** Add a small `coverPreview` helper for localized labels, then wire `Home.tsx` to render thumbnail buttons and a single preview dialog state. CSS handles text-first grids, hover/focus emphasis, mobile stacking, and the modal overlay.

**Tech Stack:** React 19, TypeScript, Vitest, Vite, Cloudflare Pages.

---

### Task 1: Preview Label Helper

**Files:**
- Create: `client/src/lib/coverPreview.test.ts`
- Create: `client/src/lib/coverPreview.ts`

- [x] **Step 1: Write the failing test**

```ts
expect(buildCoverPreview({ locale: "ko", kind: "project", title: "Aerospace RAG", src: "/uploads/projects/rag.webp" })).toEqual({
  src: "/uploads/projects/rag.webp",
  title: "Aerospace RAG",
  alt: "Aerospace RAG 프로젝트 대표 이미지",
  actionLabel: "Aerospace RAG 이미지 크게 보기",
  dialogLabel: "Aerospace RAG 이미지 미리보기",
  closeLabel: "이미지 닫기",
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run client/src/lib/coverPreview.test.ts`
Expected: FAIL because `client/src/lib/coverPreview.ts` does not exist yet.

- [x] **Step 3: Write minimal implementation**

Create `buildCoverPreview` with `locale`, `kind`, `title`, and `src`, returning `src`, `title`, `alt`, `actionLabel`, `dialogLabel`, and `closeLabel`.

- [x] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run client/src/lib/coverPreview.test.ts`
Expected: PASS.

### Task 2: Home Thumbnail and Dialog UI

**Files:**
- Modify: `client/src/pages/Home.tsx`

- [x] **Step 1: Import the helper**

Import `buildCoverPreview` and `CoverPreviewPayload` from `@/lib/coverPreview`.

- [x] **Step 2: Add preview state**

Add `const [coverPreview, setCoverPreview] = useState<CoverPreviewPayload | null>(null);` and close on Escape while a preview is open.

- [x] **Step 3: Replace bare cover images with buttons**

Render the copy before the image. Wrap each image in a `button` that calls `setCoverPreview(buildCoverPreview(...))`.

- [x] **Step 4: Add the overlay**

Render a fixed backdrop with `role="dialog"` when `coverPreview` is set. Backdrop click, close button, and Escape close it.

- [x] **Step 5: Update CSS**

Set desktop grids to `minmax(0, 1fr) clamp(...)`, keep thumbnails compact, add hover/focus emphasis, and stack thumbnails below text on mobile.

### Task 3: Verification and Release

**Files:**
- Existing test/build configuration
- Cloudflare Pages deployment

- [x] **Step 1: Run focused and full verification**

Run: `pnpm vitest run client/src/lib/coverPreview.test.ts`, `pnpm test`, `pnpm check`, and `pnpm build`.

- [x] **Step 2: Test with the in-app browser**

Open local home/admin pages and production home/admin pages. Check console errors and visual layout.

- [ ] **Step 3: Commit, push, and deploy**

Commit with `feat: add cover thumbnail preview`, push `main`, and deploy `dist/public` to Cloudflare Pages project `namuori-portfolio-cms`.
