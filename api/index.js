import server from "../.output/server/index.mjs";

export default async function handler(req, res) {
  try {
    const url = req.url || "/";
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
