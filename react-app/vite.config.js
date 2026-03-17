import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const repoRoot = fileURLToPath(new URL("..", import.meta.url));
  const env = {
    ...loadEnv(mode, repoRoot, ""),
    ...loadEnv(mode, process.cwd(), ""),
  };
  const configuredPort = Number.parseInt(
    env.VITE_PORT ?? env.FRONTEND_PORT ?? "5173",
    10,
  );
  const frontendPort = Number.isNaN(configuredPort) ? 5173 : configuredPort;
  const apiTarget =
    env.VITE_API_PROXY_TARGET ??
    `http://127.0.0.1:${env.SERVER_PORT || env.API_PORT || env.PORT || "5000"}`;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@/components": fileURLToPath(new URL("./src/components", import.meta.url)),
        "@/hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
        "@/types": fileURLToPath(new URL("./src/types", import.meta.url)),
        "@/utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      },
    },
    server: {
      port: frontendPort,
      host: env.VITE_HOST || true,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
