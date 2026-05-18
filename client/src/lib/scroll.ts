interface ScrollTargetInput {
  containerTop: number;
  elementTop: number;
  scrollTop: number;
  offset: number;
}

export function scrollTopForElement({ containerTop, elementTop, scrollTop, offset }: ScrollTargetInput): number {
  return Math.max(0, scrollTop + elementTop - containerTop - offset);
}
