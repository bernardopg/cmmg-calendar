import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { config } from "../config.js";
import { analyzeScheduleDataJson } from "../services/analyzeSchedule.js";
import { fetchTotvsScheduleData } from "../services/totvsClient.js";
import {
  ApiError,
  ApiValidationError,
  HttpResponseError,
} from "../types.js";

const extractAnalyzeBodySchema = z
  .object({
    totvs_cookie: z.string().trim().optional(),
  })
  .passthrough();

function mapTotvsTransportError(error: unknown): {
  statusCode: number;
  error: string;
} | null {
  if (error instanceof HttpResponseError) {
    if (error.statusCode === 401) {
      return {
        statusCode: 401,
        error: "Não autorizado no TOTVS (401). Atualize o cookie de sessão.",
      };
    }

    return {
      statusCode: 502,
      error: `Falha ao consultar TOTVS: HTTP ${error.statusCode}`,
    };
  }

  if (error instanceof SyntaxError) {
    return {
      statusCode: 502,
      error: "Resposta do TOTVS não está em JSON válido.",
    };
  }

  if (error instanceof TypeError || error instanceof DOMException) {
    return {
      statusCode: 502,
      error: "Erro de conexão ao consultar TOTVS.",
    };
  }

  return null;
}

const extractAnalyzeRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/extract-analyze",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const parsedBody = extractAnalyzeBodySchema.safeParse(request.body ?? {});
      if (!parsedBody.success) {
        return reply
          .code(400)
          .send({ success: false, error: "Corpo da requisição inválido." });
      }

      const cookieValue =
        parsedBody.data.totvs_cookie?.trim() || config.totvsCookie;

      if (!cookieValue) {
        return reply.code(400).send({
          success: false,
          error:
            "Cookie TOTVS ausente. Configure TOTVS_COOKIE no backend ou envie 'totvs_cookie' no body da requisição.",
        });
      }

      try {
        const scheduleData = await fetchTotvsScheduleData(cookieValue);
        const analysis = analyzeScheduleDataJson(scheduleData);

        return reply.send({
          success: true,
          data: {
            analysis,
            schedule_data: scheduleData,
          },
        });
      } catch (error) {
        if (error instanceof ApiValidationError || error instanceof ApiError) {
          return reply
            .code(error.statusCode)
            .send({ success: false, error: error.message });
        }

        const mappedError = mapTotvsTransportError(error);
        if (mappedError) {
          return reply
            .code(mappedError.statusCode)
            .send({ success: false, error: mappedError.error });
        }

        request.log.error({ err: error }, "Erro interno na extração via TOTVS");
        return reply
          .code(500)
          .send({ success: false, error: "Erro interno do servidor" });
      }
    },
  );
};

export default extractAnalyzeRoutes;
