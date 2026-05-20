import { describe, expect, it } from "vitest";
import { encodeFileContentForGitHub } from "../../../functions/_utils/github.js";

describe("GitHub file content encoding", () => {
  it("encodes text content as UTF-8 base64 by default", () => {
    expect(encodeFileContentForGitHub({ content: "김유석" })).toBe("6rmA7Jyg7ISd");
  });

  it("passes through valid base64 file content", () => {
    expect(encodeFileContentForGitHub({ content: "aGVsbG8=", encoding: "base64" })).toBe("aGVsbG8=");
  });

  it("rejects malformed base64 file content", () => {
    expect(() => encodeFileContentForGitHub({ content: "not base64!?", encoding: "base64" })).toThrow("Invalid base64 file content");
  });
});
