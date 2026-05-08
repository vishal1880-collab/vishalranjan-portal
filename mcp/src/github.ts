import { Octokit } from "@octokit/rest";

const owner = () => requireEnv("GITHUB_OWNER");
const repo = () => requireEnv("GITHUB_REPO");
const branch = () => process.env.GITHUB_BRANCH || "main";

function requireEnv(k: string): string {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
}

let _client: Octokit | null = null;
function gh(): Octokit {
  if (_client) return _client;
  _client = new Octokit({ auth: requireEnv("GITHUB_TOKEN") });
  return _client;
}

export async function getFile(path: string): Promise<{ content: string; sha: string } | null> {
  try {
    const res = await gh().repos.getContent({ owner: owner(), repo: repo(), path, ref: branch() });
    const data = res.data as { type: string; content?: string; encoding?: string; sha: string };
    if (Array.isArray(res.data) || data.type !== "file" || !data.content) return null;
    const buf = Buffer.from(data.content, (data.encoding as BufferEncoding) || "base64");
    return { content: buf.toString("utf8"), sha: data.sha };
  } catch (e: unknown) {
    const err = e as { status?: number };
    if (err.status === 404) return null;
    throw e;
  }
}

export async function putFile(path: string, content: string, message: string): Promise<{ sha: string }> {
  const existing = await getFile(path);
  const res = await gh().repos.createOrUpdateFileContents({
    owner: owner(),
    repo: repo(),
    path,
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    sha: existing?.sha,
    branch: branch()
  });
  return { sha: res.data.content?.sha || "" };
}

export async function deleteFile(path: string, message: string): Promise<void> {
  const existing = await getFile(path);
  if (!existing) return;
  await gh().repos.deleteFile({
    owner: owner(),
    repo: repo(),
    path,
    message,
    sha: existing.sha,
    branch: branch()
  });
}

export async function readJson<T>(path: string): Promise<T | null> {
  const f = await getFile(path);
  return f ? (JSON.parse(f.content) as T) : null;
}

export async function writeJson(path: string, data: unknown, message: string): Promise<void> {
  await putFile(path, JSON.stringify(data, null, 2) + "\n", message);
}
