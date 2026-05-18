import { describe, expect, it } from "vitest";
import type { KnowledgeGraphData } from "./knowledgeGraph";
import { curvedKnowledgeLinkPath, layoutKnowledgeGraph } from "./knowledgeGraphLayout";

const graph: KnowledgeGraphData = {
  nodes: [
    { id: "profile", label: "NAMUORI00", kind: "profile", weight: 5 },
    { id: "project:a", label: "Project A", kind: "project", weight: 3, section: "projects" },
    { id: "research:r", label: "Research R", kind: "research", weight: 3, section: "research" },
    { id: "note:n", label: "Note N", kind: "note", weight: 2, section: "interests" },
    { id: "skill:python", label: "Python", kind: "skill", weight: 2, section: "skills" },
    { id: "term:rag", label: "RAG", kind: "term", weight: 2 },
  ],
  links: [
    { source: "profile", target: "project:a", kind: "profile", weight: 1 },
    { source: "project:a", target: "term:rag", kind: "term", weight: 1 },
  ],
};

function distanceBetween(layout: ReturnType<typeof layoutKnowledgeGraph>, leftId: string, rightId: string): number {
  const left = layout.nodes.find((node) => node.id === leftId);
  const right = layout.nodes.find((node) => node.id === rightId);
  if (!left || !right) throw new Error(`Missing node pair ${leftId} ${rightId}`);
  return Math.hypot(left.x - right.x, left.y - right.y);
}

describe("layoutKnowledgeGraph", () => {
  it("places the profile node at the center and all other nodes inside the rail", () => {
    const layout = layoutKnowledgeGraph(graph, 260, 340);
    const profile = layout.nodes.find((node) => node.id === "profile");

    expect(profile?.x).toBe(130);
    expect(profile?.y).toBe(170);
    for (const node of layout.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(16);
      expect(node.x).toBeLessThanOrEqual(244);
      expect(node.y).toBeGreaterThanOrEqual(16);
      expect(node.y).toBeLessThanOrEqual(324);
      expect(node.radius).toBeGreaterThan(2);
    }
  });

  it("resolves link coordinates from source and target ids", () => {
    const layout = layoutKnowledgeGraph(graph, 260, 340);

    expect(layout.links[0]).toEqual(expect.objectContaining({ sourceId: "profile", targetId: "project:a" }));
    expect(layout.links[0].source.x).toBe(130);
    expect(layout.links.length).toBe(graph.links.length);
  });

  it("generates curved neural edge paths instead of straight line commands", () => {
    const layout = layoutKnowledgeGraph(graph, 260, 340);
    const path = curvedKnowledgeLinkPath(layout.links[0]);

    expect(path).toMatch(/^M \d+ \d+ Q /);
    expect(path).toContain("130 170");
    expect(path).not.toContain(" L ");
  });

  it("pulls linked terms closer than unrelated terms for an Obsidian-like cluster", () => {
    const clustered: KnowledgeGraphData = {
      nodes: [
        { id: "profile", label: "NAMUORI00", kind: "profile", weight: 5 },
        { id: "project:a", label: "Project A", kind: "project", weight: 3, section: "projects" },
        { id: "term:unlinked", label: "Unlinked", kind: "term", weight: 2 },
        { id: "term:linked", label: "Linked", kind: "term", weight: 2 },
      ],
      links: [
        { source: "profile", target: "project:a", kind: "profile", weight: 1 },
        { source: "project:a", target: "term:linked", kind: "term", weight: 2.4 },
      ],
    };
    const layout = layoutKnowledgeGraph(clustered, 260, 340);

    expect(distanceBetween(layout, "project:a", "term:linked")).toBeLessThan(distanceBetween(layout, "project:a", "term:unlinked"));
  });
});
