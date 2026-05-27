import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");

function starredBlock() {
  const start = source.indexOf('<SectionTitle id="interests"');
  const end = source.indexOf("{/* ── 푸터 ── */}", start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe("Home starred repositories section", () => {
  it("opens each starred repository through its GitHub URL", () => {
    const block = starredBlock();

    expect(block).toContain("href={repo.href}");
    expect(block).toContain('target="_blank"');
    expect(block).toContain('rel="noopener noreferrer"');
    expect(block).toContain("<ExternalArrow");
  });
});
