export interface AdminSessionInfo {
  authenticated: boolean;
  login?: string;
}

export type AdminAccessState = "loading" | "locked" | "granted";

export function adminAccessState(session: AdminSessionInfo | null, localPreview: boolean): AdminAccessState {
  if (localPreview) return "granted";
  if (!session) return "loading";
  return session.authenticated ? "granted" : "locked";
}
