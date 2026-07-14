import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import mime from "mime-types";

export function registerStaticFileHandler(app: FastifyInstance, assetsDir: string): void {
  app.get("/*", async (request: FastifyRequest, reply: FastifyReply) => {
    const pathParam = (request.params as { "*"?: string })["*"] ?? "";
    const requestedPath = decodeURIComponent(pathParam || "");
    const normalized = requestedPath.startsWith("/") ? requestedPath.slice(1) : requestedPath;

    const resolvedPath = path.resolve(assetsDir, normalized);
    const safeRoot = path.resolve(assetsDir);
    if (!resolvedPath.startsWith(safeRoot)) {
      void reply.code(403).type("text/plain; charset=utf-8").send("Forbidden");
      return;
    }

    const defaultIndexPath = path.join(assetsDir, "index.html");
    const finalPath = normalized === "" && existsSync(defaultIndexPath) ? defaultIndexPath : resolvedPath;

    try {
      const fileStat = await stat(finalPath);
      if (fileStat.isDirectory()) {
        const entries = await readdir(finalPath, { withFileTypes: true });
        const html = renderDirectoryListing(normalized, entries.map((e) => ({
          name: e.name,
          isDirectory: e.isDirectory()
        })));
        void reply.code(200).type("text/html; charset=utf-8").send(html);
        return;
      }

      const extType = mime.lookup(finalPath);
      const contentType = extType || "application/octet-stream";
      const fileData = await readFile(finalPath);
      void reply.code(200).type(String(contentType)).send(fileData);
    } catch {
      void reply.code(404).type("text/plain; charset=utf-8").send("Not Found");
    }
  });
}

function renderDirectoryListing(currentPath: string, entries: Array<{ name: string; isDirectory: boolean }>): string {
  const heading = currentPath === "" ? "/" : `/${currentPath}`;
  const links = entries
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const slash = entry.isDirectory ? "/" : "";
      const href = [currentPath, entry.name].filter(Boolean).join("/");
      return `<li><a href="/${encodeURI(href)}">${entry.name}${slash}</a></li>`;
    })
    .join("\n");

  return [
    "<!doctype html>",
    "<html>",
    "<head><meta charset=\"utf-8\"><title>Index of " + escapeHtml(heading) + "</title></head>",
    "<body>",
    "<h1>Index of " + escapeHtml(heading) + "</h1>",
    "<ul>",
    links,
    "</ul>",
    "</body>",
    "</html>"
  ].join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
