import { describe, expect, it } from "vitest";
import {
  requireAdminMutationRequest,
  validateDraftBranchName,
  validateSavePayload,
} from "../../../functions/_utils/security.js";

describe("admin security function helpers", () => {
  it("allows the existing CMS write paths and rejects source/control paths", () => {
    const payload = validateSavePayload({
      branch: "draft/project-aerospace-rag",
      files: [
        { path: "content/profile.json", content: "{}" },
        { path: "content/projects/aerospace-rag.mdx", content: "---\nslug: aerospace-rag\n---\n\n본문" },
        { path: "content/i18n/en.json", content: "{}" },
        { path: "client/public/uploads/projects/aerospace-rag.webp", content: "aGVsbG8=", encoding: "base64" },
      ],
    });

    expect(payload.files.map((file) => file.path)).toEqual([
      "content/profile.json",
      "content/projects/aerospace-rag.mdx",
      "content/i18n/en.json",
      "client/public/uploads/projects/aerospace-rag.webp",
    ]);
    expect(() =>
      validateSavePayload({ branch: "draft/source", files: [{ path: "functions/api/auth/session.js", content: "x" }] }),
    ).toThrow(/not allowed/i);
    expect(() =>
      validateSavePayload({ branch: "draft/workflow", files: [{ path: ".github/workflows/deploy.yml", content: "x" }] }),
    ).toThrow(/not allowed/i);
    expect(() =>
      validateSavePayload({ branch: "draft/traversal", files: [{ path: "content/../package.json", content: "x" }] }),
    ).toThrow(/not allowed/i);
  });

  it("enforces draft branch syntax and save payload limits", () => {
    expect(validateDraftBranchName("draft/i18n-en")).toBe("draft/i18n-en");
    expect(() => validateDraftBranchName("main")).toThrow(/draft/i);
    expect(() => validateDraftBranchName("draft/../main")).toThrow(/invalid/i);
    expect(() =>
      validateSavePayload({
        branch: "draft/too-many",
        files: Array.from({ length: 7 }, (_, index) => ({
          path: `content/projects/item-${index}.mdx`,
          content: "x",
        })),
      }),
    ).toThrow(/at most 6/i);
    expect(() =>
      validateSavePayload({
        branch: "draft/wrong-encoding",
        files: [{ path: "client/public/uploads/avatar/namuori-avatar.webp", content: "plain text", encoding: "text" }],
      }),
    ).toThrow(/base64/i);
  });

  it("rejects cross-origin or non-admin mutation requests", () => {
    const env = { ADMIN_ALLOWED_ORIGINS: "https://namuori.net" };
    const sameOrigin = new Request("https://namuori.net/api/github/save", {
      method: "POST",
      headers: { Origin: "https://namuori.net", "X-Namuori-Admin-Request": "1" },
    });
    const crossOrigin = new Request("https://namuori.net/api/github/save", {
      method: "POST",
      headers: { Origin: "https://attacker.example", "X-Namuori-Admin-Request": "1" },
    });
    const missingHeader = new Request("https://namuori.net/api/github/save", {
      method: "POST",
      headers: { Origin: "https://namuori.net" },
    });

    expect(requireAdminMutationRequest(env, sameOrigin)).toBeNull();
    expect(requireAdminMutationRequest(env, crossOrigin)?.status).toBe(403);
    expect(requireAdminMutationRequest(env, missingHeader)?.status).toBe(403);
  });
});
