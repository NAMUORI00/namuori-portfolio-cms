import { useMemo, useState } from "react";
import type { PortfolioTheme } from "@/content/theme";
import type { KnowledgeGraphData, KnowledgeGraphNode } from "@/lib/knowledgeGraph";
import { curvedKnowledgeLinkPath, layoutKnowledgeGraph } from "@/lib/knowledgeGraphLayout";
import { FONT_MONO, FONT_SANS } from "@/content/theme";

const WIDTH = 276;
const HEIGHT = 360;

function nodeColor(node: KnowledgeGraphNode, T: PortfolioTheme): string {
  if (node.kind === "profile") return T.green;
  if (node.kind === "research") return T.greenLight;
  if (node.kind === "project") return T.text;
  if (node.kind === "note") return T.muted;
  if (node.kind === "skill") return T.green;
  if (node.kind === "repo") return T.sub;
  return T.muted;
}

function kindLabel(kind: KnowledgeGraphNode["kind"]): string {
  if (kind === "profile") return "core";
  if (kind === "research") return "research";
  if (kind === "project") return "project";
  if (kind === "note") return "note";
  if (kind === "skill") return "skill";
  if (kind === "repo") return "repo";
  return "term";
}

function cssAttr(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function KnowledgeGraphRail({
  graph,
  T,
  active,
}: {
  graph: KnowledgeGraphData;
  T: PortfolioTheme;
  active: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const layout = useMemo(() => layoutKnowledgeGraph(graph, WIDTH, HEIGHT), [graph]);
  const hoveredNode = layout.nodes.find((node) => node.id === hovered) ?? null;
  const activeNode = layout.nodes.find((node) => node.section === active) ?? null;
  const focusNode = hoveredNode ?? activeNode;
  const connected = useMemo(() => {
    if (!focusNode) return new Set<string>();
    const ids = new Set<string>([focusNode.id]);
    for (const link of layout.links) {
      if (link.sourceId === focusNode.id) ids.add(link.targetId);
      if (link.targetId === focusNode.id) ids.add(link.sourceId);
    }
    return ids;
  }, [focusNode, layout.links]);
  const hoverRules = useMemo(
    () =>
      layout.nodes
        .map((node) => {
          const id = cssAttr(node.id);
          return `
            #knowledge-rail svg:has([data-node-id="${id}"]:hover) [data-connects~="${id}"] {
              stroke-opacity: 0.68;
            }
            #knowledge-rail svg:has([data-node-id="${id}"]:hover) [data-connects~="${id}"].knowledge-signal {
              stroke-opacity: 0.62;
              animation-duration: 1.15s;
            }
          `;
        })
        .join("\n"),
    [layout.nodes],
  );
  const topNodes = layout.nodes.filter((node) => node.kind !== "profile").slice(0, 5);

  return (
    <aside
      id="knowledge-rail"
      aria-label="포트폴리오 지식 그래프"
      style={{
        width: "clamp(236px, 20vw, 312px)",
        flexShrink: 0,
        height: "100dvh",
        borderLeft: `1px solid ${T.border}`,
        background: T.sidebarBg,
        padding: "clamp(1.25rem, 2vw, 2rem) clamp(1rem, 1.5vw, 1.35rem)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        overflow: "hidden",
      }}
    >
      <div>
        <div style={{ color: T.green, fontFamily: FONT_MONO, fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Knowledge Graph
        </div>
        <p style={{ margin: "0.35rem 0 0", color: T.sub, fontFamily: FONT_SANS, fontSize: "0.72rem", lineHeight: 1.6, wordBreak: "keep-all" }}>
          콘텐츠의 태그, 관련 노트, 자연어 키워드로 매 배포마다 다시 그려지는 관심사 지도입니다.
        </p>
      </div>

      <div
        style={{
          position: "relative",
          border: `1px solid ${T.border}`,
          borderRadius: "6px",
          background: T.bg,
          overflow: "hidden",
          minHeight: "340px",
        }}
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="관심사 노드 그래프" style={{ display: "block", width: "100%", height: "auto" }}>
          <defs>
            <radialGradient id="knowledge-core" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={T.greenLight} stopOpacity="0.35" />
              <stop offset="100%" stopColor={T.green} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="transparent" />
          <circle cx={WIDTH / 2} cy={HEIGHT / 2} r="92" fill="url(#knowledge-core)" />
          {layout.links.map((link) => {
            const isLit = !focusNode || connected.has(link.sourceId) || connected.has(link.targetId);
            const path = curvedKnowledgeLinkPath(link);
            return (
              <g key={`${link.sourceId}-${link.targetId}-${link.kind}`}>
                <path
                  className="knowledge-edge knowledge-edge-base"
                  data-connects={`${link.sourceId} ${link.targetId}`}
                  d={path}
                  fill="none"
                  stroke={link.kind === "related" ? T.green : T.border}
                  strokeWidth={Math.max(0.6, Math.min(2.4, link.weight / 1.25))}
                  strokeOpacity={isLit ? 0.5 : 0.1}
                  strokeLinecap="round"
                />
                {isLit && (
                  <path
                    className="knowledge-edge knowledge-signal"
                    data-connects={`${link.sourceId} ${link.targetId}`}
                    d={path}
                    fill="none"
                    stroke={T.greenLight}
                    strokeWidth={Math.max(0.7, Math.min(1.8, link.weight / 1.7))}
                    strokeOpacity={link.kind === "related" ? 0.5 : 0.28}
                    strokeLinecap="round"
                  />
                )}
              </g>
            );
          })}
          {layout.nodes.map((node) => {
            const color = nodeColor(node, T);
            const isActive = node.section === active || node.id === hovered;
            const isLit = !focusNode || connected.has(node.id);
            return (
              <g
                className="knowledge-node-group"
                key={node.id}
                data-node-id={node.id}
                aria-label={`${node.label} ${kindLabel(node.kind)}`}
                onPointerEnter={() => setHovered(node.id)}
                onPointerLeave={() => setHovered(null)}
                style={{ cursor: "default", outline: "none" }}
              >
                {(isActive || node.kind === "profile") && (
                  <circle
                    className="knowledge-ripple"
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 8}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.38"
                  />
                )}
                <circle
                  className={isActive ? "knowledge-halo active" : "knowledge-halo"}
                  cx={node.x}
                  cy={node.y}
                  r={node.radius + (isActive ? 9 : 5)}
                  fill={color}
                  opacity={isActive ? 0.2 : 0.08}
                />
                <circle
                  className={isLit ? "knowledge-node lit" : "knowledge-node"}
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill={color}
                  opacity={isLit ? 0.92 : 0.24}
                  stroke={isActive ? T.green : T.bg}
                  strokeWidth={isActive ? 1.7 : 1}
                />
                {(node.kind === "profile" || isActive) && (
                  <text
                    x={node.x}
                    y={node.y - node.radius - 7}
                    textAnchor="middle"
                    fill={isActive ? T.green : T.sub}
                    fontFamily={FONT_MONO}
                    fontSize="8"
                  >
                    {node.label.length > 18 ? `${node.label.slice(0, 17)}...` : node.label}
                  </text>
                )}
                <circle
                  className="knowledge-hit"
                  aria-hidden="true"
                  cx={node.x}
                  cy={node.y}
                  r={node.radius + 12}
                  fill="transparent"
                  pointerEvents="all"
                />
              </g>
            );
          })}
        </svg>
        <style>{`
          #knowledge-rail .knowledge-hit {
            cursor: default;
          }
          #knowledge-rail .knowledge-edge {
            transition: stroke-opacity 160ms ease, stroke-width 160ms ease;
          }
          #knowledge-rail .knowledge-node {
            transform-box: fill-box;
            transform-origin: center;
            transition: opacity 160ms ease, r 160ms ease, stroke 160ms ease;
          }
          #knowledge-rail .knowledge-node.lit {
            animation: nodeBreathe 2.8s ease-in-out infinite;
          }
          #knowledge-rail .knowledge-halo {
            transform-box: fill-box;
            transform-origin: center;
            transition: opacity 160ms ease;
          }
          #knowledge-rail .knowledge-halo.active {
            animation: neuralPulse 2.2s ease-out infinite;
          }
          #knowledge-rail .knowledge-ripple {
            transform-box: fill-box;
            transform-origin: center;
            animation: neuralPulse 2.8s ease-out infinite;
          }
          #knowledge-rail .knowledge-signal {
            stroke-dasharray: 3 12;
            animation: signalFlow 1.9s linear infinite;
          }
          #knowledge-rail .knowledge-node-group:hover .knowledge-node {
            opacity: 0.98;
            stroke: ${T.green};
            transform: scale(1.18);
          }
          #knowledge-rail .knowledge-node-group:hover .knowledge-halo {
            opacity: 0.24;
            animation: neuralPulse 2.2s ease-out infinite;
          }
          #knowledge-rail .knowledge-node-group:hover text {
            fill: ${T.green};
          }
          ${hoverRules}
          @keyframes neuralPulse {
            0% { opacity: 0.34; transform: scale(0.86); }
            70% { opacity: 0.08; transform: scale(1.45); }
            100% { opacity: 0; transform: scale(1.65); }
          }
          @keyframes nodeBreathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.14); }
          }
          @keyframes signalFlow {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: -30; }
          }
        `}</style>
      </div>

      <div style={{ display: "grid", gap: "0.5rem", minHeight: 0 }}>
        {(hoveredNode ? [hoveredNode] : topNodes).map((node) => (
          <div
            key={node.id}
            style={{
              border: `1px solid ${node.section === active ? T.green : T.border}`,
              background: node.section === active ? T.greenBg : T.surface,
              color: node.section === active ? T.green : T.sub,
              borderRadius: "4px",
              padding: "0.55rem 0.65rem",
              textAlign: "left",
            }}
          >
            <span style={{ display: "block", fontFamily: FONT_MONO, fontSize: "0.55rem", color: nodeColor(node, T), textTransform: "uppercase", marginBottom: "0.2rem" }}>
              {kindLabel(node.kind)}
            </span>
            <span style={{ display: "block", fontFamily: FONT_SANS, fontSize: "0.72rem", color: T.text, lineHeight: 1.45 }}>
              {node.label}
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
