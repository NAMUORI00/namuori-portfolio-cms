# Namuori Portfolio CMS

GitHub draft branches and Cloudflare Pages preview deployments power this portfolio. The public site renders from `content/`, while `/admin` edits that content and publishes changes as pull requests.

## Production

- Site: `https://namuori-portfolio-cms.pages.dev/`
- Admin: `https://namuori-portfolio-cms.pages.dev/admin`
- Repository: `https://github.com/NAMUORI00/namuori-portfolio-cms`
- Cloudflare Pages project: `namuori-portfolio-cms`

## Local Development

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
pnpm install
pnpm dev
```

Open:

- Portfolio: `http://localhost:3000/`
- Notes: `http://localhost:3000/notes`
- Local admin preview: `http://localhost:3000/admin?demo=1`

Production `/admin` requires GitHub login. The local `?demo=1` mode only previews editor behavior and does not write to GitHub.

## Verification

```bash
pnpm test
pnpm check
pnpm build
```

The build output for Cloudflare Pages is `dist/public`.

## Content

Editable source files live in:

```text
content/
  site.json
  profile.json
  education.json
  research/*.mdx
  projects/*.mdx
  skills.json
  starred.json
  notes/*.mdx
```

MDX files use frontmatter plus Markdown body. The React app validates content with Zod before rendering.

## GitHub App Setup

Create a GitHub App installed on `NAMUORI00/namuori-portfolio-cms`.

Required repository permissions:

- Contents: read/write
- Pull requests: read/write

Enable user authorization for login. Set callback URL after Cloudflare deploy:

```text
https://<project>.pages.dev/api/auth/callback
```

If using a custom domain, add that callback URL too.

## Cloudflare Pages Setup

Use Cloudflare Pages Git integration.

```text
Repository: NAMUORI00/namuori-portfolio-cms
Production branch: main
Build command: pnpm build
Build output directory: dist/public
Functions directory: functions
Preview branches: draft/* and feature/*
```

Environment variables:

```text
ADMIN_GITHUB_USERS=NAMUORI00
GITHUB_APP_ID=<GitHub App ID>
GITHUB_APP_CLIENT_ID=<GitHub App client ID>
GITHUB_APP_CLIENT_SECRET=<GitHub App client secret>
GITHUB_APP_PRIVATE_KEY=<GitHub App private key, newline escaped or multiline secret>
GITHUB_APP_INSTALLATION_ID=<installation ID>
GITHUB_REPO_OWNER=NAMUORI00
GITHUB_REPO_NAME=namuori-portfolio-cms
SESSION_SECRET=<long random secret>
```

`GITHUB_APP_PRIVATE_KEY` can be the standard GitHub App RSA private key. The Pages Function accepts both `BEGIN RSA PRIVATE KEY` and `BEGIN PRIVATE KEY` formats.

## Publish Flow

1. Login to `/admin` with an allowed GitHub account.
2. Edit profile, education, research, projects, skills, starred repositories, or notes.
3. Select `Save draft` to write to a `draft/...` branch.
4. Select `Publish PR` to create or update a pull request to `main`.
5. Review the Cloudflare Pages preview URL on the pull request.
6. Merge to `main` for production deployment.
