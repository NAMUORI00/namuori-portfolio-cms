import { describe, expect, it } from "vitest";
import { scrollTopForElement } from "./scroll";

describe("scrollTopForElement", () => {
  it("calculates target scroll from viewport-relative positions", () => {
    expect(
      scrollTopForElement({
        containerTop: 0,
        elementTop: 1609.25,
        scrollTop: 0,
        offset: 32,
      }),
    ).toBe(1577.25);
  });

  it("keeps the target non-negative near the top", () => {
    expect(
      scrollTopForElement({
        containerTop: 120,
        elementTop: 132,
        scrollTop: 0,
        offset: 32,
      }),
    ).toBe(0);
  });
});
