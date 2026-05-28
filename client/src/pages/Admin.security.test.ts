import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Admin.tsx", import.meta.url), "utf8");

describe("Admin security source", () => {
  it("marks mutating admin fetches with a non-simple same-origin header", () => {
    const start = source.indexOf("async function postJson");
    const end = source.indexOf("function updateEnglishTranslation", start);
    const postJsonBlock = source.slice(start, end);

    expect(postJsonBlock).toContain('"X-Namuori-Admin-Request": "1"');
  });
});
