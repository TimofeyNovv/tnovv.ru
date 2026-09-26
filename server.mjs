// A small local static server. No installation or build step is needed.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5173);
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

const server = createServer(async (request, response) => {
  const send = (status, message) => {
    response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(request.method === "HEAD" ? undefined : message);
  };
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD");
    send(405, "Метод не поддерживается");
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const parts = pathname.split(/[\\/]/);
    if (parts.some((part) => part.startsWith(".")) || pathname.includes("\0")) {
      send(403, "Доступ закрыт");
      return;
    }
    const path = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (!path.startsWith(root + sep)) { send(403, "Доступ закрыт"); return; }
    if (!(await stat(path)).isFile()) { send(404, "Файл не найден"); return; }
    const content = await readFile(path);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(path)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Length": content.length,
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch (error) {
    send(error instanceof URIError ? 400 : 404, "Файл не найден или неверный адрес");
  }
});

server.on("error", (error) => {
  console.error(error.code === "EADDRINUSE"
    ? `Порт ${port} занят. Остановите предыдущий сервер (Ctrl+C) или задайте другой PORT.`
    : `Не удалось запустить сервер: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1", () => {
  console.log(`\n  TimofeyNovv — сайт запущен\n  Откройте в Firefox: http://127.0.0.1:${port}\n  Для остановки нажмите Ctrl+C.\n`);
});
