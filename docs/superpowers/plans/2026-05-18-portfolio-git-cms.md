# Portfolio Git-backed CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Git-backed portfolio CMS from the extracted Vite/React portfolio and make it ready for GitHub + Cloudflare Pages deployment.

**Architecture:** The public site reads typed files from root `content/` and renders the existing portfolio layout, notes, and detail routes. `/admin` is a same-origin React editor that validates content, builds JSON/MDX files, and calls Pages Functions. Pages Functions provide GitHub App user auth, session cookies, draft branch saves, and pull request publishing.

**Tech Stack:** Vite, React 19, TypeScript, Wouter, Zod, Vitest, Cloudflare Pages Functions, GitHub REST API, gh CLI, Cloudflare Pages Git integration.

---

## File Structure

- Create `content/*.json`, `content/projects/*.mdx`, `content/research/*.mdx`, `content/notes/*.mdx`: editable source content.
- Create `client/src/content/types.ts`: shared content types.
- Create `client/src/content/schema.ts`: Zod schemas and validation helpers.
- Create `client/src/content/markdown.ts`: frontmatter and lightweight Markdown rendering helpers.
- Create `client/src/content/index.ts`: imports root content files and exports `portfolioContent`.
- Create `client/src/pages/Notes.tsx`, `client/src/pages/NoteDetail.tsx`, `client/src/pages/ProjectDetail.tsx`, `client/src/pages/ResearchDetail.tsx`: public routes.
- Create `client/src/pages/Admin.tsx`: same-origin editor shell and forms.
- Modify `client/src/pages/Home.tsx`: use imported content data and contrast-safe theme tokens.
- Modify `client/src/App.tsx`: add public and admin routes.
- Modify `client/src/index.css` and `client/index.html`: Nanum Gothic font stack and accessible theme defaults.
- Create `functions/_utils/*.js` and `functions/api/**/*.js`: Pages Functions auth/session/GitHub API.
- Create `client/src/content/*.test.ts` and `client/src/lib/*.test.ts`: validation and helper tests.
- Modify `package.json`, `tsconfig.json`, `vite.config.ts`: test script, JSON imports, content alias, Cloudflare build shape.

## Tasks

### Task 1: Content Source And Validation

**Files:**
- Create: `content/site.json`
- Create: `content/profile.json`
- Create: `content/education.json`
- Create: `content/skills.json`
- Create: `content/starred.json`
- Create: `content/projects/*.mdx`
- Create: `content/research/*.mdx`
- Create: `content/notes/*.mdx`
- Create: `client/src/content/types.ts`
- Create: `client/src/content/schema.ts`
- Create: `client/src/content/markdown.ts`
- Create: `client/src/content/index.ts`
- Create: `client/src/vite-env.d.ts`
- Test: `client/src/content/schema.test.ts`
- Test: `client/src/content/markdown.test.ts`

- [ ] **Step 1: Write content helper tests**

Create tests proving frontmatter parsing, branch-name generation inputs, and content schema validation.

Run: `pnpm test -- client/src/content/schema.test.ts client/src/content/markdown.test.ts`
Expected before implementation: FAIL because modules do not exist.

- [ ] **Step 2: Add root content files**

Move the existing `Home.tsx` arrays into root JSON/MDX files. Use published statuses for visible entries and include one example note linked to `aerospace-rag` and `rag`.

- [ ] **Step 3: Add schema and parsing implementation**

Define strict Zod schemas for profile, education, research, project, skill groups, starred repositories, and notes. Add `parseFrontmatter`, `toMarkdownHtml`, `serializeFrontmatter`, and `validatePortfolioContent`.

- [ ] **Step 4: Add content import index**

Import JSON and `?raw` MDX files from root `content/`, parse them, and export `portfolioContent`.

- [ ] **Step 5: Verify tests pass**

Run: `pnpm test -- client/src/content/schema.test.ts client/src/content/markdown.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add content client/src/content client/src/vite-env.d.ts package.json tsconfig.json vite.config.ts
git commit -m "feat: add typed portfolio content source"
```

### Task 2: Public Routes And Theme

**Files:**
- Modify: `client/src/pages/Home.tsx`
- Modify: `client/src/App.tsx`
- Modify: `client/src/index.css`
- Modify: `client/index.html`
- Create: `client/src/pages/Notes.tsx`
- Create: `client/src/pages/NoteDetail.tsx`
- Create: `client/src/pages/ProjectDetail.tsx`
- Create: `client/src/pages/ResearchDetail.tsx`
- Test: `client/src/content/theme.test.ts`

- [ ] **Step 1: Write theme contrast tests**

Create tests that check selected light/dark token pairs exceed the minimum readable contrast ratio.

- [ ] **Step 2: Replace hardcoded content in `Home.tsx`**

Import `portfolioContent` and derive `IMG`, navigation, education, research, projects, skills, and starred repositories from content files.

- [ ] **Step 3: Add notes and detail routes**

Add `/notes`, `/notes/:slug`, `/projects/:slug`, and `/research/:slug` routes using the same color and typography system.

- [ ] **Step 4: Apply Nanum Gothic and 6:3:1 tokens**

Load Nanum Gothic in `client/index.html`; update `client/src/index.css` and `Home.tsx` theme constants so body, captions, buttons, tags, and sidebars remain readable in both themes.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm test -- client/src/content/theme.test.ts
pnpm check
pnpm build
```

Expected: all commands pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add client/src/pages client/src/App.tsx client/src/index.css client/index.html client/src/content/theme.test.ts
git commit -m "feat: render portfolio from content files"
```

### Task 3: Admin Editor

**Files:**
- Create: `client/src/pages/Admin.tsx`
- Create: `client/src/lib/adminContent.ts`
- Modify: `client/src/App.tsx`
- Test: `client/src/lib/adminContent.test.ts`

- [ ] **Step 1: Write admin serialization tests**

Test that edited project/note/research state serializes to the expected JSON/MDX files and draft branch names.

- [ ] **Step 2: Implement admin content helpers**

Add `buildSavePayload`, `projectBranchName`, `researchBranchName`, `noteBranchName`, `serializeProject`, `serializeResearch`, and `serializeNote`.

- [ ] **Step 3: Implement `/admin` UI**

Build an authenticated admin shell with sections for Profile, Timeline, Research, Projects, Skills, Starred, and Notes. Provide WYSIWYG, Markdown source, and Preview modes for long-form content.

- [ ] **Step 4: Wire save and publish actions**

Call `/api/github/save` for `Save draft` and `/api/github/publish` for `Publish`, preserving unsaved state on errors.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm test -- client/src/lib/adminContent.test.ts
pnpm check
pnpm build
```

Expected: all commands pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add client/src/pages/Admin.tsx client/src/lib/adminContent.ts client/src/lib/adminContent.test.ts client/src/App.tsx
git commit -m "feat: add git-backed admin editor"
```

### Task 4: Cloudflare Pages Functions

**Files:**
- Create: `functions/_utils/cookies.js`
- Create: `functions/_utils/github.js`
- Create: `functions/_utils/session.js`
- Create: `functions/api/auth/login.js`
- Create: `functions/api/auth/callback.js`
- Create: `functions/api/auth/logout.js`
- Create: `functions/api/auth/session.js`
- Create: `functions/api/github/save.js`
- Create: `functions/api/github/publish.js`
- Create: `functions/api/github/status.js`

- [ ] **Step 1: Implement signed sessions**

Use `SESSION_SECRET` with HMAC SHA-256 and HttpOnly/Secure/SameSite cookies. Store only login and expiration in the cookie.

- [ ] **Step 2: Implement GitHub login callback**

Redirect through GitHub user authorization, exchange code for a user token, fetch `/user`, validate `ADMIN_GITHUB_USERS`, then set a session cookie.

- [ ] **Step 3: Implement GitHub App installation token helper**

Create a signed app JWT from `GITHUB_APP_PRIVATE_KEY`, exchange it for an installation token using `GITHUB_APP_INSTALLATION_ID`, and use it for repository operations.

- [ ] **Step 4: Implement save/publish endpoints**

`save` validates session, ensures the draft branch, writes each file through the contents API, and returns branch plus commit metadata. `publish` validates session and creates or updates a PR from the branch to `main`.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm check
pnpm build
```

Expected: both commands pass. Pages Functions are validated by syntax and manual deployment QA because Cloudflare runtime credentials are environment-specific.

- [ ] **Step 6: Commit**

Run:

```bash
git add functions
git commit -m "feat: add Cloudflare GitHub API functions"
```

### Task 5: Local QA And Deployment Prep

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-05-18-portfolio-git-cms-design.md` if implementation clarifies setup details.

- [ ] **Step 1: Add setup documentation**

Document local commands, GitHub App settings, Cloudflare Pages build settings, and required environment variables.

- [ ] **Step 2: Run full verification**

Run:

```bash
pnpm install
pnpm test
pnpm check
pnpm build
```

Expected: all commands pass.

- [ ] **Step 3: Browser QA**

Start the app with `pnpm dev`, open localhost in the in-app browser, and check homepage, notes, admin, light mode, dark mode, desktop, and mobile width.

- [ ] **Step 4: GitHub repo**

Use `gh repo view NAMUORI00/namuori-portfolio-cms`. If missing, create `NAMUORI00/namuori-portfolio-cms`, add it as `origin`, and push `main`.

- [ ] **Step 5: Cloudflare readiness**

Check Cloudflare CLI authentication. If authenticated and supported, create/connect the Pages project; otherwise document the exact Cloudflare dashboard steps and required settings.

- [ ] **Step 6: Commit docs**

Run:

```bash
git add README.md docs/superpowers/specs/2026-05-18-portfolio-git-cms-design.md
git commit -m "docs: add deployment setup guide"
```

## Self-Review

- Spec coverage: public content rendering, `/admin`, GitHub App auth, draft branches, PR publishing, Cloudflare Pages readiness, notes, related content, theme contrast, Nanum Gothic, tests, and visual QA are all mapped to tasks.
- Placeholder scan: no implementation step depends on unresolved placeholders; blocked external credentials are handled in Task 5 as explicit readiness checks.
- Type consistency: content types flow from `client/src/content/types.ts` to schemas, public pages, and admin serialization helpers.
