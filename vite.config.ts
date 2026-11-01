/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Emits build/sw.js with the exact list of built files to precache, so the
 * whole game (including the lazy 3D chunk) works offline after one visit.
 * The background video is left out: it is large and not needed to play.
 */
const offlineServiceWorker = (): Plugin => ({
  name: "offline-service-worker",
  apply: "build",
  enforce: "post",
  generateBundle(_, bundle) {
    const files = Object.keys(bundle).filter(
      (file) => !file.endsWith(".mov") && !file.endsWith(".map") && file !== "index.html"
    );
    const precache = ["/", "/index.html", "/favicon.ico", "/manifest.json", ...files.map((f) => `/${f}`)];
    const version = createHash("sha256").update(precache.join()).digest("hex").slice(0, 10);
    const source = readFileSync("offline/sw.template.js", "utf8")
      .replace("__VERSION__", version)
      .replace("__PRECACHE__", JSON.stringify(precache, null, 2));
    this.emitFile({ type: "asset", fileName: "sw.js", source });
  },
});

export default defineConfig({
  plugins: [react(), offlineServiceWorker()],
  // Keep REACT_APP_* so existing .env and Vercel variables keep working
  envPrefix: ["VITE_", "REACT_APP_"],
  assetsInclude: ["**/*.mov"],
  build: {
    outDir: "build",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    // React 17 has no "exports" map, so ESM deps importing react/jsx-runtime need inlining
    server: { deps: { inline: ["react-confetti"] } },
  },
});
