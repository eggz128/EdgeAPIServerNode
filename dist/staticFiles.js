"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStaticFileHandler = registerStaticFileHandler;
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const mime_types_1 = __importDefault(require("mime-types"));
function registerStaticFileHandler(app, assetsDir) {
    app.get("/*", async (request, reply) => {
        const pathParam = request.params["*"] ?? "";
        const requestedPath = decodeURIComponent(pathParam || "");
        const normalized = requestedPath.startsWith("/") ? requestedPath.slice(1) : requestedPath;
        const resolvedPath = node_path_1.default.resolve(assetsDir, normalized);
        const safeRoot = node_path_1.default.resolve(assetsDir);
        if (!resolvedPath.startsWith(safeRoot)) {
            void reply.code(403).type("text/plain; charset=utf-8").send("Forbidden");
            return;
        }
        const defaultIndexPath = node_path_1.default.join(assetsDir, "index.html");
        const finalPath = normalized === "" && (0, node_fs_1.existsSync)(defaultIndexPath) ? defaultIndexPath : resolvedPath;
        try {
            const fileStat = await (0, promises_1.stat)(finalPath);
            if (fileStat.isDirectory()) {
                const entries = await (0, promises_1.readdir)(finalPath, { withFileTypes: true });
                const html = renderDirectoryListing(normalized, entries.map((e) => ({
                    name: e.name,
                    isDirectory: e.isDirectory()
                })));
                void reply.code(200).type("text/html; charset=utf-8").send(html);
                return;
            }
            const extType = mime_types_1.default.lookup(finalPath);
            const contentType = extType || "application/octet-stream";
            const fileData = await (0, promises_1.readFile)(finalPath);
            void reply.code(200).type(String(contentType)).send(fileData);
        }
        catch {
            void reply.code(404).type("text/plain; charset=utf-8").send("Not Found");
        }
    });
}
function renderDirectoryListing(currentPath, entries) {
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
function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
