import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // 🟣 Optional: only enable component tagger in development mode
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      // ✅ Enables @/ imports like "@/context/WalletContext"
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000", // 👈 Backend URL
        changeOrigin: true,
        secure: false,
         timeout: 120000,
      },
    },
  },

  // 🟢 Optional quality-of-life additions
  build: {
    sourcemap: mode === "development",
  },
}));
