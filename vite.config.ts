import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import fs from "node:fs";
import path from "node:path";

// Vite plugin: after the client bundle is written, copy all public/ image
// files into dist/client/client/ — the directory Vercel serves as static root.
function copyPublicToClient(): import("vite").Plugin {
  const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico", ".avif"]);

  return {
    name: "copy-public-to-client",
    apply: "build",
    enforce: "post",
    closeBundle() {
      const projectRoot = process.cwd();
      const publicSrc = path.join(projectRoot, "public");
      const clientDest = path.join(projectRoot, "dist", "client", "client");

      if (!fs.existsSync(clientDest)) {
        // dist/client/client/ may not exist yet during SSR build — skip silently
        return;
      }

      let count = 0;
      for (const entry of fs.readdirSync(publicSrc, { withFileTypes: true })) {
        if (!entry.isFile()) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (!IMAGE_EXTS.has(ext)) continue;
        fs.copyFileSync(
          path.join(publicSrc, entry.name),
          path.join(clientDest, entry.name)
        );
        count++;
      }
      if (count > 0) {
        console.log(`[copy-public-to-client] Copied ${count} images → dist/client/client/`);
      }
    },
  };
}

export default defineConfig({
  publicDir: "public",
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
  build: {
    chunkSizeWarningLimit: 2000,
    outDir: "dist/client",
  },
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
    copyPublicToClient(),
  ],
});