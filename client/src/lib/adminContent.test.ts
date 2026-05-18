import { describe, expect, it } from "vitest";
import {
  buildSavePayload,
  noteBranchName,
  projectBranchName,
  researchBranchName,
  serializeNote,
  serializeProject,
  serializeResearch,
} from "./adminContent";
import type { NoteEntry, ProjectEntry, ResearchEntry } from "@/content";

const project: ProjectEntry = {
  slug: "aerospace-rag",
  name: "aerospace-rag",
  period: "2026.05",
  desc: "RAG system",
  metric: "MRR +31%",
  tags: ["Python", "RAG"],
  link: "https://github.com/NAMUORI00/aerospace-rag",
  highlight: true,
  private: false,
  status: "published",
  relatedNotes: ["rag-evaluation"],
  body: "## 개요\n\n본문",
};

const research: ResearchEntry = {
  slug: "rag",
  title: "Retrieval-Augmented Generation",
  desc: "Hybrid retrieval",
  status: "published",
  showDiagram: true,
  relatedNotes: ["rag-evaluation"],
  body: "## RAG\n\n본문",
};

const note: NoteEntry = {
  slug: "rag-evaluation",
  title: "RAG 평가 노트",
  status: "published",
  date: "2026-05-18",
  summary: "평가 기준",
  tags: ["RAG"],
  relatedProjects: ["aerospace-rag"],
  relatedResearch: ["rag"],
  body: "## 평가\n\n본문",
};

describe("admin content helpers", () => {
  it("creates stable draft branch names", () => {
    expect(projectBranchName("aerospace-rag")).toBe("draft/project-aerospace-rag");
    expect(researchBranchName("rag")).toBe("draft/research-rag");
    expect(noteBranchName("rag-evaluation")).toBe("draft/note-rag-evaluation");
  });

  it("serializes project/research/note MDX", () => {
    expect(serializeProject(project).path).toBe("content/projects/aerospace-rag.mdx");
    expect(serializeProject(project).content).toContain("highlight: true");
    expect(serializeResearch(research).path).toBe("content/research/rag.mdx");
    expect(serializeResearch(research).content).toContain("showDiagram: true");
    expect(serializeNote(note).path).toBe("content/notes/rag-evaluation.mdx");
    expect(serializeNote(note).content).toContain("relatedProjects:");
  });

  it("builds save payloads for GitHub API", () => {
    const payload = buildSavePayload({ kind: "project", value: project });

    expect(payload.branch).toBe("draft/project-aerospace-rag");
    expect(payload.message).toBe("Update project: aerospace-rag");
    expect(payload.files).toEqual([
      expect.objectContaining({
        path: "content/projects/aerospace-rag.mdx",
        content: expect.stringContaining("slug: aerospace-rag"),
      }),
    ]);
  });
});
