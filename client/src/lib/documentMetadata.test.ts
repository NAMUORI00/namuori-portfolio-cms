import { describe, expect, it } from "vitest";
import type { SiteContent } from "@/content";
import { documentMetadata } from "./documentMetadata";

const site: SiteContent = {
  title: "Kim Yuseok | AI Research Engineer Portfolio",
  description: "English portfolio description",
  url: "https://namuori.net",
  navigation: [],
  images: { heroTree: "tree", ragDiagram: "rag", dotPattern: "dot" },
};

describe("document metadata", () => {
  it("derives locale-aware metadata from localized site content", () => {
    expect(documentMetadata(site, "en")).toEqual({
      title: "Kim Yuseok | AI Research Engineer Portfolio",
      description: "English portfolio description",
      url: "https://namuori.net",
      htmlLang: "en",
      ogLocale: "en_US",
    });

    expect(documentMetadata(site, "ko").ogLocale).toBe("ko_KR");
  });
});
