import { describe, expect, it } from "vitest";
import { adminAccessState, type AdminSessionInfo } from "./adminAccess";

describe("adminAccessState", () => {
  it("waits while the session request is still loading", () => {
    expect(adminAccessState(null, false)).toBe("loading");
  });

  it("locks the admin editor when the visitor is not authenticated", () => {
    expect(adminAccessState({ authenticated: false }, false)).toBe("locked");
  });

  it("allows the admin editor for authenticated sessions", () => {
    const session: AdminSessionInfo = { authenticated: true, login: "NAMUORI00" };

    expect(adminAccessState(session, false)).toBe("granted");
  });

  it("allows local demo mode only when explicitly enabled", () => {
    expect(adminAccessState({ authenticated: false }, true)).toBe("granted");
  });
});
