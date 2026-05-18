import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { portfolioContent, type EducationEntry, type NoteEntry, type ProfileContent, type ProjectEntry, type ResearchEntry, type SkillGroup, type StarredRepo } from "@/content";
import { toMarkdownHtml } from "@/content/markdown";
import { DARK, FONT_MONO, FONT_SANS, LIGHT } from "@/content/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { adminAccessState, type AdminSessionInfo } from "@/lib/adminAccess";
import { buildSavePayload, type SavePayload, type SaveTarget } from "@/lib/adminContent";

type SectionKey = "profile" | "education" | "research" | "projects" | "skills" | "starred" | "notes";
type EditorMode = "write" | "source" | "preview";

const SECTIONS: Array<{ key: SectionKey; label: string }> = [
  { key: "profile", label: "Profile" },
  { key: "education", label: "Timeline" },
  { key: "research", label: "Research" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "starred", label: "Starred" },
  { key: "notes", label: "Notes" },
];

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input disabled={disabled} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  disabled,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <label className="admin-field admin-field-block">
      <span>{label}</span>
      <textarea disabled={disabled} rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function MarkdownEditor({
  label,
  body,
  mode,
  onMode,
  onChange,
  disabled,
}: {
  label: string;
  body: string;
  mode: EditorMode;
  onMode: (mode: EditorMode) => void;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="admin-editor">
      <div className="admin-editor-bar">
        <span>{label}</span>
        <div>
          {(["write", "source", "preview"] as EditorMode[]).map((item) => (
            <button key={item} type="button" className={mode === item ? "active" : ""} onClick={() => onMode(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>
      {mode === "write" && (
        <div
          className="admin-wysiwyg"
          contentEditable={!disabled}
          suppressContentEditableWarning
          onBlur={(event) => onChange(event.currentTarget.innerText)}
        >
          {body}
        </div>
      )}
      {mode === "source" && <textarea disabled={disabled} rows={12} value={body} onChange={(event) => onChange(event.target.value)} />}
      {mode === "preview" && <div className="admin-preview" dangerouslySetInnerHTML={{ __html: toMarkdownHtml(body) }} />}
    </div>
  );
}

export default function Admin() {
  const { theme, toggleTheme } = useTheme();
  const T = theme === "dark" ? DARK : LIGHT;
  const localPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get("demo") === "1";
  const [session, setSession] = useState<AdminSessionInfo | null>(null);
  const [active, setActive] = useState<SectionKey>("profile");
  const [profile, setProfile] = useState<ProfileContent>(portfolioContent.profile);
  const [education, setEducation] = useState<EducationEntry[]>(portfolioContent.education);
  const [research, setResearch] = useState<ResearchEntry[]>(portfolioContent.research);
  const [projects, setProjects] = useState<ProjectEntry[]>(portfolioContent.projects);
  const [skills, setSkills] = useState<SkillGroup[]>(portfolioContent.skills);
  const [starred, setStarred] = useState<StarredRepo[]>(portfolioContent.starred);
  const [notes, setNotes] = useState<NoteEntry[]>(portfolioContent.notes);
  const [researchIndex, setResearchIndex] = useState(0);
  const [projectIndex, setProjectIndex] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);
  const [mode, setMode] = useState<EditorMode>("write");
  const [status, setStatus] = useState("변경사항을 저장하면 draft 브랜치 커밋으로 전송됩니다.");

  const access = adminAccessState(session, localPreview);
  const canEdit = access === "granted";

  useEffect(() => {
    fetch("/api/auth/session")
      .then((response) => (response.ok ? response.json() : { authenticated: false }))
      .then((data) => setSession(data))
      .catch(() => setSession({ authenticated: false }));
  }, []);

  const target = useMemo<SaveTarget>(() => {
    if (active === "profile") return { kind: "profile", value: profile };
    if (active === "education") return { kind: "education", value: education };
    if (active === "skills") return { kind: "skills", value: skills };
    if (active === "starred") return { kind: "starred", value: starred };
    if (active === "research") return { kind: "research", value: research[researchIndex] };
    if (active === "projects") return { kind: "project", value: projects[projectIndex] };
    return { kind: "note", value: notes[noteIndex] };
  }, [active, education, noteIndex, notes, profile, projectIndex, projects, research, researchIndex, skills, starred]);

  const savePayload = useMemo<SavePayload>(() => buildSavePayload(target), [target]);

  async function postJson(path: string, payload: unknown) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
  }

  async function saveDraft() {
    if (!canEdit) return;
    if (localPreview && !session?.authenticated) {
      setStatus(`로컬 미리보기: ${savePayload.branch}에 ${savePayload.files.length}개 파일을 저장할 준비가 됐습니다.`);
      return;
    }
    try {
      setStatus("GitHub draft 브랜치에 저장 중...");
      const result = await postJson("/api/github/save", savePayload);
      setStatus(`저장 완료: ${result.branch || savePayload.branch}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "저장에 실패했습니다.");
    }
  }

  async function publishDraft() {
    if (!canEdit) return;
    const payload = {
      branch: savePayload.branch,
      title: savePayload.message,
      body: "Portfolio admin에서 생성한 발행 요청입니다.",
    };
    if (localPreview && !session?.authenticated) {
      setStatus(`로컬 미리보기: ${payload.branch}에서 PR을 만들 준비가 됐습니다.`);
      return;
    }
    try {
      setStatus("Pull request 생성/업데이트 중...");
      const result = await postJson("/api/github/publish", payload);
      setStatus(`PR 준비 완료: ${result.html_url || result.url || payload.branch}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "PR 발행에 실패했습니다.");
    }
  }

  function updateProject(next: Partial<ProjectEntry>) {
    setProjects((items) => items.map((item, index) => (index === projectIndex ? { ...item, ...next } : item)));
  }

  function updateResearch(next: Partial<ResearchEntry>) {
    setResearch((items) => items.map((item, index) => (index === researchIndex ? { ...item, ...next } : item)));
  }

  function updateNote(next: Partial<NoteEntry>) {
    setNotes((items) => items.map((item, index) => (index === noteIndex ? { ...item, ...next } : item)));
  }

  function renderEditor() {
    if (active === "profile") {
      return (
        <div className="admin-grid">
          <Field disabled={!canEdit} label="Name" value={profile.name} onChange={(name) => setProfile({ ...profile, name })} />
          <Field disabled={!canEdit} label="Handle" value={profile.handle} onChange={(handle) => setProfile({ ...profile, handle })} />
          <Field disabled={!canEdit} label="Status" value={profile.status} onChange={(status) => setProfile({ ...profile, status })} />
          <Field disabled={!canEdit} label="Avatar URL" value={profile.avatarUrl ?? ""} onChange={(avatarUrl) => setProfile({ ...profile, avatarUrl })} />
          <TextArea disabled={!canEdit} label="Headline" value={profile.headline} onChange={(headline) => setProfile({ ...profile, headline })} rows={3} />
          <TextArea disabled={!canEdit} label="Lead" value={profile.summaryLead} onChange={(summaryLead) => setProfile({ ...profile, summaryLead })} rows={4} />
          <TextArea disabled={!canEdit} label="Summary paragraphs" value={profile.summary.join("\n\n")} onChange={(value) => setProfile({ ...profile, summary: value.split(/\n\s*\n/).filter(Boolean) })} rows={8} />
        </div>
      );
    }
    if (active === "education") {
      return (
        <div className="admin-stack">
          {education.map((item, index) => (
            <div className="admin-card" key={`${item.degree}-${index}`}>
              <Field disabled={!canEdit} label="Degree" value={item.degree} onChange={(degree) => setEducation((items) => items.map((entry, i) => (i === index ? { ...entry, degree } : entry)))} />
              <Field disabled={!canEdit} label="School" value={item.school} onChange={(school) => setEducation((items) => items.map((entry, i) => (i === index ? { ...entry, school } : entry)))} />
              <Field disabled={!canEdit} label="Period" value={item.period} onChange={(period) => setEducation((items) => items.map((entry, i) => (i === index ? { ...entry, period } : entry)))} />
              <TextArea disabled={!canEdit} label="Note" value={item.note} onChange={(note) => setEducation((items) => items.map((entry, i) => (i === index ? { ...entry, note } : entry)))} rows={3} />
            </div>
          ))}
        </div>
      );
    }
    if (active === "projects") {
      const project = projects[projectIndex];
      return (
        <div className="admin-stack">
          <select disabled={!canEdit} value={projectIndex} onChange={(event) => setProjectIndex(Number(event.target.value))}>
            {projects.map((item, index) => <option key={item.slug} value={index}>{item.name}</option>)}
          </select>
          <div className="admin-grid">
            <Field disabled={!canEdit} label="Name" value={project.name} onChange={(name) => updateProject({ name })} />
            <Field disabled={!canEdit} label="Slug" value={project.slug} onChange={(slug) => updateProject({ slug })} />
            <Field disabled={!canEdit} label="Period" value={project.period} onChange={(period) => updateProject({ period })} />
            <Field disabled={!canEdit} label="Link" value={project.link} onChange={(link) => updateProject({ link })} />
            <TextArea disabled={!canEdit} label="Description" value={project.desc} onChange={(desc) => updateProject({ desc })} rows={4} />
            <TextArea disabled={!canEdit} label="Metric" value={project.metric} onChange={(metric) => updateProject({ metric })} rows={2} />
            <Field disabled={!canEdit} label="Tags" value={project.tags.join(", ")} onChange={(value) => updateProject({ tags: splitList(value) })} />
            <Field disabled={!canEdit} label="Related notes" value={project.relatedNotes.join(", ")} onChange={(value) => updateProject({ relatedNotes: splitList(value) })} />
          </div>
          <MarkdownEditor disabled={!canEdit} label="Project body" body={project.body} mode={mode} onMode={setMode} onChange={(body) => updateProject({ body })} />
        </div>
      );
    }
    if (active === "research") {
      const item = research[researchIndex];
      return (
        <div className="admin-stack">
          <select disabled={!canEdit} value={researchIndex} onChange={(event) => setResearchIndex(Number(event.target.value))}>
            {research.map((entry, index) => <option key={entry.slug} value={index}>{entry.title}</option>)}
          </select>
          <div className="admin-grid">
            <Field disabled={!canEdit} label="Title" value={item.title} onChange={(title) => updateResearch({ title })} />
            <Field disabled={!canEdit} label="Slug" value={item.slug} onChange={(slug) => updateResearch({ slug })} />
            <TextArea disabled={!canEdit} label="Description" value={item.desc} onChange={(desc) => updateResearch({ desc })} rows={4} />
            <Field disabled={!canEdit} label="Related notes" value={item.relatedNotes.join(", ")} onChange={(value) => updateResearch({ relatedNotes: splitList(value) })} />
          </div>
          <MarkdownEditor disabled={!canEdit} label="Research body" body={item.body} mode={mode} onMode={setMode} onChange={(body) => updateResearch({ body })} />
        </div>
      );
    }
    if (active === "skills") {
      return (
        <div className="admin-stack">
          {skills.map((group, index) => (
            <div className="admin-card" key={group.label}>
              <Field disabled={!canEdit} label="Group" value={group.label} onChange={(label) => setSkills((items) => items.map((item, i) => (i === index ? { ...item, label } : item)))} />
              <Field disabled={!canEdit} label="Items" value={group.items.join(", ")} onChange={(value) => setSkills((items) => items.map((item, i) => (i === index ? { ...item, items: splitList(value) } : item)))} />
            </div>
          ))}
        </div>
      );
    }
    if (active === "starred") {
      return (
        <div className="admin-stack">
          {starred.map((repo, index) => (
            <div className="admin-card" key={`${repo.name}-${index}`}>
              <Field disabled={!canEdit} label="Repo" value={repo.name} onChange={(name) => setStarred((items) => items.map((item, i) => (i === index ? { ...item, name } : item)))} />
              <Field disabled={!canEdit} label="Stars" value={repo.stars} onChange={(stars) => setStarred((items) => items.map((item, i) => (i === index ? { ...item, stars } : item)))} />
              <Field disabled={!canEdit} label="Description" value={repo.desc} onChange={(desc) => setStarred((items) => items.map((item, i) => (i === index ? { ...item, desc } : item)))} />
            </div>
          ))}
        </div>
      );
    }
    const note = notes[noteIndex];
    return (
      <div className="admin-stack">
        <select disabled={!canEdit} value={noteIndex} onChange={(event) => setNoteIndex(Number(event.target.value))}>
          {notes.map((item, index) => <option key={item.slug} value={index}>{item.title}</option>)}
        </select>
        <div className="admin-grid">
          <Field disabled={!canEdit} label="Title" value={note.title} onChange={(title) => updateNote({ title })} />
          <Field disabled={!canEdit} label="Slug" value={note.slug} onChange={(slug) => updateNote({ slug })} />
          <Field disabled={!canEdit} label="Date" value={note.date} onChange={(date) => updateNote({ date })} />
          <Field disabled={!canEdit} label="Tags" value={note.tags.join(", ")} onChange={(value) => updateNote({ tags: splitList(value) })} />
          <TextArea disabled={!canEdit} label="Summary" value={note.summary} onChange={(summary) => updateNote({ summary })} rows={3} />
          <Field disabled={!canEdit} label="Related projects" value={note.relatedProjects.join(", ")} onChange={(value) => updateNote({ relatedProjects: splitList(value) })} />
          <Field disabled={!canEdit} label="Related research" value={note.relatedResearch.join(", ")} onChange={(value) => updateNote({ relatedResearch: splitList(value) })} />
        </div>
        <MarkdownEditor disabled={!canEdit} label="Note body" body={note.body} mode={mode} onMode={setMode} onChange={(body) => updateNote({ body })} />
      </div>
    );
  }

  function renderAccessGate() {
    return (
      <main style={{ minHeight: "100dvh", background: T.bg, color: T.text, fontFamily: FONT_SANS }}>
        <div className="admin-login-shell">
          <section className="admin-login-card" style={{ background: T.surface, borderColor: T.border }}>
            <Link href="/" className="admin-back" style={{ color: T.green }}>← Portfolio</Link>
            <span className="admin-kicker">admin access</span>
            <h1>{access === "loading" ? "세션 확인 중" : "관리자 로그인이 필요합니다"}</h1>
            <p>
              {access === "loading"
                ? "관리자 세션을 확인하고 있습니다."
                : "포트폴리오 콘텐츠를 작성하거나 수정하려면 허용된 GitHub 계정으로 로그인하세요."}
            </p>
            {access === "locked" && (
              <div className="admin-login-actions">
                <a href="/api/auth/login">GitHub로 로그인</a>
              </div>
            )}
          </section>
        </div>
        <style>{`
          .admin-login-shell { min-height: 100dvh; display: grid; place-items: center; padding: 24px; }
          .admin-login-card { width: min(100%, 440px); border: 1px solid; border-radius: 6px; padding: 28px; }
          .admin-login-card h1 { margin: 18px 0 10px; font-size: 1.5rem; }
          .admin-login-card p { color: ${T.sub}; line-height: 1.7; margin: 0; }
          .admin-login-actions { display: flex; gap: 8px; margin-top: 22px; }
          .admin-login-actions a {
            border: 1px solid ${T.green}; background: ${T.greenBg}; color: ${T.green};
            border-radius: 4px; padding: 9px 12px; font-family: ${FONT_MONO}; text-decoration: none;
          }
          .admin-back { font-family: ${FONT_MONO}; font-size: .75rem; text-decoration: none; }
          .admin-kicker { display: inline-block; color: ${T.green}; font-family: ${FONT_MONO}; font-size: .72rem; text-transform: uppercase; margin-top: 20px; }
        `}</style>
      </main>
    );
  }

  if (access !== "granted") return renderAccessGate();

  return (
    <main style={{ minHeight: "100dvh", background: T.bg, color: T.text, fontFamily: FONT_SANS }}>
      <div className="admin-shell">
        <aside className="admin-sidebar" style={{ background: T.sidebarBg, borderColor: T.border }}>
          <Link href="/" className="admin-back" style={{ color: T.green }}>← Portfolio</Link>
          <h1>Admin</h1>
          <p>{session?.authenticated ? `@${session.login}` : localPreview ? "local preview" : "GitHub login required"}</p>
          <nav>
            {SECTIONS.map((section) => (
              <button key={section.key} className={active === section.key ? "active" : ""} onClick={() => setActive(section.key)}>
                {section.label}
              </button>
            ))}
          </nav>
        </aside>
        <section className="admin-main" style={{ background: T.surface, borderColor: T.border }}>
          <header className="admin-header">
            <div>
              <span className="admin-kicker">draft branch</span>
              <h2>{savePayload.branch}</h2>
              <p>{status}</p>
            </div>
            <div className="admin-actions">
              <button type="button" onClick={toggleTheme}>{theme === "dark" ? "Light" : "Dark"}</button>
              {!session?.authenticated && !localPreview && <a href="/api/auth/login">GitHub Login</a>}
              {!session?.authenticated && import.meta.env.DEV && !localPreview && <a href="/admin?demo=1">Local Preview</a>}
              {session?.authenticated && <a href="/api/auth/logout">Logout</a>}
              <button type="button" disabled={!canEdit} onClick={saveDraft}>Save draft</button>
              <button type="button" disabled={!canEdit} onClick={publishDraft}>Publish PR</button>
            </div>
          </header>
          <div className="admin-panel">{renderEditor()}</div>
        </section>
      </div>
      <style>{`
        .admin-shell { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: 100dvh; }
        .admin-sidebar { border-right: 1px solid; padding: 28px 20px; }
        .admin-sidebar h1 { margin: 18px 0 4px; font-size: 1.6rem; }
        .admin-sidebar p, .admin-header p { color: ${T.sub}; margin: 0; line-height: 1.6; }
        .admin-back { font-family: ${FONT_MONO}; font-size: .75rem; text-decoration: none; }
        .admin-sidebar nav { display: grid; gap: 4px; margin-top: 28px; }
        .admin-sidebar button, .admin-actions button, .admin-actions a, .admin-editor-bar button {
          border: 1px solid ${T.border}; background: ${T.surface}; color: ${T.sub};
          border-radius: 4px; padding: 8px 10px; font-family: ${FONT_MONO}; cursor: pointer; text-decoration: none;
        }
        .admin-sidebar button { text-align: left; }
        .admin-sidebar button.active, .admin-editor-bar button.active { color: ${T.green}; border-color: ${T.green}; background: ${T.greenBg}; }
        .admin-actions button:disabled { opacity: .45; cursor: not-allowed; }
        .admin-main { border-left: 0; min-width: 0; padding: 28px; }
        .admin-header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 22px; }
        .admin-header h2 { margin: 4px 0 6px; font-size: 1.35rem; font-family: ${FONT_MONO}; }
        .admin-kicker { color: ${T.green}; font-family: ${FONT_MONO}; font-size: .72rem; text-transform: uppercase; }
        .admin-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
        .admin-panel { border: 1px solid ${T.border}; border-radius: 6px; padding: 18px; background: ${T.bg}; }
        .admin-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .admin-stack { display: grid; gap: 14px; }
        .admin-card { border: 1px solid ${T.border}; background: ${T.surface}; border-radius: 6px; padding: 14px; display: grid; gap: 12px; }
        .admin-field { display: grid; gap: 6px; color: ${T.sub}; font-size: .78rem; font-family: ${FONT_MONO}; }
        .admin-field-block { grid-column: 1 / -1; }
        .admin-field input, .admin-field textarea, .admin-stack select, .admin-editor textarea, .admin-wysiwyg {
          width: 100%; box-sizing: border-box; border: 1px solid ${T.border}; background: ${T.surface}; color: ${T.text};
          border-radius: 4px; padding: 10px 11px; font-family: ${FONT_SANS}; font-size: .92rem; line-height: 1.7;
        }
        .admin-editor { display: grid; gap: 10px; }
        .admin-editor-bar { display: flex; justify-content: space-between; align-items: center; color: ${T.sub}; font-family: ${FONT_MONO}; font-size: .78rem; }
        .admin-editor-bar div { display: flex; gap: 6px; }
        .admin-wysiwyg, .admin-preview { min-height: 240px; white-space: pre-wrap; }
        .admin-preview { border: 1px solid ${T.border}; background: ${T.surface}; border-radius: 4px; padding: 12px; color: ${T.sub}; }
        @media (max-width: 860px) {
          .admin-shell { grid-template-columns: 1fr; }
          .admin-sidebar { border-right: 0; border-bottom: 1px solid; }
          .admin-grid { grid-template-columns: 1fr; }
          .admin-header { flex-direction: column; }
          .admin-actions { justify-content: flex-start; }
        }
      `}</style>
    </main>
  );
}
