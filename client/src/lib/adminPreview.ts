import type { PortfolioContent } from "@/content";
import type { AdminUxSectionKey } from "./adminUx";
import type { EnglishTranslations } from "./i18nContent";

const ADMIN_PREVIEW_STORAGE_PREFIX = "namuori.admin.preview.";
const ADMIN_PREVIEW_PARAM = "preview";

export interface AdminPreviewDraft {
  id: string;
  createdAt: string;
  section: AdminUxSectionKey;
  content: PortfolioContent;
  translations: EnglishTranslations;
}

export function createAdminPreviewId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function adminPreviewStorageKey(id: string): string {
  return `${ADMIN_PREVIEW_STORAGE_PREFIX}${id}`;
}

export function writeAdminPreviewDraft(draft: AdminPreviewDraft, storage: Storage = window.localStorage): void {
  storage.setItem(adminPreviewStorageKey(draft.id), JSON.stringify(draft));
}

export function readAdminPreviewDraft(id: string | null, storage: Storage = window.localStorage): AdminPreviewDraft | null {
  if (!id) return null;
  const raw = storage.getItem(adminPreviewStorageKey(id));
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw) as AdminPreviewDraft;
    return draft?.content && draft?.translations ? draft : null;
  } catch {
    return null;
  }
}

export function currentAdminPreviewId(search = typeof window === "undefined" ? "" : window.location.search): string | null {
  return new URLSearchParams(search).get(ADMIN_PREVIEW_PARAM);
}

export function readAdminPreviewDraftFromLocation(
  search = typeof window === "undefined" ? "" : window.location.search,
  storage: Storage | null = typeof window === "undefined" ? null : window.localStorage,
): AdminPreviewDraft | null {
  if (!storage) return null;
  return readAdminPreviewDraft(currentAdminPreviewId(search), storage);
}

export function previewPathForSection(section: AdminUxSectionKey, context: { slug?: string }): string {
  if (section === "education") return "/#education";
  if (section === "skills") return "/#skills";
  if (section === "starred") return "/#interests";
  if (section === "research") return context.slug ? `/research/${context.slug}` : "/#research";
  if (section === "projects") return context.slug ? `/projects/${context.slug}` : "/#projects";
  if (section === "notes") return context.slug ? `/notes/${context.slug}` : "/notes";
  return "/";
}

export function buildAdminPreviewUrl(path: string, id: string, locale?: "ko" | "en"): string {
  const hashIndex = path.indexOf("#");
  const pathWithoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) || "/" : path;
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const url = new URL(pathWithoutHash || "/", "https://preview.local");
  url.searchParams.set(ADMIN_PREVIEW_PARAM, id);
  if (locale) url.searchParams.set("lang", locale);
  return `${url.pathname}${url.search}${hash}`;
}

export function withAdminPreviewUrl(path: string, id: string | null): string {
  return id ? buildAdminPreviewUrl(path, id) : path;
}
