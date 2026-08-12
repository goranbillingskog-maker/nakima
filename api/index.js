import fs from "node:fs";
import path from "node:path";
import server from "../dist/server/server.js";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/vnd.microsoft.icon",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

export default async function handler(req, res) {
  try {
    const url = req.url || "/";
    const cleanPath = url.split("?")[0];

    // Handle static assets (CSS, JS, images, favicons) directly if passed to API
    if (cleanPath.startsWith("/assets/") || cleanPath.endsWith(".ico") || cleanPath.endsWith(".txt")) {
      const filePath = path.join(process.cwd(), "dist/client", cleanPath);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        res.setHeader("content-type", MIME_TYPES[ext] || "application/octet-stream");
        res.setHeader("cache-control", "public, max-age=31536000, immutable");
        return res.end(fs.readFileSync(filePath));
      }
    }

    const webReq = new Request(`http://localhost${url.startsWith("/") ? "" : "/"}${url}`, {
      method: req.method,
      headers: req.headers,
    });

    const response = await server.fetch(webReq);
    res.statusCode = response.status;
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value);
    }
    const body = await response.arrayBuffer();
    res.end(Buffer.from(body));
  } catch (err) {
    console.error("Vercel API handler error:", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
