export type AdminUxSectionKey = "profile" | "education" | "research" | "projects" | "skills" | "starred" | "notes";
export type AdminImportScope = "projects" | "skills" | "starred";
export type AdminAction = "save" | "publish";

export interface ImportAppliedState {
  projects: string[];
  skills: string[];
  starred: string[];
}

const SECTION_LABELS: Record<AdminUxSectionKey, string> = {
  profile: "Profile",
  education: "Timeline",
  research: "Research",
  projects: "Projects",
  skills: "Skills",
  starred: "Starred",
  notes: "Notes",
};

export function sectionLabel(section: AdminUxSectionKey): string {
  return SECTION_LABELS[section];
}

export function sectionActionLabel(section: AdminUxSectionKey, action: AdminAction): string {
  const verb = action === "save" ? "Save" : "Publish";
  const noun = action === "save" ? "draft" : "PR";
  return `${verb} ${sectionLabel(section)} ${noun}`;
}

export function saveScopeSummary(section: AdminUxSectionKey, branch: string): string {
  return `Current target: ${sectionLabel(section)} · ${branch}`;
}

export function canSaveDraft(canEdit: boolean, dirty: boolean): boolean {
  return canEdit && dirty;
}

export function canPublishDraft(canEdit: boolean, dirty: boolean, draftReady: boolean): boolean {
  return canEdit && draftReady && !dirty;
}

export function editableListKey(scope: string, index: number, nestedIndex?: number): string {
  return nestedIndex === undefined ? `${scope}:${index}` : `${scope}:${index}:${nestedIndex}`;
}

export function hasDirtySection(dirtySections: AdminUxSectionKey[], section: AdminUxSectionKey): boolean {
  return dirtySections.includes(section);
}

export function markDirtySection(dirtySections: AdminUxSectionKey[], section: AdminUxSectionKey): AdminUxSectionKey[] {
  if (dirtySections.includes(section)) return dirtySections;
  return [...dirtySections, section];
}

export function clearDirtySection(dirtySections: AdminUxSectionKey[], section: AdminUxSectionKey): AdminUxSectionKey[] {
  return dirtySections.filter((item) => item !== section);
}

export function createImportAppliedState(): ImportAppliedState {
  return { projects: [], skills: [], starred: [] };
}

function mergeKeys(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing);
  const next = [...existing];
  for (const value of incoming) {
    const clean = value.trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    next.push(clean);
  }
  return next;
}

export function markImportApplied(state: ImportAppliedState, scope: AdminImportScope, keys: string[]): ImportAppliedState {
  return {
    ...state,
    [scope]: mergeKeys(state[scope], keys),
  };
}

export function clearImportApplied(state: ImportAppliedState, scope: AdminImportScope): ImportAppliedState {
  return {
    ...state,
    [scope]: [],
  };
}

export function isImportApplied(state: ImportAppliedState, scope: AdminImportScope, key: string): boolean {
  return state[scope].includes(key.trim());
}
