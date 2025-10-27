import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // ✅ Fallback: use Render backend when deploying
  const apiUrl =
    mode === "development"
      ? env.VITE_API_URL || "http://localhost:4000"
      : "https://your-backend-name.onrender.com";

  return {
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    // ✅ Development proxy for localhost
    server: {
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
      },
    },

    // ✅ Replace /api/ calls in built code with live backend URL
    define: {
      __API_URL__: JSON.stringify(apiUrl),
    },

    build: {
      outDir: "dist",
      sourcemap: mode === "development",
    },
  };
});
