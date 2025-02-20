import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ["framer-motion"], // Ensure it's included in optimization
  },
  build: {
    sourcemap: false, // Disable sourcemaps to prevent the Vercel error
  },
  resolve: {
    alias: {
      "@": "/src", // Ensure absolute imports work correctly
    },
  },
});