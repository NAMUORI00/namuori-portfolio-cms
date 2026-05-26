import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LIGHT } from "@/content/theme";
import type { KnowledgeGraphData } from "@/lib/knowledgeGraph";
import { MobileKnowledgeGraph } from "./MobileKnowledgeGraph";

const graph: KnowledgeGraphData = {
  nodes: [
    { id: "profile", label: "NAMUORI00", kind: "profile", weight: 5, section: "about" },
    { id: "research:r", label: "RAG Research", kind: "research", weight: 3, section: "research" },
    { id: "project:p", label: "Project P", kind: "project", weight: 3, section: "projects" },
    { id: "skill:python", label: "Python", kind: "skill", weight: 2, section: "skills" },
    { id: "note:n", label: "Note N", kind: "note", weight: 2, section: "interests" },
    { id: "term:rag", label: "RAG", kind: "term", weight: 2 },
  ],
  links: [
    { source: "profile", target: "research:r", kind: "profile", weight: 1 },
    { source: "profile", target: "project:p", kind: "profile", weight: 1 },
    { source: "project:p", target: "skill:python", kind: "skill", weight: 1 },
    { source: "project:p", target: "note:n", kind: "related", weight: 1 },
    { source: "project:p", target: "term:rag", kind: "term", weight: 1 },
  ],
};

describe("MobileKnowledgeGraph", () => {
  it("renders a passive mobile graph without note or term nodes", () => {
    const html = renderToStaticMarkup(<MobileKnowledgeGraph graph={graph} T={LIGHT} active="research" />);

    expect(html).toContain('id="mobile-knowledge-graph"');
    expect(html).toContain("mobile-knowledge-canvas");
    expect(html).toContain('data-node-id="profile"');
    expect(html).toContain('data-node-id="research:r"');
    expect(html).toContain('data-node-id="project:p"');
    expect(html).toContain('data-node-id="skill:python"');
    expect(html).toContain('data-connects="project:p skill:python"');
    expect(html).not.toContain('data-node-id="note:n"');
    expect(html).not.toContain('data-node-id="term:rag"');
    expect(html).not.toContain("<button");
    expect(html).not.toContain('role="button"');
  });
});
