import { useMemo } from "react";
import type { PortfolioTheme } from "@/content/theme";
import { FONT_MONO, FONT_SANS } from "@/content/theme";
import type { KnowledgeGraphData, KnowledgeGraphNode } from "@/lib/knowledgeGraph";
import { curvedKnowledgeLinkPath, layoutKnowledgeGraph } from "@/lib/knowledgeGraphLayout";

const WIDTH = 320;
const HEIGHT = 220;
const INNER_ORBIT = Math.min(WIDTH, HEIGHT) * 0.24;
const OUTER_ORBIT = Math.min(WIDTH, HEIGHT) * 0.38;

function nodeColor(node: KnowledgeGraphNode, T: PortfolioTheme): string {
  if (node.kind === "profile") return T.green;
  if (node.kind === "research") return T.greenLight;
  if (node.kind === "project") return T.text;
  if (node.kind === "skill") return T.green;
  if (node.kind === "repo") return T.sub;
  return T.muted;
}

function compactLabel(label: string): string {
  return label.length > 15 ? `${label.slice(0, 14)}...` : label;
}

export function MobileKnowledgeGraph({
  graph,
  T,
  active,
}: {
  graph: KnowledgeGraphData;
  T: PortfolioTheme;
  active: string;
}) {
  const layout = useMemo(() => layoutKnowledgeGraph(graph, WIDTH, HEIGHT), [graph]);
  const activeNode = layout.nodes.find((node) => node.section === active) ?? null;
  const connected = useMemo(() => {
    if (!activeNode) return new Set<string>();
    const ids = new Set<string>([activeNode.id]);
    for (const link of layout.links) {
      if (link.sourceId === activeNode.id) ids.add(link.targetId);
      if (link.targetId === activeNode.id) ids.add(link.sourceId);
    }
    return ids;
  }, [activeNode, layout.links]);

  return (
    <section
      id="mobile-knowledge-graph"
      className="mobile-knowledge-section"
      aria-label="모바일 포트폴리오 지식 그래프"
      style={{
        margin: "0 0 2.35rem",
        border: `1px solid ${T.border}`,
        borderRadius: "6px",
        background: T.surface,
        overflow: "hidden",
        boxShadow: `inset 0 0 34px ${T.green}14`,
      }}
    >
      <div
        style={{
          padding: "0.7rem 0.85rem 0.2rem",
          fontFamily: FONT_MONO,
          fontSize: "0.6rem",
          letterSpacing: "0.08em",
          color: T.green,
          textTransform: "uppercase",
        }}
      >
        Knowledge Graph
      </div>
      <svg
        className="mobile-knowledge-canvas"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        aria-hidden="true"
        focusable="false"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
      >
        <defs>
          <radialGradient id="mobile-knowledge-vignette" cx="50%" cy="48%" r="70%">
            <stop offset="0%" stopColor={T.greenLight} stopOpacity="0.16" />
            <stop offset="60%" stopColor={T.green} stopOpacity="0.05" />
            <stop offset="100%" stopColor={T.bg} stopOpacity="0" />
          </radialGradient>
          <pattern id="mobile-knowledge-grid" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.75" fill={T.muted} opacity="0.14" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill={T.bg} />
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#mobile-knowledge-grid)" />
        <circle cx={WIDTH / 2} cy={HEIGHT * 0.5} r="112" fill="url(#mobile-knowledge-vignette)" />
        <circle cx={WIDTH / 2} cy={HEIGHT / 2} r={INNER_ORBIT} fill="none" stroke={T.green} strokeWidth="0.75" strokeOpacity="0.14" strokeDasharray="2 9" />
        <circle cx={WIDTH / 2} cy={HEIGHT / 2} r={OUTER_ORBIT} fill="none" stroke={T.greenLight} strokeWidth="0.6" strokeOpacity="0.12" strokeDasharray="2 11" />
        {layout.links.map((link) => {
          const isLit = !activeNode || link.sourceId === activeNode.id || link.targetId === activeNode.id;
          return (
            <path
              key={`${link.sourceId}-${link.targetId}-${link.kind}`}
              data-connects={`${link.sourceId} ${link.targetId}`}
              d={curvedKnowledgeLinkPath(link)}
              fill="none"
              stroke={link.kind === "skill" || link.kind === "related" ? T.greenLight : T.muted}
              strokeWidth={isLit ? Math.max(0.68, Math.min(1.45, link.weight / 1.8)) : 0.5}
              strokeOpacity={isLit ? 0.38 : 0.1}
              strokeLinecap="round"
            />
          );
        })}
        {layout.nodes.map((node) => {
          const color = nodeColor(node, T);
          const isFocusNode = activeNode?.id === node.id;
          const isLit = !activeNode || connected.has(node.id);
          const radius = node.radius * (isFocusNode ? 1.12 : 1);
          return (
            <g key={node.id} data-node-id={node.id} aria-label={node.label}>
              {isLit && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius + (isFocusNode ? 9 : 5)}
                  fill={color}
                  opacity={isFocusNode ? 0.16 : 0.055}
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={radius}
                fill={color}
                opacity={isLit ? 0.84 : 0.28}
                stroke={isFocusNode ? T.green : T.bg}
                strokeWidth={isFocusNode ? 1.35 : 0.75}
              />
              {(node.kind === "profile" || isFocusNode || node.kind === "project") && (
                <text
                  x={node.x}
                  y={node.y - radius - 7}
                  textAnchor="middle"
                  fill={isFocusNode ? T.green : T.sub}
                  fontFamily={node.kind === "project" ? FONT_SANS : FONT_MONO}
                  fontSize={node.kind === "project" ? 7 : 8}
                >
                  {compactLabel(node.label)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </section>
  );
}
