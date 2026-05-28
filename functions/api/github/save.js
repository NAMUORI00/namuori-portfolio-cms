import { ensureBranch, upsertFile } from "../../_utils/github.js";
import { requireAdminMutationRequest, validateSavePayload } from "../../_utils/security.js";
import { requireSession } from "../../_utils/session.js";

export async function onRequestPost({ env, request }) {
  const auth = await requireSession(env, request);
  if (auth.response) return auth.response;
  const mutation = requireAdminMutationRequest(env, request);
  if (mutation) return mutation;
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }
  let save;
  try {
    save = validateSavePayload(payload);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid save payload" }, { status: 400 });
  }
  const message = String(payload.message || "Update portfolio content");
  try {
    await ensureBranch(env, save.branch);
    const commits = [];
    for (const file of save.files) {
      const result = await upsertFile(env, { path: file.path, content: file.content, encoding: file.encoding, branch: save.branch, message });
      commits.push(result.commit);
    }
    return Response.json({ branch: save.branch, commits });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Save failed" }, { status: 500 });
  }
}
