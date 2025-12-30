import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"], // keep if you have lucide-react issues
  },
  base: "/", // important for correct JS paths on Vercel
  build: {
    outDir: "dist",       // default, Vercel expects the build folder
    emptyOutDir: true,    // clean old files
    sourcemap: true,      // optional, helpful for debugging
  },
  server: {
    port: 5173,
    open: true,
  },
});
