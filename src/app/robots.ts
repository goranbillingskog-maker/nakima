export default function robots() {
  const disallowedPaths = [
    "/admin/",
    "/api/",
    "/auth/",
    "/login/",
    "/portal/",
    "/webhooks/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedPaths,
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "Perplexity-User",
          "ClaudeBot",
          "Claude-Web",
          "Google-Extended",
          "Applebot-Extended",
          "Bytespider",
          "CCBot",
        ],
        allow: "/",
        disallow: disallowedPaths,
      },
    ],
    sitemap: "https://nakima.se/sitemap.xml",
  };
}
