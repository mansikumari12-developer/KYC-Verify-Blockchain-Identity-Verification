import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// 🟢 Export Vite configuration
export default defineConfig(({ mode }) => {
  // Load .env variables based on current mode (development or production)
  const env = loadEnv(mode, process.cwd(), "");

  const apiUrl = env.VITE_API_URL || "http://localhost:4000";

  return {
    plugins: [
      react(),
      // 🟣 Enable lovable-tagger only in development mode
      mode === "development" && componentTagger(),
    ].filter(Boolean),

    resolve: {
      alias: {
        // ✅ Enables @ imports like "@/components/Button"
        "@": path.resolve(__dirname, "src"),
      },
    },

    server: {
      host: true, // allow LAN access
      port: 5173,
      open: true, // auto open browser
      proxy: {
        "/api": {
          target: apiUrl, // 👈 Use environment variable
          changeOrigin: true,
          secure: false,
          timeout: 120000,
        },
      },
    },

    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },

    envPrefix: "VITE_", // ✅ Ensures only VITE_ variables are exposed to client
  };
});
