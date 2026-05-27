import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Admin.tsx", import.meta.url), "utf8");

describe("Admin translation tabs source", () => {
  it("renders Korean and English as mutually exclusive editor tabs", () => {
    expect(source).toContain('type AdminEditorLocale = "ko" | "en"');
    expect(source).toContain('className="admin-locale-tabs"');
    expect(source).toContain('adminEditorLocale === "en" ? renderEnglishEditor() : renderEditor()');
    expect(source).not.toContain("{renderTranslationPanel()}");
  });

  it("supports English draft editing for every admin section", () => {
    expect(source).toContain('return { kind: "site", value: site }');
    expect(source).toContain('return { kind: "education", value: education }');
    expect(source).toContain('return { kind: "skills", value: skills }');
    expect(source).toContain('return { kind: "starred", value: starred }');
  });

  it("exposes site and contact editing in the Korean admin editor", () => {
    expect(source).toContain('{ key: "site", label: "Site / UI" }');
    expect(source).toContain('label="Site title"');
    expect(source).toContain('label="Contact label"');
  });
});
