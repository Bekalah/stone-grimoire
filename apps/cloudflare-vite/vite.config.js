import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Offline-first defaults; Cloudflare Pages will serve the dist/ directory directly.
export default defineConfig({
  plugins: [react()],
  root: "./",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    host: true,
    port: 5173
  },
  preview: {
    host: true,
    port: 4173
  }
});
