import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // ensures correct paths to JS/CSS files
  build: {
    outDir: "dist", // Vercel expects the build output in a folder
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
