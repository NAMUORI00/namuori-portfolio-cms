import type { SiteContent } from "@/content";
import type { Locale } from "./i18nContent";

export interface DocumentMetadata {
  title: string;
  description: string;
  url: string;
  htmlLang: Locale;
  ogLocale: "ko_KR" | "en_US";
}

export function documentMetadata(site: SiteContent, locale: Locale): DocumentMetadata {
  return {
    title: site.title,
    description: site.description,
    url: site.url,
    htmlLang: locale,
    ogLocale: locale === "en" ? "en_US" : "ko_KR",
  };
}

function setMetaContent(doc: Document, selector: string, content: string) {
  const element = doc.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.content = content;
}

export function applyDocumentMetadata(site: SiteContent, locale: Locale, doc: Document = document) {
  const metadata = documentMetadata(site, locale);
  doc.documentElement.lang = metadata.htmlLang;
  doc.title = metadata.title;
  setMetaContent(doc, 'meta[name="description"]', metadata.description);
  setMetaContent(doc, 'meta[property="og:url"]', metadata.url);
  setMetaContent(doc, 'meta[property="og:title"]', metadata.title);
  setMetaContent(doc, 'meta[property="og:description"]', metadata.description);
  setMetaContent(doc, 'meta[property="og:locale"]', metadata.ogLocale);
  setMetaContent(doc, 'meta[name="twitter:title"]', metadata.title);
  setMetaContent(doc, 'meta[name="twitter:description"]', metadata.description);
}
