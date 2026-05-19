# GitHub Import Review Design

## Goal

Add a review-first GitHub import flow to the portfolio admin. The owner can paste a GitHub profile or repository URL, fetch structured candidates from GitHub, review and customize them in `/admin`, then save the approved changes through the existing draft branch and pull request workflow.

## Product Behavior

The import flow never publishes fetched GitHub data directly. Imported data appears as candidates inside the admin screen. The owner can inspect each candidate, apply it to Projects, Skills, or Starred Repositories, then edit the normal portfolio fields before saving.

The first implementation supports:

- Repository URL import for one project candidate.
- Profile URL or username import for multiple candidates from public repositories, languages, topics, and starred repositories.
- Manual approval for each candidate.
- Local demo behavior in `/admin?demo=1` using deterministic sample candidates when server auth is unavailable.

## Architecture

### Cloudflare Pages Functions

Add `functions/api/github/import.js`.

The function requires an authenticated admin session in production. It accepts:

```json
{
  "source": "https://github.com/NAMUORI00",
  "mode": "profile"
}
```

or:

```json
{
  "source": "https://github.com/NAMUORI00/aerospace-rag",
  "mode": "repo"
}
```

The function uses the existing GitHub App installation token helper in `functions/_utils/github.js`. It fetches only GitHub API data needed for portfolio candidates:

- Repository metadata: name, owner, description, homepage, topics, language, stars, updated date, visibility.
- Languages: top language names for skill suggestions.
- README: optional body seed, capped and summarized by extraction rules, not by an LLM.
- Starred repositories for profile mode.

The response shape is a neutral candidate payload:

```ts
interface GitHubImportResponse {
  source: string;
  owner: string;
  projects: ProjectEntry[];
  skills: SkillGroup[];
  starred: StarredRepo[];
  warnings: string[];
}
```

### Client Admin

Add import state to `client/src/pages/Admin.tsx`:

- source input
- mode selector: `profile` or `repo`
- loading/error/status
- candidate lists for projects, skills, starred repositories

The import panel appears near the top of Projects, Skills, and Starred sections. Applying a candidate only updates local React state:

- Project candidate: append or replace matching slug.
- Skill candidate: merge into a `GitHub inferred` group, deduping case-insensitively.
- Starred candidate: append missing repositories by `owner/name`.

The existing Save draft and Publish PR buttons remain the only persistence path.

## Candidate Mapping

### Project Candidate

GitHub repository data maps to:

- `slug`: repository name normalized through the existing unique slug helper.
- `name`: repository name.
- `period`: `YYYY.MM` from `created_at` or `updated_at` when available.
- `desc`: GitHub description or a fallback Korean sentence indicating that the description should be refined.
- `metric`: stars, forks, language, or update signal in one compact sentence.
- `tags`: topics plus top languages, capped to six.
- `link`: repository HTML URL.
- `highlight`: false by default.
- `private`: true when visibility is private.
- `status`: draft by default.
- `body`: generated Markdown seed with GitHub URL, description, topics, and README excerpt.
- `relatedNotes`: empty.

### Skills Candidate

Language names and topics become skill suggestions. Known GitHub language labels are grouped into broad labels:

- `Language`
- `Frontend`
- `Backend`
- `AI / Data`
- `Infra`
- `Tools`

Unknown items go to `GitHub inferred`.

### Starred Candidate

Starred repos map to the current `StarredRepo` model:

- `name`: `owner/repo`
- `stars`: compact formatted star count
- `desc`: description or fallback

## Error Handling

- Invalid URL or unsupported source returns `400`.
- Unauthenticated admin returns `401`.
- Non-admin session returns `403`.
- GitHub rate limit or API failure returns a user-readable warning when partial data is available, otherwise an error.
- Empty profile data is not an error; it returns an empty candidate list with a warning.

## Testing

Add unit tests for:

- GitHub URL parsing.
- Candidate mapping from GitHub API fixtures.
- Skill deduplication and grouping.
- Admin apply helpers merging candidates into local content.

Run existing verification:

- `pnpm check`
- `pnpm test`
- `pnpm build`

Manual verification uses the in-app browser only:

- `/admin?demo=1` import panel renders.
- Demo candidate can be applied to Projects, Skills, and Starred.
- Existing Save draft behavior still uses the existing branch/PR flow.

## Non-Goals

- No automatic production publishing from GitHub.
- No scheduled sync in this first step.
- No LLM-generated copy in the first step.
- No destructive overwrite of existing customized portfolio content.
