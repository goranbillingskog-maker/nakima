import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    (tanstackStart as any)({
      nitro: {
        preset: "node-server",
        routeRules: {
          "/**": {
            headers: {
              "X-Frame-Options": "SAMEORIGIN",
              "X-Content-Type-Options": "nosniff",
              "Referrer-Policy": "strict-origin-when-cross-origin",
            },
          },
        },
      },
    }),
    react(),
    tailwindcss(),
  ],
});
