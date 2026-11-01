/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
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
