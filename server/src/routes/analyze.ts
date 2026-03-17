import type { FastifyPluginAsync } from "fastify";
import { limits } from "../config.js";
import { analyzeScheduleDataJson } from "../services/analyzeSchedule.js";

const analyzeRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/analyze",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const file = await request.file({
        limits: {
          files: 1,
          fileSize: limits.maxFileSizeBytes,
        },
      });

      if (!file) {
        return reply
          .code(400)
          .send({ success: false, error: "Nenhum arquivo foi enviado" });
      }

      if (!file.filename) {
        return reply
          .code(400)
          .send({ success: false, error: "Nenhum arquivo selecionado" });
      }

      if (!file.filename.toLowerCase().endsWith(".json")) {
        return reply
          .code(400)
          .send({ success: false, error: "Arquivo deve ser do tipo JSON" });
      }

      const buffer = await file.toBuffer();
      if (file.file.truncated || buffer.length > limits.maxFileSizeBytes) {
        return reply.code(413).send({
          success: false,
          error: `Arquivo muito grande. Máximo: ${Math.trunc(
            limits.maxFileSizeBytes / 1024 / 1024,
          )}MB`,
        });
      }

      let jsonData: unknown;
      try {
        jsonData = JSON.parse(buffer.toString("utf-8"));
      } catch {
        return reply
          .code(400)
          .send({ success: false, error: "Arquivo JSON inválido" });
      }

      const result = analyzeScheduleDataJson(jsonData);
      return reply.send({ success: true, data: result });
    },
  );
};

export default analyzeRoutes;
