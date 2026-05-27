import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Admin.tsx", import.meta.url), "utf8");

describe("Admin starred repositories editor source", () => {
  const starredStart = source.lastIndexOf('if (active === "starred")');
  const starredEnd = source.indexOf("const note = notes[noteIndex]", starredStart);
  const starredBlock = source.slice(starredStart, starredEnd);

  it("edits the repository GitHub URL alongside name, stars, and description", () => {
    expect(starredBlock).toContain('label="URL"');
    expect(starredBlock).toContain("repo.href");
    expect(starredBlock).toContain("updateStarredRepo(index, { href })");
  });
});
