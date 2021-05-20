import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svelte from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), tsconfigPaths()],
  build: {
    outDir: "build"
  },
  server: {
    port: 5000
  }
});
