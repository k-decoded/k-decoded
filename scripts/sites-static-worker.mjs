import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const worker = `const worker = {
  async fetch(request, env) {
    const direct = await env.ASSETS.fetch(request);
    if (direct.status !== 404 || request.method !== "GET") return direct;

    const url = new URL(request.url);
    const lastSegment = url.pathname.split("/").pop();
    if (lastSegment.includes(".")) return direct;

    const pagePath = url.pathname.endsWith("/")
      ? url.pathname + "index.html"
      : url.pathname + "/index.html";
    return env.ASSETS.fetch(new Request(new URL(pagePath, url), request));
  },
};

export default worker;
`;

const serverDir = join(process.cwd(), "dist", "server");
await mkdir(serverDir, { recursive: true });
await writeFile(join(serverDir, "index.js"), worker);
