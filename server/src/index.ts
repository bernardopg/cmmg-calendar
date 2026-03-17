import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { config, limits } from "./config.js";
import analyzeRoutes from "./routes/analyze.js";
import extractAnalyzeRoutes from "./routes/extractAnalyze.js";
import healthRoutes from "./routes/health.js";
import totvsLoginRoutes from "./routes/totvsLogin.js";
import { ApiError } from "./types.js";

export async function buildServer() {
  const app = Fastify({
    logger: true,
    bodyLimit: limits.maxFileSizeBytes,
  });

  if (config.nodeEnv !== "production") {
    await app.register(cors, {
      origin: true,
    });
  }

  await app.register(rateLimit, {
    global: false,
    errorResponseBuilder: () => ({
      success: false,
      error: "Limite de requisições excedido. Tente novamente em instantes.",
    }),
  });

  await app.register(multipart, {
    limits: {
      fileSize: limits.maxFileSizeBytes,
      files: 1,
    },
  });

  if (fs.existsSync(config.frontendDistDir)) {
    await app.register(fastifyStatic, {
      root: config.frontendDistDir,
      prefix: "/",
      wildcard: false,
    });
  } else {
    app.log.warn(
      { frontendDistDir: config.frontendDistDir },
      "Frontend build não encontrado; apenas a API estará disponível",
    );
  }

  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(analyzeRoutes, { prefix: "/api" });
  await app.register(extractAnalyzeRoutes, { prefix: "/api" });
  await app.register(totvsLoginRoutes, { prefix: "/api" });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ApiError) {
      return reply
        .code(error.statusCode)
        .send({ success: false, error: error.message });
    }

    if (
      (error as { code?: string }).code === "FST_REQ_FILE_TOO_LARGE" ||
      (error as { code?: string }).code === "FST_ERR_CTP_BODY_TOO_LARGE"
    ) {
      return reply.code(413).send({
        success: false,
        error: `Arquivo muito grande. Máximo: ${config.maxFileSizeMb}MB`,
      });
    }

    request.log.error({ err: error }, "Erro não tratado");
    return reply
      .code(500)
      .send({ success: false, error: "Erro interno do servidor" });
  });

  app.setNotFoundHandler((request, reply) => {
    const pathname = request.url.split("?")[0] ?? request.url;

    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return reply
        .code(404)
        .send({ success: false, error: "Rota não encontrada" });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return reply.code(404).send("Not Found");
    }

    if (!fs.existsSync(config.frontendIndexPath)) {
      return reply.code(503).send("Frontend build não encontrado.");
    }

    if (path.extname(pathname)) {
      return reply.code(404).send("Not Found");
    }

    return reply.type("text/html; charset=utf-8").sendFile("index.html");
  });

  return app;
}

async function startServer() {
  const app = await buildServer();

  try {
    await app.listen({
      host: config.host,
      port: config.port,
    });
  } catch (error) {
    app.log.error(error, "Falha ao iniciar o servidor");
    process.exitCode = 1;
  }
}

const currentFilePath = fileURLToPath(import.meta.url);
const executedFilePath = process.argv[1]
  ? path.resolve(process.argv[1])
  : undefined;

if (executedFilePath && currentFilePath === executedFilePath) {
  void startServer();
}
