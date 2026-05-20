import { describe, expect, it } from "vitest";
import { buildAdminPreviewUrl, previewPathForSection } from "./adminPreview";

describe("admin preview helpers", () => {
  it("routes each admin section to the public page that represents the deployed result", () => {
    expect(previewPathForSection("profile", {})).toBe("/");
    expect(previewPathForSection("education", {})).toBe("/#education");
    expect(previewPathForSection("skills", {})).toBe("/#skills");
    expect(previewPathForSection("starred", {})).toBe("/#interests");
    expect(previewPathForSection("projects", { slug: "aerospace-rag" })).toBe("/projects/aerospace-rag");
    expect(previewPathForSection("research", { slug: "edge-llm" })).toBe("/research/edge-llm");
    expect(previewPathForSection("notes", { slug: "rag-evaluation" })).toBe("/notes/rag-evaluation");
  });

  it("adds the preview id without losing the route hash", () => {
    expect(buildAdminPreviewUrl("/#skills", "preview-1")).toBe("/?preview=preview-1#skills");
    expect(buildAdminPreviewUrl("/#skills", "preview-1", "ko")).toBe("/?preview=preview-1&lang=ko#skills");
    expect(buildAdminPreviewUrl("/projects/demo", "preview-1")).toBe("/projects/demo?preview=preview-1");
  });
});
