import { describe, expect, it } from "vitest";
import type { ProfileContent } from "./types";
import { getProfileAvatarUrl } from "./profile";

const profile: ProfileContent = {
  name: "김유석",
  romanizedName: "KIM YUSEOK",
  handle: "NAMUORI00",
  status: "구직 중",
  headline: "AI 연구 · 엔지니어 지망",
  summaryLead: "효율적이고 확장 가능한 시스템을 구축하는 소프트웨어 엔지니어입니다.",
  summary: [],
  contacts: [],
};

describe("getProfileAvatarUrl", () => {
  it("uses the GitHub avatar URL when avatarUrl is empty", () => {
    expect(getProfileAvatarUrl(profile)).toBe("https://github.com/NAMUORI00.png");
    expect(getProfileAvatarUrl({ ...profile, avatarUrl: "  " })).toBe("https://github.com/NAMUORI00.png");
  });

  it("uses the configured avatar URL when provided", () => {
    expect(getProfileAvatarUrl({ ...profile, avatarUrl: "https://example.com/me.webp" })).toBe("https://example.com/me.webp");
  });
});
