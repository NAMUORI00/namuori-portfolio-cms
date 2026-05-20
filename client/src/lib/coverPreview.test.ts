import { describe, expect, it } from "vitest";
import { buildCoverPreview } from "./coverPreview";

describe("buildCoverPreview", () => {
  it("builds Korean project preview labels", () => {
    expect(buildCoverPreview({ locale: "ko", kind: "project", title: "Aerospace RAG", src: "/uploads/projects/rag.webp" })).toEqual({
      src: "/uploads/projects/rag.webp",
      title: "Aerospace RAG",
      alt: "Aerospace RAG 프로젝트 대표 이미지",
      actionLabel: "Aerospace RAG 이미지 크게 보기",
      dialogLabel: "Aerospace RAG 이미지 미리보기",
      closeLabel: "이미지 닫기",
    });
  });

  it("builds English research preview labels", () => {
    expect(buildCoverPreview({ locale: "en", kind: "research", title: "Graph Retrieval", src: "/uploads/research/graph.webp" })).toEqual({
      src: "/uploads/research/graph.webp",
      title: "Graph Retrieval",
      alt: "Graph Retrieval research cover image",
      actionLabel: "Open Graph Retrieval image preview",
      dialogLabel: "Graph Retrieval image preview",
      closeLabel: "Close image preview",
    });
  });
});
