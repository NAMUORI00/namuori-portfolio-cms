const encoder = new TextEncoder();

const MAX_SAVE_FILES = 6;
const MAX_TEXT_FILE_BYTES = 256 * 1024;
const MAX_IMAGE_FILE_BYTES = Math.floor(1.5 * 1024 * 1024);
const MAX_TOTAL_SAVE_BYTES = 3 * 1024 * 1024;
const ADMIN_MUTATION_HEADER = "X-Namuori-Admin-Request";

const TEXT_FILE_PATHS = new Set([
  "content/site.json",
  "content/profile.json",
  "content/education.json",
  "content/skills.json",
  "content/starred.json",
  "content/order.json",
  "content/i18n/en.json",
]);

const MDX_PATH_PATTERN = /^content\/(projects|research|notes)\/[A-Za-z0-9가-힣._-]+\.mdx$/u;
const UPLOAD_PATH_PATTERN = /^client\/public\/uploads\/(avatar|projects|research)\/[A-Za-z0-9가-힣._-]+\.(png|jpe?g|webp)$/iu;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function byteLength(value) {
  return encoder.encode(value).byteLength;
}

function decodedBase64Bytes(value) {
  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  return Math.floor((value.length * 3) / 4) - padding;
}

function normalizePath(path) {
  const normalized = String(path || "").trim().replace(/\\/g, "/");
  if (!normalized || normalized.startsWith("/") || /^[A-Za-z]:/.test(normalized)) {
    throw new Error("File path is not allowed");
  }
  if (normalized.split("/").some((part) => part === ".." || part === "." || part.startsWith("."))) {
    throw new Error("File path is not allowed");
  }
  return normalized;
}

function fileKind(path) {
  if (TEXT_FILE_PATHS.has(path) || MDX_PATH_PATTERN.test(path)) return "text";
  if (UPLOAD_PATH_PATTERN.test(path)) return "image";
  return null;
}

export function validateDraftBranchName(value) {
  const branch = String(value || "").trim();
  if (!branch.startsWith("draft/")) {
    throw new Error("Draft branch must start with draft/");
  }
  if (!/^draft\/[A-Za-z0-9._-]+$/.test(branch)) {
    throw new Error("Invalid draft branch name");
  }
  return branch;
}

export function validateSaveFile(file) {
  if (!file || typeof file !== "object" || typeof file.content !== "string") {
    throw new Error("Each file requires path and content");
  }
  const path = normalizePath(file.path);
  const kind = fileKind(path);
  if (!kind) {
    throw new Error(`File path is not allowed: ${path}`);
  }

  const encoding = file.encoding ?? "text";
  if (kind === "image") {
    if (encoding !== "base64") {
      throw new Error("Upload image files must use base64 encoding");
    }
    const content = file.content.replace(/\s+/g, "");
    if (!content || !BASE64_PATTERN.test(content)) {
      throw new Error("Invalid base64 file content");
    }
    const bytes = decodedBase64Bytes(content);
    if (bytes > MAX_IMAGE_FILE_BYTES) {
      throw new Error("Upload image files must be 1.5MB or smaller");
    }
    return { path, content, encoding, bytes };
  }

  if (encoding !== "text") {
    throw new Error("Content files must use text encoding");
  }
  const bytes = byteLength(file.content);
  if (bytes > MAX_TEXT_FILE_BYTES) {
    throw new Error("Text content files must be 256KB or smaller");
  }
  return { path, content: file.content, encoding, bytes };
}

export function validateSavePayload(payload) {
  const branch = validateDraftBranchName(payload?.branch);
  const files = Array.isArray(payload?.files) ? payload.files : [];
  if (files.length === 0) {
    throw new Error("No files provided");
  }
  if (files.length > MAX_SAVE_FILES) {
    throw new Error(`A save request can include at most ${MAX_SAVE_FILES} files`);
  }
  const normalizedFiles = files.map(validateSaveFile);
  const totalBytes = normalizedFiles.reduce((sum, file) => sum + file.bytes, 0);
  if (totalBytes > MAX_TOTAL_SAVE_BYTES) {
    throw new Error("Save request payload is too large");
  }
  return {
    branch,
    files: normalizedFiles.map(({ bytes, ...file }) => file),
  };
}

function configuredOrigins(env, request) {
  const requestOrigin = new URL(request.url).origin;
  const configured = [env?.SITE_ORIGIN, env?.ADMIN_ALLOWED_ORIGINS]
    .flatMap((value) => String(value || "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set([requestOrigin, ...configured]);
}

function sameOriginAllowed(env, request, sourceOrigin) {
  try {
    return configuredOrigins(env, request).has(new URL(sourceOrigin).origin);
  } catch {
    return false;
  }
}

function isLocalRequest(request) {
  const hostname = new URL(request.url).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function requireAdminMutationRequest(env, request) {
  if (request.headers.get(ADMIN_MUTATION_HEADER) !== "1") {
    return Response.json({ error: "Invalid admin request" }, { status: 403 });
  }
  const origin = request.headers.get("Origin");
  if (origin) {
    return sameOriginAllowed(env, request, origin) ? null : Response.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const referer = request.headers.get("Referer");
  if (referer) {
    return sameOriginAllowed(env, request, referer) ? null : Response.json({ error: "Invalid request origin" }, { status: 403 });
  }
  return isLocalRequest(request) ? null : Response.json({ error: "Missing request origin" }, { status: 403 });
}
