import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8");

describe("Home mobile layout", () => {
  it("keeps contacts available in the mobile drawer", () => {
    const drawerStart = source.indexOf('className={`mobile-drawer');
    const drawerEnd = source.indexOf("</div>", source.indexOf("<PreferenceSegmentedControl", drawerStart));
    const drawer = source.slice(drawerStart, drawerEnd);

    expect(drawer).toContain("PROFILE.contacts.map");
    expect(drawer).toContain("<ContactIcon");
    expect(drawer).toContain('target="_blank"');
  });

  it("renders mobile knowledge graph between research and projects with responsive CSS", () => {
    const research = source.indexOf("Research Interests");
    const mobileGraph = source.indexOf("<MobileKnowledgeGraph");
    const projects = source.indexOf("Projects</SectionTitle>");

    expect(source).toContain('import { MobileKnowledgeGraph } from "@/components/MobileKnowledgeGraph"');
    expect(research).toBeGreaterThanOrEqual(0);
    expect(mobileGraph).toBeGreaterThan(research);
    expect(projects).toBeGreaterThan(mobileGraph);
    expect(source).toContain(".mobile-knowledge-section { display: none; }");
    expect(source).toContain(".mobile-knowledge-section { display: block; }");
  });
});
