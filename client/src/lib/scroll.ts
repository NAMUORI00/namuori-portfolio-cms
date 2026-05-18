interface ScrollTargetInput {
  containerTop: number;
  elementTop: number;
  scrollTop: number;
  offset: number;
}

interface SectionAnchor {
  id: string;
  top: number;
}

export function scrollTopForElement({ containerTop, elementTop, scrollTop, offset }: ScrollTargetInput): number {
  return Math.max(0, scrollTop + elementTop - containerTop - offset);
}

export function activeSectionForAnchor(sections: SectionAnchor[], anchorTop: number, isAtEnd = false): string | undefined {
  if (isAtEnd) return sections.at(-1)?.id;

  let active = sections[0]?.id;
  for (const section of sections) {
    if (section.top > anchorTop) break;
    active = section.id;
  }
  return active;
}
