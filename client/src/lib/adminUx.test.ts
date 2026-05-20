import { describe, expect, it } from "vitest";
import {
  clearDirtySection,
  clearImportApplied,
  createImportAppliedState,
  editableListKey,
  hasDirtySection,
  isImportApplied,
  markDirtySection,
  markImportApplied,
  saveScopeSummary,
  sectionActionLabel,
  sectionLabel,
} from "./adminUx";

describe("admin UX helpers", () => {
  it("tracks dirty sections without duplicates", () => {
    const dirty = markDirtySection(markDirtySection(["profile"], "projects"), "projects");

    expect(dirty).toEqual(["profile", "projects"]);
    expect(hasDirtySection(dirty, "projects")).toBe(true);
    expect(clearDirtySection(dirty, "projects")).toEqual(["profile"]);
  });

  it("names the current save and publish scope", () => {
    expect(sectionLabel("projects")).toBe("Projects");
    expect(sectionActionLabel("projects", "save")).toBe("Save Projects draft");
    expect(sectionActionLabel("projects", "publish")).toBe("Publish Projects PR");
    expect(saveScopeSummary("projects", "draft/project-aerospace-rag")).toBe("Current target: Projects · draft/project-aerospace-rag");
  });

  it("tracks imported candidates that were applied but not saved yet", () => {
    const applied = markImportApplied(createImportAppliedState(), "starred", ["vitejs/vite", "vitejs/vite", ""]);

    expect(applied.starred).toEqual(["vitejs/vite"]);
    expect(isImportApplied(applied, "starred", "vitejs/vite")).toBe(true);
    expect(clearImportApplied(applied, "starred").starred).toEqual([]);
  });

  it("keeps editable list keys independent from typed field values", () => {
    expect(editableListKey("education", 1)).toBe(editableListKey("education", 1));
    expect(editableListKey("skill-item", 2, 3)).toBe("skill-item:2:3");
    expect(editableListKey("starred", 0)).not.toContain("repo-name");
  });
});
