import type { ProfileContent } from "./types";

export function getProfileAvatarUrl(profile: ProfileContent): string {
  const configured = profile.avatarUrl?.trim();
  if (configured) return configured;
  return `https://github.com/${encodeURIComponent(profile.handle.trim())}.png`;
}
