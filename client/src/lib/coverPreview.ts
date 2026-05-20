import type { Locale } from "./i18nContent";

export type CoverPreviewKind = "project" | "research";

export interface CoverPreviewPayload {
  src: string;
  title: string;
  alt: string;
  actionLabel: string;
  dialogLabel: string;
  closeLabel: string;
}

export interface BuildCoverPreviewInput {
  locale: Locale;
  kind: CoverPreviewKind;
  title: string;
  src: string;
}

export function buildCoverPreview({ locale, kind, title, src }: BuildCoverPreviewInput): CoverPreviewPayload {
  if (locale === "en") {
    const kindLabel = kind === "project" ? "project" : "research";
    return {
      src,
      title,
      alt: `${title} ${kindLabel} cover image`,
      actionLabel: `Open ${title} image preview`,
      dialogLabel: `${title} image preview`,
      closeLabel: "Close image preview",
    };
  }

  const kindLabel = kind === "project" ? "프로젝트" : "연구";
  return {
    src,
    title,
    alt: `${title} ${kindLabel} 대표 이미지`,
    actionLabel: `${title} 이미지 크게 보기`,
    dialogLabel: `${title} 이미지 미리보기`,
    closeLabel: "이미지 닫기",
  };
}
