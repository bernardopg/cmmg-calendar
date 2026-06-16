import type { FastifyPluginAsync } from "fastify";
import { config } from "../config.js";

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/health",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: "1 minute",
        },
      },
    },
    async () => ({
      status: "up",
      message: "API funcionando",
      port: config.port,
      timestamp: new Date().toISOString(),
    }),
  );
};

export default healthRoutes;
