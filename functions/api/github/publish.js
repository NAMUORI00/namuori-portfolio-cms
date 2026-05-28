import { createOrUpdatePullRequest } from "../../_utils/github.js";
import { requireAdminMutationRequest, validateDraftBranchName } from "../../_utils/security.js";
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
  let branch;
  try {
    branch = validateDraftBranchName(payload.branch);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid draft branch" }, { status: 400 });
  }
  try {
    const pull = await createOrUpdatePullRequest(env, {
      branch,
      title: String(payload.title || `Publish ${branch}`),
      body: String(payload.body || "Portfolio admin publish request."),
      base: "main",
    });
    return Response.json(pull);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Publish failed" }, { status: 500 });
  }
}
