import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { analyzeScheduleDataJson } from "../services/analyzeSchedule.js";
import { loginAndFetchTotvsScheduleData } from "../services/totvsClient.js";
import {
  ApiError,
  ApiValidationError,
  HttpResponseError,
} from "../types.js";

const totvsLoginBodySchema = z
  .object({
    user: z.string().trim().min(1),
    password: z.string().trim().min(1),
    alias: z.string().trim().optional(),
  })
  .passthrough();

function mapTotvsLoginError(error: unknown): {
  statusCode: number;
  error: string;
} | null {
  if (error instanceof HttpResponseError) {
    if (error.statusCode === 401) {
      return {
        statusCode: 401,
        error: "Não autorizado no TOTVS (401). Verifique suas credenciais.",
      };
    }

    return {
      statusCode: 502,
      error: `Falha ao consultar TOTVS: HTTP ${error.statusCode}`,
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

const totvsLoginRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/totvs-login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const parsedBody = totvsLoginBodySchema.safeParse(request.body ?? {});
      if (!parsedBody.success) {
        return reply.code(400).send({
          success: false,
          error: "Usuário e senha são obrigatórios.",
        });
      }

      try {
        const scheduleData = await loginAndFetchTotvsScheduleData(parsedBody.data);
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

        const mappedError = mapTotvsLoginError(error);
        if (mappedError) {
          return reply
            .code(mappedError.statusCode)
            .send({ success: false, error: mappedError.error });
        }

        request.log.error({ err: error }, "Erro interno no login TOTVS");
        return reply
          .code(500)
          .send({ success: false, error: "Erro interno do servidor" });
      }
    },
  );
};

export default totvsLoginRoutes;
