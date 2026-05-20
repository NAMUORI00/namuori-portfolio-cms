import { describe, expect, it } from "vitest";
import {
  AVATAR_MAX_BYTES,
  avatarUploadDraftFromDataUrl,
  avatarUploadPathForMime,
  contentCoverUploadDraftFromDataUrl,
  contentCoverUploadPathForMime,
  parseAvatarDataUrl,
  validateAvatarFile,
} from "./avatarUpload";

describe("avatar upload helpers", () => {
  it("stores uploaded avatars at a stable public path based on MIME type", () => {
    expect(avatarUploadPathForMime("image/webp")).toEqual({
      repoPath: "client/public/uploads/avatar/namuori-avatar.webp",
      publicUrl: "/uploads/avatar/namuori-avatar.webp",
    });
    expect(avatarUploadPathForMime("image/jpeg").repoPath).toBe("client/public/uploads/avatar/namuori-avatar.jpg");
    expect(avatarUploadPathForMime("image/png").publicUrl).toBe("/uploads/avatar/namuori-avatar.png");
  });

  it("validates supported avatar image files", () => {
    expect(validateAvatarFile({ name: "profile.webp", type: "image/webp", size: AVATAR_MAX_BYTES })).toEqual({
      ok: true,
      mimeType: "image/webp",
    });
  });

  it("rejects unsupported or oversized avatar image files", () => {
    expect(validateAvatarFile({ name: "profile.gif", type: "image/gif", size: 2000 })).toEqual({
      ok: false,
      error: "PNG, JPG, WEBP 이미지만 업로드할 수 있습니다.",
    });
    expect(validateAvatarFile({ name: "huge.png", type: "image/png", size: AVATAR_MAX_BYTES + 1 })).toEqual({
      ok: false,
      error: "아바타 이미지는 1.5MB 이하만 업로드할 수 있습니다.",
    });
  });

  it("extracts base64 payloads from matching data URLs", () => {
    expect(parseAvatarDataUrl("data:image/png;base64,aGVsbG8=", "image/png")).toBe("aGVsbG8=");
  });

  it("builds a binary GitHub save file and public avatar URL", () => {
    const draft = avatarUploadDraftFromDataUrl(
      { name: "profile.png", type: "image/png", size: 1200 },
      "data:image/png;base64,aGVsbG8=",
    );

    expect(draft).toEqual({
      file: {
        path: "client/public/uploads/avatar/namuori-avatar.png",
        content: "aGVsbG8=",
        encoding: "base64",
      },
      publicUrl: "/uploads/avatar/namuori-avatar.png",
    });
  });

  it("stores project and research cover images under slugged public paths", () => {
    expect(contentCoverUploadPathForMime("projects", "Aerospace RAG", "image/webp")).toEqual({
      repoPath: "client/public/uploads/projects/aerospace-rag.webp",
      publicUrl: "/uploads/projects/aerospace-rag.webp",
    });
    expect(contentCoverUploadPathForMime("research", "RAG 실험", "image/png")).toEqual({
      repoPath: "client/public/uploads/research/rag-실험.png",
      publicUrl: "/uploads/research/rag-실험.png",
    });
  });

  it("builds binary GitHub save files for content cover images", () => {
    const draft = contentCoverUploadDraftFromDataUrl(
      "research",
      "edge-llm",
      { name: "cover.jpg", type: "image/jpeg", size: 1200 },
      "data:image/jpeg;base64,aGVsbG8=",
    );

    expect(draft).toEqual({
      file: {
        path: "client/public/uploads/research/edge-llm.jpg",
        content: "aGVsbG8=",
        encoding: "base64",
      },
      publicUrl: "/uploads/research/edge-llm.jpg",
    });
  });
});
