import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");

function projectsBlock() {
  const start = source.indexOf('<SectionTitle id="projects"');
  const end = source.indexOf("{/* ── 기술 스택 ── */}", start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe("Home projects section", () => {
  it("keeps project details in the Projects section instead of linking to a project route", () => {
    const block = projectsBlock();

    expect(block).not.toContain('href={previewHref(`/projects/${proj.slug}`)}');
    expect(block).not.toContain('>{label("detail", "Detail")}');
    expect(block).toContain("selectedProjectSlug");
    expect(block).toContain("selectedProject");
    expect(block).toContain("setSelectedProjectSlug");
    expect(block).toContain('className="project-detail-button"');
    expect(block).toContain("aria-controls={projectDetailPanelId}");
    expect(block).toContain("aria-expanded={selectedProjectSlug === proj.slug}");
    expect(block).toContain('className="project-detail-panel"');
    expect(block).toContain('className="project-detail-body markdown-body"');
    expect(block).toContain("toMarkdownHtml(selectedProject.body)");
  });

  it("keeps GitHub as the only project-row navigation link", () => {
    const block = projectsBlock();

    expect(block).toContain("{proj.link && <ExternalLink href={proj.link} T={T}>GitHub</ExternalLink>}");
    expect(block).not.toContain("previewHref(`/projects/");
  });
});
