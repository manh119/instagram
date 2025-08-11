// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // for production build
  },
  server: {
    sourcemapIgnoreList: () => false, // show source maps for node_modules in dev
  },
});
