// Dev server: builds the site, serves dist/ and rebuilds + reloads the browser when src/ changes.
// Run: npm run dev   (no dependencies needed)
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { watch } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, "dist");
const PORT = Number(process.env.PORT) || 4321;
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".svg": "image/svg+xml", ".ico": "image/x-icon"
};
const RELOAD = `<script>new EventSource("/__reload").onmessage=()=>location.reload()</script>`;
const clients = new Set();

function build() {
  // A fresh process each time so edited .mjs modules are re-imported.
  const r = spawnSync(process.execPath, [join(ROOT, "build.mjs")], { stdio: "inherit" });
  return r.status === 0;
}

async function resolve(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[\\/])+/, "");
  let file = join(DIST, safe);
  if (!file.startsWith(DIST)) return null;
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  if (pathname === "/__reload") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    res.write(": connected\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }
  // Folder URLs without a trailing slash → redirect, like most static hosts do.
  const file = await resolve(pathname);
  if (file && !pathname.endsWith("/") && !extname(pathname) && file.endsWith("index.html")) {
    res.writeHead(301, { Location: pathname + "/" });
    return res.end();
  }
  const target = file || join(DIST, "404.html");
  try {
    let body = await readFile(target);
    const type = TYPES[extname(target)] || "application/octet-stream";
    if (type.startsWith("text/html")) body = body.toString().replace("</body>", RELOAD + "</body>");
    res.writeHead(file ? 200 : 404, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(500).end("Build the site first: node build.mjs");
  }
});

build();

// Watch the project folder, but only react to real edits in src/ or build.mjs. On Windows,
// fs.watch also fires when a file is merely read, so compare modification times to the last build.
let timer;
let lastBuild = Date.now();
watch(ROOT, { recursive: true }, (_event, name) => {
  if (!name) return;
  const rel = name.replace(/\\/g, "/");
  if (!(rel.startsWith("src/") || rel === "build.mjs") || rel.endsWith(".tmp")) return;
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      if ((await stat(join(ROOT, rel))).mtimeMs <= lastBuild) return;
    } catch {
      // deleted or renamed file: rebuild anyway
    }
    console.log(`\n↻ Cambio en ${rel}, regenerando…`);
    lastBuild = Date.now();
    if (build()) for (const c of clients) c.write("data: reload\n\n");
  }, 150);
});

server.listen(PORT, () => {
  console.log(`\n  Andrade Custom Trim → http://localhost:${PORT}`);
  console.log(`  Español             → http://localhost:${PORT}/es/`);
  console.log("  Ctrl+C para detener.\n");
});
