import type { SaveFile } from "./adminContent";

export const AVATAR_MAX_BYTES = 1.5 * 1024 * 1024;

type AvatarMimeType = "image/png" | "image/jpeg" | "image/webp";

interface AvatarFileDescriptor {
  name: string;
  type: string;
  size: number;
}

export interface AvatarUploadDraft {
  file: SaveFile;
  publicUrl: string;
}

export type ContentCoverKind = "projects" | "research";

const MIME_EXTENSIONS: Record<AvatarMimeType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const EXTENSION_MIME_TYPES: Record<string, AvatarMimeType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function avatarMimeType(file: AvatarFileDescriptor): AvatarMimeType | null {
  if (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp") {
    return file.type;
  }
  const extension = file.name.trim().toLowerCase().split(".").pop() ?? "";
  return EXTENSION_MIME_TYPES[extension] ?? null;
}

function slugBase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "cover";
}

export function avatarUploadPathForMime(mimeType: AvatarMimeType): { repoPath: string; publicUrl: string } {
  const extension = MIME_EXTENSIONS[mimeType];
  return {
    repoPath: `client/public/uploads/avatar/namuori-avatar.${extension}`,
    publicUrl: `/uploads/avatar/namuori-avatar.${extension}`,
  };
}

export function contentCoverUploadPathForMime(kind: ContentCoverKind, slug: string, mimeType: AvatarMimeType): { repoPath: string; publicUrl: string } {
  const extension = MIME_EXTENSIONS[mimeType];
  const cleanSlug = slugBase(slug);
  return {
    repoPath: `client/public/uploads/${kind}/${cleanSlug}.${extension}`,
    publicUrl: `/uploads/${kind}/${cleanSlug}.${extension}`,
  };
}

export function validateAvatarFile(file: AvatarFileDescriptor): { ok: true; mimeType: AvatarMimeType } | { ok: false; error: string } {
  if (file.size > AVATAR_MAX_BYTES) {
    return { ok: false, error: "아바타 이미지는 1.5MB 이하만 업로드할 수 있습니다." };
  }
  const mimeType = avatarMimeType(file);
  if (!mimeType) {
    return { ok: false, error: "PNG, JPG, WEBP 이미지만 업로드할 수 있습니다." };
  }
  return { ok: true, mimeType };
}

export function parseAvatarDataUrl(dataUrl: string, mimeType: AvatarMimeType): string {
  const prefix = `data:${mimeType};base64,`;
  if (!dataUrl.startsWith(prefix)) {
    throw new Error("아바타 이미지 파일을 읽지 못했습니다.");
  }
  const payload = dataUrl.slice(prefix.length).replace(/\s+/g, "");
  const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (!payload || !base64Pattern.test(payload)) {
    throw new Error("아바타 이미지 파일을 읽지 못했습니다.");
  }
  return payload;
}

export function avatarUploadDraftFromDataUrl(file: AvatarFileDescriptor, dataUrl: string): AvatarUploadDraft {
  const validation = validateAvatarFile(file);
  if (!validation.ok) throw new Error(validation.error);
  const paths = avatarUploadPathForMime(validation.mimeType);
  return {
    file: {
      path: paths.repoPath,
      content: parseAvatarDataUrl(dataUrl, validation.mimeType),
      encoding: "base64",
    },
    publicUrl: paths.publicUrl,
  };
}

export function contentCoverUploadDraftFromDataUrl(kind: ContentCoverKind, slug: string, file: AvatarFileDescriptor, dataUrl: string): AvatarUploadDraft {
  const validation = validateAvatarFile(file);
  if (!validation.ok) throw new Error(validation.error);
  const paths = contentCoverUploadPathForMime(kind, slug, validation.mimeType);
  return {
    file: {
      path: paths.repoPath,
      content: parseAvatarDataUrl(dataUrl, validation.mimeType),
      encoding: "base64",
    },
    publicUrl: paths.publicUrl,
  };
}
