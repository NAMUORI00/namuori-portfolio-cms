import type { KnowledgeGraphData, KnowledgeGraphLink, KnowledgeGraphNode } from "./knowledgeGraph";

export interface PositionedKnowledgeNode extends KnowledgeGraphNode {
  x: number;
  y: number;
  radius: number;
}

export interface PositionedKnowledgeLink extends Omit<KnowledgeGraphLink, "source" | "target"> {
  sourceId: string;
  targetId: string;
  source: PositionedKnowledgeNode;
  target: PositionedKnowledgeNode;
}

export interface PositionedKnowledgeGraph {
  nodes: PositionedKnowledgeNode[];
  links: PositionedKnowledgeLink[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hashFraction(value: string, salt = ""): number {
  let hash = 2166136261;
  for (const char of `${salt}:${value}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

function ringForKind(kind: KnowledgeGraphNode["kind"]): number {
  if (kind === "profile") return 0;
  if (kind === "project" || kind === "research") return 0.48;
  if (kind === "note" || kind === "skill") return 0.66;
  return 0.82;
}

function phaseForKind(kind: KnowledgeGraphNode["kind"]): number {
  if (kind === "project") return -Math.PI / 2;
  if (kind === "research") return -0.1;
  if (kind === "note") return 1.4;
  if (kind === "skill") return 2.4;
  if (kind === "repo") return 3.4;
  return 4.2;
}

function nodeRadius(node: KnowledgeGraphNode): number {
  if (node.kind === "profile") return 8.5;
  if (node.kind === "project" || node.kind === "research") return 5.2 + node.weight;
  return 3.5 + Math.min(4, node.weight);
}

function linkDistance(link: Pick<KnowledgeGraphLink, "kind" | "weight">): number {
  if (link.kind === "related") return 48;
  if (link.kind === "tag" || link.kind === "term") return Math.max(42, 76 - link.weight * 10);
  if (link.kind === "profile") return 76;
  if (link.kind === "skill") return 92;
  if (link.kind === "repo") return 108;
  return 78;
}

export function layoutKnowledgeGraph(graph: KnowledgeGraphData, width: number, height: number): PositionedKnowledgeGraph {
  const centerX = Math.round(width / 2);
  const centerY = Math.round(height / 2);
  const padding = 34;
  const softPadding = padding + 10;
  const maxRadius = Math.max(32, Math.min(width, height) / 2 - padding);
  const positioned = graph.nodes.map((node) => {
    if (node.kind === "profile") {
      return { ...node, x: centerX, y: centerY, radius: nodeRadius(node) };
    }

    const angle = phaseForKind(node.kind) + hashFraction(node.id, "angle") * Math.PI * 2;
    const wave = 0.86 + hashFraction(node.id, "wave") * 0.26;
    const distance = maxRadius * ringForKind(node.kind) * wave;
    const radius = nodeRadius(node);

    return {
      ...node,
      x: Math.round(clamp(centerX + Math.cos(angle) * distance, padding, width - padding)),
      y: Math.round(clamp(centerY + Math.sin(angle) * distance, padding, height - padding)),
      radius,
    };
  });

  const byId = new Map(positioned.map((node) => [node.id, node]));
  const links = graph.links.flatMap((link) => {
    const source = byId.get(link.source);
    const target = byId.get(link.target);
    if (!source || !target) return [];
    return [{ ...link, sourceId: link.source, targetId: link.target, source, target }];
  });

  const movable = new Set(positioned.filter((node) => node.kind !== "profile").map((node) => node.id));
  const velocity = new Map(positioned.map((node) => [node.id, { x: 0, y: 0 }]));
  const iterations = 96;

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const alpha = 1 - iteration / iterations;

    for (let i = 0; i < positioned.length; i += 1) {
      const a = positioned[i];
      for (let j = i + 1; j < positioned.length; j += 1) {
        const b = positioned[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distance = Math.hypot(dx, dy);
        if (distance < 0.01) {
          const angle = hashFraction(`${a.id}-${b.id}`, "jitter") * Math.PI * 2;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          distance = 1;
        }
        const minDistance = a.radius + b.radius + 10;
        const collision = Math.max(0, minDistance - distance);
        const repel = (18 / Math.max(distance, 12) + collision * 0.1) * alpha;
        const fx = (dx / distance) * repel;
        const fy = (dy / distance) * repel;
        if (movable.has(a.id)) {
          const av = velocity.get(a.id);
          if (av) {
            av.x -= fx;
            av.y -= fy;
          }
        }
        if (movable.has(b.id)) {
          const bv = velocity.get(b.id);
          if (bv) {
            bv.x += fx;
            bv.y += fy;
          }
        }
      }
    }

    for (const link of links) {
      const source = link.source;
      const target = link.target;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const desired = linkDistance(link);
      const force = (distance - desired) * 0.018 * Math.max(0.8, link.weight) * alpha;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      if (movable.has(source.id)) {
        const sv = velocity.get(source.id);
        if (sv) {
          sv.x += fx;
          sv.y += fy;
        }
      }
      if (movable.has(target.id)) {
        const tv = velocity.get(target.id);
        if (tv) {
          tv.x -= fx;
          tv.y -= fy;
        }
      }
    }

    for (const node of positioned) {
      if (!movable.has(node.id)) {
        node.x = centerX;
        node.y = centerY;
        continue;
      }
      const v = velocity.get(node.id);
      if (!v) continue;
      const centerPull = node.kind === "term" || node.kind === "repo" ? 0.0032 : 0.0042;
      v.x += (centerX - node.x) * centerPull * alpha;
      v.y += (centerY - node.y) * centerPull * alpha;
      if (node.x < softPadding) v.x += (softPadding - node.x) * 0.035 * alpha;
      if (node.x > width - softPadding) v.x -= (node.x - (width - softPadding)) * 0.035 * alpha;
      if (node.y < softPadding) v.y += (softPadding - node.y) * 0.035 * alpha;
      if (node.y > height - softPadding) v.y -= (node.y - (height - softPadding)) * 0.035 * alpha;
      node.x = clamp(node.x + v.x, padding, width - padding);
      node.y = clamp(node.y + v.y, padding, height - padding);
      v.x *= 0.68;
      v.y *= 0.68;
    }
  }

  for (const node of positioned) {
    node.x = Math.round(node.x);
    node.y = Math.round(node.y);
  }

  return { nodes: positioned, links };
}

export function curvedKnowledgeLinkPath(link: PositionedKnowledgeLink): string {
  const sx = link.source.x;
  const sy = link.source.y;
  const tx = link.target.x;
  const ty = link.target.y;
  const dx = tx - sx;
  const dy = ty - sy;
  const length = Math.max(1, Math.hypot(dx, dy));
  const bend = Math.min(28, 8 + link.weight * 4);
  const normalX = -dy / length;
  const normalY = dx / length;
  const cx = Math.round((sx + tx) / 2 + normalX * bend);
  const cy = Math.round((sy + ty) / 2 + normalY * bend);

  return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
}
